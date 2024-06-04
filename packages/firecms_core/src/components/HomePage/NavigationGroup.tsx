import { PropsWithChildren } from "react";
import { useUserConfigurationPersistence } from "../../hooks/useUserConfigurationPersistence";
import { ExpandablePanel, Typography } from "@edumetz16/firecms_ui";

export function NavigationGroup({
                                    children,
                                    group
                                }: PropsWithChildren<{
    group: string | undefined
}>) {
    const userConfigurationPersistence = useUserConfigurationPersistence();
    return (
        <ExpandablePanel
            invisible={true}
            titleClassName={"font-medium text-sm text-gray-600 dark:text-gray-400"}
            className={"py-4"}
            initiallyExpanded={!(userConfigurationPersistence?.collapsedGroups ?? []).includes(group ?? "ungrouped")}
            onExpandedChange={expanded => {
                if (userConfigurationPersistence) {

                    if (!expanded) {
                        const paths = (userConfigurationPersistence.collapsedGroups ?? []).concat(group ?? "ungrouped");
                        userConfigurationPersistence.setCollapsedGroups(paths);
                    } else {
                        userConfigurationPersistence.setCollapsedGroups((userConfigurationPersistence.collapsedGroups ?? []).filter(g => g !== (group ?? "ungrouped")));
                    }
                }
            }}
            title={<Typography color={"secondary"}
                               className="font-medium ml-1">
                {group?.toUpperCase() ?? "Views".toUpperCase()}
            </Typography>}>

            <div className="mb-8">
                {children}
            </div>
        </ExpandablePanel>
    );
}
