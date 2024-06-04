// @ts-ignore
import path from "path";

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
    const build = command === "build";
    return ({
        esbuild: {
            logOverride: { "this-is-undefined-in-esm": "silent" }
        },
        plugins: [
            react(),
            federation({
                name: "remote_app",
                filename: "remoteEntry.js",
                exposes: {
                    "./config": "./src/index"
                },
                shared: ["react", "react-dom",
                    ...(build
                        ? [
                            "@edumetz16/firecms_cloud",
                            "@edumetz16/firecms_core",
                            "@edumetz16/firecms_firebase",
                            "@edumetz16/firecms_ui",
                            "@firebase/firestore",
                            "@firebase/app",
                            "@firebase/functions",
                            "@firebase/auth",
                            "@firebase/storage",
                            "@firebase/analytics",
                            "@firebase/remote-config",
                            "@firebase/app-check"
                        ]
                        : [])
                ]
            })
        ],
        build: {
            modulePreload: false,
            target: "esnext",
            minify: false,
            cssCodeSplit: false,
        },
        resolve: {
            alias: {
                "@edumetz16/firecms_cloud": path.resolve(__dirname, "../../packages/firecms_cloud/src"),
                "@edumetz16/firecms_formex": path.resolve(__dirname, "../../packages/formex/src"),
                "@edumetz16/firecms_core": path.resolve(__dirname, "../../packages/firecms_core/src"),
                "@edumetz16/firecms_ui": path.resolve(__dirname, "../../packages/ui/src"),
                "@edumetz16/firecms_firebase": path.resolve(__dirname, "../../packages/firebase_firecms/src"),
                "@edumetz16/firecms_data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src"),
                "@edumetz16/firecms_data_import_export": path.resolve(__dirname, "../../packages/data_import_export/src"),
                "@edumetz16/firecms_schema_inference": path.resolve(__dirname, "../../packages/schema_inference/src"),
                "@edumetz16/firecms_collection_editor": path.resolve(__dirname, "../../packages/collection_editor/src"),
                "@edumetz16/firecms_user_management": path.resolve(__dirname, "../../packages/user_management/src")
            }
        }
    });
})
