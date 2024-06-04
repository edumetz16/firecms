import React from "react";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";

import {
    CircularProgressCenter,
    FireCMS,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController,
    useValidateAuthenticator
} from "@edumetz16/firecms_core";

import {
    FirebaseAuthController,
    FirebaseLoginView,
    FirebaseSignInProvider,
    useFirebaseAuthController,
    useFirebaseRTDBDelegate,
    useFirebaseStorageSource,
    useInitialiseFirebase,
    useAppCheck,
} from "@edumetz16/firecms_firebase";

import { productsCollection } from "./collections/products_collection";
import { CenteredView } from "@edumetz16/firecms_ui";

const firebaseConfig = {
    apiKey: "AIzaSyCIZxRC_0uy9zU2sQrEo88MigD4Z9ktYzo",
    authDomain: "rtdb-test-eb959.firebaseapp.com",
    databaseURL: "https://rtdb-test-eb959-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "rtdb-test-eb959",
    storageBucket: "rtdb-test-eb959.appspot.com",
    messagingSenderId: "380781473867",
    appId: "1:380781473867:web:94e8457d48c642b1655dce"
};

function RTDBApp() {

    const name = "Culturalyst";

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig
    });

    /**
     * Controller used to manage the dark or light color mode
     */
    const modeController = useBuildModeController();

    const signInOptions: FirebaseSignInProvider[] = ["google.com"];
    /**
     * Controller for managing authentication
     */
    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions
    });

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    const RTDBDelegate = useFirebaseRTDBDelegate({
        firebaseApp
    });

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    /**
     * Validate authenticator
     */
    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        authController,
        authenticator: () => true,
        dataSourceDelegate: RTDBDelegate,
        storageSource
    });

    const navigationController = useBuildNavigationController({
        collections: [productsCollection],
        authController,
        dataSourceDelegate: RTDBDelegate
    });

    if (firebaseConfigLoading || !firebaseApp) {
        return <>
            <CircularProgressCenter/>
        </>;
    }

    if (configError) {
        return <CenteredView>{configError}</CenteredView>;
    }

    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>

                <FireCMS
                    navigationController={navigationController}
                    authController={authController}
                    userConfigPersistence={userConfigPersistence}
                    dataSourceDelegate={RTDBDelegate}
                    storageSource={storageSource}

                >
                    {({
                          context,
                          loading
                      }) => {

                        let component;
                        if (loading || authLoading) {
                            component = <CircularProgressCenter size={"large"}/>;
                        } else {
                            if (!canAccessMainView) {
                                const LoginViewUsed = FirebaseLoginView;
                                component = (
                                    <LoginViewUsed
                                        allowSkipLogin={false}
                                        signInOptions={signInOptions}
                                        firebaseApp={firebaseApp}
                                        authController={authController}
                                        notAllowedError={notAllowedError}/>
                                );
                            } else {
                                component = (
                                    <Scaffold
                                        name={name}
                                        autoOpenDrawer={false}>
                                        <NavigationRoutes/>
                                        <SideDialogs/>
                                    </Scaffold>
                                );
                            }
                        }

                        return component;
                    }}
                </FireCMS>
            </ModeControllerProvider>
        </SnackbarProvider>
    );
}

export default RTDBApp;
