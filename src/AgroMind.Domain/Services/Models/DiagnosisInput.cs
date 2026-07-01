namespace AgroMind.Domain.Services.Models;

public sealed record DiagnosisInput(
    string CropName,
    double SoilPh,
    double Temperature,
    double Humidity,
    double WindSpeed,
    double RainProbability,
    int PreviousCriticalDiagnosesCount);