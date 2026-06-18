using FluentValidation;

namespace AgroMind.Application.Features.Fields.Commands.CreateField;

public class CreateFieldCommandValidator : AbstractValidator<CreateFieldCommand>
{
    public CreateFieldCommandValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(100);

        RuleFor(x => x.Area)
            .GreaterThan(0).WithMessage("Área deve ser maior que zero.");

        RuleFor(x => x.TipoSolo)
            .NotEmpty().WithMessage("Tipo de solo é obrigatório.");

        RuleFor(x => x.Ph)
            .InclusiveBetween(0, 14).WithMessage("pH deve estar entre 0 e 14.");

        RuleFor(x => x.FarmId)
            .NotEmpty().WithMessage("Fazenda é obrigatória.");
    }
}
