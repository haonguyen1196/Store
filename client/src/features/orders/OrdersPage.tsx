import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useFetchOrdersQuery } from "./orderApi";
import { useNavigate } from "react-router-dom";
import { currencyFormat } from "../../lib/util";
import { format } from "date-fns";

export default function OrdersPage() {
    const { data: orders, isLoading } = useFetchOrdersQuery();
    const navigate = useNavigate();

    if (isLoading) return <Typography variant="h5">Đang tải...</Typography>;

    if (!orders)
        return <Typography variant="h5">Chưa có đơn hàng nào!</Typography>;

    return (
        <Container maxWidth="md">
            <Typography variant="h5" align="center" my={2}>
                Đơn hàng của tôi
            </Typography>
            <Paper sx={{ borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Đơn hàng</TableCell>
                            <TableCell>Thời gian</TableCell>
                            <TableCell>Tổng tiền</TableCell>
                            <TableCell>Trang thái</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow
                                key={order.id}
                                hover
                                onClick={() => navigate(`/orders/${order.id}`)}
                                style={{ cursor: "pointer" }}
                            >
                                <TableCell align="center">
                                    # {order.id}
                                </TableCell>
                                <TableCell>
                                    {format(order.orderDate, "dd MM yyyy")}
                                </TableCell>
                                <TableCell>
                                    {currencyFormat(order.total)}
                                </TableCell>
                                <TableCell>{order.orderStatus}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Container>
    );
}
