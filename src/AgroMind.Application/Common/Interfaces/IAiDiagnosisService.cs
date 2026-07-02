using AgroMind.Application.Common.Models;

namespace AgroMind.Application.Common.Interfaces;

public interface IAiDiagnosisService
{
    Task<AiDiagnosisOutcome> DiagnoseAsync(
        AiDiagnosisRequest request,
        CancellationToken cancellationToken);
}
