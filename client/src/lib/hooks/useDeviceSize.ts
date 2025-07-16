import { useMediaQuery, useTheme } from "@mui/material";

export default function useDeviceSize() {
    const theme = useTheme();

    return {
        isMobile: useMediaQuery(theme.breakpoints.down("sm")),
        isTablet: useMediaQuery(theme.breakpoints.between("sm", "md")),
        isDesktop: useMediaQuery(theme.breakpoints.up("md")),
        isLargeScreen: useMediaQuery(theme.breakpoints.up("lg")),
    };
}
