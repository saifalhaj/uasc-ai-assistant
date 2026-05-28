from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class UserRecord:
    id: str
    station_id: str
    password_hash: str
    password_salt: str
    level: str            # 'L2' | 'L3' | 'L4'
    display_name: str
    clearance_label: str  # e.g. 'L4 · OPS-LEAD'
    created_at: datetime | None = None


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
class ChatSessionRecord:
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime


@dataclass
class ChatMessageRecord:
    id: str
    session_id: str
    role: str               # 'user' | 'assistant'
    content: str
    envelope: dict[str, Any] | None  # full AnswerEnvelope for assistant rows
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

    # ── Users & Sessions ───────────────────────────────────────────────────

    @abstractmethod
    async def get_user_by_station(self, station_id: str) -> UserRecord | None:
        pass

    @abstractmethod
    async def create_user(self, user: UserRecord) -> None:
        pass

    @abstractmethod
    async def create_session(
        self, session_id: str, user_id: str, expires_at: datetime
    ) -> None:
        pass

    @abstractmethod
    async def get_session_user(self, session_id: str) -> UserRecord | None:
        """Return the user linked to session_id if not expired, else None."""
        pass

    @abstractmethod
    async def delete_session(self, session_id: str) -> None:
        pass

    # ── Documents ─────────────────────────────────────────────────────────

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
        exclude_classifications: list[str] | None = None,
    ) -> tuple[list[DocumentRecord], int]:
        pass

    @abstractmethod
    async def delete_document(self, doc_id: str) -> bool:
        pass

    @abstractmethod
    async def increment_reference(self, doc_id: str) -> None:
        pass

    # ── Chat history ──────────────────────────────────────────────────────

    @abstractmethod
    async def create_chat_session(self, session: ChatSessionRecord) -> None:
        pass

    @abstractmethod
    async def get_chat_session(self, session_id: str) -> ChatSessionRecord | None:
        pass

    @abstractmethod
    async def touch_chat_session(self, session_id: str) -> None:
        """Update updated_at to now (called on each new message)."""
        pass

    @abstractmethod
    async def list_chat_sessions(
        self, user_id: str, limit: int = 50
    ) -> list[ChatSessionRecord]:
        pass

    @abstractmethod
    async def insert_chat_message(self, message: ChatMessageRecord) -> None:
        pass

    @abstractmethod
    async def list_chat_messages(self, session_id: str) -> list[ChatMessageRecord]:
        pass

    @abstractmethod
    async def update_chat_session_title(self, session_id: str, title: str) -> None:
        pass

    @abstractmethod
    async def delete_chat_session(self, session_id: str) -> bool:
        """Returns True if a row was deleted."""
        pass

    # ── Chunks / Audit ────────────────────────────────────────────────────

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
        pass
