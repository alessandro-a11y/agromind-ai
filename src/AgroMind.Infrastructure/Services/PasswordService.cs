using AgroMind.Application.Common.Interfaces;
using Microsoft.Extensions.Hosting;

namespace AgroMind.Infrastructure.Services;

public class PasswordService : IPasswordService
{
    private readonly int _workFactor;

    public PasswordService(IHostEnvironment env)
    {
        // Cost 4 em Testing (CI) — cost 12 em produção
        _workFactor = env.IsEnvironment("Testing") ? 4 : 12;
    }

    public string Hash(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password, workFactor: _workFactor);

    public bool Verify(string password, string hash) =>
        BCrypt.Net.BCrypt.Verify(password, hash);
}
