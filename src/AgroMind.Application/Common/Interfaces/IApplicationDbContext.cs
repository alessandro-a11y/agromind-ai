using AgroMind.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Farm> Farms { get; }
    DbSet<Field> Fields { get; }
    DbSet<Crop> Crops { get; }
    DbSet<Alert> Alerts { get; }
    DbSet<Diagnosis> Diagnoses { get; }
    DbSet<AuditLog> AuditLogs { get; }

    DbSet<WeatherCache> WeatherCaches { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
