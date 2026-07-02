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
using Resend;
using QuestPDF.Infrastructure;

namespace AgroMind.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")!;

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
        services.Configure<FastApiOptions>(configuration.GetSection("FastApi"));

        services.AddResend(options =>
            options.ApiToken = configuration["Resend:ApiKey"] ?? string.Empty);

        services.AddMemoryCache();

        // Hangfire — InMemory em ambiente de teste, PostgreSQL nos demais
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
            options.Queues = ["default", "agromind"];
        });

        services.AddHttpClient<IWeatherService, WeatherService>();
        services.AddHttpClient<IAiDiagnosisService, FastApiDiagnosisService>((_, client) =>
        {
            var baseUrl = configuration["FastApi:BaseUrl"];
            if (!string.IsNullOrWhiteSpace(baseUrl))
                client.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");

            var timeoutSeconds = configuration.GetValue("FastApi:TimeoutSeconds", 30);
            client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
        });
        services.AddHttpClient<IAiChatService, FastApiChatService>((_, client) =>
        {
            var baseUrl = configuration["FastApi:BaseUrl"];
            if (!string.IsNullOrWhiteSpace(baseUrl))
                client.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");

            var timeoutSeconds = configuration.GetValue("FastApi:TimeoutSeconds", 30);
            client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
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
