using AgroMind.Application.Features.Diagnosis.Models;
using AgroMind.Domain.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace AgroMind.Infrastructure.Services.Reports;

internal sealed class DiagnosisReportDocument : IDocument
{
    private readonly DiagnosisReportData _data;

    public DiagnosisReportDocument(DiagnosisReportData data) => _data = data;

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(40);
            page.DefaultTextStyle(x => x.FontSize(11));

            page.Header().Column(col =>
            {
                col.Item().Text("AgroMind AI — Relatório de Diagnóstico").FontSize(18).Bold();
                col.Item().Text($"Gerado em {DateTime.Now:dd/MM/yyyy HH:mm}")
                    .FontSize(9).FontColor(Colors.Grey.Medium);
            });

            page.Content().PaddingVertical(15).Column(col =>
            {
                col.Spacing(12);

                col.Item().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                {
                    c.Item().Text("Propriedade").Bold();
                    c.Item().Text($"Fazenda: {_data.FarmNome}");
                    c.Item().Text($"Talhão: {_data.FieldNome}");
                    c.Item().Text($"Responsável: {_data.UserNome}");
                });

                col.Item().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                {
                    c.Item().Text("Solo e Cultura").Bold();
                    c.Item().Text($"Tipo de solo: {_data.TipoSolo}");
                    c.Item().Text($"pH: {_data.Ph:F1}");
                    c.Item().Text($"Área: {_data.Area:F1} ha");
                    c.Item().Text($"Cultura atual: {_data.CropNome}");
                });

                col.Item().Background(RiskColor(_data.Resultado)).Padding(10).Column(c =>
                {
                    c.Item().Text("Resultado do Diagnóstico").Bold().FontColor(Colors.White);
                    c.Item().Text($"Nível de risco: {TraduzRisco(_data.Resultado)}").FontColor(Colors.White);
                    c.Item().Text($"Confiança: {_data.Confianca:P0}").FontColor(Colors.White);
                    c.Item().Text($"Data: {_data.CreatedAt:dd/MM/yyyy HH:mm}").FontColor(Colors.White);
                });

                col.Item().Text("Recomendação").Bold();
                col.Item().Text(_data.Recomendacao);
            });

            page.Footer().AlignCenter().Text(x =>
            {
                x.Span("AgroMind AI — Gestão de Risco Agrícola")
                    .FontSize(8).FontColor(Colors.Grey.Medium);
            });
        });
    }

    private static string RiskColor(RiskLevel risk) => risk switch
    {
        RiskLevel.Low => Colors.Green.Medium,
        RiskLevel.Medium => Colors.Orange.Medium,
        RiskLevel.High => Colors.Orange.Darken2,
        RiskLevel.Critical => Colors.Red.Medium,
        _ => Colors.Grey.Medium
    };

    private static string TraduzRisco(RiskLevel risk) => risk switch
    {
        RiskLevel.Low => "Baixo",
        RiskLevel.Medium => "Médio",
        RiskLevel.High => "Alto",
        RiskLevel.Critical => "Crítico",
        _ => risk.ToString()
    };
}
