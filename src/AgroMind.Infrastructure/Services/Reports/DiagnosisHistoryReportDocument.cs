using AgroMind.Application.Features.Diagnosis.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace AgroMind.Infrastructure.Services.Reports;

internal sealed class DiagnosisHistoryReportDocument : IDocument
{
    private readonly DiagnosisHistoryReportData _data;

    public DiagnosisHistoryReportDocument(DiagnosisHistoryReportData data) => _data = data;

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(40);
            page.DefaultTextStyle(x => x.FontSize(10));

            page.Header().Column(col =>
            {
                col.Item().Text("AgroMind AI — Histórico de Diagnósticos").FontSize(18).Bold();
                col.Item().Text($"Gerado em {DateTime.Now:dd/MM/yyyy HH:mm}")
                    .FontSize(9).FontColor(Colors.Grey.Medium);
            });

            page.Content().PaddingVertical(15).Column(col =>
            {
                col.Spacing(10);

                col.Item().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                {
                    c.Item().Text("Propriedade").Bold();
                    c.Item().Text($"Fazenda: {_data.FarmNome}");
                    c.Item().Text($"Talhão: {_data.FieldNome}");
                    c.Item().Text($"Responsável: {_data.UserNome}");
                    c.Item().Text($"Tipo de solo: {_data.TipoSolo} | pH: {_data.Ph:F1} | Área: {_data.Area:F1} ha");
                });

                if (_data.Historico.Count == 0)
                {
                    col.Item().Text("Nenhum diagnóstico registrado para este talhão.");
                }
                else
                {
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(5);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(HeaderCellStyle).Text("Data");
                            header.Cell().Element(HeaderCellStyle).Text("Risco");
                            header.Cell().Element(HeaderCellStyle).Text("Confiança");
                            header.Cell().Element(HeaderCellStyle).Text("Recomendação");
                        });

                        foreach (var item in _data.Historico)
                        {
                            table.Cell().Element(DataCellStyle).Text(item.CreatedAt.ToString("dd/MM/yyyy"));
                            table.Cell().Element(DataCellStyle).Text(item.Resultado.ToString());
                            table.Cell().Element(DataCellStyle).Text($"{item.Confianca:P0}");
                            table.Cell().Element(DataCellStyle).Text(item.Recomendacao).FontSize(8);
                        }
                    });
                }
            });

            page.Footer().AlignCenter().Text(x =>
            {
                x.Span("AgroMind AI — Gestão de Risco Agrícola")
                    .FontSize(8).FontColor(Colors.Grey.Medium);
            });
        });
    }

    private static IContainer HeaderCellStyle(IContainer container) =>
        container.DefaultTextStyle(x => x.Bold())
            .PaddingBottom(5)
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Darken1);

    private static IContainer DataCellStyle(IContainer container) =>
        container.PaddingVertical(5)
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2);
}
