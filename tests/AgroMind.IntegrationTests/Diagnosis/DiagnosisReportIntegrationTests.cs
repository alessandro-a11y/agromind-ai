using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;

namespace AgroMind.IntegrationTests.Diagnosis;

public sealed class DiagnosisReportIntegrationTests : IClassFixture<AgroMindWebApplicationFactory>
{
    private readonly HttpClient _client;

    public DiagnosisReportIntegrationTests(AgroMindWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> RegisterAndLoginAsync(string email, string senha)
    {
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            nome  = "Usuário Teste",
            email = email,
            senha = senha,
            role  = 0
        });

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = email,
            senha = senha
        });

        var loginData = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        return loginData!.AccessToken;
    }

    private void SetBearerToken(string token) =>
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

    private async Task<Guid> CreateFarmAsync()
    {
        var response = await _client.PostAsJsonAsync("/api/farms", new
        {
            nome      = "Fazenda Relatório",
            cidade    = "Caruaru",
            estado    = "PE",
            latitude  = -8.233,
            longitude = -35.796
        });
        var created = await response.Content.ReadFromJsonAsync<CreatedResponse>();
        return created!.Id;
    }

    private async Task<Guid> CreateFieldAsync(Guid farmId)
    {
        var response = await _client.PostAsJsonAsync($"/api/farms/{farmId}/fields", new
        {
            nome     = "Talhão Relatório",
            area     = 30.0,
            tipoSolo = "Argiloso",
            ph       = 6.2
        });
        var created = await response.Content.ReadFromJsonAsync<CreatedResponse>();
        return created!.Id;
    }

    private async Task CreateCropAsync(Guid fieldId)
    {
        await _client.PostAsJsonAsync($"/api/fields/{fieldId}/crops", new
        {
            nome          = "soja",
            dataPlantio   = DateTime.UtcNow.AddDays(-30),
            areaPlantada  = 30.0,
            dataColheita  = (DateTime?)null
        });
    }

    private static bool IsValidPdf(byte[] bytes) =>
        bytes.Length > 4 &&
        bytes[0] == '%' && bytes[1] == 'P' && bytes[2] == 'D' && bytes[3] == 'F';

    [Fact]
    public async Task GetReport_ForExistingDiagnosis_Returns201PdfFile()
    {
        var token = await RegisterAndLoginAsync($"report_{Guid.NewGuid()}@test.com", "Senha@123");
        SetBearerToken(token);

        var farmId = await CreateFarmAsync();
        var fieldId = await CreateFieldAsync(farmId);
        await CreateCropAsync(fieldId);

        var createResponse = await _client.PostAsync($"/api/fields/{fieldId}/diagnosis", null);
        var diagnosis = await createResponse.Content.ReadFromJsonAsync<DiagnosisResponse>();

        var response = await _client.GetAsync($"/api/fields/{fieldId}/diagnosis/{diagnosis!.Id}/report");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType!.MediaType.Should().Be("application/pdf");

        var bytes = await response.Content.ReadAsByteArrayAsync();
        IsValidPdf(bytes).Should().BeTrue();
    }

    [Fact]
    public async Task GetHistoryReport_WithMultipleDiagnoses_ReturnsValidPdf()
    {
        var token = await RegisterAndLoginAsync($"report_{Guid.NewGuid()}@test.com", "Senha@123");
        SetBearerToken(token);

        var farmId = await CreateFarmAsync();
        var fieldId = await CreateFieldAsync(farmId);
        await CreateCropAsync(fieldId);

        await _client.PostAsync($"/api/fields/{fieldId}/diagnosis", null);
        await _client.PostAsync($"/api/fields/{fieldId}/diagnosis", null);

        var response = await _client.GetAsync($"/api/fields/{fieldId}/diagnosis/report");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType!.MediaType.Should().Be("application/pdf");

        var bytes = await response.Content.ReadAsByteArrayAsync();
        IsValidPdf(bytes).Should().BeTrue();
    }

    [Fact]
    public async Task GetHistoryReport_WithNoFieldOwnership_Returns400()
    {
        var ownerToken = await RegisterAndLoginAsync($"owner_{Guid.NewGuid()}@test.com", "Senha@123");
        SetBearerToken(ownerToken);
        var farmId = await CreateFarmAsync();
        var fieldId = await CreateFieldAsync(farmId);

        var intruderToken = await RegisterAndLoginAsync($"intruder_{Guid.NewGuid()}@test.com", "Senha@123");
        SetBearerToken(intruderToken);

        var response = await _client.GetAsync($"/api/fields/{fieldId}/diagnosis/report");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}

file record LoginResponse(string AccessToken, string RefreshToken);
file record CreatedResponse(Guid Id);
file record DiagnosisResponse(Guid Id, int Resultado, double Confianca, string Recomendacao, DateTime CreatedAt);
