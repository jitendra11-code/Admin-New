import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Tab,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { useDispatch } from "react-redux";
import PendingList from "./pendingList";
import BulkHistory from "./BulkHistory";
import { useUrlSearchParams } from "use-url-search-params";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

const MyTask = () => {
  const [open, setOpen] = React.useState(false);
  const [versionHistoryData, setVersionHistoryData] = React.useState([]);
  const [mandateId, setMandateId] = React.useState(null);
  const [pmId, setPmId] = React.useState(null);
  const [pmError, setPmError] = React.useState("");
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [selectAllBox, setSelectAllBox] = useState(false);
  const [mandateData, setMandateData] = React.useState(null);
  const [mandateList, setMandateList] = React.useState([]);
  const [mandateCode, setMandateCode] = React.useState<any>("");
  const [projectManager, setProjectManager] = React.useState([]);
  const [assignedPmData, setAssignedPmData] = React.useState({});
  const [checked, setChecked] = React.useState({});
  const [params] = useUrlSearchParams({}, {});
  let { id } = useParams();
  const gridRef = React.useRef<AgGridReact>(null);

  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [value, setValue] = React.useState("1");
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  let path = window.location.pathname?.split("/");
  let modulePath: any = window.location.pathname?.split("/")[path.length - 1];

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateCode(id);
    }
  }, []);
  const _getMandateList = (type) => {
    axios({
      method: "get",
      url: `${
        process.env.REACT_APP_BASEURL
      }/api/Mandates/DropDownMandetPhaseByRole?apiType=${
        type || ""
      }&url=${modulePath}`,
    })
      .then((res) => {
        if (res?.status === 200 && res?.data && res?.data?.length > 0) {
          setMandateList(res?.data);
        }
      })
      .catch((err) => {});
  };
  React.useEffect(() => {
    _getMandateList(apiType);
  }, [apiType]);
  return (
    <>
      <div
        style={{
          backgroundColor: "#fff",
          padding: "0px",
          border: "1px solid #0000001f",
          borderRadius: "5px",
        }}
        className="card-panal inside-scroll-105-bulkupdate-branchcode"
      >
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab
                label="pending List"
                value="1"
              />
              <Tab
                label="version History"
                value="2"
              />
            </TabList>
          </Box>

          <TabPanel value="1">
            <PendingList setVersionHistoryData={setVersionHistoryData} />
          </TabPanel>
          <TabPanel value="2">
            <BulkHistory versionHistoryData={versionHistoryData} />
          </TabPanel>
        </TabContext>
      </div>
    </>
  );
};

export default MyTask;
