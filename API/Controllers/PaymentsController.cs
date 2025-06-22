using System;
using API.Data;
using API.DTOs;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class PaymentsController(PaymentsService paymentsService, StoreContext context) : BaseApiController
{
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<BasketDto>> CreateOrUpdatePaymentIntent() // lấy intent và đưa dữ liệu vào basket
    {
        var basket = await context.Baskets.GetBasketWithItems(Request.Cookies["basketId"]);

        if (basket == null) return BadRequest("Gặp lỗi khi lấy basket");

        var intent = await paymentsService.CreateOrUpdatePaymentIntent(basket);

        if (intent == null) return BadRequest("Gặp lỗi khi lấy payment intent");

        basket.ClientSecret ??= intent.ClientSecret;
        basket.PaymentIntentId ??= intent.Id;

        if (context.ChangeTracker.HasChanges()) // Kiểm tra xem có thay đổi nào trong context trước khi gọi SaveChangesAsync
        {
            var result = await context.SaveChangesAsync() > 0;
            if (!result) return BadRequest("Có lỗi khi cập nhật basket với intent");
        }

        return basket.ToDto();
    }
}
