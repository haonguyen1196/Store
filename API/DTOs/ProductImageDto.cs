namespace API.DTOs;

public class ProductImageDto
{
    public int Id { get; set; }
    public string? Url { get; set; }
    public int Order { get; set; }
    public string? PublicId { get; set; } // Public ID for Cloudinary
    public int ProductId { get; set; }
}