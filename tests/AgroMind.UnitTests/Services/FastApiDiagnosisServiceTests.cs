using System.Net;
using System.Text;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Enums;
using AgroMind.Infrastructure.Services.Ai;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace AgroMind.UnitTests.Services;

public sealed class FastApiDiagnosisServiceTests
{
    [Fact]
    public async Task DiagnoseAsync_WhenFastApiReturnsValidPayload_ReturnsDiagnosis()
    {
        var service = CreateService(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = Json("""{"diagnosis":"Risco hídrico moderado.","riskLevel":"Medium","recommendations":["Ajustar irrigação."],"confidence":0.91}""")
        });

        var result = await service.DiagnoseAsync(Request(), CancellationToken.None);

        result.Success.Should().BeTrue();
        result.Diagnosis!.RiskLevel.Should().Be(RiskLevel.Medium);
        result.Diagnosis.Confidence.Should().Be(0.91);
        result.Diagnosis.Recommendations.Should().Contain("Ajustar irrigação.");
    }

    [Fact]
    public async Task DiagnoseAsync_WhenFastApiReturnsRateLimit_ReturnsFriendlyFailure()
    {
        var service = CreateService(new HttpResponseMessage(HttpStatusCode.TooManyRequests));

        var result = await service.DiagnoseAsync(Request(), CancellationToken.None);

        result.Success.Should().BeFalse();
        result.ErrorMessage.Should().Be("Limite de uso da IA atingido.");
    }

    private static FastApiDiagnosisService CreateService(HttpResponseMessage response)
    {
        var httpClient = new HttpClient(new StubHttpMessageHandler(response))
        {
            BaseAddress = new Uri("https://ia.local/")
        };

        var options = Options.Create(new FastApiOptions
        {
            BaseUrl = "https://ia.local",
            ApiKey = "internal-test-key"
        });

        return new FastApiDiagnosisService(
            httpClient,
            options,
            NullLogger<FastApiDiagnosisService>.Instance);
    }

    private static AiDiagnosisRequest Request() =>
        new("soja", 5.8, 28, 55, 12, 30, 0);

    private static StringContent Json(string value) =>
        new(value, Encoding.UTF8, "application/json");

    private sealed class StubHttpMessageHandler : HttpMessageHandler
    {
        private readonly HttpResponseMessage _response;

        public StubHttpMessageHandler(HttpResponseMessage response)
        {
            _response = response;
        }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(_response);
        }
    }
}
