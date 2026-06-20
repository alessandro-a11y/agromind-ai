using AgroMind.Domain.Enums;

namespace AgroMind.Domain.Services.Models;

public sealed record DiagnosisResult(
    RiskLevel Resultado,
    double Confianca,
    string Recomendacao);
