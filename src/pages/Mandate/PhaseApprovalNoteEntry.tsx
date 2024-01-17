import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import PhaseApprovalNote from "./PhaseApprovalNote";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const PhaseApprovalNoteEntry = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("2");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "0px",
        border: "1px solid #0000001f",
        borderRadius: "5px",
      }}
    >
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab
              value="1"
              label="Mandate"
              to={`/mandate/${window.location.pathname?.split("/")[3]
                }/mandate-action`}
              component={Link}
            />
            <Tab
              value="2"
              label="Phase Approval Note"
              to={`/mandate/${window.location.pathname?.split("/")[3]
                }/phase-approval-note`}
              component={Link}
            />
            <Tab
              value="3"
              to={`/mandate/${window.location.pathname?.split("/")[3]
                }/final-property`}
              label="Final Property"
              component={Link}
            />
            <Tab
              value="4"
              label="Property Documents"
              to={`/mandate/${window.location.pathname?.split("/")[3]
                }/property-documents`}
              component={Link}
            />
          </TabList>
        </Box>
        <PhaseApprovalNote />
     
      </TabContext>
    </div>
  );
};

export default PhaseApprovalNoteEntry;
