import {
    Button,
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import { useState } from "react";
import type { User } from "../models/user";
import {
    AccountCircle,
    History,
    Inventory,
    Logout,
    Person,
} from "@mui/icons-material";
import { useLogoutMutation } from "../../features/account/accountApi";
import { Link } from "react-router-dom";
import useDeviceSize from "../../lib/hooks/useDeviceSize";

type Props = {
    user: User;
};

export default function UserMenu({ user }: Props) {
    const [logout] = useLogoutMutation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const { isMobile } = useDeviceSize();

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            {isMobile ? (
                <Button
                    startIcon={<AccountCircle />}
                    color="inherit"
                    onClick={handleClick}
                    sx={{
                        minWidth: "auto",
                        px: 1,
                        "& .MuiButton-startIcon": {
                            margin: 0,
                        },
                    }}
                ></Button>
            ) : (
                <Button
                    onClick={handleClick}
                    color="inherit"
                    size="large"
                    sx={{ fontSize: "1.1rem" }}
                >
                    {user.email}
                </Button>
            )}

            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                slotProps={{
                    list: {
                        "aria-labelledby": "basic-button",
                    },
                }}
            >
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <Person />
                    </ListItemIcon>
                    <ListItemText>Hồ sơ</ListItemText>
                </MenuItem>
                <MenuItem component={Link} to="/orders" onClick={handleClose}>
                    <ListItemIcon>
                        <History />
                    </ListItemIcon>
                    <ListItemText>Đơn hàng</ListItemText>
                </MenuItem>
                {user.roles.includes("Admin") && (
                    <MenuItem
                        component={Link}
                        to="/inventory"
                        onClick={handleClose}
                    >
                        <ListItemIcon>
                            <Inventory />
                        </ListItemIcon>
                        <ListItemText>Thống kê sản phẩm</ListItemText>
                    </MenuItem>
                )}
                <Divider />
                <MenuItem
                    onClick={() => {
                        logout({});
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <Logout />
                    </ListItemIcon>
                    <ListItemText>Đăng xuất</ListItemText>
                </MenuItem>
            </Menu>
        </div>
    );
}
