using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Diagnosis.Queries.GetDiagnosisHistoryReport;

public record GetDiagnosisHistoryReportQuery(Guid FieldId, Guid UserId)
    : IRequest<Result<byte[]>>;
