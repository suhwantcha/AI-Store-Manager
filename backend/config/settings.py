"""
Application configuration via pydantic-settings.
All environment variables and model names are centralized here.
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# Project root is three levels up from this file (backend/config/settings.py -> backend/config -> backend -> project root)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # WARNING: Secrets like OPENAI_API_KEY and DATABASE_URL must NEVER be hardcoded 
    # in source code. They are loaded securely from the .env file.
    
    # --- Environment & Debug ---
    DEBUG: bool = False
    
    # --- Database ---
    DATABASE_URL: str = "postgresql://postgres:postgres@127.0.0.1:5433/ai_store_manager"
    DB_NAME: str = "ai_store_manager"
    @property
    def DATABASE_URL_PSYCOPG2(self) -> str:
        """Connection string for legacy psycopg2 code."""
        # Swap postgresql:// for postgresql+psycopg2:// if needed, or keep original
        if self.DATABASE_URL.startswith("postgresql://"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
        return self.DATABASE_URL

    # --- OpenAI ---
    OPENAI_API_KEY: str = ""

    # --- OpenAI Model Configuration ---
    # Small: fast, cheap — CS replies, review drafts, sentiment
    OPENAI_SMALL_MODEL: str = "gpt-4o-mini"
    # Large: high quality — BI copilot, complex analysis
    OPENAI_LARGE_MODEL: str = "gpt-4o"
    # Reasoning: chain-of-thought — future multi-step planning
    OPENAI_REASONING_MODEL: str = "o3-mini"

    # --- Per-Agent Model Assignment ---
    # Each agent graph references these. Change here to upgrade models globally.
    CS_AGENT_MODEL: str = "gpt-4o-mini"
    REVIEW_AGENT_MODEL: str = "gpt-4o-mini"
    COPILOT_AGENT_MODEL: str = "gpt-4o"
    BRIEFING_MODEL: str = "gpt-4o-mini"

    # --- ChromaDB ---
    CHROMA_DB_PATH: str = str(PROJECT_ROOT / "chroma_data")
    CHROMA_COLLECTION_NAME: str = "smart_store_data"

    # --- Caching ---
    DISKCACHE_DIR: str = str(PROJECT_ROOT / ".cache" / "ai_responses")
    CACHE_TTL: int = 14400  # 4 hours in seconds

    # --- Paths ---
    DATA_DIR: str = str(PROJECT_ROOT / "data")


settings = Settings()
