import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { useEffect, useState } from "react";

type Props = {
    items: string[];
    checked: string[];
    onChange: (items: string[]) => void;
};

export default function CheckboxButtons({ items, checked, onChange }: Props) {
    const [checkedItems, setCheckedItems] = useState(checked);

    useEffect(() => {
        setCheckedItems(checked);
    }, [checked]);

    const handleToggle = (value: string) => {
        const updatedChecked = checkedItems?.includes(value)
            ? checkedItems.filter((item) => item !== value) // item và value giống nhau trả về false và remove item khỏi mảng
            : [...checkedItems, value];

        setCheckedItems(updatedChecked);
        onChange(updatedChecked);
    };

    return (
        <FormGroup>
            {items.map((item) => (
                <FormControlLabel
                    label={item}
                    key={item}
                    control={
                        <Checkbox
                            checked={checkedItems.includes(item)}
                            onClick={() => handleToggle(item)}
                            color="secondary"
                            sx={{ py: 0.7, fontSize: 40 }}
                        />
                    }
                />
            ))}
        </FormGroup>
    );
}
