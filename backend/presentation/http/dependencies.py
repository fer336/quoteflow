"""Dependency providers for the future Clean Architecture HTTP layer."""

from __future__ import annotations

from application.ports.pdf import PdfGeneratorPort
from application.ports.repository import BudgetRepositoryPort, ClientRepositoryPort
from infrastructure.container import AppContainer, get_app_container


def get_budget_repository(
    container: AppContainer | None = None,
) -> BudgetRepositoryPort:
    resolved_container = container or get_app_container()
    return resolved_container.budget_repository


def get_client_repository(
    container: AppContainer | None = None,
) -> ClientRepositoryPort:
    resolved_container = container or get_app_container()
    return resolved_container.client_repository


def get_pdf_generator(container: AppContainer | None = None) -> PdfGeneratorPort:
    resolved_container = container or get_app_container()
    return resolved_container.pdf_generator
