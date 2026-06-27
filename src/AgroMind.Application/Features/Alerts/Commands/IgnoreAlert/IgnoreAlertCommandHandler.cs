using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AgroMind.Application.Features.Alerts.Commands.IgnoreAlert;

public class IgnoreAlertCommandHandler : IRequestHandler<IgnoreAlertCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMemoryCache          _cache;

    public IgnoreAlertCommandHandler(IApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache   = cache;
    }

    public async Task<Result<bool>> Handle(
        IgnoreAlertCommand command,
        CancellationToken  cancellationToken)
    {
        var alert = await _context.Alerts
            .Include(a => a.Farm)
            .FirstOrDefaultAsync(
                a => a.Id == command.AlertId && a.Farm.UserId == command.UserId,
                cancellationToken);

        if (alert is null)
            return Result<bool>.Fail("Alerta não encontrado.");

        alert.Ignore();
        await _context.SaveChangesAsync(cancellationToken);

        _cache.Remove($"alerts:user:{command.UserId}:active:p1");
        _cache.Remove($"dashboard:user:{command.UserId}");

        return Result<bool>.Ok(true);
    }
}
