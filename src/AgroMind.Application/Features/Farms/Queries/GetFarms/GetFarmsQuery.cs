using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Farms.Queries.GetFarms;

public record FarmDto(
    Guid Id,
    string Nome,
    string Cidade,
    string Estado,
    double? Latitude,
    double? Longitude,
    int TotalTalhoes
);

public record GetFarmsQuery(Guid UserId) : IRequest<Result<List<FarmDto>>>;
