import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { useNavigate } from "react-router-dom";
interface LinkTabProps {
  label?: string;
  href?: string;
}

function LinkTab(props: LinkTabProps) {
  return (
    <Tab
      component="a"
      onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
      }}
      {...props}
    />
  );
}


const MyTaskTabs = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("4");
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
            <LinkTab label="Mandate" href="mytask-tabs" />
            <LinkTab label="Phase Approval Note" href="/phase-approval-note" />
            <LinkTab label="Final Property" href="/final-property" />
            <LinkTab label="Property Documents " href="/property-documents" />
          </TabList>
        </Box>
      </TabContext>
    </div>
  );
};

export default MyTaskTabs;