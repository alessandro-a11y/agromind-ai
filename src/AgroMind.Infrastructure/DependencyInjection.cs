using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Features.Weather.Interfaces;
using AgroMind.Infrastructure.Persistence;
using AgroMind.Infrastructure.Services;
using AgroMind.Infrastructure.Services.Ai;
using AgroMind.Infrastructure.Services.Weather;
using Hangfire;
using Hangfire.InMemory;
using Hangfire.PostgreSql;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Npgsql;
using QuestPDF.Infrastructure;
using Resend;

namespace AgroMind.Infrastructure;

public static class DependencyInjection
{
    /// <summary>
    /// Converte uma connection string no formato URL (postgresql://user:pass@host:port/db)
    /// para o formato ADO.NET (Host=...;Database=...;Username=...;Password=...)
    /// </summary>
    private static string ConvertToAdoNetFormat(string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
            return connectionString;

        // Se já estiver no formato ADO.NET (contém "Host=" ou "Server="), retorna como está
        if (connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
            connectionString.Contains("Server=", StringComparison.OrdinalIgnoreCase))
            return connectionString;

        // Tenta fazer parse como URL (postgresql:// ou postgres://)
        try
        {
            var uri = new Uri(connectionString);
            var userInfo = uri.UserInfo?.Split(':') ?? Array.Empty<string>();
            var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
            var host = uri.Host;
            var port = uri.Port > 0 ? uri.Port : 5432;
            var database = uri.AbsolutePath.TrimStart('/');

            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = host,
                Port = port,
                Database = database,
                Username = username,
                Password = password,
                SslMode = SslMode.Prefer
            };

            Console.WriteLine("Connection String convertida de URL para ADO.NET.");
            return builder.ConnectionString;
        }
        catch
        {
            // Se não for URL válida, retorna a original (pode ser outro formato)
            return connectionString;
        }
    }

    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var rawConnectionString = configuration.GetConnectionString("DefaultConnection");
        var connectionString = ConvertToAdoNetFormat(rawConnectionString);

        Console.WriteLine("========================================");
        Console.WriteLine("AGROMIND - INFRASTRUCTURE DEBUG");
        Console.WriteLine("========================================");
        Console.WriteLine($"Environment: {environment.EnvironmentName}");
        Console.WriteLine();

        Console.WriteLine("Raw Connection String:");
        Console.WriteLine(rawConnectionString ?? "(NULL)");
        Console.WriteLine();

        Console.WriteLine("Converted Connection String:");
        Console.WriteLine(connectionString ?? "(NULL)");
        Console.WriteLine();

        Console.WriteLine($"Length: {connectionString?.Length ?? 0}");
        Console.WriteLine("========================================");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new Exception("A ConnectionStrings:DefaultConnection não foi carregada.");

        try
        {
            var builder = new NpgsqlConnectionStringBuilder(connectionString);

            Console.WriteLine("Connection String válida.");
            Console.WriteLine($"Host: {builder.Host}");
            Console.WriteLine($"Database: {builder.Database}");
            Console.WriteLine($"Username: {builder.Username}");
            Console.WriteLine($"SSL Mode: {builder.SslMode}");
            Console.WriteLine("========================================");
        }
        catch (Exception ex)
        {
            Console.WriteLine("ERRO AO VALIDAR CONNECTION STRING");
            Console.WriteLine($"Valor recebido: {rawConnectionString}");
            Console.WriteLine(ex.ToString());
            throw;
        }

        QuestPDF.Settings.License = LicenseType.Community;

        services.AddSingleton<AuditInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString);
            options.AddInterceptors(sp.GetRequiredService<AuditInterceptor>());
        });

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        services.AddScoped<IPasswordService, PasswordService>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddSingleton<IEmailService, EmailService>();
        services.AddScoped<ICalculateRiskService, CalculateRiskService>();
        services.AddScoped<IDiagnosisReportService, DiagnosisReportService>();

        services.Configure<FastApiOptions>(
            configuration.GetSection("FastApi"));

        services.AddResend(options =>
            options.ApiToken = configuration["Resend:ApiKey"] ?? string.Empty);

        services.AddMemoryCache();

        if (environment.IsEnvironment("Testing"))
        {
            services.AddHangfire(config => config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UseInMemoryStorage());
        }
        else
        {
            services.AddHangfire(config => config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(options =>
                    options.UseNpgsqlConnection(connectionString)));
        }

        services.AddHangfireServer(options =>
        {
            options.WorkerCount = 2;
            options.Queues = new[] { "default", "agromind" };
        });

        services.AddHttpClient<IWeatherService, WeatherService>();

        services.AddHttpClient<IAiDiagnosisService, FastApiDiagnosisService>((_, client) =>
        {
            var baseUrl = configuration["FastApi:BaseUrl"];

            if (!string.IsNullOrWhiteSpace(baseUrl))
                client.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");

            client.Timeout = TimeSpan.FromSeconds(
                configuration.GetValue("FastApi:TimeoutSeconds", 30));
        });

        services.AddHttpClient<IAiChatService, FastApiChatService>((_, client) =>
        {
            var baseUrl = configuration["FastApi:BaseUrl"];

            if (!string.IsNullOrWhiteSpace(baseUrl))
                client.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");

            client.Timeout = TimeSpan.FromSeconds(
                configuration.GetValue("FastApi:TimeoutSeconds", 30));
        });

        services.AddHttpClient("FastApiHealth", client =>
        {
            var baseUrl = configuration["FastApi:BaseUrl"];

            if (!string.IsNullOrWhiteSpace(baseUrl))
                client.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");

            client.Timeout = TimeSpan.FromSeconds(5);
        });

        return services;
    }
}