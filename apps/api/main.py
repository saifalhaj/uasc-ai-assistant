import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from dependencies import build_container
from routers import chat_router, documents_router, upload_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await build_container()
    yield


app = FastAPI(
    title="UASC Agent API",
    description="Hybrid LLM agent for Unmanned Aerial Systems Center, Dubai Police",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(documents_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "uasc-agent-api"}
