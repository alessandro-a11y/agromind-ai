using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Common.Models;
using AgroMind.Application.Features.Weather.DTOs;
using AgroMind.Application.Features.Weather.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Features.Weather.Queries.GetWeather;

public class GetWeatherQueryHandler : IRequestHandler<GetWeatherQuery, Result<WeatherDataDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IWeatherService _weather;

    public GetWeatherQueryHandler(IApplicationDbContext context, IWeatherService weather)
    {
        _context = context;
        _weather = weather;
    }

    public async Task<Result<WeatherDataDto>> Handle(
        GetWeatherQuery request,
        CancellationToken cancellationToken)
    {
        var farm = await _context.Farms
            .FirstOrDefaultAsync(f => f.Id == request.FarmId, cancellationToken);

        if (farm is null)
            return Result<WeatherDataDto>.Fail("Fazenda não encontrada.");

        if (farm.Latitude is null || farm.Longitude is null)
            return Result<WeatherDataDto>.Fail("Fazenda sem coordenadas cadastradas.");

        var data = await _weather.GetCurrentWeatherAsync(
            farm.Latitude.Value,
            farm.Longitude.Value,
            cancellationToken);

        if (data is null)
            return Result<WeatherDataDto>.Fail("Não foi possível obter dados climáticos.");

        return Result<WeatherDataDto>.Ok(data);
    }
}