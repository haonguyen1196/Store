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
import type { Product } from "../../app/models/product";
import { useEffect, useState } from "react";
import { useCreateProductMutation, useUpdateProductMutation } from "./adminApi";
import { handleApiError } from "../../lib/util.ts";

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

    useEffect(() => {
        if (product) reset(product, { keepDirtyValues: true }); // dùng để tải dự liệu edit vào form

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
            // if (watchFile instanceof File) formData.append("file", watchFile);
            // react hook form k tự động lấy file ảnh phải thêm thủ công

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
                    <Grid2
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
                    </Grid2>
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
