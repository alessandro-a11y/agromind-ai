using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Farms.Commands.DeleteFarm;

public record DeleteFarmCommand(Guid Id, Guid UserId) : IRequest<Result<bool>>;
