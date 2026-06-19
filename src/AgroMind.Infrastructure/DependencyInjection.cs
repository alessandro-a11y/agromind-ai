using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Features.Weather.Interfaces;
using AgroMind.Infrastructure.Persistence;
using AgroMind.Infrastructure.Services;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using AgroMind.Infrastructure.Services.Weather;
using Resend;

namespace AgroMind.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")!;

        // AuditInterceptor — registrado como singleton para ser injetado no DbContext
        services.AddSingleton<AuditInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString);
            options.AddInterceptors(sp.GetRequiredService<AuditInterceptor>());
        });

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        // Serviços de domínio
        services.AddScoped<IPasswordService, PasswordService>();
        services.AddScoped<IJwtService, JwtService>();
services.AddSingleton<IEmailService, EmailService>();
        services.AddScoped<ICalculateRiskService, CalculateRiskService>();

        // Resend — email service
        services.AddResend(options =>
        options.ApiToken = configuration["Resend:ApiKey"] ?? string.Empty);

        // Cache em memória (TTL gerenciado por quem usa)
        services.AddMemoryCache();

        // Hangfire com PostgreSQL
        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(options =>
                options.UseNpgsqlConnection(connectionString)));
        services.AddHangfireServer(options =>
        {
            options.WorkerCount = 2;
            options.Queues = ["default", "agromind"];
        });

        services.AddHttpClient<IWeatherService, WeatherService>();
        return services;
    }
}