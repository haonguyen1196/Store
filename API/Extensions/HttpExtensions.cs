using System;
using System.Text.Json;
using API.RequestHelpers;
using Microsoft.Net.Http.Headers;

namespace API.Extensions;

public static class HttpExtensions
{
    public static void AddPaginationHeader(this HttpResponse response, PaginationMetadata metadata)
    {
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        // giúp định dạng value metadata thành dọng camelCase cho đẹp

        response.Headers.Append("Pagination", JsonSerializer.Serialize(metadata, options));
        // gửi metadata qua http header response

        response.Headers.Append(HeaderNames.AccessControlAllowHeaders, "Pagination");
        // giúp frontend có thể đọc được header tùy chỉnh
    }
}
