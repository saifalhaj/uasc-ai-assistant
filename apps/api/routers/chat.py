"""Chat / query routes + per-user thread history.

POST /chat              — answer a question; persists to the caller's thread.
                          If session_id is absent, creates a new thread titled
                          from the question.
GET  /chats             — list the current user's threads (newest first).
GET  /chats/{id}        — full thread (Q+A turns) for rehydration.
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from dependencies import Container, get_container
from interfaces.database import ChatMessageRecord, ChatSessionRecord
from middleware.auth import AuthUser, can_see_restricted, get_current_user
from models.schemas import (
    AnswerEnvelope,
    ChatRequest,
    ChatSessionOut,
    ChatThreadOut,
    ChatTurnOut,
)

router = APIRouter(tags=["chat"])

_TITLE_MAX = 64


def _title_from_question(q: str) -> str:
    cleaned = " ".join(q.split())
    return cleaned[: _TITLE_MAX - 1] + "…" if len(cleaned) > _TITLE_MAX else cleaned


def _scrub_envelope_for(level: str, env: dict) -> dict:
    """Strip restricted citations from a stored envelope for non-L4 viewers.
    Defence in depth: threads are user-scoped, so this only matters if a user
    is demoted L4 → L3 between writing and reading their own thread.
    """
    if can_see_restricted(level):
        return env
    cits = env.get("citations") or []
    env = dict(env)
    env["citations"] = [c for c in cits if c.get("classification") != "restricted"]
    return env


# ── POST /chat ────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=AnswerEnvelope)
async def chat(
    request: ChatRequest,
    user: AuthUser = Depends(get_current_user),
    container: Container = Depends(get_container),
) -> AnswerEnvelope:
    try:
        envelope = await container.agent.query(
            request=request,
            user_id=user.id,
            level=user.level,
        )

        # Resolve or create the thread for this user
        session_id = request.session_id
        now = datetime.now(timezone.utc)
        if session_id:
            existing = await container.database.get_chat_session(session_id)
            if not existing or existing.user_id != user.id:
                raise HTTPException(status_code=404, detail="Chat thread not found")
        else:
            session_id = str(uuid.uuid4())
            await container.database.create_chat_session(ChatSessionRecord(
                id=session_id,
                user_id=user.id,
                title=_title_from_question(request.question),
                created_at=now,
                updated_at=now,
            ))

        # Persist user message + assistant envelope
        await container.database.insert_chat_message(ChatMessageRecord(
            id=str(uuid.uuid4()),
            session_id=session_id,
            role="user",
            content=request.question,
            envelope=None,
            created_at=now,
        ))
        await container.database.insert_chat_message(ChatMessageRecord(
            id=str(uuid.uuid4()),
            session_id=session_id,
            role="assistant",
            content=envelope.answer,
            envelope=envelope.model_dump(mode="json"),
            created_at=now,
        ))
        await container.database.touch_chat_session(session_id)

        envelope.session_id = session_id
        return envelope
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ── GET /chats ────────────────────────────────────────────────────────────────

@router.get("/chats", response_model=list[ChatSessionOut])
async def list_chats(
    limit: int = 50,
    user: AuthUser = Depends(get_current_user),
    container: Container = Depends(get_container),
) -> list[ChatSessionOut]:
    sessions = await container.database.list_chat_sessions(user.id, limit=limit)
    return [
        ChatSessionOut(
            id=s.id,
            title=s.title,
            created_at=s.created_at.isoformat(),
            updated_at=s.updated_at.isoformat(),
        )
        for s in sessions
    ]


# ── GET /chats/{id} ───────────────────────────────────────────────────────────

@router.get("/chats/{session_id}", response_model=ChatThreadOut)
async def get_chat(
    session_id: str,
    user: AuthUser = Depends(get_current_user),
    container: Container = Depends(get_container),
) -> ChatThreadOut:
    session = await container.database.get_chat_session(session_id)
    if not session or session.user_id != user.id:
        raise HTTPException(status_code=404, detail="Chat thread not found")

    messages = await container.database.list_chat_messages(session_id)

    # Pair user → assistant by order. Skip orphans gracefully.
    turns: list[ChatTurnOut] = []
    pending_q: str | None = None
    for m in messages:
        if m.role == "user":
            pending_q = m.content
        elif m.role == "assistant" and pending_q is not None and m.envelope:
            env_dict = _scrub_envelope_for(user.level, m.envelope)
            env_dict.setdefault("session_id", session_id)
            turns.append(ChatTurnOut(
                question=pending_q,
                envelope=AnswerEnvelope(**env_dict),
            ))
            pending_q = None

    return ChatThreadOut(
        session=ChatSessionOut(
            id=session.id,
            title=session.title,
            created_at=session.created_at.isoformat(),
            updated_at=session.updated_at.isoformat(),
        ),
        turns=turns,
    )
