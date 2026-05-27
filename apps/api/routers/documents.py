"""Document listing and management routes.

GET  /documents        — list / search / filter corpus documents
DELETE /documents/{id} — remove document + write audit log

Required DB migration (run once in Supabase SQL editor):
─────────────────────────────────────────────────────────
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

from fastapi import APIRouter, Depends, HTTPException, Query

from agents.rag_agent import _COLLECTION
from dependencies import Container, get_container
from interfaces.database import DocumentRecord
from middleware.auth import AuthUser, get_current_user
from models.schemas import DocumentListResponse, DocumentOut, UploaderInfo

router = APIRouter(prefix="/documents", tags=["documents"])

# Map DB source_tier values → UI sourceTier values
_TIER_MAP = {
    "authoritative": "authoritative",
    "vetted":        "reference",
    "open":          "external",
    # pass-through for new-style values
    "reference":     "reference",
    "external":      "external",
}

# Derive file extension from storage_key (e.g. "uuid/my-file.PDF" → "PDF")
def _ext_from_key(storage_key: str) -> str:
    name = storage_key.split("/")[-1] if "/" in storage_key else storage_key
    if "." in name:
        return name.rsplit(".", 1)[-1].upper()[:5]
    return "FILE"


def _doc_to_out(doc: DocumentRecord) -> DocumentOut:
    return DocumentOut(
        id=doc.id,
        title=doc.title,
        extension=_ext_from_key(doc.storage_key),
        sizeBytes=doc.size_bytes,
        pages=doc.pages,
        classification=doc.classification,
        sourceTier=_TIER_MAP.get(doc.source_tier, doc.source_tier),
        language=doc.language,
        tags=doc.tags,
        uploader=UploaderInfo(
            name=doc.uploader_name,
            clearance=doc.uploader_clearance,
        ),
        uploadedAt=doc.created_at.isoformat(),
        referenceCount=doc.reference_count,
        referenceHistory=doc.reference_history,
        lastReferencedAt=doc.last_referenced_at.isoformat() if doc.last_referenced_at else None,
        status=doc.status,
    )


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    q: str | None = Query(default=None, description="Full-text search on title"),
    classification: str | None = Query(default=None),
    sourceTier: str | None = Query(default=None),
    sort: str = Query(default="uploadedAt"),
    order: str = Query(default="desc", pattern="^(asc|desc)$"),
    limit: int = Query(default=200, le=500),
    offset: int = Query(default=0, ge=0),
    user: AuthUser = Depends(get_current_user),
    container: Container = Depends(get_container),
) -> DocumentListResponse:
    # Map UI sourceTier → DB source_tier if needed
    db_source_tier: str | None = None
    if sourceTier:
        _reverse = {"authoritative": "authoritative", "reference": "vetted", "external": "open"}
        db_source_tier = _reverse.get(sourceTier, sourceTier)

    records, total = await container.database.list_documents(
        q=q,
        classification=classification,
        source_tier=db_source_tier,
        sort=sort,
        order=order,
        limit=limit,
        offset=offset,
    )
    return DocumentListResponse(
        documents=[_doc_to_out(r) for r in records],
        total=total,
    )


@router.delete("/{doc_id}", status_code=204)
async def delete_document(
    doc_id: str,
    user: AuthUser = Depends(get_current_user),
    container: Container = Depends(get_container),
) -> None:
    # 1. Confirm document exists
    doc = await container.database.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 2. Delete from vector store (Qdrant) — filter by document_id in payload
    try:
        await container.vector_store.delete_by_payload_filter(
            collection=_COLLECTION,
            filter={"document_id": doc_id},
        )
    except Exception:
        # Non-fatal: log but don't block the delete
        pass

    # 3. Delete from object store
    try:
        await container.object_store.delete(bucket="documents", key=doc.storage_key)
    except Exception:
        pass

    # 4. Delete document row from DB (chunks retain their rows as tombstones)
    deleted = await container.database.delete_document(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")

    # 5. Write audit log
    await container.database.write_action_audit(
        actor_id=user.id,
        clearance=user.clearance,
        action="document.delete",
        target=doc_id,
    )
