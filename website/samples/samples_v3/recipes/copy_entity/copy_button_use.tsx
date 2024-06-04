import { buildCollection, CollectionActionsProps } from "@edumetz16/firecms_core";
import { CopyEntityButton } from "./copy_button";
import { Product, productsCollection, properties } from "./simple_product_collection";

export const productsCollectionCopy = buildCollection<Product>({
    id: "products_copied",
    name: "Products copy target",
    path: "products_copied",
    properties,
    Actions: ({ path, collection }: CollectionActionsProps<Product>) =>
        <CopyEntityButton
            pathFrom={"products"}
            collectionFrom={productsCollection}
            pathTo={path}
            collectionTo={collection}
        />
});
