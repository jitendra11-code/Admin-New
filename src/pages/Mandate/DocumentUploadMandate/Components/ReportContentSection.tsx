import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Grid,
  Button,
  TextField,
  Autocomplete,
  Stack,
} from "@mui/material";
import { secondaryButton } from "shared/constants/CustomColor";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import DataTable from "pages/common-components/Table";
import DownloadIcon from "@mui/icons-material/Download";
import { AgGridReact } from "ag-grid-react";
import { AppState } from "redux/store";
import { useDispatch, useSelector } from "react-redux";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import { useUrlSearchParams } from "use-url-search-params";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import moment from "moment";
import axios from "axios";
import MandateInfo from "pages/common-components/MandateInformation";
import { fetchError, showMessage } from "redux/actions";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";
import ApproveRejectReport from "pages/common-components/ApproveRejectReportStrong";
import workflowFunctionAPICall from "pages/Mandate/workFlowActionFunction";
import {
  downloadFile,
  downloadTemplate,
} from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import { _validationMaxFileSizeUpload } from "./Utility/FileUploadUtilty";
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import { Tooltip } from "@mui/material";
import regExpressionTextField, {
  textFieldValidationOnPaste, regExpressionRemark
} from "@uikit/common/RegExpValidation/regForTextField";
import ApprovedRejectContent from "./ApprovedRejectContent";

declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean;
  }
}

const MAX_COUNT = 8;
const UploadDocuments = ({ documentType }) => {
  const [docType, setDocType] = useState(null);
  const [fileUploadRemark, setFileUploadRemark] = useState("");
  const [reportType, setReportType] = useState({
    doc1: "Structure Stability Report",
    doc2: "Strong Room Door Feasibility Report",
  });
  const navigate = useNavigate();
  const [documentTypeList, setDocumentTypeList] = useState([]);

  const [mandateId, setMandateId] = React.useState(null);
  const [remark, setRemark] = useState("");
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [rejected, setRejected] = React.useState(false);
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [selectedMandate, setSelectedMandate] = useState(null);
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;

  const gridRef = React.useRef<AgGridReact>(null);
  const [docUploadHistory, setDocUploadHistory] = useState([]);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );

  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [params] = useUrlSearchParams({}, {});
  const [mandateInfo, setMandateData] = React.useState(null);
  const [fileLength, setFileLength] = useState(0);
  const [remarks, setRemarks] = useState("");
  const { id } = useParams();
  const { user } = useAuthUser();
  useEffect(() => {
    getDocumentTypeList();
    if (id && id !== "noid") {
      setMandateId(id);
    }
  }, [id]);

  useEffect(() => {
    if (documentTypeList && documentTypeList?.length > 0) {
      var obj =
        documentTypeList &&
        documentTypeList.find((item) => item?.documentName === documentType);
      setDocType(obj || null);
    }
  }, [documentTypeList, setDocumentTypeList]);
  const getDocumentTypeList = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=DocumentMaster`
      )
      .then((response: any) => {
        if (!response) return;
        if (
          response &&
          response?.data &&
          response?.data?.data &&
          response?.data?.data?.length > 0
        ) {
          const res = response?.data?.data?.filter(
            (item) =>
              item.documentName === "Structure Stability Report" ||
              item.documentName === "Stong Room Door Feasibility Report"
          );
          setDocumentTypeList(
            documentType === "Structure Stability Report"
              ? [...res]
              : response?.data?.data
          );
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
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
  }, [mandateId, setMandateId]);

  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );
    return userAction?.runtimeId || 0;
  };

  const _bulkdownloadaZip = () => {
    var list: any = [];
    docUploadHistory &&
      docUploadHistory?.length > 0 &&
      docUploadHistory.map((item) => {
        list?.push(item?.filename);
      });
    if (list && list.length === 0) {
      dispatch(fetchError("No files available to download"));
      return;
    }
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/DownloadZipFile?mandateid=${mandateId?.id}`,
        list,
        {
          responseType: "arraybuffer",
        }
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error occurred in downloading file !!!"));
          return;
        }
        if (response?.data) {
          var filename = response.headers["content-disposition"].split("''")[1];
          if (filename && filename === "") {
            dispatch(fetchError("Error Occurred !"));
            return;
          }

          var blob = new Blob([response?.data], { type: "application/zip" });
          if (typeof window.navigator.msSaveBlob !== "undefined") {
            window.navigator.msSaveBlob(blob, filename);
          } else {
            var blobURL =
              window.URL && window.URL.createObjectURL
                ? window.URL.createObjectURL(blob)
                : window.webkitURL.createObjectURL(blob);
            var tempLink = document.createElement("a");
            tempLink.style.display = "none";
            tempLink.href = blobURL;
            tempLink.setAttribute("download", filename);

            if (typeof tempLink.download === "undefined") {
              tempLink.setAttribute("target", "_blank");
            }

            document.body.appendChild(tempLink);
            tempLink.click();

            setTimeout(function () {
              document.body.removeChild(tempLink);
              window.URL.revokeObjectURL(blobURL);
            }, 200);

            dispatch(showMessage("Document is downloaded successfully!"));
          }
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
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
      url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId
        }&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy
        }&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ""
        }`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response: any) => {
        if (!response) return;
        if (response?.data === true) {
          dispatch(showMessage("Submitted successfully!"));
          navigate("/list/task");
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  let columnDefs = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      flex: 1,
      maxWidth: 80,
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
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
      maxWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "reporttype",
      headerName: "Document Type",
      headerTooltip: "Document Type",
      sortable: true,
      resizable: true,
      minWidth: 150,
      cellRenderer: (e: any) => {
        var data = e.data.documenttype;
        data = data?.split(".");
        data = data?.[0];
        return data || "";
      },
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "remarks",
      headerName: "Remark",
      headerTooltip: "Remark",
      sortable: true,
      resizable: true,

      maxWidth: 220,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "createdDate",
      headerName: "Created Date",
      headerTooltip: "Created Date",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        return moment(e?.data?.createDate).format("DD/MM/YYYY");
      },
      maxWidth: 130,
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
      maxWidth: 130,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
      maxWidth: 110,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "Download",
      headerName: "Download",
      headerTooltip: "Download",
      resizable: true,
      maxWidth: 120,
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
      minWidth: 100,
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

  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const fileInput = React.useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileLimit, setFileLimit] = useState(false);
  const dispatch = useDispatch();

  const getVersionHistoryData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId?.id}&documentType=${docType?.documentName}`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
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
  useEffect(() => {
    if (mandateId?.id !== undefined) {
      getVersionHistoryData();
    }
  }, [mandateId?.id, docType]);

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
    formData.append("mandate_id", mandateId?.id);
    formData.append("documenttype", docType?.documentName);
    formData.append("CreatedBy", user?.UserName || "");
    formData.append("ModifiedBy", user?.UserName || "");
    formData.append("entityname", docType?.documentName);
    formData.append("RecordId", mandateId?.id);
    formData.append("remarks", remarks || "");
    for (var key in uploaded) {
      await formData.append("file", uploaded[key]);
    }

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
          if (!response || response?.data?.status === false) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (response?.data?.data == null) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Documents are not uploaded!"));
            getVersionHistoryData();
            return;
          } else if (response?.status === 200) {
            setRemarks("");
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(showMessage("Documents are uploaded successfully!"));
            getVersionHistoryData();
          }
        })
        .catch((e: any) => {
          e.target.value = null;
          dispatch(fetchError("Error Occurred !"));
        });
    }
  };

  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch)) {
      handleUploadFiles(e, chosenFiles);
    }
  };

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  const defineStatusOfUploadByUser = useCallback(
    (user) => {
      var status = false;
    
      if (
        user?.role !== "Sourcing Associate" &&
        (docType?.documentName === "LOI" ||
          docType?.documentName === "TSR" ||
          docType?.documentName === "Additional Document" ||
          docType?.documentName === "Lease Deed Sign Copy")
      ) {
        return true;
      } else if (
        user?.role !== "Compliance Associate" &&
        docType?.documentName === "RBI Intimation"
      ) {
        return true;
      } else if (
        user?.role !== "Legal Associate" &&
        (docType?.documentName === "Lease Deed" ||
          docType?.documentName === "LOA")
      ) {
        return true;
      }

      return false;
    },
    [user, docType, setDocType]
  );

  const handleChange = (e) => {
    setRemarks(e.target.value);
  };

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [docUploadHistory, docType]);

  return (
    <div
      className={
        window.location.pathname?.includes("project-management")
          ? "inside-scroll-194"
          : window.location.pathname?.includes("lease-deed")
            ? "inside-scroll-267-lease-deed"
            : "inside-scroll-227-stability-report"
      }
      style={{ padding: "5px" }}
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
      <div style={{ margin: "0px 10px 0px 10px" }}>
        <Grid
          container
          item
          display="flex"
          flexDirection="row"
          spacing={4}
          justifyContent="start"
          alignSelf="center"
        >
          <Grid item xs={6} md={3}>
           
            <Autocomplete
              disablePortal
              sx={{
                backgroundColor: "#f3f3f3",
                borderRadius: "6px",
              }}
              id="combo-box-demo"
              getOptionLabel={(option) =>
                option?.documentName?.toString() || ""
              }
              disableClearable={true}
              disabled={documentType && documentType !== "" ? true : false}
              options={documentTypeList || []}
              onChange={(e, value) => {
                setDocType(value);
              }}
              placeholder="Document Type"
              value={docType}
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

          <Grid item xs={6} md={4} sx={{ position: "relative" }}>
            <div>
              <TextField
                name="remarks"
                id="remarks"
                // style={{ padding: "10px", height: "100px" }}
                className="w-85"
                size="small"
                placeholder="Remarks"
                onChange={handleChange}
                value={remarks}
                onKeyDownCapture={(e: any) => {
                  regExpressionRemark(e);
                }}
                onPaste={(e: any) => {
                  if (!textFieldValidationOnPaste(e)) {
                    dispatch(fetchError("You can not paste Spacial characters"))
                  }
                }}
                onKeyDown={(e: any) => {
                  if (e.target.selectionStart === 0 && e.code === "Space") {
                    e.preventDefault();
                    regExpressionRemark(e);
                  }
                }}
              />
            </div>
          </Grid>

          <Grid item xs={6} md={5}>
            <div style={{ display: "flex" }}>
              {docType?.templatePath && (
                <Button
                  onClick={() => {
                    downloadTemplate(docType);
                  }}
                  variant="outlined"
                  size="medium"
                  style={secondaryButton}
                  sx={
                    (action === "Approve" ||
                      action === "Approve or Reject" ||
                      defineStatusOfUploadByUser(user)) && {
                      backgroundColor: "#f3f3f3",
                      borderRadius: "6px",
                    }
                  }
                  disabled={
                    action === "Approve" ||
                    action === "Approve or Reject" ||
                    defineStatusOfUploadByUser(user)
                  }
                >
                  Download Template
                </Button>
              )}
              <div style={{ marginLeft: "7px" }}>
                <Button
                  onClick={() => {
                    if (mandateId?.id === undefined) {
                      dispatch(fetchError("Please select mandate !!!"));
                      return;
                    }
                    fileInput.current.click();
                  }}
                  sx={
                    (action === "Approve" ||
                      action === "Approve or Reject" ||
                      defineStatusOfUploadByUser(user)) && {
                      backgroundColor: "#f3f3f3",
                      borderRadius: "6px",
                    }
                  }
                  disabled={
                    action === "Approve" ||
                    action === "Approve or Reject" ||
                    defineStatusOfUploadByUser(user)
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
                  disabled={fileLimit}
                  accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
                  text/plain, application/pdf, image/*"
                  type="file"
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </Grid>
        </Grid>
      
        {mandateId?.id !== undefined && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography className="section-headingTop">
                Version History
              </Typography>
            </div>

            <div style={{ height: getHeightForTable(), marginTop: "10px" }}>
              <CommonGrid
                defaultColDef={{ flex: 1 }}
                columnDefs={columnDefs}
                rowData={docUploadHistory || []}
                onGridReady={onGridReady}
                gridRef={gridRef}
                pagination={false}
                paginationPageSize={null}
              />
            </div>
          </>
        )}
        <br />
        {mandateId && mandateId?.id !== undefined && (
          <DataTable mandateId={mandateId?.id} pathName={module} />
        )}
      </div>
      <div className="bottom-fix-history" style = {{bottom:"115px"}}>
        <MandateStatusHistory
          mandateCode={mandateId?.id}
          accept_Reject_Remark={currentRemark}
          accept_Reject_Status={currentStatus}
        />
      </div>
      {action === "" && runtimeId === 0 && false && (
        <div className="bottom-fix-btn" style={{ padding: "0px" }}>
          <div className="remark-field" style={{ marginRight: "0px" }}>
            <Stack
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems={"center"}
              alignContent="center"
              sx={{ margin: "10px" }}
              style={{ marginLeft: "-2.7%" }}
            >
              <Button
                variant="outlined"
                size="medium"
                type="submit"
                name="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (mandateId?.id === undefined) {
                    dispatch(fetchError("Please select Mandate !!!"));
                    return;
                  }
                  if (docUploadHistory && docUploadHistory?.length === 0) {
                    dispatch(fetchError("Please upload file"));
                    return;
                  }
                  workFlowMandate();
                }}
                style={{
                  marginLeft: 205,
                  padding: "2px 20px",
                  borderRadius: 6,
                  color: "#fff",
                  borderColor: "#00316a",
                  backgroundColor: "#00316a",
                }}
              >
                SUBMIT
              </Button>
              {userAction?.stdmsg !== undefined && (
                <span className="message-right-bottom">
                  {userAction?.stdmsg}
                </span>
              )}
            </Stack>
          </div>
        </div>
      )}
      {userAction?.module === module && (
        <div className="bottom-fix-btn-content" style={{ padding: "0px" }}>
          <div className="remark-field" style={{ marginRight: "0px" }}>
            {action && action === "Upload" && (
              <Stack
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems={"center"}
                alignContent="center"
                sx={{ margin: "10px" }}
                style={{ marginLeft: "-2.7%" }}
              >
                <Button
                  variant="outlined"
                  size="medium"
                  type="submit"
                  name="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (mandateId?.id === undefined) {
                      dispatch(fetchError("Please select Mandate !!!"));
                      return;
                    }
                    if (docUploadHistory && docUploadHistory?.length === 0) {
                      dispatch(fetchError("Please upload file"));
                      return;
                    }
                    workFlowMandate();
                  }}
                  style={{
                    marginLeft: 205,
                    padding: "2px 20px",
                    borderRadius: 6,
                    color: "#fff",
                    borderColor: "#00316a",
                    backgroundColor: "#00316a",
                  }}
                >
                  SUBMIT
                </Button>
                {userAction?.stdmsg !== undefined && (
                  <span className="message-right-bottom">
                    {userAction?.stdmsg}
                  </span>
                )}
              </Stack>
            )}
            {action && action === "Approve" && (
              <div style={{ padding: "10px 0px" }}>
                <ApprovedRejectContent
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
                <span className="message-right-bottom">
                  {userAction?.stdmsg}
                </span>
              </div>
            )}
            {action && action?.trim() === "Approve or Reject" && (
              <div style={{ padding: "10px 0px" }}>
                <ApproveRejectReport
                  rejected={rejected}
                  setRejected={setRejected}
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
                  rejectEvent={() => {
                    workflowFunctionAPICall(
                      runtimeId,
                      mandateId?.id,
                      remark,
                      "Rejected",
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
                <span className="message-right-bottom">
                  {userAction?.stdmsg}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default UploadDocuments;
