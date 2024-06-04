// @ts-ignore
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"

const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        target: "esnext",
        modulePreload: false,
        cssCodeSplit: false,
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "FireCMS",
            fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
            external: isExternal
        }
    },
    resolve: {
        alias: {
            "@edumetz16/firecms_core": path.resolve(__dirname, "../firecms_core/src"),
            "@edumetz16/firecms_ui": path.resolve(__dirname, "../ui/src"),
            "@edumetz16/firecms_formex": path.resolve(__dirname, "../formex/src"),
            "@edumetz16/firecms_firebase": path.resolve(__dirname, "../firebase_firecms/src"),
            "@edumetz16/firecms_user_management": path.resolve(__dirname, "../user_management/src"),
            "@edumetz16/firecms_schema_inference": path.resolve(__dirname, "../schema_inference/src"),
            "@edumetz16/firecms_collection_editor": path.resolve(__dirname, "../collection_editor/src"),
            "@edumetz16/firecms_collection_editor_firebase": path.resolve(__dirname, "../collection_editor_firebase/src"),
            "@edumetz16/firecms_data_enhancement": path.resolve(__dirname, "../data_enhancement/src"),
            "@edumetz16/firecms_data_import_export": path.resolve(__dirname, "../data_import_export/src"),
            "@edumetz16/firecms_datatalk": path.resolve(__dirname, "../datatalk/src"),
        }
    },
    plugins: [react({})]
}));
