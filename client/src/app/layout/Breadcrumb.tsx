import { NavigateNext } from "@mui/icons-material";
import { Breadcrumbs, Box, Typography } from "@mui/material";
import { useLocation, Link } from "react-router-dom";

export default function Breadcrumb() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x, index, arr) => {
        // nếu là phần cuối cùng và là số thì không hiển thị
        if (index === arr.length - 1 && !isNaN(Number(x))) {
            return false;
        }

        return true;
    }); // lấy mảng các phần của đường dẫn

    // Mapping các path với tên hiển thị tiếng Việt
    const pathMap: { [key: string]: string } = {
        catalog: "Sản phẩm",
        basket: "Giỏ hàng",
        checkout: "Thanh toán",
        orders: "Đơn hàng",
        account: "Tài khoản",
        admin: "Quản trị",
        inventory: "Kho hàng",
    };

    if (location.pathname === "/") return null; // Không hiển thị breadcrumb trên trang chủ

    return (
        <Box sx={{ mb: 3, mt: -4 }}>
            <Breadcrumbs
                separator={<NavigateNext fontSize="small" />}
                aria-label="breadcrumb"
                sx={{
                    "& .MuiBreadcrumbs-ol": {
                        alignItems: "center",
                    },
                    "& a": {
                        textDecoration: "none",
                        "&:hover": {
                            textDecoration: "underline",
                        },
                    },
                }}
            >
                <Link
                    to="/"
                    style={{
                        color: "inherit",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    Trang chủ
                </Link>

                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                    // nếu là phần cuối cùng và là số thì không hiển thị
                    if (!isNaN(Number(value))) return null;
                    const name = pathMap[value] || value;

                    return last ? (
                        <Typography
                            color="text.primary"
                            key={to}
                            sx={{
                                fontWeight: 500,
                                color: (theme) => theme.palette.primary.main,
                            }}
                        >
                            {name}
                        </Typography>
                    ) : (
                        <Link
                            to={to}
                            key={to}
                            style={{
                                color: "inherit",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            {name}
                        </Link>
                    );
                })}
            </Breadcrumbs>
        </Box>
    );
}
