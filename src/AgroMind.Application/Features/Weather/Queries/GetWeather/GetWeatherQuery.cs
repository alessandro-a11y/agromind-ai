using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using MediatR;

namespace AgroMind.Application.Features.Weather.Queries.GetWeather;

public record GetWeatherQuery(Guid FarmId) : IRequest<Result<WeatherData>>;
