import {
    AppBar,
    Badge,
    Box,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    Toolbar,
    Typography,
} from "@mui/material";
import { DarkMode, LightMode, ShoppingCart } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setDarkMode } from "./uiSlice";

const midLinks = [
    { title: "sản phẩm", path: "/catalog" },
    { title: "về chúng tôi", path: "/about" },
    { title: "liên hệ", path: "/contact" },
];

const rightLinks = [
    { title: "đăng nhập", path: "/login" },
    { title: "đăng ký", path: "/register" },
];

const navStyles = {
    color: "inherit",
    typography: "h6",
    textDecoration: "none",
    "&:hover": { color: "grey.500" },
    "&.active": { color: "#baecf9" },
    whiteSpace: "nowrap",
};

export default function NavBar() {
    const { isLoading, darkMode } = useAppSelector((state) => state.ui);
    const dispatch = useAppDispatch();
    return (
        <AppBar position="fixed">
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography sx={navStyles} component={NavLink} to="/">
                        STORE
                    </Typography>
                    <IconButton onClick={() => dispatch(setDarkMode())}>
                        {darkMode ? (
                            <DarkMode />
                        ) : (
                            <LightMode sx={{ color: "yellow" }} />
                        )}
                    </IconButton>
                </Box>

                <List sx={{ display: "flex" }}>
                    {midLinks.map(({ title, path }) => (
                        <ListItem
                            component={NavLink}
                            to={path}
                            key={path}
                            sx={navStyles}
                        >
                            {title.toUpperCase()}
                        </ListItem>
                    ))}
                </List>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton size="large" color="inherit">
                        <Badge badgeContent="4" color="secondary">
                            <ShoppingCart />
                        </Badge>
                    </IconButton>

                    <List sx={{ display: "flex" }}>
                        {rightLinks.map(({ title, path }) => (
                            <ListItem
                                component={NavLink}
                                to={path}
                                key={path}
                                sx={navStyles}
                            >
                                {title.toUpperCase()}
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Toolbar>
            {isLoading && (
                <Box>
                    <LinearProgress color="secondary" />
                </Box>
            )}
        </AppBar>
    );
}
