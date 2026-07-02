from fastapi import APIRouter, Depends, HTTPException, Request
from models.chat import ChatRequest, ChatResponse
from core.security import verify_api_key
from services.exceptions import GroqServiceError
from services.groq_service import GroqService

router = APIRouter(prefix="/chat", tags=["chat"])


def get_groq_service(request: Request) -> GroqService:
    return request.app.state.groq_service


@router.post("", response_model=ChatResponse)
async def send_message(
    req: ChatRequest,
    groq_service: GroqService = Depends(get_groq_service),
    _: str = Depends(verify_api_key),
) -> ChatResponse:
    try:
        reply, tokens = await groq_service.chat(req.message, req.history, req.farm_context)
        return ChatResponse(reply=reply, tokens_used=tokens)
    except GroqServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
