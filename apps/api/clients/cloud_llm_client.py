import anthropic

from interfaces.llm_client import LLMClient, Message, LLMResponse


class CloudClient(LLMClient):
    """Anthropic Claude implementation of LLMClient.

    Future swap-in: OpenAIClient, AzureOpenAIClient, LocalClient (Ollama/vLLM).
    All callers use LLMClient — this class is never referenced directly outside this module.
    """

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-6") -> None:
        self._client = anthropic.AsyncAnthropic(api_key=api_key)
        self._model = model

    @property
    def model_id(self) -> str:
        return self._model

    async def complete(
        self,
        messages: list[Message],
        system: str | None = None,
        max_tokens: int = 2048,
        temperature: float = 0.2,
    ) -> LLMResponse:
        anthropic_messages = [
            {"role": m.role, "content": m.content}
            for m in messages
            if m.role in ("user", "assistant")
        ]

        kwargs: dict = {
            "model": self._model,
            "max_tokens": max_tokens,
            "messages": anthropic_messages,
        }
        if system:
            kwargs["system"] = system

        response = await self._client.messages.create(**kwargs)

        return LLMResponse(
            content=response.content[0].text,
            model=response.model,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
            raw=response,
        )
