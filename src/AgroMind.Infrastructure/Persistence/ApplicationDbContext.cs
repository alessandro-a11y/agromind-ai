using AgroMind.Application.Common.Interfaces;
using AgroMind.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgroMind.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Farm> Farms => Set<Farm>();
    public DbSet<Field> Fields => Set<Field>();
    public DbSet<Crop> Crops => Set<Crop>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<Diagnosis> Diagnoses => Set<Diagnosis>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<WeatherCache> WeatherCaches => Set<WeatherCache>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}