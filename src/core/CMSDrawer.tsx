import React from "react";
import {
    Box,
    Divider,
    Link,
    List,
    ListItem,
    ListItemText,
    Theme,
    Typography
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { Link as ReactLink } from "react-router-dom";
import { computeTopNavigation, TopNavigationEntry } from "./navigation";
import { useNavigation } from "../hooks";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        logo: {
            padding: theme.spacing(3),
            maxWidth: 280
        }
    })
);

/**
 * Props used in case you need to override the default drawer
 * @category Core
 */
export interface CMSDrawerProps {
    logo: string | undefined,
    closeDrawer: () => any,
}

export function CMSDrawer({
                              logo,
                              closeDrawer
                          }: CMSDrawerProps) {

    const classes = useStyles();

    const navigation = useNavigation();
    if (!navigation)
        return <></>;

    const {
        navigationEntries,
        groups
    } = computeTopNavigation(navigation, false);

    const ungroupedNavigationViews = Object.values(navigationEntries).filter(e => !e.group);

    function createNavigationListItem(index: number, group: string, entry: TopNavigationEntry) {
        return <ListItem
            button
            key={`navigation_${index}`}
            component={ReactLink}
            to={entry.url}
        >
            <ListItemText
                primary={entry.name.toUpperCase()}
                primaryTypographyProps={{ variant: "subtitle2" }}
                onClick={closeDrawer}/>
        </ListItem>;
    }

    return <>

        {logo &&
        <Link
            key={`breadcrumb-home`}
            color="inherit"
            onClick={closeDrawer}
            component={ReactLink}
            to={"/"}>
            <img className={classes.logo} src={logo} alt={"Logo"}/>
        </Link>}

        <List>

            {groups.map((group) => (
                <React.Fragment
                    key={`drawer_group_${group}`}>
                    <Divider key={`divider_${group}`}/>
                    <Box pt={2} pl={2} pr={2} pb={0.5}>
                        <Typography variant={"caption"} color={"textSecondary"}
                                    className={"weight-500"}>
                            {group.toUpperCase()}
                        </Typography>
                    </Box>
                    {Object.values(navigationEntries)
                        .filter(e => e.group === group)
                        .map((view, index) => createNavigationListItem(index, group, view))}
                </React.Fragment>
            ))}

            {ungroupedNavigationViews.length > 0 &&
            <Divider key={`divider_ungrouped`}/>}

            {ungroupedNavigationViews.map((view, index) => createNavigationListItem(index, "none", view))}

        </List>

    </>;
}
