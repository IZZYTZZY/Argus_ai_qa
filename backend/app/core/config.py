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
    # Embeddings can live on a different provider than chat (e.g. chat on
    # OpenRouter/Groq, which serve no /embeddings route). Blank = reuse the LLM_* values.
    embedding_base_url: str = ""
    embedding_api_key: str = ""
    # Some providers (e.g. Gemini) allow requesting an output size.
    # Must equal the vector(N) column in the schema. 0 = provider default.
    embedding_dimensions: int = 0
    cors_origins: str = "http://localhost:3000"
    redis_url: str = ""

    class Config:
        env_file = ".env"

    @property
    def embed_base_url(self) -> str:
        return self.embedding_base_url or self.llm_base_url

    @property
    def embed_api_key(self) -> str:
        return self.embedding_api_key or self.llm_api_key

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()