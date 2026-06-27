using AgroMind.Domain.Enums;

namespace AgroMind.Application.Features.Alerts.Queries.GetAlerts;

public record AlertDto(
    Guid        Id,
    Guid        FarmId,
    string      FarmNome,
    AlertType   Tipo,
    string      TipoLabel,
    string      Descricao,
    AlertStatus Status,
    string      StatusLabel,
    DateTime    CreatedAt
);
