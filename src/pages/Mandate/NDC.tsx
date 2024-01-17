import {
  Autocomplete,
  Box,
  Button,
  Grid,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import { secondaryButton, submit } from "shared/constants/CustomColor";
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import axios from "axios";
import {
  downloadFile,
  downloadTemplate,
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
import { Tooltip } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MandateInfo from "pages/common-components/MandateInformation";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { Link } from "react-router-dom";
import { useUrlSearchParams } from "use-url-search-params";
import { AppState } from "redux/store";
import ApproveSendBackRejectAction from "pages/common-components/ApproveSendBackRejectAction";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";

const MAX_COUNT = 8;

const bOQValue = {
  key: "No Dues Certificate",
  name: "No Dues Certificate",
};
const NDC = () => {
  const dispatch = useDispatch();
  let { id } = useParams();
  const navigate = useNavigate();
  const [params] = useUrlSearchParams({}, {});
  const [vendor, setVendor] = React.useState<any>({
    vendorname: "",
    vendorId: 0,
    id: 0,
    vendorcategory: "",
  });

  const [vendorInformation, setVendorInformation] = React.useState([]);
  const [vendorCatInformation, setVendorCatInformation] = React.useState([]);
  const [mandateId, setMandateId] = React.useState(null);
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [mandateData, setMandateData] = React.useState({});
  const [projectPlanData, setProjectPlanData] = useState([]);
  const [boqDrp, setBoQ] = React.useState<any>(bOQValue);
  const [docType, setDocType] = React.useState<any>(null);
  const fileInput = React.useRef(null);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const [fileLimit, setFileLimit] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [fileLength, setFileLength] = React.useState(0);
  const [userAction, setUserAction] = React.useState(null);
  const [docUploadHistory, setDocUploadHistory] = React.useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const { user } = useAuthUser();
  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [remark, setRemark] = useState("");
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const [rejected, setRejected] = React.useState(false);
  const [value, setValue] = React.useState("3");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

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
    }
  }, [mandateId]);

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
    formData.append("documenttype", "No Dues Certificate");
    formData.append("CreatedBy", user?.UserName );
    formData.append("ModifiedBy", user?.UserName );
    formData.append("entityname", "No Dues Certificate");
    formData.append("RecordId", vendor?.vendorId || 0);

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
            getVersionHistoryData(vendor?.vendorId || 0);
            return;
          } else if (response?.status === 200) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(showMessage("Documents are uploaded successfully!"));
            getVersionHistoryData(vendor?.vendorId || 0);
          }
        })
        .catch((e: any) => {
          e.target.value = null;
          dispatch(fetchError("Error Occurred !"));
        });
    }
  };
  const getVersionHistoryData = (recordId) => {
    axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/ImageStorage/GetDocUploadHistory?mandateid=${
          mandateId?.id
        }&documentType=No Dues Certificate&recordId=${recordId || 0}`
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
    if (mandateId?.id !== undefined && vendor?.vendorId) {
      getVersionHistoryData(vendor?.vendorId);
    }
  }, [mandateId?.id, vendor?.vendorId]);

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
      minWidth: 80,
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

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [docUploadHistory, docType]);
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
      createdBy: user?.UserName ,
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
          dispatch(showMessage("No Dues Certificate Submitted Successfully!"));
          navigate("/list/task");
        }
      })
      .catch((e: any) => {});
  };

  useEffect(() => {
    if (
      mandateId &&
      mandateId?.id !== undefined &&
      mandateId?.id !== "noid" &&
      user &&
      user?.role === "Vendor"
    ) {
      const obj = { vendorcategory: user?.vendorType || "" };
      const data = [
        {
          vendorcategoryKey: user?.vendorType || "",
          vendorcategory: user?.vendorType || "",
        },
      ];
      setVendor((state) => ({
        ...state,
        vendorcategoryKey: user?.vendorType || "",
        vendorcategory: user?.vendorType || "",
      }));

      setVendorCatInformation([...data]);
      handelCategoryChange("e", obj);
    }
  }, [mandateId?.id]);
  const handelCategoryChange = (e, value) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PODetails/GetVendorDropDown?mandateId=${mandateId?.id}&vendorCategory=${value?.vendorcategory}`
      )
      .then((response) => {
        if (!response) return;
        if (
          user?.role === "Vendor" &&
          response?.data &&
          response?.data?.length === 1
        ) {
          setVendor({
            vendorname: response?.data?.[0]?.vendorname || "",
            vendorId: response?.data?.[0]?.id || 0,
            id: response?.data?.[0]?.id || 0,
            vendorcategory: user?.vendorType || "",
          });
        }
        if (
          user?.role !== "Vendor" &&
          response?.data &&
          response?.data?.length === 1
        ) {
          setVendor({
            vendorname: response?.data?.[0]?.vendorname || "",
            vendorId: response?.data?.[0]?.id || 0,
            id: response?.data?.[0]?.id || 0,
            vendorcategory: response?.data?.[0]?.vendorcategory || 0,
          });
        }
        setVendorInformation(response?.data);
      })
      .catch((err) => {});
  };

  const getVendorCategory = () => {
    axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/PODetails/GetVendorCategoryByMandateId?mandateId=${
          mandateId?.id === undefined ? mandateId : mandateId?.id
        }`
      )
      .then((response) => {
        setVendorCatInformation(response?.data);
      })
      .catch((err) => {});
  };
  useEffect(() => {
    if (
      mandateId &&
      mandateId?.id !== undefined &&
      mandateId?.id !== "noid" &&
      user &&
      user?.role !== "Vendor"
    ) {
      getVendorCategory();
    }
  }, [mandateId]);
  return (
    <>
      <div className="invoicing">
        <Box component="h2" className="page-title-heading my-6">
          Invoicing
        </Box>

        <div
          style={{
            backgroundColor: "#fff",
            padding: "0px",
            border: "1px solid #0000001f",
            borderRadius: "5px",
          }}
          className="card-panal inside-scroll-194-invoicing"
        >
          <div style={{ padding: "10px" }}>
            <MandateInfo
              mandateCode={mandateId}
              setMandateData={setMandateData}
              source=""
              pageType=""
              redirectSource={"list"}
              setMandateCode={setMandateId}
              setCurrentStatus={setCurrentStatus}
              setCurrentRemark={setCurrentRemark}
              setpincode={() => {}}
            />
          </div>
          <div className="phase-outer" style={{ paddingLeft: "10px" }}>
            <Grid
              marginBottom="2px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Vendor Category</h2>

                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    sx={
                      user?.role === "Vendor" && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }
                    }
                    getOptionLabel={(option) => {
                      return option?.vendorcategory?.toString() || "";
                    }}
                    disabled={user?.role === "Vendor"}
                    disableClearable
                    options={vendorCatInformation || []}
                    placeholder="Vendor Category"
                    onChange={(e, value: any) => {
                      setVendor((state) => ({
                        ...state,
                        vendorname: value?.vendorname || "",
                        vendorId: value?.id || 0,
                        id: value?.id || 0,
                        vendorcategory: value?.vendorcategory || "",
                      }));
                      handelCategoryChange(e, value);
                    }}
                    value={vendor || null}
                    renderInput={(params) => (
                      <TextField
                        name="vendor_category"
                        id="vendor_category"
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
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Vendor Name</h2>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    sx={
                      user?.role === "Vendor" &&
                      vendorInformation &&
                      vendorInformation?.length === 1 && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }
                    }
                    disabled={
                      user?.role === "Vendor" &&
                      vendorInformation &&
                      vendorInformation?.length === 1
                    }
                    getOptionLabel={(option) => {
                      return option?.vendorname?.toString() || "";
                    }}
                    disableClearable
                    options={vendorInformation || []}
                    onChange={(e, value: any) => {
                      setVendor((state) => ({
                        ...state,
                        vendorname: value?.vendorname || "",
                        vendorId: value?.id || 0,
                        id: value?.id || 0,
                        vendorcategory: value?.vendorcategory || "",
                      }));
                    }}
                    value={
                      user?.role === "Vendor" &&
                      vendorInformation &&
                      vendorInformation?.length === 1
                        ? vendorInformation?.[0]
                        : vendor || null
                    }
                    placeholder="Vendor Name"
                    renderInput={(params) => (
                      <TextField
                        name="vendor_name"
                        id="vendor_name"
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
                </div>
              </Grid>
            </Grid>
          </div>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                <Tab
                  label="Invoice"
                  value="1"
                  to={`/mandate/${id}/invoicing`}
                  component={Link}
                />
                <Tab
                  label="PO"
                  value="2"
                  to={`/mandate/${id}/quality-po`}
                  component={Link}
                />
                <Tab
                  label="NDC"
                  value="3"
                  to={`/mandate/${id}/ndc`}
                  component={Link}
                />
                <Tab
                  label="PENALTY CALCULATION"
                  value="4"
                  to={`/mandate/${id}/penalty-calculation`}
                  component={Link}
                />
              </TabList>
            </Box>
          </TabContext>
          <Grid
            container
            item
            display="flex"
            flexDirection="row"
            spacing={5}
            justifyContent="start"
            alignSelf="center"
            style={{ padding: "10px" }}
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
                      if (vendor?.vendorcategory === "") {
                        dispatch(fetchError("Please select Vendor Category"));
                        return;
                      }
                      if (vendor?.vendorname === "") {
                        dispatch(fetchError("Please select Vendor Name"));
                        return;
                      }
                      fileInput.current.click();
                    }}
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
          <div style={{ padding: "10px", paddingTop: "0px" }}>
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
                rowData={docUploadHistory || []}
                onGridReady={onGridReady}
                gridRef={gridRef}
                pagination={false}
                paginationPageSize={null}
              />
            </div>
          </div>

          {vendor &&
            vendor?.vendorname !== "" &&
            vendor?.vendorcategory !== "" && (
              <>
                {userAction?.module === module && (
                  <>
                    {action && (action === "Create" || action === "Upload") && (
                      <div className="bottom-fix-btn">
                        <div className="remark-field">
                          <Button
                            variant="contained"
                            size="small"
                            style={submit}
                            onClick={() => {
                              if (mandateId?.id === undefined) {
                                dispatch(
                                  fetchError("Please select Mandate !!!")
                                );
                                return;
                              }
                              if (
                                docUploadHistory &&
                                docUploadHistory?.length === 0
                              ) {
                                dispatch(fetchError("Please upload file"));
                                return;
                              }
                              workflowFunctionAPICall(
                                runtimeId,
                                mandateId?.id,
                                vendor?.vendorId,
                                "Created",
                                "Created",
                                navigate,
                                user
                              );
                            }}
                          >
                            Submit
                          </Button>
                          {userAction?.stdmsg !== undefined && (
                            <span className="message-right-bottom">
                              {userAction?.stdmsg}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {action && action === "View" && (
                      <div className="bottom-fix-btn">
                        {userAction?.stdmsg !== undefined && (
                          <span className="message-right-bottom">
                            {userAction?.stdmsg}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}

                {vendor?.vendorId && action && action === "Approve" && (
                  <div className="bottom-fix-btn ptb-0">
                    <div
                      className="remark-field"
                      style={{ padding: "15px 0px" }}
                    >
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
                    </div>
                  </div>
                )}
                {vendor?.vendorId &&
                  action &&
                  action?.trim() === "Approve or Reject" && (
                    <>
                      <div className="bottom-fix-btn">
                        <div className="remark-field">
                          <ApproveSendBackRejectAction
                            approved={approved}
                            sendBack={sendBack}
                            setSendBack={setSendBack}
                            setApproved={setApproved}
                            rejected={rejected}
                            setRejected={setRejected}
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
                                "Sent back",
                                navigate,
                                user
                              );
                            }}
                            rejectEvent={() => {
                              workflowFunctionAPICall(
                                runtimeId,
                                mandateId?.id,
                                vendor?.vendorId,
                                remark,
                                "Rejected",
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
          {mandateId && mandateId?.id && mandateId?.id !== undefined && (
            <div className="bottom-fix-history">
              <MandateStatusHistory
                mandateCode={mandateId?.id}
                accept_Reject_Remark={currentRemark}
                accept_Reject_Status={currentStatus}
              />
            </div>
          )}
        </div>
      </div>
     
    </>
  );
};

export default NDC;
