using System;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(SignInManager<User> signInManager) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult> RegisterUser(RegisterDto registerDto)
    {
        var user = new User { UserName = registerDto.Email, Email = registerDto.Email }; // muốn thêm bao nhiều trường củng đc

        var result = await signInManager.UserManager.CreateAsync(user, registerDto.Password);// phải cung cấp password để signinmanager tự mã hóa, check mail tồn tại chưa

        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);// thêm lỗi vào modelstate
            }

            return ValidationProblem();// bắn ra các lỗi sau khi đã tổng hợp vào modelstate
        }

        await signInManager.UserManager.AddToRoleAsync(user, "MEMBER"); // gán role cho user khi đã tạo thành công

        return Ok();
    }

    [HttpGet("user-info")]
    public async Task<ActionResult> GetUserInfo()
    {
        // Kiểm tra xem người dùng đã đăng nhập chưa (thông qua cookie), user là đối tượng ClaimsPrincipal
        if (User.Identity?.IsAuthenticated == false) return NoContent();

        //  Lấy thông tin người dùng từ ClaimsPrincipal (trong cookie)
        var user = await signInManager.UserManager.GetUserAsync(User);

        // Nếu không tìm thấy user => có thể cookie không hợp lệ hoặc đã bị xóa tài khoản
        if (user == null) return Unauthorized();

        // Lấy danh sách role mà người dùng đang có
        var roles = await signInManager.UserManager.GetRolesAsync(user);


        // trả ra dữ liệu
        return Ok(new
        {
            user.Email,
            user.UserName,
            Roles = roles
        });
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        // Đăng xuất người dùng hiện tại (xóa cookie xác thực)
        await signInManager.SignOutAsync();

        return NoContent();
    }

    [Authorize]// đăng nhập rồi mới gọi được controller này
    [HttpPost("address")]
    public async Task<ActionResult> CreateOrUpdateAddress(Address address)
    {
        //Lấy user hiện tại đang đăng nhập (dựa theo User.Identity.Name) kèm địa chỉ nếu có
        var user = await signInManager.UserManager.Users
            .Include(x => x.Address)
            .FirstOrDefaultAsync(x => x.UserName == User.Identity!.Name);

        if (user == null) return Unauthorized();

        if (user.Address != null)
        {
            // Cập nhật các trường nếu đã có địa chỉ
            user.Address.Name = address.Name;
            user.Address.Line1 = address.Line1;
            user.Address.Line2 = address.Line2;
            user.Address.City = address.City;
            user.Address.State = address.State;
            user.Address.PostalCode = address.PostalCode;
            user.Address.Country = address.Country;
        }
        else
        {
            // Tạo địa chỉ mới
            user.Address = address;
        }


        // Gọi phương thức tích hợp sẵn để cập nhật thông tin user vào DB
        var result = await signInManager.UserManager.UpdateAsync(user);

        if (!result.Succeeded) return BadRequest("Cập nhật địa chỉ không thành công");

        //Trả về địa chỉ vừa cập nhật
        return Ok(user.Address);
    }

    [Authorize]
    [HttpGet("address")]
    public async Task<ActionResult<Address>> GetSavedAddress()
    {
        // lấy ra địa chỉ của user
        var address = await signInManager.UserManager.Users
            .Where(x => x.UserName == User.Identity!.Name)
            .Select(x => x.Address)
            .FirstOrDefaultAsync();

        if (address == null) return NoContent();

        return address;
    }

}
