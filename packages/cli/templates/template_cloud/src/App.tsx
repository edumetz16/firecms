import React from "react"
import { FireCMSCloudApp } from "@edumetz16/firecms_cloud";
import appConfig from "./index";

function App() {
    return <FireCMSCloudApp
        projectId={"[REPLACE_WITH_PROJECT_ID]"}
        appConfig={appConfig}
    />;
}

export default App
