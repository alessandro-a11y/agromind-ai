namespace AgroMind.Application.Common.Models;

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    string Nome,
    string Email,
    string Role
);
