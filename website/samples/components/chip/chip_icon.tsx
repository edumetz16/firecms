import React from "react";
import { Chip, FaceIcon } from "@edumetz16/firecms_ui";

export default function ChipIconDemo() {
    return (
        <Chip icon={<FaceIcon size={"small"}/>}>
            Chip with Icon
        </Chip>
    );
}
