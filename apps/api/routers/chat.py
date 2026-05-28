"""Chat / query routes."""

from fastapi import APIRouter, Depends, HTTPException

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
    try:
        return await container.agent.query(
            request=request,
            user_id=user.id,
            level=user.level,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
