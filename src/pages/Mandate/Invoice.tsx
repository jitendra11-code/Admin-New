import {
  Autocomplete,
  Button,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import { secondaryButton, submit } from "shared/constants/CustomColor";
import axios from "axios";
import {
  downloadFile,
  _validationMaxFileSizeUpload,
} from "./DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import groupByDocumentData from "./DocumentUploadMandate/Components/Utility/groupByDocumentData";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import DownloadIcon from "@mui/icons-material/Download";
import moment from "moment";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import { AppState } from "redux/store";
import { useLocation, useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import { useUrlSearchParams } from "use-url-search-params";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";

const MAX_COUNT = 8;

const bOQValue = {
  key: "Vendor Invoice",
  name: "Vendor Invoice",
};
const Invoice = ({
  mandateId,
  currentStatus,
  currentRemark,
  vendorId,
  vendor,
}) => {
  const dispatch = useDispatch();
  const [approvedStatus, setApprovedStatus] = useState(false);
  const [projectPlanData, setProjectPlanData] = useState([]);
  const [boqDrp, setBoQ] = React.useState<any>(bOQValue);
  const [docType, setDocType] = React.useState<any>(null);
  const fileInput = React.useRef(null);
  const [fileLimit, setFileLimit] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [fileLength, setFileLength] = React.useState(0);
  const [versionHistoryData, setVersionHistoryData] = React.useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [remark, setRemark] = React.useState("");
  const [fileUploadRemark, setFileUploadRemark] = React.useState("");
  const [sendBack, setSendBack] = React.useState(false);
  const [rejected, setRejected] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [params] = useUrlSearchParams({}, {});
  const navigate = useNavigate();
  const { user } = useAuthUser();

  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );

    return userAction?.runtimeId || 0;
  };

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

  const workflowFunctionAPICall = (
    runtimeId,
    mandateId,
    tableId,
    remark,
    action,
    navigate,
    user
  ) => {
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

  const workFlowMandate = () => {
    if (versionHistoryData?.length == 0) {
      dispatch(fetchError("Please upload document"));
    } else if (vendor?.vendorname == "" || vendor.vendorcategory == "") {
      dispatch(fetchError("Please select vendor name and category"));
    } else {
      const token = localStorage.getItem("token");
      const body = {
        runtimeId: _getRuntimeId(mandateId.id) || 0,
        mandateId: mandateId?.id || 0, 
        tableId: vendorId || 0,
        remark: "Created",
        createdBy: user?.UserName,
        createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        action: "Created", 
      };
      axios({
        method: "post",
        url: `${process.env.REACT_APP_BASEURL
          }/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId
          }&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn
          }&action=${body?.action}&remark=${body?.remark || ""}`,
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response: any) => {
          if (!response) return;
          if (response?.data === true) {
            dispatch(showMessage("Vendor Invoice submitted successfully "));
            navigate("/list/task");
          }
         
        })
        .catch((e: any) => { });
    }
  };

  const handleUploadFiles = async (e, files) => {
    const uploaded = [...uploadedFiles];
    let limitExceeded = false;
    files &&
      files?.some((file) => {
        if (
          uploaded &&
          uploaded?.findIndex((f) => f.name === file.name) === -1
        ) {
          uploaded.push(file);
          if (uploaded?.length === MAX_COUNT) setFileLimit(true);
          if (uploaded?.length > MAX_COUNT) {
            dispatch(
              fetchError(
                `You can only add a maximum of ${MAX_COUNT} files` || ""
              )
            );
            setFileLimit(false);
            limitExceeded = true;
            e.target.value = null;
            return;
          }
        }
      });
    if (limitExceeded) {
      dispatch(
        fetchError(`You can only add a maximum of ${MAX_COUNT} files` || "")
      );
      e.target.value = null;
      return;
    }

    if (!limitExceeded) setUploadedFiles(uploaded);
    setFileLength((uploaded && uploaded?.length) || 0);
    const formData: any = new FormData();
    formData.append("mandate_id", mandateId?.id || 0);
    formData.append("documenttype", "Vendor Invoice");
    formData.append("CreatedBy", user?.UserName );
    formData.append("ModifiedBy", user?.UserName );
    formData.append("entityname", "Vendor Invoice");
    formData.append("RecordId", vendorId || 0);

    uploaded &&
      uploaded?.map((file) => {
        formData.append("file", file);
      });
    if (uploaded?.length === 0) {
      setUploadedFiles([]);
      setFileLimit(false);
      dispatch(fetchError("Error Occurred !"));
      e.target.value = null;
      return;
    }

    if (mandateId?.id !== undefined) {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`,
          formData
        )
        .then((response: any) => {
          e.target.value = null;
          if (!response) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (response?.data?.data == null) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Documents are not uploaded!"));
            getVersionHistoryData(vendorId || 0);
            return;
          } else if (response?.status === 200) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(showMessage("Documents are uploaded successfully!"));
            getVersionHistoryData(vendorId || 0);
          }
        })
        .catch((e: any) => {
          e.target.value = null;
          dispatch(fetchError("Error Occurred !"));
        });
    }
  };
  const getVersionHistoryData = (vendorId) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId?.id || 0
        }&documentType=Vendor Invoice&recordId=${vendorId || 0}`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }

        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
          data = data?.map((item) => {
            item["recordId"] = vendorId;
            return item;
          });
          setVersionHistoryData(data || []);
        }
        if (response && response?.data?.length === 0) {
          setVersionHistoryData([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  useEffect(() => {
    if (mandateId?.id !== undefined && vendorId) {
      getVersionHistoryData(vendorId || 0);
    }
  }, [mandateId?.id, vendorId]);

  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch)) {
      handleUploadFiles(e, chosenFiles);
    }
  };

  const defineStatusOfUploadByUser = useCallback(
    (user) => {
      var status = false;
      if (docType?.documentName === "Additional Document") {
        return false;
      } else if (
        user?.role === "Compliance Associate" &&
        docType?.documentName !== "RBI Intimation"
      ) {
        return true;
      } else if (
        user?.role === "Compliance Associate" &&
        docType?.documentName === "RBI Intimation"
      ) {
        return false;
      } else if (
        user?.role === "Sourcing Associate" &&
        docType?.documentName === "LOA"
      ) {
        return true;
      } else if (
        user?.role === "Sourcing Associate" &&
        docType?.documentName !== "LOA"
      ) {
        return false;
      } else if (
        user?.role === "Legal Associate" &&
        docType?.documentName === "LOA"
      ) {
        return false;
      } else if (
        user?.role === "Legal Associate" &&
        docType?.documentName !== "LOA"
      ) {
        return true;
      }

      return false;
    },
    [user, docType, setDocType]
  );

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

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
      width: 80,
      minWidth: 70,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "documenttype",
      headerName: "Report Type",
      headerTooltip: "Report Type",
      sortable: true,
      resizable: true,
    
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "filename",
      headerName: "File Name",
      headerTooltip: "File Name",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.filename;
        data = data?.split(".");
        data = data?.[0];
        return data || "";
      },
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      headerTooltip: "Created Date",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        return moment(e?.data?.createdDate).format("DD/MM/YYYY");
      },
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Created Time",
      headerTooltip: "Created Time",
      cellRenderer: (e: any) => {
        return moment(e?.data?.createdDate).format("h:mm:ss A");
      },
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Download",
      headerName: "Download",
      headerTooltip: "Download",
      resizable: true,
      width: 110,
      minWidth: 80,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (obj: any) => (
        <>
          <div className="actions">
            <Tooltip title="Download" className="actionsIcons">
              <DownloadIcon
                style={{ fontSize: "15px" }}
                onClick={() => downloadFile(obj?.data, mandateId, dispatch)}
                className="actionsIcons"
              />
            </Tooltip>
          </div>
        </>
      ),
    },
    {
      field: "",
      headerName: "View",
      headerTooltip: "View",
      resizable: true,
      width: 110,
      minWidth: 80,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (obj: any) => (
        <>
          <div className="actions">
            <FileNameDiaglogList props={obj} />
          </div>
        </>
      ),
    },
  ];

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (versionHistoryData && versionHistoryData?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [versionHistoryData, docType]);
  const getHeightForProjectPlan = useCallback(() => {
    var height = 0;
    var dataLength = (projectPlanData && projectPlanData?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 56;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [projectPlanData, docType]);
  useMemo(() => {
    if (mandateId?.id !== undefined && vendorId !== undefined)
      axios
        .get(
          `${process.env.REACT_APP_BASEURL
          }/api/PenaltyDetails/GetApproveInvoice?mandateid=${mandateId?.id || 0
          }&TableID=${vendorId || 0}&RoleName=${user?.role}`
        )
        .then((response: any) => {
          if (!response) setApprovedStatus(false);
          if (response && response?.data === true) {
            setApprovedStatus(true);
          } else {
            setApprovedStatus(false);
          }
        })
        .catch((e: any) => { });
  }, [mandateId, vendorId, user?.role]);

  return (
    <>
      <div>
        {" "}
        <Grid
          container
          item
          display="flex"
          flexDirection="row"
          spacing={5}
          justifyContent="start"
          alignSelf="center"
        >
          <Grid item xs={6} md={3}>
            <Autocomplete
              disablePortal
              sx={{ backgroundColor: "#f3f3f3", borderRadius: "6px" }}
              id="combo-box-demo"
              getOptionLabel={(option) => {
                return option?.name?.toString() || "";
              }}
              disableClearable
              disabled
              options={[boqDrp] || []}
            
              placeholder="Document Type"
              value={boqDrp || null}
              renderInput={(params) => (
                <TextField
                  name="state"
                  id="state"
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    style: { height: `35 !important` },
                  }}
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </Grid>
          <Grid item xs={6} md={6}>
            <div style={{ display: "flex" }}>
              
              <div>
                <Button
                  onClick={() => {
                    if (mandateId?.id === undefined) {
                      dispatch(fetchError("Please select Mandate !!!"));
                      return;
                    }
                    fileInput.current.click();
                  }}
                  sx={
                    (defineStatusOfUploadByUser(user) ||
                      (action &&
                        action === "Approve" &&
                        !approvedStatus &&
                        vendor?.vendorname != "" &&
                        vendorId !== 0)) && {
                      backgroundColor: "#f3f3f3",
                      borderRadius: "6px",
                    }
                  }
                  disabled={
                    defineStatusOfUploadByUser(user) ||
                    (action &&
                      action === "Approve" &&
                      !approvedStatus &&
                      vendor?.vendorname != "" &&
                      vendorId !== 0)
                  }
                  variant="outlined"
                  size="medium"
                  style={secondaryButton}
                >
                  Upload
                </Button>
                <input
                  ref={fileInput}
                  multiple
                  onChange={handleFileEvent}
                  disabled={
                    fileLimit ||
                    (action &&
                      action === "Approve" &&
                      !approvedStatus &&
                      vendor?.vendorname != "" &&
                      vendorId !== 0)
                  }
                  accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
text/plain, application/pdf, image/*"
                  type="file"
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </Grid>
        </Grid>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <Typography>Version History</Typography>{" "}
        </div>
        <div style={{ height: getHeightForTable(), marginTop: "10px" }}>
          <CommonGrid
            defaultColDef={{ flex: 1 }}
            columnDefs={columnDefs}
            rowData={versionHistoryData || []}
            onGridReady={onGridReady}
            gridRef={gridRef}
            pagination={false}
            paginationPageSize={null}
          />
        </div>
      </div>
      {mandateId && mandateId?.id && mandateId?.id !== undefined && (
        <div className="bottom-fix-history">
          <MandateStatusHistory
            mandateCode={mandateId?.id}
            accept_Reject_Remark={currentRemark}
            accept_Reject_Status={currentStatus}
          />
        </div>
      )}
      {action === "View" && runtimeId === -1 && (
        <div className="bottom-fix-btn">
          <div className="remark-field">
          
            {userAction?.stdmsg !== undefined && (
              <span className="message-right-bottom">{userAction?.stdmsg}</span>
            )}
          </div>
        </div>
      )}

      {userAction?.module === module && (
        <>
          {action && (action === "Create" || action === "Upload") && (
            <div className="bottom-fix-btn">
              <div className="remark-field">
                <Button
                  variant="contained"
                  type="submit"
                  size="small"
                  style={submit}
                  onClick={workFlowMandate}
                >
                  Send for Approval
                </Button>
                {userAction?.stdmsg !== undefined && (
                  <span className="message-right-bottom">
                    {userAction?.stdmsg}
                  </span>
                )}
              </div>
            </div>
          )}
          {action &&
            action === "Approve" &&
            !approvedStatus &&
            vendor?.vendorname != "" &&
            vendorId !== 0 && (
              <>
                <div className="bottom-fix-btn">
                  <div className="remark-field">
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
                          vendorId,
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
                          vendorId,
                          remark,
                          "Sent Back",
                          navigate,
                          user
                        );
                      }}
                    />
                    <span className="message-right-bottom">
                      {userAction?.stdmsg}
                    </span>
                  </div>
                </div>
              </>
            )}
        </>
      )}
    </>
  );
};

export default Invoice;
