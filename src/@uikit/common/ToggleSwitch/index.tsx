import * as React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import "./style.css";
import clsx from "clsx";
export default function ToggleSwitch({
  alignment,
  handleChange,
  yes,
  no,
  name,
  id,
  disabled,
  onBlur,
  bold = "false",
}) {
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
        <ToggleButton className={clsx("fontSize-11", bold == "true" && "add-prop-bold-500")} value={true}>{yes}</ToggleButton>
        <ToggleButton className={clsx("fontSize-11", bold == "true" && "add-prop-bold-500")} value={false}>{no}</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}
