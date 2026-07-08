using AgroMind.Domain.Enums;

namespace AgroMind.Domain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string SenhaHash { get; private set; } = string.Empty;
    public UserRole Role { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // Refresh Token rotation
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiry { get; private set; }

    public ICollection<Farm> Farms { get; private set; } = new List<Farm>();

    protected User() { }

    public User(string nome, string email, string senhaHash, UserRole role)
    {
        Id = Guid.NewGuid();
        Nome = nome;
        Email = email?.Trim().ToLowerInvariant() ?? string.Empty;
        SenhaHash = senhaHash;
        Role = role;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateNome(string nome) => Nome = nome;
    public void UpdateSenha(string senhaHash) => SenhaHash = senhaHash;

    public void SetRefreshToken(string token, DateTime expiry)
    {
        RefreshToken = token;
        RefreshTokenExpiry = expiry;
    }

    public void RevokeRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiry = null;
    }

    public bool IsRefreshTokenValid(string token) =>
        RefreshToken == token && RefreshTokenExpiry > DateTime.UtcNow;
}
