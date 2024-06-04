import { EntityCollection, Permissions, Role, User } from "@edumetz16/firecms_core";

export const RESERVED_GROUPS = ["Admin"];

const DEFAULT_PERMISSIONS = {
    read: false,
    edit: false,
    create: false,
    delete: false
};

export function resolveUserRolePermissions<UserType extends User>
({
     collection,
     user
 }: {
    collection: EntityCollection<any>,
    user: UserType | null
}): Permissions {

    const roles = user?.roles;
    if (!roles) {
        return DEFAULT_PERMISSIONS;
    } else if (collection.ownerId === user?.uid) {
        return {
            read: true,
            create: true,
            edit: true,
            delete: true
        };
    } else {
        const basePermissions = {
            read: false,
            create: false,
            edit: false,
            delete: false
        };

        return roles
            .map(role => resolveCollectionRole(role, collection.id))
            .reduce(mergePermissions, basePermissions);
    }
}

function resolveCollectionRole(role: Role, id: string): Permissions {

    const basePermissions = {
        read: role.isAdmin || role.defaultPermissions?.read,
        create: role.isAdmin || role.defaultPermissions?.create,
        edit: role.isAdmin || role.defaultPermissions?.edit,
        delete: role.isAdmin || role.defaultPermissions?.delete
    };
    if (role.collectionPermissions && role.collectionPermissions[id]) {
        return mergePermissions(role.collectionPermissions[id], basePermissions);
    } else if (role.defaultPermissions) {
        return mergePermissions(role.defaultPermissions, basePermissions);
    } else {
        return basePermissions;
    }
}

const mergePermissions = (permA: Permissions, permB: Permissions) => {
    return {
        read: permA.read || permB.read,
        create: permA.create || permB.create,
        edit: permA.edit || permB.edit,
        delete: permA.delete || permB.delete
    };
}

export function getUserRoles(roles: Role[], fireCMSUser: User): Role[] | undefined {
    return !roles
        ? undefined
        : (fireCMSUser.roles
            ? fireCMSUser.roles
                .map(role => roles.find((r) => r.id === role.id))
                .filter(Boolean) as Role[]
            : []);
}

export const areRolesEqual = (rolesA: Role[], rolesB: Role[]) => {
    const rolesAIds = rolesA.map(r => r.id);
    const rolesBIds = rolesB.map(r => r.id);
    return rolesAIds.length === rolesB.length && rolesAIds.every((role) => rolesBIds.includes(role));
}
