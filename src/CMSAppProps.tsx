import React from "react";
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";
import { Authenticator, EntityCollection } from "./models";
import {
    SchemaResolver,
    SchemaSidePanelProps,
    SideEntityPanelProps
} from "./side_dialog/model";

/**
 * Main entry point that defines the CMS configuration
 */
export interface CMSAppProps {
    /**
     * Name of the app, displayed as the main title and in the tab title
     */
    name: string;

    /**
     * Logo to be displayed in the drawer of the CMS
     */
    logo?: string;

    /**
     * List of the views in the CMS. Each view relates to a collection in the
     * root Firestore database. Each of the navigation entries in this field
     * generates an entry in the main menu.
     */
    navigation: EntityCollection[];

    /**
     * Do the users need to log in to access the CMS.
     * You can specify an Authenticator function to discriminate which users can
     * access the CMS or not.
     * If not specified, authentication is enabled but no user restrictions
     * apply
     */
    authentication?: boolean | Authenticator;

    /**
     * List of sign in options that will be displayed in the login
     * view if `authentication` is enabled. You can pass google providers strings,
     * such as `firebase.auth.GoogleAuthProvider.PROVIDER_ID` or full configuration
     * objects such as specified in https://firebase.google.com/docs/auth/web/firebaseui
     * Defaults to Google sign in only.
     */
    signInOptions?: Array<string | any>;

    /**
     * If authentication is enabled, allow the user to access the content
     * without login.
     */
    allowSkipLogin?: boolean;

    /**
     * Custom additional views created by the developer, added to the main
     * navigation
     */
    additionalViews?: AdditionalView[];

    /**
     * Firebase configuration of the project. If you afe deploying the app to
     * Firebase hosting, you don't need to specify this value
     */
    firebaseConfig?: Object;

    /**
     * Optional callback after Firebase has been initialised. Useful for
     * using the local emulator or retrieving the used configuration.
     * @param config
     */
    onFirebaseInit?: (config: object) => void;

    /**
     * Primary color of the theme of the CMS
     */
    primaryColor?: string;

    /**
     * Primary color of the theme of the CMS
     */
    secondaryColor?: string

    /**
     * Font family string
     * e.g.
     * '"Roboto", "Helvetica", "Arial", sans-serif'
     */
    fontFamily?: string

    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    toolbarExtraWidget?: React.ReactNode;

    /**
     * Used to override schemas based on the collection path and entityId.
     * This resolver allows to override the schema for specific entities, or
     * specific collections, app wide. This overrides schemas all through the app.
     *
     * You can also override schemas in place, when using `useSideEntityController`
     */
    schemaResolver?: SchemaResolver;
}


/**
 * Custom additional views created by the developer, added to the main
 * navigation
 */
export interface AdditionalView {
    /**
     * CMS Path
     */
    path: string;

    /**
     * Name of this view
     */
    name: string;

    /**
     * Component to be rendered
     */
    view: React.ReactNode;

    /**
     * Optional field used to group top level navigation entries under a
     * navigation view.
     */
    group?: string;

}