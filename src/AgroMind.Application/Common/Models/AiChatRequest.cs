namespace AgroMind.Application.Common.Models;

public sealed record AiChatRequest(
    string Message,
    IReadOnlyList<AiChatMessage> History);
