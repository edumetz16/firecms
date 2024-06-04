import React from "react";
import { Alert, Button } from "@edumetz16/firecms_ui";

export default function AlertActionButtonDemo() {
    return (
        <Alert
            color="success"
            action={<Button size="small">Undo</Button>}
        >
            This alert contains an action button.
        </Alert>
    );
}
