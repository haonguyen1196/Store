using API.Data;
using API.Middleware;
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

app.MapControllers();

DbInitializer.InitDb(app);

app.Run();
