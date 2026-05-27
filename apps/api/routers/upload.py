"""Document upload and indexing routes."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from agents.chunker import chunk_text
from agents.rag_agent import _COLLECTION
from dependencies import Container, get_container
from interfaces.database import ChunkRecord, DocumentRecord
from interfaces.vector_store import VectorPoint
from middleware.auth import AuthUser, get_current_user
from models.schemas import ChunkMetadata, IndexingStatusResponse, UploadRequest

router = APIRouter(prefix="/upload", tags=["upload"])

_ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
}
_STORAGE_BUCKET = "documents"


@router.post("", response_model=IndexingStatusResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    classification: str = Form("public"),
    source_tier: str = Form("open"),
    language: str = Form("en"),
    tags: str = Form(""),
    user: AuthUser = Depends(get_current_user),
    container: Container = Depends(get_container),
) -> IndexingStatusResponse:
    content_type = file.content_type or "application/octet-stream"
    if content_type not in _ALLOWED_CONTENT_TYPES and not file.filename.endswith(
        (".pdf", ".docx", ".doc", ".txt")
    ):
        raise HTTPException(status_code=415, detail="Unsupported file type")

    raw = await file.read()
    doc_id = str(uuid.uuid4())
    storage_key = f"{doc_id}/{file.filename}"
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    now = datetime.now(timezone.utc)

    # Derive display name from auth user email (Phase 2: use Entra ID display name)
    uploader_display = user.email.split("@")[0].replace(".", " ").title()
    # Map auth clearance (internal/restricted/public) → display role; TODO: enrich via Entra
    clearance_display = f"L? · {user.clearance.upper()}"

    # 1. Store original file
    try:
        upload_result = await container.object_store.upload(
            bucket=_STORAGE_BUCKET,
            key=storage_key,
            data=raw,
            content_type=content_type,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {exc}") from exc

    # 2. Register document in DB as queued
    doc_record = DocumentRecord(
        id=doc_id,
        title=title,
        classification=classification,
        source_tier=source_tier,
        language=language,
        tags=tag_list,
        storage_key=storage_key,
        storage_url=upload_result.public_url,
        status="indexing",
        chunk_count=0,
        created_at=now,
        updated_at=now,
        size_bytes=len(raw),
        uploader_name=uploader_display,
        uploader_clearance=clearance_display,
    )
    try:
        await container.database.insert_document(doc_record)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"DB insert failed: {exc}") from exc

    try:
        # 3. Parse
        from sources.upload_source import UploadSource
        source = UploadSource()
        parsed = await source.parse(raw, content_type)

        # 4. Chunk
        chunks = chunk_text(parsed.text)

        # 5. Ensure vector collection exists
        await container.vector_store.ensure_collection(
            collection=_COLLECTION,
            vector_size=container.embedder.dimensions,
        )

        # 6. Embed in batches of 96 (Cohere limit)
        batch_size = 96
        points: list[VectorPoint] = []

        for batch_start in range(0, len(chunks), batch_size):
            batch = chunks[batch_start : batch_start + batch_size]
            embed_result = await container.embedder.embed(batch, input_type="search_document")

            for i, (text, vector) in enumerate(zip(batch, embed_result.vectors)):
                chunk_idx = batch_start + i
                chunk_id = str(uuid.uuid5(uuid.UUID(doc_id), str(chunk_idx)))

                meta = ChunkMetadata(
                    source_name=title,
                    source_tier=source_tier,
                    classification=classification,
                    ingested_at=now,
                    language=language,
                    original_doc_id=doc_id,
                    page_or_section=None,
                    tags=tag_list,
                ).model_dump(mode="json")
                meta["text"] = text
                meta["storage_url"] = upload_result.public_url
                meta["document_id"] = doc_id

                points.append(VectorPoint(id=chunk_id, vector=vector, payload=meta))

                await container.database.insert_chunk(
                    ChunkRecord(
                        id=chunk_id,
                        document_id=doc_id,
                        chunk_index=chunk_idx,
                        text=text,
                        metadata=meta,
                        created_at=now,
                    )
                )

        # 7. Upsert into Qdrant
        await container.vector_store.upsert(collection=_COLLECTION, points=points)

        # 8. Mark indexed
        await container.database.update_document_status(doc_id, "indexed", len(chunks))

        return IndexingStatusResponse(
            document_id=doc_id,
            status="indexed",
            chunk_count=len(chunks),
        )

    except Exception as exc:
        await container.database.update_document_status(doc_id, "error")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{doc_id}/status", response_model=IndexingStatusResponse)
async def get_status(
    doc_id: str,
    user: AuthUser = Depends(get_current_user),
    container: Container = Depends(get_container),
) -> IndexingStatusResponse:
    doc = await container.database.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return IndexingStatusResponse(
        document_id=doc_id,
        status=doc.status,
        chunk_count=doc.chunk_count or None,
    )
