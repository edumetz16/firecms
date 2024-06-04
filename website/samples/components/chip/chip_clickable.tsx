import React from "react";
import { Chip } from "@edumetz16/firecms_ui";

export default function ChipClickableDemo() {
    const handleClick = () => {
        console.log("Chip clicked");
    };

    return (
        <Chip onClick={handleClick}>
            Clickable Chip
        </Chip>
    );
}