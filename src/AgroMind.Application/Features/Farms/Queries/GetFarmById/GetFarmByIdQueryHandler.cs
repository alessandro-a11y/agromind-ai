using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Application.Features.Farms.Queries.GetFarms;
using AgroMind.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AgroMind.Application.Features.Farms.Queries.GetFarmById;

public class GetFarmByIdQueryHandler : IRequestHandler<GetFarmByIdQuery, Result<FarmDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    public GetFarmByIdQueryHandler(IApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache   = cache;
    }

    public async Task<Result<FarmDto>> Handle(
        GetFarmByIdQuery request,
        CancellationToken cancellationToken)
    {
        var cacheKey = $"farm:{request.Id}:user:{request.UserId}";

        if (_cache.TryGetValue(cacheKey, out FarmDto? cached))
            return Result<FarmDto>.Ok(cached!);

        var farm = await _context.Farms
            .AsNoTracking()
            .Where(f => f.Id == request.Id && f.UserId == request.UserId)
            .Select(f => new
            {
                f.Id,
                f.Nome,
                f.Cidade,
                f.Estado,
                f.Latitude,
                f.Longitude,
                FieldsCount  = f.Fields.Count,
                ActiveAlerts = f.Alerts.Count(a => a.Status == AlertStatus.Active),
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (farm is null)
            return Result<FarmDto>.Fail("Fazenda não encontrada.");

        // Diagnóstico mais recente por talhão dessa fazenda
        var risks = await _context.Diagnoses
            .AsNoTracking()
            .Where(d => d.Field.FarmId == request.Id)
            .GroupBy(d => d.FieldId)
            .Select(g => g.OrderByDescending(d => d.CreatedAt)
                          .Select(d => d.Resultado)
                          .First())
            .ToListAsync(cancellationToken);

        double healthIndex = risks.Count == 0
            ? 100.0
            : risks.Average(r => r switch
            {
                RiskLevel.Low      => 100.0,
                RiskLevel.Medium   => 66.0,
                RiskLevel.High     => 33.0,
                RiskLevel.Critical => 0.0,
                _                  => 100.0
            });

        string status = healthIndex >= 80 ? "Saudável"
                      : healthIndex >= 50 ? "Atenção"
                                          : "Crítico";

        var dto = new FarmDto(
            farm.Id,
            farm.Nome,
            farm.Cidade,
            farm.Estado,
            farm.Latitude,
            farm.Longitude,
            farm.FieldsCount,
            Math.Round(healthIndex, 1),
            farm.ActiveAlerts,
            status
        );

        _cache.Set(cacheKey, dto, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
            SlidingExpiration               = TimeSpan.FromMinutes(2),
            Size                            = 1
        });

        return Result<FarmDto>.Ok(dto);
    }
}
