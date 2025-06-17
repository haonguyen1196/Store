using System;
using System.Text.Json.Serialization;

namespace API.Entities;

public class Address
{
    // ID của địa chỉ (khóa chính), sẽ bị bỏ qua khi serialize JSON trả về
    [JsonIgnore]
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Line1 { get; set; }
    public string? Line2 { get; set; }
    public required string City { get; set; }
    public required string State { get; set; }

    // vì từ client request lên key sẽ là type snakecase 
    [JsonPropertyName("postal_code")]
    public required string PostalCode { get; set; }
    public required string Country { get; set; }
}
