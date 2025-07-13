using API.Data;
using API.Entities;
using API.Middleware;
using API.RequestHelpers;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("Cloudinary")); // lấy setting cloudinary từ appsetting.json
builder.Services.AddControllers();
builder.Services.AddDbContext<StoreContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddCors();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies()); // tìm ra các class kế thừa profile rồi đăng ký vào DI
builder.Services.AddTransient<ExceptionMiddleware>(); // đăng ký middleware vào DI và khai báo kiểu vòng đơi
builder.Services.AddScoped<PaymentsService>();
builder.Services.AddScoped<ImageService>();
builder.Services.AddIdentityApiEndpoints<User>(opt =>
{
    opt.User.RequireUniqueEmail = true;
}).AddRoles<IdentityRole>().AddEntityFrameworkStores<StoreContext>();// đăng ký cấu hình cho identity framework

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>(); // gọi và tạo instance theo khai báo

app.UseDefaultFiles(); // tự động tìm index.html trong wwwroot nếu URL không chỉ rõ file
app.UseStaticFiles(); // phục vụ các file tĩnh (html, css, js...) trong wwwroot

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
app.MapFallbackToController("Index", "Fallback"); // nếu không khớp route nào sẽ gọi action Index


await DbInitializer.InitDb(app); // khởi tạo csdl bán đầu cho dự án

app.Run();
