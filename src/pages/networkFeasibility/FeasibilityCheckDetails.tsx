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
  feasibilityCheckInitialValues,
  feasibilityCheckSchema,
} from "@uikit/schemas";
import { useFormik } from "formik";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { secondaryButton } from "shared/constants/CustomColor";
import axios from "axios";
import { SHOW_MESSAGE } from "types/actions/Common.action";
import { useDispatch, useSelector } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import DownloadIcon from "@mui/icons-material/Download";
import moment from "moment";
import { AgGridReact } from "ag-grid-react";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { _validationMaxFileSizeUpload } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import { downloadFile } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import regExpressionTextField, {
  textFieldValidationOnPaste, regExpressionRemark
} from "@uikit/common/RegExpValidation/regForTextField";
import { AppState } from "redux/store";
import { useLocation, useNavigate } from "react-router-dom";
import { useUrlSearchParams } from "use-url-search-params";
import { Tooltip } from "@mui/material";
import dayjs from "dayjs";

const MAX_COUNT = 8;

const FeasibilityCheckDetails = ({
  mandateCode,
  mandateData,
  currentStatus,
  currentRemark,
  handleChange1,
  setIsDisable,
}) => {
  const [docType, setDocType] = React.useState(null);
  const navigate = useNavigate();
  const [deliveryData, setDeliveryData] = React.useState<any>({});

  const [uploadedFiles, setUploadedFiles] = React.useState([]);

  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [docUploadHistory, setDocUploadHistory] = React.useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [fileLimit, setFileLimit] = React.useState(false);
  const [fileLength, setFileLength] = React.useState(0);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const [params] = useUrlSearchParams({}, {});
  const { user } = useAuthUser();
  const fileInput = React.useRef(null);
  const [documentTypeList, setDocumentTypeList] = React.useState([]);
  const [uploadedDoc, setUploadedDoc] = React.useState<any>([]);
  const [networkDetails, setNetworkDetails] = React.useState<any>([]);
  const [dateError, setDateError] = useState<any>("");
  const [docError, setDocError] = useState("");
  const dispatch = useDispatch();
  const location = useLocation();
  const apiType = location?.state?.apiType || "";

  useEffect(() => {
    if (docUploadHistory?.length > 0) setDocError("");
  }, [docUploadHistory]);

  const getData = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/NetworkDetails/GetNetworkDetailsByMandate?mandateId=${mandateCode?.id}`
      )
      .then((response: any) => {
        setDeliveryData(response?.data?.[0]);
        setFieldValue(
          "nameOfServiceProvider",
          response?.data?.[0]?.service_Provider_Name ?? ""
        );
        setFieldValue(
          "dateOfVisit",
          response?.data?.[0]?.visitDate ?? new Date()
        );
        setFieldValue(
          "linkFeasibilityCheckStatus",
          response?.data?.[0]?.link_Feasibility_Status ?? "Pending"
        );
        setFieldValue(
          "linkFeasibilityCheckRemarks",
          response?.data?.[0]?.link_Feasibility_Remarks ?? ""
        );
        if (response?.data?.[0]?.link_Feasibility_Status == "Feasible") {
          setIsDisable(false);
        } else {
          setIsDisable(true);
        }
      })
      .catch((e: any) => {
      });
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/NetworkDetails/GetNetworkDetailsHistoryByMandate?mandateId=${mandateCode?.id}`
      )
      .then((response: any) => {
        setNetworkDetails(response?.data || []);
      })
      .catch((e: any) => {
      });
  };

  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );

    return userAction?.runtimeId || 0;
  };
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
  }, [mandateCode,module]);

  const workFlow = () => {
    const token = localStorage.getItem("token");
    const body = {
      runtimeId: _getRuntimeId(mandateCode?.id) || 0,
      mandateId: mandateCode?.id || 0,
      tableId: mandateCode?.id || 0,
      remark: "Created",
      createdBy: user?.UserName || "Admin",
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: "Created",
    };
    axios({
      method: "post",
      url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId
        }&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy
        }&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ""
        }`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response: any) => {
        if (!response) return;
        if (response?.data === true) {
          navigate(`/list/task`);
        } else {
          dispatch(fetchError("Error Occurred !"));
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  useEffect(() => {
    if (mandateCode && mandateCode?.id !== undefined) {
      getData();
    }
  }, [mandateCode]);

  const getVersionHistoryData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateCode?.id}&documentType=Network Feasibility Check`
      )
      .then((response: any) => {

        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
          setDocUploadHistory(data || []);
        }
        if (response && response?.data?.length === 0) {
          setDocUploadHistory([]);
        }
      })
      .catch((e: any) => {
      });
  };
  useEffect(() => {
    if (mandateCode?.id !== undefined) {
      getVersionHistoryData();
      setFieldValue("linkFeasibilityCheckStatus", "Pending");
    }
  }, [mandateCode?.id]);

  useEffect(() => {
    if (documentTypeList && documentTypeList?.length > 0) {
      var obj =
        documentTypeList &&
        documentTypeList.find(
          (item) => item?.documentName === "Network Feasibility Check"
        );
      setDocType(obj || null);
    }
  }, [documentTypeList, setDocumentTypeList]);

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
    formData.append("documenttype", "Network Feasibility Check");
    formData.append("CreatedBy", user?.UserName || "");
    formData.append("ModifiedBy", user?.UserName || "");

    formData.append("entityname", "Network Feasibility Check");
    formData.append("RecordId", mandateCode?.id);

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
    initialValues: feasibilityCheckInitialValues,
    validationSchema: feasibilityCheckSchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: (values, action) => {
      if (docUploadHistory?.length == 0) {
        setDocError("Please upload Additional Attachments");
      } else if (docUploadHistory && docUploadHistory?.length === 0) {
        dispatch(fetchError("Please upload file"));
      } else if (!values?.dateOfVisit) {
        dispatch(fetchError("Please enter Date of visite"));
      } else if (dateError) {
        dispatch(fetchError(dateError));
      } else {
        if (mandateCode?.id) {
          const body = {
            service_Provider_Name: values?.nameOfServiceProvider,
            visitDate: values?.dateOfVisit,
            link_Feasibility_Status:
              values?.linkFeasibilityCheckStatus || "Pending",
            link_Feasibility_Remarks: values?.linkFeasibilityCheckRemarks,
            mandateId: mandateCode?.id,
            status: "",
            createdBy: user?.UserName,
            modifiedBy: user?.UserName,
          };
          if (mandateCode?.id) {
            axios
              .post(
                `${process.env.REACT_APP_BASEURL}/api/NetworkDetails/CreateNetworkDetails`,
                body
              )
              .then((response: any) => {
                if (!response) return;
                if (response && response?.data) {

                  if (response.data?.message == "Record Already Exists") {
                    if (deliveryData?.link_Delivery_Remarks) {
                      dispatch(fetchError("Record Already Exists!"));
                      navigate(`/mandate/${mandateCode?.id}/delivery-details`);
                      handleChange1("2");
                    } else {
                      axios
                        .post(
                          `${process.env.REACT_APP_BASEURL}/api/NetworkDetails/UpdateNetworkDetails?id=${deliveryData?.id}`,
                          body
                        )
                        .then((response: any) => {
                          // navigate(`/list/task`);

                          setDeliveryData({});
                          getData();
                          dispatch({
                            type: SHOW_MESSAGE,
                            message: "Record Updated Successfully!",
                          });
                        })
                        .catch((e: any) => {
                        });
                    }

                  } else {
                    dispatch({
                      type: SHOW_MESSAGE,
                      message: response?.data?.message + "!" || "",
                    });
                    // navigate(`/list/task`);
                  }
                  workFlow();
                }
              })
              .catch((e: any) => {
              });
          } else {
            dispatch({
              type: SHOW_MESSAGE,
              message: "Please select Mandate Id",
            });
          }
        } else {
          dispatch(fetchError("Please select mandate"));
        }
      }
    },
  });

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  const columnDefs = useMemo(() => {
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
        maxWidth: 80,
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

  let columnDefs2 = [
    {
      field: "service_Provider_Name",
      headerName: "Name of Service Provider",
      sortable: true,
      resizable: true,
      minWidth: 70,
      // maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "visitDate",
      headerName: "Date of Visit",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        return moment(e?.data?.visitDate).format("DD/MM/YYYY");
      },
      minWidth: 70,
      // maxWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "link_Feasibility_Status",
      headerName: "Status",
      sortable: true,
      resizable: true,
      minWidth: 70,
      // maxWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "link_Feasibility_Remarks",
      headerName: "Remarks",
      sortable: true,
      resizable: true,

      width: 150,
      // maxWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      sortable: true,
      resizable: true,
      minWidth: 70,
      // maxWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
  ];
  useEffect(() => {
    getDocumentTypeList();
  }, [mandateCode]);

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
          setDocumentTypeList(response?.data?.data);
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
    var dataLength = (networkDetails && networkDetails?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [networkDetails, docType]);

  const withError = (e) => {
    setDocError("Please upload Additional Attachments");
    handleSubmit(e);
  };

  return (
    <div>
    

      <div className="inside-scroll-405-network-feasibility">
        <form
          onSubmit={(e) =>
            docUploadHistory?.length == 0 ? withError(e) : handleSubmit(e)
          }
        >
          <div className="phase-outer" style={{ paddingRight: "10px" }}>
            <Grid
              marginBottom="2px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={6} sx={{ position: "relative" }}>
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
                    value={values.nameOfServiceProvider}
                    onChange={handleChange}
                    onBlur={handleBlur}                    
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
                  />
                  {touched.nameOfServiceProvider &&
                    errors.nameOfServiceProvider ? (
                    <p className="form-error">{errors.nameOfServiceProvider}</p>
                  ) : null}
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Date of Visit</h2>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      inputFormat="DD/MM/YYYY"
                      maxDate={new Date()}
                      value={values.dateOfVisit}
                      onChange={(newValue) => {
                        if (newValue !== null && dayjs(newValue).isValid()) {
                          if (new Date(newValue) > new Date()) {
                            setDateError("please enter before today date");
                          } else {
                            setDateError("");
                            setFieldValue("dateOfVisit", newValue);
                          }
                        } else {
                          setDateError("please enter valid date");
                        }
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
                  <p className="form-error">{dateError}</p>
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">
                    Link Feasibility Check Status
                  </h2>
                  <Select
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="linkFeasibilityCheckStatus"
                    id="linkFeasibilityCheckStatus"
                    value={values.linkFeasibilityCheckStatus ?? "Pending"}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <MenuItem value="" style={{ display: "none" }}>
                      <em>Select linkFeasibilityCheckStatus</em>
                    </MenuItem>
                    <MenuItem value={"Pending"} selected>
                      Pending
                    </MenuItem>
                    <MenuItem value={"Feasible"}>Feasible</MenuItem>
                    <MenuItem value={"Not Feasible"}>Not Feasible</MenuItem>
                  </Select>
                  {touched.linkFeasibilityCheckStatus &&
                    errors.linkFeasibilityCheckStatus ? (
                    <p className="form-error">
                      {errors.linkFeasibilityCheckStatus}
                    </p>
                  ) : null}
                </div>
              </Grid>

              <Grid item xs={6} md={9} sx={{ position: "relative" }}>
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
                    value={values.linkFeasibilityCheckRemarks}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      regExpressionRemark(e);                      
                    }}
                  />
                  {touched.linkFeasibilityCheckRemarks &&
                    errors.linkFeasibilityCheckRemarks ? (
                    <p className="form-error">
                      {errors.linkFeasibilityCheckRemarks}
                    </p>
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
                <p className="form-error">{docError}</p>
              </Grid>

              <Grid item xs={12} md={12}>
                <h2 className="phaseLable">Version History</h2>
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
              </Grid>
              <Grid item xs={12} md={12}>
                <h2 className="phaseLable">
                  Network Feasibility Check History
                </h2>
                <div
                  style={{ height: getHeightForTable2(), marginTop: "10px" }}
                >
                  <CommonGrid
                    defaultColDef={{ flex: 1 }}
                    columnDefs={columnDefs2}
                    rowData={networkDetails || []}
                    onGridReady={onGridReady}
                    gridRef={gridRef}
                    pagination={false}
                    paginationPageSize={null}
                  />
                </div>
              </Grid>
            </Grid>
          </div>
          {mandateCode?.id === undefined && action === "" && runtimeId === 0 && (
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

      <div className="bottom-fix-history" style={{ bottom: 70 }}>
        {mandateCode && mandateCode?.id !== undefined && (
          <MandateStatusHistory
            mandateCode={mandateCode?.id}
            accept_Reject_Status={currentStatus}
            accept_Reject_Remark={currentRemark}
          />
        )}
      </div>
    </div>
  );
};

export default FeasibilityCheckDetails;
