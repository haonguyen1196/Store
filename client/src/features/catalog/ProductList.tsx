import { Grid2 } from "@mui/material";
import type { Product } from "../../app/models/product";
import ProductCard from "./ProductCard";

type Props = {
    products: Product[];
};

export default function ProductList({ products }: Props) {
    return (
        <Grid2 container spacing={3}>
            {products.map((product) => (
                <Grid2
                    size={{ xs: 6, sm: 6, md: 4, lg: 3 }}
                    display="flex"
                    justifyContent="center"
                    key={product.id}
                >
                    <ProductCard product={product} />
                </Grid2>
            ))}
        </Grid2>
    );
}
