import { Button, ButtonGroup, Typography } from "@mui/material";
import { decrement, increment } from "./counterReducer";
import { useAppDispatch, useAppSelector } from "../../app/store/store";

export default function ContactPage() {
    const { data } = useAppSelector((state) => state.counter);
    const dispatch = useAppDispatch();
    return (
        <>
            <Typography variant="h2">Contact page</Typography>
            <Typography variant="body1">The data is: {data}</Typography>
            <ButtonGroup>
                <Button onClick={() => dispatch(decrement(1))} color="error">
                    Giảm dần
                </Button>
                <Button
                    onClick={() => dispatch(increment(2))}
                    color="secondary"
                >
                    Tăng dần
                </Button>
            </ButtonGroup>
        </>
    );
}
