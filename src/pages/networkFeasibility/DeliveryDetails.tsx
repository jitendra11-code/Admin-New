import {
  Button,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  deliveryDetailsInitialValues,
  deliveryDetailsSchema,
} from "@uikit/schemas";
import { useFormik } from "formik";
import { downloadFile } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import React, { useCallback, useMemo } from "react";
import { secondaryButton } from "shared/constants/CustomColor";
import axios from "axios";
import { SHOW_MESSAGE } from "types/actions/Common.action";
import { useDispatch, useSelector } from "react-redux";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import DownloadIcon from "@mui/icons-material/Download";
import moment from "moment";
import { AgGridReact } from "ag-grid-react";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { fetchError, showMessage } from "redux/actions";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppState } from "redux/store";
import { _validationMaxFileSizeUpload } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import regExpressionTextField, {
  textFieldValidationOnPaste, regExpressionRemark
} from "@uikit/common/RegExpValidation/regForTextField";
import { Tooltip } from "@mui/material";
import { useUrlSearchParams } from "use-url-search-params";

const MAX_COUNT = 8;

const DeliveryDetails = ({
  mandateCode,
  mandateData,
  currentStatus,
  currentRemark,
}) => {
  const fileInput = React.useRef(null);
  const [uploadedDoc, setUploadedDoc] = React.useState<any>([]);
  const [deliveryData, setDeliveryData] = React.useState<any>({});
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [docType, setDocType] = React.useState(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [docUploadHistory, setDocUploadHistory] = React.useState([]);
  const [docUploadHistory2, setDocUploadHistory2] = React.useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [fileLimit, setFileLimit] = React.useState(false);
  const [fileLength, setFileLength] = React.useState(0);
  const { user } = useAuthUser();

  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const [userAction, setUserAction] = React.useState(null);
  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [remark, setRemark] = React.useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const apiType = location?.state?.apiType || "";
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const action = userAction?.action || "";
  const [params] = useUrlSearchParams({}, {});
  const runtimeId = userAction?.runtimeId || 0;
  const dispatch = useDispatch();
  const { id } = useParams();

  React.useEffect(() => {
    if (mandateCode && mandateCode?.id !== undefined) {
      const userAction =
        userActionList &&
        userActionList?.find(
          (item) =>
            item?.mandateId === parseInt(mandateCode?.id) &&
            item?.module === module
        );
      if (apiType === "") {
        setUserAction(userAction);
      } else {
        let action = mandateCode;
        setUserAction(action);
      }
      if (params.source === "list") {
        navigate(`/mandate/${mandateCode?.id}/${module}?source=list`, {
          state: { apiType: apiType },
        });
      } else {
        navigate(`/mandate/${mandateCode?.id}/${module}`, {
          state: { apiType: apiType },
        });
      }
    }
  }, [mandateCode]);

  const getVersionHistoryData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateCode?.id}&documentType=Network Delivery`
      )
      .then((response: any) => {
        if (!response) {
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
      .catch((e: any) => { });
  };
  const getVersionHistoryData2 = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateCode?.id}&documentType=Network Feasibility Check`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
          setDocUploadHistory2(data || []);
        }
        if (response && response?.data?.length === 0) {
          setDocUploadHistory2([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  React.useEffect(() => {
    if (mandateCode?.id !== undefined) {
      getVersionHistoryData2();
    }
  }, [mandateCode?.id]);
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
    formData.append("mandate_id", mandateCode?.id);
    formData.append("documenttype", "Network Delivery");
    formData.append("CreatedBy", user?.UserName || "");
    formData.append("ModifiedBy", user?.UserName || "");
    formData.append("entityname", "Network Delivery");
    formData.append("RecordId", mandateCode?.id);
    for (var key in uploaded) {
      await formData.append("file", uploaded[key]);
    }
    if (uploaded?.length === 0) {
      setUploadedFiles([]);
      setFileLimit(false);
      dispatch(fetchError("Error Occurred !"));
      return;
    }
    if (mandateCode?.id !== undefined) {
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
  React.useEffect(() => {
    if (
      mandateCode &&
      mandateCode?.id !== undefined &&
      mandateCode?.id !== "noid"
    ) {
      getVersionHistoryData();
    }
  }, [mandateCode]);

  const handleFileEvent = (e: any) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch)) {
      handleUploadFiles(e, chosenFiles);
    }
    setFieldValue("additionalAttechements", chosenFiles);
    let file = e.currentTarget.files[0];
    let fileURL = URL.createObjectURL(file);
    file.fileURL = fileURL;
    setUploadedDoc([...uploadedDoc, file.fileURL]);
  };

  const getData = async () => {
    setDeliveryData({});
    setFieldValue("linkDeliveryStatus", "");
    setFieldValue("linkDeliveryDate", "");
    setFieldValue("linkDeliveryRemarks", "");

    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/NetworkDetails/GetNetworkDetailsByMandate?mandateId=${mandateCode?.id}`
      )

      .then((response: any) => {
        setDeliveryData(response?.data?.[0]);
        setFieldValue(
          "linkDeliveryStatus",
          response?.data?.[0]?.link_Delivery_Status ?? "Open"
        );
        setFieldValue(
          "linkDeliveryDate",
          response?.data?.[0]?.link_Delivery_Date ?? new Date()
        );
        setFieldValue(
          "linkDeliveryRemarks",
          response?.data?.[0]?.link_Delivery_Remarks ?? ""
        );
      })
      .catch((e: any) => {
      });
  };
  React.useEffect(() => {
    if (
      mandateCode &&
      mandateCode?.id !== undefined &&
      mandateCode?.id !== "noid"
    ) {
      getData();
    }
    return () => {
      setDeliveryData({});
    };
  }, [mandateCode]);

  const {
    values,
    handleBlur,
    handleChange,
    setFieldValue,
    handleSubmit,
    errors,
    setErrors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: deliveryDetailsInitialValues,
    validationSchema: deliveryDetailsSchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: (values, action) => {
      const body = {
        ...deliveryData,
        remarks: "",
        link_Delivery_Status: values?.linkDeliveryStatus || "Open",
        link_Delivery_Date: values?.linkDeliveryDate || null,
        link_Delivery_Remarks: values?.linkDeliveryRemarks || "",
      };
      if (mandateCode?.id === undefined) {
        dispatch(fetchError("Please select Mandate !!!"));
        return;
      }
      if (docUploadHistory && docUploadHistory?.length === 0) {
        dispatch(fetchError("Please upload file"));
        return;
      }
      if (docUploadHistory && docUploadHistory?.length > 0) {
        axios
          .post(
            `${process.env.REACT_APP_BASEURL}/api/NetworkDetails/UpdateNetworkDetails?id=${deliveryData?.id}`,
            body
          )
          .then((response: any) => {
            if (!response) return;
            if (response?.data === true) setDeliveryData({});
            dispatch({
              type: SHOW_MESSAGE,
              message: "Record Updated Successfully!",
            });
            workFlowMandate();
          })
          .catch((e: any) => { });
      }
    },
  });

  React.useEffect(() => {
    setErrors({});
  }, []);

  const columnDefs1 = useMemo(() => {
    return [
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
          return moment(e?.data?.createDate).format("DD/MM/YYYY");
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
          return moment(e?.data?.createDate).format("h:mm:ss A");
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
        cellRendererParams: {
          mandateCode: mandateCode,
        },

        cellRenderer: (obj: any) => (
          <>
            <div className="actions">
              <Tooltip title="Download" className="actionsIcons">
                <DownloadIcon
                  style={{ fontSize: "15px" }}
                  onClick={() =>
                    downloadFile(obj?.data, obj?.mandateCode, dispatch)
                  }
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
  }, [mandateCode?.id]);
  const columnDefs2 = useMemo(() => {
    return [
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
        cellRendererParams: {
          mandateCode: mandateCode,
        },

        cellRenderer: (obj: any) => (
          <>
            <div className="actions">
              <Tooltip title="Download" className="actionsIcons">
                <DownloadIcon
                  style={{ fontSize: "15px" }}
                  onClick={() =>
                    downloadFile(obj?.data, obj?.mandateCode, dispatch)
                  }
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
        minWidth: 110,
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
  }, [mandateCode?.id]);

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

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
      runtimeId: _getRuntimeId(mandateCode.id) || 0,
      mandateId: mandateCode?.id || 0, 
      tableId: mandateCode?.id || 0,
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
          navigate("/list/task");
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [docUploadHistory, docType]);

  const getHeightForTable2 = useCallback(() => {
    var height = 0;
    var dataLength = (docUploadHistory2 && docUploadHistory2?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [docUploadHistory2, docType]);

  const onKeyDown = (e) => {
    e.preventDefault();
  };

  return (
    <>

      <div className="inside-scroll-405">
        <form onSubmit={handleSubmit}>
          <div className="phase-outer" style={{ paddingRight: "10px" }}>
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
                  <h2 className="phaseLable required">
                    Name of Service Provider
                  </h2>
                  <TextField
                    autoComplete="off"
                    name="nameOfServiceProvider"
                    id="nameOfServiceProvider"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={deliveryData?.service_Provider_Name ?? ""}
                    onChange={handleChange}                    
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      regExpressionTextField(e);                      
                    }}
                    onBlur={handleBlur}
                    disabled
                  />
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Date of Visit</h2>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      inputFormat="DD/MM/YYYY"
                      value={deliveryData?.visitDate ?? new Date()}
                      disabled
                      onChange={(newValue) => {
                        setFieldValue("dateOfVisit", newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          onKeyDown={(e) => e?.preventDefault()}
                          {...params}
                          sx={{
                            ".MuiInputBase-input": { height: "5px !important" },
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">
                    Link Feasibility Check Status
                  </h2>
                  <TextField
                    autoComplete="off"
                    name="linkFeasibilityCheckStatus"
                    id="linkFeasibilityCheckStatus"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={deliveryData?.link_Feasibility_Status ?? ""}
                    disabled
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">
                    Link Feasibility Check Remarks
                  </h2>
                  <TextField
                    autoComplete="off"
                    name="linkFeasibilityCheckRemarks"
                    id="linkFeasibilityCheckRemarks"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={deliveryData?.link_Feasibility_Remarks ?? ""}
                    disabled
                    onChange={handleChange}                    
                    onKeyDown={(e: any) => {
                      regExpressionRemark(e);
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onBlur={handleBlur}
                  />
                </div>
              </Grid>

              <Grid item xs={12} md={12}>
                <h2 className="phaseLable">Version History</h2>
                <div
                  style={{ height: getHeightForTable2(), marginTop: "10px" }}
                >
                  <CommonGrid
                    defaultColDef={{ flex: 1 }}
                    columnDefs={columnDefs2}
                    rowData={docUploadHistory2 || []}
                    onGridReady={onGridReady}
                    gridRef={gridRef}
                    pagination={false}
                    paginationPageSize={null}
                  />
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Link Delivery Status</h2>
                  <Select
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="linkDeliveryStatus"
                    id="linkDeliveryStatus"
                    value={values.linkDeliveryStatus ?? "Open"}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <MenuItem value="" style={{ display: "none" }}>
                      <em>Select linkDeliveryStatus</em>
                    </MenuItem>
                    <MenuItem value={"Open"}>Open</MenuItem>
                    <MenuItem value={"Completed"}>Completed</MenuItem>
                  </Select>
                  {touched.linkDeliveryStatus && errors.linkDeliveryStatus ? (
                    <p className="form-error">{errors.linkDeliveryStatus}</p>
                  ) : null}
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Link Delivery Date</h2>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      maxDate={new Date()}
                      inputFormat="DD/MM/YYYY"
                      value={values?.linkDeliveryDate}
                      onChange={(newValue) => {
                        setFieldValue("linkDeliveryDate", newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          sx={{
                            ".MuiInputBase-input": { height: "5px !important" },
                          }}
                          onKeyDown={onKeyDown}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Link Delivery Remarks</h2>
                  <TextField
                    autoComplete="off"
                    name="linkDeliveryRemarks"
                    id="linkDeliveryRemarks"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={
                      values?.linkDeliveryRemarks == null
                        ? ""
                        : values?.linkDeliveryRemarks
                    }
                    onChange={handleChange}                    
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onBlur={handleBlur}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      regExpressionRemark(e);
                    }}
                  />
                  {touched.linkDeliveryRemarks && errors.linkDeliveryRemarks ? (
                    <p className="form-error">{errors.linkDeliveryRemarks}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3}>
                <h2 className="phaseLable required">Additional Attachments</h2>
                <div style={{ display: "flex" }}>
                  <Button
                    onClick={() => {
                      fileInput.current.click();
                    }}
                    sx={{ borderRadius: "6px", width: "100%" }}
                    variant="outlined"
                    style={secondaryButton}
                  >
                    Upload
                  </Button>
                  <input
                    ref={fileInput}
                    multiple
                    onChange={handleFileEvent}
                    accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
text/plain, application/pdf, image/*"
                    type="file"
                    style={{ display: "none" }}
                  />
                </div>
                {touched.additionalAttechements &&
                  errors.additionalAttechements ? (
                  <p className="form-error">{errors.additionalAttechements}</p>
                ) : null}
              </Grid>
              <Grid item xs={12} md={12}>
                <h2 className="phaseLable">Version History</h2>
                <div style={{ height: getHeightForTable(), marginTop: "10px" }}>
                  <CommonGrid
                    defaultColDef={{ flex: 1 }}
                    columnDefs={columnDefs1}
                    rowData={docUploadHistory || []}
                    onGridReady={onGridReady}
                    gridRef={gridRef}
                    pagination={false}
                    paginationPageSize={null}
                  />
                </div>
              </Grid>
            </Grid>
          </div>

          {action === "" && runtimeId === 0 && (
            <div className="bottom-fix-btn">
              <div className="remark-field">
                <Stack
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems={"center"}
                  alignContent="center"
                >
                  <Button
                    variant="outlined"
                    size="medium"
                    type="submit"
                    name="submit"
                    
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
            <div className="bottom-fix-btn">
              <div className="remark-field">
                {action && (action === "Upload" || action === "Create") && (
                  <Stack
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems={"center"}
                    alignContent="center"
                  >
                    <Button
                      variant="outlined"
                      size="medium"
                      type="submit"
                      name="submit"
                      
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
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="bottom-fix-history">
        {mandateCode && mandateCode?.id !== undefined && (
          <MandateStatusHistory
            mandateCode={mandateCode?.id}
            accept_Reject_Status={currentStatus}
            accept_Reject_Remark={currentRemark}
          />
        )}
      </div>
    </>
  );
};

export default DeliveryDetails;
