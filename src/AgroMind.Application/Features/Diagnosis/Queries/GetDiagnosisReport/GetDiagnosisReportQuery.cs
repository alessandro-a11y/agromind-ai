using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Diagnosis.Queries.GetDiagnosisReport;

public record GetDiagnosisReportQuery(Guid FieldId, Guid DiagnosisId, Guid UserId)
    : IRequest<Result<byte[]>>;
