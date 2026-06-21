using AgroMind.Application.Common.Interfaces;
using AgroMind.Application.Features.Diagnosis.Models;
using AgroMind.Infrastructure.Services.Reports;
using QuestPDF.Fluent;

namespace AgroMind.Infrastructure.Services;

public sealed class DiagnosisReportService : IDiagnosisReportService
{
    public byte[] GenerateDiagnosisReport(DiagnosisReportData data) =>
        new DiagnosisReportDocument(data).GeneratePdf();

    public byte[] GenerateHistoryReport(DiagnosisHistoryReportData data) =>
        new DiagnosisHistoryReportDocument(data).GeneratePdf();
}
