from typing import Literal

from pydantic import BaseModel, Field, field_validator


RiskLevel = Literal["Low", "Medium", "High", "Critical"]


class DiagnosisRequest(BaseModel):
    crop_name: str = Field(..., min_length=1, alias="cropName")
    soil_ph: float = Field(..., ge=0, le=14, alias="soilPh")
    temperature: float = Field(..., alias="temperature")
    humidity: float = Field(..., ge=0, le=100, alias="humidity")
    wind_speed: float = Field(..., ge=0, alias="windSpeed")
    rain_probability: float = Field(..., ge=0, le=100, alias="rainProbability")
    previous_critical_diagnoses_count: int = Field(
        0,
        ge=0,
        alias="previousCriticalDiagnosesCount",
    )

    model_config = {"populate_by_name": True}

    @field_validator("crop_name")
    @classmethod
    def normalize_crop_name(cls, value: str) -> str:
        return value.strip()


class DiagnosisResponse(BaseModel):
    diagnosis: str = Field(..., min_length=1)
    risk_level: RiskLevel = Field(..., alias="riskLevel")
    recommendations: list[str] = Field(..., min_length=1)
    confidence: float = Field(..., ge=0, le=1)

    model_config = {"populate_by_name": True}

    @field_validator("recommendations")
    @classmethod
    def validate_recommendations(cls, value: list[str]) -> list[str]:
        recommendations = [item.strip() for item in value if item.strip()]
        if not recommendations:
            raise ValueError("recommendations must contain at least one non-empty item")

        return recommendations
