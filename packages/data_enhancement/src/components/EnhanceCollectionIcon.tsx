import React from "react";

import { EntityCollection, PluginHomePageActionsProps } from "@edumetz16/firecms_core";
import { AutoFixHighIcon, Tooltip } from "@edumetz16/firecms_ui";

export function EnhanceCollectionIcon({
                                          extraProps,
                                          path,
                                          collection
                                      }: PluginHomePageActionsProps<{
    getConfigForPath?: (props: { path: string, collection: EntityCollection }) => boolean;
}>) {
    const [showIcon, setShowIcon] = React.useState(false);
    React.useEffect(() => {
        if (!extraProps?.getConfigForPath) {
            setShowIcon(true);
            return;
        }
        const config = extraProps.getConfigForPath({
            path,
            collection
        })
        if (config) {
            setShowIcon(true);
        }
    }, [collection, extraProps?.getConfigForPath, path]);

    if (showIcon)
        return <Tooltip
            title={"Use OpenAI to generate content for this collection ❤️"}>
            <AutoFixHighIcon/>
        </Tooltip>;
    return null;
}
