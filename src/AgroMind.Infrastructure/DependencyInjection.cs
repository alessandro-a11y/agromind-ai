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
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        Console.WriteLine("========================================");
        Console.WriteLine("AGROMIND - INFRASTRUCTURE DEBUG");
        Console.WriteLine("========================================");
        Console.WriteLine($"Environment: {environment.EnvironmentName}");
        Console.WriteLine();

        Console.WriteLine("Connection String:");
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