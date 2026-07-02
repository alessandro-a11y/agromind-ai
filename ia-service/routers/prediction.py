from fastapi import APIRouter, Depends
from models.prediction import PredictionRequest, PredictionResponse
from core.security import verify_api_key
from services.prediction_service import predict

router = APIRouter(prefix="/predict", tags=["prediction"])

@router.post("", response_model=PredictionResponse)
def predict_productivity(req: PredictionRequest, _=Depends(verify_api_key)):
    prod, confianca, recomendacoes = predict(req)
    return PredictionResponse(
        produtividade_estimada=prod,
        confianca=confianca,
        recomendacoes=recomendacoes
    )
