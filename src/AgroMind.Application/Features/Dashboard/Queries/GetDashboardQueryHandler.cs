using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Dashboard.Queries;

public class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, Result<DashboardDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DashboardDto>> Handle(
        GetDashboardQuery request,
        CancellationToken cancellationToken)
    {
        var farmIds = await _context.Farms
            .Where(f => f.UserId == request.UserId)
            .Select(f => f.Id)
            .ToListAsync(cancellationToken);

        var totalFazendas = farmIds.Count;

        var totalTalhoes = await _context.Fields
            .CountAsync(f => farmIds.Contains(f.FarmId), cancellationToken);

        var fieldIds = await _context.Fields
            .Where(f => farmIds.Contains(f.FarmId))
            .Select(f => f.Id)
            .ToListAsync(cancellationToken);

        var totalCulturas = await _context.Crops
            .CountAsync(c => fieldIds.Contains(c.FieldId), cancellationToken);

        var alertasAtivos = await _context.Alerts
            .CountAsync(a => farmIds.Contains(a.FarmId)
                          && a.Status == AlertStatus.Active, cancellationToken);

        var hoje = DateTime.UtcNow.Date;
        var diagnosticosHoje = await _context.Diagnoses
            .CountAsync(d => fieldIds.Contains(d.FieldId)
                          && d.CreatedAt.Date == hoje, cancellationToken);

        return Result<DashboardDto>.Ok(new DashboardDto(
            totalFazendas,
            totalTalhoes,
            totalCulturas,
            alertasAtivos,
            diagnosticosHoje));
    }
}
