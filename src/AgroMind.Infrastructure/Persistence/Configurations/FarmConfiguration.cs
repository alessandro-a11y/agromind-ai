using AgroMind.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroMind.Infrastructure.Persistence.Configurations;

public class FarmConfiguration : IEntityTypeConfiguration<Farm>
{
    public void Configure(EntityTypeBuilder<Farm> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Nome).IsRequired().HasMaxLength(150);
        builder.Property(f => f.Cidade).IsRequired().HasMaxLength(100);
        builder.Property(f => f.Estado).IsRequired().HasMaxLength(2);

        builder.HasOne(f => f.User)
            .WithMany(u => u.Farms)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
