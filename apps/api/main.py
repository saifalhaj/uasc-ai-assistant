import os
import uuid
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from dependencies import build_container
from interfaces.database import UserRecord
from routers import auth_router, chat_router, documents_router, upload_router
from routers.auth import make_salt_and_hash


# ── Seed users ─────────────────────────────────────────────────────────────────

_SEED_USERS = [
    ("uasc-L02", "L02", "L2", "Operator", "L2 · OPERATOR"),
    ("uasc-L03", "L03", "L3", "Analyst",  "L3 · ANALYST"),
    ("uasc-L04", "L04", "L4", "Ops Lead", "L4 · OPS-LEAD"),
]


async def _seed_users(db) -> None:
    """Create default station accounts if they don't exist yet."""
    for station_id, password, level, name, clearance in _SEED_USERS:
        existing = await db.get_user_by_station(station_id)
        if not existing:
            salt, pw_hash = make_salt_and_hash(password)
            await db.create_user(UserRecord(
                id=str(uuid.uuid4()),
                station_id=station_id,
                password_hash=pw_hash,
                password_salt=salt,
                level=level,
                display_name=name,
                clearance_label=clearance,
            ))


# ── App lifecycle ──────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    container = await build_container()
    await _seed_users(container.database)
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

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(documents_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "uasc-agent-api"}
