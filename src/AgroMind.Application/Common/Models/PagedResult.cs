namespace AgroMind.Application.Common.Models;

public record PagedResult<T>(
    List<T> Items,
    int     TotalCount,
    int     Page,
    int     Size,
    int     TotalPages
);
