from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import enum

class BudgetStatus(enum.Enum):
    PENDIENTE = "Pendiente"
    ACEPTADO = "Aceptado"
    RECHAZADO = "Rechazado"

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    tax_id = Column(String, nullable=True)  # CUIT/RUT/NIF
    created_at = Column(DateTime, default=datetime.utcnow)

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(String, unique=True, index=True)  # PR-001, PR-002, etc.
    client = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    validity = Column(String, default="15 días")
    status = Column(SQLEnum(BudgetStatus), default=BudgetStatus.PENDIENTE)
    total = Column(Float, default=0.0)
    is_manual_total = Column(Integer, default=0)  # 0 = automatic, 1 = manual
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    items = relationship("BudgetItem", back_populates="budget", cascade="all, delete-orphan")

class BudgetItem(Base):
    __tablename__ = "budget_items"

    id = Column(Integer, primary_key=True, index=True)
    budget_db_id = Column(Integer, ForeignKey("budgets.id", ondelete="CASCADE"))
    description = Column(String, nullable=False)
    amount = Column(Float, default=0.0)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    budget = relationship("Budget", back_populates="items")
