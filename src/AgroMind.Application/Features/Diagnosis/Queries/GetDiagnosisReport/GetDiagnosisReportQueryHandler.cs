using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Application.Features.Diagnosis.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Diagnosis.Queries.GetDiagnosisReport;

public class GetDiagnosisReportQueryHandler
    : IRequestHandler<GetDiagnosisReportQuery, Result<byte[]>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDiagnosisReportService _reportService;

    public GetDiagnosisReportQueryHandler(
        IApplicationDbContext context,
        IDiagnosisReportService reportService)
    {
        _context = context;
        _reportService = reportService;
    }

    public async Task<Result<byte[]>> Handle(
        GetDiagnosisReportQuery request,
        CancellationToken cancellationToken)
    {
        var field = await _context.Fields
            .Include(f => f.Farm)
                .ThenInclude(fa => fa.User)
            .Include(f => f.Crops)
            .FirstOrDefaultAsync(
                f => f.Id == request.FieldId && f.Farm.UserId == request.UserId,
                cancellationToken);

        if (field is null)
            return Result<byte[]>.Fail("Talhão não encontrado.");

        var diagnosis = await _context.Diagnoses
            .FirstOrDefaultAsync(
                d => d.Id == request.DiagnosisId && d.FieldId == field.Id,
                cancellationToken);

        if (diagnosis is null)
            return Result<byte[]>.Fail("Diagnóstico não encontrado.");

        var cultivoAtual = field.Crops
            .Where(c => c.DataColheita == null)
            .OrderByDescending(c => c.DataPlantio)
            .FirstOrDefault();

        var data = new DiagnosisReportData(
            field.Farm.Nome,
            field.Nome,
            field.TipoSolo,
            field.Ph,
            field.Area,
            cultivoAtual?.Nome ?? "Não informado",
            field.Farm.User.Nome,
            diagnosis.Resultado,
            diagnosis.Confianca,
            diagnosis.Recomendacao,
            diagnosis.CreatedAt);

        var pdf = _reportService.GenerateDiagnosisReport(data);

        return Result<byte[]>.Ok(pdf);
    }
}
