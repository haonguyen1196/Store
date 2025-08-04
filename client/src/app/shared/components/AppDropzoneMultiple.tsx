import React, { useState } from "react";
import { Grid, Paper, IconButton, Typography, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useDropzone } from "react-dropzone";

interface MultipleImageUploadProps {
    value: File[];
    onChange: (files: File[], order: number[]) => void;
    existingImages?: {
        id: number;
        url: string;
        order: number;
        publicId: string;
    }[]; // Existing images từ database
}

// Component hiển thị existing image từ database
const ExistingImageItem: React.FC<{
    image: { id: number; url: string; order: number; publicId: string };
    index: number;
    onRemove: (idx: number) => void;
    onDragStart: (idx: number) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, idx: number) => void;
    onTouchStart: (e: React.TouchEvent, idx: number) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    isDragging?: boolean;
}> = ({
    image,
    index,
    onRemove,
    onDragStart,
    onDragOver,
    onDrop,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isDragging = false,
}) => {
    return (
        <Grid item xs={6} sm={4} md={3} data-image-index={index}>
            <Paper
                sx={{
                    p: 1,
                    position: "relative",
                    cursor: "move",
                    opacity: isDragging ? 0.7 : 1,
                    transform: isDragging ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.2s ease",
                    border: isDragging
                        ? "2px solid #1976d2"
                        : "2px solid #4caf50", // Green border for existing images
                    boxShadow: isDragging
                        ? "0 4px 20px rgba(25, 118, 210, 0.3)"
                        : 1,
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    WebkitTouchCallout: "none",
                    "&::after": isDragging
                        ? {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: "rgba(25, 118, 210, 0.1)",
                              borderRadius: 1,
                              border: "2px dashed #1976d2",
                              zIndex: 1,
                          }
                        : {},
                }}
                draggable
                onDragStart={(e) => {
                    e.stopPropagation();
                    onDragStart(index);
                }}
                onDragOver={(e) => {
                    e.stopPropagation();
                    onDragOver(e);
                }}
                onDrop={(e) => {
                    e.stopPropagation();
                    onDrop(e, index);
                }}
                onTouchStart={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                        target.closest("button") ||
                        target.closest('[data-testid="DeleteIcon"]')
                    ) {
                        return;
                    }
                    e.stopPropagation();
                    onTouchStart(e, index);
                }}
                onTouchMove={(e) => {
                    e.stopPropagation();
                    onTouchMove(e);
                }}
                onTouchEnd={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                        target.closest("button") ||
                        target.closest('[data-testid="DeleteIcon"]')
                    ) {
                        return;
                    }
                    e.stopPropagation();
                    onTouchEnd();
                }}
            >
                <DragIndicatorIcon
                    sx={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        bgcolor: "rgba(255,255,255,0.9)",
                        borderRadius: 1,
                        fontSize: 18,
                        zIndex: 2,
                    }}
                />
                <img
                    src={image.url}
                    alt={`Existing image ${image.id}`}
                    style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 8,
                        pointerEvents: "none",
                    }}
                />
                <IconButton
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(255,255,255,0.95)",
                        zIndex: 10,
                        minWidth: 28,
                        minHeight: 28,
                        "&:hover": {
                            bgcolor: "rgba(255,0,0,0.1)",
                        },
                        "@media (max-width: 768px)": {
                            minWidth: 32,
                            minHeight: 32,
                            fontSize: "1.1rem",
                        },
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onRemove(index);
                    }}
                    onTouchEnd={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onRemove(index);
                    }}
                >
                    <DeleteIcon
                        fontSize="small"
                        sx={{
                            "@media (max-width: 768px)": {
                                fontSize: "1rem",
                            },
                        }}
                    />
                </IconButton>
                <Typography
                    variant="caption"
                    sx={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        bgcolor: "rgba(76, 175, 80, 0.8)", // Green badge for existing
                        color: "white",
                        px: 1,
                        borderRadius: 1,
                        fontSize: "0.6rem",
                    }}
                >
                    #{image.order}
                </Typography>
            </Paper>
        </Grid>
    );
};
const ImagePreviewItem: React.FC<{
    file: File;
    index: number;
    onRemove: (idx: number) => void;
    onDragStart: (idx: number) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, idx: number) => void;
    onTouchStart: (e: React.TouchEvent, idx: number) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    isDragging?: boolean;
}> = ({
    file,
    index,
    onRemove,
    onDragStart,
    onDragOver,
    onDrop,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isDragging = false,
}) => {
    return (
        <Grid item xs={6} sm={4} md={3} data-image-index={index}>
            <Paper
                sx={{
                    p: 1,
                    position: "relative",
                    cursor: "move",
                    opacity: isDragging ? 0.7 : 1,
                    transform: isDragging ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.2s ease",
                    border: isDragging
                        ? "2px solid #1976d2"
                        : "2px solid transparent",
                    boxShadow: isDragging
                        ? "0 4px 20px rgba(25, 118, 210, 0.3)"
                        : 1,
                    userSelect: "none", // Ngăn text selection trên mobile
                    WebkitUserSelect: "none",
                    WebkitTouchCallout: "none", // Ngăn context menu trên iOS
                    // Thêm drop zone indicator
                    "&::after": isDragging
                        ? {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: "rgba(25, 118, 210, 0.1)",
                              borderRadius: 1,
                              border: "2px dashed #1976d2",
                              zIndex: 1,
                          }
                        : {},
                }}
                draggable
                onDragStart={(e) => {
                    e.stopPropagation();
                    onDragStart(index);
                }}
                onDragOver={(e) => {
                    e.stopPropagation();
                    onDragOver(e);
                }}
                onDrop={(e) => {
                    e.stopPropagation();
                    onDrop(e, index);
                }}
                // Touch events cho mobile
                onTouchStart={(e) => {
                    // Nếu touch vào nút delete, không xử lý drag
                    const target = e.target as HTMLElement;
                    if (
                        target.closest("button") ||
                        target.closest('[data-testid="DeleteIcon"]')
                    ) {
                        return;
                    }
                    e.stopPropagation();
                    onTouchStart(e, index);
                }}
                onTouchMove={(e) => {
                    e.stopPropagation();
                    onTouchMove(e);
                }}
                onTouchEnd={(e) => {
                    // Nếu touch vào nút delete, không xử lý drag
                    const target = e.target as HTMLElement;
                    if (
                        target.closest("button") ||
                        target.closest('[data-testid="DeleteIcon"]')
                    ) {
                        return;
                    }
                    e.stopPropagation();
                    onTouchEnd();
                }}
            >
                {/* Icon kéo thả */}
                <DragIndicatorIcon
                    sx={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        bgcolor: "rgba(255,255,255,0.9)",
                        borderRadius: 1,
                        fontSize: 18,
                        zIndex: 2,
                    }}
                />
                <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 8,
                        pointerEvents: "none", // Ngăn conflict với drag events
                    }}
                />
                <IconButton
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(255,255,255,0.95)",
                        zIndex: 10, // Cao hơn để không bị che
                        minWidth: 28, // Tăng kích thước cho mobile
                        minHeight: 28,
                        "&:hover": {
                            bgcolor: "rgba(255,0,0,0.1)",
                        },
                        // Tăng kích thước touch target cho mobile
                        "@media (max-width: 768px)": {
                            minWidth: 32,
                            minHeight: 32,
                            fontSize: "1.1rem",
                        },
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onRemove(index);
                    }}
                    onTouchEnd={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onRemove(index);
                    }}
                >
                    <DeleteIcon
                        fontSize="small"
                        sx={{
                            "@media (max-width: 768px)": {
                                fontSize: "1rem",
                            },
                        }}
                    />
                </IconButton>
                <Typography
                    variant="caption"
                    noWrap
                    sx={{
                        display: "block",
                        mt: 0.5,
                        fontSize: "0.7rem",
                        color: "text.secondary",
                    }}
                >
                    {file.name}
                </Typography>
            </Paper>
        </Grid>
    );
};

// Define a type for combined items
type ImageItem =
    | { id: number; url: string; order: number; publicId: string } // Existing image
    | File; // New file

// Fix type guard to match the full type of existing images
const isExistingImage = (
    item: ImageItem
): item is { id: number; url: string; order: number; publicId: string } => {
    return (
        (item as { id: number; url: string; order: number; publicId: string })
            .id !== undefined
    );
};

const AppDropzoneMultiple = ({
    value,
    onChange,
    existingImages = [],
}: MultipleImageUploadProps) => {
    const [files, setFiles] = useState<File[]>(value || []);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [existingImagesState, setExistingImagesState] =
        useState(existingImages);

    // Sync với value từ parent component
    React.useEffect(() => {
        if (value) {
            setFiles(value);
        }
    }, [value]);

    // Sync existing images
    React.useEffect(() => {
        setExistingImagesState(existingImages);
    }, [existingImages]);

    // Combined files: existing images + new files

    // Handle file drop từ dropzone
    const onDrop = (acceptedFiles: File[]) => {
        const newFiles = [...files, ...acceptedFiles];
        setFiles(newFiles);
        onChange(
            newFiles,
            newFiles.map((_, idx) => idx)
        );
    };

    // Remove file hoặc existing image
    const handleRemove = (index: number) => {
        const combinedItems = [...existingImagesState, ...files];

        if (index < existingImagesState.length) {
            // Xóa ảnh phụ
            const updatedExistingImages = existingImagesState.filter(
                (_, i) => i !== index
            );
            setExistingImagesState(updatedExistingImages);
        } else {
            // Xóa ảnh mới
            const fileIndex = index - existingImagesState.length;
            const updatedFiles = files.filter((_, i) => i !== fileIndex);
            setFiles(updatedFiles);
        }

        // Gửi thứ tự mới lên parent
        const newOrder = combinedItems
            .filter((_, i) => i !== index)
            .map((_, idx) => idx);
        onChange(files, newOrder);
    };

    // Drag & Drop logic cho desktop và mobile
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggedIndex === null) return;

        const combinedItems = [...existingImagesState, ...files];
        const [draggedItem] = combinedItems.splice(draggedIndex, 1);
        combinedItems.splice(dropIndex, 0, draggedItem);

        // Cập nhật lại existingImagesState và files
        const updatedExistingImages = combinedItems.filter(
            isExistingImage
        ) as typeof existingImagesState;
        const updatedFiles = combinedItems.filter(
            (item): item is File => !isExistingImage(item)
        );

        setExistingImagesState(updatedExistingImages);
        setFiles(updatedFiles);

        // Gửi thứ tự mới lên parent
        const newOrder = combinedItems.map((_, idx) => idx);
        onChange(updatedFiles, newOrder);

        setDraggedIndex(null);
    };

    // Touch events cho mobile drag & drop
    const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);
    const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
    const [isDraggingTouch, setIsDraggingTouch] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
    const [currentTouchPos, setCurrentTouchPos] = useState({ x: 0, y: 0 }); // Track current position

    const handleTouchStart = (e: React.TouchEvent, index: number) => {
        // Nếu touch vào nút delete, không xử lý drag
        const target = e.target as HTMLElement;
        if (
            target.closest("button") ||
            target.closest('[data-testid="DeleteIcon"]')
        ) {
            return;
        }

        // Không preventDefault ở đây để tránh passive event listener warning
        const touch = e.touches[0];
        const startPos = { x: touch.clientX, y: touch.clientY };
        setTouchStartIndex(index);
        setTouchStartPos(startPos);
        setIsDraggingTouch(false);

        // Long press timer cho mobile drag
        const timer = setTimeout(() => {
            setIsDraggingTouch(true);
            console.log(`Started dragging image ${index}`); // Debug log
            // Vibration feedback nếu supported
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
        }, 500); // 500ms long press

        setLongPressTimer(timer);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartIndex === null) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.y);

        // Update current touch position
        setCurrentTouchPos({ x: touch.clientX, y: touch.clientY });

        // Nếu di chuyển quá xa, hủy long press
        if ((deltaX > 15 || deltaY > 15) && longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }

        // Không dùng preventDefault để tránh passive event listener warning
        // Thay vào đó sử dụng CSS để ngăn scroll khi drag
    };
    const handleTouchEnd = () => {
        // Không dùng preventDefault để tránh passive event listener warning

        // Nếu không đang drag, clear timer và reset states
        if (!isDraggingTouch) {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                setLongPressTimer(null);
            }
            setTouchStartIndex(null);
            setIsDraggingTouch(false);
        }
        // Nếu đang drag, để global handler xử lý
    };

    // Dropzone setup - chỉ dùng dropzone, không dùng input file thủ công
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        multiple: true,
        noClick: false, // Cho phép click để mở file dialog
    });

    // Global touch end handler cho mobile drag & drop
    React.useEffect(() => {
        const handleGlobalTouchEnd = (e: TouchEvent) => {
            console.log("Global touch end:", {
                isDraggingTouch,
                touchStartIndex,
            }); // Debug

            if (isDraggingTouch && touchStartIndex !== null) {
                // Sử dụng touches hoặc changedTouches hoặc current position
                const touch = e.changedTouches[0] || e.touches[0];
                const touchX = touch ? touch.clientX : currentTouchPos.x;
                const touchY = touch ? touch.clientY : currentTouchPos.y;

                console.log("Touch position:", touchX, touchY); // Debug

                // Tìm element ở vị trí touch
                const elementAtPosition = document.elementFromPoint(
                    touchX,
                    touchY
                );

                console.log("Element at position:", elementAtPosition); // Debug

                // Tìm grid item gần nhất - thử nhiều cách
                let gridItem = elementAtPosition?.closest("[data-image-index]");

                // Nếu không tìm thấy, thử tìm trong các element con
                if (!gridItem && elementAtPosition) {
                    const allGridItems =
                        document.querySelectorAll("[data-image-index]");
                    console.log("All grid items:", allGridItems); // Debug

                    // Tìm grid item gần nhất dựa trên vị trí
                    let closestDistance = Infinity;
                    let closestItem = null;

                    allGridItems.forEach((item) => {
                        const rect = item.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;

                        const distance = Math.sqrt(
                            Math.pow(touchX - centerX, 2) +
                                Math.pow(touchY - centerY, 2)
                        );

                        // Chỉ chấp nhận nếu touch trong phạm vi item (với tolerance)
                        if (distance < closestDistance && distance < 150) {
                            // 150px tolerance
                            closestDistance = distance;
                            closestItem = item;
                        }
                    });

                    if (closestItem) {
                        gridItem = closestItem;
                        console.log(
                            "Found closest grid item:",
                            gridItem,
                            "distance:",
                            closestDistance
                        );
                    }
                }

                if (gridItem) {
                    const targetIndex = parseInt(
                        gridItem.getAttribute("data-image-index") || "0"
                    );

                    console.log(
                        `Moving from ${touchStartIndex} to ${targetIndex}`
                    ); // Debug

                    // Swap nếu khác vị trí
                    if (
                        touchStartIndex !== targetIndex &&
                        targetIndex >= 0 &&
                        targetIndex < files.length
                    ) {
                        const newFiles = [...files];
                        const draggedFile = newFiles[touchStartIndex];

                        newFiles.splice(touchStartIndex, 1);
                        newFiles.splice(targetIndex, 0, draggedFile);

                        setFiles(newFiles);
                        onChange(
                            newFiles,
                            newFiles.map((_, i) => i)
                        );
                    }
                } else {
                    console.log("No grid item found"); // Debug
                }

                // Reset states
                setTouchStartIndex(null);
                setIsDraggingTouch(false);
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    setLongPressTimer(null);
                }
            }
        };

        // Thêm CSS để ngăn scroll khi đang drag
        if (isDraggingTouch) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
            document.addEventListener("touchend", handleGlobalTouchEnd);
        } else {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        }

        return () => {
            document.removeEventListener("touchend", handleGlobalTouchEnd);
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        };
    }, [
        isDraggingTouch,
        touchStartIndex,
        files,
        longPressTimer,
        onChange,
        currentTouchPos,
    ]);

    return (
        <Box>
            {/* Khu vực upload ảnh - chỉ dùng dropzone */}
            <Box
                {...getRootProps()}
                sx={{
                    border: "2px dashed #ccc",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: isDragActive ? "#f0f0f0" : "inherit",
                    "&:hover": {
                        borderColor: "#999",
                        bgcolor: "#fafafa",
                    },
                }}
            >
                <input {...getInputProps()} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Kéo thả hoặc chọn nhiều ảnh sản phẩm
                </Typography>
            </Box>
            {/* Khu vực xem trước và sắp xếp ảnh */}
            {(existingImagesState.length > 0 || files.length > 0) && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Xem trước & sắp xếp ảnh (
                        {existingImagesState.length + files.length} ảnh)
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            mb: 2,
                            display: "block",
                            color: "text.secondary",
                            bgcolor: isDraggingTouch
                                ? "#e3f2fd"
                                : "transparent",
                            p: isDraggingTouch ? 1 : 0,
                            borderRadius: isDraggingTouch ? 1 : 0,
                            transition: "all 0.3s ease",
                        }}
                    >
                        {isDraggingTouch
                            ? `🔄 Đang kéo ảnh thứ ${
                                  (touchStartIndex || 0) + 1
                              } - Thả vào vị trí mong muốn`
                            : "💻 Desktop: Kéo thả để đổi vị trí | 📱 Mobile: Nhấn giữ 0.5s để kéo | ❌ Nhấn nút X để xóa | 🟢 Ảnh hiện có | 🔵 Ảnh mới"}
                    </Typography>
                    <Grid container spacing={2}>
                        {[...existingImagesState, ...files].map((item, idx) => {
                            const isExisting = "id" in item;

                            return isExisting ? (
                                <ExistingImageItem
                                    key={`existing-${
                                        (item as { id: number }).id
                                    }`}
                                    image={
                                        item as {
                                            id: number;
                                            url: string;
                                            order: number;
                                            publicId: string;
                                        }
                                    }
                                    index={idx}
                                    onRemove={handleRemove}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    isDragging={draggedIndex === idx}
                                />
                            ) : (
                                <ImagePreviewItem
                                    key={`new-${idx}`}
                                    file={item as File}
                                    index={idx}
                                    onRemove={handleRemove}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    isDragging={draggedIndex === idx}
                                />
                            );
                        })}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default AppDropzoneMultiple;

// ---
// Component này dùng cho upload, xem trước, sắp xếp, xóa nhiều ảnh sản phẩm.
// Khi thay đổi, trả về mảng File và thứ tự ảnh (order) để gửi lên backend.
// Sử dụng với react-hook-form: truyền value và onChange từ field.
// ---
