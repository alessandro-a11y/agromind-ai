using AgroMind.Application.Common.Models;
using AgroMind.Application.Features.Weather.DTOs;
using MediatR;

namespace AgroMind.Application.Features.Weather.Queries.GetWeather;

public record GetWeatherQuery(Guid FarmId) : IRequest<Result<WeatherDataDto>>;