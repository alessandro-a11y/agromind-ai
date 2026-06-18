using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Crops.Commands.CreateCrop;

public record CreateCropCommand(
    Guid FieldId,
    string Nome,
    DateTime DataPlantio,
    double AreaPlantada,
    DateTime? DataColheita
) : IRequest<Result<Guid>>;
