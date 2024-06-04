import React from "react";
import { Alert, Button } from "@edumetz16/firecms_ui";
import { PlansComparisonDialog } from "./PlansComparison";
import { PlanChip } from "./PlanChip";
import { useProjectConfig } from "../../hooks";

export type SubscriptionPlanWidgetProps = {
    message?: React.ReactNode,
    showForPlans?: string[],
    includeCTA?: boolean
}

export function SubscriptionPlanWidget({ message, showForPlans, includeCTA = true }: SubscriptionPlanWidgetProps) {

    const { subscriptionPlan } = useProjectConfig();

    const [dialogOpen, setDialogOpen] = React.useState(false);

    if (!subscriptionPlan) return null;
    if (showForPlans && !showForPlans.includes(subscriptionPlan)) return null;

    return <>

        <Alert
            color={"info"}
            className={"my-4"}
            action={includeCTA && <Button
                className={"dark:!text-white dark:border-white dark:hover:bg-white dark:hover:!text-primary min-w-content"}
                variant={"outlined"}
                onClick={() => setDialogOpen(true)}>
                More info
            </Button>}>
            <div>This project is currently in the <PlanChip subscriptionPlan={subscriptionPlan}/> {!message && "Try out all the PLUS features for free!"}</div>
            <div>{message}</div>
        </Alert>

        <PlansComparisonDialog open={dialogOpen} onClose={() => setDialogOpen(false)}/>

    </>;
}
