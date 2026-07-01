using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Crops.Queries.GetCrops;

public class GetCropsQueryHandler : IRequestHandler<GetCropsQuery, Result<List<CropDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetCropsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<CropDto>>> Handle(
        GetCropsQuery request,
        CancellationToken cancellationToken)
    {
        var crops = await _context.Crops
            .Where(c => c.FieldId == request.FieldId)
            .Select(c => new CropDto(
                c.Id,
                c.Nome,
                c.DataPlantio,
                c.DataColheita,
                c.AreaPlantada))
            .ToListAsync(cancellationToken);

        return Result<List<CropDto>>.Ok(crops);
    }
}
