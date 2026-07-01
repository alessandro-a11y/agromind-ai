using AgroMind.Domain.Enums;

namespace AgroMind.Domain.Entities;

public class Alert
{
    public Guid Id { get; private set; }
    public Guid FarmId { get; private set; }
    public AlertType Tipo { get; private set; }
    public string Descricao { get; private set; } = string.Empty;
    public AlertStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public Farm Farm { get; private set; } = null!;

    protected Alert() { }

    public Alert(Guid farmId, AlertType tipo, string descricao)
    {
        Id = Guid.NewGuid();
        FarmId = farmId;
        Tipo = tipo;
        Descricao = descricao;
        Status = AlertStatus.Active;
        CreatedAt = DateTime.UtcNow;
    }

    public void Resolve() => Status = AlertStatus.Resolved;
    public void Ignore() => Status = AlertStatus.Ignored;
}
