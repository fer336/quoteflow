"""Client entity stub."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class Client:
    id: int | None = None
    owner_id: int | None = None
    name: str = ""
    email: str | None = None
    phone: str | None = None
    address: str | None = None
