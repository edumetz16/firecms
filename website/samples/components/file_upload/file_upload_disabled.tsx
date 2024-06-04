import React from "react";
import { FileUpload } from "@edumetz16/firecms_ui";

export default function FileUploadDisabledDemo() {
    return (
        <FileUpload
            accept={{ "image/*": [] }}
            onFilesAdded={() => {}}
            title="Upload Disabled"
            uploadDescription="File uploading is disabled"
            disabled={true}
        />
    );
}