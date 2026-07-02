using AgroMind.Domain.Enums;

namespace AgroMind.Application.Common.Models;

public sealed record AiDiagnosisResult(
    string Diagnosis,
    RiskLevel RiskLevel,
    IReadOnlyList<string> Recommendations,
    double Confidence);
