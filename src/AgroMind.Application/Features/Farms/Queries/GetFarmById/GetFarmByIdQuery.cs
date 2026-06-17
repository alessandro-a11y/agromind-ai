using AgroMind.Application.Common.Models;
using AgroMind.Application.Features.Farms.Queries.GetFarms;
using MediatR;

namespace AgroMind.Application.Features.Farms.Queries.GetFarmById;

public record GetFarmByIdQuery(Guid Id, Guid UserId) : IRequest<Result<FarmDto>>;
