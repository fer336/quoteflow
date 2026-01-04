import sys
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def add_user(email, name, password=None):
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ El usuario {email} ya existe.")
            return

        new_user = User(email=email, name=name)
        if password:
            new_user.hashed_password = get_password_hash(password)
            
        db.add(new_user)
        db.commit()
        print(f"✅ Usuario {email} ({name}) agregado exitosamente.")
        if password:
            print("   (Con contraseña asignada)")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

def set_password(email, password):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ Usuario {email} no encontrado.")
            return
        
        user.hashed_password = get_password_hash(password)
        db.commit()
        print(f"✅ Contraseña actualizada para {email}.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

def list_users():
    db = SessionLocal()
    users = db.query(User).all()
    print("\n📋 Usuarios Autorizados:")
    print("------------------------------------------------")
    for user in users:
        status = "ACTIVO" if user.is_active else "INACTIVO"
        has_pass = "SI" if user.hashed_password else "NO"
        print(f"ID: {user.id} | Email: {user.email} | Nombre: {user.name or 'N/A'} | Pass: {has_pass} | Estado: {status}")
    print("------------------------------------------------\n")
    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python manage_users.py list")
        print("  python manage_users.py add <email> <nombre> [password]")
        print("  python manage_users.py set-password <email> <password>")
        sys.exit(1)

    command = sys.argv[1]

    if command == "add":
        if len(sys.argv) < 4:
            print("Error: Faltan argumentos. Uso: python manage_users.py add email@ejemplo.com \"Nombre\" [password]")
        else:
            email = sys.argv[2]
            name = sys.argv[3]
            password = sys.argv[4] if len(sys.argv) > 4 else None
            add_user(email, name, password)
            
    elif command == "set-password":
        if len(sys.argv) < 4:
            print("Error: Uso: python manage_users.py set-password <email> <password>")
        else:
            set_password(sys.argv[2], sys.argv[3])
            
    elif command == "list":
        list_users()
    else:
        print("Comando desconocido.")
