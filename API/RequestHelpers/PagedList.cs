using System;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;

namespace API.RequestHelpers;

public class PagedList<T> : List<T>
{
    public PagedList(List<T> items, int count, int pageNumber, int pageSize)
    {
        Metadata = new PaginationMetadata
        {
            TotalCount = count,
            PageSize = pageSize,
            CurrentPage = pageNumber,
            TotalPages = (int)Math.Ceiling(count / (double)pageSize)
            //double là ép kiểu chia là số thực 4.6 math cei làm trồn lên là 5
        };
        AddRange(items);
    }

    public PaginationMetadata Metadata { get; set; }

    public static async Task<PagedList<T>> ToPagedList(IQueryable<T> query, int pageNumber, int pageSize)
    {
        var count = await query.CountAsync();// đếm số bản ghi
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        //skip là số bảng ghi sẽ bỏ qua theo chiều dọc, take số bản ghi tiếp theo (đây là mảng chứa các item sẽ hiển thị tại client)

        return new PagedList<T>(items, count, pageNumber, pageSize);
    }
}
