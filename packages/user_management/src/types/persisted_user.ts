import { User } from "@edumetz16/firecms_core";

export type PersistedUser = User & {
    updated_on?: Date;
    created_on?: Date;
}
