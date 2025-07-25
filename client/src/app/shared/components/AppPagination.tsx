import { Pagination, Stack, Typography } from "@mui/material";
import type { Pagination as PaginationType } from "../../models/pagination";
import useDeviceSize from "../../../lib/hooks/useDeviceSize";

type Props = {
    metadata: PaginationType;
    onPageChange: (page: number) => void;
};

export default function AppPagination({ metadata, onPageChange }: Props) {
    const { currentPage, totalCount, totalPages, pageSize } = metadata;
    const { isMobile } = useDeviceSize();

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount); // 2 tham số, số nào nhỏ hơn lấy số đó

    return (
        <Stack spacing={2} alignItems="center" sx={{ mt: isMobile ? 2 : 3 }}>
            <Typography>
                Hiển thị {startItem}-{endItem} trong {totalCount} sản phẩm
            </Typography>
            <Pagination
                color="secondary"
                size="large"
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => onPageChange(page)} // _ là không có event nào, page là số trang mà người dùng click
                siblingCount={isMobile ? 0 : 1}
            />
        </Stack>
    );
}
