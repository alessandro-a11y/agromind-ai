using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Farms.Queries.GetFarms;

public class GetFarmsQueryHandler : IRequestHandler<GetFarmsQuery, Result<List<FarmDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetFarmsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<FarmDto>>> Handle(
        GetFarmsQuery request,
        CancellationToken cancellationToken)
    {
        var farms = await _context.Farms
            .Where(f => f.UserId == request.UserId)
            .Include(f => f.Fields)
            .Select(f => new FarmDto(
                f.Id,
                f.Nome,
                f.Cidade,
                f.Estado,
                f.Latitude,
                f.Longitude,
                f.Fields.Count
            ))
            .ToListAsync(cancellationToken);

        return Result<List<FarmDto>>.Ok(farms);
    }
}
