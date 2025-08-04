
using System.Text.Json;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.RequestHelpers;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class ProductsController(StoreContext context, IMapper mapper, ImageService imageService) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<PagedList<ProductDto>>> GetProducts([FromQuery] ProductParams productParams) //[FromQuery] do sử dụng class để nhận dữ liệu cho gọn
        {
            var query = context.Products
                .Include(x => x.Images.OrderBy(x => x.Order)) // bao gồm các ảnh phụ của sản phẩm và sắp xếp theo thứ tự
                .Sort(productParams.OrderBy)
                .SearchTerm(productParams.SearchTerm)
                .Filter(productParams.Brands, productParams.Types)
                .AsQueryable();

            var products = await PagedList<Product>.ToPagedList(query, productParams.PageNumber, productParams.PageSize);

            Response.AddPaginationHeader(products.Metadata);//thêm vào http response header

            // Convert entities thành DTOs
            var productDtos = products.Select(p => p.ToDto()).ToList();
            var pagedProductDtos = new PagedList<ProductDto>(productDtos, products.Count, productParams.PageNumber, productParams.PageSize);
            pagedProductDtos.Metadata = products.Metadata;

            return pagedProductDtos;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await context.Products
                .Include(x => x.Images.OrderBy(x => x.Order)) // bao gồm các ảnh của sản phẩm và sắp xếp theo thứ tự
                .FirstOrDefaultAsync(x => x.Id == id);

            if (product == null) return NotFound(new { title = "sản phẩm không tồn tại!" });

            return product.ToDto(); // ánh xạ sang ProductDto
        }

        [HttpGet("filters")]
        public async Task<IActionResult> GetFilters()
        {
            var brands = await context.Products.Select(x => x.Brand).Distinct().ToListAsync();
            var types = await context.Products.Select(x => x.Type).Distinct().ToListAsync();

            // trả về object có mảng brands và mảng types
            return Ok(new { brands, types });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(CreateProductDto productDto)
        {
            var product = mapper.Map<Product>(productDto); // dùng productDto ánh xạ thành product
                                                           // cấu trúc dùng để tạo mới 1 đối tượng product từ productDto

            if (productDto.File != null)
            {
                var imageResult = await imageService.AddImageAsync(productDto.File);

                if (imageResult.Error != null)
                {
                    return BadRequest(imageResult.Error.Message);
                }

                product.PictureUrl = imageResult.SecureUrl.AbsoluteUri;
                product.publicId = imageResult.PublicId;
            }

            context.Products.Add(product);

            // Xử lý các ảnh phụ
            if (productDto.AdditionalFiles != null && productDto.AdditionalFiles.Count > 0)
            {
                // Parse orders nếu có
                Dictionary<int, int> fileOrders = new(); //tạo ra 1 object kiểu có key và value là int
                if (!string.IsNullOrEmpty(productDto.ImageOrdersJson))
                {
                    try
                    {
                        // tạo ra 1 dictionary từ chuỗi JSON với key là int (vị trí ảnh) trong AdditionalFiles và value là int (thứ tự hiển thị)
                        fileOrders = JsonSerializer.Deserialize<Dictionary<int, int>>(productDto.ImageOrdersJson) ?? new Dictionary<int, int>();
                    }
                    catch (Exception ex)
                    {
                        return BadRequest($"Lỗi khi phân tích chuỗi JSON: {ex.Message}");
                    }
                }

                for (int i = 0; i < productDto.AdditionalFiles.Count; i++)
                {
                    var file = productDto.AdditionalFiles[i];
                    var imageResult = await imageService.AddImageAsync(file);
                    if (imageResult.Error != null) continue;

                    // Lấy thứ tự từ dictionary nếu có, nếu không thì dùng thứ tự mặc định (i + 1)
                    int order = fileOrders.ContainsKey(i) ? fileOrders[i] : i + 1;

                    product.Images.Add(new ProductImage
                    {
                        Url = imageResult.SecureUrl.AbsoluteUri,
                        Order = order,
                        PublicId = imageResult.PublicId,
                    });
                }
            }

            var result = await context.SaveChangesAsync() > 0;
            if (result) return CreatedAtAction(nameof(GetProduct), new { Id = product.Id }, product.ToDto());

            return BadRequest("Có lỗi khi tạo sản phẩm");
        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<ActionResult> UpdateProduct(UpdateProductDto updateProductDto)
        {
            var product = await context.Products.FindAsync(updateProductDto.Id);

            if (product == null) return NotFound("Không tìm thấy sản phẩm");

            mapper.Map(updateProductDto, product); // cấu trúc dùng để cập nhật lại thuộc tính của đối tượng product có sẵn

            if (updateProductDto.File != null)
            {
                var imageResult = await imageService.AddImageAsync(updateProductDto.File);

                if (imageResult.Error != null)
                    return BadRequest(imageResult.Error.Message);

                if (!string.IsNullOrEmpty(product.publicId))
                    await imageService.DeleteImageAsync(product.publicId); // xóa ảnh của sản phẩm trên cloudinary

                product.PictureUrl = imageResult.SecureUrl.AbsoluteUri;
                product.publicId = imageResult.PublicId;
            }

            // Xử lý các ảnh phụ
            if (updateProductDto.AdditionalFiles != null && updateProductDto.AdditionalFiles.Count > 0)
            {
                // lấy tất cả các ảnh phụ hiện tại của sản phẩm để xóa
                var existingImages = await context.ProductImage.Where(x => x.ProductId == product.Id).ToListAsync();

                // xóa ảnh trên cloudinary
                foreach (var image in existingImages)
                {
                    if (!string.IsNullOrEmpty(image.PublicId))
                    {
                        await imageService.DeleteImageAsync(image.PublicId);
                    }
                }

                // Xóa tất cả các ảnh phụ hiện tại khỏi cơ sở dữ liệu
                context.ProductImage.RemoveRange(existingImages);

                // Parse orders nếu có
                Dictionary<int, int> fileOrders = new(); //tạo ra 1 object kiểu có key và value là int
                if (!string.IsNullOrEmpty(updateProductDto.ImageOrdersJson))
                {
                    try
                    {
                        // tạo ra 1 dictionary từ chuỗi JSON với key là int (vị trí ảnh) trong AdditionalFiles và value là int (thứ tự hiển thị)
                        fileOrders = JsonSerializer.Deserialize<Dictionary<int, int>>(updateProductDto.ImageOrdersJson) ?? new Dictionary<int, int>();
                    }
                    catch (Exception ex)
                    {
                        return BadRequest($"Lỗi khi phân tích chuỗi JSON: {ex.Message}");
                    }
                }

                for (int i = 0; i < updateProductDto.AdditionalFiles.Count; i++)
                {
                    var file = updateProductDto.AdditionalFiles[i];
                    var imageResult = await imageService.AddImageAsync(file);
                    if (imageResult.Error != null) continue;

                    // Lấy thứ tự từ dictionary nếu có, nếu không thì dùng thứ tự mặc định (i + 1)
                    int order = fileOrders.ContainsKey(i) ? fileOrders[i] : i + 1;

                    product.Images.Add(new ProductImage
                    {
                        Url = imageResult.SecureUrl.AbsoluteUri,
                        Order = order,
                        PublicId = imageResult.PublicId,
                    });
                }
            }

            var result = await context.SaveChangesAsync() > 0;

            if (result) return NoContent();

            return BadRequest("Có lỗi khi cập nhật sản phẩm");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            var product = await context.Products
            .Include(x => x.Images) // bao gồm các ảnh của sản phẩm
            .FirstOrDefaultAsync(x => x.Id == id);

            if (product == null) return NotFound("Không tìm thấy sản phẩm");

            if (!string.IsNullOrEmpty(product.publicId))
                await imageService.DeleteImageAsync(product.publicId); // xóa ảnh của sản phẩm trên cloudinary

            // Xóa tất cả các ảnh liên quan đến sản phẩm
            if (product.Images != null && product.Images.Count > 0)
            {
                foreach (var image in product.Images)
                {
                    if (!string.IsNullOrEmpty(image.PublicId))
                    {
                        await imageService.DeleteImageAsync(image.PublicId);
                    }
                }
            }

            context.Products.Remove(product);

            var result = await context.SaveChangesAsync() > 0;

            if (result) return Ok();

            return BadRequest("Có lỗi khi xóa sản phẩm");
        }

    }
}
