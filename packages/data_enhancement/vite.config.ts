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
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "FireCMS",
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
            "@edumetz16/firecms_core": path.resolve(__dirname, "../firecms_core/src"),
            "@edumetz16/firecms_ui": path.resolve(__dirname, "../ui/src"),
        }
    },
    plugins: [react()]
}));
