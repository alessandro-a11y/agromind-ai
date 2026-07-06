using AgroMind.Application.Common.Interfaces;
using AgroMind.Domain.Entities;
using AgroMind.Domain.Enums;
using AgroMind.Infrastructure.Persistence;
using AgroMind.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace AgroMind.UnitTests.Services;

public sealed class CalculateRiskServiceTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<CalculateRiskService> _logger;
    private readonly IEmailService _emailService;
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
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()) // banco isolado por teste
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _logger    = Substitute.For<ILogger<CalculateRiskService>>();
        _emailService = Substitute.For<IEmailService>();
        _sut       = new CalculateRiskService(_dbContext, _emailService, _logger);
    }

    public void Dispose() => _dbContext.Dispose();

    // ───── helpers ─────────────────────────────────────────────────────────

    private async Task SeedWeatherCacheAsync(
        double temperature = 25,
        double humidity    = 60,
        double windSpeed   = 20,
        double rainProb    = 30)
    {
        var cache = new WeatherCache(
            _farm.Id, temperature, humidity, windSpeed, rainProb, DateTime.UtcNow);

        await _dbContext.WeatherCaches.AddAsync(cache);
        await _dbContext.SaveChangesAsync();
    }

    private async Task SeedAlertAsync(AlertType tipo)
    {
        var alert = new Alert(_farm.Id, tipo, "Alerta existente");
        await _dbContext.Alerts.AddAsync(alert);
        await _dbContext.SaveChangesAsync();
    }

    // ───── testes ──────────────────────────────────────────────────────────

    [Fact]
    public async Task ExecuteAsync_WhenNoCacheExists_ReturnsLowRisk()
    {
        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.Low);
    }

    [Fact]
    public async Task ExecuteAsync_WhenConditionsNormal_ReturnsLowRisk()
    {
        await SeedWeatherCacheAsync(temperature: 25, humidity: 60, windSpeed: 20, rainProb: 30);

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.Low);
    }

    [Fact]
    public async Task ExecuteAsync_WhenHumidityBelow30_ReturnsHighRisk()
    {
        await SeedWeatherCacheAsync(humidity: 20);

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.High);
    }

    [Fact]
    public async Task ExecuteAsync_WhenTemperatureBelow2_ReturnsCriticalRisk()
    {
        await SeedWeatherCacheAsync(temperature: 1);

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.Critical);
    }

    [Fact]
    public async Task ExecuteAsync_WhenRainProbabilityAbove85_ReturnsHighRisk()
    {
        await SeedWeatherCacheAsync(rainProb: 90);

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.High);
    }

    [Fact]
    public async Task ExecuteAsync_WhenWindSpeedAbove60_ReturnsAtLeastMediumRisk()
    {
        await SeedWeatherCacheAsync(windSpeed: 70);

        var result = await _sut.ExecuteAsync(_farm);

        ((int)result).Should().BeGreaterThanOrEqualTo((int)RiskLevel.Medium);
    }

    [Fact]
    public async Task ExecuteAsync_WhenFrostAndDrought_ReturnsCritical()
    {
        await SeedWeatherCacheAsync(temperature: 1, humidity: 20);

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.Critical);
    }

    [Fact]
    public async Task ExecuteAsync_WhenDroughtAlertAlreadyActive_ShouldNotCreateDuplicate()
    {
        await SeedWeatherCacheAsync(humidity: 20);
        await SeedAlertAsync(AlertType.Drought);

        var alertsAntes = await _dbContext.Alerts.CountAsync();

        await _sut.ExecuteAsync(_farm);

        var alertsDepois = await _dbContext.Alerts.CountAsync();

        alertsDepois.Should().Be(alertsAntes); // nenhum alerta novo criado
    }

    [Fact]
    public async Task ExecuteAsync_WhenAllConditionsCritical_ReturnsCritical()
    {
        await SeedWeatherCacheAsync(temperature: 1, humidity: 20, windSpeed: 70, rainProb: 90);

        var result = await _sut.ExecuteAsync(_farm);

        result.Should().Be(RiskLevel.Critical);
    }

    [Fact]
    public async Task ExecuteAsync_WhenDroughtDetected_CreatesAlertInDatabase()
    {
        await SeedWeatherCacheAsync(humidity: 20);

        await _sut.ExecuteAsync(_farm);
        await _dbContext.SaveChangesAsync();

        var alert = await _dbContext.Alerts
            .FirstOrDefaultAsync(a => a.FarmId == _farm.Id && a.Tipo == AlertType.Drought);

        alert.Should().NotBeNull();
        alert!.Status.Should().Be(AlertStatus.Active);
    }
}