using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Enums;
using AgroMind.Domain.Services;
using AgroMind.Domain.Services.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Diagnosis.Commands.CreateDiagnosis;

public class CreateDiagnosisCommandHandler
    : IRequestHandler<CreateDiagnosisCommand, Result<DiagnosisResponse>>
{
    private readonly IApplicationDbContext _context;

    public CreateDiagnosisCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DiagnosisResponse>> Handle(
        CreateDiagnosisCommand request,
        CancellationToken cancellationToken)
    {
        var field = await _context.Fields
            .Include(f => f.Farm)
            .Include(f => f.Crops)
            .FirstOrDefaultAsync(
                f => f.Id == request.FieldId && f.Farm.UserId == request.UserId,
                cancellationToken);

        if (field is null)
            return Result<DiagnosisResponse>.Fail("Talhão não encontrado.");

        var cultivoAtual = field.Crops
            .Where(c => c.DataColheita == null)
            .OrderByDescending(c => c.DataPlantio)
            .FirstOrDefault();

        if (cultivoAtual is null)
            return Result<DiagnosisResponse>.Fail("Nenhuma cultura ativa cadastrada para este talhão.");

        var weather = await _context.WeatherCaches
            .FirstOrDefaultAsync(w => w.FarmId == field.FarmId, cancellationToken);

        var diagnosticosCriticosRecentes = await _context.Diagnoses
            .Where(d => d.FieldId == field.Id && d.Resultado == RiskLevel.Critical)
            .CountAsync(cancellationToken);

        var input = new DiagnosisInput(
            CropName: cultivoAtual.Nome,
            SoilPh: field.Ph,
            Temperature: weather?.Temperature ?? 25,
            Humidity: weather?.Humidity ?? 60,
            WindSpeed: weather?.WindSpeed ?? 10,
            RainProbability: weather?.RainProbability ?? 20,
            PreviousCriticalDiagnosesCount: diagnosticosCriticosRecentes);

        var resultado = DiagnosisEngine.Diagnose(input);

        var diagnosis = new Domain.Entities.Diagnosis(
            field.Id, resultado.Resultado, resultado.Confianca, resultado.Recomendacao);

        _context.Diagnoses.Add(diagnosis);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DiagnosisResponse>.Ok(new DiagnosisResponse(
            diagnosis.Id, diagnosis.Resultado, diagnosis.Confianca, diagnosis.Recomendacao, diagnosis.CreatedAt));
    }
}