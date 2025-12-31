from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import budgets, budget_items, clients, company
from fastapi.staticfiles import StaticFiles
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BudgetPro API",
    description="Sistema de gestión de presupuestos",
    version="1.0.0"
)

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://sistema.qeva.xyz",
        "http://sistema.qeva.xyz"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(budgets.router, prefix="/api/budgets", tags=["budgets"])
app.include_router(budget_items.router, prefix="/api/budget-items", tags=["budget-items"])
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(company.router, prefix="/api/company", tags=["company"])

@app.get("/")
def read_root():
    return {"message": "BudgetPro API - Sistema de Presupuestos", "status": "active"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

