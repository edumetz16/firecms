import React from "react";
import Layout from "@theme/Layout";
import { Panel } from "../partials/general/Panel";
import { ProInfo } from "../partials/pro/ProInfo";
import { ProDeveloperFeatures } from "../partials/pro/ProDeveloperFeatures";
import { HeroPro } from "../partials/pro/HeroPro";
import { PublicFacingApps } from "../partials/pro/PublicFacingApps";
import ProFeaturesPanels from "../partials/pro/ProFeaturesPanels";
import HeroProButtons from "../partials/home/HeroProButtons";

function ProPage() {

    return (
        <Layout
            title={"Features - FireCMS"}
            description="FireCMS includes all the features you need to kickstart your project and all the customization options you may need.">

            <div className="flex flex-col min-h-screen">

                <main className="flex-grow">
                    <HeroPro
                        height={"300px"}
                        color={"dark"}
                    />

                    <ProInfo/>

                    <ProFeaturesPanels/>

                    <Panel color={"light_gray"} includeMargin={false}>
                        <div
                            className={"max-w-7xl text-2xl md:text-5xl font-bold tracking-tight uppercase font-mono"}>
                            <p>
                                FireCMS PRO was crafted through collaboration with various <strong>companies</strong>,
                                out of the
                                need to have a CMS that could be used in <strong>different scenarios</strong> and that
                                could be easily customized to fit different needs.
                            </p>
                        </div>
                        <HeroProButtons/>
                    </Panel>

                    <PublicFacingApps/>


                    <ProDeveloperFeatures/>

                    <Panel color={"gray"} includePadding={true}>
                            <h2 className={"h2 mb-3 uppercase font-mono text-center mx-auto"}>
                            LEARN MORE ABOUT FIRECMS PRO
                        </h2>
                        <HeroProButtons/>
                    </Panel>

                </main>
            </div>

        </Layout>
    );
}

export default ProPage;
