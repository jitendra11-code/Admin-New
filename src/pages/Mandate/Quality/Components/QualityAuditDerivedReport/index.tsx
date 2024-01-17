import React, { useState } from "react";
import {
  Box,
  Tab,
  Tabs,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { AppState } from "redux/store";
import { useSelector } from "react-redux";
import { useUrlSearchParams } from "use-url-search-params";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import MandateInfo from "pages/common-components/MandateInformation";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { Link } from "react-router-dom";
import Content from "./Components/Content"
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: (props: TabPanelProps) => any = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {children}
    </div>
  );
};

const QualityAuditDerivedReport = () => {
  const navigate = useNavigate();
  const [remark, setRemark] = useState("");
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtime || 0;
  const gridRef = React.useRef<AgGridReact>(null);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );

  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [params] = useUrlSearchParams({}, {});
  const [mandateInfo, setMandateData] = React.useState(null);
  const { id } = useParams();
  const { user } = useAuthUser();
  const [mandateId, setMandateId] = React.useState(null);
  const [value, setValue] = React.useState<number>(3);
  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateId(id);
    }
  }, []);

  const handleTab = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <>
      <div
        style={{ padding: "10px !important" }}
        className="card-panal inside-scroll-208 qualityauditderived"
      >
        <MandateInfo
          mandateCode={mandateId}
          pageType=""
          source=""
          redirectSource={`${params?.source}`}
          setMandateCode={setMandateId}
          setMandateData={setMandateData}
          setpincode={() => { }}
          setCurrentStatus={setCurrentStatus}
          setCurrentRemark={setCurrentRemark}
        />
        {/* <TabContext value={value}> */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleTab}
              aria-label="lab API tabs example"
            >
              <Tab
                value={0}
                label="Assign Quality Auditor"
                to={`/mandate/${id}/quality-audit`}
                component={Link}
              />
              <Tab
                value={1}
                label="Asset Verification"
                to={`/mandate/${id}/boq-verification`}

                component={Link}
              />
              <Tab
                value={2}
                label="Quality Audit Report"
                to={`/mandate/${id}/quality-audit-report`}
                component={Link}
              />
              <Tab
                value={3}
                label="Quality Audit Derived Report"
                to={`/mandate/${id}/quality-audit-derived-report`}
                component={Link}
              />
            </Tabs>
          </Box>
        {/* </TabContext> */}
        <Content
          mandateInfo={mandateInfo}
          currentRemark={currentRemark}
          currentStatus={currentStatus}
          mandate={mandateId} />

      </div>
    </>
  );
};

export default QualityAuditDerivedReport;
