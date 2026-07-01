using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Crops.Queries.GetCrops;

public record CropDto(
    Guid Id,
    string Nome,
    DateTime DataPlantio,
    DateTime? DataColheita,
    double AreaPlantada
);

public record GetCropsQuery(Guid FieldId) : IRequest<Result<List<CropDto>>>;
