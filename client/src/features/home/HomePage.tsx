import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import useDeviceSize from "../../lib/hooks/useDeviceSize";

export default function HomePage() {
    const { isMobile, isTablet } = useDeviceSize();
    return (
        <Box maxWidth="xl" mx="auto" px={isMobile ? 2 : 4} position="relative">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                position="relative"
                minHeight={isMobile ? "60vh" : isTablet ? "70vh" : "80vh"}
            >
                <img
                    src="/images/hero1.jpg"
                    alt="image"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: isMobile ? "8px" : "16px",
                        zIndex: 0,
                    }}
                />
                <Box
                    display="flex"
                    flexDirection="column"
                    p={isMobile ? 4 : isTablet ? 6 : 8}
                    alignItems="center"
                    position="relative"
                    borderRadius={isMobile ? 2 : 4}
                >
                    <Typography
                        variant={isMobile ? "h3" : isTablet ? "h2" : "h1"}
                        color="white"
                        fontWeight="bold"
                        textAlign="center"
                        sx={{
                            my: isMobile ? 2 : 3,
                            fontSize: {
                                xs: "2rem", // mobile
                                sm: "3rem", // tablet
                                md: "3.75rem", // desktop
                            },
                        }}
                    >
                        Chào mừng đến với Store
                    </Typography>
                    <Button
                        variant="contained"
                        size={isMobile ? "medium" : "large"}
                        component={Link}
                        to="/catalog"
                        sx={{
                            mt: isMobile ? 4 : 8,
                            backgroundImage:
                                "linear-gradient(to right, #2563eb, #06b6d4)",
                            fontWeight: "bold",
                            color: "white",
                            borderRadius: isMobile ? "8px" : "16px",
                            px: isMobile ? 4 : 8,
                            py: isMobile ? 1.5 : 2,
                            border: "2px solid transparent",
                            fontSize: isMobile ? "0.875rem" : "1.25rem",
                        }}
                    >
                        Mua sắm
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
