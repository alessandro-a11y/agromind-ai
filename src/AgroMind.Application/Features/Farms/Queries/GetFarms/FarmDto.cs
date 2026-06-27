namespace AgroMind.Application.Features.Farms.Queries.GetFarms;

public record FarmDto(
    Guid    Id,
    string  Nome,
    string  Cidade,
    string  Estado,
    double? Latitude,
    double? Longitude,
    int     FieldsCount,
    double  HealthIndex,
    int     ActiveAlerts,
    string  Status
);
