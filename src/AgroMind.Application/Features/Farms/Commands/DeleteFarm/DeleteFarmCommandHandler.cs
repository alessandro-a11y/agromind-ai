using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Farms.Commands.DeleteFarm;

public class DeleteFarmCommandHandler : IRequestHandler<DeleteFarmCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public DeleteFarmCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(
        DeleteFarmCommand request,
        CancellationToken cancellationToken)
    {
        var farm = await _context.Farms
            .FirstOrDefaultAsync(f => f.Id == request.Id && f.UserId == request.UserId,
                cancellationToken);

        if (farm is null)
            return Result<bool>.Fail("Fazenda não encontrada ou sem permissão.");

        _context.Farms.Remove(farm);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<bool>.Ok(true);
    }
}
