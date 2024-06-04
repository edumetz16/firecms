import { buildCollection, buildEnumValues } from "@edumetz16/firecms_core";

const locales = buildEnumValues({
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "de-DE": "German"
});

export const localeCollection = buildCollection({
    id: "locale",
    path: "locale",
    customId: locales,
    name: "Locales",
    singularName: "Locales",
    properties: {
        name: {
            name: "Title",
            validation: { required: true },
            dataType: "string"
        },
        selectable: {
            name: "Selectable",
            description: "Is this locale selectable",
            dataType: "boolean"
        }
    }
});
