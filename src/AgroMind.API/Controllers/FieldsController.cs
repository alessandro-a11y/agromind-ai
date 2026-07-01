using System.Security.Claims;
using AgroMind.Application.Features.Fields.Commands.CreateField;
using AgroMind.Application.Features.Fields.Queries.GetFields;
using AgroMind.Application.Features.Weather.Queries.GetWeather;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AgroMind.API.Controllers;

[ApiController]
[Route("api/farms/{farmId}/fields")]
[Authorize]
[EnableRateLimiting("api")]
public class FieldsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FieldsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid farmId)
    {
        var result = await _mediator.Send(new GetFieldsQuery(farmId));
        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid farmId, [FromBody] CreateFieldRequest request)
    {
        var command = new CreateFieldCommand(
            farmId,
            request.Nome,
            request.Area,
            request.TipoSolo,
            request.Ph);

        var result = await _mediator.Send(command);

        if (!result.Success)
            return BadRequest(new { erro = result.Error });

        return Created($"api/farms/{farmId}/fields/{result.Data}", new { id = result.Data });
    }

    [HttpGet("{fieldId}/weather")]
    public async Task<IActionResult> GetWeather(Guid farmId)
    {
        var result = await _mediator.Send(new GetWeatherQuery(farmId));

        if (!result.Success)
            return BadRequest(new { erro = result.Error });

        return Ok(result.Data);
    }
}

public record CreateFieldRequest(string Nome, double Area, string TipoSolo, double Ph);
