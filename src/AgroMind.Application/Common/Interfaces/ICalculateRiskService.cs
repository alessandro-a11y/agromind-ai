using AgroMind.Domain.Entities;
using AgroMind.Domain.Enums;

namespace AgroMind.Application.Common.Interfaces;

public interface ICalculateRiskService
{
    Task<RiskLevel> ExecuteAsync(Farm farm, CancellationToken cancellationToken = default);
}