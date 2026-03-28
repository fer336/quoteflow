"""ReportLab PDF adapter stub."""

from __future__ import annotations

from domain.entities.budget import Budget
from domain.entities.client import Client


class ReportlabPdfGenerator:
    def generate_budget_pdf(self, budget: Budget, client: Client | None = None):
        raise NotImplementedError(
            "Wrap the legacy ReportLab generator here during migration."
        )
