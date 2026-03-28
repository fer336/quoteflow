"""Repository ports for the application layer.

These contracts define the target seam for the incremental migration.
They are intentionally minimal and are not wired into production yet.
"""

from __future__ import annotations

from typing import Protocol, Sequence

from domain.entities.budget import Budget
from domain.entities.client import Client


class BudgetRepositoryPort(Protocol):
    """Target contract for budget persistence."""

    def get_by_id(self, budget_id: int, *, owner_id: int) -> Budget | None: ...

    def list(
        self, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> Sequence[Budget]: ...

    def save(self, budget: Budget) -> Budget: ...

    def delete(self, budget_id: int, *, owner_id: int) -> None: ...


class ClientRepositoryPort(Protocol):
    """Target contract for client persistence."""

    def get_by_id(self, client_id: int, *, owner_id: int) -> Client | None: ...

    def list(self, *, owner_id: int) -> Sequence[Client]: ...

    def save(self, client: Client) -> Client: ...
