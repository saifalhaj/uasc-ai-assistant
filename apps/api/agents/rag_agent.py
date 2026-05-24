"""RAG agent — the core query pipeline."""

import json
import time

from interfaces.database import AuditEntry, Database
from interfaces.embedding_client import EmbeddingClient
from interfaces.vector_store import VectorStore
from models.schemas import AnswerEnvelope, ChatRequest, CitationOut

from .router import Router

_COLLECTION = "uasc_chunks"

_SYSTEM_PROMPT = """You are an expert assistant for the Unmanned Aerial Systems Center (UASC),
Dubai Police. Answer questions accurately and concisely using ONLY the provided context chunks.
If the answer is not in the context, say so clearly. Cite specific sources.
Respond in the same language as the question (Arabic or English)."""

_TOOLS_CONFIG: list[str] = ["doc_search"]
# Phase 2 additions: "notam_query", "sql_query", "airhub_lookup",
# "threat_lookup", "osint_search", "incident_match", "context_check"


class RAGAgent:
    def __init__(
        self,
        router: Router,
        embedder: EmbeddingClient,
        vector_store: VectorStore,
        database: Database,
    ) -> None:
        self._router = router
        self._embedder = embedder
        self._vector_store = vector_store
        self._db = database

    async def query(
        self,
        request: ChatRequest,
        user_id: str,
        clearance: str,
    ) -> AnswerEnvelope:
        start = time.monotonic()

        # 1. Embed query
        embed_result = await self._embedder.embed(
            [request.question], input_type="search_query"
        )
        query_vector = embed_result.vectors[0]

        # 2. Retrieve top-k chunks
        results = await self._vector_store.search(
            collection=_COLLECTION,
            query_vector=query_vector,
            top_k=request.top_k,
        )

        # 3. Check for restricted chunks (Phase 1: warning only; Phase 3: route to local LLM)
        limitations: list[str] = []
        has_restricted = any(
            r.payload.get("classification") == "restricted" for r in results
        )
        if has_restricted:
            limitations.append(
                "One or more sources are classified RESTRICTED. "
                "In Phase 3 this query will route to the local LLM."
            )

        # 4. Determine LLM via router
        highest_classification = "restricted" if has_restricted else "public"
        llm = self._router.route(highest_classification)

        # 5. Build context
        context_blocks = [
            f"[Source {i+1}] {r.payload.get('source_name', 'Unknown')} "
            f"({r.payload.get('classification', '?')} / {r.payload.get('source_tier', '?')}):\n"
            f"{r.payload.get('text', '')}"
            for i, r in enumerate(results)
        ]
        context = "\n\n---\n\n".join(context_blocks)

        from interfaces.llm_client import Message
        messages = [
            Message(
                role="user",
                content=(
                    f"Context:\n{context}\n\n"
                    f"Question: {request.question}\n\n"
                    "Answer based only on the context above. "
                    "At the end, note which sources you used (by number)."
                ),
            )
        ]

        # 6. LLM call
        llm_response = await llm.complete(messages, system=_SYSTEM_PROMPT)

        # 7. Build citations
        citations = [
            CitationOut(
                chunk_id=r.id,
                classification=r.payload.get("classification", "public"),
                source_tier=r.payload.get("source_tier", "open"),
                language=r.payload.get("language", "en"),
                link=r.payload.get("storage_url", ""),
                text_excerpt=r.payload.get("text", "")[:300],
                page_or_section=r.payload.get("page_or_section"),
                source_name=r.payload.get("source_name", "Unknown"),
            )
            for r in results
        ]

        latency_ms = int((time.monotonic() - start) * 1000)

        # 8. Audit log
        await self._db.write_audit(
            AuditEntry(
                id=None,
                user_id=user_id,
                clearance=clearance,
                question=request.question,
                retrieved_chunk_ids=[r.id for r in results],
                model_used=llm_response.model,
                response_summary=llm_response.content,
                latency_ms=latency_ms,
            )
        )

        return AnswerEnvelope(
            answer=llm_response.content,
            citations=citations,
            confidence=round(results[0].score if results else 0.0, 3),
            recency="unknown",  # Phase 2: derive from effective_from/effective_to
            risk_level="low",   # Phase 2: derive from classification and content analysis
            escalation_flag=has_restricted,
            limitations=limitations,
        )
