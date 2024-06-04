import { AddIcon, Button } from "@edumetz16/firecms_ui";
import { useCollectionEditorController } from "../useCollectionEditorController";

export function NewCollectionButton() {
    const collectionEditorController = useCollectionEditorController();
    return <div className={"bg-gray-50 dark:bg-gray-900 min-w-fit rounded"}>
        <Button className={"min-w-fit"}
                variant={"outlined"}
                onClick={() => collectionEditorController.createCollection({
                    parentCollectionIds: [],
                    redirect: true,
                    sourceClick: "new_collection_button"
                })}>
            <AddIcon/>
            New collection
        </Button>
    </div>
}
