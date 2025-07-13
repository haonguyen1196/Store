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
        public async Task<ActionResult<List<Product>>> GetProducts([FromQuery] ProductParams productParams) //[FromQuery] do sử dụng class để nhận dữ liệu cho gọn
        {
            var query = context.Products
                .Sort(productParams.OrderBy)
                .SearchTerm(productParams.SearchTerm)
                .Filter(productParams.Brands, productParams.Types)
                .AsQueryable();

            var products = await PagedList<Product>.ToPagedList(query, productParams.PageNumber, productParams.PageSize);

            Response.AddPaginationHeader(products.Metadata);//thêm vào http response header

            return products;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await context.Products.FindAsync(id);

            if (product == null) return NotFound(new { title = "sản phẩm không tồn tại!" });

            return product;
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

            var result = await context.SaveChangesAsync() > 0;
            if (result) return CreatedAtAction(nameof(GetProduct), new { Id = product.Id }, product);

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

            var result = await context.SaveChangesAsync() > 0;

            if (result) return NoContent();

            return BadRequest("Có lỗi khi cập nhật sản phẩm");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            var product = await context.Products.FindAsync(id);

            if (product == null) return NotFound("Không tìm thấy sản phẩm");

            if (!string.IsNullOrEmpty(product.publicId))
                await imageService.DeleteImageAsync(product.publicId); // xóa ảnh của sản phẩm trên cloudinary

            context.Products.Remove(product);

            var result = await context.SaveChangesAsync() > 0;

            if (result) return Ok();

            return BadRequest("Có lỗi khi xóa sản phẩm");
        }

    }
}
