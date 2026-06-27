using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AgroMind.Application.Features.Alerts.Queries.GetAlerts;

public class GetAlertsQueryHandler : IRequestHandler<GetAlertsQuery, Result<PagedResult<AlertDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMemoryCache          _cache;

    public GetAlertsQueryHandler(IApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache   = cache;
    }

    public async Task<Result<PagedResult<AlertDto>>> Handle(
        GetAlertsQuery    request,
        CancellationToken cancellationToken)
    {
        // Cache só pra listagem de ativos (mais comum) — página 1
        var useCache = request.Status == AlertStatus.Active && request.Page == 1;
        var cacheKey = $"alerts:user:{request.UserId}:active:p1";

        if (useCache && _cache.TryGetValue(cacheKey, out PagedResult<AlertDto>? cached))
            return Result<PagedResult<AlertDto>>.Ok(cached!);

        var query = _context.Alerts
            .AsNoTracking()
            .Where(a => a.Farm.UserId == request.UserId);

        if (request.Status.HasValue)
            query = query.Where(a => a.Status == request.Status.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((request.Page - 1) * request.Size)
            .Take(request.Size)
            .Select(a => new AlertDto(
                a.Id,
                a.FarmId,
                a.Farm.Nome,
                a.Tipo,
                TipoLabel(a.Tipo),
                a.Descricao,
                a.Status,
                StatusLabel(a.Status),
                a.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        var result = new PagedResult<AlertDto>(
            items,
            totalCount,
            request.Page,
            request.Size,
            (int)Math.Ceiling(totalCount / (double)request.Size)
        );

        if (useCache)
            _cache.Set(cacheKey, result, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2),
                Size = 1
            });

        return Result<PagedResult<AlertDto>>.Ok(result);
    }

    private static string TipoLabel(AlertType tipo) => tipo switch
    {
        AlertType.Drought   => "Seca",
        AlertType.Frost     => "Geada",
        AlertType.HeavyRain => "Chuva Extrema",
        AlertType.LowPH     => "pH Baixo",
        AlertType.Pest      => "Praga",
        _                   => tipo.ToString()
    };

    private static string StatusLabel(AlertStatus status) => status switch
    {
        AlertStatus.Active   => "Ativo",
        AlertStatus.Resolved => "Resolvido",
        AlertStatus.Ignored  => "Ignorado",
        _                    => status.ToString()
    };
}
