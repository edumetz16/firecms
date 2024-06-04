import React from "react";
import { CircularProgress, CircularProgressProps, Typography } from "@edumetz16/firecms_ui";

/**
 *
 * @param text
 * @param props
 * @constructor
 * @ignore
 */
export function CircularProgressCenter({ text, ...props }: CircularProgressProps & {
    text?: string
}) {
    return (
        <div
            className="flex w-full h-screen max-h-full max-w-full bg-gray-50 dark:bg-gray-900 gap-4">
            <div className="m-auto flex flex-col gap-2 items-center">
                <CircularProgress {...props}/>
                {text && <Typography
                    color={"secondary"}
                    variant={"caption"}
                    className="text-center">{text}</Typography>}
            </div>
        </div>
    );
}
