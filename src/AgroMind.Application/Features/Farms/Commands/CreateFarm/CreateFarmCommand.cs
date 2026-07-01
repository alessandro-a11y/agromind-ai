using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Farms.Commands.CreateFarm;

public record CreateFarmCommand(
    Guid UserId,
    string Nome,
    string Cidade,
    string Estado,
    double? Latitude,
    double? Longitude
) : IRequest<Result<Guid>>;
