import React from "react";
import { AddIcon, IconButton } from "@edumetz16/firecms_ui";

export default function IconButtonSizeDemo() {
    return (
        <>
            <IconButton
                variant="filled"
                size="small"
                onClick={() => console.log("Small Clicked!")}>
                <AddIcon size={"small"}/>
            </IconButton>
            <IconButton
                variant="filled"
                size="medium"
                onClick={() => console.log("Medium Clicked!")}>
                <AddIcon/>
            </IconButton>
            <IconButton
                variant="filled"
                size="large"
                onClick={() => console.log("Large Clicked!")}>
                <AddIcon size={"large"}/>
            </IconButton>
        </>
    );
}
