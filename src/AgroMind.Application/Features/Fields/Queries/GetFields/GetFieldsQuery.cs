using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Fields.Queries.GetFields;

public record FieldDto(
    Guid Id,
    string Nome,
    double Area,
    string TipoSolo,
    double Ph,
    int TotalCulturas
);

public record GetFieldsQuery(Guid FarmId) : IRequest<Result<List<FieldDto>>>;
