using System.Security.Claims;
using AgroMind.Application.Features.Farms.Commands.CreateFarm;
using AgroMind.Application.Features.Farms.Commands.DeleteFarm;
using AgroMind.Application.Features.Farms.Commands.UpdateFarm;
using AgroMind.Application.Features.Farms.Queries.GetFarmById;
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

    private Guid UserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Lista todas as fazendas do usuário autenticado.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetFarmsQuery(UserId));
        return Ok(result.Data);
    }

    /// <summary>Retorna uma fazenda específica por Id.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetFarmByIdQuery(id, UserId));

        if (!result.Success)
            return NotFound(new { erro = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Cria uma nova fazenda para o usuário autenticado.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFarmRequest request)
    {
        var command = new CreateFarmCommand(
            UserId,
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

    /// <summary>Atualiza os dados de uma fazenda existente.</summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFarmRequest request)
    {
        var command = new UpdateFarmCommand(
            id,
            UserId,
            request.Nome,
            request.Cidade,
            request.Estado,
            request.Latitude,
            request.Longitude);

        var result = await _mediator.Send(command);

        if (!result.Success)
            return NotFound(new { erro = result.Error });

        return NoContent();
    }

    /// <summary>Remove uma fazenda do usuário autenticado.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteFarmCommand(id, UserId));

        if (!result.Success)
            return NotFound(new { erro = result.Error });

        return NoContent();
    }
}

public record CreateFarmRequest(
    string Nome,
    string Cidade,
    string Estado,
    double? Latitude,
    double? Longitude);

public record UpdateFarmRequest(
    string Nome,
    string Cidade,
    string Estado,
    double? Latitude,
    double? Longitude);

