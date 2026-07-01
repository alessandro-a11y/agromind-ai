namespace AgroMind.Domain.Entities;

public class Field
{
    public Guid Id { get; private set; }
    public Guid FarmId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public double Area { get; private set; }
    public string TipoSolo { get; private set; } = string.Empty;
    public double Ph { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public Farm Farm { get; private set; } = null!;
    public ICollection<Crop> Crops { get; private set; } = new List<Crop>();
    public ICollection<Diagnosis> Diagnoses { get; private set; } = new List<Diagnosis>();

    protected Field() { }

    public Field(Guid farmId, string nome, double area, string tipoSolo, double ph)
    {
        Id = Guid.NewGuid();
        FarmId = farmId;
        Nome = nome;
        Area = area;
        TipoSolo = tipoSolo;
        Ph = ph;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(string nome, double area, string tipoSolo, double ph)
    {
        Nome = nome;
        Area = area;
        TipoSolo = tipoSolo;
        Ph = ph;
    }
}
