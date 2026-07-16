using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AgroMind.API.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
[EnableRateLimiting("api")]
public class AiController : ControllerBase
{
    private readonly IAiChatService _aiChatService;

    public AiController(IAiChatService aiChatService)
    {
        _aiChatService = aiChatService;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat(
        [FromBody] ChatRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { erro = "Mensagem obrigatória." });

        var history = (request.History ?? [])
            .Where(message =>
                !string.IsNullOrWhiteSpace(message.Content) &&
                (message.Role == "user" || message.Role == "assistant"))
            .Select(message => new AiChatMessage(message.Role, message.Content!))
            .ToList();

        // Se o frontend enviou contexto de fazendas, injeta como mensagem do sistema
        if (!string.IsNullOrWhiteSpace(request.FarmContext))
        {
            history.Insert(0, new AiChatMessage("system",
                $"Você é um assistente especializado em agricultura. " +
                $"Aqui estão os dados das fazendas do usuário:\n{request.FarmContext}\n\n" +
                $"Use esses dados para responder perguntas sobre as fazendas. " +
                $"Quando o usuário perguntar sobre uma fazenda específica, " +
                $"identifique-a pelo nome e consulte os dados disponíveis. " +
                $"Combine esses dados com seu conhecimento técnico em agronomia " +
                $"para dar respostas completas e contextualizadas."));
        }

    var response = await _aiChatService.SendAsync(
        new AiChatRequest(
        request.FarmContext,
        request.Message.Trim(),
        history),
        cancellationToken);
        
      return Ok(response);
    }

    public sealed record ChatRequest(
        string Message,
        IReadOnlyList<ChatMessage>? History,
        string? FarmContext = null);

    public sealed record ChatMessage(string Role, string? Content);
}