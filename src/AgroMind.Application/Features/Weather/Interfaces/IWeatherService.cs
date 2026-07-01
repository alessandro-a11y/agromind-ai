using AgroMind.Application.Features.Weather.DTOs;

namespace AgroMind.Application.Features.Weather.Interfaces;

public interface IWeatherService
{
    Task<WeatherDataDto?> GetCurrentWeatherAsync(
        double latitude,
        double longitude,
        CancellationToken cancellationToken = default);

    Task<WeatherDataDto> GetWeatherAsync(
        double latitude,
        double longitude,
        CancellationToken cancellationToken = default);
}