using System.Security.Claims;
using AgroMind.Application.Features.Alerts.Commands.IgnoreAlert;
using AgroMind.Application.Features.Alerts.Commands.ResolveAlert;
using AgroMind.Application.Features.Alerts.Queries.GetAlerts;
using AgroMind.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AgroMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[EnableRateLimiting("api")]
public class AlertsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AlertsController(IMediator mediator) => _mediator = mediator;

    private Guid UserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Lista alertas do usuário com paginação e filtros opcionais.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] AlertStatus? status = null,
        [FromQuery] Guid?        farmId = null,
        [FromQuery] AlertType?   tipo   = null,
        [FromQuery] DateTime?    from   = null,
        [FromQuery] DateTime?    to     = null,
        [FromQuery] int page = 1,
        [FromQuery] int size  = 20)
    {
        if (page < 1) page = 1;
        if (size is < 1 or > 100) size = 20;

        var result = await _mediator.Send(new GetAlertsQuery(UserId, status, farmId, tipo, from, to, page, size));
        return Ok(result.Data);
    }

    /// <summary>Marca um alerta como resolvido.</summary>
    [HttpPatch("{id:guid}/resolve")]
    public async Task<IActionResult> Resolve(Guid id)
    {
        var result = await _mediator.Send(new ResolveAlertCommand(id, UserId));

        if (!result.Success)
            return NotFound(new { erro = result.Error });

        return NoContent();
    }

    /// <summary>Ignora um alerta.</summary>
    [HttpPatch("{id:guid}/ignore")]
    public async Task<IActionResult> Ignore(Guid id)
    {
        var result = await _mediator.Send(new IgnoreAlertCommand(id, UserId));

        if (!result.Success)
            return NotFound(new { erro = result.Error });

        return NoContent();
    }
}
