using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Enums;
using AgroMind.Domain.Services;
using AgroMind.Domain.Services.Models;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using AgroMind.Application.Common.Telemetry;

namespace AgroMind.Application.Features.Diagnosis.Commands.CreateDiagnosis;

public class CreateDiagnosisCommandHandler
    : IRequestHandler<CreateDiagnosisCommand, Result<DiagnosisResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IAiDiagnosisService _aiDiagnosisService;
    private readonly ILogger<CreateDiagnosisCommandHandler> _logger;

    public CreateDiagnosisCommandHandler(
        IApplicationDbContext context,
        IAiDiagnosisService aiDiagnosisService,
        ILogger<CreateDiagnosisCommandHandler> logger)
    {
        _context = context;
        _aiDiagnosisService = aiDiagnosisService;
        _logger = logger;
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

        var aiRequest = new AiDiagnosisRequest(
            input.CropName,
            input.SoilPh,
            input.Temperature,
            input.Humidity,
            input.WindSpeed,
            input.RainProbability,
            input.PreviousCriticalDiagnosesCount);

        var aiOutcome = await _aiDiagnosisService.DiagnoseAsync(aiRequest, cancellationToken);
        var resultado = aiOutcome.Success && aiOutcome.Diagnosis is not null
            ? MapAiResult(aiOutcome.Diagnosis)
            : DiagnosisEngine.Diagnose(input);

        if (!aiOutcome.Success)
        {
            _logger.LogWarning(
                "Using local diagnosis engine because AI diagnosis failed: {Reason}",
                aiOutcome.ErrorMessage);
        }

        DiagnosisMetrics.RecordDiagnosis(resultado.Resultado.ToString());

        var diagnosis = new Domain.Entities.Diagnosis(
            field.Id, resultado.Resultado, resultado.Confianca, resultado.Recomendacao);

        _context.Diagnoses.Add(diagnosis);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DiagnosisResponse>.Ok(new DiagnosisResponse(
            diagnosis.Id, diagnosis.Resultado, diagnosis.Confianca, diagnosis.Recomendacao, diagnosis.CreatedAt));
    }

    private static DiagnosisResult MapAiResult(AiDiagnosisResult result)
    {
        var recommendations = string.Join(" ", result.Recommendations);
        var recommendation = $"{result.Diagnosis} Recomendações: {recommendations}";

        return new DiagnosisResult(
            result.RiskLevel,
            Math.Clamp(result.Confidence, 0, 1),
            recommendation);
    }
}
