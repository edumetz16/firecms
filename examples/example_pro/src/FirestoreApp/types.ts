import { EntityReference } from "@edumetz16/firecms_core";

export type Product = {
    name: string;
    main_image: string;
    category:string;
    available: boolean;
    price: number;
    currency: string;
    public: boolean;
    brand: string;
    description: string;
    amazon_link: string;
    images: string[];
    related_products: EntityReference[];
    publisher: {
        name: string;
        external_id: string;
    },
    available_locales: string[],
    uppercase_name: string,
    added_on: Date;
    tags: string[];
}

export type Locale = {
    name: string,
    description: string,
    selectable?: boolean,
    video: string
}
