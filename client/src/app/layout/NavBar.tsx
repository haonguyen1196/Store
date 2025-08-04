import {
    AppBar,
    Badge,
    Box,
    Drawer,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    Toolbar,
    Typography,
} from "@mui/material";
import { DarkMode, LightMode, Menu, ShoppingCart } from "@mui/icons-material";
import { Link, NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setDarkMode } from "./uiSlice";
import { useFetchBasketQuery } from "../../features/basket/basketApi";
import UserMenu from "./UserMenu";
import { useUserInfoQuery } from "../../features/account/accountApi";
import useDeviceSize from "../../lib/hooks/useDeviceSize";
import { useState } from "react";

const midLinks = [
    { title: "sản phẩm", path: "/catalog" },
    { title: "về chúng tôi", path: "" },
    { title: "liên hệ", path: "" },
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
    const { data: user } = useUserInfoQuery();
    const { isLoading, darkMode } = useAppSelector((state) => state.ui);
    const dispatch = useAppDispatch();
    const { data: basket } = useFetchBasketQuery();

    const { isTablet } = useDeviceSize();
    const [tabletOpen, setTabletOpen] = useState(false);

    const handleDrawerToggle = () => {
        setTabletOpen(!tabletOpen);
    };

    const mobileMenu = (
        <Drawer
            anchor="right"
            open={tabletOpen}
            onClose={handleDrawerToggle}
            sx={{
                "& .MuiDrawer-paper": {
                    width: "80%",
                    maxWidth: 360,
                    bgcolor: "background.default",
                    boxShadow: 3, // thêm shadow
                    zIndex: (theme) => theme.zIndex.appBar + 100, // đảm bảo drawer luôn nổi trên cùng
                },
            }}
        >
            <Box
                sx={{
                    mt: 8,
                    p: 2,
                    "& .MuiListItem-root": {
                        borderRadius: 2, // bo tròn các item
                        mb: 2, // margin bottom giữa các items
                        p: 2,
                        "&:hover": {
                            bgcolor: "action.hover",
                            transition: "all 0.2s ease",
                        },
                        // Style cho active item
                        "&.active": {
                            bgcolor: "action.selected",
                            color: "primary.main",
                            fontWeight: 500,
                        },
                    },
                }}
            >
                <List>
                    {midLinks.map(({ title, path }) => (
                        <ListItem
                            component={NavLink}
                            to={path}
                            key={path}
                            onClick={handleDrawerToggle}
                        >
                            <Typography>{title.toUpperCase()}</Typography>
                        </ListItem>
                    ))}
                    {!user &&
                        rightLinks.map(({ title, path }) => (
                            <ListItem
                                component={NavLink}
                                to={path}
                                key={path}
                                onClick={handleDrawerToggle}
                            >
                                <Typography>{title.toUpperCase()}</Typography>
                            </ListItem>
                        ))}
                </List>
            </Box>
        </Drawer>
    );

    const itemCount =
        basket?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

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

                {!isTablet && (
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
                )}

                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                        component={Link}
                        to="/basket"
                        size="large"
                        color="inherit"
                    >
                        <Badge badgeContent={itemCount} color="secondary">
                            <ShoppingCart />
                        </Badge>
                    </IconButton>

                    {user ? (
                        <UserMenu user={user} />
                    ) : (
                        !isTablet && (
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
                        )
                    )}

                    {isTablet && (
                        <IconButton
                            color="inherit"
                            onClick={handleDrawerToggle}
                        >
                            <Menu />
                        </IconButton>
                    )}
                </Box>
            </Toolbar>
            {isLoading && (
                <Box>
                    <LinearProgress color="secondary" />
                </Box>
            )}
            {mobileMenu}
        </AppBar>
    );
}
