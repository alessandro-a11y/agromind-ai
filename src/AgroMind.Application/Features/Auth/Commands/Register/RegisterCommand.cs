using AgroMind.Application.Common.Models;
using AgroMind.Domain.Enums;
using MediatR;

namespace AgroMind.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string Nome,
    string Email,
    string Senha,
    UserRole Role
) : IRequest<Result<AuthResponse>>;
