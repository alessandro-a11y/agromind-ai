using AgroMind.Application.Common.Interfaces;
using AgroMind.Domain.Entities;
using AgroMind.Domain.Enums;
using AgroMind.Infrastructure.Services;
using AgroMind.UnitTests.Helpers;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace AgroMind.UnitTests.Services;

public sealed class CalculateRiskServiceTests
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CalculateRiskService> _logger;
    private readonly CalculateRiskService _sut;

    private readonly Farm _farm = new(
        Guid.NewGuid(),
        "Fazenda Teste",
        "Caruaru",
        "PE",
        -8.233,
        -35.796);

    public CalculateRiskServiceTests()
    {
        _context = Substitute.For<IApplicationDbContext>();
        _logger  = Substitute.For<ILogger<CalculateRiskService>>();
        _sut     = new CalculateRiskService(_context, _logger);
    }

    // ───── helpers ─────────────────────────────────────────────────────────

    private void SetupWeatherCache(
        double temperature  = 25,
        double humidity     = 60,
        double windSpeed    = 20,
        double rainProb     = 30)
    {
        var cache = new WeatherCache(
            _farm.Id, temperature, humidity, windSpeed, rainProb, DateTime.UtcNow);

        _context.WeatherCaches
            .Returns(MockDbSetHelper.CreateMockDbSet([cache]));
    }

    private void SetupNoWeatherCache() =>
        _context.WeatherCaches
            .Returns(MockDbSetHelper.CreateMockDbSet<WeatherCache>([]));

    private void SetupAlerts(List<Alert>? alerts = null) =>
        _context.Alerts
            .Returns(MockDbSetHelper.CreateMockDbSet(alerts ?? []));

    // ───── testes ──────────────────────────────────────────────────────────

    [Fact]
    public async Task ExecuteAsync_WhenNoCacheExists_ReturnsLowRisk()
    {
        SetupNoWeatherCache();

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.Low);
    }

    [Fact]
    public async Task ExecuteAsync_WhenConditionsNormal_ReturnsLowRisk()
    {
        SetupWeatherCache(temperature: 25, humidity: 60, windSpeed: 20, rainProb: 30);
        SetupAlerts();

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.Low);
    }

    [Fact]
    public async Task ExecuteAsync_WhenHumidityBelow30_ReturnsHighRisk()
    {
        SetupWeatherCache(humidity: 20);
        SetupAlerts();

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.High);
    }

    [Fact]
    public async Task ExecuteAsync_WhenTemperatureBelow2_ReturnsCriticalRisk()
    {
        SetupWeatherCache(temperature: 1);
        SetupAlerts();

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.Critical);
    }

    [Fact]
    public async Task ExecuteAsync_WhenRainProbabilityAbove85_ReturnsHighRisk()
    {
        SetupWeatherCache(rainProb: 90);
        SetupAlerts();

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.High);
    }

[Fact]
public async Task ExecuteAsync_WhenWindSpeedAbove60_ReturnsAtLeastMediumRisk()
{
    SetupWeatherCache(windSpeed: 70);
    SetupAlerts();

    var result = await _sut.ExecuteAsync(_farm);

    ((int)result).Should().BeGreaterThanOrEqualTo((int)RiskLevel.Medium);
}

    [Fact]
    public async Task ExecuteAsync_WhenFrostAndDrought_ReturnsCritical()
    {
        // Geada (Critical) + Seca (High) → deve manter Critical
        SetupWeatherCache(temperature: 1, humidity: 20);
        SetupAlerts();

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.Critical);
    }

    [Fact]
    public async Task ExecuteAsync_WhenDroughtAlertAlreadyActive_ShouldNotCreateDuplicate()
    {
        SetupWeatherCache(humidity: 20);

        var existingAlert = new Alert(_farm.Id, AlertType.Drought, "Alerta existente");
        SetupAlerts([existingAlert]);

        var result = await _sut.ExecuteAsync(_farm);

        // Risco ainda é High mesmo sem criar novo alerta
        result.Should().Be(RiskLevel.High);

        // Não adicionou novo alerta
        await _context.Alerts
            .DidNotReceive()
            .AddAsync(
                Arg.Is<Alert>(a => a.Tipo == AlertType.Drought),
                Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ExecuteAsync_WhenAllConditionsCritical_ReturnsCritical()
    {
        // Geada + Seca + Chuva extrema + Vento forte → Critical
        SetupWeatherCache(temperature: 1, humidity: 20, windSpeed: 70, rainProb: 90);
        SetupAlerts();

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.Critical);
    }
}