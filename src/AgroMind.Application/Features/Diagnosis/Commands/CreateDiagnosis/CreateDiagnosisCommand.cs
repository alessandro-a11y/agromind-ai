using AgroMind.Application.Common.Models;
using AgroMind.Domain.Enums;
using MediatR;

namespace AgroMind.Application.Features.Diagnosis.Commands.CreateDiagnosis;

public record CreateDiagnosisCommand(Guid FieldId, Guid UserId) : IRequest<Result<DiagnosisResponse>>;

public record DiagnosisResponse(
    Guid Id,
    RiskLevel Resultado,
    double Confianca,
    string Recomendacao,
    DateTime CreatedAt);