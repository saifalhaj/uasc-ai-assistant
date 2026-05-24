from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


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


class UploadRequest(BaseModel):
    title: str
    classification: str = "public"
    source_tier: str = "open"
    language: str = "en"
    tags: list[str] = Field(default_factory=list)


class ChatRequest(BaseModel):
    question: str
    top_k: int = 5


class IndexingStatusResponse(BaseModel):
    document_id: str
    status: str
    chunk_count: int | None = None
    error: str | None = None
