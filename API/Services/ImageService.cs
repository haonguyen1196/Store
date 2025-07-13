using System;
using API.RequestHelpers;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace API.Services;

public class ImageService
{
    private readonly Cloudinary _cloudinary;

    public ImageService(IOptions<CloudinarySettings> config)
    {
        var acc = new Account(
            config.Value.CloudName,
            config.Value.ApiKey,
            config.Value.ApiSecret
        );

        _cloudinary = new Cloudinary(acc);
    }

    public async Task<ImageUploadResult> AddImageAsync(IFormFile file)
    {
        var uploadResult = new ImageUploadResult(); // tạo object rỗng để lưu kết quả

        if (file.Length > 0)
        {
            using var stream = file.OpenReadStream(); // tạo file thánh stream để cloudinary sử dụng
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "rs-course" // thư mục trên cloudinary nơi sẽ đc lưu ảnh
            };// tạo tham số upload ảnh cho cloudinary

            uploadResult = await _cloudinary.UploadAsync(uploadParams); // gọi api của cloudinary để upload ảnh bất đồng bộ
        }

        return uploadResult; // Trả về kết quả upload (chứa URL, PublicId, trạng thái, v.v.)
    }

    public async Task<DeletionResult> DeleteImageAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);

        var result = await _cloudinary.DestroyAsync(deleteParams);

        return result;
    }
}
