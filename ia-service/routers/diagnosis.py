from fastapi import APIRouter, Depends, HTTPException, Request

from core.security import verify_api_key
from models.diagnosis import DiagnosisRequest, DiagnosisResponse
from services.exceptions import GroqServiceError
from services.groq_service import GroqService

router = APIRouter(prefix="/diagnosis", tags=["diagnosis"])


def get_groq_service(request: Request) -> GroqService:
    return request.app.state.groq_service


@router.post("", response_model=DiagnosisResponse, response_model_by_alias=True)
async def diagnose(
    req: DiagnosisRequest,
    groq_service: GroqService = Depends(get_groq_service),
    _: str = Depends(verify_api_key),
) -> DiagnosisResponse:
    try:
        return await groq_service.diagnose(req)
    except GroqServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
