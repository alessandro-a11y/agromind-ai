using FluentValidation;

namespace AgroMind.Application.Features.Farms.Commands.CreateFarm;

public class CreateFarmCommandValidator : AbstractValidator<CreateFarmCommand>
{
    public CreateFarmCommandValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome da fazenda é obrigatório.")
            .MaximumLength(150);

        RuleFor(x => x.Cidade)
            .NotEmpty().WithMessage("Cidade é obrigatória.");

        RuleFor(x => x.Estado)
            .NotEmpty().WithMessage("Estado é obrigatório.")
            .Length(2).WithMessage("Estado deve ter 2 caracteres (ex: PE).");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("Usuário é obrigatório.");
    }
}
