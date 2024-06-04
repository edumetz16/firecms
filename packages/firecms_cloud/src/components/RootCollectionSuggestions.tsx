import React, { useEffect } from "react";
import { unslugify, useAuthController, useNavigationController } from "@edumetz16/firecms_core";
import { AddIcon, Chip, CircularProgress, Collapse, Typography, } from "@edumetz16/firecms_ui";
import { useCollectionEditorController } from "@edumetz16/firecms_collection_editor";

export function RootCollectionSuggestions({ introMode }: { introMode?: "new_project" | "existing_project" }) {

    const authController = useAuthController();
    const navigationController = useNavigationController();

    const collectionEditorController = useCollectionEditorController();
    const canCreateCollections = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user
        }).createCollections
        : true;

    const [rootPathSuggestions, setRootPathSuggestions] = React.useState<string[] | undefined>(undefined);
    useEffect(() => {
        collectionEditorController.getPathSuggestions?.("").then((result) => {
            const existingPaths = (navigationController.collections ?? []).map(c => c.path);
            setRootPathSuggestions(result.filter((path) => !existingPaths.includes(path)));
        });
    }, [collectionEditorController.getPathSuggestions]);

    if (!collectionEditorController.getPathSuggestions) {
        return null;
    }

    const showSuggestions = (rootPathSuggestions ?? []).length > 3 || ((navigationController.collections ?? []).length === 0 && (rootPathSuggestions ?? []).length > 0);
    const forceShowSuggestions = introMode === "existing_project";
    return <Collapse
        in={forceShowSuggestions || showSuggestions}>

        <div
            className={"flex flex-col gap-1 p-2 my-4"}>

            {!introMode && <Typography variant={"body2"} color={"secondary"}>
                Create a collection <b>automatically</b> from your data:
            </Typography>}

            {introMode === "existing_project" && <Typography>
                You will see your <b>database collections</b> here, a few seconds after project creation
            </Typography>}

            <div
                className={"flex flex-row gap-1 overflow-scroll no-scrollbar "}>
                {(rootPathSuggestions ?? []).map((path) => {
                    return (
                        <div key={path}>
                            <Chip
                                icon={<AddIcon size={"small"}/>}
                                colorScheme={"cyanLighter"}
                                onClick={collectionEditorController && canCreateCollections
                                    ? () => collectionEditorController.createCollection({
                                        initialValues: {
                                            path,
                                            name: unslugify(path)
                                        },
                                        parentCollectionIds: [],
                                        redirect: true,
                                        sourceClick: "root_collection_suggestion"
                                    })
                                    : undefined}
                                size="small">
                                {path}
                            </Chip>
                        </div>
                    );
                })}
                {rootPathSuggestions === undefined && <CircularProgress size={"small"}/>}
                {rootPathSuggestions?.length === 0 && <Typography variant={"caption"}>No suggestions</Typography>}
            </div>
        </div>
    </Collapse>
}
