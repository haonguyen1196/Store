using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.RequestHelpers;

// Khai báo lớp MappingProfiles kế thừa từ lớp Profile của thư viện AutoMapper
public class MappingProfiles : Profile
{
    // Constructor của lớp MappingProfiles
    public MappingProfiles()
    {
        // Tạo cấu hình ánh xạ giữa lớp CreateProductDto và Product
        // Điều này có nghĩa là khi bạn cần chuyển một đối tượng từ kiểu CreateProductDto sang Product, AutoMapper sẽ biết cách làm điều đó.
        CreateMap<CreateProductDto, Product>(); // lệnh khai báo ánh xạ giữa 2 lớp, dùng ReverseMap nếu muốn ánh xạ 2 chiều
        CreateMap<UpdateProductDto, Product>();
    }
}
