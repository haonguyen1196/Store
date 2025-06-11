namespace API.RequestHelpers;

// chứa thông tin tổng quan giúp người dùng biến đang ở trang vào và có bao nhiêu trang
public class PaginationMetadata // trả thông tin phân trang về cho người dùng
{
    public int TotalCount { get; set; } // tổng số bản ghi 
    public int PageSize { get; set; } // số bản ghi mỗi trang
    public int CurrentPage { get; set; } // trang hiện tại đang xem
    public int TotalPages { get; set; } // tổng số trang
}
