import json
from datetime import datetime, timezone

from supabase import AsyncClient

from interfaces.database import AuditEntry, ChunkRecord, Database, DocumentRecord


class SupabasePostgresDB(Database):
    """Supabase Postgres implementation of Database.

    Future swap-in: AzurePostgresDB.
    """

    def __init__(self, client: AsyncClient) -> None:
        self._db = client

    async def insert_document(self, doc: DocumentRecord) -> DocumentRecord:
        row = {
            "id": doc.id,
            "title": doc.title,
            "classification": doc.classification,
            "source_tier": doc.source_tier,
            "language": doc.language,
            "tags": doc.tags,
            "storage_key": doc.storage_key,
            "storage_url": doc.storage_url,
            "status": doc.status,
            "chunk_count": doc.chunk_count,
            "created_at": doc.created_at.isoformat(),
            "updated_at": doc.updated_at.isoformat(),
        }
        await self._db.table("documents").insert(row).execute()
        return doc

    async def update_document_status(
        self, doc_id: str, status: str, chunk_count: int | None = None
    ) -> None:
        update: dict = {
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        if chunk_count is not None:
            update["chunk_count"] = chunk_count
        await self._db.table("documents").update(update).eq("id", doc_id).execute()

    async def get_document(self, doc_id: str) -> DocumentRecord | None:
        result = await self._db.table("documents").select("*").eq("id", doc_id).execute()
        if not result.data:
            return None
        row = result.data[0]
        return DocumentRecord(
            id=row["id"],
            title=row["title"],
            classification=row["classification"],
            source_tier=row["source_tier"],
            language=row["language"],
            tags=row["tags"] or [],
            storage_key=row["storage_key"],
            storage_url=row["storage_url"],
            status=row["status"],
            chunk_count=row["chunk_count"] or 0,
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
        )

    async def insert_chunk(self, chunk: ChunkRecord) -> ChunkRecord:
        row = {
            "id": chunk.id,
            "document_id": chunk.document_id,
            "chunk_index": chunk.chunk_index,
            "text": chunk.text,
            "metadata": json.dumps(chunk.metadata),
            "created_at": chunk.created_at.isoformat(),
        }
        await self._db.table("chunks").insert(row).execute()
        return chunk

    async def write_audit(self, entry: AuditEntry) -> None:
        row = {
            "user_id": entry.user_id,
            "clearance": entry.clearance,
            "question": entry.question,
            "retrieved_chunk_ids": entry.retrieved_chunk_ids,
            "model_used": entry.model_used,
            "response_summary": entry.response_summary[:500],
            "latency_ms": entry.latency_ms,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await self._db.table("audit_log").insert(row).execute()
