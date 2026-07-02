namespace AgroMind.Application.Common.Models;

public sealed record AiChatResponse(
    string Reply,
    int? TokensUsed);
