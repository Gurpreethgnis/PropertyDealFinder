"""
PropertyFinder Backend API

Main FastAPI application entry point.
"""

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from api import auth_router, deals_router, news_router, underwrite_router

# Create FastAPI app
app = FastAPI(
    title="PropertyFinder API",
    description="Real estate investment analysis and deal discovery platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:9968",  # Frontend dev server
        "http://127.0.0.1:9968",  # Frontend dev server (alternative)
        "http://localhost:3000",   # Common Next.js port
        "http://127.0.0.1:3000",  # Common Next.js port (alternative)
        "http://localhost:8080",   # Backend
        "http://127.0.0.1:8080",  # Backend (alternative)
        "*"  # Fallback for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(deals_router)
app.include_router(news_router)
app.include_router(underwrite_router)

# Handle CORS preflight requests
@app.options("/{full_path:path}")
async def options_handler(request: Request):
    """Handle CORS preflight OPTIONS requests."""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "PropertyFinder API"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "PropertyFinder API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
