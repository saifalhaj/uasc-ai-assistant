from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class Message:
    role: str  # "user" | "assistant" | "system"
    content: str


@dataclass
class LLMResponse:
    content: str
    model: str
    input_tokens: int
    output_tokens: int
    raw: Any = None


class LLMClient(ABC):
    """Provider-agnostic LLM interface.

    Phase 1 implementation: CloudClient (Anthropic Claude).
    Future: OpenAIClient, AzureOpenAIClient, LocalClient (Ollama/vLLM).
    """

    @abstractmethod
    async def complete(
        self,
        messages: list[Message],
        system: str | None = None,
        max_tokens: int = 2048,
        temperature: float = 0.2,
    ) -> LLMResponse:
        pass

    @property
    @abstractmethod
    def model_id(self) -> str:
        pass
