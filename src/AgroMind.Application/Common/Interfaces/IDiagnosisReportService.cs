using AgroMind.Application.Features.Diagnosis.Models;

namespace AgroMind.Application.Common.Interfaces;

public interface IDiagnosisReportService
{
    byte[] GenerateDiagnosisReport(DiagnosisReportData data);
    byte[] GenerateHistoryReport(DiagnosisHistoryReportData data);
}
