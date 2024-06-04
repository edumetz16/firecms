import React from "react";
import { AdminDrawerMenu } from "./AdminDrawerMenu";
import { DataTalkDrawer } from "@edumetz16/firecms_datatalk";

/**
 * Default drawer used in FireCMS Cloud
 * @group Core
 */
export function FireCMSCloudDataTalkDrawer() {

    const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);

    return (

        <>
            <DataTalkDrawer/>

            <AdminDrawerMenu
                menuOpen={adminMenuOpen}
                setMenuOpen={setAdminMenuOpen}/>
        </>
    );
}
