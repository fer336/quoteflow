"""Money value object stub."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Money:
    amount: float
    currency: str = "ARS"
