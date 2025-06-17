using System;
using Microsoft.AspNetCore.Identity;

namespace API.Entities;

public class User : IdentityUser
{
    //Khóa ngoại trỏ đến bảng Address (nơi lưu địa chỉ của user), check điều kiện 
    public int? AddressId { get; set; }

    //Thuộc tính điều hướng (navigation property) đến địa chỉ của user, lấy dữ liệu liên quan
    public Address? Address { get; set; }
}
