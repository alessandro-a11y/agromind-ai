using System.Security.Claims;
using AgroMind.Application.Features.Diagnosis.Commands.CreateDiagnosis;
using AgroMind.Application.Features.Diagnosis.Queries.GetDiagnosisHistoryByField;
using AgroMind.Application.Features.Diagnosis.Queries.GetDiagnosisHistoryReport;
using AgroMind.Application.Features.Diagnosis.Queries.GetDiagnosisReport;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AgroMind.API.Controllers;

[ApiController]
[Route("api/fields/{fieldId}/diagnosis")]
[Authorize]
[EnableRateLimiting("api")]
public class DiagnosisController : ControllerBase
{
    private readonly IMediator _mediator;

    public DiagnosisController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid UserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Create(Guid fieldId)
    {
        var result = await _mediator.Send(new CreateDiagnosisCommand(fieldId, UserId));
        if (!result.Success)
            return BadRequest(new { erro = result.Error });
        return Created($"api/fields/{fieldId}/diagnosis/{result.Data!.Id}", result.Data);
    }

    [HttpGet]
    public async Task<IActionResult> GetHistory(Guid fieldId)
    {
        var result = await _mediator.Send(new GetDiagnosisHistoryByFieldQuery(fieldId, UserId));
        if (!result.Success)
            return BadRequest(new { erro = result.Error });
        return Ok(result.Data);
    }

    [HttpGet("{diagnosisId:guid}/report")]
    public async Task<IActionResult> GetReport(Guid fieldId, Guid diagnosisId)
    {
        var result = await _mediator.Send(new GetDiagnosisReportQuery(fieldId, diagnosisId, UserId));
        if (!result.Success)
            return BadRequest(new { erro = result.Error });
        return File(result.Data!, "application/pdf", $"diagnostico-{diagnosisId}.pdf");
    }

    [HttpGet("report")]
    public async Task<IActionResult> GetHistoryReport(Guid fieldId)
    {
        var result = await _mediator.Send(new GetDiagnosisHistoryReportQuery(fieldId, UserId));
        if (!result.Success)
            return BadRequest(new { erro = result.Error });
        return File(result.Data!, "application/pdf", $"historico-diagnosticos-{fieldId}.pdf");
    }
    
}