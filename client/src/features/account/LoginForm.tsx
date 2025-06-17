import { LockOutlined } from "@mui/icons-material";
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginSchema } from "../../lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLazyUserInfoQuery, useLoginMutation } from "./accountApi";

export default function LoginForm() {
    const [login, { isLoading }] = useLoginMutation();
    const [fetchUserInfo] = useLazyUserInfoQuery();
    const location = useLocation();
    const {
        register, // các sự liện tác động lên input
        handleSubmit, // sự kiện submit form
        formState: { errors },
    } = useForm<LoginSchema>({
        mode: "onTouched", //validation kích hoạt khi người dùng thao tác với field
        resolver: zodResolver(loginSchema), // tích hợp schema validation login
    });

    const navigation = useNavigate();

    const onSubmit = async (data: LoginSchema) => {
        await login(data);
        await fetchUserInfo(); //vì useUserInfoQuery() trong RequireAuth không tự động chờ bạn gọi lại API qua dispatch(...)
        // nên là trước khi chuyển hướng thì sẽ lấu user rồi cache
        navigation(location.state?.from || "/catalog");
    };

    return (
        <Container component={Paper} maxWidth="sm" sx={{ borderRadius: 3 }}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                marginTop="8"
            >
                <LockOutlined
                    sx={{ mt: 3, color: "secondary.main", fontSize: 40 }}
                />
                <Typography variant="h5">Đăng nhập</Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    width="100%"
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    marginY={3}
                >
                    <TextField
                        fullWidth
                        label="Email"
                        autoFocus
                        {...register("email")}
                        error={!!errors.email} // đỏ viền nếu có lỗi
                        helperText={errors.email?.message} // hiển thị lỗi nếu có
                    />
                    <TextField
                        fullWidth
                        label="Mật khẩu"
                        type="password"
                        {...register("password")}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    <Button
                        disabled={isLoading}
                        variant="contained"
                        type="submit"
                    >
                        Đăng nhập
                    </Button>
                    <Typography sx={{ textAlign: "center" }}>
                        Chưa có tài khoản?
                        <Typography
                            sx={{ ml: 1 }}
                            component={Link}
                            to="/register"
                            color="primary"
                        >
                            Đăng ký
                        </Typography>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
}
