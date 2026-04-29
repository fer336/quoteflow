from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from google.oauth2 import id_token
from google.auth.transport import requests
from database import get_db
from models import User
from schemas import UserResponse
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import json
from urllib import request as urllib_request
from urllib.error import HTTPError, URLError

auth_router = APIRouter()

# --- Configuration ---
MIN_SECRET_KEY_LENGTH = 32


def _get_required_secret_key() -> str:
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        raise RuntimeError(
            "Configuration error: SECRET_KEY environment variable is required to start the backend."
        )
    if len(secret_key) < MIN_SECRET_KEY_LENGTH:
        raise RuntimeError(
            f"Configuration error: SECRET_KEY must be at least {MIN_SECRET_KEY_LENGTH} characters long."
        )
    return secret_key


def _get_access_token_expire_minutes() -> int:
    raw_value = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    try:
        expire_minutes = int(raw_value)
    except ValueError as exc:
        raise RuntimeError(
            "Configuration error: ACCESS_TOKEN_EXPIRE_MINUTES must be a positive integer."
        ) from exc

    if expire_minutes <= 0:
        raise RuntimeError(
            "Configuration error: ACCESS_TOKEN_EXPIRE_MINUTES must be a positive integer."
        )

    return expire_minutes


SECRET_KEY = _get_required_secret_key()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = _get_access_token_expire_minutes()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# --- Helpers ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def _validate_password_strength(password: str):
    if len(password or "") < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="WEAK_PASSWORD_MIN_8",
        )


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def _enforce_membership(user: User, db: Session):
    """Bloquea automáticamente usuarios con membresía vencida."""
    role = (getattr(user, "role", None) or "").lower()
    if role in {"admin", "superadmin"}:
        return

    expires_at = getattr(user, "membership_expires_at", None)
    if expires_at:
        safe_expires = (
            expires_at.replace(tzinfo=None) if getattr(expires_at, "tzinfo", None) else expires_at
        )
        if safe_expires <= datetime.utcnow():
            if user.is_active:
                user.is_active = False
                db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="MEMBERSHIP_EXPIRED",
            )


# --- Dependency ---
def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    """
    Valida el token JWT local (generado por nuestro backend) y devuelve el usuario.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    _enforce_membership(user, db)

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    return user


# --- Models for Requests ---
class Token(BaseModel):
    access_token: str
    token_type: str
    password_required: bool = False


class GoogleLoginRequest(BaseModel):
    token: str


class SetPasswordRequest(BaseModel):
    password: str


def _resolve_google_identity(google_token: str) -> dict:
    """
    Acepta ID token (JWT) o access token OAuth de Google y devuelve
    los datos mínimos de identidad requeridos por el sistema.
    """
    # Caso 1: ID token JWT (flujo clásico de GoogleLogin)
    try:
        idinfo = id_token.verify_oauth2_token(
            google_token, requests.Request(), GOOGLE_CLIENT_ID
        )
        return {
            "email": idinfo["email"],
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
            "sub": idinfo["sub"],
        }
    except ValueError:
        pass

    # Caso 2: access token OAuth (flujo con botón custom)
    try:
        req = urllib_request.Request(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {google_token}"},
        )
        with urllib_request.urlopen(req, timeout=5) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="Invalid Google Token")

    email = payload.get("email")
    google_id = payload.get("sub")

    if not email or not google_id:
        raise HTTPException(status_code=401, detail="Invalid Google Token")

    return {
        "email": email,
        "name": payload.get("name"),
        "picture": payload.get("picture"),
        "sub": google_id,
    }


# --- Endpoints ---


@auth_router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Login estándar con Email y Contraseña.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PASSWORD_NOT_SET",
        )

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    _enforce_membership(user, db)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "password_required": False,
    }


@auth_router.post("/google", response_model=Token)
def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Intercambia un Google ID Token por un JWT interno del sistema.
    """
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="Server configuration error: Google Client ID missing.",
        )

    # 1. Verificar token con Google (ID token o access token)
    identity = _resolve_google_identity(request.token)
    email = identity["email"]
    name = identity.get("name")
    picture = identity.get("picture")
    google_id = identity["sub"]

    # 2. Buscar usuario
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Política: Solo usuarios registrados previamente pueden entrar.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Usuario no registrado.",
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    _enforce_membership(user, db)

    # 3. Actualizar info de Google si cambió
    if (
        user.google_id != google_id
        or user.picture != picture
        or (name and user.name != name)
    ):
        user.google_id = google_id
        user.picture = picture
        if name:
            user.name = name
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="GOOGLE_ACCOUNT_ALREADY_LINKED",
            )

    # 4. Generar JWT interno
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "password_required": not bool(user.hashed_password),
    }


@auth_router.post("/set-password", response_model=Token)
def set_password_after_google(
    payload: SetPasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    _enforce_membership(current_user, db)
    _validate_password_strength(payload.password)

    current_user.hashed_password = get_password_hash(payload.password)
    db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "password_required": False,
    }


@auth_router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


# Endpoint legacy/placeholder si algo lo llama
@auth_router.post("/token")
def legacy_token_endpoint():
    raise HTTPException(status_code=400, detail="Use /auth/login or /auth/google")
