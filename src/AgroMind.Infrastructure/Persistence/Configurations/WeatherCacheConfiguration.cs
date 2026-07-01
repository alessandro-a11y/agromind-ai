using AgroMind.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroMind.Infrastructure.Persistence.Configurations;

public class WeatherCacheConfiguration : IEntityTypeConfiguration<WeatherCache>
{
    public void Configure(EntityTypeBuilder<WeatherCache> builder)
    {
        builder.HasKey(w => w.Id);

        builder.HasIndex(w => w.FarmId).IsUnique();

        builder.HasOne(w => w.Farm)
            .WithOne()
            .HasForeignKey<WeatherCache>(w => w.FarmId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}