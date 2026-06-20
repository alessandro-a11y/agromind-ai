using AgroMind.Domain.Enums;
using AgroMind.Domain.Services;
using AgroMind.Domain.Services.Models;
using FluentAssertions;

namespace AgroMind.UnitTests.Services;

public sealed class DiagnosisEngineTests
{
    private static DiagnosisInput BaseInput(
        string crop = "soja",
        double ph = 6.2,
        double temp = 25,
        double humidity = 60,
        double wind = 20,
        double rain = 30,
        int previousCritical = 0) =>
        new(crop, ph, temp, humidity, wind, rain, previousCritical);

    [Fact]
    public void Diagnose_WhenConditionsIdeal_ReturnsLowRisk()
    {
        var result = DiagnosisEngine.Diagnose(BaseInput());
        result.Resultado.Should().Be(RiskLevel.Low);
    }

    [Fact]
    public void Diagnose_WhenPhOutsideCropRange_ReturnsAtLeastMediumRisk()
    {
        var result = DiagnosisEngine.Diagnose(BaseInput(crop: "soja", ph: 4.5));
        ((int)result.Resultado).Should().BeGreaterThanOrEqualTo((int)RiskLevel.Medium);
    }

    [Fact]
    public void Diagnose_WhenTemperatureBelow2_ReturnsCriticalRisk()
    {
        var result = DiagnosisEngine.Diagnose(BaseInput(temp: 1));
        result.Resultado.Should().Be(RiskLevel.Critical);
    }

    [Fact]
    public void Diagnose_WhenHumidityBelow30_ReturnsHighRisk()
    {
        var result = DiagnosisEngine.Diagnose(BaseInput(humidity: 20));
        result.Resultado.Should().Be(RiskLevel.High);
    }

    [Fact]
    public void Diagnose_WhenUnknownCrop_UsesDefaultProfileWithoutThrowing()
    {
        var result = DiagnosisEngine.Diagnose(BaseInput(crop: "cultura-inexistente"));
        result.Should().NotBeNull();
    }

    [Fact]
    public void Diagnose_WhenTwoOrMorePreviousCriticalDiagnoses_EscalatesToHigh()
    {
        var result = DiagnosisEngine.Diagnose(BaseInput(previousCritical: 2));
        ((int)result.Resultado).Should().BeGreaterThanOrEqualTo((int)RiskLevel.High);
    }

    [Fact]
    public void Diagnose_WhenAllFactorsCritical_ReturnsCriticalWithLowestConfidence()
    {
        var result = DiagnosisEngine.Diagnose(BaseInput(
            ph: 4.0, temp: 1, humidity: 15, wind: 70, rain: 90, previousCritical: 3));

        result.Resultado.Should().Be(RiskLevel.Critical);
        result.Confianca.Should().BeLessThan(0.95);
    }

    [Fact]
    public void Diagnose_WhenNoRiskFactors_RecommendationMentionsCropName()
    {
        var result = DiagnosisEngine.Diagnose(BaseInput(crop: "milho"));
        result.Recomendacao.Should().Contain("milho");
    }
}