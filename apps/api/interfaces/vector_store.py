from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class VectorPoint:
    id: str
    vector: list[float]
    payload: dict[str, Any]


@dataclass
class SearchResult:
    id: str
    score: float
    payload: dict[str, Any]


class VectorStore(ABC):
    """Provider-agnostic vector store interface.

    Phase 1 implementation: QdrantCloudStore.
    Future: LocalQdrantStore (on-prem Qdrant when hardware arrives).
    """

    @abstractmethod
    async def upsert(self, collection: str, points: list[VectorPoint]) -> None:
        pass

    @abstractmethod
    async def search(
        self,
        collection: str,
        query_vector: list[float],
        top_k: int = 5,
        filter: dict[str, Any] | None = None,
    ) -> list[SearchResult]:
        pass

    @abstractmethod
    async def ensure_collection(self, collection: str, vector_size: int) -> None:
        pass

    @abstractmethod
    async def delete_by_payload_filter(self, collection: str, filter: dict[str, Any]) -> None:
        pass
