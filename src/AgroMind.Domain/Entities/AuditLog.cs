namespace AgroMind.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; private set; }
    public Guid? UserId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public string Entity { get; private set; } = string.Empty;
    public Guid EntityId { get; private set; }
    public string? OldValues { get; private set; }
    public string? NewValues { get; private set; }
    public DateTime CreatedAt { get; private set; }

    protected AuditLog() { }

    public AuditLog(Guid? userId, string action, string entity,
                    Guid entityId, string? oldValues, string? newValues)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Action = action;
        Entity = entity;
        EntityId = entityId;
        OldValues = oldValues;
        NewValues = newValues;
        CreatedAt = DateTime.UtcNow;
    }
}
