import React from "react";
import { Badge, Button, Chip } from "@edumetz16/firecms_ui";

export default function BadgeInvisibleDemo() {
    const [visible, setVisible] = React.useState<boolean | null>(true);
    return (
        <>
            <Badge color="primary" invisible={!visible}>
                <Chip>Content with Badge</Chip>
            </Badge>

            <Button onClick={() => setVisible(!visible)}>
                Toggle badge
            </Button>
        </>
    );
}
