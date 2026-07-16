namespace AgroMind.Application.Common.Models;

public sealed record AiChatRequest(
    string? FarmContext,
    string Message,
    IReadOnlyList<AiChatMessage> History);
