using System.Text.Json;
using AgroMind.Application.Features.Weather.DTOs;
using AgroMind.Application.Features.Weather.Interfaces;
using Microsoft.Extensions.Logging;

namespace AgroMind.Infrastructure.Services.Weather;

public sealed class WeatherService : IWeatherService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<WeatherService> _logger;

    public WeatherService(
        HttpClient httpClient,
        ILogger<WeatherService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<WeatherDataDto?> GetCurrentWeatherAsync(
        double latitude,
        double longitude,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await GetWeatherAsync(latitude, longitude, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to fetch current weather for coordinates {Latitude} {Longitude}",
                latitude,
                longitude);

            return null;
        }
    }

    public async Task<WeatherDataDto> GetWeatherAsync(
        double latitude,
        double longitude,
        CancellationToken cancellationToken = default)
    {
        var url =
            $"https://api.open-meteo.com/v1/forecast" +
            $"?latitude={latitude}" +
            $"&longitude={longitude}" +
            $"&current=temperature_2m,relative_humidity_2m,wind_speed_10m";

        _logger.LogInformation(
            "Fetching weather data for coordinates {Latitude} {Longitude}",
            latitude,
            longitude);

        using var response =
            await _httpClient.GetAsync(
                url,
                cancellationToken);

        response.EnsureSuccessStatusCode();

        await using var stream =
            await response.Content.ReadAsStreamAsync(
                cancellationToken);

        using var document =
            await JsonDocument.ParseAsync(
                stream,
                cancellationToken: cancellationToken);

        var current =
            document.RootElement.GetProperty("current");

        var weather = new WeatherDataDto(
            current.GetProperty("temperature_2m").GetDouble(),
            current.GetProperty("relative_humidity_2m").GetDouble(),
            current.GetProperty("wind_speed_10m").GetDouble(),
            0,
            DateTime.UtcNow);

        _logger.LogInformation(
            "Weather fetched successfully. Temperature {Temperature}",
            weather.Temperature);

        return weather;
    }
}