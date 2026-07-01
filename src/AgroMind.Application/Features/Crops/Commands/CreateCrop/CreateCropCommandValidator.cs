using FluentValidation;

namespace AgroMind.Application.Features.Crops.Commands.CreateCrop;

public class CreateCropCommandValidator : AbstractValidator<CreateCropCommand>
{
    public CreateCropCommandValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome da cultura é obrigatório.")
            .MaximumLength(100);

        RuleFor(x => x.DataPlantio)
            .NotEmpty().WithMessage("Data de plantio é obrigatória.");

        RuleFor(x => x.AreaPlantada)
            .GreaterThan(0).WithMessage("Área plantada deve ser maior que zero.");

        RuleFor(x => x.FieldId)
            .NotEmpty().WithMessage("Talhão é obrigatório.");
    }
}
