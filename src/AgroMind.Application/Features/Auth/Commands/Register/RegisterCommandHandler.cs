using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AgroMind.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IJwtService _jwtService;
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        IPasswordService passwordService,
        IJwtService jwtService,
        ILogger<RegisterCommandHandler> logger)
    {
        _context = context;
        _passwordService = passwordService;
        _jwtService = jwtService;
        _logger = logger;
    }

    public async Task<Result<AuthResponse>> Handle(
        RegisterCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // 1. Normalizar e verificar se email já existe
            var normalizedEmail = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;
            var emailExiste = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);

            if (emailExiste)
            {
                _logger.LogWarning($"Tentativa de registro com email duplicado: {request.Email}");
                return Result<AuthResponse>.Fail("E-mail já cadastrado.");
            }

            // 2. Hash da senha
            var senhaHash = _passwordService.Hash(request.Senha);

            // 3. Criar usuário com refresh token já configurado
            var refreshToken = _jwtService.GenerateRefreshToken();
            var user = new User(request.Nome, normalizedEmail, senhaHash, request.Role);
            user.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7));

            // 4. SALVAR UMA ÚNICA VEZ
            _context.Users.Add(user);
            var rowsAffected = await _context.SaveChangesAsync(cancellationToken);

            if (rowsAffected == 0)
            {
                _logger.LogError($"SaveChangesAsync retornou 0 para usuário {request.Email}");
                return Result<AuthResponse>.Fail("Erro ao salvar usuário no banco.");
            }

            _logger.LogInformation($"Usuário criado com sucesso: {user.Id} - {user.Email}");

            // 5. Gerar access token (SEM salvar novamente)
            var accessToken = _jwtService.GenerateAccessToken(user);

            return Result<AuthResponse>.Ok(new AuthResponse(
                accessToken,
                refreshToken,
                user.Nome,
                user.Email,
                user.Role.ToString()
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Erro ao registrar usuário: {request.Email}");
            return Result<AuthResponse>.Fail($"Erro ao registrar: {ex.Message}");
        }
    }
}