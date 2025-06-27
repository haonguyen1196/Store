using System;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Entities.OrderAggregate;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class OrdersController(StoreContext context) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetOrders()
    {
        var orders = await context.Orders
            .ProjectToDto()
            .Where(x => x.BuyerEmail == User.GetUsername())
            .ToListAsync();

        return orders;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrderDetails(int id)
    {
        var order = await context.Orders
            .ProjectToDto()
            .Where(x => x.BuyerEmail == User.GetUsername() && id == x.Id)
            .FirstOrDefaultAsync();

        if (order == null) return NotFound();

        return order;
    }

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
    {
        var basket = await context.Baskets.GetBasketWithItems(Request.Cookies["basketId"]); // get basket

        if (basket == null || basket.Items.Count == 0 || string.IsNullOrEmpty(basket.PaymentIntentId))
            return BadRequest("Giỏ hàng trống hoặc không tìm thấy");

        var items = CreateOrderItems(basket.Items);// create list orderitems and update product quantity in stock
        if (items == null) return BadRequest("Số lượng sản phẩm tồn kho không đủ");


        var subtotal = items.Sum(x => x.Price * x.Quantity);
        var deliveryFee = CalculateDeliveryFee(subtotal);

        var order = await context.Orders
            .Include(x => x.OrderItems)
            .FirstOrDefaultAsync(x => x.PaymentIntentId == basket.PaymentIntentId);

        if (order == null)
        {
            order = new Order
            {
                OrderItems = items,
                BuyerEmail = User.GetUsername(),
                ShippingAddress = orderDto.ShippingAddress,
                DeliveryFee = deliveryFee,
                Subtotal = subtotal,
                PaymentSummary = orderDto.PaymentSummary,
                PaymentIntentId = basket.PaymentIntentId
            };

            context.Orders.Add(order); // thêm order
        }
        else
        {
            order.OrderItems = items;
        }

        var result = await context.SaveChangesAsync() > 0; // lưu lại những thay đổi
        if (!result) return BadRequest("Có lỗi khi tạo đơn hàng");

        return CreatedAtAction(nameof(GetOrderDetails), new { id = order.Id }, order.ToDto()); // trả về 201
    }

    private long CalculateDeliveryFee(long subtotal)
    {
        return subtotal > 10000 ? 0 : 500;
    }

    private List<OrderItem>? CreateOrderItems(List<BasketItem> items)
    {
        // kiểm tra tất cả sản phẩm đều tồn kho đủ
        foreach (var item in items)
        {
            if (item.Product.QuantityInStock < item.Quantity)
                return null;
        }

        var orderItems = new List<OrderItem>();

        foreach (var item in items)
        {
            var orderItem = new OrderItem
            {
                ItemOrdered = new ProductItemOrdered
                {
                    ProductId = item.ProductId,
                    PictureUrl = item.Product.PictureUrl,
                    Name = item.Product.Name
                },
                Price = item.Product.Price,
                Quantity = item.Quantity
            };// tạo ra 1 object dựa trên type của class OrderItem

            orderItems.Add(orderItem);// thêm object vào mảng

            item.Product.QuantityInStock -= item.Quantity; // trừ đi số lượng tồn kho của sản phẩm
        }

        return orderItems; // trả ra mảng
    }
}
