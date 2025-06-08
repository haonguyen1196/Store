using System.Linq.Expressions;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class BasketController(StoreContext context) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<BasketDto>> GetBasket()
    {
        var basket = await RetrieveBasket();

        if (basket == null) return NoContent();

        return basket.ToDto();
    }

    [HttpPost]
    public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity)
    {
        var basket = await RetrieveBasket(); // lấy ra giỏ hàng nếu có từ cookie basketId

        basket ??= CreateBasket(); // nếu chưa có giỏ hàng thì tạo giỏ hàng mới

        var product = await context.Products.FindAsync(productId);// tìm sản phẩm từ productId

        if (product == null) return BadRequest("Không tìm thấy sản phẩm thêm vào giỏ hàng");

        basket.AddItem(product, quantity);// thêm sản phẩm và số lượng vào giỏ hàng

        var result = await context.SaveChangesAsync() > 0;// save db và check có sự thay đổi về dữ liệu nào trong db không

        if (result) return CreatedAtAction(nameof(GetBasket), basket.ToDto());// nếu có cập nhật db thì 

        return BadRequest("Lỗi cập nhật giỏ hàng");
    }

    [HttpDelete]
    public async Task<ActionResult> RemoveItemToBasket(int productId, int quantity)
    {
        var basket = await RetrieveBasket();

        if (basket == null) return BadRequest("Không tìm thất giỏ hàng");

        basket.RemoveItem(productId, quantity);

        var result = await context.SaveChangesAsync() > 0;

        if (result) return Ok();

        return BadRequest("Lỗi cập nhật giỏ hàng");
    }

    private Basket CreateBasket()
    {
        var basketId = Guid.NewGuid().ToString(); // tạo ra 1 chuỗi định danh duy nhất toàn cầu

        var cookieOptions = new CookieOptions
        {
            IsEssential = true, // cookie là bất buộc dù người dùng có bật chế độ hạn chế cookie
            Expires = DateTime.UtcNow.AddDays(30) // thời hạn của cookie là 30 ngày
        };

        Response.Cookies.Append("basketId", basketId, cookieOptions); // ghi cookie vào trình duyệt của người dùng, cookie có tên là basketId sẽ được gửi trong các reaquest sau

        var basket = new Basket { BasketId = basketId }; // tạo object từ basketId

        context.Baskets.Add(basket); // vào vào db nhưng chưa lưu
        return basket; // trả basket về
    }

    private async Task<Basket?> RetrieveBasket()
    {
        return await context.Baskets
                        .Include(x => x.Items)
                        .ThenInclude(x => x.Product)
                        .FirstOrDefaultAsync(x => x.BasketId == Request.Cookies["BasketId"]);
    }
}
