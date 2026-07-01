using AgroMind.Application.Features.Crops.Commands.CreateCrop;
using AgroMind.Application.Features.Crops.Queries.GetCrops;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AgroMind.API.Controllers;

[ApiController]
[Route("api/fields/{fieldId}/crops")]
[Authorize]
[EnableRateLimiting("api")]
public class CropsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CropsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid fieldId)
    {
        var result = await _mediator.Send(new GetCropsQuery(fieldId));
        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid fieldId, [FromBody] CreateCropRequest request)
    {
        var command = new CreateCropCommand(
            fieldId,
            request.Nome,
            request.DataPlantio,
            request.AreaPlantada,
            request.DataColheita);

        var result = await _mediator.Send(command);

        if (!result.Success)
            return BadRequest(new { erro = result.Error });

        return Created($"api/fields/{fieldId}/crops/{result.Data}", new { id = result.Data });
    }
}

public record CreateCropRequest(
    string Nome,
    DateTime DataPlantio,
    double AreaPlantada,
    DateTime? DataColheita);
