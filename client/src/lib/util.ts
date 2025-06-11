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
