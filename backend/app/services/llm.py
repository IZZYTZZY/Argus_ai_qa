"""OpenAI-compatible LLM abstraction. Point LLM_BASE_URL at OpenAI, Azure,
Together, Groq, Ollama, or any compatible gateway without code changes."""
import json
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import get_settings


def _client() -> OpenAI:
    s = get_settings()
    return OpenAI(api_key=s.llm_api_key or "not-set", base_url=s.llm_base_url)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
def complete(system: str, user: str, json_mode: bool = False, temperature: float = 0.2) -> str:
    s = get_settings()
    kwargs = {"response_format": {"type": "json_object"}} if json_mode else {}
    resp = _client().chat.completions.create(
        model=s.llm_model,
        temperature=temperature,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        **kwargs,
    )
    return resp.choices[0].message.content or ""


def complete_json(system: str, user: str, temperature: float = 0.2) -> dict:
    raw = complete(system + "\nRespond ONLY with valid JSON.", user, json_mode=True, temperature=temperature)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```")
        return json.loads(cleaned)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
def embed(texts: list[str]) -> list[list[float]]:
    s = get_settings()
    resp = _client().embeddings.create(model=s.embedding_model, input=texts)
    return [d.embedding for d in resp.data]
