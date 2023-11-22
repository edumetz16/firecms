import React, { useEffect, useMemo, useState } from "react";

import { Field, FormikErrors, getIn, useFormikContext } from "formik";
import {
    AddIcon,
    AutoAwesomeIcon,
    Button,
    CircularProgress,
    cn,
    DebouncedTextField,
    defaultBorderMixin,
    EntityCollection,
    ErrorBoundary,
    PropertyConfig,
    isPropertyBuilder,
    makePropertiesEditable,
    Paper,
    Properties,
    Property,
    PropertyOrBuilder,
    Tooltip,
    Typography,
    useLargeLayout,
    User,
    useSnackbarController,
} from "@firecms/core";

import { getFullId, idToPropertiesPath, namespaceToPropertiesOrderPath } from "./util";
import { OnPropertyChangedParams, PropertyForm, PropertyFormDialog } from "./PropertyEditView";
import { PropertyTree } from "./PropertyTree";
import { PersistedCollection } from "../../types/persisted_collection";

type CollectionEditorFormProps = {
    showErrors: boolean;
    isNewCollection: boolean;
    propertyErrorsRef?: React.MutableRefObject<any>;
    onPropertyError: (propertyKey: string, namespace: string | undefined, error?: FormikErrors<any>) => void;
    setDirty?: (dirty: boolean) => void;
    reservedGroups?: string[];
    extraIcon: React.ReactNode;
    getUser: (uid: string) => User | null;
    getData?: () => Promise<object[]>;
    doCollectionInference: (collection: PersistedCollection<any, string>) => Promise<EntityCollection | null> | undefined;
    customFields: Record<string, PropertyConfig>;
    collectionEditable: boolean;
};

export function CollectionPropertiesEditorForm({
                                                   showErrors,
                                                   isNewCollection,
                                                   propertyErrorsRef,
                                                   onPropertyError,
                                                   setDirty,
                                                   reservedGroups,
                                                   extraIcon,
                                                   getUser,
                                                   getData,
                                                   doCollectionInference,
                                                   customFields,
                                                   collectionEditable
                                               }: CollectionEditorFormProps) {

    const {
        values,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        errors,
        dirty
    } = useFormikContext<PersistedCollection>();

    const snackbarController = useSnackbarController();

    const largeLayout = useLargeLayout("lg");
    const asDialog = !largeLayout

    // index of the selected property within the namespace
    const [selectedPropertyIndex, setSelectedPropertyIndex] = useState<number | undefined>();
    const [selectedPropertyKey, setSelectedPropertyKey] = useState<string | undefined>();
    const [selectedPropertyNamespace, setSelectedPropertyNamespace] = useState<string | undefined>();

    const selectedPropertyFullId = selectedPropertyKey ? getFullId(selectedPropertyKey, selectedPropertyNamespace) : undefined;
    const selectedProperty = selectedPropertyFullId ? getIn(values.properties, selectedPropertyFullId.replaceAll(".", ".properties.")) : undefined;

    const [inferringProperties, setInferringProperties] = useState<boolean>(false);

    const [newPropertyDialogOpen, setNewPropertyDialogOpen] = useState<boolean>(false);
    const [inferredPropertyKeys, setInferredPropertyKeys] = useState<string[]>([]);

    const currentPropertiesOrderRef = React.useRef<{
        [key: string]: string[]
    }>(values.propertiesOrder ? { "": values.propertiesOrder } : {});

    useEffect(() => {
        if (setDirty)
            setDirty(dirty);
    }, [dirty]);

    const inferPropertiesFromData = doCollectionInference
        ? (): void => {
            if (!doCollectionInference)
                return;

            setInferringProperties(true);
            // @ts-ignore
            doCollectionInference(values)
                .then((newCollection) => {

                    if (newCollection)
                        makePropertiesEditable(newCollection.properties as Properties);

                    if (!newCollection) {
                        snackbarController.open({
                            type: "error",
                            message: "Could not infer properties from data",
                        });
                        return;
                    }
                    // find properties in the new collection, not present in the current one
                    const newPropertyKeys = Object.keys(newCollection.properties)
                        .filter((propertyKey) => !values.properties[propertyKey]);
                    if (newPropertyKeys.length === 0) {
                        snackbarController.open({
                            type: "info",
                            message: "No new properties found",
                        });
                        return;
                    }
                    // add them to the current collection
                    const updatedProperties = {
                        ...newPropertyKeys.reduce((acc, propertyKey) => {
                            acc[propertyKey] = newCollection.properties[propertyKey];
                            return acc;
                        }, {} as { [key: string]: PropertyOrBuilder }),
                        ...values.properties,
                    };
                    const updatedPropertiesOrder = [
                        ...newPropertyKeys,
                        ...(values.propertiesOrder ?? [])
                    ];
                    setFieldValue("properties", updatedProperties, false);

                    updatePropertiesOrder(updatedPropertiesOrder);

                    setInferredPropertyKeys(newPropertyKeys);
                })
                .finally(() => {
                    setInferringProperties(false);
                })
        }
        : undefined;

    const getCurrentPropertiesOrder = (namespace?: string) => {
        if (!namespace) return currentPropertiesOrderRef.current[""];
        return currentPropertiesOrderRef.current[namespace] ?? getIn(values, namespaceToPropertiesOrderPath(namespace));
    }

    const updatePropertiesOrder = (newPropertiesOrder: string[], namespace?: string) => {
        const propertiesOrderPath = namespaceToPropertiesOrderPath(namespace);

        setFieldValue(propertiesOrderPath, newPropertiesOrder, false);
        currentPropertiesOrderRef.current[namespace ?? ""] = newPropertiesOrder;

    };

    const deleteProperty = (propertyKey?: string, namespace?: string) => {
        const fullId = propertyKey ? getFullId(propertyKey, namespace) : undefined;
        if (!fullId)
            throw Error("collection editor miss config");

        setFieldValue(idToPropertiesPath(fullId), undefined, false);

        const currentPropertiesOrder = getCurrentPropertiesOrder(namespace);
        const newPropertiesOrder = currentPropertiesOrder.filter((p) => p !== propertyKey);
        updatePropertiesOrder(newPropertiesOrder, namespace);

        setNewPropertyDialogOpen(false);

        setSelectedPropertyIndex(undefined);
        setSelectedPropertyKey(undefined);
        setSelectedPropertyNamespace(undefined);
    };

    const onPropertyMove = (propertiesOrder: string[], namespace?: string) => {
        setFieldValue(namespaceToPropertiesOrderPath(namespace), propertiesOrder, false);
    };

    const onPropertyCreated = ({
                                   id,
                                   property
                               }: {
        id?: string,
        property: Property
    }) => {
        console.log("onPropertyCreated", {
            id,
            property
        })
        if (!id) {
            throw Error("Need to include an ID when creating a new property")
        }
        setFieldValue("properties", {
            ...(values.properties ?? {}),
            [id]: property
        }, false);
        const newPropertiesOrder = [...(values.propertiesOrder ?? Object.keys(values.properties)), id];

        console.log("onPropertyCreated", {
            id,
            property,
            newPropertiesOrder
        })
        updatePropertiesOrder(newPropertiesOrder);

        setNewPropertyDialogOpen(false);
        if (largeLayout) {
            setSelectedPropertyIndex(newPropertiesOrder.indexOf(id));
            setSelectedPropertyKey(id);
        }
        setSelectedPropertyNamespace(undefined);
    };

    const onPropertyChanged = ({
                                   id,
                                   property,
                                   previousId,
                                   namespace
                               }: OnPropertyChangedParams) => {
        const fullId = id ? getFullId(id, namespace) : undefined;
        const propertyPath = fullId ? idToPropertiesPath(fullId) : undefined;

        // If the id has changed we need to a little cleanup
        if (previousId && previousId !== id) {
            const previousFullId = getFullId(previousId, namespace);
            const previousPropertyPath = idToPropertiesPath(previousFullId);

            const currentPropertiesOrder = getCurrentPropertiesOrder(namespace);

            // replace previousId with id in propertiesOrder
            const newPropertiesOrder = currentPropertiesOrder
                .map((p) => p === previousId ? id : p)
                .filter((p) => p !== undefined) as string[];

            updatePropertiesOrder(newPropertiesOrder, namespace);

            if (id) {
                setSelectedPropertyIndex(newPropertiesOrder.indexOf(id));
                setSelectedPropertyKey(id);
            }
            setFieldValue(previousPropertyPath, undefined, false);
            setFieldTouched(previousPropertyPath, false, false);
        }

        if (propertyPath) {
            setFieldValue(propertyPath, property, false);
            setFieldTouched(propertyPath, true, false);
        }

    };

    const onPropertyErrorInternal = (id: string, namespace?: string, error?: FormikErrors<any>) => {
        const propertyPath = id ? getFullId(id, namespace) : undefined;
        console.warn("onPropertyErrorInternal", {
            id,
            namespace,
            error,
            propertyPath
        });
        if (propertyPath) {
            const hasError = error && Object.keys(error).length > 0;
            onPropertyError(id, namespace, hasError ? error : undefined);
            setFieldError(idToPropertiesPath(propertyPath), hasError ? "Property error" : undefined);
        }
    };

    const closePropertyDialog = () => {
        setSelectedPropertyIndex(undefined);
        setSelectedPropertyKey(undefined);
    };

    const initialErrors = selectedPropertyKey && propertyErrorsRef?.current?.properties ? propertyErrorsRef.current.properties[selectedPropertyKey] : undefined;

    const emptyCollection = values?.propertiesOrder === undefined || values.propertiesOrder.length === 0;

    const usedPropertiesOrder = (values.propertiesOrder
        ? values.propertiesOrder
        : Object.keys(values.properties)) as string[];

    const owner = useMemo(() => getUser(values.ownerId), [getUser, values.ownerId]);
    const body = (
        <div className={"grid grid-cols-12 gap-2 h-full bg-gray-50 dark:bg-gray-900"}>
            <div className={cn(
                "p-4 md:p-8 pb-20 md:pb-20",
                "col-span-12 lg:col-span-5 h-full overflow-auto",
                !asDialog && "border-r " + defaultBorderMixin
            )}>

                <div className="flex my-2">

                    <div className="flex-grow mb-4">

                        <Field
                            name={"name"}
                            as={DebouncedTextField}
                            invisible={true}
                            className="-ml-1"
                            inputClassName="text-2xl font-headers"
                            placeholder={"Collection name"}
                            size={"small"}
                            required
                            error={Boolean(errors.name)}/>

                        {owner &&
                            <Typography variant={"body2"}
                                        className={"ml-2"}
                                        color={"secondary"}>
                                Created by {owner.displayName}
                            </Typography>}
                    </div>

                    {extraIcon && <div className="ml-4">
                        {extraIcon}
                    </div>}

                    <div className="ml-1 mt-2 flex flex-row gap-2">
                        {inferPropertiesFromData && <Tooltip title={"Add new properties based on data"}>
                            <Button
                                variant={"text"}
                                disabled={inferringProperties}
                                onClick={inferPropertiesFromData}>
                                {inferringProperties ? <CircularProgress size={"small"}/> : <AutoAwesomeIcon/>}
                            </Button>
                        </Tooltip>}
                        <Tooltip title={"Add new property"}>
                            <Button
                                variant={"outlined"}
                                onClick={() => setNewPropertyDialogOpen(true)}>
                                <AddIcon/>
                            </Button>
                        </Tooltip>
                    </div>
                </div>

                <ErrorBoundary>
                    <PropertyTree
                        className={"pl-8"}
                        onPropertyClick={(propertyKey, namespace) => {
                            setSelectedPropertyIndex(usedPropertiesOrder.indexOf(propertyKey));
                            setSelectedPropertyKey(propertyKey);
                            setSelectedPropertyNamespace(namespace);
                        }}
                        inferredPropertyKeys={inferredPropertyKeys}
                        selectedPropertyKey={selectedPropertyKey ? getFullId(selectedPropertyKey, selectedPropertyNamespace) : undefined}
                        properties={values.properties}
                        additionalFields={values.additionalFields}
                        propertiesOrder={usedPropertiesOrder}
                        onPropertyMove={onPropertyMove}
                        onPropertyRemove={isNewCollection ? deleteProperty : undefined}
                        collectionEditable={collectionEditable}
                        errors={showErrors ? errors : {}}/>
                </ErrorBoundary>

                <Button className={"mt-8 w-full"}
                        color="primary"
                        variant={"outlined"}
                        size={"large"}
                        onClick={() => setNewPropertyDialogOpen(true)}
                        startIcon={<AddIcon/>}>
                    Add new property
                </Button>
            </div>

            {!asDialog &&
                <div className={"col-span-12 lg:col-span-7 ml-2 p-4 md:p-8 h-full overflow-auto pb-20 md:pb-20"}>
                    <Paper
                        className="sticky top-8 p-4 min-h-full border border-transparent w-full flex flex-col justify-center ">

                        {selectedPropertyFullId &&
                            selectedProperty &&
                            !isPropertyBuilder(selectedProperty) &&
                            <PropertyForm
                                inArray={false}
                                key={`edit_view_${selectedPropertyIndex}`}
                                existingProperty={!isNewCollection}
                                autoUpdateId={false}
                                allowDataInference={!isNewCollection}
                                autoOpenTypeSelect={false}
                                propertyKey={selectedPropertyKey}
                                propertyNamespace={selectedPropertyNamespace}
                                property={selectedProperty}
                                onPropertyChanged={onPropertyChanged}
                                onDelete={deleteProperty}
                                onError={onPropertyErrorInternal}
                                forceShowErrors={showErrors}
                                initialErrors={initialErrors}
                                getData={getData}
                                customFields={customFields}
                                collectionEditable={collectionEditable}
                            />}

                        {!selectedProperty &&
                            <Typography variant={"label"} className="flex items-center justify-center h-full">
                                {emptyCollection
                                    ? "Now you can add your first property"
                                    : "Select a property to edit it"}
                            </Typography>}

                        {selectedProperty && isPropertyBuilder(selectedProperty) &&
                            <Typography variant={"label"} className="flex items-center justify-center">
                                {"This property is defined as a property builder in code"}
                            </Typography>}
                    </Paper>
                </div>}

            {asDialog && <PropertyFormDialog
                inArray={false}
                open={selectedPropertyIndex !== undefined}
                key={`edit_view_${selectedPropertyIndex}`}
                autoUpdateId={isNewCollection}
                allowDataInference={!isNewCollection}
                existingProperty={true}
                autoOpenTypeSelect={false}
                propertyKey={selectedPropertyKey}
                propertyNamespace={selectedPropertyNamespace}
                property={selectedProperty}
                onPropertyChanged={onPropertyChanged}
                onDelete={deleteProperty}
                onError={onPropertyErrorInternal}
                forceShowErrors={showErrors}
                initialErrors={initialErrors}
                getData={getData}
                customFields={customFields}
                collectionEditable={collectionEditable}
                onOkClicked={asDialog
                    ? closePropertyDialog
                    : undefined
                }/>}

        </div>);

    return (<>

            {body}

            {/* This is the dialog used for new properties*/}
            <PropertyFormDialog
                inArray={false}
                existingProperty={false}
                autoOpenTypeSelect={true}
                autoUpdateId={true}
                forceShowErrors={showErrors}
                open={newPropertyDialogOpen}
                onCancel={() => setNewPropertyDialogOpen(false)}
                onPropertyChanged={onPropertyCreated}
                getData={getData}
                allowDataInference={!isNewCollection}
                customFields={customFields}
                collectionEditable={collectionEditable}
                existingPropertyKeys={values.propertiesOrder as string[]}/>

        </>
    );
}