using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Alerts.Commands.ResolveAlert;

public record ResolveAlertCommand(Guid AlertId, Guid UserId) : IRequest<Result<bool>>;
