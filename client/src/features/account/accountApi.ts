import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import type { User } from "../../app/models/user";
import type { LoginSchema } from "../../lib/schemas/loginSchema";
import { router } from "../../app/routes/Routes";
import { toast } from "react-toastify";

export const accountApi = createApi({
    reducerPath: "accountApi",
    baseQuery: baseQueryWithErrorHandling,
    tagTypes: ["UserInfo"],
    endpoints: (builder) => ({
        login: builder.mutation<void, LoginSchema>({
            query: (creds) => {
                return {
                    url: "login?useCookies=true",
                    method: "POST",
                    body: creds,
                };
            },
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(accountApi.util.invalidateTags(["UserInfo"]));
                } catch (error) {
                    console.log(error);
                }
            },
        }),
        register: builder.mutation<void, object>({
            query: (creds) => {
                return {
                    url: "account/register",
                    method: "POST",
                    body: creds,
                };
            },
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success(
                        "Đăng ký thành công, bạn có thể đăng nhập ngay"
                    );
                    router.navigate("/login");
                } catch (error) {
                    console.log(error);
                    throw error;
                }
            },
        }),
        userInfo: builder.query<User, void>({
            query: () => "account/user-info",
            providesTags: ["UserInfo"],
        }),
        logout: builder.mutation({
            query: () => ({
                url: "account/logout",
                method: "POST",
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(accountApi.util.invalidateTags(["UserInfo"]));
                    router.navigate("/");
                } catch (error) {
                    console.log(error);
                }
            },
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useUserInfoQuery,
    useLazyUserInfoQuery,
} = accountApi;
