import React, { useDeferredValue, useEffect, useRef, useState } from "react";
import equal from "react-fast-compare"

import { Formex, FormexController, getIn, useCreateFormex } from "@edumetz16/firecms_formex";
import {
    DEFAULT_FIELD_CONFIGS,
    DeleteConfirmationDialog,
    PropertyConfigId,
    getFieldConfig,
    getFieldId,
    isPropertyBuilder,
    isValidRegExp,
    mergeDeep,
    Property,
    PropertyConfig,
    PropertyConfigBadge,
} from "@edumetz16/firecms_core";
import {
    Button,
    cn,
    DeleteIcon,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    InfoLabel,
    Select,
    Typography
} from "@edumetz16/firecms_ui";
import { EnumPropertyField } from "./properties/EnumPropertyField";
import { StoragePropertyField } from "./properties/StoragePropertyField";
import { MapPropertyField } from "./properties/MapPropertyField";
import { RepeatPropertyField } from "./properties/RepeatPropertyField";
import { CommonPropertyFields } from "./properties/CommonPropertyFields";
import { StringPropertyField } from "./properties/StringPropertyField";
import { BooleanPropertyField } from "./properties/BooleanPropertyField";
import { BlockPropertyField } from "./properties/BlockPropertyField";
import { NumberPropertyField } from "./properties/NumberPropertyField";
import { ReferencePropertyField } from "./properties/ReferencePropertyField";
import { DateTimePropertyField } from "./properties/DateTimePropertyField";
import { AdvancedPropertyValidation } from "./properties/advanced/AdvancedPropertyValidation";
import { editableProperty } from "../../utils/entities";
import { KeyValuePropertyField } from "./properties/KeyValuePropertyField";
import { updatePropertyFromWidget } from "./utils/update_property_for_widget";
import { PropertySelectItem } from "./PropertySelectItem";
import { UrlPropertyField } from "./properties/UrlPropertyField";
import { supportedFields } from "./utils/supported_fields";

export type PropertyWithId = Property & {
    id?: string
};

export type OnPropertyChangedParams = {
    id?: string,
    property: Property,
    namespace?: string,
    previousId?: string
};

export type PropertyFormProps = {
    includeIdAndName?: boolean;
    existingProperty: boolean;
    autoUpdateId?: boolean;
    autoOpenTypeSelect: boolean;
    inArray: boolean;
    propertyKey?: string;
    propertyNamespace?: string;
    property?: Property;
    onPropertyChanged?: (params: OnPropertyChangedParams) => void;
    onPropertyChangedImmediate?: boolean;
    onDelete?: (id?: string, namespace?: string) => void;
    onError?: (id: string, namespace?: string, error?: Record<string, any>) => void;
    initialErrors?: Record<string, any>;
    existingPropertyKeys?: string[];
    forceShowErrors?: boolean;
    allowDataInference: boolean;
    getData?: () => Promise<object[]>;
    getController?: (formex: FormexController<PropertyWithId>) => void;
    propertyConfigs: Record<string, PropertyConfig>;
    collectionEditable: boolean;
};

export const PropertyForm = React.memo(
    function PropertyForm(props: PropertyFormProps) {

        const {
            includeIdAndName = true,
            autoOpenTypeSelect,
            existingProperty,
            autoUpdateId,
            inArray,
            propertyKey,
            existingPropertyKeys,
            propertyNamespace,
            property,
            onPropertyChanged,
            onPropertyChangedImmediate = true,
            onDelete,
            onError,
            initialErrors,
            forceShowErrors,
            allowDataInference,
            getController,
            getData,
            propertyConfigs,
            collectionEditable
        } = props;

        const initialValue: PropertyWithId = {
            id: "",
            name: ""
        } as PropertyWithId;

        const disabled = (Boolean(property && !editableProperty(property)) && !collectionEditable);

        const lastSubmittedProperty = useRef<OnPropertyChangedParams | undefined>(property ? {
            id: propertyKey,
            previousId: propertyKey,
            property
        } : undefined);

        const doOnPropertyChanged = ({
                                         id,
                                         property
                                     }: OnPropertyChangedParams) => {
            const params = {
                id,
                previousId: lastSubmittedProperty.current?.id,
                property,
                namespace: propertyNamespace
            };
            lastSubmittedProperty.current = params;
            onPropertyChanged?.(params);
        };

        const formexController = useCreateFormex<PropertyWithId>({
            initialValues: property
                ? { id: propertyKey, ...property } as PropertyWithId
                : initialValue,
            initialErrors,
            validateOnChange: true,
            validateOnInitialRender: true,
            onSubmit: (newPropertyWithId, controller) => {
                console.debug("onSubmit", newPropertyWithId);
                const {
                    id,
                    ...property
                } = newPropertyWithId;
                doOnPropertyChanged({
                    id,
                    property: { ...property, editable: property.editable ?? true }
                });
                if (!existingProperty)
                    controller.resetForm({ values: initialValue });
            },
            validation: (values) => {
                const errors: Record<string, any> = {};
                if (includeIdAndName) {
                    if (!values.name) {
                        errors.name = "Required";
                    } else {
                        const nameError = validateName(values.name);
                        if (nameError)
                            errors.name = nameError;
                    }
                    if (!values.id) {
                        errors.id = "Required";
                    } else {
                        const idError = validateId(values.id, existingPropertyKeys);
                        if (idError)
                            errors.id = idError;
                    }
                }

                if (values.dataType === "string") {
                    if (values.validation?.matches && !isValidRegExp(values.validation?.matches.toString())) {
                        errors.validation = {
                            matches: "Invalid regular expression"
                        }
                    }
                }
                if (values.dataType === "reference" && !values.path) {
                    errors.path = "You must specify a target collection for the field";
                }
                if (values.propertyConfig === "repeat") {
                    if (!(values as any).of) {
                        errors.of = "You need to specify a repeat field";
                    }
                }
                if (values.propertyConfig === "block") {
                    if (!(values as any).oneOf) {
                        errors.oneOf = "You need to specify the properties of this block";
                    }
                }
                return errors;
            }
        });

        useEffect(() => {
            getController?.(formexController);
        }, [formexController, getController]);

        return <Formex value={formexController}>
            <PropertyEditFormFields
                onPropertyChanged={onPropertyChangedImmediate
                    ? doOnPropertyChanged
                    : undefined}
                onDelete={onDelete}
                includeIdAndTitle={includeIdAndName}
                propertyNamespace={propertyNamespace}
                onError={onError}
                showErrors={forceShowErrors || formexController.submitCount > 0}
                existing={existingProperty}
                autoUpdateId={autoUpdateId}
                inArray={inArray}
                autoOpenTypeSelect={autoOpenTypeSelect}
                disabled={disabled}
                getData={getData}
                allowDataInference={allowDataInference}
                propertyConfigs={propertyConfigs}
                collectionEditable={collectionEditable}
                {...formexController}/>
        </Formex>;
    }, (a, b) =>
        a.getData === b.getData &&
        a.propertyKey === b.propertyKey &&
        a.propertyNamespace === b.propertyNamespace &&
        a.includeIdAndName === b.includeIdAndName &&
        a.autoOpenTypeSelect === b.autoOpenTypeSelect &&
        a.autoUpdateId === b.autoUpdateId &&
        a.existingPropertyKeys === b.existingPropertyKeys &&
        a.existingProperty === b.existingProperty
);

export function PropertyFormDialog({
                                       open,
                                       onCancel,
                                       onOkClicked,
                                       onPropertyChanged,
                                       getData,
                                       collectionEditable,
                                       ...formProps
                                   }: PropertyFormProps & {
    open?: boolean;
    onOkClicked?: () => void;
    onCancel?: () => void;
}) {
    const formexRef = useRef<FormexController<PropertyWithId>>();
    const getController = (helpers: FormexController<PropertyWithId>) => {
        formexRef.current = helpers;
    };

    return <Dialog
        open={open ?? false}
        maxWidth={"xl"}
        fullWidth={true}
    >
        <form noValidate={true}
              autoComplete={"off"}
              onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  formexRef.current?.handleSubmit(e)
              }}>
            <DialogContent>
                <PropertyForm {...formProps}
                              onPropertyChanged={(params) => {
                                  onPropertyChanged?.(params);
                                  onOkClicked?.();
                              }}
                              collectionEditable={collectionEditable}
                              onPropertyChangedImmediate={false}
                              getController={getController}
                              getData={getData}
                />
            </DialogContent>

            <DialogActions>

                {onCancel && <Button
                    variant={"text"}
                    onClick={() => {
                        onCancel();
                        formexRef.current?.resetForm();
                    }}>
                    Cancel
                </Button>}

                <Button variant="outlined"
                        type={"submit"}
                        color="primary">
                    Ok
                </Button>
            </DialogActions>
        </form>
    </Dialog>;

}

function PropertyEditFormFields({
                                    values,
                                    errors,
                                    setValues,
                                    existing,
                                    autoUpdateId = false,
                                    autoOpenTypeSelect,
                                    includeIdAndTitle,
                                    onPropertyChanged,
                                    onDelete,
                                    propertyNamespace,
                                    onError,
                                    showErrors,
                                    disabled,
                                    inArray,
                                    getData,
                                    allowDataInference,
                                    propertyConfigs,
                                    collectionEditable
                                }: {
    includeIdAndTitle?: boolean;
    existing: boolean;
    autoUpdateId?: boolean;
    autoOpenTypeSelect: boolean;
    propertyNamespace?: string;
    onPropertyChanged?: (params: OnPropertyChangedParams) => void;
    onDelete?: (id?: string, namespace?: string) => void;
    onError?: (id: string, namespace?: string, error?: Record<string, any>) => void;
    showErrors: boolean;
    inArray: boolean;
    disabled: boolean;
    getData?: () => Promise<object[]>;
    allowDataInference: boolean;
    propertyConfigs: Record<string, PropertyConfig>;
    collectionEditable: boolean;
} & FormexController<PropertyWithId>) {

    const [selectOpen, setSelectOpen] = useState(autoOpenTypeSelect);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedFieldConfigId, setSelectedFieldConfigId] = useState<string | undefined>(values?.dataType ? getFieldId(values) : undefined);

    const allSupportedFields = Object.entries(supportedFields).concat(Object.entries(propertyConfigs));

    const displayedWidgets = inArray
        ? allSupportedFields.filter(([_, propertyConfig]) => !isPropertyBuilder(propertyConfig.property) && propertyConfig.property?.dataType !== "array")
        : allSupportedFields;

    const deferredValues = useDeferredValue(values);
    const nameFieldRef = useRef<HTMLInputElement>(null);

    const lastSubmittedProperty = useRef<object>(values);

    const selectedWidgetError = showErrors && getIn(errors, "selectedWidget");

    useEffect(() => {
        if (onPropertyChanged) {
            if ((!includeIdAndTitle || deferredValues.id)) {
                const {
                    id,
                    ...property
                } = deferredValues;
                if (!equal(deferredValues, lastSubmittedProperty.current)) {
                    onPropertyChanged({
                        id,
                        property,
                        namespace: propertyNamespace
                    });
                    lastSubmittedProperty.current = deferredValues;
                }
            }
        }
    }, [deferredValues, includeIdAndTitle, propertyNamespace]);

    useEffect(() => {
        if (values?.id && onError) {
            onError(values?.id, propertyNamespace, errors);
        }
    }, [errors, propertyNamespace, values?.id]);

    const onWidgetSelectChanged = (newSelectedWidgetId: PropertyConfigId) => {
        setSelectedFieldConfigId(newSelectedWidgetId);
        setValues(updatePropertyFromWidget(values, newSelectedWidgetId, propertyConfigs));
        // Ugly hack to autofocus the name field
        setTimeout(() => {
            nameFieldRef.current?.focus();
        }, 0);
    };

    let childComponent;
    if (selectedFieldConfigId === "text_field" ||
        selectedFieldConfigId === "multiline" ||
        selectedFieldConfigId === "markdown" ||
        selectedFieldConfigId === "email") {
        childComponent =
            <StringPropertyField widgetId={selectedFieldConfigId}
                                 disabled={disabled}
                                 showErrors={showErrors}/>;
    } else if (selectedFieldConfigId === "url") {
        childComponent =
            <UrlPropertyField disabled={disabled}
                              showErrors={showErrors}/>;
    } else if (selectedFieldConfigId === "select" ||
        selectedFieldConfigId === "number_select") {
        childComponent = <EnumPropertyField
            multiselect={false}
            allowDataInference={allowDataInference}
            updateIds={!existing}
            disabled={disabled}
            getData={getData}
            showErrors={showErrors}/>;
    } else if (selectedFieldConfigId === "multi_select" ||
        selectedFieldConfigId === "multi_number_select") {
        childComponent = <EnumPropertyField
            multiselect={true}
            updateIds={!existing}
            disabled={disabled}
            allowDataInference={allowDataInference}
            getData={getData}
            showErrors={showErrors}/>;
    } else if (selectedFieldConfigId === "file_upload") {
        childComponent =
            <StoragePropertyField existing={existing}
                                  multiple={false}
                                  disabled={disabled}/>;
    } else if (selectedFieldConfigId === "multi_file_upload") {
        childComponent =
            <StoragePropertyField existing={existing}
                                  multiple={true}
                                  disabled={disabled}/>;
    } else if (selectedFieldConfigId === "switch") {
        childComponent = <BooleanPropertyField disabled={disabled}/>;
    } else if (selectedFieldConfigId === "number_input") {
        childComponent = <NumberPropertyField disabled={disabled}/>;
    } else if (selectedFieldConfigId === "group") {
        childComponent =
            <MapPropertyField disabled={disabled} getData={getData} allowDataInference={allowDataInference}
                              collectionEditable={collectionEditable}
                              propertyConfigs={propertyConfigs}/>;
    } else if (selectedFieldConfigId === "block") {
        childComponent =
            <BlockPropertyField disabled={disabled} getData={getData} allowDataInference={allowDataInference}
                                collectionEditable={collectionEditable}
                                propertyConfigs={propertyConfigs}/>;
    } else if (selectedFieldConfigId === "reference") {
        childComponent =
            <ReferencePropertyField showErrors={showErrors}
                                    existing={existing}
                                    multiple={false}
                                    disabled={disabled}/>;
    } else if (selectedFieldConfigId === "date_time") {
        childComponent = <DateTimePropertyField disabled={disabled}/>;
    } else if (selectedFieldConfigId === "multi_references") {
        childComponent =
            <ReferencePropertyField showErrors={showErrors}
                                    existing={existing}
                                    multiple={true}
                                    disabled={disabled}/>;
    } else if (selectedFieldConfigId === "repeat") {
        childComponent =
            <RepeatPropertyField showErrors={showErrors}
                                 existing={existing}
                                 getData={getData}
                                 allowDataInference={allowDataInference}
                                 disabled={disabled}
                                 collectionEditable={collectionEditable}
                                 propertyConfigs={propertyConfigs}/>;
    } else if (selectedFieldConfigId === "key_value") {
        childComponent =
            <KeyValuePropertyField disabled={disabled}/>;
    } else {
        childComponent = null;
    }

    return (
        <>
            {disabled && <InfoLabel mode={"warn"}>
                <Typography>This property can&apos;t be edited</Typography>
                <Typography variant={"caption"}>
                    You may not have permission to
                    edit it or it is defined in code with no <code>editable</code> flag
                </Typography>
            </InfoLabel>}

            <div className="flex mt-2 justify-between">
                <div className={"w-full flex flex-col gap-2"}>
                    <Select
                        // className={"w-full"}
                        error={Boolean(selectedWidgetError)}
                        value={selectedFieldConfigId ?? ""}
                        placeholder={"Select a property widget"}
                        open={selectOpen}
                        onOpenChange={setSelectOpen}
                        position={"item-aligned"}
                        disabled={disabled}
                        renderValue={(value) => {
                            if (!value) {
                                return <em>Select a property
                                    widget</em>;
                            }
                            const key = value as PropertyConfigId;
                            const propertyConfig = DEFAULT_FIELD_CONFIGS[key] ?? propertyConfigs[key];
                            const baseProperty = propertyConfig.property;
                            const baseFieldConfig = baseProperty && !isPropertyBuilder(baseProperty) ? getFieldConfig(baseProperty, propertyConfigs) : undefined;
                            const optionDisabled = isPropertyBuilder(baseProperty) || (existing && baseProperty.dataType !== values?.dataType);
                            const computedFieldConfig = baseFieldConfig ? mergeDeep(baseFieldConfig, propertyConfig) : propertyConfig;
                            return <div
                                onClick={(e) => {
                                    if (optionDisabled) {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }
                                }}
                                className={cn(
                                    "flex items-center",
                                    optionDisabled ? "w-full pointer-events-none opacity-50" : "")}>
                                <div className={"mr-8"}>
                                    <PropertyConfigBadge propertyConfig={computedFieldConfig}/>
                                </div>
                                <div className={"flex flex-col items-start text-base text-left"}>
                                    <div>{computedFieldConfig.name}</div>
                                    <Typography variant={"caption"}
                                                color={"disabled"}>
                                        {optionDisabled ? "You can only switch to widgets that use the same data type" : computedFieldConfig.description}
                                    </Typography>
                                </div>
                            </div>
                        }}
                        onValueChange={(value) => {
                            onWidgetSelectChanged(value as PropertyConfigId);
                        }}>
                        {displayedWidgets.map(([key, propertyConfig]) => {
                            const baseProperty = propertyConfig.property;
                            const optionDisabled = existing && !isPropertyBuilder(baseProperty) && baseProperty.dataType !== values?.dataType;
                            return <PropertySelectItem
                                key={key}
                                value={key}
                                optionDisabled={optionDisabled}
                                propertyConfig={propertyConfig}
                                existing={existing}/>;
                        })}
                    </Select>

                    {selectedWidgetError &&
                        <Typography variant="caption"
                                    className={"ml-3.5"}
                                    color={"error"}>Required</Typography>}

                    {/*<Typography variant="caption" className={"ml-3.5"}>Define your own custom properties and*/}
                    {/*    components</Typography>*/}

                </div>

                {onDelete && values?.id &&
                    <IconButton
                        variant={"ghost"}
                        className="m-4"
                        disabled={disabled}
                        onClick={() => setDeleteDialogOpen(true)}>
                        <DeleteIcon/>
                    </IconButton>}
            </div>

            <div className={"grid grid-cols-12 gap-y-12 mt-8 mb-8"}>
                {includeIdAndTitle &&
                    <CommonPropertyFields showErrors={showErrors}
                                          disabledId={existing}
                                          isNewProperty={!existing}
                                          disabled={disabled}
                                          autoUpdateId={autoUpdateId}
                                          ref={nameFieldRef}/>}

                {childComponent}

                <div className={"col-span-12"}>
                    <AdvancedPropertyValidation disabled={disabled}/>
                </div>
            </div>

            {onDelete &&
                <DeleteConfirmationDialog open={deleteDialogOpen}
                                          onAccept={() => onDelete(values?.id, propertyNamespace)}
                                          onCancel={() => setDeleteDialogOpen(false)}
                                          title={<div>Delete this property?</div>}
                                          body={
                                              <div> This will <b>not delete any
                                                  data</b>, only modify the
                                                  collection.</div>
                                          }/>}

        </>
    );
}

const idRegEx = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function validateId(value?: string, existingPropertyKeys?: string[]) {

    let error;
    if (!value) {
        error = "You must specify an id for the field";
    }
    if (value && !value.match(idRegEx)) {
        error = "The id can only contain letters, numbers and underscores (_), and not start with a number";
    }
    if (value && existingPropertyKeys && existingPropertyKeys.includes(value)) {
        error = "There is another field with this ID already";
    }
    return error;
}

function validateName(value: string) {
    let error;
    if (!value) {
        error = "You must specify a title for the field";
    }
    return error;
}
