using AgroMind.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Resend;

namespace AgroMind.Infrastructure.Services;

public sealed class EmailService : IEmailService
{
    private readonly IResend _resend;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly ILogger<EmailService> _logger;
    private readonly bool _isConfigured;

    public EmailService(IResend resend, IConfiguration config, ILogger<EmailService> logger)
    {
        _resend = resend;
        _logger = logger;
        _fromEmail = config["Resend:FromEmail"] ?? "noreply@agromind.app";
        _fromName  = config["Resend:FromName"]  ?? "AgroMind";
        _isConfigured = !string.IsNullOrWhiteSpace(config["Resend:ApiKey"]);
    }

    public async Task SendAsync(string to, string subject, string htmlBody)
    {
        if (!_isConfigured)
        {
            _logger.LogWarning(
                "Resend API key not configured. Skipping email to {To}.", to);
            return;
        }

        try
        {
            var message = new EmailMessage
            {
                From    = $"{_fromName} <{_fromEmail}>",
                To      = { to },
                Subject = subject,
                HtmlBody = htmlBody
            };

            var response = await _resend.EmailSendAsync(message);

            _logger.LogInformation(
                "Email sent | To: {To} | Subject: {Subject} | Id: {Id}",
                to, subject, response.Content);
        }
        catch (Exception ex)
        {
            // Nunca deixa o job de clima quebrar por falha de email
            _logger.LogError(ex,
                "Failed to send email to {To} | Subject: {Subject}", to, subject);
        }
    }

    public async Task SendAlertAsync(
        string to,
        string farmName,
        string alertType,
        string description)
    {
        var subject = $"⚠️ Alerta AgroMind — {farmName}";
        var htmlBody = $"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #e65100;">⚠️ Alerta detectado</h2>
                <p>Fazenda: <strong>{farmName}</strong></p>
                <p>Tipo: <strong>{alertType}</strong></p>
                <p>Descrição: {description}</p>
                <hr style="border: none; border-top: 1px solid #eee;" />
                <p style="color: #888; font-size: 12px;">
                    Alerta automático gerado pelo AgroMind.<br/>
                    Acesse o painel para mais detalhes.
                </p>
            </div>
            """;

        await SendAsync(to, subject, htmlBody);
    }
}