using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtService _jwtService;

    public RefreshTokenCommandHandler(IApplicationDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<Result<AuthResponse>> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken)
    {
        // Identifica o usuário pelo userId extraído do token expirado (sem validar expiração)
        var userId = _jwtService.GetUserIdFromToken(request.AccessToken);
        if (userId is null)
            return Result<AuthResponse>.Fail("Token inválido.");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null || !user.IsRefreshTokenValid(request.RefreshToken))
            return Result<AuthResponse>.Fail("Refresh token inválido ou expirado.");

        // Gera novos tokens (rotation — o refresh token antigo é descartado)
        var novoAccessToken = _jwtService.GenerateAccessToken(user);
        var novoRefreshToken = _jwtService.GenerateRefreshToken();

        user.SetRefreshToken(novoRefreshToken, DateTime.UtcNow.AddDays(7));
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AuthResponse>.Ok(new AuthResponse(
            novoAccessToken,
            novoRefreshToken,
            user.Nome,
            user.Email,
            user.Role.ToString()
        ));
    }
}
