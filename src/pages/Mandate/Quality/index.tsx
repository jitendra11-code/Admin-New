import {
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import React, { memo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MandateInfo from "pages/common-components/MandateInformation";
import { useUrlSearchParams } from "use-url-search-params";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "redux/store";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { fetchError } from "redux/actions";
import moment from "moment";
import axios from "axios";
import AssignQulityAuditer from "./Components/AssignQulityAuditer";
import { Link } from "react-router-dom";
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

const BOQ = () => {
  const [mandateId, setMandateId] = React.useState<any>(null);
  const [value, setValue] = React.useState<number>(0);
  let { id } = useParams();
  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [remark, setRemark] = React.useState("");
  const [userAction, setUserAction] = React.useState(null);
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const action = userAction?.action || "";

  const runtimeId = userAction?.runtime || 0;
  const { user } = useAuthUser();
  const dispatch = useDispatch();
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const navigate = useNavigate();
  const [params] = useUrlSearchParams({}, {});
  const [mandateInfo, setMandateData] = React.useState(null);
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [boqData, setBOQData] = React.useState([]);
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [vendor, setVendor] = React.useState(null);
  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateId(id);
    }
  }, []);

  React.useEffect(() => {
    if (mandateId && mandateId?.id !== undefined) {
      const userAction =
        userActionList &&
        userActionList?.find(
          (item) =>
            item?.mandateId === parseInt(mandateId?.id) &&
            item?.module === module
        );
      if (apiType === "") {
        setUserAction(userAction);
      } else {
        let action = mandateId;
        setUserAction(action);
      }

      if (params.source === "list") {
        navigate(`/mandate/${mandateId?.id}/${module}?source=list`, {
          state: { apiType: apiType },
        });
      } else {
        navigate(`/mandate/${mandateId?.id}/${module}`, {
          state: { apiType: apiType },
        });
      }
    }
  }, [mandateId]);
  const handleTab = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );
    return userAction?.runtime || 0;
  };

  const workFlowMandate = () => {
    const token = localStorage.getItem("token");
    const body = {
      runtimeId: _getRuntimeId(mandateId?.id) || 0,
      mandateId: mandateId?.Id || 0,
      tableId: mandateId?.Id || 0,
      remark: "",
      createdBy: user?.UserName,
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: "Create", 
    };

    axios({
      method: "post",
      url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId
        }&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy
        }&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ""
        }`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response: any) => {
        if (!response) return;
        if (response?.data === true) {
          navigate("/list/task");
        } else {
          dispatch(fetchError("Error Occurred !"));
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  return (
    <> 
      <div className="qualityaudit">
        <Box
          component="h2"
          className="page-title-heading my-6"
        >
          Quality Audit
        </Box>
        <div
          style={{
            padding: "10px !important",
            border: "1px solid rgba(0, 0, 0, 0.12)",
          }}
          className="card-panal inside-scroll-208"
        >
          <MandateInfo
            mandateCode={mandateId}
            source=""
            pageType=""
            setMandateData={setMandateData}
            redirectSource={`${params?.source}`}
            setMandateCode={setMandateId}
            setpincode={() => { }}
            setCurrentStatus={setCurrentStatus}
            setCurrentRemark={setCurrentRemark}
          />

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

          <AssignQulityAuditer mandateId={mandateId}
            currentStatus={currentStatus}
            currentRemark={currentRemark}
          />
        </div>
      </div>

    </>
  );
};
export default memo(BOQ);
