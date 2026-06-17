using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Farms.Commands.UpdateFarm;

public record UpdateFarmCommand(
    Guid Id,
    Guid UserId,
    string Nome,
    string Cidade,
    string Estado,
    double? Latitude,
    double? Longitude
) : IRequest<Result<bool>>;
