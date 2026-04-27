from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Try to load from Docker Secret first
if os.path.exists("/run/secrets/backend.env"):
    load_dotenv("/run/secrets/backend.env")
else:
    load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://user:password@localhost:5432/budgetpro_db"
)


def _build_engine(url: str):
    """Create engine with settings compatible with the configured database."""
    base_options = {
        "pool_pre_ping": True,
    }

    if url.startswith("sqlite"):
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            **base_options,
        )

    return create_engine(
        url,
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600,
        connect_args={"connect_timeout": 10, "options": "-c timezone=utc"},
        **base_options,
    )


engine = _build_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_legacy_schema_compatibility():
    """Apply safe additive schema updates required for legacy databases."""
    inspector = inspect(engine)
    table_names = set(inspector.get_table_names())

    if "clients" not in table_names:
        return

    client_columns = {column["name"] for column in inspector.get_columns("clients")}

    if "tipo_inmueble" not in client_columns:
        try:
            with engine.begin() as connection:
                connection.execute(
                    text("ALTER TABLE clients ADD COLUMN tipo_inmueble VARCHAR")
                )
        except Exception as e:
            print(f"Warning: No se pudo agregar columna tipo_inmueble: {e}")

    # Migración: agregar columnas de branding a users si no existen
    if "users" in table_names:
        user_columns = {column["name"] for column in inspector.get_columns("users")}
        new_branding_columns = {
            "company_name",
            "business_name",
            "tax_id",
            "address",
            "phone",
            "email_contact",
            "payment_terms",
        }
        try:
            with engine.begin() as connection:
                for col in new_branding_columns:
                    if col not in user_columns:
                        connection.execute(
                            text(f"ALTER TABLE users ADD COLUMN {col} VARCHAR")
                        )
        except Exception as e:
            # Si falla por permisos, continuamos sin las columnas nuevas
            # El usuario quizás no tenga permisos para ALTER TABLE
            print(f"Warning: No se pudieron agregar columnas de branding: {e}")


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
