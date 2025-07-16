import { createApi } from "@reduxjs/toolkit/query/react";
import type { Product } from "../../app/models/product";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import type { ProductParams } from "../../app/models/productParams";
import { filterEmptyValues } from "../../lib/util";
import type { Pagination } from "../../app/models/pagination";

export const catalogApi = createApi({
    reducerPath: "catalogApi",
    baseQuery: baseQueryWithErrorHandling,
    tagTypes: ["Filters"],
    endpoints: (builder) => ({
        fetchProducts: builder.query<
            { items: Product[]; pagination: Pagination },
            ProductParams
        >({
            query: (productParams) => {
                return {
                    url: "products",
                    params: filterEmptyValues(productParams),
                };
            },
            transformResponse: (items: Product[], meta) => {
                const paginationHeader =
                    meta?.response?.headers.get("Pagination"); // lấy thông tin pagination ở header reponse

                const pagination = paginationHeader
                    ? JSON.parse(paginationHeader)
                    : null; // chuyển thanh obj

                return { items, pagination };
            },
        }),
        fetchProductDetails: builder.query<Product, number>({
            query: (productId) => `products/${productId}`,
        }),
        fetchFilters: builder.query<
            { brands: string[]; types: string[] },
            void
        >({
            query: () => "products/filters",
            providesTags: ["Filters"], // cung cấp tag để invalidates cache khi có thay đổi
        }),
    }),
});

export const {
    useFetchProductsQuery,
    useFetchProductDetailsQuery,
    useFetchFiltersQuery,
} = catalogApi;
