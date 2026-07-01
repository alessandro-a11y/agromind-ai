using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IJwtService _jwtService;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        IPasswordService passwordService,
        IJwtService jwtService)
    {
        _context = context;
        _passwordService = passwordService;
        _jwtService = jwtService;
    }

    public async Task<Result<AuthResponse>> Handle(
        RegisterCommand request,
        CancellationToken cancellationToken)
    {
        var emailExiste = await _context.Users
            .AnyAsync(u => u.Email == request.Email, cancellationToken);

        if (emailExiste)
            return Result<AuthResponse>.Fail("E-mail já cadastrado.");

        var senhaHash = _passwordService.Hash(request.Senha);
        var user = new User(request.Nome, request.Email, senhaHash, request.Role);

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        // Persiste o refresh token para validação futura (rotation)
        user.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7));
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AuthResponse>.Ok(new AuthResponse(
            accessToken,
            refreshToken,
            user.Nome,
            user.Email,
            user.Role.ToString()
        ));
    }
}
