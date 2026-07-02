using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AgroMind.Infrastructure.Services.Ai;

public sealed class FastApiDiagnosisService : IAiDiagnosisService
{
    private readonly HttpClient _httpClient;
    private readonly FastApiOptions _options;
    private readonly ILogger<FastApiDiagnosisService> _logger;

    public FastApiDiagnosisService(
        HttpClient httpClient,
        IOptions<FastApiOptions> options,
        ILogger<FastApiDiagnosisService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<AiDiagnosisOutcome> DiagnoseAsync(
        AiDiagnosisRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.BaseUrl) ||
            string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            return AiDiagnosisOutcome.Fail("Serviço de IA não configurado.");
        }

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "diagnosis")
        {
            Content = JsonContent.Create(FastApiDiagnosisRequest.From(request))
        };
        httpRequest.Headers.Add("x-api-key", _options.ApiKey);

        try
        {
            using var response = await _httpClient.SendAsync(httpRequest, cancellationToken);

            if (response.StatusCode == HttpStatusCode.Unauthorized)
                return AiDiagnosisOutcome.Fail("Credenciais internas da IA inválidas.");

            if (response.StatusCode == HttpStatusCode.TooManyRequests)
                return AiDiagnosisOutcome.Fail("Limite de uso da IA atingido.");

            if (response.StatusCode is HttpStatusCode.BadGateway or HttpStatusCode.ServiceUnavailable or HttpStatusCode.GatewayTimeout)
                return AiDiagnosisOutcome.Fail("Serviço de IA temporariamente indisponível.");

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "FastAPI returned unexpected status code {StatusCode} for diagnosis",
                    response.StatusCode);

                return AiDiagnosisOutcome.Fail("A IA não conseguiu processar o diagnóstico.");
            }

            var payload = await response.Content.ReadFromJsonAsync<FastApiDiagnosisResponse>(
                cancellationToken: cancellationToken);

            if (payload is null ||
                string.IsNullOrWhiteSpace(payload.Diagnosis) ||
                payload.Recommendations.Count == 0)
            {
                return AiDiagnosisOutcome.Fail("A IA retornou uma resposta inesperada.");
            }

            return AiDiagnosisOutcome.Ok(new AiDiagnosisResult(
                payload.Diagnosis,
                payload.RiskLevel,
                payload.Recommendations,
                Math.Clamp(payload.Confidence, 0, 1)));
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return AiDiagnosisOutcome.Fail("A IA demorou para responder.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "FastAPI diagnosis request failed");
            return AiDiagnosisOutcome.Fail("Serviço de IA temporariamente indisponível.");
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "FastAPI diagnosis returned invalid JSON");
            return AiDiagnosisOutcome.Fail("A IA retornou uma resposta inesperada.");
        }
    }

    private sealed record FastApiDiagnosisRequest(
        [property: JsonPropertyName("cropName")] string CropName,
        [property: JsonPropertyName("soilPh")] double SoilPh,
        [property: JsonPropertyName("temperature")] double Temperature,
        [property: JsonPropertyName("humidity")] double Humidity,
        [property: JsonPropertyName("windSpeed")] double WindSpeed,
        [property: JsonPropertyName("rainProbability")] double RainProbability,
        [property: JsonPropertyName("previousCriticalDiagnosesCount")] int PreviousCriticalDiagnosesCount)
    {
        public static FastApiDiagnosisRequest From(AiDiagnosisRequest request) =>
            new(
                request.CropName,
                request.SoilPh,
                request.Temperature,
                request.Humidity,
                request.WindSpeed,
                request.RainProbability,
                request.PreviousCriticalDiagnosesCount);
    }

    private sealed record FastApiDiagnosisResponse(
        [property: JsonPropertyName("diagnosis")] string Diagnosis,
        [property: JsonConverter(typeof(JsonStringEnumConverter))]
        [property: JsonPropertyName("riskLevel")] RiskLevel RiskLevel,
        [property: JsonPropertyName("recommendations")] IReadOnlyList<string> Recommendations,
        [property: JsonPropertyName("confidence")] double Confidence);
}
