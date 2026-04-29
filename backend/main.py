from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load secrets before importing database
if os.path.exists("/run/secrets/backend.env"):
    load_dotenv("/run/secrets/backend.env")
else:
    load_dotenv()

from database import engine, Base, ensure_legacy_schema_compatibility
from routers import budgets, budget_items, clients, company, admin_users
from auth import auth_router
from fastapi.staticfiles import StaticFiles
import os

# Create database tables
Base.metadata.create_all(bind=engine)
ensure_legacy_schema_compatibility()

app = FastAPI(
    title="QuoteFlow API",
    description="Sistema de gestión de presupuestos y propuestas comerciales",
    version="1.0.0",
)

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# CORS configuration
# Soporta múltiples orígenes separados por coma (desde env var) o fallback al nuevo dominio
_cors_raw = os.getenv(
    "CORS_ORIGINS",
    "https://presupuestos.octopustrack.shop,http://presupuestos.octopustrack.shop",
)
_cors_origins = [o.strip() for o in _cors_raw.split(",") if o.strip()]
_cors_origins.append("http://localhost:5173")  # Vite dev server

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(budgets.router, prefix="/api/budgets", tags=["budgets"])
app.include_router(
    budget_items.router, prefix="/api/budget-items", tags=["budget-items"]
)
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(company.router, prefix="/api/company", tags=["company"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(admin_users.router, prefix="/api/admin", tags=["admin-cms"])


@app.get("/")
def read_root():
    return {"message": "QuoteFlow API - Sistema de Presupuestos", "status": "active"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
