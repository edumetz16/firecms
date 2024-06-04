import React from "react";
import { AddIcon, IconButton } from "@edumetz16/firecms_ui";

export default function IconButtonBasicDemo() {
    return (
        <IconButton
            variant="filled"
            onClick={() => console.log("Clicked!")}>
            <AddIcon/>
        </IconButton>
    );
}
