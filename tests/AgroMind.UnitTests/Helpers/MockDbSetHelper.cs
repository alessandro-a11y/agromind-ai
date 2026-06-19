using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace AgroMind.UnitTests.Helpers;

public static class MockDbSetHelper
{
    public static DbSet<T> CreateMockDbSet<T>(List<T> data) where T : class
    {
        var queryable = data.AsQueryable();
        var dbSet = Substitute.For<DbSet<T>, IQueryable<T>, IAsyncEnumerable<T>>();

        ((IQueryable<T>)dbSet).Provider.Returns(
            new TestAsyncQueryProvider<T>(queryable.Provider));
        ((IQueryable<T>)dbSet).Expression.Returns(queryable.Expression);
        ((IQueryable<T>)dbSet).ElementType.Returns(queryable.ElementType);
        ((IQueryable<T>)dbSet).GetEnumerator().Returns(queryable.GetEnumerator());

        ((IAsyncEnumerable<T>)dbSet)
            .GetAsyncEnumerator(Arg.Any<CancellationToken>())
            .Returns(new TestAsyncEnumerator<T>(data.GetEnumerator()));

        dbSet.AddAsync(Arg.Any<T>(), Arg.Any<CancellationToken>())
            .Returns(ci =>
            {
                data.Add(ci.Arg<T>());
                return ValueTask.FromResult(
                    Substitute.For<Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry<T>>());
            });

        return dbSet;
    }
}