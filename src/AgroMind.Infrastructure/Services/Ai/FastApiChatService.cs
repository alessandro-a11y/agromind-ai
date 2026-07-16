using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AgroMind.Infrastructure.Services.Ai;

public sealed class FastApiChatService : IAiChatService
{
    private readonly HttpClient _httpClient;
    private readonly FastApiOptions _options;
    private readonly ILogger<FastApiChatService> _logger;

    public FastApiChatService(
        HttpClient httpClient,
        IOptions<FastApiOptions> options,
        ILogger<FastApiChatService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<AiChatResponse> SendAsync(
        AiChatRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.BaseUrl) ||
            string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            return new AiChatResponse("O assistente de IA ainda não está configurado.", null);
        }

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "chat")
        {
            Content = JsonContent.Create(FastApiChatRequest.From(request))
        };
        httpRequest.Headers.Add("x-api-key", _options.ApiKey);

        try
        {
            using var response = await _httpClient.SendAsync(httpRequest, cancellationToken);

            if (response.StatusCode == HttpStatusCode.TooManyRequests)
                return new AiChatResponse("O limite de uso da IA foi atingido. Tente novamente em alguns minutos.", null);

            if (response.StatusCode == HttpStatusCode.Unauthorized)
                return new AiChatResponse("O assistente de IA está temporariamente indisponível.", null);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("FastAPI chat returned status code {StatusCode}", response.StatusCode);
                return new AiChatResponse("Não consegui consultar a IA agora. Tente novamente em instantes.", null);
            }

            var payload = await response.Content.ReadFromJsonAsync<FastApiChatResponse>(
                cancellationToken: cancellationToken);

            if (payload is null || string.IsNullOrWhiteSpace(payload.Reply))
                return new AiChatResponse("A IA retornou uma resposta inesperada.", null);

            return new AiChatResponse(payload.Reply, payload.TokensUsed);
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return new AiChatResponse("A IA demorou para responder. Tente novamente em instantes.", null);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "FastAPI chat request failed");
            return new AiChatResponse("O assistente de IA está temporariamente indisponível.", null);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "FastAPI chat returned invalid JSON");
            return new AiChatResponse("A IA retornou uma resposta inesperada.", null);
        }
    }

private sealed record FastApiChatRequest(
    [property: JsonPropertyName("message")]
    string Message,

    [property: JsonPropertyName("history")]
    IReadOnlyList<FastApiChatMessage> History,

    [property: JsonPropertyName("farm_context")]
    string? FarmContext)
{
    public static FastApiChatRequest From(AiChatRequest request) =>
        new(
            request.Message,
            request.History
                .Select(message =>
                    new FastApiChatMessage(
                        message.Role,
                        message.Content))
                .ToList(),
            request.FarmContext);
}

    private sealed record FastApiChatMessage(
        [property: JsonPropertyName("role")] string Role,
        [property: JsonPropertyName("content")] string Content);

    private sealed record FastApiChatResponse(
        [property: JsonPropertyName("reply")] string Reply,
        [property: JsonPropertyName("tokens_used")] int? TokensUsed);
}
