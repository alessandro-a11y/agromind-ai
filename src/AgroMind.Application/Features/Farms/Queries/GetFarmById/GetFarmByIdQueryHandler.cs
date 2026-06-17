using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Application.Features.Farms.Queries.GetFarms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Farms.Queries.GetFarmById;

public class GetFarmByIdQueryHandler : IRequestHandler<GetFarmByIdQuery, Result<FarmDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFarmByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<FarmDto>> Handle(
        GetFarmByIdQuery request,
        CancellationToken cancellationToken)
    {
        var farm = await _context.Farms
            .Include(f => f.Fields)
            .Where(f => f.Id == request.Id && f.UserId == request.UserId)
            .Select(f => new FarmDto(
                f.Id,
                f.Nome,
                f.Cidade,
                f.Estado,
                f.Latitude,
                f.Longitude,
                f.Fields.Count
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (farm is null)
            return Result<FarmDto>.Fail("Fazenda não encontrada.");

        return Result<FarmDto>.Ok(farm);
    }
}
