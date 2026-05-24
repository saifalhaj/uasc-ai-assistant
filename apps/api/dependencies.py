"""Dependency injection container.

All external service clients are constructed once at startup and injected
via FastAPI's dependency system. Swapping implementations = change one line here.
"""

import os

from functools import lru_cache

from supabase import create_async_client

from clients import (
    CloudClient,
    CohereEmbeddingClient,
    QdrantCloudStore,
    SupabasePostgresDB,
    SupabaseStorageStore,
)
from agents import RAGAgent, Router
from interfaces import LLMClient, EmbeddingClient, VectorStore, ObjectStore, Database


class Container:
    llm: LLMClient
    embedder: EmbeddingClient
    vector_store: VectorStore
    object_store: ObjectStore
    database: Database
    router: Router
    agent: RAGAgent


_container: Container | None = None


async def build_container() -> Container:
    global _container
    if _container is not None:
        return _container

    supabase = await create_async_client(
        supabase_url=os.environ["SUPABASE_URL"],
        supabase_key=os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )

    c = Container()
    c.llm = CloudClient(
        api_key=os.environ["ANTHROPIC_API_KEY"],
        model=os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
    )
    c.embedder = CohereEmbeddingClient(api_key=os.environ["COHERE_API_KEY"])
    c.vector_store = QdrantCloudStore(
        url=os.environ["QDRANT_URL"],
        api_key=os.environ["QDRANT_API_KEY"],
    )
    c.object_store = SupabaseStorageStore(supabase)
    c.database = SupabasePostgresDB(supabase)
    c.router = Router(cloud=c.llm)
    c.agent = RAGAgent(
        router=c.router,
        embedder=c.embedder,
        vector_store=c.vector_store,
        database=c.database,
    )
    _container = c
    return c


async def get_container() -> Container:
    return await build_container()
