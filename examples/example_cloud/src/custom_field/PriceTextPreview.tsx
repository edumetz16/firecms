import { PropertyPreviewProps } from "@edumetz16/firecms_cloud";

export function PriceTextPreview({
                                     value,
                                     property,
                                     size,
                                     customProps,
                                 }: PropertyPreviewProps<number>) {

    return (
        <div className={`${value ? "" : "text-sm text-zinc-500"}`}>
            {value ?? "Not available"}
        </div>
    );

};
