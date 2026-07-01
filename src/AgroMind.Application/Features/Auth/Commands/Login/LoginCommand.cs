using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Auth.Commands.Login;

public record LoginCommand(
    string Email,
    string Senha
) : IRequest<Result<AuthResponse>>;
