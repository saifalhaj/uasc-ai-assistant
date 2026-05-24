"""LLM Router.

Phase 1: always routes to cloud LLM.
Phase 3: add classification-based routing — restricted queries to LocalClient,
public/internal to CloudClient. No calling code changes required.
"""

from interfaces.llm_client import LLMClient


class Router:
    def __init__(self, cloud: LLMClient, local: LLMClient | None = None) -> None:
        self._cloud = cloud
        self._local = local  # None in Phase 1; wired in Phase 3

    def route(self, classification: str = "public") -> LLMClient:
        """Return the appropriate LLMClient for a given classification.

        Phase 1: always cloud.
        Phase 3 hook: if self._local and classification == "restricted": return self._local
        """
        return self._cloud
