"""Chat / query routes."""

from fastapi import APIRouter, Depends

from dependencies import Container, get_container
from middleware.auth import AuthUser, get_current_user
from models.schemas import AnswerEnvelope, ChatRequest

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=AnswerEnvelope)
async def chat(
    request: ChatRequest,
    user: AuthUser = Depends(get_current_user),
    container: Container = Depends(get_container),
) -> AnswerEnvelope:
    return await container.agent.query(
        request=request,
        user_id=user.id,
        clearance=user.clearance,
    )
