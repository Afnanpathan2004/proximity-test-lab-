from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "Proximity TestLab API"
    env: str = "dev"
    secret_key: str = "CHANGE_ME"
    # Use SQLite by default for local development; override via env in Docker/Prod
    database_url: str = "sqlite:///./proximity.db"
    redis_url: str = "redis://redis:6379/0"
    openai_api_key: str | None = None

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
