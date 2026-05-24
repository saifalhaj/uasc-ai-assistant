"""Stubbed auth middleware.

Phase 1: returns a mock user with identity and clearance tier.
Phase 2: swap in Supabase Auth or Entra ID — no calling code changes.
"""

from dataclasses import dataclass

from fastapi import Request


@dataclass
class AuthUser:
    id: str
    email: str
    clearance: str  # public | internal | restricted


async def get_current_user(request: Request) -> AuthUser:
    """Mock auth — always returns a stub user.

    Phase 2: validate JWT from Authorization header against Supabase Auth / Entra ID.
    """
    return AuthUser(
        id="mock-user-001",
        email="officer@dubaipolice.gov.ae",
        clearance="internal",
    )
