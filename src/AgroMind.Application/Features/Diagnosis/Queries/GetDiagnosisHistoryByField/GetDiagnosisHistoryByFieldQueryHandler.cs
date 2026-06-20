using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Application.Features.Diagnosis.Commands.CreateDiagnosis;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Diagnosis.Queries.GetDiagnosisHistoryByField;

public class GetDiagnosisHistoryByFieldQueryHandler
    : IRequestHandler<GetDiagnosisHistoryByFieldQuery, Result<List<DiagnosisResponse>>>
{
    private readonly IApplicationDbContext _context;

    public GetDiagnosisHistoryByFieldQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<DiagnosisResponse>>> Handle(
        GetDiagnosisHistoryByFieldQuery request,
        CancellationToken cancellationToken)
    {
        var fieldExists = await _context.Fields
            .AnyAsync(f => f.Id == request.FieldId && f.Farm.UserId == request.UserId, cancellationToken);

        if (!fieldExists)
            return Result<List<DiagnosisResponse>>.Fail("Talhão não encontrado.");

        var historico = await _context.Diagnoses
            .Where(d => d.FieldId == request.FieldId)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new DiagnosisResponse(d.Id, d.Resultado, d.Confianca, d.Recomendacao, d.CreatedAt))
            .ToListAsync(cancellationToken);

        return Result<List<DiagnosisResponse>>.Ok(historico);
    }
}