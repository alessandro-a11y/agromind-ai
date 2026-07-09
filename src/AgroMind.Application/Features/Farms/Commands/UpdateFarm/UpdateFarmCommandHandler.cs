using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AgroMind.Application.Features.Farms.Commands.UpdateFarm;

public class UpdateFarmCommandHandler : IRequestHandler<UpdateFarmCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    public UpdateFarmCommandHandler(IApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<Result<bool>> Handle(
        UpdateFarmCommand request,
        CancellationToken cancellationToken)
    {
        var farm = await _context.Farms
            .FirstOrDefaultAsync(f => f.Id == request.Id && f.UserId == request.UserId,
                cancellationToken);

        if (farm is null)
            return Result<bool>.Fail("Fazenda não encontrada ou sem permissão.");

        farm.Update(request.Nome, request.Cidade, request.Estado,
                    request.Latitude, request.Longitude);

        await _context.SaveChangesAsync(cancellationToken);

        // Invalida o cache de listagem de fazendas do usuário, ou a UI mostra
        // dados desatualizados (ex: lat/long antiga no mapa) por até 5 minutos.
        _cache.Remove($"farms:user:{request.UserId}");

        return Result<bool>.Ok(true);
    }
}