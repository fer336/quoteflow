"""Client use case stubs for the strangler migration."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from application.ports.repository import ClientRepositoryPort
from domain.entities.client import Client


@dataclass(slots=True)
class ListClientsUseCase:
    repository: ClientRepositoryPort

    def execute(self, *, owner_id: int) -> Sequence[Client]:
        raise NotImplementedError(
            "Wire the legacy client listing flow here during migration."
        )


@dataclass(slots=True)
class SaveClientUseCase:
    repository: ClientRepositoryPort

    def execute(self, client: Client) -> Client:
        raise NotImplementedError(
            "Wire the legacy client save flow here during migration."
        )
