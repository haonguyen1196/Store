import {
    useController,
    type FieldValues,
    type UseControllerProps,
} from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { UploadFile } from "@mui/icons-material";
import { FormControl, FormHelperText, Typography } from "@mui/material";
import useDeviceSize from "../../../lib/hooks/useDeviceSize";

type Props<T extends FieldValues> = {
    name: keyof T;
} & UseControllerProps<T>;

export default function AppDropzone<T extends FieldValues>(props: Props<T>) {
    const { fieldState, field } = useController({
        ...props,
    });
    const { isMobile } = useDeviceSize();

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                const fileWithPreview = Object.assign(acceptedFiles[0], {
                    preview: URL.createObjectURL(acceptedFiles[0]),
                });

                field.onChange(fileWithPreview);
            }
        },
        [field]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    const dzStyles = {
        display: "flex",
        flexDirection: "column" as const,
        border: "dashed 2px #767676",
        borderColor: "#767676",
        borderRadius: "5px",
        alignItems: "center",
        justifyContent: "center",
        height: "100%", // Fill parent height
        width: "100%", // Fill parent width
        padding: isMobile ? "16px" : "30px",
    };

    const dzActive = {
        borderColor: "green",
    };

    return (
        <div {...getRootProps()} style={{ height: "100%", width: "100%" }}>
            <FormControl
                style={isDragActive ? { ...dzStyles, ...dzActive } : dzStyles}
                error={!!fieldState.error}
            >
                <input {...getInputProps()} />
                <UploadFile
                    sx={{
                        fontSize: isMobile ? "60px" : "100px",
                        mb: 1,
                    }}
                />
                <Typography variant={isMobile ? "h6" : "h4"} textAlign="center">
                    Kéo hình ảnh vào đây
                </Typography>
                <FormHelperText>{fieldState.error?.message}</FormHelperText>
            </FormControl>
        </div>
    );
}
