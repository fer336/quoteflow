"""Budget use case stubs for the strangler migration."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from application.ports.pdf import PdfGeneratorPort
from application.ports.repository import BudgetRepositoryPort, ClientRepositoryPort
from domain.entities.budget import Budget


@dataclass(slots=True)
class CreateBudgetUseCase:
    repository: BudgetRepositoryPort

    def execute(self, budget: Budget) -> Budget:
        raise NotImplementedError(
            "Wire the legacy budget creation flow here during migration."
        )


@dataclass(slots=True)
class ListBudgetsUseCase:
    repository: BudgetRepositoryPort

    def execute(
        self, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> Sequence[Budget]:
        raise NotImplementedError(
            "Wire the legacy budget listing flow here during migration."
        )


@dataclass(slots=True)
class GenerateBudgetPdfUseCase:
    budget_repository: BudgetRepositoryPort
    client_repository: ClientRepositoryPort
    pdf_generator: PdfGeneratorPort

    def execute(self, *, budget_id: int, owner_id: int):
        raise NotImplementedError("Wire the legacy PDF flow here during migration.")
