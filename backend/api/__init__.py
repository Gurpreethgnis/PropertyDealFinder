"""
API package initialization.
"""

from .auth import router as auth_router
from .deals import router as deals_router
from .news import router as news_router
from .underwrite import router as underwrite_router

__all__ = ["auth_router", "deals_router", "news_router", "underwrite_router"]
