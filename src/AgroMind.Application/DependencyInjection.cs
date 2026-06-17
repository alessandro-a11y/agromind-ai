using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace AgroMind.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // MediatR — descobre todos os handlers automaticamente
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));

        // FluentValidation — registra todos os validators do assembly
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}
