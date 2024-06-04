import React from "react";
import { BooleanSwitch } from "@edumetz16/firecms_ui";

export default function BooleanSwitchDisabledDemo() {
    return (
        <BooleanSwitch
            value={true}
            disabled={true}
        />
    );
}
