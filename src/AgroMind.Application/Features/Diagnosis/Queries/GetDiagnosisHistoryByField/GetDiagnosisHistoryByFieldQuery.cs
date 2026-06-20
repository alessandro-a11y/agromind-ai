using AgroMind.Application.Common.Models;
using AgroMind.Application.Features.Diagnosis.Commands.CreateDiagnosis;
using MediatR;

namespace AgroMind.Application.Features.Diagnosis.Queries.GetDiagnosisHistoryByField;

public record GetDiagnosisHistoryByFieldQuery(Guid FieldId, Guid UserId)
    : IRequest<Result<List<DiagnosisResponse>>>;