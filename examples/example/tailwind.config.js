import fireCMSConfig from "@edumetz16/firecms_ui/tailwind.config.js";

export default {
    presets: [fireCMSConfig],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../../packages/**/src/**/*.{js,ts,jsx,tsx}",
        "../../node_modules/firecms/src/**/*.{js,ts,jsx,tsx}",
        "../../node_modules/@edumetz16/firecms_**/src/**/*.{js,ts,jsx,tsx}",
    ],
};
