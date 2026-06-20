using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using AgroMind.Domain.Entities;
using AgroMind.Domain.Enums;
using AgroMind.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;

namespace AgroMind.IntegrationTests.Diagnosis;

public sealed class DiagnosisIntegrationTests : IClassFixture<AgroMindWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly AgroMindWebApplicationFactory _factory;

    public DiagnosisIntegrationTests(AgroMindWebApplicationFactory factory)
    {
        _factory = factory;
        _client  = factory.CreateClient();
    }

    private async Task<string> RegisterAndLoginAsync(string email, string senha)
    {
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            nome     = "Usuário Teste",
            email    = email,
            senha = senha,
        role  = 0
        });

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email    = email,
            senha = senha,
        role  = 0
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
            nome      = "Fazenda Diagnóstico",
            cidade    = "Caruaru",
            estado    = "PE",
            latitude  = -8.233,
            longitude = -35.796
        });
        var created = await response.Content.ReadFromJsonAsync<CreatedResponse>();
        return created!.Id;
    }

    private async Task<Guid> CreateFieldAsync(Guid farmId, double ph = 6.2)
    {
        var response = await _client.PostAsJsonAsync($"/api/farms/{farmId}/fields", new
        {
            nome     = "Talhão 1",
            area     = 50.0,
            tipoSolo = "Argiloso",
            ph       = ph
        });
        var created = await response.Content.ReadFromJsonAsync<CreatedResponse>();
        return created!.Id;
    }

    private async Task CreateCropAsync(Guid fieldId, string nome = "soja")
    {
        await _client.PostAsJsonAsync($"/api/fields/{fieldId}/crops", new
        {
            nome          = nome,
            dataPlantio   = DateTime.UtcNow.AddDays(-30),
            areaPlantada  = 50.0,
            dataColheita  = (DateTime?)null
        });
    }

    private async Task SeedWeatherCacheAsync(
        Guid farmId,
        double temperature = 25,
        double humidity    = 60,
        double windSpeed    = 20,
        double rainProb    = 30)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var cache = new WeatherCache(farmId, temperature, humidity, windSpeed, rainProb, DateTime.UtcNow);
        db.WeatherCaches.Add(cache);
        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task CreateDiagnosis_WithFullSetup_Returns201WithLowRisk()
    {
        var token = await RegisterAndLoginAsync($"diag_{Guid.NewGuid()}@test.com", "Senha@123");
        SetBearerToken(token);

        var farmId = await CreateFarmAsync();
        var fieldId = await CreateFieldAsync(farmId, ph: 6.2);
        await CreateCropAsync(fieldId, "soja");
        await SeedWeatherCacheAsync(farmId, temperature: 25, humidity: 60, windSpeed: 20, rainProb: 30);

        var response = await _client.PostAsync($"/api/fields/{fieldId}/diagnosis", null);

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var diagnosis = await response.Content.ReadFromJsonAsync<DiagnosisResponse>();
        diagnosis!.Resultado.Should().Be((int)RiskLevel.Low);
    }

    [Fact]
    public async Task CreateDiagnosis_WithoutActiveCrop_Returns400()
    {
        var token = await RegisterAndLoginAsync($"diag_{Guid.NewGuid()}@test.com", "Senha@123");
        SetBearerToken(token);

        var farmId = await CreateFarmAsync();
        var fieldId = await CreateFieldAsync(farmId);
        // Sem cultura cadastrada

        var response = await _client.PostAsync($"/api/fields/{fieldId}/diagnosis", null);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateDiagnosis_ForFieldOfAnotherUser_Returns400()
    {
        var ownerToken = await RegisterAndLoginAsync($"owner_{Guid.NewGuid()}@test.com", "Senha@123");
        SetBearerToken(ownerToken);
        var farmId = await CreateFarmAsync();
        var fieldId = await CreateFieldAsync(farmId);
        await CreateCropAsync(fieldId);

        var intruderToken = await RegisterAndLoginAsync($"intruder_{Guid.NewGuid()}@test.com", "Senha@123");
        SetBearerToken(intruderToken);

        var response = await _client.PostAsync($"/api/fields/{fieldId}/diagnosis", null);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetHistory_AfterMultipleDiagnoses_ReturnsAllOrderedByMostRecent()
    {
        var token = await RegisterAndLoginAsync($"diag_{Guid.NewGuid()}@test.com", "Senha@123");
        SetBearerToken(token);

        var farmId = await CreateFarmAsync();
        var fieldId = await CreateFieldAsync(farmId);
        await CreateCropAsync(fieldId);
        await SeedWeatherCacheAsync(farmId);

        await _client.PostAsync($"/api/fields/{fieldId}/diagnosis", null);
        await _client.PostAsync($"/api/fields/{fieldId}/diagnosis", null);

        var response = await _client.GetAsync($"/api/fields/{fieldId}/diagnosis");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var history = await response.Content.ReadFromJsonAsync<List<DiagnosisResponse>>();
        history.Should().HaveCount(2);
    }

    [Fact]
    public async Task CreateDiagnosis_WhenFrostConditions_ReturnsCriticalRisk()
    {
        var token = await RegisterAndLoginAsync($"diag_{Guid.NewGuid()}@test.com", "Senha@123");
        SetBearerToken(token);

        var farmId = await CreateFarmAsync();
        var fieldId = await CreateFieldAsync(farmId);
        await CreateCropAsync(fieldId);
        await SeedWeatherCacheAsync(farmId, temperature: 1);

        var response = await _client.PostAsync($"/api/fields/{fieldId}/diagnosis", null);
        var diagnosis = await response.Content.ReadFromJsonAsync<DiagnosisResponse>();

        diagnosis!.Resultado.Should().Be((int)RiskLevel.Critical);
    }
}

file record LoginResponse(string AccessToken, string RefreshToken);
file record CreatedResponse(Guid Id);
file record DiagnosisResponse(Guid Id, int Resultado, double Confianca, string Recomendacao, DateTime CreatedAt);
