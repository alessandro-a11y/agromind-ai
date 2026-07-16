using AgroMind.Domain.Enums;

namespace AgroMind.Application.Features.Alerts.Queries.GetAlerts;

public record AlertDto(
    Guid        Id,
    Guid        FarmId,
    string      FarmNome,
    Guid?       FieldId,
    string?     FieldNome,
    AlertType   Tipo,
    string      TipoLabel,
    string      Descricao,
    AlertStatus Status,
    string      StatusLabel,
    RiskLevel   Severity,
    string      SeverityLabel,
    DateTime    CreatedAt
);
