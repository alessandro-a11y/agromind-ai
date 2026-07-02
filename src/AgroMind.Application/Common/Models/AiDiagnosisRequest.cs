namespace AgroMind.Application.Common.Models;

public sealed record AiDiagnosisRequest(
    string CropName,
    double SoilPh,
    double Temperature,
    double Humidity,
    double WindSpeed,
    double RainProbability,
    int PreviousCriticalDiagnosesCount);
