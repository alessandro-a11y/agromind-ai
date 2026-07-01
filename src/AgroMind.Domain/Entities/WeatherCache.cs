namespace AgroMind.Domain.Entities;

public class WeatherCache
{
    public Guid Id { get; private set; }
    public Guid FarmId { get; private set; }
    public double Temperature { get; private set; }
    public double Humidity { get; private set; }
    public double WindSpeed { get; private set; }
    public double RainProbability { get; private set; }
    public DateTime MeasuredAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public Farm Farm { get; private set; } = null!;

    protected WeatherCache() { }

    public WeatherCache(
        Guid farmId,
        double temperature,
        double humidity,
        double windSpeed,
        double rainProbability,
        DateTime measuredAt)
    {
        Id = Guid.NewGuid();
        FarmId = farmId;
        Temperature = temperature;
        Humidity = humidity;
        WindSpeed = windSpeed;
        RainProbability = rainProbability;
        MeasuredAt = measuredAt;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(
        double temperature,
        double humidity,
        double windSpeed,
        double rainProbability,
        DateTime measuredAt)
    {
        Temperature = temperature;
        Humidity = humidity;
        WindSpeed = windSpeed;
        RainProbability = rainProbability;
        MeasuredAt = measuredAt;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsStale(TimeSpan maxAge) =>
        DateTime.UtcNow - UpdatedAt > maxAge;
}