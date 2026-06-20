using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using AgroMind.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;

namespace AgroMind.IntegrationTests.Farms;

public sealed class FarmsIntegrationTests : IClassFixture<AgroMindWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly AgroMindWebApplicationFactory _factory;

    public FarmsIntegrationTests(AgroMindWebApplicationFactory factory)
    {
        _factory = factory;
        _client  = factory.CreateClient();
    }

    private async Task<string> RegisterAndLoginAsync(string email)
    {
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            nome  = "Usuário Teste",
            email = email,
            senha = "Senha@123",
            role  = 0
        });

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = email,
            senha = "Senha@123"
        });

        var loginData = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        return loginData!.AccessToken;
    }

    private void SetBearerToken(string token) =>
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

    [Fact]
    public async Task CreateFarm_WithValidData_Returns201()
    {
        var token = await RegisterAndLoginAsync($"farmer_{Guid.NewGuid()}@test.com");
        SetBearerToken(token);

        var response = await _client.PostAsJsonAsync("/api/farms", new
        {
            nome      = "Fazenda Integração",
            cidade    = "Caruaru",
            estado    = "PE",
            latitude  = -8.233,
            longitude = -35.796
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task GetFarms_WithoutToken_Returns401()
    {
        _client.DefaultRequestHeaders.Authorization = null;
        var response = await _client.GetAsync("/api/farms");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateFarm_ThenGetById_ReturnsSameFarm()
    {
        var token = await RegisterAndLoginAsync($"farmer_{Guid.NewGuid()}@test.com");
        SetBearerToken(token);

        var createResponse = await _client.PostAsJsonAsync("/api/farms", new
        {
            nome      = "Fazenda Buscável",
            cidade    = "Recife",
            estado    = "PE",
            latitude  = -8.054,
            longitude = -34.881
        });

        var created = await createResponse.Content.ReadFromJsonAsync<CreateFarmResponse>();
        var getResponse = await _client.GetAsync($"/api/farms/{created!.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CreateFarm_PersistsInDatabase()
    {
        var token = await RegisterAndLoginAsync($"farmer_{Guid.NewGuid()}@test.com");
        SetBearerToken(token);

        await _client.PostAsJsonAsync("/api/farms", new
        {
            nome      = "Fazenda Persistida",
            cidade    = "Garanhuns",
            estado    = "PE",
            latitude  = -8.887,
            longitude = -36.493
        });

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var exists = db.Farms.Any(f => f.Nome == "Fazenda Persistida");
        exists.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteFarm_WithValidId_Returns204()
    {
        var token = await RegisterAndLoginAsync($"farmer_{Guid.NewGuid()}@test.com");
        SetBearerToken(token);

        var createResponse = await _client.PostAsJsonAsync("/api/farms", new
        {
            nome      = "Fazenda Deletável",
            cidade    = "Petrolina",
            estado    = "PE",
            latitude  = -9.389,
            longitude = -40.502
        });

        var created = await createResponse.Content.ReadFromJsonAsync<CreateFarmResponse>();
        var deleteResponse = await _client.DeleteAsync($"/api/farms/{created!.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
}

file record LoginResponse(string AccessToken, string RefreshToken);
file record CreateFarmResponse(Guid Id);
