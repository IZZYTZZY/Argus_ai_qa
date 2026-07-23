"""OpenAI-compatible LLM abstraction.

Chat and embeddings are configured independently, because many gateways
(OpenRouter, Groq, Together) serve /chat/completions but no /embeddings route.
Leave the EMBEDDING_* vars blank to reuse the LLM_* provider for both.
"""
import json
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import get_settings


def _chat_client() -> OpenAI:
    s = get_settings()
    return OpenAI(api_key=s.llm_api_key or "not-set", base_url=s.llm_base_url)


def _embed_client() -> OpenAI:
    s = get_settings()
    return OpenAI(api_key=s.embed_api_key or "not-set", base_url=s.embed_base_url)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
def complete(system: str, user: str, json_mode: bool = False, temperature: float = 0.2) -> str:
    s = get_settings()
    kwargs = {"response_format": {"type": "json_object"}} if json_mode else {}
    resp = _chat_client().chat.completions.create(
        model=s.llm_model,
        temperature=temperature,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        **kwargs,
    )
    return resp.choices[0].message.content or ""


def complete_json(system: str, user: str, temperature: float = 0.2) -> dict:
    raw = complete(system + "\nRespond ONLY with valid JSON.", user, json_mode=True, temperature=temperature)
    return _parse_json(raw)


def _parse_json(raw: str) -> dict:
    """Tolerant JSON parse — some providers wrap output in prose or fences."""
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    cleaned = raw.strip()
    if "```" in cleaned:
        # take the largest fenced block
        parts = [p for p in cleaned.split("```") if p.strip()]
        for p in sorted(parts, key=len, reverse=True):
            candidate = p.removeprefix("json").strip()
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                continue
    # last resort: slice from first brace to last
    start, end = cleaned.find("{"), cleaned.rfind("}")
    if start != -1 and end > start:
        return json.loads(cleaned[start : end + 1])
    raise ValueError(f"Model did not return JSON. Got: {raw[:200]}")


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
def embed(texts: list[str]) -> list[list[float]]:
    s = get_settings()
    kwargs = {}
    if s.embedding_dimensions:
        kwargs["dimensions"] = s.embedding_dimensions
    resp = _embed_client().embeddings.create(model=s.embedding_model, input=texts, **kwargs)
    return [d.embedding for d in resp.data]