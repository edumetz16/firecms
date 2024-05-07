import React, { useCallback, useContext } from "react";
import * as Sentry from "@sentry/browser";

import { FirebaseApp } from "firebase/app";

import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import "@fontsource/jetbrains-mono";
import "typeface-rubik";

import {
    CircularProgressCenter,
    ErrorView,
    ModeControllerProvider,
    NotFoundPage,
    SnackbarProvider,
    useBuildModeController
} from "@firecms/core";

import { CenteredView } from "@firecms/ui";
import { FireCMSBackend, FireCMSBackEndProvider, useBuildFireCMSBackend, useInitialiseFirebase } from "@firecms/cloud";

import { backendFirebaseProdConfig } from "./backend_firebase_config";
import { NewFireCMSProjectStart } from "./routes/NewFireCMSProjectStart";
import { SassDebugView } from "./routes/SassDebugView";
import { NewGoogleCloudProjectFlow } from "./routes/NewGoogleCloudProjectFlow";
import { DataTalkMainPage } from "./routes/DataTalkMainPage";
import { DataTalkScaffold } from "./components/DataTalkScaffold";
import { SaasAnalyticsProvider, useSaasAnalytics } from "./components/SaasAnalyticsProvider";
import { DataTalkAppClient } from "./routes/DataTalkAppClient";
import { DataTalkLoginView } from "./components/DataTalkLoginView";

export type SaasClientController = {
    selectProject: (projectId?: string) => void;
    onNewProject: () => void;
    goToDoctor: (projectId: string) => void;
    goToUser: () => void;
    goToSettings: () => void;
    fireCMSBackend: FireCMSBackend;
}

const SaasClientContext = React.createContext<SaasClientController>({} as any);

export const useSaasClientController = () => useContext<SaasClientController>(SaasClientContext);

export function SaasApp() {

    const {
        firebaseApp: backendFirebaseApp,
        firebaseConfigLoading,
        configError,
        firebaseConfigError
    } = useInitialiseFirebase({
        name: "firecms-backend",
        // firebaseConfig: process.env.NODE_ENV !== "production" ? backendFirebaseConfig : undefined,
        firebaseConfig: backendFirebaseProdConfig,
        authDomain: backendFirebaseProdConfig.authDomain
    });

    const modeController = useBuildModeController();

    if (firebaseConfigLoading || !backendFirebaseApp) {
        return <CircularProgressCenter/>;
    }

    if (firebaseConfigError) {
        return <ErrorView
            error={firebaseConfigError}/>
    }

    if (configError) {
        return <ErrorView
            error={configError}/>
    }

    return (
        <Router>
            <SaasAnalyticsProvider backendFirebaseApp={backendFirebaseApp}>
                <ModeControllerProvider value={modeController}>
                    <SaasAppInternal backendFirebaseApp={backendFirebaseApp}/>
                </ModeControllerProvider>
            </SaasAnalyticsProvider>
        </Router>
    );
}

const adminPaths = [
    "/debug",
    "/gcp",
    "/doctor"
];

const hideProjectSelectorPaths = [
    "/debug",
    "/gcp",
    "/doctor",
    "/p",
    "/subscriptions"
];

export function SaasAppInternal({
                                    backendFirebaseApp
                                }: {
    backendFirebaseApp: FirebaseApp,
}) {

    const analytics = useSaasAnalytics();
    const navigate = useNavigate();
    const location = useLocation();

    const adminRequiredForPath = adminPaths.some(p => location.pathname.startsWith(p));
    const hideProjectSelect = hideProjectSelectorPaths.some(p => location.pathname.startsWith(p));

    const fireCMSBackend: FireCMSBackend = useBuildFireCMSBackend({
        backendApiHost: import.meta.env.VITE_API_SERVER,
        backendFirebaseApp,
        onUserChange: (user) => {
            Sentry.setUser(user
                ? {
                    id: user.uid,
                    email: user.email ?? ""
                }
                : null);
        }
    });

    const selectProject = useCallback((projectId?: string) => {
        navigate(projectId ? `p/${projectId}` : "/");
    }, [navigate]);

    const onNewProject = useCallback(() => {
        navigate("new");
    }, [navigate]);

    const goToDoctor = useCallback((projectId: string) => {
        navigate("doctor/" + projectId);
    }, [navigate]);

    const goToUser = () => navigate("user");

    const goToSettings = () => {
        return navigate("subscriptions");
    };

    const saasController: SaasClientController = {
        selectProject,
        onNewProject,
        goToUser,
        goToSettings,
        goToDoctor,
        fireCMSBackend
    };

    const loading = fireCMSBackend.authLoading || fireCMSBackend.availableProjectsLoading;

    let component;
    if (loading) {
        component = <CircularProgressCenter/>;
    } else if (!fireCMSBackend.user) {

        component = <CenteredView maxWidth={"lg"}>
            <DataTalkLoginView fireCMSBackend={fireCMSBackend}
                               includeGoogleAdminScopes={adminRequiredForPath}
                               includeLogo={true}
                               includeGoogleDisclosure={false}
                               includeTermsAndNewsLetter={true}/>
        </CenteredView>;

    } else if (backendFirebaseApp) {

        component = (
            <Routes>

                <Route path="p/:projectId/*"
                       element={
                           <DataTalkAppClient
                               fireCMSBackend={fireCMSBackend}
                               onAnalyticsEvent={(eventName, projectId, params) => {
                                   const eventParams = {
                                       ...(params ?? {}),
                                       projectId
                                   };
                                   analytics.logEvent("p/" + eventName, eventParams);
                               }}/>}/>

                <Route path={"*"}
                       element={
                           <DataTalkScaffold
                               includeProjectSelect={!hideProjectSelect && (fireCMSBackend.availableProjectIds ?? [])?.length > 0}>

                               <Routes>
                                   <Route path="/"
                                          element={
                                              <DataTalkMainPage
                                                  selectProject={selectProject}
                                                  fireCMSBackend={fireCMSBackend}
                                                  onNewProject={onNewProject}
                                                  redirectToProject={true}
                                                  goToSettings={goToSettings}/>}/>
                                   <Route path="main"
                                          element={
                                              <DataTalkMainPage
                                                  selectProject={selectProject}
                                                  fireCMSBackend={fireCMSBackend}
                                                  onNewProject={onNewProject}
                                                  redirectToProject={false}
                                                  goToSettings={goToSettings}/>}/>
                                   <Route path="debug"
                                          element={
                                              <SassDebugView
                                                  selectProject={selectProject}
                                                  fireCMSBackend={fireCMSBackend}
                                                  onNewProject={onNewProject}/>}/>

                                   <Route path="new/*"
                                          element={
                                              <NewFireCMSProjectStart
                                                  fireCMSBackend={fireCMSBackend}
                                                  onProjectCreated={(projectId) => {
                                                      analytics.logProjectCreationExistingProjectSelectedSuccess(projectId);
                                                      selectProject(projectId);
                                                  }}/>}/>

                                   <Route path="gcp"
                                          element={
                                              <NewGoogleCloudProjectFlow
                                                  fireCMSBackend={fireCMSBackend}
                                                  onProjectCreated={(projectId) => {
                                                      analytics.logProjectCreationNewProjectSelectedSuccess(projectId);
                                                      selectProject(projectId);
                                                  }}/>}/>

                                   <Route path={"*"}
                                          element={
                                              <CenteredView>
                                                  <NotFoundPage/>
                                              </CenteredView>}/>
                               </Routes>

                           </DataTalkScaffold>
                       }
                />

            </Routes>
        );
    }

    if (!backendFirebaseApp) {
        return <CircularProgressCenter text={"Initializing FireCMS"}/>;
    }

    return (
        <SaasClientContext.Provider value={saasController}>
            <FireCMSBackEndProvider {...fireCMSBackend}>
                <SnackbarProvider>
                    {component}
                </SnackbarProvider>
            </FireCMSBackEndProvider>
        </SaasClientContext.Provider>
    );

}