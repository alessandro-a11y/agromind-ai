from pydantic import BaseModel, Field
from typing import Any, Optional


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: list[ChatMessage] = Field(default_factory=list)
    farm_context: Optional[list[dict[str, Any]]] = None


class ChatResponse(BaseModel):
    reply: str
    tokens_used: Optional[int] = None