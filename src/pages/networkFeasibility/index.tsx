import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FeasibilityCheckDetails from "./FeasibilityCheckDetails";
import DeliveryDetails from "./DeliveryDetails";
import MandateInfo from "pages/common-components/MandateInformation";
import axios from "axios";
import { useUrlSearchParams } from "use-url-search-params";

const NetworkFeasibility = ({ tabs }) => {
  const [mandateCode, setMandateCode] = useState<any>("");
  const [mandateData, setMandateData] = React.useState({});
  let { id } = useParams();
  const [params] = useUrlSearchParams({}, {});
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [isDisable, setIsDisable] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState(tabs);
  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateCode(id);
    }
  }, []);
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const getData = async () => {
    await axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/NetworkDetails/GetNetworkDetailsByMandate?mandateId=${
          mandateCode?.id || 0
        }`
      )
      .then((response: any) => {
        if (response?.data?.[0]?.link_Feasibility_Status === "Feasible") {
          setIsDisable(true);
        } else {
          setIsDisable(false);
        }
      })
      .catch((e: any) => {
      });
  };

  React.useEffect(() => {
    if (
      mandateCode &&
      mandateCode?.id !== undefined &&
      mandateCode?.id !== "noid"
    )
      getData();
  }, [mandateCode]);
  React.useEffect(() => {
    if (value == "1") {
      navigate(`/mandate/${mandateCode?.id || "noid"}/network-feasibility`);
    } else {
      navigate(`/mandate/${mandateCode?.id || "noid"}/delivery-details`);
    }
  }, [value]);

  return (
    <>
      <Box component="h2" className="page-title-heading my-6">
        Network Details
      </Box>
      <div
        className="networkwrapper"
        style={{
          backgroundColor: "#fff",
          padding: "0px",
          border: "1px solid #0000001f",
          borderRadius: "5px",
        }}
      >
      
        <div style={{ padding: "0px" }}>
          <MandateInfo
            mandateCode={mandateCode}
            setMandateData={setMandateData}
            source="network-feasibility"
            pageType=""
            redirectSource={`${params?.source}`}
            setMandateCode={setMandateCode}
            setCurrentStatus={setCurrentStatus}
            setCurrentRemark={setCurrentRemark}
            setpincode={() => {}}
          />
        </div>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Network Feasibility Check Details" value="1" />
              <Tab
                label="Network Delivery Details"
                value="2"
                disabled={isDisable}
              />
            </TabList>
          </Box>
          <TabPanel
            value="1"
            onClick={() =>
              navigate(
                `/mandate/${mandateCode?.id || "noid"}/network-feasibility`
              )
            }
          >
            <FeasibilityCheckDetails
              mandateCode={mandateCode}
              handleChange1={setValue}
              mandateData={mandateData}
              currentStatus={currentStatus}
              currentRemark={currentRemark}
              setIsDisable={setIsDisable}
            />
          </TabPanel>
          <TabPanel
            value="2"
            onClick={() =>
              navigate(`/mandate/${mandateCode?.id || "noid"}/delivery-details`)
            }
          >
            <DeliveryDetails
              mandateCode={mandateCode}
              mandateData={mandateData}
              currentStatus={currentStatus}
              currentRemark={currentRemark}
            />{" "}
          </TabPanel>
        </TabContext>
      </div>
    </>
  );
};

export default NetworkFeasibility;
