import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { useNavigate } from "react-router-dom";


const PropertyDocument = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("1");
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
          <TabList onChange={handleChange} aria-label="Property document">
            <Tab label="LOA Generation" value="1" />
            <Tab label="LOI Generation" value="2" />
            <Tab label="Title Search Report" value="3" />
            <Tab label="Lease Dead Details" value="4" />
            <Tab label="Additional Documents" value="5" />            
          </TabList>
        </Box>
        <TabPanel value="1">
        <p>LOA Generation</p>
        </TabPanel>
        <TabPanel value="2">
        <p>LOI Generation</p>
        </TabPanel>
        <TabPanel value="3">
          <p>Title Search Report</p>
        </TabPanel>
        <TabPanel value="4">
          <p>Lease Dead Details</p>
        </TabPanel>
        <TabPanel value="5">
          <p>Additional Documents</p>
        </TabPanel>
      </TabContext>
    </div>
  );
};

export default PropertyDocument;
