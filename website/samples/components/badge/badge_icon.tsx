import React from "react";
import { AnchorIcon, Badge, Button, IconButton } from "@edumetz16/firecms_ui";

export default function BadgeIconDemo() {
    return (
        <>
            <Badge color="error">
                <IconButton>
                    <AnchorIcon/>
                </IconButton>
            </Badge>

            <Badge color="secondary">
                <Button>
                    Fix
                </Button>
            </Badge>
        </>
    );
}
