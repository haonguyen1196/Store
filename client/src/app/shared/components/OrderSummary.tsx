import {
    Box,
    Typography,
    Divider,
    Button,
    TextField,
    Paper,
} from "@mui/material";
import { currencyFormat } from "../../../lib/util";
import { useFetchBasketQuery } from "../../../features/basket/basketApi";
import type { Item } from "../../models/basket";
import { Link } from "react-router-dom";

export default function OrderSummary() {
    const { data: basket } = useFetchBasketQuery();
    const subtotal =
        basket?.items.reduce(
            (sum: number, item: Item) => sum + item.price * item.quantity,
            0
        ) || 0;
    const deliveryFee = subtotal > 10000 ? 0 : 500;

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            maxWidth="lg"
            mx="auto"
        >
            <Paper sx={{ mb: 2, p: 3, width: "100%", borderRadius: 3 }}>
                <Typography variant="h6" component="p" fontWeight="bold">
                    Đơn hàng
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    Giá trị đơn hàng trên $100 sẽ được miễn phí vận chuyển!
                </Typography>
                <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="textSecondary">Tổng</Typography>
                        <Typography>{currencyFormat(subtotal)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="textSecondary">Giảm giá</Typography>
                        <Typography color="success">
                            {/* TODO */}
                            -$0.00
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="textSecondary">
                            Phí vận chuyển
                        </Typography>
                        <Typography>{currencyFormat(deliveryFee)}</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="textSecondary">Tổng cộng</Typography>
                        <Typography>
                            {currencyFormat(subtotal + deliveryFee)}
                        </Typography>
                    </Box>
                </Box>

                <Box mt={2}>
                    <Button
                        component={Link}
                        to="/checkout"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mb: 1 }}
                    >
                        Thanh toán
                    </Button>
                    <Button component={Link} to="/catalog" fullWidth>
                        Tiếp tục mua sắm
                    </Button>
                </Box>
            </Paper>

            {/* Coupon Code Section */}
            <Paper sx={{ width: "100%", borderRadius: 3, p: 3 }}>
                <form>
                    <Typography variant="subtitle1" component="label">
                        Bạn có mã giảm giá?
                    </Typography>

                    <TextField
                        label="Mã giảm giá"
                        variant="outlined"
                        fullWidth
                        sx={{ my: 2 }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                    >
                        Áp dụng mã
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}
