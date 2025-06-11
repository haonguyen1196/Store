import { Grid2, Typography } from "@mui/material";
import ProductList from "./ProductList";
import { useFetchFiltersQuery, useFetchProductsQuery } from "./catalogApi";
import Filters from "./Filters";
import { useAppDispatch, useAppSelector } from "../../app/store/store";
import AppPagination from "../../app/shared/components/AppPagination";
import { setPageNumber } from "./catalogSlice";

export default function Catalog() {
    const productParams = useAppSelector((state) => state.catalog);
    const { data, isLoading } = useFetchProductsQuery(productParams);
    const { data: filterData, isLoading: filterLoading } =
        useFetchFiltersQuery();
    const dispatch = useAppDispatch();

    if (isLoading || !data || filterLoading || !filterData)
        return <div>Đang tải...</div>;

    return (
        <Grid2 container spacing={4}>
            <Grid2 size={3}>
                <Filters filterData={filterData} />
            </Grid2>
            <Grid2 size={9}>
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
