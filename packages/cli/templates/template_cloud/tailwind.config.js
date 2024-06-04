import fireCMSConfig from "@edumetz16/firecms_ui/tailwind.config.js";

export default {
  presets: [fireCMSConfig],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@edumetz16/firecms_**/*.{js,ts,jsx,tsx}"
  ],
};
