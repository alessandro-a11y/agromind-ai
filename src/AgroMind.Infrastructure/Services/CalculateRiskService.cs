using AgroMind.Application.Common.Interfaces;
using AgroMind.Domain.Entities;
using AgroMind.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AgroMind.Infrastructure.Services;

public sealed class CalculateRiskService : ICalculateRiskService
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<CalculateRiskService> _logger;

    public CalculateRiskService(
        IApplicationDbContext context,
        IEmailService emailService,
        ILogger<CalculateRiskService> logger)
    {
        _context = context;
        _emailService = emailService;
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
            const RiskLevel severity = RiskLevel.High;
            riskLevel = Escalate(riskLevel, severity);
            await CreateAlertIfNotActiveAsync(
                farm.Id,
                AlertType.Drought,
                severity,
                $"Umidade crítica de {cache.Humidity:F1}% detectada na fazenda {farm.Nome}.",
                cancellationToken,
                fieldId: null);
        }

        // Geada: temperatura abaixo de 2°C
        if (cache.Temperature < 2)
        {
            const RiskLevel severity = RiskLevel.Critical;
            riskLevel = Escalate(riskLevel, severity);
            await CreateAlertIfNotActiveAsync(
                farm.Id,
                AlertType.Frost,
                severity,
                $"Risco de geada: temperatura de {cache.Temperature:F1}°C na fazenda {farm.Nome}.",
                cancellationToken,
                fieldId: null);
        }

        // Chuva extrema: probabilidade acima de 85%
        if (cache.RainProbability > 85)
        {
            const RiskLevel severity = RiskLevel.High;
            riskLevel = Escalate(riskLevel, severity);
            await CreateAlertIfNotActiveAsync(
                farm.Id,
                AlertType.HeavyRain,
                severity,
                $"Alta probabilidade de chuva intensa ({cache.RainProbability:F0}%) na fazenda {farm.Nome}.",
                cancellationToken,
                fieldId: null);
        }

        // Praga: umidade alta + temperatura em faixa favoravel ao desenvolvimento de pragas.
        if (cache.Humidity > 70 && cache.Temperature is >= 18 and <= 30)
        {
            var severity = cache.Humidity > 85 ? RiskLevel.High : RiskLevel.Medium;
            riskLevel = Escalate(riskLevel, severity);
            await CreateAlertIfNotActiveAsync(
                farm.Id,
                AlertType.Pest,
                severity,
                $"Condições favoráveis a pragas: umidade de {cache.Humidity:F0}% e temperatura de {cache.Temperature:F1}°C na fazenda {farm.Nome}.",
                cancellationToken,
                fieldId: null);
        }

        // Vento forte: acima de 60 km/h — so escala o risco agregado, nao existe AlertType.Wind ainda.
        if (cache.WindSpeed > 60)
        {
            riskLevel = Escalate(riskLevel, RiskLevel.Medium);
        }

        // pH baixo: propriedade do talhao, nao da fazenda/clima — avaliado por Field.
        var fields = await _context.Fields
            .AsNoTracking()
            .Where(f => f.FarmId == farm.Id)
            .ToListAsync(cancellationToken);

        foreach (var field in fields)
        {
            if (field.Ph >= 5.5) continue;

            var severity = field.Ph < 5.0 ? RiskLevel.High : RiskLevel.Medium;
            riskLevel = Escalate(riskLevel, severity);
            await CreateAlertIfNotActiveAsync(
                farm.Id,
                AlertType.LowPH,
                severity,
                $"pH do solo em {field.Ph:F1} no talhão {field.Nome}, abaixo do ideal.",
                cancellationToken,
                fieldId: field.Id);
        }

        _logger.LogInformation(
            "Risk calculated for farm {FarmId}: {RiskLevel}",
            farm.Id, riskLevel);

        return riskLevel;
    }

    private static RiskLevel Escalate(RiskLevel current, RiskLevel candidate) =>
        candidate > current ? candidate : current;

    private async Task CreateAlertIfNotActiveAsync(
        Guid farmId,
        AlertType tipo,
        RiskLevel severity,
        string descricao,
        CancellationToken cancellationToken,
        Guid? fieldId)
    {
        var alreadyActive = await _context.Alerts
            .AnyAsync(
                a => a.FarmId == farmId &&
                     a.Tipo == tipo &&
                     a.Status == AlertStatus.Active &&
                     a.FieldId == fieldId,
                cancellationToken);

        if (alreadyActive) return;

        var alert = new Alert(farmId, tipo, descricao, severity, fieldId);
        await _context.Alerts.AddAsync(alert, cancellationToken);

        _logger.LogInformation(
            "Alert created for farm {FarmId} field {FieldId}: {AlertType} ({Severity})",
            farmId, fieldId, tipo, severity);

        // Dispara e-mail — busca contato do dono da fazenda sem depender de navegacao ja carregada.
        var contact = await _context.Farms
            .AsNoTracking()
            .Where(f => f.Id == farmId)
            .Select(f => new { f.Nome, f.User.Email })
            .FirstOrDefaultAsync(cancellationToken);

        if (contact is not null && !string.IsNullOrWhiteSpace(contact.Email))
        {
            await _emailService.SendAlertAsync(
                contact.Email,
                contact.Nome,
                TipoLabel(tipo),
                descricao);
        }
    }

    private static string TipoLabel(AlertType tipo) => tipo switch
    {
        AlertType.Drought   => "Seca",
        AlertType.Frost     => "Geada",
        AlertType.HeavyRain => "Chuva Extrema",
        AlertType.LowPH     => "pH Baixo",
        AlertType.Pest      => "Praga",
        _                   => tipo.ToString()
    };
}
