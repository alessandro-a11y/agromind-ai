using AgroMind.Domain.Enums;

namespace AgroMind.Application.Features.Diagnosis.Models;

public sealed record DiagnosisHistoryReportData(
    string FarmNome,
    string FieldNome,
    string TipoSolo,
    double Ph,
    double Area,
    string UserNome,
    IReadOnlyList<DiagnosisHistoryItem> Historico);

public sealed record DiagnosisHistoryItem(
    RiskLevel Resultado,
    double Confianca,
    string Recomendacao,
    DateTime CreatedAt);
