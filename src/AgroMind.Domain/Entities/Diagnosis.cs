using AgroMind.Domain.Enums;

namespace AgroMind.Domain.Entities;

public class Diagnosis
{
    public Guid Id { get; private set; }
    public Guid FieldId { get; private set; }
    public RiskLevel Resultado { get; private set; }
    public double Confianca { get; private set; }
    public string Recomendacao { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }
    public Field Field { get; private set; } = null!;

    protected Diagnosis() { }

    public Diagnosis(Guid fieldId, RiskLevel resultado, double confianca, string recomendacao)
    {
        Id = Guid.NewGuid();
        FieldId = fieldId;
        Resultado = resultado;
        Confianca = confianca;
        Recomendacao = recomendacao;
        CreatedAt = DateTime.UtcNow;
    }
}
