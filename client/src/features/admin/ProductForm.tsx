import { useForm, type FieldValues } from "react-hook-form";
import { Box, Button, Grid2, Paper, Typography } from "@mui/material";
import AppTextInput from "../../app/shared/components/AppTextInput";
import {
    createProductSchema,
    type CreateProductSchema,
} from "../../lib/schemas/createProductSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetchFiltersQuery } from "../catalog/catalogApi";
import AppSelectInput from "../../app/shared/components/AppSelectInput";
import AppDropzone from "../../app/shared/components/AppDropzone";
import AppDropzoneMultiple from "../../app/shared/components/AppDropzoneMultiple";
import type { Product } from "../../app/models/product";
import { useEffect, useState } from "react";
import { useCreateProductMutation, useUpdateProductMutation } from "./adminApi";
import { handleApiError } from "../../lib/util.ts";
import useDeviceSize from "../../lib/hooks/useDeviceSize.ts";

type Props = {
    setEditMode: (value: boolean) => void;
    product: Product | null;
    refetch: () => void;
    setSelectedProduct: (value: Product | null) => void;
};

export default function ProductForm({
    setEditMode,
    product,
    refetch,
    setSelectedProduct,
}: Props) {
    const {
        control,
        handleSubmit,
        watch,
        reset,
        setError,
        formState: { isSubmitting },
    } = useForm<CreateProductSchema>({
        mode: "onTouched",
        resolver: zodResolver(createProductSchema),
    });

    const watchFile = watch("file"); // xem trước ảnh người dùng chọn

    const { data } = useFetchFiltersQuery();
    const [createProduct] = useCreateProductMutation();
    const [updateProduct] = useUpdateProductMutation();
    const [preview, setPreview] = useState<string>("");
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
    const [imageOrder, setImageOrder] = useState<number[]>([]);
    const { isMobile } = useDeviceSize();

    useEffect(() => {
        if (product) reset(product, { keepDirtyValues: true }); // dùng để tải dự liệu edit vào form, k reset input file

        if (watchFile) {
            const previewUrl = URL.createObjectURL(watchFile);
            setPreview(previewUrl);

            return () => {
                if (watchFile) URL.revokeObjectURL(previewUrl); // thu hồi dữ liệu xem trước mỗi khi di chuyển component
            };
        }
    }, [product, reset, watchFile]);

    const createFormData = (items: FieldValues) => {
        const formData = new FormData();
        for (const key in items) {
            formData.append(key, items[key]);
        }

        return formData;
    }; // multipart/form-data cần định dạng này để gửi file, nếu k có file ảnh thì k cần hàm này

    const onSubmit = async (data: CreateProductSchema) => {
        try {
            const formData = createFormData(data);

            // Thêm nhiều ảnh chi tiết
            additionalFiles.forEach((file) => {
                formData.append(`additionalFiles`, file);
            });

            // Thêm thứ tự ảnh dưới dạng JSON string
            if (imageOrder.length > 0) {
                // Convert array [0, 1, 2] thành object {"0": 0, "1": 1, "2": 2}
                const imageOrderObject: Record<string, number> = {};
                imageOrder.forEach((order, index) => {
                    imageOrderObject[index.toString()] = order;
                });
                formData.append(
                    "imageOrdersJson",
                    JSON.stringify(imageOrderObject)
                );
            }

            if (product)
                await updateProduct({
                    id: product.id,
                    data: formData,
                }).unwrap();
            // nếu có chuyền product thì là form update
            else await createProduct(formData).unwrap(); // sử dụng unwrap để ném ra lỗi
            setSelectedProduct(null);
            setEditMode(false); // thoái component product form
            refetch(); // làm mới dữ liệu ngoài component danh sách
        } catch (error) {
            console.log(error);
            handleApiError<CreateProductSchema>(error, setError, [
                "brand",
                "description",
                "file",
                "name",
                "pictureUrl",
                "price",
                "quantityInStock",
                "type",
                "additionalFiles",
                "imageOrdersJson",
            ]);
        }
    };

    return (
        <Box component={Paper} sx={{ p: 4, maxWidth: "lg", mx: "auto" }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Chi tiết sản phẩm
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid2 container spacing={3}>
                    <Grid2 size={12}>
                        <AppTextInput
                            control={control}
                            name="name"
                            label="Tên sản phẩm"
                        />
                    </Grid2>
                    <Grid2 size={6}>
                        {data?.brands && (
                            <AppSelectInput
                                items={data.brands}
                                control={control}
                                name="brand"
                                label="Thương hiệu"
                            />
                        )}
                    </Grid2>
                    <Grid2 size={6}>
                        {data?.types && (
                            <AppSelectInput
                                items={data.types}
                                control={control}
                                name="type"
                                label="Loại"
                            />
                        )}
                    </Grid2>
                    <Grid2 size={6}>
                        <AppTextInput
                            control={control}
                            name="price"
                            label="Giá"
                            type="number"
                        />
                    </Grid2>
                    <Grid2 size={6}>
                        <AppTextInput
                            control={control}
                            name="quantityInStock"
                            label="Số lượng"
                            type="number"
                        />
                    </Grid2>
                    <Grid2 size={12}>
                        <AppTextInput
                            control={control}
                            name="description"
                            label="Mô tả"
                            multiline
                            rows={4}
                        />
                    </Grid2>
                    <Grid2 container spacing={isMobile ? 2 : 3} sx={{ mt: 1 }}>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <Box
                                sx={{
                                    height: isMobile ? 120 : 300,
                                    width: "100%",
                                    mb: isMobile ? 2 : 0,
                                }}
                            >
                                <AppDropzone name="file" control={control} />
                            </Box>
                        </Grid2>
                        <Grid2
                            size={{ xs: 12, md: 6 }}
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="hình ảnh xem trước"
                                    style={{
                                        height: isMobile ? 120 : 200,
                                        width: "100%",
                                        objectFit: "contain",
                                        borderRadius: 8,
                                    }}
                                />
                            ) : product ? (
                                <img
                                    src={product?.pictureUrl}
                                    alt="hình ảnh xem trước"
                                    style={{
                                        height: isMobile ? 120 : 200,
                                        width: "100%",
                                        objectFit: "contain",
                                        borderRadius: 8,
                                    }}
                                />
                            ) : null}
                        </Grid2>
                    </Grid2>
                    <Grid2 size={12}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Ảnh chi tiết sản phẩm
                        </Typography>
                        <AppDropzoneMultiple
                            value={additionalFiles}
                            existingImages={product?.images || []}
                            onChange={(files, order) => {
                                setAdditionalFiles(files);
                                setImageOrder(order);
                            }}
                        />
                    </Grid2>
                    {/* <Grid2
                        size={12}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <AppDropzone name="file" control={control} />
                        {preview ? (
                            <img
                                src={preview}
                                alt="hình ảnh xem trước"
                                style={{ maxHeight: 200 }}
                            />
                        ) : product ? (
                            <img
                                src={product?.pictureUrl}
                                alt="hình ảnh xem trước"
                                style={{ maxHeight: 200 }}
                            />
                        ) : null}
                    </Grid2> */}
                </Grid2>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 3 }}
                >
                    <Button
                        onClick={() => setEditMode(false)}
                        variant="contained"
                        color="inherit"
                    >
                        Xóa
                    </Button>
                    <Button
                        loading={isSubmitting}
                        variant="contained"
                        color="success"
                        type="submit"
                    >
                        Gửi
                    </Button>
                </Box>
            </form>
        </Box>
    );
}
