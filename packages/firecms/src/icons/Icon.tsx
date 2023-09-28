import * as React from "react";
import "@material-design-icons/font/filled.css";
import { cn } from "../components/util/cn";

export type IconColor = "inherit" | "primary" | "secondary" | "disabled" | "error" | "success" | "warning";
export type IconProps = {
    size?: "smallest" | "small" | "medium" | "large" | number,
    color?: IconColor,
    className?: string,
    onClick?: (e: React.SyntheticEvent) => void,
    style?: React.CSSProperties
}

const colorClassesMapping: Record<IconColor, string> = {
    inherit: "",
    primary: "text-primary",
    success: "text-green-500",
    warning: "text-yellow-500",
    secondary: "text-secondary",
    disabled: "text-disabled dark:text-disabled-dark",
    error: "text-red-500"
}

export function Icon({
                         iconKey,
                         size = "medium",
                         color,
                         className,
                         onClick,
                         style
                     }: IconProps & { iconKey: string }) {
    let sizeInPx: number;
    switch (size) {
        case "smallest":
            sizeInPx = 16;
            break;
        case "small":
            sizeInPx = 20;
            break;
        case "medium":
            sizeInPx = 24;
            break;
        case "large":
            sizeInPx = 28;
            break
        default:
            sizeInPx = size;
    }
    if (!sizeInPx) sizeInPx = 24;

    return <span
        style={{
            fontSize: `${sizeInPx}px`,
            display: "block",
            ...style
        }}
        className={
            cn("material-icons",
                color ? colorClassesMapping[color] : "",
                "select-none",
                className)}
        onClick={onClick}>{iconKey}</span>
}
