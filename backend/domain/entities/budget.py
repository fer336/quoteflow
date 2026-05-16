"""Budget aggregate stub."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from domain.value_objects.budget_status import BudgetStatus


@dataclass(slots=True)
class BudgetItem:
    description: str
    amount: float
    order_index: int = 0
    quantity: float | None = None
    unit_price: float | None = None
    is_excluded: bool = False


@dataclass(slots=True)
class Budget:
    id: int | None = None
    budget_code: str = ""
    owner_id: int | None = None
    client_name: str = ""
    date: datetime | None = None
    validity: str = ""
    status: BudgetStatus = BudgetStatus.PENDING
    currency: str = "ARS"
    total: float = 0.0
    is_manual_total: bool = False
    items: list[BudgetItem] = field(default_factory=list)
