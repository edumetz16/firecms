import React from "react";
import { FileUpload } from "@edumetz16/firecms_ui";

export default function FileUploadBasicDemo() {
    const onFilesAdded = (files: File[]) => {
        console.log(files);
    };

    return (
        <FileUpload
            accept={{ "image/*": [] }}
            onFilesAdded={onFilesAdded}
            title="Upload your file"
            uploadDescription="Drag and drop a file here or click"
        />
    );
}