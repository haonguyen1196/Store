using Microsoft.AspNetCore.Http.Features;

namespace API.Entities;

public class Basket
{
    public int Id { get; set; }
    public required string BasketId { get; set; }
    public List<BasketItem> Items { get; set; } = []; // định nghĩa mối quan hệ với BasketItem
    public string? ClientSecret { get; set; }
    public string? PaymentIntentId { get; set; }

    public void AddItem(Product product, int quantity)
    {
        if (product == null) ArgumentNullException.ThrowIfNull(product); // ném ra lỗi nếu tham số truyền vào là null
        if (quantity <= 0) throw new ArgumentException("Số lượng phải lớn hơn 0", nameof(quantity));

        var existingItem = FindItem(product.Id); // tìm item trong BasketItem theo productId

        if (existingItem == null)
        {
            Items.Add(new BasketItem
            {
                Product = product, // lưu bằng product luôn cho thành phần navigate properties
                Quantity = quantity
            });
        }
        else
        {
            existingItem.Quantity += quantity;
        }
    }

    public void RemoveItem(int productId, int quantity)
    {
        if (quantity <= 0) throw new ArgumentException("Số lượng phải lớn hơn 0", nameof(quantity));

        var item = FindItem(productId);
        if (item == null) return;

        item.Quantity -= quantity;
        if (item.Quantity <= 0) Items.Remove(item);
    }

    private BasketItem? FindItem(int productId)
    {
        return Items.FirstOrDefault(item => item.ProductId == productId); // lấy item nào có cột ProductId và id của sản phẩm
    }
}
