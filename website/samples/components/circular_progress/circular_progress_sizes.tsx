import React from "react";
import { CircularProgress } from "@edumetz16/firecms_ui";

export default function CircularProgressSizesDemo() {
    return (
        <div>
            <div>
                <p>Small</p>
                <CircularProgress size="small" />
            </div>
            <div>
                <p>Medium</p>
                <CircularProgress size="medium" />
            </div>
            <div>
                <p>Large</p>
                <CircularProgress size="large" />
            </div>
        </div>
    );
}