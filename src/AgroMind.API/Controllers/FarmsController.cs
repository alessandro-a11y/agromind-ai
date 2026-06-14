using System.Security.Claims;
using AgroMind.Application.Features.Farms.Commands.CreateFarm;
using AgroMind.Application.Features.Farms.Queries.GetFarms;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AgroMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[EnableRateLimiting("api")]
public class FarmsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FarmsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new GetFarmsQuery(userId));
        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFarmRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var command = new CreateFarmCommand(
            userId,
            request.Nome,
            request.Cidade,
            request.Estado,
            request.Latitude,
            request.Longitude);

        var result = await _mediator.Send(command);

        if (!result.Success)
            return BadRequest(new { erro = result.Error });

        return Created($"api/farms/{result.Data}", new { id = result.Data });
    }
}

public record CreateFarmRequest(
    string Nome,
    string Cidade,
    string Estado,
    double? Latitude,
    double? Longitude);
