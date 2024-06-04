import { CollectionEditorPermissionsBuilder } from "./config_permissions";
import { Property } from "@edumetz16/firecms_core";
import { PersistedCollection } from "./persisted_collection";

/**
 * Controller to open the collection editor dialog.
 * @group Hooks and utilities
 */
export interface CollectionEditorController {

    editCollection: (props: {
        id?: string,
        fullPath?: string,
        parentCollectionIds: string[],
        parentCollection?: PersistedCollection
    }) => void;

    createCollection: (props: {
        initialValues?: {
            group?: string,
            path?: string,
            name?: string
        },
        parentCollectionIds: string[],
        parentCollection?: PersistedCollection,
        redirect: boolean,
        sourceClick?: string
    }) => void;

    editProperty: (props: {
        propertyKey?: string,
        property?: Property,
        currentPropertiesOrder?: string[],
        editedCollectionId: string,
        parentCollectionIds: string[],
        collection: PersistedCollection
    }) => void;

    configPermissions: CollectionEditorPermissionsBuilder;

    getPathSuggestions?: (path: string) => Promise<string[]>;

}
