"""
VirtuLab AI - FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.seed import seed_database
from app.routers.api_router import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed demonstration data
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Interactive electronics laboratory with deterministic circuit simulation and local Ollama Gemma integration.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "message": "VirtuLab AI Backend is running.",
        "docs": "/docs",
        "ollama_endpoint": settings.OLLAMA_ENDPOINT,
        "model": settings.OLLAMA_MODEL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
