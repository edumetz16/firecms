import { CMSView } from "@edumetz16/firecms_core";
import { RolesView, UsersView } from "./components";

export const userManagementAdminViews: CMSView[] = [
    {
        path: "users",
        name: "CMS Users",
        group: "Admin",
        icon: "face",
        view: <UsersView/>
    },
    {
        path: "roles",
        name: "Roles",
        group: "Admin",
        icon: "gpp_good",
        view: <RolesView/>
    }
]
