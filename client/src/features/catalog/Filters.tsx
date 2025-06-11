import { Box, Button, Paper } from "@mui/material";
import Search from "./Search";
import React from "react";
import RadioButtonGroup from "../../app/shared/components/RadioButtonGroup";
import { useAppDispatch, useAppSelector } from "../../app/store/store";
import { resetParams, setBrands, setOrderBy, setTypes } from "./catalogSlice";
import CheckboxButtons from "../../app/shared/components/CheckboxButtons";

const sortOptions = [
    { value: "name", label: "Tên a->z" },
    { value: "priceDesc", label: "Giá từ cao đến thấp" },
    { value: "price", label: "Giá từ thấp đến cao" },
];

type Props = {
    filterData: { brands: string[]; types: string[] };
};
const Filters = ({ filterData: data }: Props) => {
    const { orderBy, brands, types } = useAppSelector((state) => state.catalog);
    const dispatch = useAppDispatch();

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            <Paper>
                <Search />
            </Paper>
            <Paper sx={{ p: 3 }}>
                <RadioButtonGroup
                    options={sortOptions}
                    selectedValue={orderBy}
                    onChange={(e) => dispatch(setOrderBy(e.target.value))}
                />
            </Paper>
            <Paper sx={{ p: 3 }}>
                <CheckboxButtons
                    items={data.brands}
                    checked={brands}
                    onChange={(items: string[]) => dispatch(setBrands(items))}
                />
            </Paper>
            <Paper sx={{ p: 3 }}>
                <CheckboxButtons
                    items={data.types}
                    checked={types}
                    onChange={(items: string[]) => dispatch(setTypes(items))}
                />
            </Paper>
            <Button onClick={() => dispatch(resetParams())}>Xóa bộ lọc</Button>
        </Box>
    );
};

export default React.memo(Filters); // component này không cần thiết phải render lại mỗi khi filter product
