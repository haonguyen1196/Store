import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/store/store";
import { useFetchProductsQuery } from "../catalog/catalogApi";
import { currencyFormat } from "../../lib/util";
import { Delete, Edit } from "@mui/icons-material";
import AppPagination from "../../app/shared/components/AppPagination";
import { setPageNumber } from "../catalog/catalogSlice";
import { useState } from "react";
import ProductForm from "./ProductForm";
import type { Product } from "../../app/models/product";
import { useDeleteProductMutation } from "./adminApi";
import useDeviceSize from "../../lib/hooks/useDeviceSize";

export default function InventoryPage() {
    const productParams = useAppSelector((state) => state.catalog);
    const { data, refetch } = useFetchProductsQuery(productParams);
    const dispatch = useAppDispatch();
    const [editMode, setEditMode] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null
    );
    const [deleteProduct] = useDeleteProductMutation();
    const { isMobile } = useDeviceSize();

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setEditMode(true);
    };

    const handleDeleteProduct = async (id: number) => {
        try {
            await deleteProduct(id);
            refetch();
        } catch (error) {
            console.log(error);
        }
    };

    if (editMode)
        return (
            <ProductForm
                setEditMode={setEditMode}
                product={selectedProduct}
                refetch={refetch}
                setSelectedProduct={setSelectedProduct}
            />
        );

    return (
        <>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
            >
                <Typography
                    sx={{ p: isMobile ? 1 : 2 }}
                    variant={isMobile ? "h5" : "h4"}
                >
                    Thống kê sản phẩm
                </Typography>
                <Button
                    onClick={() => {
                        setSelectedProduct(null);
                        setEditMode(true);
                    }}
                    sx={{ m: isMobile ? 1 : 2 }}
                    size={isMobile ? "medium" : "large"}
                    variant="contained"
                >
                    Tạo
                </Button>
            </Box>

            {isMobile ? (
                // Mobile view - Card layout
                <Box sx={{ mt: 2 }}>
                    {data?.items.map((product) => (
                        <Paper
                            key={product.id}
                            sx={{
                                p: 2,
                                mb: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                            }}
                        >
                            <Box display="flex" gap={2} alignItems="center">
                                <img
                                    src={product.pictureUrl}
                                    alt={product.name}
                                    style={{
                                        height: 60,
                                        width: 60,
                                        objectFit: "cover",
                                        borderRadius: 4,
                                    }}
                                />
                                <Box flex={1}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={500}
                                    >
                                        {product.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {currencyFormat(product.price)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                mt={1}
                            >
                                <Typography variant="body2">
                                    Loại: {product.type}
                                </Typography>
                                <Typography variant="body2">
                                    Thương hiệu: {product.brand}
                                </Typography>
                            </Box>

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Typography variant="body2">
                                    Số lượng: {product.quantityInStock}
                                </Typography>
                                <Box>
                                    <Button
                                        onClick={() =>
                                            handleSelectProduct(product)
                                        }
                                        size="small"
                                    >
                                        <Edit fontSize="small" />
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            handleDeleteProduct(product.id)
                                        }
                                        color="error"
                                        size="small"
                                    >
                                        <Delete fontSize="small" />
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            ) : (
                // Desktop view - Table layout
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell align="left">Sản phẩm</TableCell>
                                <TableCell align="right">Giá</TableCell>
                                <TableCell align="center">Loại</TableCell>
                                <TableCell align="center">
                                    Thương hiệu
                                </TableCell>
                                <TableCell align="center">Số lượng</TableCell>
                                <TableCell align="right">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data &&
                                data.items.map((product) => (
                                    <TableRow
                                        key={product.id}
                                        sx={{
                                            "&:last-child td, &:last-child th":
                                                {
                                                    border: 0,
                                                },
                                        }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {product.id}
                                        </TableCell>
                                        <TableCell align="left">
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                            >
                                                <img
                                                    src={product.pictureUrl}
                                                    alt={product.name}
                                                    style={{
                                                        height: 50,
                                                        marginRight: 20,
                                                    }}
                                                />
                                                <span>{product.name}</span>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            {currencyFormat(product.price)}
                                        </TableCell>
                                        <TableCell align="center">
                                            {product.type}
                                        </TableCell>
                                        <TableCell align="center">
                                            {product.brand}
                                        </TableCell>
                                        <TableCell align="center">
                                            {product.quantityInStock}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                onClick={() =>
                                                    handleSelectProduct(product)
                                                }
                                                startIcon={<Edit />}
                                            />
                                            <Button
                                                onClick={() =>
                                                    handleDeleteProduct(
                                                        product.id
                                                    )
                                                }
                                                startIcon={<Delete />}
                                                color="error"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Box sx={{ p: isMobile ? 1 : 2 }}>
                {data?.pagination && data.items.length > 0 && (
                    <AppPagination
                        metadata={data.pagination}
                        onPageChange={(page: number) =>
                            dispatch(setPageNumber(page))
                        }
                    />
                )}
            </Box>
        </>
    );
}
