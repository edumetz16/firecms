import { EntityCollection, User } from "@edumetz16/firecms_core";

export type PersistedCollection<M extends Record<string, any> = any, UserType extends User = User>
    = Omit<EntityCollection<M, UserType>, "subcollections"> & {
    // properties: Properties<M>;
    ownerId?: string;
    subcollections?: PersistedCollection<any, any>[];
    editable?: boolean;
}
