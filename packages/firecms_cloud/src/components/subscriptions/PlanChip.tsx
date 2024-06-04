import { Chip } from "@edumetz16/firecms_ui";
import { ProjectSubscriptionPlan } from "../../types";
import { getSubscriptionPlanName } from "../settings/common";

export function PlanChip({ subscriptionPlan }: { subscriptionPlan: ProjectSubscriptionPlan }) {

    const planName = getSubscriptionPlanName(subscriptionPlan);
    return <Chip className="uppercase font-medium"
                 colorScheme={"tealDarker"}
                 size={"small"}>
        {planName + " plan"}
    </Chip>
}
