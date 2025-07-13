import {
    fetchBaseQuery,
    type BaseQueryApi,
    type FetchArgs,
} from "@reduxjs/toolkit/query";
import { endLoading, startLoading } from "../layout/uiSlice";
import { toast } from "react-toastify";
import { router } from "../routes/Routes";

const customBaseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include", // cho phép gửi và nhận cookie với be
});

type ErrorResponse = string | { title: string } | { errors: string[] };

const sleep = () => new Promise((resolve) => setTimeout(resolve, 1000));

export const baseQueryWithErrorHandling = async (
    args: string | FetchArgs,
    api: BaseQueryApi,
    extraOptions: object
) => {
    api.dispatch(startLoading());
    if (import.meta.env.DEV) await sleep();
    const result = await customBaseQuery(args, api, extraOptions);
    api.dispatch(endLoading());

    if (result.error) {
        console.log(result);
        const originalStatus =
            result.error.status === "PARSING_ERROR" &&
            result.error.originalStatus
                ? result.error.originalStatus
                : result.error.status;

        const responseData = result.error.data as ErrorResponse;

        switch (originalStatus) {
            case 400:
                if (typeof responseData === "string") toast.error(responseData);
                else if ("errors" in responseData) {
                    throw Object.values(responseData.errors).flat().join(", ");
                }
                break;
            case 401:
                if (
                    typeof responseData === "object" &&
                    "title" in responseData
                ) {
                    const title =
                        responseData.title === "Unauthorized"
                            ? "Email hoặc mật khẩu không đúng"
                            : responseData.title;

                    toast.error(title);
                }

                break;
            case 403:
                if (typeof responseData === "object") {
                    toast.error("403 Không có quyền thực hiện thao tác");
                }

                break;
            case 404:
                if (typeof responseData === "object" && "title" in responseData)
                    router.navigate("/not-found");
                break;
            case 500:
                if (typeof responseData === "object")
                    router.navigate("/server-error", {
                        state: { error: responseData },
                    });
                break;
            default:
                break;
        }
    }

    return result;
};
