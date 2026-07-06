using AgroMind.Domain.Enums;

namespace AgroMind.Domain.Entities;

public class Alert
{
    public Guid Id { get; private set; }
    public Guid FarmId { get; private set; }
    public Guid? FieldId { get; private set; }
    public AlertType Tipo { get; private set; }
    public string Descricao { get; private set; } = string.Empty;
    public AlertStatus Status { get; private set; }
    public RiskLevel Severity { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public Farm Farm { get; private set; } = null!;
    public Field? Field { get; private set; }

    protected Alert() { }

    public Alert(
        Guid farmId,
        AlertType tipo,
        string descricao,
        RiskLevel severity = RiskLevel.Medium,
        Guid? fieldId = null)
    {
        Id = Guid.NewGuid();
        FarmId = farmId;
        FieldId = fieldId;
        Tipo = tipo;
        Descricao = descricao;
        Severity = severity;
        Status = AlertStatus.Active;
        CreatedAt = DateTime.UtcNow;
    }

    public void Resolve() => Status = AlertStatus.Resolved;
    public void Ignore() => Status = AlertStatus.Ignored;
}
