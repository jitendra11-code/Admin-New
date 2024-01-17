import {
  Button,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import React, { memo,  useEffect, useMemo } from "react";
import {
  primaryButtonSm, 
} from "shared/constants/CustomColor";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import UploadBOQ from "./Components/UploadBOQ";
import BOQSummary from "./Components/BOQSummary";
import BOQItems from "./Components/BOQItems";
import GeneralAndPenaltyTerms from "./Components/GeneralandPenaltyTerms";
import PaymentTerms from "./Components/PaymentTerms";
import MandateInfo from "pages/common-components/MandateInformation";
import { useUrlSearchParams } from "use-url-search-params";
import VendorInformation from "./Components/VendorInformation";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "redux/store";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { fetchError, showMessage } from "redux/actions";
import moment from "moment";
import BOQPM from "./Components/BOQPM";
import axios from "axios";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
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
  const [boqForApprovalData, setBOQForApprovalData] = React.useState([]);
  const [approvalStatus, setApprovalStatus] = React.useState(false);
  const [sendBack, setSendBack] = React.useState(false);
  const [approvalRole, setApprovalRole] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [remark, setRemark] = React.useState("");
  const [userAction, setUserAction] = React.useState(null);
  const [docHistory, setdocHistory] = React.useState<any>([]);
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const { user } = useAuthUser();
  const [data, setData] = React.useState<any>([]);
  const dispatch = useDispatch();
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const navigate = useNavigate();
  const [checked, setChecked] = React.useState([])
  const [params] = useUrlSearchParams({}, {});
  const [mandateInfo, setMandateData] = React.useState(null);
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [boqData, setBOQData] = React.useState([]);
  const [errors, setErrors] = React.useState(null);
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [vendor, setVendor] = React.useState(null);
  const [contactError, setContactError] = React.useState(null);
  const [boq, setBOQ] = React.useState(null);

  const isVendorSelected = checked && checked.filter(item => item === true)

  
  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateId(id);
    }
  }, []);

  useEffect(() => {
    if (
      user?.role === "Project Manager" ||
      user?.role === "CPU Associate" ||
      user?.role === "Project Delivery Manager"
    ) {
      setApprovalRole(true);
    } else {
      setApprovalRole(false);
    }
  }, [user?.role]);

  const getMandateBOQId = (id) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/BOQ/GetBOQ?mandateId=${id}&vendorId=${vendor?.vendorId || 0}`
      )
      .then((response: any) => {
        if (!response) return;
        if (response?.data?.length > 0) {
          let obj = response?.data?.[0];
          setBOQ((state) => ({
            ...state,
            boqId: response?.data?.[0]?.id,
          }));
          setVendor((state) => ({
            ...state,
            vendorId: obj?.vendorId || "",
            id: obj?.id || "",
            vendorcategory: obj?.vendor_category || "",
            vendorname: obj?.vendor_name || "",
            contact_number: obj?.contact_number || "",
            remark: obj?.remarks || "",
            ...obj,
          }));
          setBOQ((state) => ({
            ...state,
            totalAmount: obj?.total_Amount || 0,
            totalArea: obj?.square_feet || 0,
            perSqFtCost: obj?.amout_persqfeet || 0,
            ...obj,
          }));
        } else {
          setVendor((state) => ({
            ...state,
            contact_number: "",
            remarks: "",
          }));
          setBOQ((state) => ({
            ...state,
            boqId: 0,
            totalAmount: "",
            totalArea: "",
            perSqFtCost: "",
          }));
        }
      })
      .catch((e: any) => { });
  };

  const getBOQSummary = async () => {
    if (approvalRole) {
      if (boq?.boqId !== undefined && boq?.boqId !== 0)
        await axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/BOQ/GetBOQSummery?mandateid=${mandateId?.id || 0
            }&boqId=${boq?.boqId || 0}&vendorId=${vendor?.vendorId || 0}`
          )
          .then((response: any) => {
            if (!response) return;
            if (response && response?.data && response?.data?.length > 0) {
              setData(response?.data || []);
            } else {
              setData([]);
            }
          })
          .catch((e: any) => { });
    } else {
      await axios
        .get(
          `${process.env.REACT_APP_BASEURL}/api/BOQ/GetBOQSummery?mandateid=${mandateId?.id || 0
          }&boqId=${boq?.boqId || 0}&vendorId=${vendor?.vendorId || 0}`
        )
        .then((response: any) => {
          if (!response) return;
          if (response && response?.data && response?.data?.length > 0) {
            setData(response?.data || []);
          } else {
            setData([]);
          }
        })
        .catch((e: any) => { });
    }
  };
  React.useEffect(() => {
    if (mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid") {
      getMandateBOQId(mandateId?.id);
      getBOQDataApproval();
    }
  }, [mandateId, vendor?.vendorId]);
  React.useEffect(() => {
    if (mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid") {
      getBOQDataApproval();
    }
  }, [mandateId]);
  React.useEffect(() => {
    if (mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid") {
      getBOQSummary();
    }
  }, [mandateId, boq?.boqId, vendor?.vendorId]);

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
        let actionNew = mandateId;
        console.log("KKK",actionNew);
        setUserAction({ ...actionNew, runtimeId: actionNew.runtime });
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
  }, [mandateId,setMandateId]);
  const handleTab = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );
    return userAction?.runtimeId || 0;
  };

  const createBOQ = () => {
    var _createJson;
    var formData: any = new FormData();
    _createJson = {
      mandateId: mandateId?.id || 0,
      vendorId: vendor?.vendorId || 0,
      vendor_category: vendor?.vendorcategory || "",
      vendor_name: vendor?.vendorname || "",
      contact_person: "",
      contact_number: vendor?.contact_number || "",
      remarks: vendor?.remarks || "",
      boQ_number: vendor?.boqNO || "",
      total_Amount: boq?.totalAmount || 0,
      square_feet: boq?.totalArea || 0,
      amout_persqfeet: boq?.perSqFtCost || 0,
      boQ_Date: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      isAmmend: true,
      isDeleted: false,
      parent_BOQ_Id: 0,
      status: "Created",
      id: 0,
      uid: 0,
      createdby: user?.UserName ,
      createddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      modifiedby: user?.UserName,
      modifieddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
    };

    if (_createJson && _createJson !== null) {
      for (var i in _createJson) {
        formData.append(i, _createJson[i]);
      }

      axios
        .post(`${process.env.REACT_APP_BASEURL}/api/BOQ/CreateBOQ`, formData)
        .then((res) => {
          if (!res) {
            dispatch(fetchError("Record is not created!"));
            return;
          }
          if (res?.data && res?.data?.data !== null) {
          }
          if (res?.data && res?.data?.data !== null) {
            navigate("/list/task");
            workflowFunctionAPICall(
              runtimeId,
              mandateId?.id,
              vendor?.vendorId,
              "Created",
              "Created",
              navigate,
              user
            );
            dispatch(showMessage("Record is created successfully!"));
          } else {
            dispatch(fetchError("Record is not created!"));
            return;
          }
        })
        .catch((err) => {
          dispatch(fetchError("Error Ocurred !!!"));
        });
    }
  };

  const getBOQDataApproval = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/BOQ/GetBOQForApproval?mandateId=${mandateId?.id || 0
        }`
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data && response?.data?.length > 0) {
          setBOQForApprovalData(response?.data);
        } else {
          setBOQForApprovalData(response?.data);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
       
      });
  };

  const getApprovalStatus = useMemo(() => {
    if (mandateId?.id !== undefined && vendor?.vendorId !== undefined)
      axios
        .get(
          `${process.env.REACT_APP_BASEURL
          }/api/BOQ/GetBOQApprovalStatus?mandateid=${mandateId?.id || 0
          }&TableID=${vendor?.vendorId || 0}&RoleName=${user?.role}`
        )
        .then((response: any) => {
          if (!response) setApprovalStatus(false);
          if (response && response?.data === true) {
            setApprovalStatus(true);
          } else {
            setApprovalStatus(false);
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occurred !"));
         
        });
  }, [mandateId, vendor?.vendorId, user?.role]);

  const updateBOQ = () => {
    var _updateJson;
    var formData: any = new FormData();
    _updateJson = {
      mandateId: mandateId?.id || 0,
      vendorId: vendor?.vendorId || 0,
      vendor_category: vendor?.vendorcategory || "",
      vendor_name: vendor?.vendorname || "",
      contact_person: "",
      contact_number: vendor?.contact_number || "",
      remarks: vendor?.remarks || "",
      boQ_number: vendor?.boqNO || "",
      total_Amount: boq?.totalAmount || 0,
      square_feet: boq?.totalArea || 0,
      amout_persqfeet: boq?.perSqFtCost || 0,
      boQ_Date: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      isAmmend: false,
      isDeleted: false,
      parent_BOQ_Id: 0,
      status: "Created",
      id: boq?.boqId || 0,
      uid: 0,
      createdby: user?.UserName,
      createddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      modifiedby: user?.UserName,
      modifieddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
    };

    if (_updateJson && _updateJson !== null) {
      for (var i in _updateJson) {
        formData.append(i, _updateJson[i]);
      }

      axios
        .post(`${process.env.REACT_APP_BASEURL}/api/BOQ/UpdateBOQ`, formData)
        .then((res) => {
          if (!res) {
            dispatch(fetchError("Record is not updated!"));
            return;
          }

          if (res?.data && res?.data?.data !== null) {
            navigate("/list/task");
            dispatch(showMessage("Record is updated successfully!"));
            workflowFunctionAPICall(
              runtimeId,
              mandateId?.id,
              vendor?.vendorId,
              "Created",
              "Created",
              navigate,
              user
            );
          } else {
            dispatch(fetchError("Record is not updated!"));
            return;
          }
        })
        .catch((err) => {
          dispatch(fetchError("Error Ocurred !!!"));
        });
    }
  };
  const workflowFunctionAPICall = (
    runtimeId,
    mandateId,
    tableId,
    remark,
    action,
    navigate,
    user
  ) => {
    if (vendor?.vendorId === undefined) {
      dispatch(fetchError("Please select at least one vendor"));
      return;
    }
    const token = localStorage.getItem("token");
    const body = {
      runtimeId: runtimeId || 0,
      mandateId: mandateId || 0, 
      tableId: tableId || 0, 
      remark: remark || "",
      createdBy: user?.UserName,
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: action || "", 
    };
    axios({
      method: "post",
      url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${remark}`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response: any) => {
        if (!response) return;
        if (response?.data === true) {
          navigate("/list/task");
        }
      })
      .catch((e: any) => { });
  };

  const downloadBoq = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/BOQ/GetBOQPDFReport?mandateid=${mandateId?.id || 0
        }&vendor_ID=${vendor?.vendorId || 0}&boqId=${boq?.boqId || 0
        }&recordId=${docHistory?.[0]?.recordId || 0}`
      )
      .then((response: any) => {
        if (!response) return;
        const linkSource = `data:application/pdf;base64,${response?.data}`;
        const downloadLink = document.createElement("a");
        const fileName = `BOQ_details_${mandateId?.id}.pdf`;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
        dispatch(showMessage("Download BOQ successfully!"));
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
       
      });
  };

  return (
    <>
      <div>
        <Box component="h2" className="page-title-heading my-6">
          BOQ
        </Box>
        <div
          style={{
            padding: "10px !important",
            border: "1px solid rgba(0, 0, 0, 0.12)",
          }}
          className="card-panal-boq inside-scroll-230-boq-list"
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
          {user?.role === "Vendor" && (
            <div style={{ marginTop: "0px", marginBottom: "0px" }}>
              <VendorInformation
                vendor={vendor}
                setVendor={setVendor}
                mandateId={mandateId}
                contactError={contactError}
                setContactError={setContactError}
              />
            </div>
          )}
          {approvalRole && (
            <div style={{ marginTop: "0px", marginBottom: "0px" }}>
              <BOQPM
                checked={checked}
                setChecked={setChecked}
                approvalRole={approvalRole}
                setApprovalRole={setApprovalRole}
                boqForApprovalData={boqForApprovalData}
                setBOQForApprovalData={setBOQForApprovalData}
                setVendor={setVendor}
                setBOQ={setBOQ}
              />
            </div>
          )}

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleTab}
              aria-label="lab API tabs example"
            >
              <Tab value={0} label="Upload BOQ Items" />
              <Tab value={1} label="BOQ Summary" />
              <Tab value={2} label="BOQ Items" />
              <Tab value={3} label="Payment Terms" />
              <Tab value={4} label="General and Penalty Terms" />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0} key="0">
            <UploadBOQ
            isVendorSelected={isVendorSelected}
              setdocHistory={setdocHistory}
              approvalRole={approvalRole}
              setApprovalRole={setApprovalRole}
              setBOQData={setBOQData}
              mandateId={mandateId}
              setVendor={setVendor}
              vendor={vendor}
              setMandateId={setMandateId}
              boq={boq}
              getBOQSummary={getBOQSummary}
              setBOQ={setBOQ}
            />
          </TabPanel>
          <TabPanel value={value} index={1} key="1">
            <BOQSummary
            isVendorSelected={isVendorSelected}
              mandateId={mandateId}
              setVendor={setVendor}
              vendor={vendor}
              setData={setData}
              data={data}
              boq={boq}
              approvalRole={approvalRole}
              setApprovalRole={setApprovalRole}
              setBOQ={setBOQ}
            />
          </TabPanel>
          <TabPanel value={value} index={2} key="2">
            <BOQItems
            isVendorSelected={isVendorSelected}
            approvalRole={approvalRole}
              mandateId={mandateId}
              action={action}
              setVendor={setVendor}
              vendor={vendor}
              getBOQSummary={getBOQSummary}
              setData={setData}
              data={data}
              boqData={boqData}
              errors={errors}
              setErrors={setErrors}
              setBOQData={setBOQData}
              boq={boq}
              setBOQ={setBOQ}
            />
          </TabPanel>
          <TabPanel value={value} index={3} key="3">
            <PaymentTerms mandateId={mandateId} />
          </TabPanel>
          <TabPanel value={value} index={4} key="4">
            <GeneralAndPenaltyTerms mandateId={mandateId} />
          </TabPanel>
        </div>
      </div>
      {mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid" && (
        <div className="bottom-fix-history-boq">
          <MandateStatusHistory
            mandateCode={mandateId?.id}
            accept_Reject_Remark={currentRemark}
            accept_Reject_Status={currentStatus}
          />
        </div>
      )}
      {userAction?.module === module && (
        <div className="bottom-fix-btn" style={{ display: "flex", justifyContent: "center" }}>
          <div className="remark-field" style={{ marginRight: "0px", display: "flex" }}>
            {!approvalStatus &&
              vendor?.vendorId !== undefined &&
              action &&
              action === "Approve" && <Button
                sx={
                  approvalRole && {
                    backgroundColor: "#f3f3f3",
                    borderRadius: "6px",
                  }
                }
                onClick={() => downloadBoq()}
                variant="outlined"
                size="medium"
                style={primaryButtonSm}
              >
                Download BOQ
              </Button>}
            {!approvalStatus &&
              vendor?.vendorId !== undefined && isVendorSelected?.length > 0 &&
              action &&
              action === "Approve" && (
                <>
                  <ApproveAndRejectAction
                    approved={approved}
                    sendBack={sendBack}
                    setSendBack={setSendBack}
                    setApproved={setApproved}
                    remark={remark}
                    setRemark={setRemark}
                    approveEvent={() => {
                      workflowFunctionAPICall(
                        runtimeId,
                        mandateId?.id,
                        vendor?.vendorId,
                        remark,
                        "Approved",
                        navigate,
                        user
                      );
                    }}
                    sentBackEvent={() => {
                      workflowFunctionAPICall(
                        runtimeId,
                        mandateId?.id,
                        vendor?.vendorId,
                        remark,
                        "Sent Back",
                        navigate,
                        user
                      );
                    }}
                  />
                  {userAction?.stdmsg !== undefined && (
                    <span className="message-right-bottom">
                      {userAction?.stdmsg}
                    </span>
                  )}
                </>
              )}
          </div>
          {user?.role === "Project Manager" &&
            vendor?.vendorId !== undefined &&
            action &&
            action === "Amend BOQ" && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  name="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (vendor?.vendorId === 0 || isVendorSelected?.length === 0) {
                      dispatch(fetchError("Please select at least one vendor"));
                      return;
                    }
                    if (mandateId && mandateId?.id === undefined) {
                      dispatch(fetchError("Mandate Selection is required"));
                      return;
                    }
                    if (
                      action !== "Amend BOQ" &&
                      user?.role !== "Project Manager"
                    ) {
                      dispatch(fetchError("You are not authorized for action"));
                      return;
                    }
                    if (contactError === null) {
                      if (boq?.boqId !== 0 && boq.hasOwnProperty("boqId")) {
                        updateBOQ();
                      } else {
                        createBOQ();
                      }
                    }
                  }}
                  style={primaryButtonSm}
                  sx={{ color: "#fff", fontSize: "12px" }}
                >
                  Amend BOQ
                </Button>
                {userAction?.stdmsg !== undefined && (
                  <span className="message-right-bottom">
                    {userAction?.stdmsg}
                  </span>
                )}
              </>
            )}

          {boqData?.length > 0 && action && action === "Create" && (
            <>
              <Button
                variant="outlined"
                size="small"
                name="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (vendor?.vendorId === 0 || isVendorSelected?.length > 0) {
                    dispatch(fetchError("Please select at least one vendor"));
                    return;
                  }
                  if (mandateId && mandateId?.id === undefined) {
                    dispatch(fetchError("Mandate Selection is required"));
                    return;
                  }
                  if (approvalRole) {
                    dispatch(
                      fetchError("You are not authorized for given action")
                    );
                    return;
                  }
                  if (contactError === null) {
                    if (boq?.boqId !== 0 && boq.hasOwnProperty("boqId")) {
                      updateBOQ();
                    } else {
                      createBOQ();
                    }
                  }
                }}
                style={primaryButtonSm}
                sx={{ color: "#fff", fontSize: "12px" }}
              >
                SUBMIT
              </Button>
              {userAction?.stdmsg !== undefined && (
                <span className="message-right-bottom">
                  {userAction?.stdmsg}
                </span>
              )}
            </>
          )}
        </div>
      )}
     
    </>
  );
};
export default memo(BOQ);
