using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Crops.Commands.CreateCrop;

public class CreateCropCommandHandler : IRequestHandler<CreateCropCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;

    public CreateCropCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(
        CreateCropCommand request,
        CancellationToken cancellationToken)
    {
        var fieldExists = await _context.Fields
            .AnyAsync(f => f.Id == request.FieldId, cancellationToken);

        if (!fieldExists)
            return Result<Guid>.Fail("Talhão não encontrado.");

        var crop = new Crop(
            request.FieldId,
            request.Nome,
            request.DataPlantio,
            request.AreaPlantada,
            request.DataColheita);

        _context.Crops.Add(crop);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Ok(crop.Id);
    }
}
