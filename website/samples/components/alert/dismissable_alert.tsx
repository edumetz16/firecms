import React, { useState } from "react";
import { Alert } from "@edumetz16/firecms_ui";

export default function DismissableAlertDemo() {
    const [visible, setVisible] = useState(true);
    return (
        <>
            {visible && (
                <Alert onDismiss={() => setVisible(false)} color="info">
                    This alert can be dismissed with the close button.
                </Alert>
            )}
        </>
    );
}
