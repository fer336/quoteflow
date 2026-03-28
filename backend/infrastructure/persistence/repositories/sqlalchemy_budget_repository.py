"""SQLAlchemy repository stub for budgets."""

from __future__ import annotations

from domain.entities.budget import Budget


class SqlAlchemyBudgetRepository:
    def get_by_id(self, budget_id: int, *, owner_id: int) -> Budget | None:
        raise NotImplementedError(
            "Map legacy SQLAlchemy models here when migrating budgets vertical."
        )

    def list(self, *, owner_id: int, skip: int = 0, limit: int = 100):
        raise NotImplementedError(
            "Map legacy SQLAlchemy queries here when migrating budgets vertical."
        )

    def save(self, budget: Budget) -> Budget:
        raise NotImplementedError(
            "Map legacy SQLAlchemy persistence here when migrating budgets vertical."
        )

    def delete(self, budget_id: int, *, owner_id: int) -> None:
        raise NotImplementedError(
            "Map legacy SQLAlchemy deletion here when migrating budgets vertical."
        )
