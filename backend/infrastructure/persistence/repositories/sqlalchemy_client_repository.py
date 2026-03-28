"""SQLAlchemy repository stub for clients."""

from __future__ import annotations

from domain.entities.client import Client


class SqlAlchemyClientRepository:
    def get_by_id(self, client_id: int, *, owner_id: int) -> Client | None:
        raise NotImplementedError(
            "Map legacy SQLAlchemy models here when migrating clients vertical."
        )

    def list(self, *, owner_id: int):
        raise NotImplementedError(
            "Map legacy SQLAlchemy queries here when migrating clients vertical."
        )

    def save(self, client: Client) -> Client:
        raise NotImplementedError(
            "Map legacy SQLAlchemy persistence here when migrating clients vertical."
        )
