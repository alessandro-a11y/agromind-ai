using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Fields.Commands.CreateField;

public record CreateFieldCommand(
    Guid FarmId,
    string Nome,
    double Area,
    string TipoSolo,
    double Ph
) : IRequest<Result<Guid>>;
