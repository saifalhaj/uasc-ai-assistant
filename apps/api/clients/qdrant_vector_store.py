from typing import Any

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PointStruct,
    QueryRequest,
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
        response = await self._client.query_points(
            collection_name=collection,
            query=query_vector,
            limit=top_k,
            query_filter=qdrant_filter,
            with_payload=True,
        )
        return [
            SearchResult(id=str(r.id), score=r.score, payload=r.payload or {})
            for r in response.points
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
        # Accepts either a flat {key: value} (treated as must) or
        # {"must": {...}, "must_not": {...}} for richer logic.
        must_dict = filter.get("must") if isinstance(filter.get("must"), dict) else None
        must_not_dict = filter.get("must_not") if isinstance(filter.get("must_not"), dict) else None
        if must_dict is None and must_not_dict is None:
            must_dict = filter

        def _conds(d: dict[str, Any]) -> list[FieldCondition]:
            return [FieldCondition(key=k, match=MatchValue(value=v)) for k, v in d.items()]

        return Filter(
            must=_conds(must_dict) if must_dict else None,
            must_not=_conds(must_not_dict) if must_not_dict else None,
        )
