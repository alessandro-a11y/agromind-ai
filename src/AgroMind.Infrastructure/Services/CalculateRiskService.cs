using AgroMind.Application.Common.Interfaces;
using AgroMind.Domain.Entities;
using AgroMind.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AgroMind.Infrastructure.Services;

public sealed class CalculateRiskService : ICalculateRiskService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CalculateRiskService> _logger;

    public CalculateRiskService(
        IApplicationDbContext context,
        ILogger<CalculateRiskService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<RiskLevel> ExecuteAsync(
        Farm farm,
        CancellationToken cancellationToken = default)
    {
        var cache = await _context.WeatherCaches
            .FirstOrDefaultAsync(w => w.FarmId == farm.Id, cancellationToken);

        if (cache is null)
        {
            _logger.LogWarning(
                "No weather cache found for farm {FarmId}. Returning Low risk.",
                farm.Id);
            return RiskLevel.Low;
        }

        var riskLevel = RiskLevel.Low;

        // Seca: umidade abaixo de 30%
        if (cache.Humidity < 30)
        {
            riskLevel = Escalate(riskLevel, RiskLevel.High);
            await CreateAlertIfNotActiveAsync(
                farm.Id,
                AlertType.Drought,
                $"Umidade crítica de {cache.Humidity:F1}% detectada na fazenda {farm.Nome}.",
                cancellationToken);
        }

        // Geada: temperatura abaixo de 2°C
        if (cache.Temperature < 2)
        {
            riskLevel = Escalate(riskLevel, RiskLevel.Critical);
            await CreateAlertIfNotActiveAsync(
                farm.Id,
                AlertType.Frost,
                $"Risco de geada: temperatura de {cache.Temperature:F1}°C na fazenda {farm.Nome}.",
                cancellationToken);
        }

        // Chuva extrema: probabilidade acima de 85%
        if (cache.RainProbability > 85)
        {
            riskLevel = Escalate(riskLevel, RiskLevel.High);
            await CreateAlertIfNotActiveAsync(
                farm.Id,
                AlertType.HeavyRain,
                $"Alta probabilidade de chuva intensa ({cache.RainProbability:F0}%) na fazenda {farm.Nome}.",
                cancellationToken);
        }

        // Vento forte: acima de 60 km/h
        if (cache.WindSpeed > 60)
        {
            riskLevel = Escalate(riskLevel, RiskLevel.Medium);
        }

        _logger.LogInformation(
            "Risk calculated for farm {FarmId}: {RiskLevel}",
            farm.Id, riskLevel);

        return riskLevel;
    }

    // Só sobe o nível, nunca desce
    private static RiskLevel Escalate(RiskLevel current, RiskLevel candidate) =>
        candidate > current ? candidate : current;

    private async Task CreateAlertIfNotActiveAsync(
        Guid farmId,
        AlertType tipo,
        string descricao,
        CancellationToken cancellationToken)
    {
        var alreadyActive = await _context.Alerts
            .AnyAsync(
                a => a.FarmId == farmId &&
                     a.Tipo == tipo &&
                     a.Status == AlertStatus.Active,
                cancellationToken);

        if (alreadyActive) return;

        var alert = new Alert(farmId, tipo, descricao);
        await _context.Alerts.AddAsync(alert, cancellationToken);

        _logger.LogInformation(
            "Alert created for farm {FarmId}: {AlertType}",
            farmId, tipo);
    }
}