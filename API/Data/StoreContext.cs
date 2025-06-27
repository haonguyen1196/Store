using System;
using API.Entities;
using API.Entities.OrderAggregate;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;


//IdentityDbContext<User> làm việc với các bảng liên quan đến người dùng, tự động tạo bảng (user, role, claim)
public class StoreContext(DbContextOptions options) : IdentityDbContext<User>(options)
{
    public required DbSet<Product> Products { get; set; }
    public required DbSet<Basket> Baskets { get; set; } // them dong nay truoc khi chay: dotnet ef migrations add NameFile
    public required DbSet<Order> Orders { get; set; }
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // tạo seed data cho bẳng role
        builder.Entity<IdentityRole>()
            .HasData(
                new IdentityRole { Id = "3389dc61-caa0-4e38-85e5-4aa681e6fdbb", Name = "Member", NormalizedName = "MEMBER" },
                new IdentityRole { Id = "2a84591e-6f2f-4537-9892-468dc44914d8", Name = "Admin", NormalizedName = "ADMIN" }
            );

        // ✅ Cấu hình quan hệ 1-1 giữa User và Address + Cascade Delete
        // builder.Entity<User>()
        //     .HasOne(u => u.Address) // một user có 1 address
        //     .WithMany() // address không có navigation ngược về
        //     .HasForeignKey(u => u.AddressId) // khóa ngoại nằm trong bẳng user
        //     .OnDelete(DeleteBehavior.Cascade); // xóa user sẽ xóa luôn address
    }
}
