namespace AgroMind.Domain.Entities;

public class Farm
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string Cidade { get; private set; } = string.Empty;
    public string Estado { get; private set; } = string.Empty;
    public double? Latitude { get; private set; }
    public double? Longitude { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public User User { get; private set; } = null!;
    public ICollection<Field> Fields { get; private set; } = new List<Field>();
    public ICollection<Alert> Alerts { get; private set; } = new List<Alert>();

    protected Farm() { }

    public Farm(Guid userId, string nome, string cidade, string estado,
                double? latitude = null, double? longitude = null)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Nome = nome;
        Cidade = cidade;
        Estado = estado;
        Latitude = latitude;
        Longitude = longitude;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(string nome, string cidade, string estado,
                       double? latitude, double? longitude)
    {
        Nome = nome;
        Cidade = cidade;
        Estado = estado;
        Latitude = latitude;
        Longitude = longitude;
    }
}
