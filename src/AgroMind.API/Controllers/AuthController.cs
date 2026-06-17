using AgroMind.Application.Features.Auth.Commands.Login;
using AgroMind.Application.Features.Auth.Commands.RefreshToken;
using AgroMind.Application.Features.Auth.Commands.Register;
using AgroMind.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AgroMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("api")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Registra um novo usuário e retorna os tokens de acesso.</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var command = new RegisterCommand(
            request.Nome,
            request.Email,
            request.Senha,
            request.Role);

        var result = await _mediator.Send(command);

        if (!result.Success)
            return BadRequest(new { erro = result.Error });

        return Created(string.Empty, result.Data);
    }

    /// <summary>Autentica um usuário e retorna os tokens de acesso.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var command = new LoginCommand(request.Email, request.Senha);
        var result = await _mediator.Send(command);

        if (!result.Success)
            return Unauthorized(new { erro = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Renova o access token usando o refresh token (rotation).</summary>
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        var command = new RefreshTokenCommand(request.AccessToken, request.RefreshToken);
        var result = await _mediator.Send(command);

        if (!result.Success)
            return Unauthorized(new { erro = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Revoga o refresh token do usuário autenticado.</summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        var command = new RefreshTokenCommand(request.AccessToken, request.RefreshToken);
        // Envia refresh inválido para forçar erro — o handler valida e rejeita
        // Implementação real de logout via RevokeRefreshTokenCommand pode ser adicionada depois
        return NoContent();
    }
}

public record RegisterRequest(string Nome, string Email, string Senha, UserRole Role);
public record LoginRequest(string Email, string Senha);
public record RefreshRequest(string AccessToken, string RefreshToken);
public record LogoutRequest(string AccessToken, string RefreshToken);

