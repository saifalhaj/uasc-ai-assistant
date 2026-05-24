from typing import Any

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PointStruct,
    VectorParams,
)

from interfaces.vector_store import SearchResult, VectorPoint, VectorStore


class QdrantCloudStore(VectorStore):
    """Qdrant Cloud implementation of VectorStore.

    Future swap-in: LocalQdrantStore pointing at on-prem Qdrant.
    """

    def __init__(self, url: str, api_key: str) -> None:
        self._client = AsyncQdrantClient(url=url, api_key=api_key)

    async def ensure_collection(self, collection: str, vector_size: int) -> None:
        exists = await self._client.collection_exists(collection)
        if not exists:
            await self._client.create_collection(
                collection_name=collection,
                vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
            )

    async def upsert(self, collection: str, points: list[VectorPoint]) -> None:
        structs = [
            PointStruct(id=p.id, vector=p.vector, payload=p.payload) for p in points
        ]
        await self._client.upsert(collection_name=collection, points=structs)

    async def search(
        self,
        collection: str,
        query_vector: list[float],
        top_k: int = 5,
        filter: dict[str, Any] | None = None,
    ) -> list[SearchResult]:
        qdrant_filter = self._build_filter(filter) if filter else None
        results = await self._client.search(
            collection_name=collection,
            query_vector=query_vector,
            limit=top_k,
            query_filter=qdrant_filter,
            with_payload=True,
        )
        return [
            SearchResult(id=str(r.id), score=r.score, payload=r.payload or {})
            for r in results
        ]

    async def delete_by_payload_filter(
        self, collection: str, filter: dict[str, Any]
    ) -> None:
        qdrant_filter = self._build_filter(filter)
        await self._client.delete(
            collection_name=collection,
            points_selector=qdrant_filter,
        )

    def _build_filter(self, filter: dict[str, Any]) -> Filter:
        conditions = [
            FieldCondition(key=k, match=MatchValue(value=v))
            for k, v in filter.items()
        ]
        return Filter(must=conditions)
