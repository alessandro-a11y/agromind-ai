using System.Text.Json;
using AgroMind.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace AgroMind.Infrastructure.Persistence;

public class AuditInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        AuditChanges(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        AuditChanges(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static void AuditChanges(DbContext? context)
    {
        if (context is null) return;

        var entries = context.ChangeTracker
            .Entries()
            .Where(e => e.State is EntityState.Added
                            or EntityState.Modified
                            or EntityState.Deleted
                     && e.Entity is not AuditLog)
            .ToList();

        foreach (var entry in entries)
        {
            var entityId = entry.Properties
                .FirstOrDefault(p => p.Metadata.Name == "Id")?.CurrentValue;

            var oldValues = entry.State == EntityState.Modified
                ? JsonSerializer.Serialize(entry.Properties
                    .Where(p => p.IsModified)
                    .ToDictionary(p => p.Metadata.Name, p => p.OriginalValue))
                : null;

            var newValues = entry.State != EntityState.Deleted
                ? JsonSerializer.Serialize(entry.Properties
                    .Where(p => p.IsModified || entry.State == EntityState.Added)
                    .ToDictionary(p => p.Metadata.Name, p => p.CurrentValue))
                : null;

            var auditLog = new AuditLog(
                userId: null, // sem HttpContext aqui — será enriquecido via middleware se necessário
                action: entry.State.ToString(),
                entity: entry.Entity.GetType().Name,
                entityId: entityId is Guid id ? id : Guid.Empty,
                oldValues: oldValues,
                newValues: newValues
            );

            context.Set<AuditLog>().Add(auditLog);
        }
    }
}
