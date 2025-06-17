using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class RegisterDto
{
    [Required] // trường email không đc để trống hoặc null
    public string Email { get; set; } = string.Empty;
    public required string Password { get; set; }
}
