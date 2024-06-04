import React, { useCallback } from "react";

import equal from "react-fast-compare"

import { getRowHeight } from "./common";
import { VirtualTableRowProps } from "./types";
import { cn } from "@edumetz16/firecms_ui";

export const VirtualTableRow = React.memo<VirtualTableRowProps<any>>(
    function VirtualTableRow<T>({
                                    rowData,
                                    rowIndex,
                                    children,
                                    onRowClick,
                                    size,
                                    style,
                                    hoverRow,
                                    rowClassName
                                }: VirtualTableRowProps<T>) {

        const onClick = useCallback((event: React.SyntheticEvent) => {
            if (onRowClick)
                onRowClick({
                    rowData,
                    rowIndex,
                    event
                })
        }, [onRowClick, rowData, rowIndex]);

        return (
            <div
                className={cn(
                    "flex min-w-full text-sm border-b border-gray-200 dark:border-gray-800 border-opacity-40 dark:border-opacity-40",
                    rowClassName ? rowClassName(rowData) : "",
                    {
                        "hover:bg-opacity-95": hoverRow,
                        "cursor-pointer": onRowClick
                    }
                )}
                onClick={onClick}
                style={{
                    ...(style),
                    height: getRowHeight(size),
                    width: "fit-content"
                }}
            >
                {children}
            </div>
        );

    },
    equal
);
