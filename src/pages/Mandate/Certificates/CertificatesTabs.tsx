import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { useLocation, useParams } from "react-router-dom";
import Certificates from "./Certificates";
import CertificatesAndAdditionalDocuments from "./CertificatesAndAdditionalDocuments";
import { Link } from "react-router-dom";
import { useUrlSearchParams } from "use-url-search-params";

const CertificatesTabs = () => {
  const { id } = useParams();
  const [params] = useUrlSearchParams({}, {});
  const [paramsFlag, setParamsFlag] = React.useState(false);
  const location = useLocation();
  let path = window.location.pathname?.split("/");
  let modulePath: any = window.location.pathname?.split("/")[path.length - 1];
  const [value, setValue] = useState(modulePath === "certificates" ? "1" : "2");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  useEffect(() => {
    if (params?.source === "list") {
      setParamsFlag(true);
    }
  }, []);
  
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
              label="Certificates"
              value="1"
              to={
                paramsFlag
                  ? `/mandate/${id}/certificates?source=list`
                  : `/mandate/${id}/certificates`
              }
              component={Link}
            />
            <Tab
              label="Certificates And Additional Documents"
              value="2"
              to={
                paramsFlag
                  ? `/mandate/${id}/certificatesAndAdditionalDocuments?source=list`
                  : `/mandate/${id}/certificatesAndAdditionalDocuments`
              }
              component={Link}
            />
          </TabList>
        </Box>
        <TabPanel value="1">
          <Certificates />
        </TabPanel>
        <TabPanel value="2">
          <CertificatesAndAdditionalDocuments />{" "}
        </TabPanel>
      </TabContext>
    </div>
  );
};

export default CertificatesTabs;
