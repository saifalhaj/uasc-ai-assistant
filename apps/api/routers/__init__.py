from .auth import router as auth_router
from .upload import router as upload_router
from .chat import router as chat_router
from .documents import router as documents_router

__all__ = ["auth_router", "upload_router", "chat_router", "documents_router"]
