import React, { useState, useEffect } from "react";
import {
  Button,
  Box,
  Grid,
  Tab,
  Tooltip,
  Tabs,
} from "@mui/material";
import actualQtyEditorCmp from "./editor/actualQty";
import diffQtyEditorCmp from "./editor/differenceQty";
import auditorRemEditorCmp from "./editor/auditorRemarks";
import pmRemEditorCmp from "./editor/pmRemarks";
import DataTable from "pages/common-components/Table";
import MandateInfo from "pages/common-components/MandateInformation";
import { useNavigate, useParams } from "react-router-dom";
import { useUrlSearchParams } from "use-url-search-params";
import ToggleSwitch from "@uikit/common/ToggleSwitch";
import workflowFunctionAPICall from "pages/Mandate/workFlowActionFunction";
import axios from "axios";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useLocation } from "react-router-dom";
import { AppState } from "redux/store";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { AgGridReact } from "ag-grid-react";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { Link } from "react-router-dom";
import BoqHistory from "./boqHistory";
import FileUploadAction from "./FileUpload";
import FileDownloadList from "./downloadViewAction";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";
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

const MAX_COUNT = 8;
const QualityVerification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let { id } = useParams();
  const gridRef = React.useRef<AgGridReact>(null);
  const [docUploadHistory, setDocUploadHistory] = useState([]);
  const [value, setValue] = React.useState<number>(1);
  const [mandateId, setMandateId] = useState(null);
  const [vendor, setVendor] = React.useState(null);
  const [mandateInfo, setMandateData] = React.useState(null);
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [diffQty, setDiffQty] = React.useState(null);
  const [qtyChanged, setQtyChanged] = React.useState(true);
  const [poRequired, setPoRequired] = React.useState(true);
  const [userAction, setUserAction] = React.useState(null);
  const [edit, setEdit] = React.useState(false);
  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [remark, setRemark] = useState("");
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const { user } = useAuthUser();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileLimit, setFileLimit] = useState(false);
  const [fileLength, setFileLength] = useState(0);
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [params] = useUrlSearchParams({}, {});

  const handleTab = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateId(id);
    }
  }, []);
  const components = {
    actualQtyEditorCmp: actualQtyEditorCmp,
    diffQtyEditorCmp: diffQtyEditorCmp,
    auditorRemEditorCmp: auditorRemEditorCmp,
    pmRemEditorCmp: pmRemEditorCmp,
  };
  let columnDefs = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      maxWidth: 75,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "material_Category",
      headerName: "Material Category",
      headerTooltip: "Material Category",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.material_Category;
        return data || "";
      },
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "item_Description",
      headerName: "Item Description",
      headerTooltip: "Item Description",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.item_Description;
        return data || "";
      },
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "quantity",
      headerName: "Quantity",
      headerTooltip: "Quantity",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.quantity;
        return data || "";
      },
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "actual_Qty",
      headerName: "Actual Qty",
      headerTooltip: "Actual Quantity",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 150,
      cellStyle: {
        fontSize: "13px",
        background: user?.role !== "Quality Auditor" && "#EBEBE4",
        width: "127px",
      },
      cellClass: "editTextClass",
      cellEditor: "actualQtyEditorCmp",
      editable: true,
      cellEditorParams: {
        mileStoneData: docUploadHistory,
        setMileStoneData: setDocUploadHistory,
        role: user?.role,
        setDiffQty: setDiffQty,
        diffQty: diffQty,
        maxLength: 50,

      },
    },
    {
      field: "differenceQty",
      headerName: "Difference Qty",
      headerTooltip: "Difference Quantity",
      cellRenderer: (params: any) => {
        let sign = "";
        if (params?.data?.actual_Qty > params?.data?.quantity) {
          sign = "+";
          return <span>{`${sign} ${params?.data?.differenceQty}`}</span>;
        } else if (params?.data?.quantity > params?.data?.actual_Qty) {
          sign = "-";
          return <span>{`${params?.data?.differenceQty}`}</span>;
        } else {
          sign = "";
          return <span>{params?.data?.differenceQty}</span>;
        }
      },
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px", background: "#EBEBE4", width: "127px" },
      cellClass: "editTextClass",
      cellEditor: "diffQtyEditorCmp",
      editable: true,
      cellEditorParams: {
        mileStoneData: docUploadHistory,
        setMileStoneData: setDocUploadHistory,
        role: user?.role,
        maxLength: 50,
      },
    },
    {
      field: "auditor_remarks",
      headerName: "Auditor Remarks",
      headerTooltip: "Auditor Remarks",
      resizable: true,
      width: 110,
      minWidth: 80,
      cellStyle: {
        fontSize: "13px",
        textAlign: "center",
        background: user?.role !== "Quality Auditor" && "#EBEBE4",
        width: "127px",
      },
      cellClass: "editTextClass",
      cellEditor: "auditorRemEditorCmp",
      editable: true,
      cellEditorParams: {
        mileStoneData: docUploadHistory,
        setMileStoneData: setDocUploadHistory,
        role: user?.role,
        maxLength: 50,
      },
    },
    {
      field: "pM_remarks",
      headerName: "PM Remarks",
      headerTooltip: "PM Remarks",
      resizable: true,
      width: 110,
      minWidth: 80,
      cellStyle: {
        fontSize: "13px",
        textAlign: "center",
        background: user?.role !== "Project Manager" && "#EBEBE4",
        width: "127px",
      },
      cellEditor: "pmRemEditorCmp",
      cellClass: "editTextClass",
      editable: true,
      cellEditorParams: {
        mileStoneData: docUploadHistory,
        setMileStoneData: setDocUploadHistory,
        role: user?.role,
        maxLength: 50,
      },
    },
    {
      field: "",
      headerName: "Actions",
      headerTooltip: "Actions",
      resizable: true,
      width: 110,
      minWidth: 80,
      cellStyle: { fontSize: "13px", textAlign: "center" },
      cellRenderer: (params: any) => (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginRight: "10px",
            }}
            className="actions"
          >
            <FileUploadAction
              mandateId={mandateId}
              params={params}
              index={params?.rowIndex}
            />

            <Tooltip title="Download" className="actionsIcons">
              <FileDownloadList
                props={params?.data}
                mandate={mandateId}
                setTableData={setDocUploadHistory}
                setFormData={params?.data}
              />
            </Tooltip>
            <BoqHistory props={params} />
          </div>
        </>
      ),
    },
  ];

  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const fileInput = React.useRef(null);

  const getData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/BOQ/GetBOQItemDetailsByMandate?mandateId=${mandateId?.id}`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }

        if (response?.data && response?.data && response?.data?.length > 0) {
          setPoRequired(
            response?.data?.[0]?.poRequired === false ? false : true
          );
          setQtyChanged(
            response?.data?.[0]?.qtyChanged === false ? false : true
          );

          const data =
            response?.data &&
            response?.data?.length > 0 &&
            response?.data?.map((item) => {
              return {
                id: item?.id || 0,
                uid: item?.uid || "",
                mandateId: mandateId?.id,
                sequence: item?.sequuence,
                fk_BOQ_Item_Det_Id: item?.fk_BOQ_Item_Det_Id || 0,
                material_Code: item?.material_Code || "",
                item_Description: item?.item_Description,
                quantity: item?.quantity,
                unit: item?.unit || "",
                material_Category: item?.material_Category,
                vendorId: item?.vendorId || 0,
                actual_Qty: item.actual_Qty || 0,
                auditor_remarks: "",
                differenceQty:
                  item.actual_Unit === null
                    ? 0 - item?.quantity
                    : item.actual_Unit - item?.quantity,
                revised_Qty: 0,
                pM_remarks: "",
                pM_Status: "string",
                status: "string",
                createdBy: "string",
                createdDate: "2023-01-25T07:48:32.215Z",
                modifiedBy: "string",
                modifiedDate: "2023-01-25T07:48:32.215Z",
              };
            });
          let diff = 0;
          data &&
            data?.length > 0 &&
            data?.map((item) => {
              diff += item?.differenceQty;
              return;
            });
          setDiffQty(diff);
          setDocUploadHistory(data || []);
        }
        if (response && response?.data?.length === 0) {
          setDocUploadHistory([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  const getBoqData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/BOQ/GetBOQVerification?mandateId=${mandateId?.id}`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }

        if (response?.data && response?.data && response?.data?.length > 0) {
          setPoRequired(
            response?.data?.[0]?.poRequired === false ? false : true
          );
          setQtyChanged(
            response?.data?.[0]?.qtyChanged === false ? false : true
          );
          setEdit(true);
          const data =
            response?.data &&
            response?.data?.length > 0 &&
            response?.data?.map((item) => {
              return {
                id: item?.id,
                uid: "string",
                mandateId: mandateId?.id,
                sequence: item?.sequuence,
                fk_BOQ_Item_Det_Id: 0,
                material_Code: "string",
                item_Description: item?.item_Description,
                quantity: item?.quantity,
                unit: "string",
                material_Category: item?.material_Category,
                vendorId: 0,
                differenceQty:
                  item.actual_Qty === null
                    ? 0 - item?.quantity
                    : item?.actual_Qty - item.quantity,
                actual_Qty: item?.actual_Qty || 0,
                auditor_remarks: item?.auditor_remarks,
                revised_Qty: item?.revised_Qty,
                pM_remarks: item?.pM_remarks,
                pM_Status: "string",
                status: "string",
                createdBy: user?.UserName || "",
                createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
                modifiedBy: user?.UserName || "",
                modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
              };
            });
          let diff = 0;
          data &&
            data?.length > 0 &&
            data?.map((item) => {
              diff += item?.differenceQty;
              return;
            });
          setDiffQty(diff);
          setDocUploadHistory(data || []);
        }
        if (response && response?.data?.length === 0) {
          getData();
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  useEffect(() => {
    if (mandateId && mandateId?.id !== undefined) {
      getBoqData();
    }
  }, [mandateId]);

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

  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );
    return userAction?.runtimeId || 0;
  };

  const workFlowMandate = () => {
    const token = localStorage.getItem("token");
    const body = {
      runtimeId: _getRuntimeId(mandateId.id) || 0,
      mandateId: mandateId?.id || 0, 
      tableId: mandateId?.id || 0,
      remark: "Created",
      createdBy: user?.UserName,
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: "Created",
    };

    axios({
      method: "post",
      url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${
        body?.runtimeId
      }&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${
        body?.createdBy
      }&createdOn=${body.createdOn}&action=${body?.action}&remark=${
        body?.remark || ""
      }`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !!"));
          return;
        }

        if (response?.data === true) {
          dispatch(showMessage("Submitted Successfully!"));
          if (params?.source === "list") {
            navigate("/list/task");
          } else {
            navigate("/mandate");
          }
        } else {
          dispatch(fetchError("Error Occurred !!"));
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  const handleSubmit = (stat_us) => {
    docUploadHistory?.map((item) => {
      item["actual_Qty"] = item?.actual_Qty === "" ? 0 : item?.actual_Qty;
      item["mandateId"] = mandateId?.id;
      item["status"] = stat_us;
      item["id"] = edit ? item?.id : 0;
      item["QtyChanged"] = qtyChanged;
      item["PORequired"] = qtyChanged ? poRequired : null;
      item["fk_BOQ_Item_Det_Id"] = item?.id || 0;
    });
    if (edit === false) {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/BOQ/CreateBOQVerification`,
          docUploadHistory
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (response) {
            dispatch(showMessage("BOQ Verification Successfully!"));
            workFlowMandate();
            return;
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occurred !"));
        });
    } else {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/BOQ/UpdateBOQVerification`,
          docUploadHistory
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (response) {
            dispatch(showMessage("BOQ Updated Successfully!"));
            workFlowMandate();
            return;
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occurred !"));
        });
    }
  };
  const handleQuantity = (e) => {
    setQtyChanged(e.target.value === "true" ? true : false);
  };
  const handlePo = (e) => {
    setPoRequired(e.target.value === "true" ? true : false);
  };
  return (
    <div>
      <Box component="h2" className="page-title-heading my-6">
        Asset Verification 
      </Box>
      <div
        style={{
          padding: "10px !important",
          border: "1px solid rgba(0, 0, 0, 0.12)",
        }}
        className="card-panal inside-scroll-233-veri boqverification"
      >
        <MandateInfo
          mandateCode={mandateId}
          pageType=""
          source=""
          redirectSource={`${params?.source}`}
          setMandateCode={setMandateId}
          setMandateData={setMandateData}
          setpincode={() => {}}
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
                quality-audit-report
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
        <div
          style={{
            height: "calc(100vh - 464px)",
            marginTop: "10px",
            marginBottom: "10px",
          }}
        >
          <CommonGrid
 
            getRowStyle={() => {
              return { background: "white" };
            }}
            components={components}
            rowHeight={36}
            defaultColDef={{ singleClickEdit: true, flex: 1 }}
            
            columnDefs={columnDefs}
            rowData={docUploadHistory || []}
            onGridReady={onGridReady}
            gridRef={gridRef}
            pagination={false}
            paginationPageSize={null}
          />
        </div>
        {mandateId && mandateId?.id !== undefined && (
          <DataTable mandateId={mandateId?.id} pathName={module} />
        )}
        {mandateId &&
          mandateId?.id !== undefined &&
          mandateId?.id !== "noid" && (
            <div className="bottom-fix-history">
              <MandateStatusHistory
                mandateCode={mandateId?.id}
                accept_Reject_Remark={currentRemark}
                accept_Reject_Status={currentStatus}
              />
            </div>
          )}
        {user?.role === "Quality Auditor" &&
          diffQty !== null &&
          diffQty === 0 && (
            <div className="bottom-fix-btn">
              <Button
                variant="outlined"
                size="medium"
                onClick={(e) => handleSubmit("Activity Completed")}
                style={{
                  marginLeft: 10,
                  padding: "2px 20px",
                  borderRadius: 6,
                  color: "#fff",
                  borderColor: "#00316a",
                  backgroundColor: "#00316a",
                }}
              >
                Activity Completed
              </Button>
            </div>
          )}
        {user?.role === "Quality Auditor" &&
          diffQty !== null &&
          diffQty !== 0 && (
            <div className="bottom-fix-btn">
              <Button
                variant="outlined"
                size="medium"
                onClick={(e) => handleSubmit("Send Back To PM")}
                style={{
                  marginLeft: 10,
                  padding: "2px 20px",
                  borderRadius: 6,
                  color: "#fff",
                  borderColor: "#00316a",
                  backgroundColor: "#00316a",
                }}
              >
                Send Back To PM
              </Button>
            </div>
          )}
        {user?.role !== "Quality Auditor" && (
          <Grid
            marginBottom="10px"
            marginTop="5px"
            container
            item
            spacing={5}
            justifyContent="start"
            alignSelf="center"
            sx={{ paddingTop: "0px!important" }}
          >
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div>
                <h2 className="phaseLable">Quantity Changed</h2>
                <ToggleSwitch
                  alignment={qtyChanged}
                  handleChange={(e) => handleQuantity(e)}
                  yes={"Yes"}
                  no={"No"}
                  name={"Qty"}
                  id="Qty"
                  onBlur={() => {}}
                  disabled={action === "Approve"}
                  bold="false"
                />
              </div>
            </Grid>
            {qtyChanged && (
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div>
                  <h2 className="phaseLable">Po Required</h2>
                  <ToggleSwitch
                    alignment={poRequired}
                    handleChange={(e) => handlePo(e)}
                    yes={"Yes"}
                    no={"No"}
                    name={"Qty"}
                    id="Qty"
                    onBlur={() => {}}
                    disabled={action === "Approve"}
                    bold="false"
                  />
                </div>
              </Grid>
            )}
          </Grid>
        )}
        {user?.role !== "Quality Auditor" &&
          action !== "Approve" &&
          poRequired &&
          qtyChanged && (
            <div className="bottom-fix-btn">
              <Button
                variant="outlined"
                size="medium"
                onClick={(e) => handleSubmit("Send For Approval")}
                style={{
                  marginLeft: 10,
                  padding: "2px 20px",
                  borderRadius: 6,
                  color: "#fff",
                  borderColor: "#00316a",
                  backgroundColor: "#00316a",
                }}
              >
                Send For Approval
              </Button>
            </div>
          )}
        {user?.role !== "Quality Auditor" &&
          action !== "Approve" &&
          qtyChanged &&
          !poRequired && (
            <div className="bottom-fix-btn">
              <Button
                variant="outlined"
                size="medium"
                onClick={(e) => handleSubmit("Send For Penalty Calculation")}
                style={{
                  marginLeft: 10,
                  padding: "2px 20px",
                  borderRadius: 6,
                  color: "#fff",
                  borderColor: "#00316a",
                  backgroundColor: "#00316a",
                }}
              >
                Send For Penalty Calculation
              </Button>
            </div>
          )}
        {user?.role !== "Quality Auditor" &&
          action !== "Approve" &&
          !qtyChanged && (
            <div className="bottom-fix-btn">
              <Button
                variant="outlined"
                size="medium"
                onClick={(e) => handleSubmit("Activity Completed")}
                style={{
                  marginLeft: 10,
                  padding: "2px 20px",
                  borderRadius: 6,
                  color: "#fff",
                  borderColor: "#00316a",
                  backgroundColor: "#00316a",
                }}
              >
                Activity Completed
              </Button>
            </div>
          )}
        {action && action === "Approve" && (
          <div className="bottom-fix-btn ptb-0">
            <div className="remark-field" style={{ padding: "15px 0px" }}>
              <>
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
              </>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityVerification;
