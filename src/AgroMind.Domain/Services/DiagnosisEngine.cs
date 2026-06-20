using AgroMind.Domain.Enums;
using AgroMind.Domain.Services.Models;

namespace AgroMind.Domain.Services;

public static class DiagnosisEngine
{
    private sealed record CropProfile(double MinPh, double MaxPh, int CicloDias);

    private static readonly Dictionary<string, CropProfile> CropProfiles = new(StringComparer.OrdinalIgnoreCase)
    {
        ["soja"] = new CropProfile(6.0, 6.5, 120),
        ["milho"] = new CropProfile(5.5, 7.0, 150),
        ["cana-de-açúcar"] = new CropProfile(5.5, 6.5, 365),
        ["café"] = new CropProfile(5.0, 6.0, 365),
        ["feijão"] = new CropProfile(6.0, 7.0, 90),
        ["algodão"] = new CropProfile(5.8, 7.0, 180),
        ["cana"] = new CropProfile(5.5, 6.5, 365),
    };

    private static readonly CropProfile DefaultProfile = new(5.5, 7.0, 120);

    public static DiagnosisResult Diagnose(DiagnosisInput input)
    {
        var risco = RiskLevel.Low;
        var motivos = new List<string>();
        var fatoresCriticos = 0;

        var profile = CropProfiles.TryGetValue(input.CropName.Trim(), out var p) ? p : DefaultProfile;

        // Solo: pH fora da faixa ideal da cultura
        if (input.SoilPh < profile.MinPh || input.SoilPh > profile.MaxPh)
        {
            risco = Escalate(risco, RiskLevel.Medium);
            motivos.Add($"pH do solo ({input.SoilPh:F1}) fora da faixa ideal para {input.CropName} ({profile.MinPh:F1}–{profile.MaxPh:F1}).");
            fatoresCriticos++;
        }

        // Clima: seca
        if (input.Humidity < 30)
        {
            risco = Escalate(risco, RiskLevel.High);
            motivos.Add($"Umidade crítica de {input.Humidity:F0}%, risco de estresse hídrico.");
            fatoresCriticos++;
        }

        // Clima: geada
        if (input.Temperature < 2)
        {
            risco = Escalate(risco, RiskLevel.Critical);
            motivos.Add($"Risco de geada com temperatura de {input.Temperature:F1}°C.");
            fatoresCriticos++;
        }

        // Clima: chuva extrema
        if (input.RainProbability > 85)
        {
            risco = Escalate(risco, RiskLevel.High);
            motivos.Add($"Alta probabilidade de chuva intensa ({input.RainProbability:F0}%).");
            fatoresCriticos++;
        }

        // Clima: vento forte
        if (input.WindSpeed > 60)
        {
            risco = Escalate(risco, RiskLevel.Medium);
            motivos.Add($"Vento forte de {input.WindSpeed:F0} km/h, risco de acamamento da cultura.");
            fatoresCriticos++;
        }

        // Histórico: diagnósticos críticos recentes no talhão
        if (input.PreviousCriticalDiagnosesCount >= 2)
        {
            risco = Escalate(risco, RiskLevel.High);
            motivos.Add($"Talhão apresentou {input.PreviousCriticalDiagnosesCount} diagnósticos críticos recentes.");
            fatoresCriticos++;
        }

        var confianca = Math.Clamp(0.95 - (fatoresCriticos * 0.05), 0.5, 0.95);
        var recomendacao = motivos.Count > 0
            ? string.Join(" ", motivos)
            : $"Nenhum fator de risco relevante identificado para {input.CropName}. Condições dentro do esperado.";

        return new DiagnosisResult(risco, confianca, recomendacao);
    }

    private static RiskLevel Escalate(RiskLevel current, RiskLevel candidate) =>
        candidate > current ? candidate : current;
}