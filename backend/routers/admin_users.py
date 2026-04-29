from datetime import datetime, timedelta, timezone
import os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from google.auth.transport import requests
from google.oauth2 import id_token
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import json
from urllib import request as urllib_request
from urllib.error import HTTPError, URLError

from database import get_db
from models import User, Budget, BudgetItem, Client

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-super-secret-key-32-chars")
ALGORITHM = "HS256"
SUPERADMIN_EMAIL = os.getenv("ADMIN_CMS_SUPERADMIN_EMAIL", "casserafernando@gmail.com")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/auth/login")


class AdminLoginRequest(BaseModel):
    email: str


class AdminGoogleLoginRequest(BaseModel):
    token: str


class AdminUserCreate(BaseModel):
    name: str
    email: str
    password: str | None = None
    role: str = "operador"


class AdminUserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    role: str | None = None


class AdminUserStatusUpdate(BaseModel):
    is_active: bool


def _days_remaining(expires_at):
    if not expires_at:
        return 0
    now = datetime.now(timezone.utc)
    safe_expires = (
        expires_at if expires_at.tzinfo else expires_at.replace(tzinfo=timezone.utc)
    )
    diff = safe_expires - now
    return max(0, int(diff.total_seconds() // 86400))


def _expire_memberships(db: Session):
    now = datetime.now(timezone.utc)
    users = (
        db.query(User)
        .filter(User.membership_expires_at.isnot(None), User.is_active.is_(True))
        .all()
    )
    changed = False
    for user in users:
        role = (user.role or "").lower()
        if role in {"admin", "superadmin"}:
            continue
        expires_at = user.membership_expires_at
        if not expires_at:
            continue
        safe_expires = (
            expires_at if expires_at.tzinfo else expires_at.replace(tzinfo=timezone.utc)
        )
        if safe_expires <= now:
            user.is_active = False
            changed = True
    if changed:
        db.commit()


def _create_access_token(email: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": email, "exp": expire, "scope": "admin_cms"}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _resolve_google_identity(google_token: str) -> dict:
    # ID token JWT
    try:
        idinfo = id_token.verify_oauth2_token(
            google_token, requests.Request(), GOOGLE_CLIENT_ID
        )
        return {
            "email": idinfo["email"],
            "sub": idinfo["sub"],
        }
    except ValueError:
        pass

    # Access token OAuth
    try:
        req = urllib_request.Request(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {google_token}"},
        )
        with urllib_request.urlopen(req, timeout=5) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="INVALID_GOOGLE_TOKEN")

    email = payload.get("email")
    google_id = payload.get("sub")
    if not email or not google_id:
        raise HTTPException(status_code=401, detail="INVALID_GOOGLE_TOKEN")
    return {"email": email, "sub": google_id}


def _require_superadmin(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        scope = payload.get("scope")
        if not email or scope != "admin_cms":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if email.lower() != SUPERADMIN_EMAIL.lower():
        raise HTTPException(status_code=403, detail="SUPERADMIN_ONLY")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=403, detail="SUPERADMIN_NOT_FOUND")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="SUPERADMIN_INACTIVE")
    return user


@router.post("/auth/login")
def admin_login(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if email != SUPERADMIN_EMAIL.lower():
        raise HTTPException(status_code=403, detail="SUPERADMIN_ONLY")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=403, detail="SUPERADMIN_NOT_FOUND")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="SUPERADMIN_INACTIVE")

    return {"access_token": _create_access_token(email), "token_type": "bearer"}


@router.post("/auth/google")
def admin_google_login(payload: AdminGoogleLoginRequest, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID_MISSING")

    identity = _resolve_google_identity(payload.token)
    email = identity["email"].strip().lower()

    if email != SUPERADMIN_EMAIL.lower():
        raise HTTPException(status_code=403, detail="SUPERADMIN_ONLY")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=403, detail="SUPERADMIN_NOT_FOUND")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="SUPERADMIN_INACTIVE")

    return {"access_token": _create_access_token(email), "token_type": "bearer"}


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(_require_superadmin),
):
    _expire_memberships(db)
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role or "operador",
            "is_active": user.is_active,
            "membership_expires_at": user.membership_expires_at,
            "days_remaining": _days_remaining(user.membership_expires_at),
        }
        for user in users
    ]


@router.post("/users")
def create_user(
    payload: AdminUserCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(_require_superadmin),
):
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=409, detail="Email already exists")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=(pwd_context.hash(payload.password) if payload.password else None),
        role=payload.role,
        is_active=True,
        membership_expires_at=(
            None
            if payload.role.lower() in {"admin", "superadmin"}
            else datetime.now(timezone.utc) + timedelta(days=30)
        ),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "membership_expires_at": user.membership_expires_at,
        "days_remaining": _days_remaining(user.membership_expires_at),
    }


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(_require_superadmin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.name is not None:
        user.name = payload.name
    if payload.email is not None:
        user.email = payload.email
    if payload.role is not None:
        user.role = payload.role

    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "membership_expires_at": user.membership_expires_at,
        "days_remaining": _days_remaining(user.membership_expires_at),
    }


@router.patch("/users/{user_id}/status")
def set_user_status(
    user_id: int,
    payload: AdminUserStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(_require_superadmin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "membership_expires_at": user.membership_expires_at,
        "days_remaining": _days_remaining(user.membership_expires_at),
    }


@router.post("/users/{user_id}/reset-membership")
def reset_membership(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(_require_superadmin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.membership_expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    role = (user.role or "").lower()
    if role in {"admin", "superadmin"}:
        user.membership_expires_at = None
    user.is_active = True
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "membership_expires_at": user.membership_expires_at,
        "days_remaining": _days_remaining(user.membership_expires_at),
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(_require_superadmin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.email and user.email.lower() == SUPERADMIN_EMAIL.lower():
        raise HTTPException(status_code=400, detail="CANNOT_DELETE_SUPERADMIN")

    try:
        budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
        budget_ids = [b.id for b in budgets]
        if budget_ids:
            db.query(BudgetItem).filter(BudgetItem.budget_db_id.in_(budget_ids)).delete(
                synchronize_session=False
            )
            db.query(Budget).filter(Budget.user_id == user_id).delete(
                synchronize_session=False
            )
        db.query(Client).filter(Client.user_id == user_id).delete(synchronize_session=False)
        db.delete(user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="USER_DELETE_CONFLICT",
        )

    return {"ok": True}
