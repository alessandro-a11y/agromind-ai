using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace AgroMind.Infrastructure.Services.Ai;

public sealed class FastApiHealthCheck : IHealthCheck
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly FastApiOptions _options;

    public FastApiHealthCheck(
        IHttpClientFactory httpClientFactory,
        IOptions<FastApiOptions> options)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.BaseUrl))
            return HealthCheckResult.Healthy("FastAPI não configurado neste ambiente.");

        try
        {
            var client = _httpClientFactory.CreateClient("FastApiHealth");
            using var response = await client.GetAsync("health", cancellationToken);

            return response.IsSuccessStatusCode
                ? HealthCheckResult.Healthy("FastAPI disponível.")
                : HealthCheckResult.Degraded("FastAPI respondeu com status inesperado.");
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            return HealthCheckResult.Degraded("FastAPI indisponível.", ex);
        }
    }
}
