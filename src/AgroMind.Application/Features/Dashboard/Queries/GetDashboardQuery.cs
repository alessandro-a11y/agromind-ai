using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Dashboard.Queries;

public record DashboardFarmSummaryDto(
    Guid    Id,
    string  Nome,
    string  Cidade,
    string  Estado,
    double? Latitude,
    double? Longitude
);

public record DashboardAlertSummaryDto(
    Guid     Id,
    Guid     FarmId,
    string   FarmNome,
    string   TipoLabel,
    string   Descricao,
    DateTime CreatedAt
);

public record DashboardWeatherSummaryDto(
    Guid     FarmId,
    double   Temperature,
    double   Humidity,
    double   WindSpeed,
    double   RainProbability,
    DateTime MeasuredAt
);

public record DashboardDto(
    int TotalFazendas,
    int TotalTalhoes,
    int TotalCulturas,
    int AlertasAtivos,
    int DiagnosticosHoje,
    List<DashboardFarmSummaryDto>  Farms,
    List<DashboardAlertSummaryDto> RecentAlerts,
    DashboardWeatherSummaryDto?    PrimaryFarmWeather
);

public record GetDashboardQuery(Guid UserId) : IRequest<Result<DashboardDto>>;
