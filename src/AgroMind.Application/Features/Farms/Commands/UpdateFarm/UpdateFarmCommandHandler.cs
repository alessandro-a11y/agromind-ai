using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Farms.Commands.UpdateFarm;

public class UpdateFarmCommandHandler : IRequestHandler<UpdateFarmCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public UpdateFarmCommandHandler(IApplicationDbContext context)
    {
        _context = context;
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
        return Result<bool>.Ok(true);
    }
}
