import * as React from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from "@material-ui/core";
import { Entity, EntitySchema } from "../models";
import PreviewComponent from "./PreviewComponent";

export interface EntityPreviewProps<S extends EntitySchema> {

    entity: Entity<S>;

    schema: S;

}

export default function EntityPreview<S extends EntitySchema>(
    {
        entity,
        schema
    }: EntityPreviewProps<S>) {

    return (
        <TableContainer>
            <Table aria-label="simple table">
                <TableBody>
                    <TableRow key={"entity_prev_id"}>
                        <TableCell align="right" component="th" scope="row">
                            Id
                        </TableCell>
                        <TableCell>
                            {entity.id}
                        </TableCell>
                    </TableRow>
                    {Object.entries(schema.properties).map(([key, property]) => (
                        <TableRow key={"entity_prev" + property.title + key}>
                            <TableCell align="right" component="th" scope="row">
                                {property.title}
                            </TableCell>
                            <TableCell>
                                <PreviewComponent
                                    value={entity.values[key as string]}
                                    property={property}
                                    small={false}/>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

}