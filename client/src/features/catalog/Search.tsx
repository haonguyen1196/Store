import { debounce, TextField } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/store/store";
import { setSearchTerm } from "./catalogSlice";
import { useEffect, useState } from "react";

export default function Search() {
    const { searchTerm } = useAppSelector((state) => state.catalog);
    const dispatch = useAppDispatch();
    const [term, setTerm] = useState(searchTerm);

    //set value for variable term
    useEffect(() => {
        setTerm(searchTerm);
    }, [searchTerm]);

    //set value for searchTerm after 500ms
    const debouncedSearch = debounce((event) => {
        dispatch(setSearchTerm(event.target.value));
    }, 500);

    return (
        <TextField
            label="Tìm kiếm"
            variant="outlined"
            fullWidth
            type="search"
            value={term}
            onChange={(e) => {
                setTerm(e.target.value); // set term to show value inside the input field
                debouncedSearch(e); // after 500ms set value for searchTerm inside catalog slice
            }}
        />
    );
}
