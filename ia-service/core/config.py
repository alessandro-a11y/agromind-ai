import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    groq_api_key: str
    groq_model: str
    groq_temperature: float
    groq_timeout_seconds: float
    groq_base_url: str
    internal_api_key: str
    environment: str


def _get_float(name: str, default: float) -> float:
    value = os.getenv(name)
    if value is None or value.strip() == "":
        return default

    try:
        return float(value)
    except ValueError:
        return default


def get_settings() -> Settings:
    return Settings(
        groq_api_key=os.getenv("GROQ_API_KEY", "").strip(),
        groq_model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip(),
        groq_temperature=_get_float("GROQ_TEMPERATURE", 0.2),
        groq_timeout_seconds=_get_float("GROQ_TIMEOUT_SECONDS", 30.0),
        groq_base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").strip(),
        internal_api_key=os.getenv("INTERNAL_API_KEY", "dev-key-local").strip(),
        environment=os.getenv("ENVIRONMENT", "development").strip(),
    )
