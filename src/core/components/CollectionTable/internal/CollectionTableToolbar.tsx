import React from "react";
import { styled } from '@mui/material/styles';
import {
    alpha,
    Box,
    CircularProgress,
    darken,
    Hidden,
    IconButton,
    InputBase,
    MenuItem,
    Select,
    Theme,
    Tooltip,
    useMediaQuery,
    useTheme
} from "@mui/material";

import { CollectionSize } from "../../../../models";
import { SearchBar } from "./SearchBar";
import ClearIcon from "@mui/icons-material/Clear";

const PREFIX = 'CollectionTableToolbar';

const classes = {
    toolbar: `${PREFIX}-toolbar`,
    actions: `${PREFIX}-actions`,
    selectRoot: `${PREFIX}-selectRoot`,
    input: `${PREFIX}-input`,
    item: `${PREFIX}-item`
};

const Root = styled('div')((
   { theme } : {
        theme: Theme
    }
) => ({
    [`&.${classes.toolbar}`]: {
        minHeight: 56,
        [theme.breakpoints.down("xl")]: {
            paddingLeft: theme.spacing(0.5),
            paddingRight: theme.spacing(0.5)
        },
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        backgroundColor: theme.palette.mode === "light" ? theme.palette.common.white : theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%"
    },

    [`& .${classes.actions}`]: {
        display: "flex",
        alignItems: "center",
        "& > *": {
            [theme.breakpoints.down("md")]: {
                marginRight: theme.spacing(0.5)
            },
            marginRight: theme.spacing(1)
        }
    },

    [`& .${classes.selectRoot}`]: {
        "label + &": {
            marginTop: theme.spacing(3)
        }
    },

    [`& .${classes.input}`]: {
        borderRadius: 4,
        position: "relative",
        backgroundColor: theme.palette.mode === "light" ? alpha(theme.palette.common.black, 0.05) : darken(theme.palette.background.default, 0.2),
        fontSize: 14,
        fontWeight: theme.typography.fontWeightMedium,
        padding: "10px 26px 10px 12px",
        transition: theme.transitions.create(["border-color", "box-shadow"]),
        "&:focus": {
            borderRadius: 4
        }
    },

    [`& .${classes.item}`]: {
        backgroundColor: theme.palette.background.default,
        fontSize: 14,
        fontWeight: theme.typography.fontWeightMedium,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        "&:hover": {
            backgroundColor: darken(theme.palette.background.default, 0.1)
        },
        "&:focus": {
            backgroundColor: darken(theme.palette.background.default, 0.2),
            "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                color: theme.palette.text.primary
            }
        }
    }
}));


interface CollectionTableToolbarProps {
    size: CollectionSize;
    filterIsSet: boolean;
    actions?: React.ReactNode;
    loading: boolean;
    title?: React.ReactNode,
    onTextSearch?: (searchString?: string) => void;
    onSizeChanged: (size: CollectionSize) => void;

    clearFilter(): void;
}

export function CollectionTableToolbar<M extends { [Key: string]: any }>(props: CollectionTableToolbarProps) {


    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const filterView = props.filterIsSet &&
        <Box display={"flex"}
             alignItems="center">

            <Tooltip title="Clear filter">
                <IconButton
                    style={{ height: "fit-content" }}
                    aria-label="filter clear"
                    onClick={props.clearFilter}
                    size="large">
                    <ClearIcon/>
                </IconButton>
            </Tooltip>

        </Box>;

    const sizeSelect = (
        <Select
            variant={"standard"}
            value={props.size}
            style={{ width: 56 }}
            onChange={(evt: any) => {
                props.onSizeChanged(evt.target.value);
            }}
            MenuProps={{
                MenuListProps: {
                    disablePadding: true,
                    style: {
                        borderRadius: 4
                    }
                },
                elevation: 1
            }}
            input={<InputBase classes={{
                root: classes.selectRoot,
                input: classes.input
            }}/>}
            renderValue={(value: any) => value.toUpperCase()}
        >
            {["xs", "s", "m", "l", "xl"].map((value) => (
                <MenuItem
                    classes={{
                        root: classes.item
                    }}
                    key={`size-select-${value}`} value={value}>
                    {value.toUpperCase()}
                </MenuItem>
            ))}
        </Select>
    );

    return (
        <Root
            className={classes.toolbar}
        >

            <Box display={"flex"}
                 alignItems="center">

                {props.title && <Hidden lgDown>
                    <Box mr={2}>
                        {props.title}
                    </Box>
                </Hidden>}

                {sizeSelect}

                {filterView}


            </Box>


            <div className={classes.actions}>

                {largeLayout && <Box width={22}>
                    {props.loading &&
                    <CircularProgress size={16} thickness={8}/>}
                </Box>}

                {props.onTextSearch &&
                <SearchBar
                    key={"search-bar"}
                    onTextSearch={props.onTextSearch}/>
                }

                {props.actions}

            </div>

        </Root>
    );
}
