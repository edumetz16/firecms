// @ts-ignore
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"
import { resolve } from 'path';

const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

export default defineConfig(() => ({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "FireCMS Editor",
            fileName: (format) => `index.${format}.js`
        },
        target: "esnext",
        sourcemap: true,

        rollupOptions: {
            // input: {
            //     index: resolve(__dirname, 'src/components/index.ts'),
            //     extensions: resolve(__dirname, 'src/extensions/index.ts'),
            //     plugins: resolve(__dirname, 'src/plugins/index.ts'),
            // },
            external: isExternal,
            // output: [
            //     {
            //         format: 'cjs',
            //         dir: 'dist',
            //         entryFileNames: '[name].cjs.js',
            //     },
            //     {
            //         format: 'esm',
            //         dir: 'dist',
            //         entryFileNames: '[name].esm.js',
            //     },
            // ],
        },
    },
    resolve: {
        alias: {
            "@edumetz16/firecms_ui": path.resolve(__dirname, "../ui/src"),
            "@edumetz16/firecms_core": path.resolve(__dirname, "../core/src"),
            "@edumetz16/firecms_firebase": path.resolve(__dirname, "../firebase_firecms/src"),
            "@edumetz16/firecms_formex": path.resolve(__dirname, "../formex/src"),
            "@edumetz16/firecms_schema_inference": path.resolve(__dirname, "../schema_inference/src"),
            "@edumetz16/firecms_collection_editor_firebase": path.resolve(__dirname, "../collection_editor_firebase/src"),
            "@edumetz16/firecms_data_import_export": path.resolve(__dirname, "../data_import_export/src"),
        }
    },
    plugins: [
        react({})
    ]
}));
