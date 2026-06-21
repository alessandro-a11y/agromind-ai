using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Application.Features.Diagnosis.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Diagnosis.Queries.GetDiagnosisHistoryReport;

public class GetDiagnosisHistoryReportQueryHandler
    : IRequestHandler<GetDiagnosisHistoryReportQuery, Result<byte[]>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDiagnosisReportService _reportService;

    public GetDiagnosisHistoryReportQueryHandler(
        IApplicationDbContext context,
        IDiagnosisReportService reportService)
    {
        _context = context;
        _reportService = reportService;
    }

    public async Task<Result<byte[]>> Handle(
        GetDiagnosisHistoryReportQuery request,
        CancellationToken cancellationToken)
    {
        var field = await _context.Fields
            .Include(f => f.Farm)
                .ThenInclude(fa => fa.User)
            .FirstOrDefaultAsync(
                f => f.Id == request.FieldId && f.Farm.UserId == request.UserId,
                cancellationToken);

        if (field is null)
            return Result<byte[]>.Fail("Talhão não encontrado.");

        var historico = await _context.Diagnoses
            .Where(d => d.FieldId == field.Id)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new DiagnosisHistoryItem(d.Resultado, d.Confianca, d.Recomendacao, d.CreatedAt))
            .ToListAsync(cancellationToken);

        var data = new DiagnosisHistoryReportData(
            field.Farm.Nome,
            field.Nome,
            field.TipoSolo,
            field.Ph,
            field.Area,
            field.Farm.User.Nome,
            historico);

        var pdf = _reportService.GenerateHistoryReport(data);

        return Result<byte[]>.Ok(pdf);
    }
}
