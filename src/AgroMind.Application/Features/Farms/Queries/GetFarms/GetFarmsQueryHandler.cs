using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Collections.Concurrent;

namespace AgroMind.Application.Features.Farms.Queries.GetFarms;

public class GetFarmsQueryHandler : IRequestHandler<GetFarmsQuery, Result<List<FarmDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    // Um semáforo por userId — evita cache stampede sob carga
    private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> _locks = new();

    public GetFarmsQueryHandler(IApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache   = cache;
    }

    public async Task<Result<List<FarmDto>>> Handle(
        GetFarmsQuery request,
        CancellationToken cancellationToken)
    {
        var cacheKey = $"farms:user:{request.UserId}";

        if (_cache.TryGetValue(cacheKey, out List<FarmDto>? cached))
            return Result<List<FarmDto>>.Ok(cached!);

        var sem = _locks.GetOrAdd(request.UserId, _ => new SemaphoreSlim(1, 1));
        await sem.WaitAsync(cancellationToken);
        try
        {
            // Double-check após adquirir o lock
            if (_cache.TryGetValue(cacheKey, out cached))
                return Result<List<FarmDto>>.Ok(cached!);

            var dtos = await BuildFarmDtosAsync(request.UserId, cancellationToken);

            _cache.Set(cacheKey, dtos, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
                SlidingExpiration               = TimeSpan.FromMinutes(2),
                Size                            = 1
            });

            return Result<List<FarmDto>>.Ok(dtos);
        }
        finally
        {
            sem.Release();
        }
    }

    private async Task<List<FarmDto>> BuildFarmDtosAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        // Busca fazendas + contagem de talhões + alertas ativos — sem histórico
        var farms = await _context.Farms
            .AsNoTracking()
            .Where(f => f.UserId == userId)
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
            .ToListAsync(cancellationToken);

        if (farms.Count == 0)
            return [];

        var farmIds = farms.Select(f => f.Id).ToList();

        // Subquery: só o diagnóstico mais recente por talhão — O(talhões) no SQL
        var latestDiagnoses = await _context.Diagnoses
            .AsNoTracking()
            .Where(d => farmIds.Contains(d.Field.FarmId))
            .GroupBy(d => d.FieldId)
            .Select(g => new
            {
                FieldId    = g.Key,
                FarmId     = g.First().Field.FarmId,
                Resultado  = g.OrderByDescending(d => d.CreatedAt)
                              .Select(d => d.Resultado)
                              .First()
            })
            .ToListAsync(cancellationToken);

        // Índice em memória: farmId → lista de RiskLevels
        var riskByFarm = latestDiagnoses
            .GroupBy(d => d.FarmId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(d => d.Resultado).ToList()
            );

        return farms.Select(f =>
        {
            var risks = riskByFarm.GetValueOrDefault(f.Id, []);

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

            return new FarmDto(
                f.Id,
                f.Nome,
                f.Cidade,
                f.Estado,
                f.Latitude,
                f.Longitude,
                f.FieldsCount,
                Math.Round(healthIndex, 1),
                f.ActiveAlerts,
                status
            );
        }).ToList();
    }
}
