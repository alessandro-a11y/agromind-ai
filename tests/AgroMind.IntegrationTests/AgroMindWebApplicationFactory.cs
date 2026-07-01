using AgroMind.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace AgroMind.IntegrationTests;

public sealed class AgroMindWebApplicationFactory
    : WebApplicationFactory<Program>, IAsyncLifetime
{
    private const string TestingEnvironment = "Testing";

    private readonly string? _previousAspNetCoreEnvironment;
    private readonly string? _previousDotnetEnvironment;

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:16-alpine")
        .WithDatabase("agromind_test")
        .WithUsername("test")
        .WithPassword("test")
        .Build();

    public AgroMindWebApplicationFactory()
    {
        _previousAspNetCoreEnvironment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        _previousDotnetEnvironment = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT");

        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", TestingEnvironment);
        Environment.SetEnvironmentVariable("DOTNET_ENVIRONMENT", TestingEnvironment);
    }

    public async Task InitializeAsync() => await _postgres.StartAsync();

    public new async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
        await base.DisposeAsync();

        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", _previousAspNetCoreEnvironment);
        Environment.SetEnvironmentVariable("DOTNET_ENVIRONMENT", _previousDotnetEnvironment);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var connString = _postgres.GetConnectionString();

        builder.UseEnvironment(TestingEnvironment);

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = connString,
                ["Jwt:Secret"] = "integration-test-secret-key-minimo-32-caracteres",
                ["Jwt:Issuer"] = "AgroMind",
                ["Jwt:Audience"] = "AgroMindUsers",
                ["Resend:ApiKey"] = "test-key"
            });
        });

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

            if (descriptor is not null)
                services.Remove(descriptor);

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connString));

            var sp = services.BuildServiceProvider();

            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            db.Database.Migrate();
        });
    }
}