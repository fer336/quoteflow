from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Clients ---
class ClientBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(ClientBase):
    name: Optional[str] = None

class ClientResponse(ClientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Budget Items ---
class BudgetItemBase(BaseModel):
    description: str
    amount: float = 0.0
    order_index: int = 0

class BudgetItemCreate(BudgetItemBase):
    pass

class BudgetItemResponse(BudgetItemBase):
    id: int
    budget_db_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Budgets ---
class BudgetBase(BaseModel):
    client: str
    validity: str = "15 días"
    is_manual_total: int = 0
    total: Optional[float] = None

class BudgetCreate(BudgetBase):
    date: Optional[datetime] = None
    items: List[BudgetItemCreate] = []

class BudgetUpdate(BaseModel):
    client: Optional[str] = None
    validity: Optional[str] = None
    status: Optional[str] = None
    total: Optional[float] = None
    is_manual_total: Optional[int] = None

class BudgetResponse(BudgetBase):
    id: int
    budget_id: str
    date: datetime
    status: str
    total: float
    created_at: datetime
    updated_at: datetime
    items: List[BudgetItemResponse] = []

    class Config:
        from_attributes = True

class BudgetListResponse(BaseModel):
    id: int
    budget_id: str
    client: str
    date: datetime
    status: str
    total: float

    class Config:
        from_attributes = True
