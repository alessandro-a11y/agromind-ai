using AgroMind.API.Middlewares;
using AgroMind.Application;
using AgroMind.Infrastructure;
using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;
using System.Threading.RateLimiting;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using AgroMind.Application.Common.Telemetry;
using AgroMind.Infrastructure.Services.Ai;

var builder = WebApplication.CreateBuilder(args);

// ==========================
// DEBUG CONFIGURAÇÃO
// ==========================
Console.WriteLine("==========================================");
Console.WriteLine("AGROMIND - CONFIG DEBUG");
Console.WriteLine("==========================================");

Console.WriteLine($"ASPNETCORE_ENVIRONMENT: {builder.Environment.EnvironmentName}");

Console.WriteLine("ConnectionStrings__DefaultConnection:");
Console.WriteLine(
    Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? "(NULL)"
);

Console.WriteLine();

Console.WriteLine("GetConnectionString(DefaultConnection):");
Console.WriteLine(
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "(NULL)"
);

Console.WriteLine("==========================================");

// Serilog
builder.Host.UseSerilog((context, services, config) =>
{
    config
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .WriteTo.Console();
});

// Camadas
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);

builder.Services.AddControllers();

// JWT
var jwtSecret = builder.Configuration["Jwt:Secret"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret))
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[JWT FAIL] {context.Exception.Message}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Rate Limiter
var isTestingEnv = builder.Environment.IsEnvironment("Testing");

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = isTestingEnv ? 10000 : 100;
        opt.QueueLimit = isTestingEnv ? 1000 : 0;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("Default", policy =>
    {
        var allowed = Environment.GetEnvironmentVariable("Cors__AllowedOrigins")
            ?? Environment.GetEnvironmentVariable("AllowedOrigins")
            ?? builder.Configuration["Cors:AllowedOrigins"];
        string[] origins;
        if (!string.IsNullOrWhiteSpace(allowed))
        {
            origins = allowed.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }
        else
        {
            origins = new[] { "http://localhost:5173", "http://localhost:3000" };
        }

        policy
            .WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddCheck<FastApiHealthCheck>("fastapi");

// OpenTelemetry
if (!builder.Environment.IsEnvironment("Testing"))
{
    var otlpEndpoint = builder.Configuration["OpenTelemetry:OtlpEndpoint"];

    builder.Services.AddOpenTelemetry()
        .ConfigureResource(resource =>
            resource.AddService("AgroMind.API"))
        .WithTracing(tracing =>
        {
            tracing
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddEntityFrameworkCoreInstrumentation();

            if (!string.IsNullOrWhiteSpace(otlpEndpoint))
                tracing.AddOtlpExporter(o =>
                    o.Endpoint = new Uri(otlpEndpoint));
        })
        .WithMetrics(metrics =>
        {
            metrics
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddMeter(DiagnosisMetrics.MeterName);

            if (!string.IsNullOrWhiteSpace(otlpEndpoint))
                metrics.AddOtlpExporter(o =>
                    o.Endpoint = new Uri(otlpEndpoint));
        });
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseMiddleware<ErrorHandlingMiddleware>();
}

app.UseSerilogRequestLogging();

app.UseCors("Default");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

if (!app.Environment.IsEnvironment("Testing"))
{
    app.UseHangfireDashboard("/hangfire");
}

app.MapControllers();

app.MapHealthChecks("/api/health");

app.MapGet("/", () => "AgroMind API rodando!");

app.Run();

public partial class Program
{
}