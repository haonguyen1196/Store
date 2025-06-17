import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useUserInfoQuery } from "../../features/account/accountApi";

export default function RequireAuth() {
    const { data: user, isLoading } = useUserInfoQuery();
    const location = useLocation();

    if (isLoading) return <div>Đang tải...</div>;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }}></Navigate>;
        // 'state' được dùng để lưu vị trí cũ => sau khi login có thể quay lại
    }

    return <Outlet />;
}
