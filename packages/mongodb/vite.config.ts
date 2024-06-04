// @ts-ignore
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"

const isExternal = (id: string) => {
    return !id.startsWith(".") && !path.isAbsolute(id);
};

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "FireCMS PRO",
            fileName: (format) => `index.${format}.js`
        },
        target: "esnext",
        sourcemap: true,
        rollupOptions: {
            external: isExternal
        }
    },
    resolve: {
        alias: {
            "@edumetz16/firecms_firebase": path.resolve(__dirname, "../firebase_firecms/src"),
            "@edumetz16/firecms_ui": path.resolve(__dirname, "../ui/src"),
            "@edumetz16/firecms_core": path.resolve(__dirname, "../firecms_core/src"),
            "@edumetz16/firecms_data_import_export": path.resolve(__dirname, "../data_import_export/src"),
        }
    },
    plugins: [react({})]
}));
