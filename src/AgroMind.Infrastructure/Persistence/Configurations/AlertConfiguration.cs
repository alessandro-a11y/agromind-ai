using AgroMind.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroMind.Infrastructure.Persistence.Configurations;

public class AlertConfiguration : IEntityTypeConfiguration<Alert>
{
    public void Configure(EntityTypeBuilder<Alert> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Tipo).HasConversion<string>();
        builder.Property(a => a.Status).HasConversion<string>();
        builder.Property(a => a.Descricao).IsRequired().HasMaxLength(500);

        builder.HasOne(a => a.Farm)
            .WithMany(f => f.Alerts)
            .HasForeignKey(a => a.FarmId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
