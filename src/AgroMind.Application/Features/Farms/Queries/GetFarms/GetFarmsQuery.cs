using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Farms.Queries.GetFarms;

public record GetFarmsQuery(Guid UserId) : IRequest<Result<List<FarmDto>>>;
