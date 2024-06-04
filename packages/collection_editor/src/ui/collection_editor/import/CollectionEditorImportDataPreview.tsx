import { convertDataToEntity, ImportConfig } from "@edumetz16/firecms_data_import_export";
import { CircularProgressCenter, EntityCollectionTable, Properties, useSelectionController } from "@edumetz16/firecms_core";
import { useEffect, useState } from "react";
import { Typography } from "@edumetz16/firecms_ui";

export function CollectionEditorImportDataPreview({
                                                      importConfig,
                                                      properties,
                                                      propertiesOrder
                                                  }: {
    importConfig: ImportConfig,
    properties: Properties,
    propertiesOrder: string[]
}) {

    const [loading, setLoading] = useState<boolean>(false);

    async function loadEntities() {
        // const propertiesMapping = getPropertiesMapping(importConfig.originProperties, properties, importConfig.headersMapping);
        const mappedData = importConfig.importData.map(d => convertDataToEntity(d, importConfig.idColumn, importConfig.headersMapping, properties, "TEMP_PATH", importConfig.defaultValues));
        importConfig.setEntities(mappedData);
    }

    useEffect(() => {
        loadEntities().finally(() => setLoading(false));
    }, []);

    const selectionController = useSelectionController();
    if (loading)
        return <CircularProgressCenter/>

    return <EntityCollectionTable
        title={<div>
            <Typography variant={"subtitle2"}>Imported data preview</Typography>
            <Typography variant={"caption"}>Entities with the same id will be overwritten</Typography>
        </div>}
        tableController={{
            data: importConfig.entities,
            dataLoading: false,
            noMoreToLoad: false
        }}
        endAdornment={<div className={"h-12"}/>}
        filterable={false}
        sortable={false}
        selectionController={selectionController}
        displayedColumnIds={propertiesOrder.map(p => ({
            key: p,
            disabled: false
        }))}
        properties={properties}
        enablePopupIcon={false}/>

}
