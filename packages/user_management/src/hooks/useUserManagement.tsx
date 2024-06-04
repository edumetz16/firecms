import { useContext } from "react";
import { UserManagement } from "../types";
import { UserManagementContext } from "../UserManagementProvider";
import { User } from "@edumetz16/firecms_core";
export const useUserManagement = <USER extends User>() => useContext<UserManagement<USER>>(UserManagementContext);
