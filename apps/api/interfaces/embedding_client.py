from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class EmbeddingResult:
    vectors: list[list[float]]
    model: str
    total_tokens: int


class EmbeddingClient(ABC):
    """Provider-agnostic embedding interface.

    Phase 1 implementation: CohereEmbeddingClient (embed-multilingual-v3).
    Future: OpenAIEmbeddingClient, AzureEmbeddingClient, BGEM3Client.
    """

    @abstractmethod
    async def embed(self, texts: list[str], input_type: str = "search_document") -> EmbeddingResult:
        """Embed a batch of texts.

        input_type: "search_document" for indexing, "search_query" for retrieval.
        """
        pass

    @property
    @abstractmethod
    def dimensions(self) -> int:
        pass

    @property
    @abstractmethod
    def model_id(self) -> str:
        pass
