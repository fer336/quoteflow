"""Budget status value object stub."""

from enum import StrEnum


class BudgetStatus(StrEnum):
    PENDING = "pendiente"
    ACCEPTED = "aceptado"
    REJECTED = "rechazado"
