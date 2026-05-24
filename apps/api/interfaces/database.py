from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class DocumentRecord:
    id: str
    title: str
    classification: str
    source_tier: str
    language: str
    tags: list[str]
    storage_key: str
    storage_url: str
    status: str
    chunk_count: int
    created_at: datetime
    updated_at: datetime


@dataclass
class ChunkRecord:
    id: str
    document_id: str
    chunk_index: int
    text: str
    metadata: dict[str, Any]
    created_at: datetime


@dataclass
class AuditEntry:
    id: str | None
    user_id: str
    clearance: str
    question: str
    retrieved_chunk_ids: list[str]
    model_used: str
    response_summary: str
    latency_ms: int
    created_at: datetime | None = None


class Database(ABC):
    """Provider-agnostic database interface (repository pattern).

    Phase 1 implementation: SupabasePostgresDB.
    Future: AzurePostgresDB.
    """

    @abstractmethod
    async def insert_document(self, doc: DocumentRecord) -> DocumentRecord:
        pass

    @abstractmethod
    async def update_document_status(
        self, doc_id: str, status: str, chunk_count: int | None = None
    ) -> None:
        pass

    @abstractmethod
    async def get_document(self, doc_id: str) -> DocumentRecord | None:
        pass

    @abstractmethod
    async def insert_chunk(self, chunk: ChunkRecord) -> ChunkRecord:
        pass

    @abstractmethod
    async def write_audit(self, entry: AuditEntry) -> None:
        pass
