import { z } from "zod";

// tạo biến = object chứa logic xác thực dữ liệu
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Vui lòng nhập email" })
        .email({ message: "Email không hợp lệ" }),
    password: z.string().min(1, { message: "Vui lòng nhập mật khẩu" }).min(6, {
        message: "Mật khẩu phải có ít nhất 6 ký tự",
    }),
});

// tạo 1 type để đem ra ngoài sử dụng
export type LoginSchema = z.infer<typeof loginSchema>;
