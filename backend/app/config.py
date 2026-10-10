"""
VirtuLab AI - Backend Configuration
Configures local Ollama endpoint, model name, SQLite database, and CORS.
"""

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "VirtuLab AI — The Virtual Engineering Laboratory"
    API_V1_STR: str = "/api"
    
    # Ollama Configuration (Local Gemma)
    OLLAMA_ENDPOINT: str = os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "gemma3:4b")
    OLLAMA_TIMEOUT_SECONDS: float = 20.0
    
    # SQLite Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./virtulab.db")
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
