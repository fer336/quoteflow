import sys
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User

def add_user(email, name):
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ El usuario {email} ya existe.")
            return

        new_user = User(email=email, name=name)
        db.add(new_user)
        db.commit()
        print(f"✅ Usuario {email} ({name}) agregado exitosamente.")
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
        print(f"ID: {user.id} | Email: {user.email} | Nombre: {user.name or 'N/A'}")
    print("------------------------------------------------\n")
    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python manage_users.py list")
        print("  python manage_users.py add <email> <nombre>")
        sys.exit(1)

    command = sys.argv[1]

    if command == "add":
        if len(sys.argv) < 4:
            print("Error: Faltan argumentos. Uso: python manage_users.py add email@ejemplo.com \"Nombre\"")
        else:
            add_user(sys.argv[2], sys.argv[3])
    elif command == "list":
        list_users()
    else:
        print("Comando desconocido.")

