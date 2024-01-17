import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { useNavigate, useParams } from "react-router-dom";
import UpdateMandate from "./UpdateMandate";
import { Link } from 'react-router-dom';
import { useUrlSearchParams } from "use-url-search-params";

const MandateTabs = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("1");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
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
            <Tab value="1" label="Mandate"
              to={`/mandate/${id}/mandate-action?source=${params.source}`} component={Link} />

            <Tab value="2" to={`/mandate/${id}/final-property?source=${params.source}`} label="Final Property" component={Link} />
            <Tab value="3" label="Property Documents" to={`/mandate/${id}/property-documents?source=${params.source}`}
              component={Link} />
          </TabList>
        </Box>
        <UpdateMandate />

      </TabContext>
    </div>
  );
};

export default MandateTabs;