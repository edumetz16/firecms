import React from "react";
import { SearchBar } from "@edumetz16/firecms_ui";

export default function SearchBarBasicDemo() {
    return (
        <SearchBar onTextSearch={(text) => console.log("Search:", text)} />
    );
}