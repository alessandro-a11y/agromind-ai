using AgroMind.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroMind.Infrastructure.Persistence.Configurations;

public class FieldConfiguration : IEntityTypeConfiguration<Field>
{
    public void Configure(EntityTypeBuilder<Field> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Nome).IsRequired().HasMaxLength(100);
        builder.Property(f => f.TipoSolo).IsRequired().HasMaxLength(50);

        builder.HasOne(f => f.Farm)
            .WithMany(fa => fa.Fields)
            .HasForeignKey(f => f.FarmId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
