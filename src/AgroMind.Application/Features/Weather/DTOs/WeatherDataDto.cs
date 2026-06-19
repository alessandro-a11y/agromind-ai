namespace AgroMind.Application.Features.Weather.DTOs;

public sealed record WeatherDataDto(
    double Temperature,
    double Humidity,
    double WindSpeed,
    double RainProbability,
    DateTime MeasuredAt
);