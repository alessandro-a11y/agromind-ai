using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Entities;
using MediatR;

namespace AgroMind.Application.Features.Farms.Commands.CreateFarm;

public class CreateFarmCommandHandler : IRequestHandler<CreateFarmCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;

    public CreateFarmCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(
        CreateFarmCommand request,
        CancellationToken cancellationToken)
    {
        var farm = new Farm(
            request.UserId,
            request.Nome,
            request.Cidade,
            request.Estado,
            request.Latitude,
            request.Longitude
        );

        _context.Farms.Add(farm);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Ok(farm.Id);
    }
}
