"""Session-based auth middleware.

Reads the `uasc_session` cookie set by the Next.js BFF (or, for non-browser
clients, `Authorization: Bearer <session_id>`) and resolves it against the
Supabase `sessions` table the BFF writes to. Returns the authenticated user
with their station ID, display name, and access level.
"""

from dataclasses import dataclass

from fastapi import Cookie, Depends, Header, HTTPException, status

from dependencies import Container, get_container


@dataclass
class AuthUser:
    id: str
    station_id: str
    display_name: str
    level: str            # 'L2' | 'L3' | 'L4'
    clearance_label: str  # e.g. 'L4 · OPS-LEAD'


def can_see_restricted(level: str) -> bool:
    """Only L4 may see classification=restricted content."""
    return level == "L4"


def _bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


async def get_current_user(
    uasc_session: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    container: Container = Depends(get_container),
) -> AuthUser:
    session_id = uasc_session or _bearer_token(authorization)
    if not session_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No session")
    user = await container.database.get_session_user(session_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")
    return AuthUser(
        id=user.id,
        station_id=user.station_id,
        display_name=user.display_name,
        level=user.level,
        clearance_label=user.clearance_label,
    )
