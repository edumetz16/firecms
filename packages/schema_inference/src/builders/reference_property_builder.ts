import { InferencePropertyBuilderProps } from "../types";
import { findCommonInitialStringInPath } from "../strings";
import { Property } from "@edumetz16/firecms_core";

export function buildReferenceProperty({
                                        totalDocsCount,
                                        valuesResult
                                    }: InferencePropertyBuilderProps): Property {

    const property: Property = {
        dataType: "reference",
        path: findCommonInitialStringInPath(valuesResult) ?? "!!!FIX_ME!!!",
        editable: true
    };

    return property;
}
