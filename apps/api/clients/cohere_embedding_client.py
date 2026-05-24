import cohere

from interfaces.embedding_client import EmbeddingClient, EmbeddingResult

_COHERE_MULTILINGUAL_DIMS = 1024


class CohereEmbeddingClient(EmbeddingClient):
    """Cohere embed-multilingual-v3 implementation.

    Handles Arabic and English natively.
    Future swap-in: OpenAIEmbeddingClient, AzureEmbeddingClient, BGEM3Client.
    """

    def __init__(self, api_key: str, model: str = "embed-multilingual-v3.0") -> None:
        self._client = cohere.AsyncClientV2(api_key=api_key)
        self._model = model

    @property
    def dimensions(self) -> int:
        return _COHERE_MULTILINGUAL_DIMS

    @property
    def model_id(self) -> str:
        return self._model

    async def embed(self, texts: list[str], input_type: str = "search_document") -> EmbeddingResult:
        response = await self._client.embed(
            texts=texts,
            model=self._model,
            input_type=input_type,  # type: ignore[arg-type]
            embedding_types=["float"],
        )

        vectors = response.embeddings.float  # type: ignore[union-attr]
        total_tokens = getattr(response.meta, "billed_units", None)
        billed = getattr(total_tokens, "input_tokens", 0) if total_tokens else 0

        return EmbeddingResult(
            vectors=vectors,
            model=self._model,
            total_tokens=billed,
        )
