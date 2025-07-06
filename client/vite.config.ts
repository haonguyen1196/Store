import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
    build: {
        outDir: "../API/wwwroot", // sẽ build dự án reactjs trong dự án .net
        chunkSizeWarningLimit: 1024, // Cảnh báo nếu file chunk lớn hơn 1024KB (1MB) – giúp tối ưu hiệu suất
        emptyOutDir: true, // Xóa sạch thư mục outDir trước khi build lại – tránh file cũ còn sót
    },
    server: {
        port: 3000,
    },
    plugins: [react(), mkcert()],
});
