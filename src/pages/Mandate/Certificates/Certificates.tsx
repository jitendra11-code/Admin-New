import {
  Grid,
  Button,
  TextField,
  Autocomplete,
  Stack,
  Box,
} from "@mui/material";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import MandateInfo from "pages/common-components/MandateInformation";
import React, { useCallback, useEffect, useState } from "react";
import { useUrlSearchParams } from "use-url-search-params";
import { fetchError,  showMessage } from "redux/actions";
import { secondaryButton } from "shared/constants/CustomColor";
import { useDispatch, useSelector } from "react-redux";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import {
  downloadFile,
  downloadTemplate,
  _validationMaxFileSizeUpload,
} from "../DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import groupByDocumentData from "../DocumentUploadMandate/Components/Utility/groupByDocumentData";
import DownloadIcon from "@mui/icons-material/Download";
import FileNameDiaglogList from "../DocumentUploadMandate/Components/Utility/Diaglogbox";
import moment from "moment";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";
import workflowFunctionAPICall from "../workFlowActionFunction";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SHOW_MESSAGE } from "types/actions/Common.action";
import { AppState } from "redux/store";
import { Tooltip } from "@mui/material";

const notesValue = {
  key: "Certificates",
  name: "Certificates",
};
const MAX_COUNT = 8;

const Certificates = () => {
  const navigate = useNavigate();
  const [mandateId, setMandateId] = React.useState(null);
  const [mandateInfo, setMandateData] = React.useState(null);
  let { id } = useParams();
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [params] = useUrlSearchParams({}, {});
  const [notesDrp, setNotesDrp] = useState<any>(notesValue);
  const [docType, setDocType] = useState<any>(null);
  const [projectPlanData, setProjectPlanData] = useState([]);
  const dispatch = useDispatch();
  const fileInput = React.useRef(null);
  const { user } = useAuthUser();
  const [fileLimit, setFileLimit] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileLength, setFileLength] = useState(0);
  const [docUploadHistory, setDocUploadHistory] = useState([]);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [remark, setRemark] = useState("");
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
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
      if (apiType === "" && userAction !== undefined) {
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
        dispatch({
          type: SHOW_MESSAGE,
          message: "Certificates added Successfully!",
        });
        if (!response) return;
        if (response?.data === true) {
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
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      width: 30,
      minWidth: 50,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "documenttype",
      headerName: "Report Type",
      headerTooltip: "Report Type",
      sortable: true,
      resizable: true,
      
      width: 500,
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
      width: 180,
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
      width: 180,
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
      resizable: true,
      width: 110,
      minWidth: 100,
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

  const getVersionHistoryData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId?.id}&documentType=Certificates`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }

        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
          setDocUploadHistory(data || []);
          // dispatch(showMessage("Documents are already uploaded!"));
        }
        if (response && response?.data?.length === 0) {
          setDocUploadHistory([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
        // action.resetForm();
      });
  };
  useEffect(() => {
    if (mandateId?.id !== undefined) {
      getVersionHistoryData();
    }
  }, [mandateId?.id]);

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
    formData.append("documenttype", "Certificates");
    formData.append("CreatedBy", user?.UserName || "");
    formData.append("ModifiedBy", user?.UserName || "");
    formData.append("entityname", "Certificates");
    formData.append("RecordId", mandateId?.id);

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
            getVersionHistoryData();
            return;
          } else if (response?.status === 200) {
            setUploadedFiles([]);
            setFileLimit(false);
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

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [docUploadHistory, docType]);
  const getHeightForProjectPlan = useCallback(() => {
    var height = 0;
    var dataLength = (projectPlanData && projectPlanData?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 56;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [projectPlanData, docType]);

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  return (
    <div
      className="inside-scroll-198"
      style={{
        backgroundColor: "#fff",
        padding: "10px",
        border: "1px solid #0000001f",
        borderRadius: "5px",
      }}
    >
      <Box
        component="h2"
        sx={{
          fontSize: 15,
          color: "text.primary",
          fontWeight: "600",
          margin: "10px !important",
          marginTop: "0px !important",
          mb: {
            xs: 2,
            lg: 2,
          },
        }}
      >
        Certificates
      </Box>

      <>
        <MandateInfo
          mandateCode={mandateId}
          source=""
          pageType=""
          setMandateData={setMandateData}
          redirectSource={`${params?.source}`}
          setMandateCode={setMandateId}
          setpincode={() => {}}
          setCurrentStatus={setCurrentStatus}
          setCurrentRemark={setCurrentRemark}
        />

        <div style={{ margin: "10px" }}>
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
                options={[notesDrp] || []}
              
                placeholder="Document Type"
                value={notesDrp || null}
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
                {docType?.templatePath && (
                  <Button
                    onClick={() => {
                      downloadTemplate(docType);
                    }}
                    variant="outlined"
                    size="medium"
                    style={secondaryButton}
                  >
                    Download Template
                  </Button>
                )}
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
                      defineStatusOfUploadByUser(user) && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }
                    }
                    disabled={defineStatusOfUploadByUser(user)}
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          ></div>

          <div style={{ height: getHeightForTable(), marginTop: "10px" }}>
            <CommonGrid
              defaultColDef={{ flex: 1 }}
              columnDefs={columnDefs}
              rowData={docUploadHistory || []}
              onGridReady={onGridReady}
              gridRef={gridRef}
              pagination={docUploadHistory?.length > 3 ? true : false}
              paginationPageSize={null}
            />
          </div>
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

          {action === "" && runtimeId === 0 && (
            <div className="bottom-fix-btn bg-pd">
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
                      marginLeft: 10,
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
            <>
              {action && action === "Upload" && (
                <div className="bottom-fix-btn-certificates">
                  <div className="remark-field">
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
                            dispatch(fetchError("Please select mandate !!!"));
                            return;
                          }
                          if (
                            docUploadHistory &&
                            docUploadHistory?.length === 0
                          ) {
                            dispatch(fetchError("Please upload file"));
                            return;
                          }
                          workFlowMandate();
                        }}
                        style={{
                          marginLeft: 10,
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

              <div>
                <div className="remark-field">
                  {action && action === "Approve" && (
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
                      <span className="message-right-bottom">
                        {userAction?.stdmsg}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </>
    </div>
  );
};

export default Certificates;
