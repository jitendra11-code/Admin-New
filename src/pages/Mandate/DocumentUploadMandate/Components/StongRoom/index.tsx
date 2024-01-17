import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import UploadDocuments from "../ReportContentSection";
import { useUrlSearchParams } from "use-url-search-params";

const Tabs = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("2");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  const [propertyDocTab, setPropertyDocTab] = useState("3");
  const handleChangePropertyDocTab = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setPropertyDocTab(propertyDocTab);
  };
  const { id } = useParams();
  const [params] = useUrlSearchParams({}, {});

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
              label="structure-stability"
              to={`/mandate/${id}/structure-stability-report`}
              component={Link}
            />
            <Tab
              value="2"
              label="Stong Room Door Feasibility Report"
              to={`/mandate/${id}/stong-room-feasibility-report`}
              component={Link}
            />
          </TabList>
        </Box>
        <UploadDocuments documentType={"Stong Room Door Feasibility Report"} />
      </TabContext>
    </div>
  );
};

export default Tabs;
