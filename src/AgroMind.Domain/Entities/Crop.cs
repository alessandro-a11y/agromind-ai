namespace AgroMind.Domain.Entities;

public class Crop
{
    public Guid Id { get; private set; }
    public Guid FieldId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public DateTime DataPlantio { get; private set; }
    public DateTime? DataColheita { get; private set; }
    public double AreaPlantada { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public Field Field { get; private set; } = null!;

    protected Crop() { }

    public Crop(Guid fieldId, string nome, DateTime dataPlantio,
                double areaPlantada, DateTime? dataColheita = null)
    {
        Id = Guid.NewGuid();
        FieldId = fieldId;
        Nome = nome;
        DataPlantio = dataPlantio;
        AreaPlantada = areaPlantada;
        DataColheita = dataColheita;
        CreatedAt = DateTime.UtcNow;
    }
}
