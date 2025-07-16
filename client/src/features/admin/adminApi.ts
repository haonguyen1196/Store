import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import type { Product } from "../../app/models/product";
import { catalogApi } from "../catalog/catalogApi";

export const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: baseQueryWithErrorHandling,
    endpoints: (builder) => ({
        createProduct: builder.mutation<Product, FormData>({
            query: (data: FormData) => {
                return {
                    url: "products",
                    method: "POST",
                    body: data,
                };
            },
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    await queryFulfilled;
                    dispatch(catalogApi.util.invalidateTags(["Filters"]));
                } catch (error) {
                    console.log(error);
                }
            },
        }),
        updateProduct: builder.mutation<void, { id: number; data: FormData }>({
            query: ({ id, data }) => {
                data.append("id", id.toString());
                return {
                    url: "products",
                    method: "PUT",
                    body: data,
                };
            },
        }),
        deleteProduct: builder.mutation<void, number>({
            query: (id: number) => {
                return {
                    url: `products/${id}`,
                    method: "DELETE",
                };
            },
        }),
    }),
});

export const {
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} = adminApi;
