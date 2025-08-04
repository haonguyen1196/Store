import { z } from "zod";

const fileSchema = z.instanceof(File).refine((file) => file.size > 0, {
    message: "Vui lòng tải hình ảnh sản phẩm",
});

const additionalFilesSchema = z
    .array(z.instanceof(File))
    .refine((files) => files.length > 0, {
        message: "Vui lòng tải thêm hình ảnh sản phẩm",
    });

export const createProductSchema = z
    .object({
        name: z.string({ required_error: "Vui lòng nhập tên sản phẩm" }),
        description: z
            .string({ required_error: "Vui lòng nhập mô tả" })
            .min(10, {
                message: "Vui lòng nhập tối thiểu 10 ký tự",
            }),
        price: z.coerce
            .number({ required_error: "Vui lòng nhập giá sản phẩm" })
            .min(100, "Giá tối thiếu phải là 1$"),
        type: z.string({ required_error: "Vui lòng nhập loại sản phẩm" }),
        brand: z.string({
            required_error: "Vui lòng nhập thương hiệu sản phẩm",
        }),
        quantityInStock: z.coerce
            .number({ required_error: "Vui lòng nhập số lượng" })
            .min(1, "Số lượng phải lớn hơn 1"),
        pictureUrl: z.string().optional(),
        file: fileSchema.optional(),
        additionalFiles: additionalFilesSchema.optional(),
        imageOrdersJson: z.string().optional(),
    })
    .refine((data) => data.pictureUrl || data.file, {
        message: "Vui lòng chọn hình ảnh",
        path: ["file"],
    });

// tạo 1 type để đem ra ngoài sử dụng
export type CreateProductSchema = z.infer<typeof createProductSchema>;
