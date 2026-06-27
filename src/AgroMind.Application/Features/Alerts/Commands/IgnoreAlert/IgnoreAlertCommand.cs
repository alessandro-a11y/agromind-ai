using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Alerts.Commands.IgnoreAlert;

public record IgnoreAlertCommand(Guid AlertId, Guid UserId) : IRequest<Result<bool>>;
