import React, { useEffect, useState } from "react";
import { useStorageSource } from "@edumetz16/firecms_core";
import { cn } from "@edumetz16/firecms_ui";

/**
 * This is a simple component that renders an image from a Firebase Storage path.
 */
export function StorageImage({
                                 storagePath,
                                 style,
                                 className,
                                 alt
                             }: {
    alt?: string,
    storagePath: string,
    style?: React.CSSProperties,
    className?: string
}) {

    const storage = useStorageSource();
    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (storagePath) {
            storage.getDownloadURL(storagePath)
                .then((res) => setUrl(res.url ?? undefined));
        }
    }, [storage, storagePath]);

    if (!storagePath)
        return <></>;

    return (
        <img
            alt={alt ?? "Generic"}
            className={cn("object-contain", className)}
            style={{
                ...style
            }} src={url}/>
    );
}
