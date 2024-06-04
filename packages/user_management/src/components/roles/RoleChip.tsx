import { Chip, getColorSchemeForSeed } from "@edumetz16/firecms_ui";
import { Role } from "@edumetz16/firecms_core";

export type RoleChipProps = {
    role: Role;
}

export function RoleChip({ role }: RoleChipProps) {
    let colorScheme;
    if (role.isAdmin) {
        colorScheme = "blueDarker";
    } else if (role.id === "editor") {
        colorScheme = "yellowLight";
    } else if (role.id === "viewer") {
        colorScheme = "grayLight";
    } else {
        colorScheme = getColorSchemeForSeed(role.id);
    }

    return (
        <Chip
            colorScheme={colorScheme}
            key={role.id}>
            {role.name}
        </Chip>
    );

}
