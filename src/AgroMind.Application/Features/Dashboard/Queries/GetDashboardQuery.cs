using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Dashboard.Queries;

public record DashboardDto(
    int TotalFazendas,
    int TotalTalhoes,
    int TotalCulturas,
    int AlertasAtivos,
    int DiagnosticosHoje
);

public record GetDashboardQuery(Guid UserId) : IRequest<Result<DashboardDto>>;
