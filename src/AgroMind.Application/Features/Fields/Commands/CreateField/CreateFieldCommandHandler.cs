using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Fields.Commands.CreateField;

public class CreateFieldCommandHandler : IRequestHandler<CreateFieldCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;

    public CreateFieldCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(
        CreateFieldCommand request,
        CancellationToken cancellationToken)
    {
        var farmExists = await _context.Farms
            .AnyAsync(f => f.Id == request.FarmId, cancellationToken);

        if (!farmExists)
            return Result<Guid>.Fail("Fazenda não encontrada.");

        var field = new Field(
            request.FarmId,
            request.Nome,
            request.Area,
            request.TipoSolo,
            request.Ph);

        _context.Fields.Add(field);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Ok(field.Id);
    }
}
