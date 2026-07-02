import json
import logging
from typing import Any

import httpx
from pydantic import ValidationError

from core.config import Settings
from models.chat import ChatMessage
from models.diagnosis import DiagnosisRequest, DiagnosisResponse
from services.exceptions import (
    GroqConfigurationError,
    GroqInvalidApiKeyError,
    GroqRateLimitError,
    GroqTimeoutError,
    GroqUnexpectedResponseError,
    GroqUnavailableError,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Você é o AgroMind Assistant, um especialista agrícola brasileiro.
Ajude agricultores com diagnósticos de culturas, manejo de solo, clima e pragas.
Responda sempre em português brasileiro, de forma clara e prática.
Quando tiver contexto de fazenda, use esses dados para personalizar sua resposta.
Seja conciso mas completo. Máximo 300 palavras por resposta."""

DIAGNOSIS_SYSTEM_PROMPT = """Você é o motor de diagnóstico agrícola do AgroMind AI.
Analise os dados agronômicos recebidos e responda somente com JSON válido no formato:
{"diagnosis":"...","riskLevel":"Low|Medium|High|Critical","recommendations":["..."],"confidence":0.95}
Não inclua markdown, comentários ou campos extras."""


class GroqService:
    def __init__(self, client: httpx.AsyncClient, settings: Settings) -> None:
        self._client = client
        self._settings = settings

    async def chat(
        self,
        message: str,
        history: list[ChatMessage],
        farm_context: dict[str, Any] | None,
    ) -> tuple[str, int | None]:
        messages = [{"role": "system", "content": self._build_chat_system_prompt(farm_context)}]

        for item in history[-10:]:
            messages.append({"role": item.role, "content": item.content})

        messages.append({"role": "user", "content": message})

        payload = {
            "model": self._settings.groq_model,
            "messages": messages,
            "max_tokens": 500,
            "temperature": self._settings.groq_temperature,
        }

        data = await self._post_chat_completion(payload)
        choice = self._first_choice(data)
        reply = choice.get("message", {}).get("content")
        if not isinstance(reply, str) or not reply.strip():
            raise GroqUnexpectedResponseError()

        usage = data.get("usage", {})
        tokens = usage.get("total_tokens") if isinstance(usage, dict) else None
        return reply.strip(), tokens if isinstance(tokens, int) else None

    async def diagnose(self, request: DiagnosisRequest) -> DiagnosisResponse:
        payload = {
            "model": self._settings.groq_model,
            "messages": [
                {"role": "system", "content": DIAGNOSIS_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": json.dumps(request.model_dump(by_alias=True), ensure_ascii=False),
                },
            ],
            "temperature": self._settings.groq_temperature,
            "response_format": {"type": "json_object"},
        }

        data = await self._post_chat_completion(payload)
        choice = self._first_choice(data)
        content = choice.get("message", {}).get("content")
        if not isinstance(content, str) or not content.strip():
            raise GroqUnexpectedResponseError()

        try:
            decoded = json.loads(content)
            return DiagnosisResponse.model_validate(decoded)
        except (json.JSONDecodeError, ValidationError) as exc:
            logger.warning("groq_unexpected_diagnosis_response", exc_info=exc)
            raise GroqUnexpectedResponseError() from exc

    async def _post_chat_completion(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not self._settings.groq_api_key:
            raise GroqConfigurationError()

        headers = {
            "Authorization": f"Bearer {self._settings.groq_api_key}",
            "Content-Type": "application/json",
        }

        try:
            response = await self._client.post("/chat/completions", json=payload, headers=headers)
        except httpx.TimeoutException as exc:
            logger.warning("groq_timeout", exc_info=exc)
            raise GroqTimeoutError() from exc
        except httpx.RequestError as exc:
            logger.warning("groq_request_error", exc_info=exc)
            raise GroqUnavailableError() from exc

        if response.status_code == 401:
            logger.warning("groq_invalid_api_key")
            raise GroqInvalidApiKeyError()
        if response.status_code == 429:
            logger.warning("groq_rate_limit")
            raise GroqRateLimitError()
        if response.status_code in {500, 502, 503, 504}:
            logger.warning("groq_unavailable status_code=%s", response.status_code)
            raise GroqUnavailableError()
        if response.is_error:
            logger.warning("groq_http_error status_code=%s", response.status_code)
            raise GroqUnexpectedResponseError()

        try:
            data = response.json()
        except ValueError as exc:
            logger.warning("groq_invalid_json", exc_info=exc)
            raise GroqUnexpectedResponseError() from exc

        if not isinstance(data, dict):
            raise GroqUnexpectedResponseError()

        return data

    @staticmethod
    def _first_choice(data: dict[str, Any]) -> dict[str, Any]:
        choices = data.get("choices")
        if not isinstance(choices, list) or not choices or not isinstance(choices[0], dict):
            raise GroqUnexpectedResponseError()

        return choices[0]

    @staticmethod
    def _build_chat_system_prompt(farm_context: dict[str, Any] | None) -> str:
        if not farm_context:
            return SYSTEM_PROMPT

        return f"{SYSTEM_PROMPT}\nContexto da fazenda: {farm_context}"
