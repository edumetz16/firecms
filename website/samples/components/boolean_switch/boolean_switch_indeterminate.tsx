import React, { useState } from "react";
import { BooleanSwitch } from "@edumetz16/firecms_ui";

export default function BooleanSwitchIndeterminateDemo() {
    const [value, setValue] = useState<boolean | null>(null);
    return (
        <BooleanSwitch
            value={value}
            allowIndeterminate={true}
            onValueChange={setValue}
        />
    );
}
