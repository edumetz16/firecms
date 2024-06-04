import { useCustomizationController } from "@edumetz16/firecms_core";
import { Button, Dialog, DialogActions, DialogContent, Typography } from "@edumetz16/firecms_ui";
import React from "react";

export function EntityCustomViewsSelectDialog({ open, onClose }: { open: boolean, onClose: (selectedViewKey?: string) => void }) {
    const {
        entityViews,
    } = useCustomizationController();

    return <Dialog
        maxWidth={"md"}
        open={open}>
        <DialogContent className={"flex flex-col gap-4"}>
            <Typography variant={"h6"}>
                Select view
            </Typography>
            {entityViews?.map((view) => {
                return <Button
                    key={view.key}
                    onClick={() => onClose(view.key)}
                    fullWidth
                    variant={"text"}
                >
                    {view.name} ({view.key})
                </Button>;
            })}
            {(entityViews ?? []).length === 0 &&
                <Typography variant={"body2"}>
                    No custom views defined
                </Typography>
            }
        </DialogContent>
        <DialogActions>
            <Button variant={"outlined"} onClick={() => onClose()}>Cancel</Button>
        </DialogActions>
    </Dialog>
}
