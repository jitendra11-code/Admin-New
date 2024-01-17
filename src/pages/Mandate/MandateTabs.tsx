import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import PhaseApprovalNote from "./PhaseApprovalNote";
import { useNavigate, useParams } from "react-router-dom";
import UpdateMandate from "./UpdateMandate";
import PropertyDocument from "pages/Mandate/DocumentUploadMandate/Components/GenerateLOA";
import PropertyProfile from "pages/propertyPool/propertyProfile";
import { Link } from 'react-router-dom';

const MandateTabs = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("1");
  const { id } = useParams();
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "0px",
        borderRadius: "5px",
      }}
    >
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab value="1" label="Mandate"
              to={`/mandate/${id}/mandate-action`} component={Link} />
            <Tab value="2" label="Phase Approval Note"
              to={`/mandate/${id}/phase-approval-note`}
              component={Link} />
            <Tab value="3" to={`/mandate/${id}/final-property`}
              label="Final Property" component={Link} />
            <Tab value="4" label="Property Documents"
              to={`/mandate/${id}/property-documents`}
              component={Link} />
          </TabList>
        </Box>
        <TabPanel value="1">
          <UpdateMandate />
        </TabPanel>
        <TabPanel value="2">
          <PhaseApprovalNote />
        </TabPanel>
        <TabPanel value="3">
          <PropertyProfile />
        </TabPanel>
        <TabPanel value="4">
          <PropertyDocument />
        </TabPanel>
      </TabContext>
    </div>
  );
};

export default MandateTabs;