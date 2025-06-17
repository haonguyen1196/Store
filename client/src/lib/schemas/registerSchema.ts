import { z } from "zod";

const passwordValidation = new RegExp(
    /(?=^.{6,10}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/
);

export const registerSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Vui lòng nhập email" })
        .email({ message: "Email không hợp lệ" }),
    password: z
        .string()
        .min(1, { message: "Vui lòng nhập mật khẩu" })
        .regex(passwordValidation, {
            message:
                "Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa, 1 số, 1 ký tự đặc biệt và có độ dài từ 6 đến 10 ký tự",
        }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
