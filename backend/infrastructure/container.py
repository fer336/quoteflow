"""Composition root placeholders for the future Clean Architecture wiring."""

from __future__ import annotations

from dataclasses import dataclass

from application.ports.pdf import PdfGeneratorPort
from application.ports.repository import BudgetRepositoryPort, ClientRepositoryPort


@dataclass(slots=True)
class AppContainer:
    budget_repository: BudgetRepositoryPort
    client_repository: ClientRepositoryPort
    pdf_generator: PdfGeneratorPort


def get_app_container() -> AppContainer:
    raise NotImplementedError(
        "Composition root pending. Keep using legacy routers/services until each vertical is migrated."
    )
