import {
    Box,
    Button,
    Drawer,
    Grid2,
    IconButton,
    Typography,
} from "@mui/material";
import ProductList from "./ProductList";
import { useFetchFiltersQuery, useFetchProductsQuery } from "./catalogApi";
import Filters from "./Filters";
import { useAppDispatch, useAppSelector } from "../../app/store/store";
import AppPagination from "../../app/shared/components/AppPagination";
import { setPageNumber } from "./catalogSlice";
import { useState } from "react";
import { Close, FilterAlt } from "@mui/icons-material";
import useDeviceSize from "../../lib/hooks/useDeviceSize";

export default function Catalog() {
    const productParams = useAppSelector((state) => state.catalog);
    const { data, isLoading } = useFetchProductsQuery(productParams);
    const { data: filterData, isLoading: filterLoading } =
        useFetchFiltersQuery();
    const dispatch = useAppDispatch();

    //reponsive
    const { isMobile } = useDeviceSize();
    const [openFilter, setOpenFilter] = useState(false);
    //end responsive

    if (isLoading || !data || filterLoading || !filterData)
        return <div>Đang tải...</div>;

    return (
        <Grid2 container spacing={4} sx={{ position: "relative" }}>
            {isMobile ? (
                <>
                    <Grid2
                        size={{ xs: 12 }}
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            position: "absolute",
                            top: -55,
                            right: 0,
                            zIndex: 999999,
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={() => setOpenFilter(true)}
                        >
                            Lọc
                            <FilterAlt sx={{ ml: 1 }} />
                        </Button>
                        <Drawer
                            anchor="left"
                            open={openFilter}
                            onClose={() => setOpenFilter(false)}
                        >
                            <Box
                                sx={{ width: 280, p: 2, position: "relative" }}
                            >
                                <IconButton
                                    onClick={() => setOpenFilter(false)}
                                    sx={{
                                        position: "absolute",
                                        right: 8,
                                        top: 8,
                                        zIndex: 1,
                                    }}
                                >
                                    <Close />
                                </IconButton>
                                <Box pt={6}>
                                    <Filters filterData={filterData} />
                                </Box>
                            </Box>
                        </Drawer>
                    </Grid2>
                </>
            ) : (
                <Grid2 size={{ sm: 3 }}>
                    <Filters filterData={filterData} />
                </Grid2>
            )}

            <Grid2 size={{ xs: 12, sm: 9 }}>
                {data.items && data.items.length > 0 ? (
                    <>
                        <ProductList products={data.items} />
                        <AppPagination
                            metadata={data.pagination}
                            onPageChange={(page: number) => {
                                dispatch(setPageNumber(page));
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                        />
                    </>
                ) : (
                    <Typography>Không tìm thấy sản phẩm nào</Typography>
                )}
            </Grid2>
        </Grid2>
    );
}
