namespace AgroMind.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string htmlBody);
    Task SendAlertAsync(string to, string farmName, string alertType, string description);
}