import React, { useCallback, useEffect, useState } from "react";

import { Field, useFormex } from "@edumetz16/firecms_formex";

import { FieldHelperText, FormikArrayContainer, LabelWithIcon } from "../components";
import { PropertyFieldBinding } from "../PropertyFieldBinding";
import { EnumValuesChip } from "../../preview";
import { FieldProps, FormContext, PropertyFieldBindingProps, PropertyOrBuilder } from "../../types";
import { getDefaultValueFor, getIconForProperty, } from "../../util";
import { DEFAULT_ONE_OF_TYPE, DEFAULT_ONE_OF_VALUE } from "../../util/common";
import { cn, ExpandablePanel, paperMixin, Select, SelectItem, Typography } from "@edumetz16/firecms_ui";
import { useClearRestoreValue } from "../useClearRestoreValue";

/**
 * If the `oneOf` property is specified, this fields render each array entry as
 * a `type` select and the corresponding field widget to the selected `type.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function BlockFieldBinding<T extends Array<any>>({
                                                            propertyKey,
                                                            value,
                                                            error,
                                                            showError,
                                                            isSubmitting,
                                                            setValue,
                                                            setFieldValue,
                                                            tableMode,
                                                            property,
                                                            includeDescription,
                                                            underlyingValueHasChanged,
                                                            context,
                                                            disabled
                                                        }: FieldProps<T>) {

    if (!property.oneOf)
        throw Error("ArrayOneOfField misconfiguration. Property `oneOf` not set");

    const expanded = property.expanded === undefined ? true : property.expanded;
    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const [lastAddedId, setLastAddedId] = useState<number | undefined>();

    const buildEntry = useCallback((index: number, internalId: number) => {
        return <BlockEntry
            key={`array_one_of_${index}`}
            name={`${propertyKey}.${index}`}
            index={index}
            value={value[index]}
            typeField={property.oneOf!.typeField ?? DEFAULT_ONE_OF_TYPE}
            valueField={property.oneOf!.valueField ?? DEFAULT_ONE_OF_VALUE}
            properties={property.oneOf!.properties}
            autoFocus={internalId === lastAddedId}
            context={context}/>;
    }, [context, lastAddedId, property.oneOf, propertyKey, value]);

    const title = (
        <LabelWithIcon icon={getIconForProperty(property, "small")}
                       required={property.validation?.required}
                       title={property.name}
                       className={"text-text-secondary dark:text-text-secondary-dark"}/>
    );

    const firstOneOfKey = Object.keys(property.oneOf.properties)[0];
    const body = <FormikArrayContainer value={value}
                                       name={propertyKey}
                                       addLabel={property.name ? "Add entry to " + property.name : "Add entry"}
                                       buildEntry={buildEntry}
                                       onInternalIdAdded={setLastAddedId}
                                       disabled={isSubmitting || Boolean(property.disabled)}
                                       includeAddButton={!property.disabled}
                                       setFieldValue={setFieldValue}
                                       newDefaultEntry={{
                                           [property.oneOf!.typeField ?? DEFAULT_ONE_OF_TYPE]: firstOneOfKey,
                                           [property.oneOf!.valueField ?? DEFAULT_ONE_OF_VALUE]: getDefaultValueFor(property.oneOf.properties[firstOneOfKey])
                                       }}/>;
    return (

        <>

            {!tableMode &&
                <ExpandablePanel
                    className={"px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2"}
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

interface BlockEntryProps {
    name: string;
    index: number;
    value: any;
    /**
     * Name of the field to use as the discriminator for type
     * Defaults to `type`
     */
    typeField: string;
    /**
     * Name of the  field to use as the value
     * Defaults to `value`
     */
    valueField: string;

    autoFocus: boolean;
    /**
     * Record of properties, where the key is the `type` and the value
     * is the corresponding property
     */
    properties: Record<string, PropertyOrBuilder>;

    /**
     * Additional values related to the state of the form or the entity
     */
    context: FormContext<any>;

}

function BlockEntry({
                        name,
                        index,
                        value,
                        typeField,
                        valueField,
                        properties,
                        autoFocus,
                        context
                    }: BlockEntryProps) {

    const type = value && value[typeField];
    const [typeInternal, setTypeInternal] = useState<string | undefined>(type ?? undefined);

    const formex = useFormex();

    useEffect(() => {
        if (!type) {
            updateType(Object.keys(properties)[0]);
        }
    }, []);

    useEffect(() => {
        if (type !== typeInternal) {
            setTypeInternal(type);
        }
    }, [type]);

    const property = typeInternal ? properties[typeInternal] : undefined;

    const enumValuesConfigs = Object.entries(properties)
        .map(([key, property]) => ({
            id: key,
            label: property.name ?? key
        }));

    const typeFieldName = `${name}.${typeField}`;
    const valueFieldName = `${name}.${valueField}`;

    const fieldProps: PropertyFieldBindingProps<any, any> | undefined = property
        ? {
            propertyKey: valueFieldName,
            property,
            context,
            autoFocus,
            partOfArray: false,
            partOfBlock: true,
            tableMode: false
        }
        : undefined;

    const updateType = (newType: any) => {
        const newSelectedProperty = newType ? properties[newType] : undefined;
        setTypeInternal(newType);
        formex.setFieldTouched(typeFieldName, true);
        formex.setFieldValue(typeFieldName, newType);
        formex.setFieldValue(valueFieldName, newSelectedProperty ? getDefaultValueFor(newSelectedProperty) : null);
    };

    return (
        <div className={cn(paperMixin, "bg-transparent p-4 my-4 py-8")}>

            <Field
                name={typeFieldName}
            >
                {(fieldProps) => {
                    const value1 = fieldProps.field.value !== undefined && fieldProps.field.value !== null ? fieldProps.field.value as string : "";
                    return (
                        <>
                            <Select
                                className="mb-2"
                                placeholder={<Typography variant={"caption"}
                                                         className={"px-4 py-2 font-medium"}>Type</Typography>}
                                size={"small"}
                                position={"item-aligned"}
                                value={value1}
                                renderValue={(enumKey: any) =>
                                    <EnumValuesChip
                                        enumKey={enumKey}
                                        enumValues={enumValuesConfigs}
                                        size={"small"}/>
                                }
                                onValueChange={(value) => {
                                    updateType(value);
                                }}>
                                {enumValuesConfigs.map((enumConfig) => (
                                    <SelectItem
                                        key={enumConfig.id}
                                        value={String(enumConfig.id)}>
                                        <EnumValuesChip
                                            enumKey={enumConfig.id}
                                            enumValues={enumValuesConfigs}
                                            size={"small"}/>
                                    </SelectItem>)
                                )}
                            </Select>
                        </>
                    );
                }
                }
            </Field>

            {fieldProps && (
                // It is important to use this key to force a re-render of the field on type change
                <PropertyFieldBinding key={`form_control_${name}_${typeInternal}`} {...fieldProps}/>
            )}

        </div>
    );
}
