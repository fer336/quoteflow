"""PDF generation contract."""

from __future__ import annotations

from typing import BinaryIO, Protocol

from domain.entities.budget import Budget
from domain.entities.client import Client


class PdfGeneratorPort(Protocol):
    """Generates a PDF representation for a budget."""

    def generate_budget_pdf(
        self, budget: Budget, client: Client | None = None
    ) -> BinaryIO: ...
