import React from "react";
import { TextareaAutosize } from "@edumetz16/firecms_ui";

export default function TextareaAutosizeRowsDemo() {
    return (
        <TextareaAutosize 
            placeholder="Type your text here..."
            minRows={3}
            maxRows={6}
        />
    );
}