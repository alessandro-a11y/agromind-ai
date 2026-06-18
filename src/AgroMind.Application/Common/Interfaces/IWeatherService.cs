namespace AgroMind.Application.Common.Interfaces;

public record WeatherData(
    double Temperature,
    double Humidity,
    double Precipitation,
    double WindSpeed,
    DateTime MeasuredAt
);

public interface IWeatherService
{
    Task<WeatherData?> GetCurrentWeatherAsync(double latitude, double longitude);
}
