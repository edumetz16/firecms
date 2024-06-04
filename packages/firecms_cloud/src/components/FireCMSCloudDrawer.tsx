import React, { useCallback } from "react";
import {
    DrawerNavigationItem,
    IconForView,
    TopNavigationResult,
    useAuthController,
    useDrawer,
    useNavigationController
} from "@edumetz16/firecms_core";
import { AddIcon, Button, Tooltip, Typography, } from "@edumetz16/firecms_ui";
import { useCollectionEditorController } from "@edumetz16/firecms_collection_editor";
import { RESERVED_GROUPS } from "../utils";
import { AdminDrawerMenu } from "./AdminDrawerMenu";

/**
 * Default drawer used in FireCMS Cloud
 * @group Core
 */
export function FireCMSCloudDrawer() {

    const {
        hovered,
        drawerOpen,
        closeDrawer
    } = useDrawer();

    const navigation = useNavigationController();
    const collectionEditorController = useCollectionEditorController();
    const { user } = useAuthController();

    const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);

    const tooltipsOpen = hovered && !drawerOpen && !adminMenuOpen;

    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in Drawer");

    const {
        navigationEntries,
        groups
    }: TopNavigationResult = navigation.topLevelNavigation;

    const buildGroupHeader = useCallback((group?: string) => {
        if (!drawerOpen) return <div style={{ height: 16 }}/>;
        const reservedGroup = group && RESERVED_GROUPS.includes(group);
        const canCreateCollections = collectionEditorController.configPermissions({ user }).createCollections && !reservedGroup;
        return <div className="flex flex-row items-center pt-8 pl-8 pr-0 pb-2">
            <Typography variant={"caption"}
                        color={"secondary"}
                        className="flex-grow font-medium">
                {group ? group.toUpperCase() : "Views".toUpperCase()}
            </Typography>
            {canCreateCollections && <Tooltip
                title={group ? `Create new collection in ${group}` : "Create new collection"}>
                <Button
                    size={"small"}
                    variant={"text"}
                    onClick={() => {
                        collectionEditorController?.createCollection({
                            initialValues: {
                                group,
                            },
                            parentCollectionIds: [],
                            redirect: true,
                            sourceClick: "drawer_new_collection"
                        });
                    }}>
                    <AddIcon size={"small"}/>
                </Button>
            </Tooltip>}
        </div>;
    }, [collectionEditorController, drawerOpen]);

    return (

        <>
            <div className={"flex-grow overflow-scroll no-scrollbar"}>

                {groups.map((group) => (
                    <React.Fragment
                        key={`drawer_group_${group}`}>
                        {buildGroupHeader(group)}
                        {Object.values(navigationEntries)
                            .filter(e => e.group === group)
                            .map((view, index) => <DrawerNavigationItem
                                key={`navigation_${index}`}
                                icon={<IconForView collectionOrView={view.collection ?? view.view}/>}
                                tooltipsOpen={tooltipsOpen}
                                drawerOpen={drawerOpen}
                                url={view.url}
                                name={view.name}/>)}
                    </React.Fragment>
                ))}

            </div>

            <AdminDrawerMenu
                menuOpen={adminMenuOpen}
                setMenuOpen={setAdminMenuOpen}/>
        </>
    );
}
