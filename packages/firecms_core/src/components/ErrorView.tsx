import React from "react";
import { ErrorTooltip } from "./ErrorTooltip";
import { ErrorIcon, Typography } from "@edumetz16/firecms_ui";

/**
 * @group Components
 */
export interface ErrorViewProps {
    title?: string;
    error: Error | React.ReactElement | string,
    tooltip?: string
}

/**
 * Generic error view. Displayed for example when an unexpected value comes
 * from the datasource in a collection view.
 * @param title
 * @param error
 * @param tooltip
 * @constructor
 * @group Components
 */
export function ErrorView({
                              title,
                              error,
                              tooltip
                          }: ErrorViewProps): React.ReactElement {
    const component = error instanceof Error ? error.message : error;
    console.error("ErrorView", error)

    const body = (
        <div
            className="flex items-center m-2">
            <ErrorIcon size={"small"} color={"error"}/>
            <div className="pl-2">
                {title && <Typography
                    variant={"body2"}
                    className="font-medium">{title}</Typography>}
                <Typography variant={"body2"}>{component}</Typography>
            </div>
        </div>
    );

    if (tooltip) {
        return (
            <ErrorTooltip title={tooltip}>
                {body}
            </ErrorTooltip>
        );
    }
    return body;
}
