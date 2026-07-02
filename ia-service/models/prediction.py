from pydantic import BaseModel
from typing import Optional

class PredictionRequest(BaseModel):
    area: float           # hectares
    tipo_solo: str        # argiloso, arenoso, etc
    ph: float
    cultura: str          # soja, milho, etc
    precipitacao_mm: float
    temperatura_media: float
    risco_nivel: str      # Low, Medium, High, Critical

class PredictionResponse(BaseModel):
    produtividade_estimada: float  # ton/ha
    confianca: float               # 0-1
    recomendacoes: list[str]
