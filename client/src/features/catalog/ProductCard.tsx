import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Typography,
} from "@mui/material";
import type { Product } from "../../app/models/product";
import { Link } from "react-router-dom";
import { useAddBasketItemMutation } from "../basket/basketApi";
import { currencyFormat } from "../../lib/util";
import useDeviceSize from "../../lib/hooks/useDeviceSize";

type Props = {
    product: Product;
};
export default function ProductCard({ product }: Props) {
    const [addBasketItem, { isLoading }] = useAddBasketItemMutation();
    const { isMobile } = useDeviceSize();

    return (
        <Card
            elevation={3}
            sx={{
                width: "100%",
                height: "100%",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <CardMedia
                sx={{ height: isMobile ? 180 : 240, backgroundSize: "cover" }}
                image={product.pictureUrl}
                title={product.name}
            />
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
                <Typography
                    gutterBottom
                    sx={{
                        textTransform: "uppercase",
                        fontSize: isMobile ? "0.875rem" : "1rem",
                    }}
                    variant="subtitle2"
                >
                    {product.name}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        color: "secondary.main",
                        fontSize: isMobile ? "1.1rem" : "1.25rem",
                    }}
                >
                    {currencyFormat(product.price)}
                </Typography>
            </CardContent>
            <CardActions
                sx={{ justifyContent: "space-between", p: isMobile ? 1 : 2 }}
            >
                <Button
                    disabled={isLoading}
                    onClick={() =>
                        addBasketItem({ product: product, quantity: 1 })
                    }
                    size={isMobile ? "small" : "medium"}
                >
                    Thêm giỏ hàng
                </Button>
                <Button
                    component={Link}
                    to={`/catalog/${product.id}`}
                    size={isMobile ? "small" : "medium"}
                >
                    Chi tiết
                </Button>
            </CardActions>
        </Card>
    );
}
