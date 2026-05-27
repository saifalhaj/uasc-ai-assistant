"""Authentication routes.

POST /auth/login  — validate credentials, create session
GET  /auth/me     — return current user (session_id via X-Session-Id header)
POST /auth/logout — invalidate session
"""

import hashlib
from datetime import datetime, timedelta, timezone
import secrets as _secrets

from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel

from dependencies import Container, get_container

router = APIRouter(prefix="/auth", tags=["auth"])

SESSION_TTL_HOURS = 24


# ── helpers ────────────────────────────────────────────────────────────────────

def _hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000,
    ).hex()


def make_salt_and_hash(password: str) -> tuple[str, str]:
    salt = _secrets.token_hex(16)
    return salt, _hash_password(password, salt)


# ── schemas ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    stationId: str
    passphrase: str


class UserOut(BaseModel):
    stationId: str
    displayName: str
    level: str           # "L2" | "L3" | "L4"
    clearanceLabel: str  # e.g. "L4 · OPS-LEAD"


class LoginResponse(BaseModel):
    sessionId: str
    user: UserOut


# ── routes ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    container: Container = Depends(get_container),
) -> LoginResponse:
    user = await container.database.get_user_by_station(body.stationId)
    if not user:
        raise HTTPException(status_code=403, detail="AUTH-403 · Invalid station ID or passphrase.")

    expected_hash = _hash_password(body.passphrase, user.password_salt)
    if expected_hash != user.password_hash:
        raise HTTPException(status_code=403, detail="AUTH-403 · Invalid station ID or passphrase.")

    session_id = _secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=SESSION_TTL_HOURS)
    await container.database.create_session(session_id, user.id, expires_at)

    return LoginResponse(
        sessionId=session_id,
        user=UserOut(
            stationId=user.station_id,
            displayName=user.display_name,
            level=user.level,
            clearanceLabel=user.clearance_label,
        ),
    )


@router.get("/me", response_model=UserOut)
async def me(
    x_session_id: str | None = Header(default=None),
    container: Container = Depends(get_container),
) -> UserOut:
    """Called by the Next.js BFF; session ID passed in X-Session-Id header."""
    if not x_session_id:
        raise HTTPException(status_code=401, detail="No session")
    user = await container.database.get_session_user(x_session_id)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    return UserOut(
        stationId=user.station_id,
        displayName=user.display_name,
        level=user.level,
        clearanceLabel=user.clearance_label,
    )


@router.post("/logout")
async def logout(
    x_session_id: str | None = Header(default=None),
    container: Container = Depends(get_container),
) -> dict:
    if x_session_id:
        await container.database.delete_session(x_session_id)
    return {"ok": True}
