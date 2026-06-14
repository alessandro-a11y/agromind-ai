using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IJwtService _jwtService;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IPasswordService passwordService,
        IJwtService jwtService)
    {
        _context = context;
        _passwordService = passwordService;
        _jwtService = jwtService;
    }

    public async Task<Result<AuthResponse>> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user is null || !_passwordService.Verify(request.Senha, user.SenhaHash))
            return Result<AuthResponse>.Fail("E-mail ou senha inválidos.");

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        return Result<AuthResponse>.Ok(new AuthResponse(
            accessToken,
            refreshToken,
            user.Nome,
            user.Email,
            user.Role.ToString()
        ));
    }
}
