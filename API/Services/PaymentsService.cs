using System;
using API.Entities;
using Stripe;

namespace API.Services;

public class PaymentsService(IConfiguration config) // Inject cấu hình ứng dụng qua DI (được cấu hình sẵn ở Startup/Program)
{
    public async Task<PaymentIntent> CreateOrUpdatePaymentIntent(Basket basket)// Hàm tạo hoặc cập nhật Intent dựa trên giỏ hàng
    {
        StripeConfiguration.ApiKey = config["StripeSettings:SecretKey"]; // Lấy khóa bí mật từ cấu hình để gọi Stripe API

        var service = new PaymentIntentService();  // Khởi tạo service để thao tác với PaymentIntent

        var intent = new PaymentIntent(); // Biến lưu intent (có thể là mới hoặc đã tồn tại)
        var subtotal = basket.Items.Sum(x => x.Quantity * x.Product.Price); // Tính tổng tiền hàng
        var deliveryFee = subtotal > 10000 ? 0 : 500; // Miễn phí ship nếu tổng > 10000, ngược lại phí là 500

        if (string.IsNullOrEmpty(basket.ClientSecret))// Nếu giỏ hàng chưa có ClientSecret → tạo mới Intent
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = subtotal + deliveryFee,
                Currency = "usd",
                PaymentMethodTypes = ["card"]
            };
            intent = await service.CreateAsync(options); // Gọi Stripe tạo PaymentIntent mới
        }
        else // Nếu giỏ hàng đã có PaymentIntent → cập nhật lại số tiền (nếu có thay đổi)
        {
            var options = new PaymentIntentUpdateOptions
            {
                Amount = subtotal + deliveryFee
            };

            await service.UpdateAsync(basket.PaymentIntentId, options); // Gọi Stripe cập nhật PaymentIntent hiện có
        }

        return intent; // Trả về PaymentIntent (để client lấy client_secret và thực hiện thanh toán)
    }
}
