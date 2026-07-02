namespace AgroMind.Application.Common.Models;

public sealed record AiDiagnosisOutcome(
    bool Success,
    AiDiagnosisResult? Diagnosis,
    string? ErrorMessage)
{
    public static AiDiagnosisOutcome Ok(AiDiagnosisResult diagnosis) =>
        new(true, diagnosis, null);

    public static AiDiagnosisOutcome Fail(string errorMessage) =>
        new(false, null, errorMessage);
}
