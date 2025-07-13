import type { FieldError, Path, UseFormSetError } from "react-hook-form";
import type { PaymentSummary, ShippingAddress } from "../app/models/order";

export function currencyFormat(amount: number) {
    return "$" + (amount / 100).toFixed(2);
}

//lọc bỏ các tham số có value trống
export function filterEmptyValues(values: object) {
    return Object.fromEntries(
        Object.entries(values).filter(
            ([, value]) =>
                value !== "" &&
                value !== null &&
                value !== undefined &&
                value.length !== 0
        )
    );

    //Object.entries: biến object {a:1, b: 'react'} thành [[key, value], []]
    //Object.fromEntries biến mảng mảng quảy lại thành object
}

export const formatAddressString = (address: ShippingAddress) => {
    return `${address?.name}, ${address?.line1}, ${address?.city} ,${address?.state}, ${address?.postal_code}, ${address?.country},`;
};

export const formatPaymentString = (card: PaymentSummary) => {
    return `${card?.brand.toUpperCase()}, **** **** **** ${card?.last4},
            Exp: ${card?.exp_month}/${card?.exp_year}`;
};

export function handleApiError<T extends FieldError>(
    error: unknown,
    setError: UseFormSetError<T>,
    fieldNames: Path<T>[]
) {
    const apiError = (error as { message: string }) || {};

    if (apiError.message && typeof apiError.message === "string") {
        const errorArray = apiError.message.split(","); //cắt cuỗi thành mảng

        errorArray.forEach((e) => {
            const matchedField = fieldNames.find((fieldName) =>
                e.toLowerCase().includes(fieldName.toString().toLowerCase())
            ); // tìm lỗi tương ứng với field name

            if (matchedField) setError(matchedField, { message: e.trim() }); // gán lỗi theo field name
        });
    }
} // hàm hiển thị lỗi validate form
