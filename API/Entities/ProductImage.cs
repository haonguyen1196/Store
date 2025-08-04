using System;

namespace API.Entities;

public class ProductImage
{
    public int Id { get; set; }
    public string? Url { get; set; }
    public string? PublicId { get; set; } // Public ID for Cloudinary
    public int Order { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!; // Navigation property to Product
}
