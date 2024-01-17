import * as React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import "./style.css";
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    yesselected: {
        "&&": {
            backgroundColor: "#90EE90",

        }
    },
    noselected: {
        "&&": {
            backgroundColor: "#FFCCCB",

        }
    },

}));

export default function ToggleSwitch({
    alignment,
    handleChange,
    yes,
    no,
    name,
    id,
    disabled,
    onBlur,
}) {
    const classes = useStyles();
    return (

        <div className="toggle-div">
            <ToggleButtonGroup
                color="primary"
                value={alignment}
                exclusive
                onChange={handleChange}
                aria-label="Platform"
                id={id}
                onBlur={onBlur}
                sx={(disabled === true) && { backgroundColor: "#f3f3f3" }}
                disabled={disabled}
            >
                <ToggleButton classes={{ selected: classes.yesselected }} className="fontSize-11" value={true}>{yes}</ToggleButton>
                <ToggleButton classes={{ selected: classes.noselected }} className="fontSize-11" value={false}>{no}</ToggleButton>
            </ToggleButtonGroup>
        </div>
    );
}
