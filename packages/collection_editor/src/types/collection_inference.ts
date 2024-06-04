import { EntityCollection } from "@edumetz16/firecms_core";

export type CollectionInference = (path: string, collectionGroup: boolean, parentCollectionIds: string[]) => Promise<Partial<EntityCollection> | null>;
