import { Modal } from "@mui/material";
import { useParams } from "react-router-dom";
import {
    Box,
    Button,
    Divider,
    Grid2,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useFetchProductDetailsQuery } from "./catalogApi";
import {
    useAddBasketItemMutation,
    useFetchBasketQuery,
    useRemoveBasketItemMutation,
} from "../basket/basketApi";
import { useEffect, useState, type ChangeEvent } from "react";
import useDeviceSize from "../../lib/hooks/useDeviceSize";

export default function ProductDetails() {
    const { id } = useParams();
    const [removeBasketItem] = useRemoveBasketItemMutation();
    const [addBasketItem] = useAddBasketItemMutation();
    const { data: basket } = useFetchBasketQuery();
    const item = basket?.items.find((x) => x.productId === +id!);
    const [quantity, setQuantity] = useState(0);
    const { isMobile } = useDeviceSize();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (item) setQuantity(item.quantity);
    }, [item]);

    const { data: product, isLoading } = useFetchProductDetailsQuery(
        id ? +id : 0
    );

    if (!product || isLoading) return <div>Đang tải...</div>;
    console.log(product);

    const handleUpdateBasket = () => {
        const updatedQuantity = item
            ? Math.abs(quantity - item.quantity)
            : quantity;
        if (!item || quantity > item.quantity) {
            addBasketItem({ product, quantity: updatedQuantity });
        } else {
            removeBasketItem({
                productId: product.id,
                quantity: updatedQuantity,
            });
        }
    }; // cập nhật giỏ hàng

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = +event.currentTarget.value;
        if (value >= 0) {
            setQuantity(value);
        }
    }; // set quantity khi value của input lớn hơn hay bằng 0

    const productDetails = [
        { label: "Tên", value: product.name },
        { label: "Mô tả", value: product.description },
        { label: "Loại", value: product.type },
        { label: "Thương hiệu", value: product.brand },
        { label: "Tồn kho", value: product.quantityInStock },
    ];

    const allImages = [
        { id: "main", url: product.pictureUrl }, // ảnh chính
        ...(product.images ?? []), // ảnh phụ
    ];

    const handleNextImage = () => {
        const imagesLength = allImages.length;
        if (imagesLength > 0) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imagesLength);
        }
    };

    const handlePrevImage = () => {
        const imagesLength = allImages.length;
        if (imagesLength > 0) {
            setCurrentImageIndex(
                (prevIndex) => (prevIndex - 1 + imagesLength) % imagesLength
            );
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <Grid2
            container
            spacing={isMobile ? 2 : 6}
            maxWidth="lg"
            sx={{ mx: "auto" }}
        >
            {/* Ảnh sản phẩm */}
            <Grid2 size={{ xs: 12, md: 6 }}>
                <Box sx={{ position: "relative" }}>
                    <img
                        src={allImages[currentImageIndex]?.url}
                        alt={product.name}
                        style={{
                            width: "100%",
                            borderRadius: 8,
                            cursor: "pointer",
                        }}
                        onClick={handleOpenModal}
                    />

                    {/* Nút Back và Forward */}
                    {allImages.length > 1 && (
                        <>
                            <Button
                                onClick={handlePrevImage}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: 0,
                                    transform: "translateY(-50%)",
                                    bgcolor: "rgba(0, 0, 0, 0.5)",
                                    color: "white",
                                    minWidth: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    zIndex: 10,
                                    "&:hover": {
                                        bgcolor: "rgba(0, 0, 0, 0.7)",
                                    },
                                }}
                            >
                                ◀
                            </Button>
                            <Button
                                onClick={handleNextImage}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    right: 0,
                                    transform: "translateY(-50%)",
                                    bgcolor: "rgba(0, 0, 0, 0.5)",
                                    color: "white",
                                    minWidth: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    zIndex: 10,
                                    "&:hover": {
                                        bgcolor: "rgba(0, 0, 0, 0.7)",
                                    },
                                }}
                            >
                                ▶
                            </Button>
                        </>
                    )}
                </Box>

                {/* Danh sách ảnh phụ */}
                {allImages.length > 0 && (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            mt: 2,
                            overflowX: "auto",
                        }}
                    >
                        {allImages.map((image, index) => (
                            <img
                                key={image.id}
                                src={image.url}
                                alt={`Thumbnail ${index}`}
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    border:
                                        currentImageIndex === index
                                            ? "2px solid #1976d2"
                                            : "2px solid transparent",
                                }}
                                onClick={() => setCurrentImageIndex(index)}
                            />
                        ))}
                    </Box>
                )}
            </Grid2>

            {/* Modal hiển thị ảnh phóng to */}
            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        bgcolor: "rgba(0, 0, 0, 0.9)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1300,
                    }}
                    onClick={handleCloseModal}
                >
                    {/* Nút đóng */}
                    <Button
                        onClick={handleCloseModal}
                        sx={{
                            position: "absolute",
                            top: 24,
                            right: 24,
                            color: "white",
                            minWidth: 32,
                            height: 32,
                            bgcolor: "rgba(0,0,0,0.5)",
                            borderRadius: "50%",
                            zIndex: 1400,
                            fontSize: 24,
                            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                        }}
                    >
                        ×
                    </Button>
                    <img
                        src={allImages[currentImageIndex]?.url}
                        alt={product.name}
                        style={{
                            maxWidth: "90%",
                            maxHeight: "90%",
                            borderRadius: 8,
                        }}
                    />
                </Box>
            </Modal>

            {/* Chi tiết sản phẩm */}
            <Grid2 size={{ xs: 12, md: 6 }}>
                <Typography variant={isMobile ? "h5" : "h3"} gutterBottom>
                    {product.name}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Typography
                    variant={isMobile ? "h6" : "h4"}
                    color="secondary"
                    gutterBottom
                >
                    ${(product.price / 100).toFixed(2)}
                </Typography>

                {/* Bảng thông tin */}
                {isMobile ? (
                    // Mobile view - Stack layout
                    <Box sx={{ mb: 3 }}>
                        {productDetails.map((detail, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                >
                                    {detail.label}
                                </Typography>
                                <Typography>{detail.value}</Typography>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    // Desktop view - Table layout
                    <TableContainer>
                        <Table sx={{ "& td": { fontSize: "1rem" } }}>
                            <TableBody>
                                {productDetails.map((detail, index) => (
                                    <TableRow key={index}>
                                        <TableCell
                                            sx={{
                                                fontWeight: "bold",
                                                width: "30%",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {detail.label}
                                        </TableCell>
                                        <TableCell>{detail.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Form controls */}
                <Grid2 container spacing={2} sx={{ mt: isMobile ? 2 : 3 }}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <TextField
                            variant="outlined"
                            type="number"
                            label="Số lượng"
                            fullWidth
                            value={quantity}
                            onChange={handleInputChange}
                            size={isMobile ? "small" : "medium"}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Button
                            onClick={handleUpdateBasket}
                            disabled={
                                quantity === item?.quantity ||
                                (!item && quantity === 0)
                            }
                            sx={{
                                height: isMobile ? "40px" : "55px",
                                mt: isMobile ? 1 : 0,
                            }}
                            color="primary"
                            size={isMobile ? "medium" : "large"}
                            variant="contained"
                            fullWidth
                        >
                            {item ? "Cập nhật giỏ hàng" : "Thêm vào giỏ hàng"}
                        </Button>
                    </Grid2>
                </Grid2>
            </Grid2>
        </Grid2>
    );
}
