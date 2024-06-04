import * as React from "react";
import { useMemo } from "react";

import { Entity, EntityCollection, ResolvedProperty } from "../types";

import {
    getEntityImagePreviewPropertyKey,
    getEntityPreviewKeys,
    getEntityTitlePropertyKey,
    getValueInPath,
    resolveCollection
} from "../util";
import { cn, defaultBorderMixin, IconButton, KeyboardTabIcon, Skeleton, Tooltip, Typography } from "@edumetz16/firecms_ui";
import { PreviewSize, PropertyPreview, SkeletonPropertyComponent } from "../preview";
import { useCustomizationController, useNavigationController, useSideEntityController } from "../hooks";
import { useAnalyticsController } from "../hooks/useAnalyticsController";

export type EntityPreviewProps = {
    size: PreviewSize,
    actions?: React.ReactNode,
    collection?: EntityCollection,
    hover?: boolean;
    previewProperties?: string[],
    disabled: undefined | boolean,
    entity: Entity<any>,
    includeEntityNavigation?: boolean,
    onClick?: (e: React.SyntheticEvent) => void;
};

/**
 * This view is used to display a preview of an entity.
 * It is used by default in reference fields and whenever a reference is displayed.
 */
export function EntityPreview({
                                  actions,
                                  disabled,
                                  hover,
                                  collection: collectionProp,
                                  previewProperties,
                                  onClick,
                                  size,
                                  includeEntityNavigation,
                                  entity
                              }: EntityPreviewProps) {

    const analyticsController = useAnalyticsController();
    const sideEntityController = useSideEntityController();
    const customizationController = useCustomizationController();

    const navigationController = useNavigationController();

    const collection = collectionProp ?? navigationController.getCollection(entity.path);

    if (!collection) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${entity.path}`);
    }

    const resolvedCollection = React.useMemo(() => resolveCollection({
        collection,
        path: entity.path,
        values: entity.values,
        fields: customizationController.propertyConfigs
    }), [collection]);

    const listProperties = useMemo(() => getEntityPreviewKeys(resolvedCollection, customizationController.propertyConfigs, previewProperties, size === "small" || size === "medium" ? 3 : 1),
        [previewProperties, resolvedCollection, size]);

    const titleProperty = getEntityTitlePropertyKey(resolvedCollection, customizationController.propertyConfigs);
    const imagePropertyKey = getEntityImagePreviewPropertyKey(resolvedCollection);
    const imageProperty = imagePropertyKey ? resolvedCollection.properties[imagePropertyKey] : undefined;

    const restProperties = listProperties.filter(p => p !== titleProperty && p !== imagePropertyKey);

    return <EntityPreviewContainer onClick={disabled ? undefined : onClick}
                                   hover={disabled ? undefined : hover}
                                   size={size}>
        {imageProperty && (
            <div className={cn("w-10 h-10 mr-2 shrink-0 grow-0", size === "tiny" ? "my-0.5" : "m-2 self-start")}>
                <PropertyPreview property={imageProperty}
                                 propertyKey={imagePropertyKey as string}
                                 size={"tiny"}
                                 value={getValueInPath(entity.values, imagePropertyKey as string)}/>
            </div>
        )}

        <div className={"flex flex-col flex-grow w-full m-1"}>

            {size !== "tiny" && (
                entity
                    ? <div className={`${
                        size !== "medium"
                            ? "block whitespace-nowrap overflow-hidden truncate"
                            : ""
                    }`}>
                        <Typography variant={"caption"}
                                    color={"disabled"}
                                    className={"font-mono"}>
                            {entity.id}
                        </Typography>
                    </div>
                    : <Skeleton/>)}

            {titleProperty && (
                <div className={"my-0.5 text-sm font-medium"}>
                    {
                        entity
                            ? <PropertyPreview
                                propertyKey={titleProperty as string}
                                value={getValueInPath(entity.values, titleProperty)}
                                property={resolvedCollection.properties[titleProperty as string] as ResolvedProperty}
                                size={"medium"}/>
                            : <SkeletonPropertyComponent
                                property={resolvedCollection.properties[titleProperty as string] as ResolvedProperty}
                                size={"medium"}/>
                    }
                </div>
            )}

            {restProperties && restProperties.map((key) => {
                const childProperty = resolvedCollection.properties[key as string];
                if (!childProperty) return null;

                return (
                    <div key={"ref_prev_" + key}
                         className={restProperties.length > 1 ? "my-0.5" : "my-0"}>
                        {
                            entity
                                ? <PropertyPreview
                                    propertyKey={key as string}
                                    value={getValueInPath(entity.values, key)}
                                    property={childProperty as ResolvedProperty}
                                    size={"tiny"}/>
                                : <SkeletonPropertyComponent
                                    property={childProperty as ResolvedProperty}
                                    size={"tiny"}/>
                        }
                    </div>
                );
            })}

        </div>

        {entity && includeEntityNavigation &&
            <Tooltip title={`See details for ${entity.id}`}
                     className={size !== "tiny" ? "self-start" : ""}>
                <IconButton
                    color={"inherit"}
                    size={"small"}
                    onClick={(e) => {
                        e.stopPropagation();
                        analyticsController.onAnalyticsEvent?.("entity_click_from_reference", {
                            path: entity.path,
                            entityId: entity.id
                        });
                        sideEntityController.open({
                            entityId: entity.id,
                            path: entity.path,
                            collection,
                            updateUrl: true
                        });
                    }}>
                    <KeyboardTabIcon size={"small"}/>
                </IconButton>
            </Tooltip>}

        {actions}

    </EntityPreviewContainer>;
}

export type EntityPreviewContainerProps = {
    children: React.ReactNode;
    hover?: boolean;
    fullwidth?: boolean;
    size: PreviewSize;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.SyntheticEvent) => void;
};

const EntityPreviewContainerInner = React.forwardRef<HTMLDivElement, EntityPreviewContainerProps>(({
                                                                                                       children,
                                                                                                       hover,
                                                                                                       onClick,
                                                                                                       size,
                                                                                                       style,
                                                                                                       className,
                                                                                                       fullwidth = true,
                                                                                                       ...props
                                                                                                   }, ref) => {
    return <div
        ref={ref}
        style={{
            ...style,
            // @ts-ignore
            tabindex: 0
        }}
        className={cn(
            "bg-white dark:bg-gray-900",
            fullwidth ? "w-full" : "",
            "items-center",
            hover ? "hover:bg-slate-50 dark:hover:bg-gray-800 group-hover:bg-slate-50 dark:group-hover:bg-gray-800" : "",
            size === "tiny" ? "p-1" : "p-2",
            "flex border rounded-lg",
            onClick ? "cursor-pointer" : "",
            defaultBorderMixin,
            className)}
        onClick={(event) => {
            if (onClick) {
                event.preventDefault();
                onClick(event);
            }
        }}
        {...props}>
        {children}
    </div>;
});

EntityPreviewContainerInner.displayName = "EntityPreviewContainer";

export const EntityPreviewContainer = React.memo(EntityPreviewContainerInner) as React.FC<EntityPreviewContainerProps>;
