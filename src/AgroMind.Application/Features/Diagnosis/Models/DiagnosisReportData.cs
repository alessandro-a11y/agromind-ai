using AgroMind.Domain.Enums;

namespace AgroMind.Application.Features.Diagnosis.Models;

public sealed record DiagnosisReportData(
    string FarmNome,
    string FieldNome,
    string TipoSolo,
    double Ph,
    double Area,
    string CropNome,
    string UserNome,
    RiskLevel Resultado,
    double Confianca,
    string Recomendacao,
    DateTime CreatedAt);
