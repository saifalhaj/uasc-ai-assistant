"""Supabase Postgres implementation of Database.

Required DB migration (run once in Supabase SQL editor):
─────────────────────────────────────────────────────────
-- Users & Sessions
CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,
  station_id        TEXT UNIQUE NOT NULL,
  password_hash     TEXT NOT NULL,
  password_salt     TEXT NOT NULL,
  level             TEXT NOT NULL,
  display_name      TEXT NOT NULL,
  clearance_label   TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Library fields added to documents
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS size_bytes         INTEGER      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pages              INTEGER,
  ADD COLUMN IF NOT EXISTS uploader_name      TEXT         DEFAULT 'System',
  ADD COLUMN IF NOT EXISTS uploader_clearance TEXT         DEFAULT 'L?',
  ADD COLUMN IF NOT EXISTS reference_count    INTEGER      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reference_history  INTEGER[]    DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0],
  ADD COLUMN IF NOT EXISTS last_referenced_at TIMESTAMPTZ;
─────────────────────────────────────────────────────────
"""

import json
from datetime import datetime, timezone

from supabase import AsyncClient

from interfaces.database import (
    AuditEntry,
    ChunkRecord,
    Database,
    DocumentRecord,
    UserRecord,
)


# ── helpers ────────────────────────────────────────────────────────────────────

def _row_to_doc(row: dict) -> DocumentRecord:
    ref_hist = row.get("reference_history") or [0] * 10
    if not isinstance(ref_hist, list):
        ref_hist = [0] * 10

    last_ref_raw = row.get("last_referenced_at")
    last_ref = None
    if last_ref_raw:
        try:
            last_ref = datetime.fromisoformat(last_ref_raw)
        except (ValueError, TypeError):
            pass

    return DocumentRecord(
        id=row["id"],
        title=row["title"],
        classification=row["classification"],
        source_tier=row["source_tier"],
        language=row["language"],
        tags=row.get("tags") or [],
        storage_key=row["storage_key"],
        storage_url=row["storage_url"],
        status=row["status"],
        chunk_count=row.get("chunk_count") or 0,
        created_at=datetime.fromisoformat(row["created_at"]),
        updated_at=datetime.fromisoformat(row["updated_at"]),
        size_bytes=row.get("size_bytes") or 0,
        pages=row.get("pages"),
        uploader_name=row.get("uploader_name") or "System",
        uploader_clearance=row.get("uploader_clearance") or "L?",
        reference_count=row.get("reference_count") or 0,
        reference_history=ref_hist,
        last_referenced_at=last_ref,
    )


def _row_to_user(row: dict) -> UserRecord:
    return UserRecord(
        id=row["id"],
        station_id=row["station_id"],
        password_hash=row["password_hash"],
        password_salt=row["password_salt"],
        level=row["level"],
        display_name=row["display_name"],
        clearance_label=row["clearance_label"],
        created_at=datetime.fromisoformat(row["created_at"]) if row.get("created_at") else None,
    )


class SupabasePostgresDB(Database):
    def __init__(self, client: AsyncClient) -> None:
        self._db = client

    # ── Users & Sessions ───────────────────────────────────────────────────────

    async def get_user_by_station(self, station_id: str) -> UserRecord | None:
        result = await (
            self._db.table("users")
            .select("*")
            .eq("station_id", station_id)
            .limit(1)
            .execute()
        )
        if not result.data:
            return None
        return _row_to_user(result.data[0])

    async def create_user(self, user: UserRecord) -> None:
        row = {
            "id":             user.id,
            "station_id":     user.station_id,
            "password_hash":  user.password_hash,
            "password_salt":  user.password_salt,
            "level":          user.level,
            "display_name":   user.display_name,
            "clearance_label": user.clearance_label,
        }
        await self._db.table("users").insert(row).execute()

    async def create_session(
        self, session_id: str, user_id: str, expires_at: datetime
    ) -> None:
        await (
            self._db.table("sessions")
            .insert({
                "id":         session_id,
                "user_id":    user_id,
                "expires_at": expires_at.isoformat(),
            })
            .execute()
        )

    async def get_session_user(self, session_id: str) -> UserRecord | None:
        now = datetime.now(timezone.utc).isoformat()
        result = await (
            self._db.table("sessions")
            .select("users(*)")
            .eq("id", session_id)
            .gt("expires_at", now)
            .limit(1)
            .execute()
        )
        if not result.data or not result.data[0].get("users"):
            return None
        return _row_to_user(result.data[0]["users"])

    async def delete_session(self, session_id: str) -> None:
        await self._db.table("sessions").delete().eq("id", session_id).execute()

    # ── Documents ──────────────────────────────────────────────────────────────

    async def insert_document(self, doc: DocumentRecord) -> DocumentRecord:
        row: dict = {
            "id":            doc.id,
            "title":         doc.title,
            "classification": doc.classification,
            "source_tier":   doc.source_tier,
            "language":      doc.language,
            "tags":          doc.tags,
            "storage_key":   doc.storage_key,
            "storage_url":   doc.storage_url,
            "status":        doc.status,
            "chunk_count":   doc.chunk_count,
            "created_at":    doc.created_at.isoformat(),
            "updated_at":    doc.updated_at.isoformat(),
            "size_bytes":          doc.size_bytes,
            "uploader_name":       doc.uploader_name,
            "uploader_clearance":  doc.uploader_clearance,
            "reference_count":     doc.reference_count,
            "reference_history":   doc.reference_history,
        }
        if doc.pages is not None:
            row["pages"] = doc.pages
        await self._db.table("documents").insert(row).execute()
        return doc

    async def update_document_status(
        self, doc_id: str, status: str, chunk_count: int | None = None
    ) -> None:
        update: dict = {
            "status":     status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        if chunk_count is not None:
            update["chunk_count"] = chunk_count
        await self._db.table("documents").update(update).eq("id", doc_id).execute()

    async def get_document(self, doc_id: str) -> DocumentRecord | None:
        result = await self._db.table("documents").select("*").eq("id", doc_id).execute()
        if not result.data:
            return None
        return _row_to_doc(result.data[0])

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
        sort_col_map = {
            "uploadedAt":     "created_at",
            "title":          "title",
            "classification": "classification",
            "sourceTier":     "source_tier",
            "language":       "language",
            "referenceCount": "reference_count",
            "status":         "status",
        }
        col = sort_col_map.get(sort, sort)

        query = self._db.table("documents").select("*", count="exact")
        if classification:
            query = query.eq("classification", classification)
        if source_tier:
            query = query.eq("source_tier", source_tier)
        if q:
            query = query.ilike("title", f"%{q}%")
        if exclude_classifications:
            for c in exclude_classifications:
                query = query.neq("classification", c)

        query = query.order(col, desc=(order == "desc")).range(offset, offset + limit - 1)
        result = await query.execute()

        records = [_row_to_doc(row) for row in (result.data or [])]
        total = result.count or len(records)
        return records, total

    async def delete_document(self, doc_id: str) -> bool:
        result = await (
            self._db.table("documents").delete().eq("id", doc_id).execute()
        )
        return len(result.data or []) > 0

    async def increment_reference(self, doc_id: str) -> None:
        now_iso = datetime.now(timezone.utc).isoformat()
        result = await (
            self._db.table("documents")
            .select("reference_count, reference_history")
            .eq("id", doc_id)
            .execute()
        )
        if not result.data:
            return
        row = result.data[0]
        count = (row.get("reference_count") or 0) + 1
        hist: list[int] = row.get("reference_history") or [0] * 10
        if not isinstance(hist, list) or len(hist) != 10:
            hist = [0] * 10
        hist = hist[1:] + [hist[-1] + 1]
        await (
            self._db.table("documents")
            .update({
                "reference_count":    count,
                "reference_history":  hist,
                "last_referenced_at": now_iso,
                "updated_at":         now_iso,
            })
            .eq("id", doc_id)
            .execute()
        )

    # ── Chunks / Audit ─────────────────────────────────────────────────────────

    async def insert_chunk(self, chunk: ChunkRecord) -> ChunkRecord:
        row = {
            "id":           chunk.id,
            "document_id":  chunk.document_id,
            "chunk_index":  chunk.chunk_index,
            "text":         chunk.text,
            "metadata":     json.dumps(chunk.metadata),
            "created_at":   chunk.created_at.isoformat(),
        }
        await self._db.table("chunks").insert(row).execute()
        return chunk

    async def write_audit(self, entry: AuditEntry) -> None:
        row = {
            "user_id":             entry.user_id,
            "clearance":           entry.clearance,
            "question":            entry.question,
            "retrieved_chunk_ids": entry.retrieved_chunk_ids,
            "model_used":          entry.model_used,
            "response_summary":    entry.response_summary[:500],
            "latency_ms":          entry.latency_ms,
            "created_at":          datetime.now(timezone.utc).isoformat(),
        }
        await self._db.table("audit_log").insert(row).execute()

    async def write_action_audit(
        self, actor_id: str, clearance: str, action: str, target: str
    ) -> None:
        row = {
            "user_id":             actor_id,
            "clearance":           clearance,
            "question":            "",
            "retrieved_chunk_ids": [],
            "model_used":          f"action:{action}",
            "response_summary":    f"{action}: {target}"[:500],
            "latency_ms":          0,
            "created_at":          datetime.now(timezone.utc).isoformat(),
        }
        await self._db.table("audit_log").insert(row).execute()
