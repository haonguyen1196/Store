using System;

namespace API.RequestHelpers;

// xác định trang và kích thước từ client
public class PaginationParams
{
    private const int MaxPageSize = 50; // mỗi trang hiển thị 50 mục
    public int PageNumber { get; set; } = 1; // hiển thị trang số 1
    private int _pageSize = 8;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value; // thuộc tính _pageSize khi lớn hơn 50 thì đặt là 50, còn nhỏ hơn thì lấy value đó
    }
}
