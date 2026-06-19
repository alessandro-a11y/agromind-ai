using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Features.Weather.Interfaces;
using AgroMind.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AgroMind.Application.Features.Weather.Jobs;

public sealed class WeatherSyncJob
{
    private readonly IWeatherService _weatherService;
    private readonly IApplicationDbContext _context;
    private readonly ICalculateRiskService _riskService;
    private readonly ILogger<WeatherSyncJob> _logger;

    public WeatherSyncJob(
        IWeatherService weatherService,
        IApplicationDbContext context,
        ICalculateRiskService riskService,
        ILogger<WeatherSyncJob> logger)
    {
        _weatherService = weatherService;
        _context = context;
        _riskService = riskService;
        _logger = logger;
    }

    public async Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Weather synchronization started");

        var farms = await _context.Farms
            .Where(f => f.Latitude != null && f.Longitude != null)
            .ToListAsync(cancellationToken);

        if (farms.Count == 0)
        {
            _logger.LogInformation("No farms with coordinates found. Skipping sync.");
            return;
        }

        var synced = 0;
        var failed = 0;

        foreach (var farm in farms)
        {
            try
            {
                var data = await _weatherService.GetCurrentWeatherAsync(
                    farm.Latitude!.Value,
                    farm.Longitude!.Value,
                    cancellationToken);

                if (data is null)
                {
                    _logger.LogWarning(
                        "No weather data returned for farm {FarmId}. Skipping.",
                        farm.Id);
                    failed++;
                    continue;
                }

                var cache = await _context.WeatherCaches
                    .FirstOrDefaultAsync(w => w.FarmId == farm.Id, cancellationToken);

                if (cache is null)
                {
                    cache = new WeatherCache(
                        farm.Id,
                        data.Temperature,
                        data.Humidity,
                        data.WindSpeed,
                        data.RainProbability,
                        data.MeasuredAt);

                    await _context.WeatherCaches.AddAsync(cache, cancellationToken);
                }
                else
                {
                    cache.Update(
                        data.Temperature,
                        data.Humidity,
                        data.WindSpeed,
                        data.RainProbability,
                        data.MeasuredAt);
                }

                await _context.SaveChangesAsync(cancellationToken);

                await _riskService.ExecuteAsync(farm, cancellationToken);

                await _context.SaveChangesAsync(cancellationToken);

                synced++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to sync weather for farm {FarmId}", farm.Id);
                failed++;
            }
        }

        _logger.LogInformation(
            "Weather sync completed. Synced: {Synced} | Failed: {Failed}",
            synced, failed);
    }
}