using System.Diagnostics.Metrics;

namespace AgroMind.Application.Common.Telemetry;

public static class DiagnosisMetrics
{
    public const string MeterName = "AgroMind.Diagnosis";

    private static readonly Meter Meter = new(MeterName, "1.0.0");

    private static readonly Counter<long> DiagnosisCounter = Meter.CreateCounter<long>(
        name: "agromind.diagnosis.count",
        unit: "{diagnosis}",
        description: "Quantidade de diagnósticos gerados, por nível de risco.");

    public static void RecordDiagnosis(string riskLevel) =>
        DiagnosisCounter.Add(1, new KeyValuePair<string, object?>("risk_level", riskLevel));
}
