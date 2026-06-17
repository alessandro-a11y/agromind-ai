using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string AccessToken, string RefreshToken)
    : IRequest<Result<AuthResponse>>;
