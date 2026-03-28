"""Storage provider contract."""

from __future__ import annotations

from typing import BinaryIO, Protocol


class StoragePort(Protocol):
    """Abstracts file storage for generated artifacts and attachments."""

    def upload(
        self, *, object_name: str, content: BinaryIO, content_type: str
    ) -> str: ...

    def download(self, *, object_name: str) -> bytes: ...

    def delete(self, *, object_name: str) -> None: ...
