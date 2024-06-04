import React, { useCallback, useEffect, useState } from "react";

import { useCustomizationController, useFireCMSContext, useNavigationController } from "../../hooks";
import { CMSAnalyticsEvent, PluginGenericProps, PluginHomePageAdditionalCardsProps } from "../../types";

import { toArray } from "../../util/arrays";
import { NavigationGroup } from "./NavigationGroup";
import { NavigationCardBinding } from "./NavigationCardBinding";

// @ts-ignore
import * as JsSearch from "js-search";

import { Container, SearchBar } from "@edumetz16/firecms_ui";
import { FavouritesView } from "./FavouritesView";
import { useRestoreScroll } from "../../internal/useRestoreScroll";

const search = new JsSearch.Search("url");
search.addIndex("name");
search.addIndex("description");
search.addIndex("group");
search.addIndex("path");

/**
 * Default entry view for the CMS. This component renders navigation cards
 * for each collection defined in the navigation.
 * @constructor
 * @group Components
 */
export function DefaultHomePage({
                                    additionalActions,
                                    additionalChildrenStart,
                                    additionalChildrenEnd
                                }: {
    /**
     * Additional actions to be rendered in the home page, close to the search bar.
     */
    additionalActions?: React.ReactNode;
    /**
     * Additional children to be rendered in the beginning of the home page.
     */
    additionalChildrenStart?: React.ReactNode;
    /**
     * Additional children to be rendered at the end of the home page.
     */
    additionalChildrenEnd?: React.ReactNode;
}) {

    const context = useFireCMSContext();
    const customizationController = useCustomizationController();
    const navigationController = useNavigationController();

    if (!navigationController.topLevelNavigation)
        throw Error("Navigation not ready in FireCMSHomePage");

    const {
        containerRef,
        scroll,
        direction
    } = useRestoreScroll();

    const {
        navigationEntries,
        groups
    } = navigationController.topLevelNavigation;

    const [filteredUrls, setFilteredUrls] = useState<string[] | null>(null);

    const filteredNavigationEntries = filteredUrls
        ? navigationEntries.filter((entry) => filteredUrls.includes(entry.url))
        : navigationEntries;

    useEffect(() => {
        search.addDocuments(navigationEntries);
    }, [navigationEntries]);

    const updateSearchResults = useCallback(
        (value?: string) => {
            if (!value || value === "") {
                setFilteredUrls(null);
            } else {
                const searchResult = search.search(value);
                setFilteredUrls(searchResult.map((e: any) => e.url));
            }
        }, []);

    const allGroups: Array<string | undefined> = [...groups];
    if (filteredNavigationEntries.filter(e => !e.group).length > 0 || filteredNavigationEntries.length === 0) {
        allGroups.push(undefined);
    }

    let additionalPluginChildrenStart: React.ReactNode | undefined;
    let additionalPluginChildrenEnd: React.ReactNode | undefined;
    let additionalPluginSections: React.ReactNode | undefined;
    if (customizationController.plugins) {
        const sectionProps: PluginGenericProps = {
            context
        };
        additionalPluginSections = <>
            {customizationController.plugins.filter(plugin => plugin.homePage?.includeSection)
                .map((plugin, i) => {
                    const section = plugin.homePage!.includeSection!(sectionProps)
                    return (
                        <NavigationGroup
                            group={section.title}
                            key={`plugin_section_${plugin.key}`}>
                            {section.children}
                        </NavigationGroup>
                    );
                })}
        </>;
        additionalPluginChildrenStart = <div className={"flex flex-col gap-2"}>
            {customizationController.plugins.filter(plugin => plugin.homePage?.additionalChildrenStart)
                .map((plugin, i) => {
                    return <div key={`plugin_children_start_${i}`}>{plugin.homePage!.additionalChildrenStart}</div>;
                })}
        </div>;

        additionalPluginChildrenEnd = <div className={"flex flex-col gap-2"}>
            {customizationController.plugins.filter(plugin => plugin.homePage?.additionalChildrenEnd)
                .map((plugin, i) => {
                    return <div key={`plugin_children_start_${i}`}>{plugin.homePage!.additionalChildrenEnd}</div>;
                })}
        </div>;
    }

    return (
        <div id="home_page"
             ref={containerRef}
             className="py-2 overflow-auto h-full w-full">
            <Container maxWidth={"6xl"}>
                <div
                    className="w-full sticky py-4 transition-all duration-400 ease-in-out top-0 z-10 flex flex-row gap-4"
                    style={{ top: direction === "down" ? -84 : 0 }}>
                    <SearchBar onTextSearch={updateSearchResults}
                               placeholder={"Search collections"}
                               large={false}
                               innerClassName={"w-full"}
                               className={"w-full flex-grow"}/>
                    {additionalActions}
                </div>

                <FavouritesView hidden={Boolean(filteredUrls)}/>

                {additionalChildrenStart}

                {additionalPluginChildrenStart}

                {allGroups.map((group, index) => {

                    const AdditionalCards: React.ComponentType<PluginHomePageAdditionalCardsProps>[] = [];
                    const actionProps: PluginHomePageAdditionalCardsProps = {
                        group,
                        context
                    };

                    if (customizationController.plugins) {
                        customizationController.plugins.forEach(plugin => {
                            if (plugin.homePage?.AdditionalCards) {
                                AdditionalCards.push(...toArray(plugin.homePage?.AdditionalCards));
                            }
                        });
                    }

                    const thisGroupCollections = filteredNavigationEntries
                        .filter((entry) => entry.group === group || (!entry.group && group === undefined));
                    if (thisGroupCollections.length === 0 && AdditionalCards.length === 0)
                        return null;
                    return (
                        <NavigationGroup
                            group={group}
                            key={`plugin_section_${group}`}>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {thisGroupCollections.map((entry) => (
                                    <div key={`nav_${entry.group}_${entry.name}`} className="col-span-1">
                                        <NavigationCardBinding
                                            {...entry}
                                            onClick={() => {
                                                let event: CMSAnalyticsEvent;
                                                if (entry.type === "collection") {
                                                    event = "home_navigate_to_collection";
                                                } else if (entry.type === "view") {
                                                    event = "home_navigate_to_view";
                                                } else if (entry.type === "admin") {
                                                    event = "home_navigate_to_admin_view";
                                                } else {
                                                    event = "unmapped_event";
                                                }
                                                context.analyticsController?.onAnalyticsEvent?.(event, { path: entry.path });
                                            }}
                                        />
                                    </div>
                                ))}
                                {group?.toLowerCase() !== "admin" && AdditionalCards &&
                                    AdditionalCards.map((AdditionalCard, i) => (
                                        <div key={`nav_${group}_add_${i}`}>
                                            <AdditionalCard {...actionProps} />
                                        </div>
                                    ))}
                            </div>
                        </NavigationGroup>
                    );
                })}

                {additionalPluginSections}

                {additionalPluginChildrenEnd}

                {additionalChildrenEnd}

            </Container>
        </div>
    );
}
