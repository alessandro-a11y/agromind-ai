using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AgroMind.Application.Features.Dashboard.Queries;

public class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, Result<DashboardDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMemoryCache          _cache;

    public GetDashboardQueryHandler(IApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache   = cache;
    }

    public async Task<Result<DashboardDto>> Handle(
        GetDashboardQuery request,
        CancellationToken cancellationToken)
    {
        var cacheKey = $"dashboard:user:{request.UserId}";

        if (_cache.TryGetValue(cacheKey, out DashboardDto? cached))
            return Result<DashboardDto>.Ok(cached!);

        // Uma query só — agrega tudo no banco
        var stats = await _context.Farms
            .AsNoTracking()
            .Where(f => f.UserId == request.UserId)
            .Select(f => new
            {
                TotalTalhoes  = f.Fields.Count,
                TotalCulturas = f.Fields.Sum(fi => fi.Crops.Count),
                AlertasAtivos = f.Alerts.Count(a => a.Status == AlertStatus.Active),
                DiagnosticosHoje = f.Fields
                    .SelectMany(fi => fi.Diagnoses)
                    .Count(d => d.CreatedAt.Date == DateTime.UtcNow.Date)
            })
            .GroupBy(_ => 1)
            .Select(g => new
            {
                TotalFazendas    = g.Count(),
                TotalTalhoes     = g.Sum(x => x.TotalTalhoes),
                TotalCulturas    = g.Sum(x => x.TotalCulturas),
                AlertasAtivos    = g.Sum(x => x.AlertasAtivos),
                DiagnosticosHoje = g.Sum(x => x.DiagnosticosHoje)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var dto = new DashboardDto(
            stats?.TotalFazendas    ?? 0,
            stats?.TotalTalhoes     ?? 0,
            stats?.TotalCulturas    ?? 0,
            stats?.AlertasAtivos    ?? 0,
            stats?.DiagnosticosHoje ?? 0
        );

        _cache.Set(cacheKey, dto, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(3),
            SlidingExpiration               = TimeSpan.FromMinutes(1),
            Size                            = 1
        });

        return Result<DashboardDto>.Ok(dto);
    }
}
