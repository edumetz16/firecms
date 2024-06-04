import React, { useCallback, useMemo } from "react";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";
import {
    CircularProgressCenter,
    CMSView,
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
    useFirebaseStorageSource,
    useFirestoreDelegate,
    useInitialiseFirebase
} from "@edumetz16/firecms_firebase";

import { firebaseConfig } from "./firebase_config";
import { productsCollection } from "./collections/products";
import { useDataEnhancementPlugin } from "@edumetz16/firecms_data_enhancement";
import {
    useFirestoreUserManagement,
    userManagementAdminViews,
    useUserManagementPlugin
} from "@edumetz16/firecms_user_management";
import { useImportExportPlugin } from "@edumetz16/firecms_data_import_export";
import { ExampleCMSView } from "./views/ExampleCMSView";
import { useFirestoreCollectionsConfigController } from "@edumetz16/firecms_collection_editor_firebase";
import { mergeCollections, useCollectionEditorPlugin } from "@edumetz16/firecms_collection_editor";

export function App() {

    const name = "My CMS app";

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig
    });

    // Uncomment this to enable App Check
    // const { error: appCheckError } = useAppCheck({
    //     firebaseApp,
    //     options: {
    //         provider: new ReCaptchaEnterpriseProvider(process.env.VITE_RECAPTCHA_SITE_KEY as string)
    //     }
    // });

    /**
     * Controller used to save the collection configuration in Firestore.
     * Note that this is optional and you can define your collections in code.
     */
    const collectionConfigController = useFirestoreCollectionsConfigController({
        firebaseApp
    });

    const collectionsBuilder = useCallback(() => {
        // Here we define a sample collection in code.
        const collections = [
            productsCollection
            // Your collections here
        ];
        // You can merge collections defined in the collection editor (UI) with your own collections
        return mergeCollections(collections, collectionConfigController.collections ?? []);
    }, [collectionConfigController.collections]);

    // Here you define your custom top-level views
    const views: CMSView[] = useMemo(() => ([{
        path: "example",
        name: "Example CMS view",
        view: <ExampleCMSView/>
    }]), []);

    const signInOptions: FirebaseSignInProvider[] = ["google.com", "password"];

    /**
     * Controller used to manage the dark or light color mode
     */
    const modeController = useBuildModeController();

    /**
     * Controller in charge of user management
     */
    const userManagement = useFirestoreUserManagement({
        firebaseApp
    });

    /**
     * Controller for managing authentication
     */
    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions,
        loading: userManagement.loading,
        defineRolesFor: userManagement.defineRolesFor
    });

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    /**
     * Delegate used for fetching and saving data in Firestore
     */
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp
    })

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    /**
     * Use the authenticator to control access to the main view
     */
    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        authController,
        disabled: userManagement.loading,
        authenticator: userManagement.authenticator, // you can define your own authenticator here
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    const navigationController = useBuildNavigationController({
        collections: collectionsBuilder,
        collectionPermissions: userManagement.collectionPermissions,
        views,
        adminViews: userManagementAdminViews,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    /**
     * Data enhancement plugin
     */
    const dataEnhancementPlugin = useDataEnhancementPlugin({
        getConfigForPath: ({ path }) => {
            if (path === "products")
                return true;
            return false;
        }
    });

    /**
     * User management plugin
     */
    const userManagementPlugin = useUserManagementPlugin({ userManagement });

    /**
     * Allow import and export data plugin
     */
    const importExportPlugin = useImportExportPlugin();

    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController
    });

    if (firebaseConfigLoading || !firebaseApp) {
        return <CircularProgressCenter/>;
    }

    if (configError) {
        return <>{configError}</>;
    }

    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>

                <FireCMS
                    navigationController={navigationController}
                    authController={authController}
                    userConfigPersistence={userConfigPersistence}
                    dataSourceDelegate={firestoreDelegate}
                    storageSource={storageSource}
                    plugins={[dataEnhancementPlugin, importExportPlugin, userManagementPlugin, collectionEditorPlugin]}
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
                                component = (
                                    <FirebaseLoginView
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
