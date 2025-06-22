using API.Data;
using API.Entities;
using API.Middleware;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddDbContext<StoreContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddCors();
builder.Services.AddTransient<ExceptionMiddleware>(); // đăng ký middleware vào DI và khai báo kiểu vòng đơi
builder.Services.AddScoped<PaymentsService>();
builder.Services.AddIdentityApiEndpoints<User>(opt =>
{
    opt.User.RequireUniqueEmail = true;
}).AddRoles<IdentityRole>().AddEntityFrameworkStores<StoreContext>();// đăng ký cấu hình cho identity framework

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>(); // gọi và tạo instance theo khai báo
app.UseCors(opt =>
{
    opt.AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials() // cho phép gửi cookie về cho client
    .WithOrigins("https://localhost:3000")
    .WithExposedHeaders("Pagination"); // cho client đọc các header
});

app.UseAuthentication(); // kích hoạt middleware xác thực (nhận thông tin từ http request header)
app.UseAuthorization(); // kích hoạt middleware diểm tra phân quyền

app.MapControllers();
app.MapGroup("api").MapIdentityApi<User>();// cung cấp các đường dẫn api của identity framework cho ứng dụng


DbInitializer.InitDb(app);

app.Run();
