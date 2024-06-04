import React from "react";
import { Markdown } from "@edumetz16/firecms_ui";

const markdownSource = `
# Markdown Example
This is a basic Markdown rendering.
- Bullet one
- Bullet two
`;

export default function MarkdownBasicDemo() {
    return <Markdown source={markdownSource} />;
}