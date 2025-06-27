using System;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Entities.OrderAggregate;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace API.Controllers;

public class PaymentsController(PaymentsService paymentsService, StoreContext context, IConfiguration config, ILogger<PaymentsController> logger) : BaseApiController
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

    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        //Đọc toàn bộ nội dung từ request body (Json gửi từ stripe)
        var json = await new StreamReader(Request.Body).ReadToEndAsync();

        try
        {
            // Xác thực và xây dựng sự kiện Stripe từ payload và Stripe-Signature header
            var stripeEvent = ConstructStripeEvent(json);

            // Kiểm tra xem object trong sự kiện có phải là PaymentIntent không
            if (stripeEvent.Data.Object is not PaymentIntent intent)
            {
                return BadRequest("Dữ liệu sự kiện không hợp lệ");// nếu không phải thì trả về lỗi
            }

            // Kiểm tra xem object trong sự kiện có phải là PaymentIntent không
            if (intent.Status == "succeeded") await HandlePaymentIntentSucceeded(intent);
            else await HandlePaymentIntentFailed(intent); // Nếu thất bại → xử lý rollback đơn hàng và tồn kho

            return Ok();// Trả về 200 OK cho Stripe (bắt buộc)
        }
        catch (StripeException ex)
        {
            logger.LogError(ex, "Stripe webhook có lỗi");// Ghi log nếu có lỗi khi xác thực hoặc xử lý từ Stripe
            return StatusCode(StatusCodes.Status500InternalServerError, "webhook lỗi");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Có lỗi không mong muốn đã xảy ra");// Ghi log cho các lỗi không mong muốn khác
            return StatusCode(StatusCodes.Status500InternalServerError, "Lỗi không mong muốn");
        }
    }

    private async Task HandlePaymentIntentFailed(PaymentIntent intent)
    {
        // Tìm đơn hàng theo PaymentIntentId
        var order = await context.Orders
            .Include(x => x.OrderItems)
            .FirstOrDefaultAsync(x => x.PaymentIntentId == intent.Id) ?? throw new Exception("Không tìm thấy đơn hàng");

        // Lặp qua từng sản phẩm trong đơn để hoàn lại tồn kho
        foreach (var item in order.OrderItems)
        {
            var productItem = await context.Products
                .FindAsync(item.ItemOrdered.ProductId)
                    ?? throw new Exception("có lỗi khi cập nhật tồn kho sản phẩm");

            productItem.QuantityInStock += item.Quantity;// Cộng lại số lượng vào tồn kho vì thanh toán thất bại
        }

        order.OrderStatus = OrderStatus.PaymentFailed;// Cập nhật trạng thái đơn hàng là thất bại

        await context.SaveChangesAsync(); // lưu các thay đổi
    }

    private async Task HandlePaymentIntentSucceeded(PaymentIntent intent)
    {
        // Tìm đơn hàng theo PaymentIntentId
        var order = await context.Orders
            .Include(x => x.OrderItems)
            .FirstOrDefaultAsync(x => x.PaymentIntentId == intent.Id) ?? throw new Exception("Không tìm thấy đơn hàng");

        // So sánh tổng tiền thực tế với số tiền Stripe đã thanh toán
        if (order.GetTotal() != intent.Amount)
        {
            order.OrderStatus = OrderStatus.PaymentMisMatch;// Nếu khác → ghi nhận là mismatch (có thể gian lận hoặc lỗi phía client)
        }
        else
        {
            order.OrderStatus = OrderStatus.PaymentReceived;// Nếu khớp → ghi nhận thanh toán thành công
        }

        var basket = await context.Baskets.FirstOrDefaultAsync(x => x.PaymentIntentId == intent.Id);
        if (basket != null) context.Baskets.Remove(basket); // Tìm basket tương ứng để xóa sau khi thanh toán thành công

        await context.SaveChangesAsync();// Lưu thay đổi
    }

    private Event ConstructStripeEvent(string json)
    {
        try
        {
            // Xác thực payload từ Stripe bằng chữ ký (để đảm bảo không bị giả mạo)
            return EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], config["StripeSettings:WhSecret"]);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Có lỗi khi tạo sự kiện Stripe"); // Log lỗi xác thực
            throw new StripeException("Có lỗi xác thực Stripe");
        }
    }
}
