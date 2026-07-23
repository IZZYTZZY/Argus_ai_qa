from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Argus API"
    database_url: str = "postgresql+psycopg://argus:argus@localhost:5432/argus"
    supabase_url: str = ""
    supabase_jwt_secret: str = ""
    llm_api_key: str = ""
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"
    cors_origins: str = "http://localhost:3000"
    redis_url: str = ""

    class Config:
        env_file = ".env"

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
