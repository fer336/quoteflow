from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
from database import get_db
from models import User
import os

# Frontend enviará el token en el Header: Authorization: Bearer <google_token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Valida el token de Google y devuelve el usuario de la base de datos.
    Si el usuario no existe, lo crea automáticamente (Registro implícito).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Validar token con Google
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        # Google ID y Email
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name')
        picture = idinfo.get('picture')
        
    except ValueError:
        raise credentials_exception

    # Buscar usuario en DB
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # SI EL USUARIO NO EXISTE, DENEGAR ACCESO
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Este email no está autorizado para usar el sistema."
        )

    # Actualizar datos del usuario existente si han cambiado (opcional, pero útil para foto/nombre)
    if user.google_id != google_id or user.picture != picture:
        user.google_id = google_id
        user.name = name
        user.picture = picture
        db.commit()
    
    return user

