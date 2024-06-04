// @ts-ignore
import path from "path";
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        minify: true,
        outDir: "./build",
        target: "esnext",
        sourcemap: true
    },
    optimizeDeps: { include: ["react/jsx-runtime"] },
    plugins: [
        react({})
    ],
    resolve: {
        alias: {
            "@edumetz16/firecms_core": path.resolve(__dirname, "../../packages/firecms_core/src"),
            "@edumetz16/firecms_ui": path.resolve(__dirname, "../../packages/ui/src"),
            "@edumetz16/firecms_formex": path.resolve(__dirname, "../../packages/formex/src"),
            "@edumetz16/firecms_editor": path.resolve(__dirname, "../../packages/editor/src"),
            "@edumetz16/firecms_firebase": path.resolve(__dirname, "../../packages/firebase_firecms/src"),
            "@edumetz16/firecms_data_enhancement": path.resolve(__dirname, "../../packages/data_enhancement/src"),
            "@edumetz16/firecms_data_import_export": path.resolve(__dirname, "../../packages/data_import_export/src"),
            "@edumetz16/firecms_schema_inference": path.resolve(__dirname, "../../packages/schema_inference/src"),
            "@edumetz16/firecms_collection_editor": path.resolve(__dirname, "../../packages/collection_editor/src"),
            "@edumetz16/firecms_user_management": path.resolve(__dirname, "../../packages/user_management/src")
        }
    }
})
