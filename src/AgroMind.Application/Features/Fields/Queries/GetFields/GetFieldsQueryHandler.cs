using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Fields.Queries.GetFields;

public class GetFieldsQueryHandler : IRequestHandler<GetFieldsQuery, Result<List<FieldDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetFieldsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<FieldDto>>> Handle(
        GetFieldsQuery request,
        CancellationToken cancellationToken)
    {
        var fields = await _context.Fields
            .Where(f => f.FarmId == request.FarmId)
            .Select(f => new FieldDto(
                f.Id,
                f.Nome,
                f.Area,
                f.TipoSolo,
                f.Ph,
                f.Crops.Count))
            .ToListAsync(cancellationToken);

        return Result<List<FieldDto>>.Ok(fields);
    }
}
