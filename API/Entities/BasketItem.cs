using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

[Table("BasketItems")] // đặt tên cho model ở migrations vì khi tạo tự động migration nhờ mối quan hệ với bẳng basket sẽ lấy tự động tên class là BasketItem 
public class BasketItem
{
    public int Id { get; set; }
    public int Quantity { get; set; }

    //navigate properties (đinh nghĩa mối quan hệ với Product)
    public int ProductId { get; set; } // khóa ngoại đến bẳng product
    public required Product Product { get; set; }

    public int BasketId { get; set; }
    public Basket Basket { get; set; } = null!;
}