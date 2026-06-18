using System.Text.Json;
using AgroMind.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace AgroMind.Infrastructure.Services.Weather;

public class WeatherService : IWeatherService
{
    private readonly HttpClient _http;
    private readonly IMemoryCache _cache;
    private readonly ILogger<WeatherService> _logger;

    public WeatherService(HttpClient http, IMemoryCache cache, ILogger<WeatherService> logger)
    {
        _http = http;
        _cache = cache;
        _logger = logger;
    }

    public async Task<WeatherData?> GetCurrentWeatherAsync(double latitude, double longitude)
    {
        var cacheKey = $"weather:{latitude:F2}:{longitude:F2}";

        if (_cache.TryGetValue(cacheKey, out WeatherData? cached))
            return cached;

        try
        {
            var url = $"https://api.open-meteo.com/v1/forecast" +
                      $"?latitude={latitude}&longitude={longitude}" +
                      $"&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m" +
                      $"&timezone=America%2FSao_Paulo";

            var response = await _http.GetStringAsync(url);
            var json = JsonDocument.Parse(response);
            var current = json.RootElement.GetProperty("current");

            var data = new WeatherData(
                Temperature: current.GetProperty("temperature_2m").GetDouble(),
                Humidity: current.GetProperty("relative_humidity_2m").GetDouble(),
                Precipitation: current.GetProperty("precipitation").GetDouble(),
                WindSpeed: current.GetProperty("wind_speed_10m").GetDouble(),
                MeasuredAt: DateTime.UtcNow
            );

            _cache.Set(cacheKey, data, TimeSpan.FromMinutes(30));
            return data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar clima para {Lat},{Lon}", latitude, longitude);
            return null;
        }
    }
}
