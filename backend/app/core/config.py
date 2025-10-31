from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    app_name: str = "Proximity TestLab API"
    env: str = "dev"
    secret_key: str = "CHANGE_ME"
    # Use SQLite by default for local development; override via env in Docker/Prod
    database_url: str = "sqlite:///./proximity.db"
    redis_url: str = "redis://redis:6379/0"
    
    # OpenAI API Key - Required for AI-powered test generation
    openai_api_key: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        
    def validate_openai_key(self) -> bool:
        """Validate that OpenAI API key is configured"""
        if not self.openai_api_key or self.openai_api_key == "":
            return False
        return True

@lru_cache
def get_settings() -> Settings:
    return Settings()
