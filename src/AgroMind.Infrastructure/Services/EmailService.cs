using AgroMind.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AgroMind.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        // SendGrid será integrado aqui na Sprint 3
        // Por agora loga o email para desenvolvimento
        _logger.LogInformation(
            "EMAIL | Para: {To} | Assunto: {Subject} | Corpo: {Body}",
            to, subject, body);

        await Task.CompletedTask;
    }
}
