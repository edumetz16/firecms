import React, { useCallback, useMemo } from "react";
import { Entity, EntityCollection, EntityReference, FieldProps, ResolvedProperty } from "../../types";
import { ReferencePreview } from "../../preview";
import { FieldHelperText, FormikArrayContainer, LabelWithIcon } from "../components";
import { ErrorView } from "../../components";
import { getIconForProperty, getReferenceFrom } from "../../util";

import { useNavigationController, useReferenceDialog } from "../../hooks";
import { Button, cn, ExpandablePanel, fieldBackgroundMixin } from "@edumetz16/firecms_ui";
import { useClearRestoreValue } from "../useClearRestoreValue";

type ArrayOfReferencesFieldProps = FieldProps<EntityReference[]>;

/**
 * This field allows selecting multiple references.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function ArrayOfReferencesFieldBinding({
                                                  propertyKey,
                                                  value,
                                                  error,
                                                  showError,
                                                  disabled,
                                                  isSubmitting,
                                                  tableMode,
                                                  property,
                                                  includeDescription,
                                                  setValue,
                                                  setFieldValue
                                              }: ArrayOfReferencesFieldProps) {

    const ofProperty = property.of as ResolvedProperty;
    if (ofProperty.dataType !== "reference") {
        throw Error("ArrayOfReferencesField expected a property containing references");
    }

    const expanded = property.expanded === undefined ? true : property.expanded;
    const selectedEntityIds = value && Array.isArray(value) ? value.map((ref) => ref.id) : [];

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const navigationController = useNavigationController();
    const collection: EntityCollection | undefined = useMemo(() => {
        return ofProperty.path ? navigationController.getCollection(ofProperty.path) : undefined;
    }, [ofProperty.path]);

    if (!collection) {
        throw Error(`Couldn't find the corresponding collection for the path: ${ofProperty.path}`);
    }

    const onMultipleEntitiesSelected = useCallback((entities: Entity<any>[]) => {
        console.debug("onMultipleEntitiesSelected", entities);
        setValue(entities.map(e => getReferenceFrom(e)));
    }, [setValue]);

    const referenceDialogController = useReferenceDialog({
            multiselect: true,
            path: ofProperty.path,
            collection,
            onMultipleEntitiesSelected,
            selectedEntityIds,
            forceFilter: ofProperty.forceFilter
        }
    );

    const onEntryClick = useCallback((e: React.SyntheticEvent) => {
        e.preventDefault();
        referenceDialogController.open();
    }, [referenceDialogController]);

    const buildEntry = useCallback((index: number, internalId: number) => {
        const entryValue = value && value.length > index ? value[index] : undefined;
        if (!entryValue)
            return <div>Internal ERROR</div>;
        return (
                <ReferencePreview
                    key={internalId}
                    disabled={!ofProperty.path}
                    previewProperties={ofProperty.previewProperties}
                    size={"medium"}
                    onClick={onEntryClick}
                    hover={!disabled}
                    reference={entryValue}
                />
        );
    }, [ofProperty.path, ofProperty.previewProperties, value]);

    const title = (
        <LabelWithIcon icon={getIconForProperty(property, "small")}
                       required={property.validation?.required}
                       title={property.name}
                       className={"text-text-secondary dark:text-text-secondary-dark"}/>
    );

    const body = <>
        {!collection && <ErrorView
            error={"The specified collection does not exist. Check console"}/>}

        {collection && <div className={"group"}>

            <FormikArrayContainer value={value}
                                  addLabel={property.name ? "Add reference to " + property.name : "Add reference"}
                                  name={propertyKey}
                                  buildEntry={buildEntry}
                                  disabled={isSubmitting}
                                  setFieldValue={setFieldValue}
                                  newDefaultEntry={property.of.defaultValue}/>

            <Button
                className="my-4 justify-center text-left"
                variant="outlined"
                color="primary"
                disabled={isSubmitting}
                onClick={onEntryClick}>
                Edit {property.name}
            </Button>
        </div>}
    </>;

    return (
        <>

            {!tableMode &&
                <ExpandablePanel
                    titleClassName={fieldBackgroundMixin}
                    className={cn("px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2", fieldBackgroundMixin)}
                    initiallyExpanded={expanded}
                    title={title}>
                    {body}
                </ExpandablePanel>}

            {tableMode && body}

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}
