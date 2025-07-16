import { Autocomplete, FormControl, TextField } from "@mui/material";
import type { SelectInputProps } from "@mui/material/Select/SelectInput";
import {
    useController,
    type FieldValues,
    type UseControllerProps,
} from "react-hook-form";

type Props<T extends FieldValues> = {
    label: string;
    name: keyof T;
    items: string[];
} & UseControllerProps<T> &
    Partial<SelectInputProps>;

export default function AppSelectInput<T extends FieldValues>(props: Props<T>) {
    const { fieldState, field } = useController({
        ...props,
    }); // useController để lấy fieldState và field từ react-hook-form, hook này giúp kết nối input với form

    return (
        <FormControl fullWidth error={!!fieldState.error}>
            {/* <InputLabel>{props.label}</InputLabel>
            <Select
                value={field.value || ""}
                label={props.label}
                onChange={field.onChange}
            >
                {props.items.map((item, index) => (
                    <MenuItem value={item} key={index}>
                        {item}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText>{fieldState.error?.message}</FormHelperText> */}
            <Autocomplete
                freeSolo
                options={props.items}
                value={field.value || ""}
                onChange={(_, newValue) => field.onChange(newValue)}
                onInputChange={(_, newInputValue, reason) => {
                    if (reason === "input") {
                        field.onChange(newInputValue);
                    }
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={props.label}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                    />
                )}
            />
        </FormControl>
    );
}
