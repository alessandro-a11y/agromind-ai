using AgroMind.Application.Common.Models;

namespace AgroMind.Application.Common.Interfaces;

public interface IAiChatService
{
    Task<AiChatResponse> SendAsync(
        AiChatRequest request,
        CancellationToken cancellationToken);
}
