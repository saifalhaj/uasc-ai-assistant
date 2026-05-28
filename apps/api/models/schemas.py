from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# ── Library schemas ──────────────────────────────────────────────────────────

class UploaderInfo(BaseModel):
    name: str
    clearance: str  # e.g. "L4 · OPS-LEAD"


class DocumentOut(BaseModel):
    id: str
    title: str
    extension: str          # PDF | DOCX | MD | XLSX | TXT
    sizeBytes: int
    pages: int | None = None
    classification: str
    sourceTier: str         # authoritative | reference | external
    language: str
    tags: list[str]
    uploader: UploaderInfo
    uploadedAt: str         # ISO 8601
    referenceCount: int
    referenceHistory: list[int]
    lastReferencedAt: str | None
    status: str


class DocumentListResponse(BaseModel):
    documents: list[DocumentOut]
    total: int


# ─────────────────────────────────────────────────────────────────────────────

class ChunkMetadata(BaseModel):
    """Full metadata schema on every chunk. Null fields reserved for future phases."""
    source_name: str
    source_tier: str  # authoritative | vetted | open
    classification: str  # public | internal | restricted
    ingested_at: datetime
    effective_from: datetime | None = None
    effective_to: datetime | None = None
    language: str  # en | ar | mixed
    original_doc_id: str
    page_or_section: str | None = None
    related_operator_id: str | None = None
    related_aircraft_id: str | None = None
    related_incident_id: str | None = None
    geometry: Any | None = None  # reserved for PostGIS Phase 2
    tags: list[str] = Field(default_factory=list)


class CitationOut(BaseModel):
    chunk_id: str
    classification: str
    source_tier: str
    language: str
    link: str
    text_excerpt: str
    page_or_section: str | None = None
    source_name: str


class AnswerEnvelope(BaseModel):
    answer: str
    citations: list[CitationOut]
    confidence: float
    recency: str
    risk_level: str  # low | medium | high
    escalation_flag: bool
    limitations: list[str]
    session_id: str | None = None  # server-assigned; echoes on every POST /chat


class ChatSessionOut(BaseModel):
    id: str
    title: str
    created_at: str  # ISO 8601
    updated_at: str  # ISO 8601


class ChatTurnOut(BaseModel):
    """One Q + A pair as the frontend renders it."""
    question: str
    envelope: AnswerEnvelope


class ChatThreadOut(BaseModel):
    session: ChatSessionOut
    turns: list[ChatTurnOut]


class ChatRenameRequest(BaseModel):
    title: str


class UploadRequest(BaseModel):
    title: str
    classification: str = "public"
    source_tier: str = "open"
    language: str = "en"
    tags: list[str] = Field(default_factory=list)


class ChatRequest(BaseModel):
    question: str
    top_k: int = 5
    session_id: str | None = None  # if absent, server creates a new thread


class IndexingStatusResponse(BaseModel):
    document_id: str
    status: str
    chunk_count: int | None = None
    error: str | None = None
