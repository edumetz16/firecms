import React from "react";
import { Popover } from "@edumetz16/firecms_ui";

export default function PopoverBasicDemo() {
    return (
        <Popover
            trigger={<button className="btn">Open Popover</button>}
        >
            <div className="p-4">
                This is a basic Popover.
            </div>
        </Popover>
    );
}