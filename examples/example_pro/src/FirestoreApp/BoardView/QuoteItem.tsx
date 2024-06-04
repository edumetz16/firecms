import React, { CSSProperties, FC } from "react";
import { DraggableProvided } from "@hello-pangea/dnd";
import type { ItemViewProps } from "./components/types";
import { Quote } from "./data";
import { cn, defaultBorderMixin } from "@edumetz16/firecms_ui";

const getBackgroundColor = (
    isDragging: boolean,
    isGroupedOver: boolean
): string => {
    if (isDragging) {
        return "bg-gray-100 dark:bg-gray-800";
    }

    if (isGroupedOver) {
        return "bg-gray-200";
    }

    return "bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800";
};

const getBorderColor = (
    isDragging: boolean
): string => isDragging ? "border-gray-700 ring-2 ring-primary" : "border-transparent";

const getStyle = (provided: DraggableProvided, style?: CSSProperties) => {
    return style ? { ...provided.draggableProps.style, ...style } : provided.draggableProps.style;
};

const QuoteItemView: FC<ItemViewProps<Quote>> = ({
                                                     item,
                                                     isDragging,
                                                     isGroupedOver,
                                                     provided,
                                                     style,
                                                     isClone,
                                                     index
                                                 }) => (
    <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={getStyle(provided, style)}
        className={"py-1"}
        data-is-dragging={isDragging}
        data-testid={item.id}
        data-index={index}
        aria-label={`${item.content.author}`}
    >
        <div className={cn(
            "p-2 items-start flex border rounded-lg",
            defaultBorderMixin,
            getBorderColor(isDragging),
            getBackgroundColor(isDragging, !!isGroupedOver))}>
            <img
                src={"https://picsum.photos/70"}
                className="w-10 h-10 rounded-full mr-2 shrink-0 grow-0"
            />
            {isClone && (
                <div
                    className="absolute bg-green-500 bottom-1 right-[-13px] top-[-13px] rotate-12 w-10 h-10 flex justify-center items-center border-2 border-green-700 rounded-full text-xs">
                    Clone
                </div>
            )}
            <div className="grow">
                <div className="before:content-['“'] after:content-['”']">
                    {item.content.quote}
                </div>
                <div className="flex mt-2 items-center">
                    <small className={"rounded-full p-1"}>
                        {item.content.author}
                    </small>
                    <small className="grow shrink text-right">
                        id:{item.id}
                    </small>
                </div>
            </div>
        </div>
    </div>
);

export default QuoteItemView;
