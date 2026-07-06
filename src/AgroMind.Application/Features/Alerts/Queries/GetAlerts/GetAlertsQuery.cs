using AgroMind.Application.Common.Models;
using AgroMind.Domain.Enums;
using MediatR;

namespace AgroMind.Application.Features.Alerts.Queries.GetAlerts;

public record GetAlertsQuery(
    Guid         UserId,
    AlertStatus? Status = null,   // null = todos
    Guid?        FarmId = null,   // null = todas as fazendas
    AlertType?   Tipo   = null,   // null = todos os tipos
    DateTime?    From   = null,
    DateTime?    To     = null,
    int          Page   = 1,
    int          Size   = 20
) : IRequest<Result<PagedResult<AlertDto>>>;
