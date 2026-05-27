from abc import ABC, abstractmethod
from dataclasses import dataclass, field
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
    # Library fields (optional — populated for new docs; defaulted for legacy)
    size_bytes: int = 0
    pages: int | None = None
    uploader_name: str = 'System'
    uploader_clearance: str = 'L?'  # TODO: populate from auth when Entra ID is wired
    reference_count: int = 0
    reference_history: list[int] = field(default_factory=lambda: [0] * 10)
    last_referenced_at: datetime | None = None


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
    async def list_documents(
        self,
        q: str | None = None,
        classification: str | None = None,
        source_tier: str | None = None,
        sort: str = "created_at",
        order: str = "desc",
        limit: int = 200,
        offset: int = 0,
    ) -> tuple[list[DocumentRecord], int]:
        """Return (records, total_count) matching the given filters."""
        pass

    @abstractmethod
    async def delete_document(self, doc_id: str) -> bool:
        """Hard-delete the document row. Returns True if a row was deleted."""
        pass

    @abstractmethod
    async def increment_reference(self, doc_id: str) -> None:
        """Increment referenceCount and update lastReferencedAt + referenceHistory."""
        pass

    @abstractmethod
    async def insert_chunk(self, chunk: ChunkRecord) -> ChunkRecord:
        pass

    @abstractmethod
    async def write_audit(self, entry: AuditEntry) -> None:
        pass

    @abstractmethod
    async def write_action_audit(
        self, actor_id: str, clearance: str, action: str, target: str
    ) -> None:
        """Write a non-chat action (e.g. document.delete) to the existing audit_log table."""
        pass
