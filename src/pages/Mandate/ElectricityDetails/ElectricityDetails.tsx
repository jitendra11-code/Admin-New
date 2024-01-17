import {
  Autocomplete,
  Button,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ToggleSwitch from "@uikit/common/ToggleSwitch";
import {
  electricityDetailsInitialValues,
  electricityDetailsSchema,
} from "@uikit/schemas";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { useFormik } from "formik";
import MandateInfo from "pages/common-components/MandateInformation";
import React, { useCallback, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { secondaryButton } from "shared/constants/CustomColor";
import { useUrlSearchParams } from "use-url-search-params";
import axios from "axios";
import moment from "moment";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadFile,
  downloadTemplate,
  _validationMaxFileSizeUpload,
} from "../DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import DownloadIcon from "@mui/icons-material/Download";
import { AgGridReact } from "ag-grid-react";
import FileNameDiaglogList from "../DocumentUploadMandate/Components/Utility/Diaglogbox";
import { AppState } from "redux/store";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import regExpressionTextField, {
  textFieldValidationOnPaste, regExpressionRemark
} from "@uikit/common/RegExpValidation/regForTextField";
import dayjs from "dayjs";
import blockInvalidChar from "../Location/Components/blockInvalidChar ";
import { Tooltip } from "@mui/material";
const notesValue = {
  key: "ElectricityDocument",
  name: "Electricity Document",
};

const bOQValue = {
  key: "Electricity Details",
  name: "Electricity Details",
};

const optionsDropDown = [
  {
    bOQValue,
  },
];

const ElectricityDetails = () => {
  const date = new Date();

  const [mandateInfo, setMandateData] = React.useState(null);
  const [docType, setDocType] = useState(null);
  const [boqDrp, setBoQ] = useState<any>(bOQValue);

  const [pincode, setpincode] = useState("");
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [notesDrp, setNotesDrp] = useState<any>(notesValue);
  const [currentRemark, setCurrentRemark] = React.useState("");

  const fileInput = React.useRef(null);
  const [fileLimit, setFileLimit] = useState(false);
  const [fileLength, setFileLength] = useState(0);
  const [docUploadHistory, setDocUploadHistory] = useState([]);
  const { id } = useParams();
  const [mandateCode, setMandateCode] = useState<any>("");
  const [toggleSwitch, settoggleSwitch] = React.useState<any>({});
  const [alignment, setAlignment] = React.useState("yes");
  const [value, setValue] = React.useState(moment(date).format());

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [gridApi, setGridApi] = React.useState(null);
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const location = useLocation();
  const [locationData, setLocationData] = useState("");
  const apiType = location?.state?.apiType || "";
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const navigate = useNavigate();
  const { user } = useAuthUser();
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [params] = useUrlSearchParams({}, {});
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const [electricityDetails, setElectricityDetails] = React.useState<any>([]);
  const [deliveryData, setDeliveryData] = useState<any>({});
  const [dateError, setDateError] = useState<any>("");

  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateCode(id);
    }
  }, []);

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
  }, [mandateCode, setMandateCode]);

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
      maxWidth: 80,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "documenttype",
      headerName: "Report Type",
      headerTooltip: "Report Type",
      sortable: true,
      resizable: true,
      maxWidth: 200,
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
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "status",
      headerName: "Status",
      headerTooltip: "Status",
      sortable: true,
      resizable: true,
      width: 110,
      minWidth: 110,
      cellStyle: { fontSize: "12px" },
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
      maxWidth: 200,
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
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
      width: 190,
      maxWidth: 400,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Download",
      headerName: "Download",
      headerTooltip: "Download",
      resizable: true,
      width: 110,
      maxWidth: 150,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (obj: any) => (
        <>
          <div className="actions">
            <Tooltip title="Download" className="actionsIcons">
              <DownloadIcon
                style={{ fontSize: "15px" }}
                onClick={() => downloadFile(obj?.data, mandateCode, dispatch)}
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
      maxWidth: 150,
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

  const getData = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ElectricityDetails/GetElctricityDetails?id=${mandateCode?.id}`
      )
      .then((response: any) => {
        if (response?.data?.[0]) {
          setFieldError("remark", "");
        }
        setDeliveryData(response?.data?.[0]);
        settoggleSwitch({
          ...toggleSwitch,
          electricityConnection:
            response?.data?.[0]?.electricity_connection_by == "BFL"
              ? true
              : false,
        });
        setFieldValue(
          "electricityConnection",
          response?.data?.[0]?.electricity_connection_by == "BFL"
            ? true
            : false ?? true
        );
        setFieldValue(
          "connectionLoad",
          response?.data?.[0]?.connection_load ?? ""
        );
        setFieldValue("accountNumber", response?.data?.[0]?.account_no ?? "");
        setFieldValue("vendorCode", response?.data?.[0]?.vendor_code ?? "");
        setFieldValue("meterNumber", response?.data?.[0]?.meter_no ?? "");
        setFieldValue(
          "connectionStartMeterReading",
          response?.data?.[0]?.connection_start_meter_reading ?? ""
        );
        setFieldValue(
          "connectionDate",
          response?.data?.[0]?.connection_date ?? new Date()
        );
        setValue(response?.data?.[0]?.connection_date ?? new Date());
        setFieldValue("remark", response?.data?.[0]?.remark ?? "");
      })
      .catch((e: any) => {
      });
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ElectricityDetails/GetElctricityDetailsByMandateId?mandateId=${mandateCode?.id}`
      )
      .then((response: any) => {
        if (!response) return;
        setElectricityDetails(response?.data || []);
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
      getLocationInfo();
    }
  }, [mandateCode]);

  const dispatch = useDispatch();

  const getLocationInfo = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/mandatesById?id=${mandateCode?.id}`
      )
      .then((response: any) => {
        if (response && response?.data) {
          setLocationData(response?.data?.location || "");
        }
      })
      .catch((e: any) => { });
  };

  const handleChange1 = (newValue) => {
    if (newValue !== null && dayjs(newValue).isValid()) {
      if (new Date(newValue) > new Date()) {
        setDateError("Please enter Connection Date before today date");
      } else {
        setDateError("");
        setValue(moment(new Date(newValue)).format());
        setFieldValue("linkDeliveryDate", moment(new Date(newValue)).format());
      }
    } else {
      setDateError("Please enter valid date");
    }
  };

  const handleChangeToggle = (event: any, newAlignment: string) => {
    settoggleSwitch({
      ...toggleSwitch,
      [newAlignment]: event.target.value === "true" ? true : false,
    });
    setFieldValue(
      "electricityConnection",
      event.target.value === "true" ? true : false
    );
  };

  const {
    values,
    handleBlur,
    handleChange,
    setFieldValue,
    handleSubmit,
    setFieldError,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: electricityDetailsInitialValues,
    validationSchema: electricityDetailsSchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: (values, action) => {
      if (mandateCode?.id) {
        if (dateError) {
          dispatch(fetchError(dateError));
        } else if (docUploadHistory?.length == 0) {
          dispatch(fetchError("Please Upload Documents"));
        } else {
          const body = {
            id: 0,
            mandate_id: mandateInfo?.id || 0,
            electricity_connection_by:
              values?.electricityConnection == true
                ? "BFL"
                : "Landlord" || true,
            connection_load: values?.connectionLoad || 0,
            account_no: values?.accountNumber?.toString() || "",

            vendor_code: values?.vendorCode || "",
            location_name: locationData,
            meter_no: values?.meterNumber,
            connection_date: value,
            connection_start_meter_reading:
              values?.connectionStartMeterReading?.toString(),
            uid: "string",
            remark: values?.remark,
          };

          axios
            .post(
              `${process.env.REACT_APP_BASEURL}/api/ElectricityDetails/InsertElectricityDetails`,
              body
            )
            .then((response: any) => {
              if (!response) return;

              if (response?.data?.message == "Already Exists !") {
                axios
                  .post(
                    `${process.env.REACT_APP_BASEURL}/api/ElectricityDetails/UpdateElectricityDetails?id=${deliveryData?.id}`,
                    body
                  )
                  .then((response: any) => {
                    if (!response) return;
                    workFlow();
                    getData();
                  })
                  .catch((error) => { });
              } else {
                workFlow();
                getData();
              }
            })
            .catch((error) => { });
        }
      } else {
        dispatch(fetchError("Please select mandate"));
      }
    },
  });

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  const getVersionHistoryData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateCode?.id}&documentType=ElectricityDetails`
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

  React.useEffect(() => {
    if (mandateCode?.id !== undefined) {
      getVersionHistoryData();
    }
  }, [mandateCode?.id]);

  const MAX_COUNT = 8;

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
    formData.append("documenttype", "ElectricityDetails");
    formData.append("CreatedBy", user?.UserName || "");
    formData.append("ModifiedBy", user?.UserName || "");
    formData.append("entityname", "ElectricityDetails");
    formData.append("RecordId", mandateCode?.id);

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

  const workFlow = () => {
    const token = localStorage.getItem("token");
    const body = {
      runtimeId: runtimeId || 0,
      mandateId: mandateCode?.id || 0,
      tableId: mandateCode?.id || 0,
      remark: "Created",
      createdBy: user?.UserName,
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: "Create",
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
          dispatch(showMessage("Electricity Details successfully submitted!"));
          navigate("/list/task");
        } else {
          dispatch(fetchError("Error Occurred !"));
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch)) {
      handleUploadFiles(e, chosenFiles);
    }
  };

  let columnDefs2 = [
    {
      field: "electricity_connection_by",
      headerName: "Name of Service Provider",
      sortable: true,
      resizable: true,
      width: 500,
      minWidth: 200,
    },
    {
      field: "visitDate",
      headerName: "Date of Visit",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        return moment(e?.data?.visitDate).format("DD/MM/YYYY");
      },
      width: 400,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "vendor_code",
      headerName: "Vendor Code",
      sortable: true,
      resizable: true,

      width: 400,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "remark",
      headerName: "Remarks",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
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

  const getHeightForTable2 = useCallback(() => {
    var height = 0;
    var dataLength = (electricityDetails && electricityDetails?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [electricityDetails, docType]);

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <Box
          component="h2"
          sx={{
            fontSize: 15,
            color: "text.primary",
            fontWeight: "600",

            mb: {
              xs: 2,
              lg: 4,
            },
          }}
        >
          Electricity Details
        </Box>

        <div
          style={{
            backgroundColor: "#fff",
            padding: "0px",
            borderRadius: "5px",
          }}
        >
          <MandateInfo
            mandateCode={mandateCode}
            source=""
            pageType=""
            redirectSource={`${params?.source}`}
            setMandateCode={setMandateCode}
            setMandateData={setMandateData}
            setpincode={setpincode}
            setCurrentStatus={setCurrentStatus}
            setCurrentRemark={setCurrentRemark}
          />
        </div>
        <div
          className="card-panal inside-scroll-310"
          style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
        >
          <form onSubmit={handleSubmit}>
            <div className="phase-outer">
              <Grid
                marginBottom="30px"
                container
                item
                spacing={5}
                justifyContent="start"
                alignSelf="center"
              >
                <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">
                      Electricity Connection
                    </h2>
                    <ToggleSwitch
                      alignment={toggleSwitch?.electricityConnection}
                      handleChange={(e: any) => {
                        handleChangeToggle(e, "electricityConnection");
                        setFieldValue("vendorCode", "");
                        setFieldValue("accountNumber", "");
                      }}
                      yes={"BFL"}
                      no={"Landlord"}
                      name="electricityConnection"
                      id="electricityConnection"
                      onBlur={handleBlur}
                      disabled={false}
                      bold="false"
                    />

                  </div>
                </Grid>
                <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Connection Load</h2>
                    <TextField
                      type="number"
                      autoComplete="off"
                      size="small"
                      name="connectionLoad"
                      id="connectionLoad"
                      onChange={(e: any) =>
                        e.target.value?.length > 14
                          ? e.preventDefault()
                          : e?.target?.value >= 0 ? handleChange(e) : 0
                      }
                      value={values?.connectionLoad}
                      onKeyDown={(e: any) => {
                        if (
                          e.target.selectionStart === 0 &&
                          e.code === "Space"
                        ) {
                          e.preventDefault();
                        }
                        if (e.key === '-' || e.key === '+' || e.key === "e" || e.key === "ArrowDown" || e.key === "ArrowUp" ) {
                          e.preventDefault();
                        }
                        blockInvalidChar(e);
                      }}
                    />
                    {touched.connectionLoad && errors.connectionLoad ? (
                      <p className="form-error">{errors.connectionLoad}</p>
                    ) : null}
                  </div>
                </Grid>

                <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Account Number</h2>
                    <TextField
                      // type="number"
                      autoComplete="off"
                      size="small"
                      name="accountNumber"
                      id="accountNumber"
                      onChange={(e: any) =>
                        e.target.value?.length > 14
                          ? e.preventDefault()
                          : handleChange(e)
                      }
                      value={values?.accountNumber}
                      disabled={toggleSwitch?.electricityConnection === false}

                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      onKeyDown={(e: any) => {
                        if (
                          e.target.selectionStart === 0 &&
                          e.code === "Space"
                        ) {
                          e.preventDefault();
                        }
                        blockInvalidChar(e);                        
                        regExpressionTextField(e);
                      }}
                    />
                    {toggleSwitch?.electricityConnection &&
                      touched.accountNumber &&
                      errors.accountNumber ? (
                      <p className="form-error">{errors.accountNumber}</p>
                    ) : null}
                  </div>
                </Grid>

                <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Vendor Code</h2>
                    <TextField
                      
                      autoComplete="off"
                      size="small"
                      name="vendorCode"
                      id="vendorCode"
                      onChange={(e: any) =>
                        e.target.value?.length > 25
                          ? e.preventDefault()
                          : handleChange(e)
                      }
                      value={values?.vendorCode}
                      disabled={toggleSwitch?.electricityConnection === true}

                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      onKeyDown={(e: any) => {
                        if (
                          e.target.selectionStart === 0 &&
                          e.code === "Space"
                        ) {
                          e.preventDefault();
                        }
                        regExpressionTextField(e);
                      }}
                    />
                    {!toggleSwitch?.electricityConnection &&
                      touched.vendorCode &&
                      errors.vendorCode ? (
                      <p className="form-error">{errors.vendorCode}</p>
                    ) : null}
                  </div>
                </Grid>

                <Grid item xs={3} md={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable ">Location Name</h2>
                    <TextField
                      
                      autoComplete="off"
                      size="small"
                      name="locationName"
                      id="locationName"
                      onChange={handleChange}
                      value={locationData}
                      disabled
                    />
                  </div>
                </Grid>

                <Grid item xs={3} md={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Meter Number</h2>
                    <TextField
                      
                      autoComplete="off"
                      size="small"
                      name="meterNumber"
                      id="meterNumber"
                      onChange={(e: any) =>
                        e.target.value?.length > 14
                          ? e.preventDefault()
                          : handleChange(e)
                      }
                      value={values?.meterNumber}

                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      onKeyDown={(e: any) => {
                        if (
                          e.target.selectionStart === 0 &&
                          e.code === "Space"
                        ) {
                          e.preventDefault();
                        }
                        regExpressionTextField(e);
                      }}
                    />
                    {touched.meterNumber && errors.meterNumber ? (
                      <p className="form-error">{errors.meterNumber}</p>
                    ) : null}
                  </div>
                </Grid>

                <Grid item xs={3} md={3} lg={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable ">Connection Date</h2>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        className="w-85"
                        inputFormat="DD/MM/YYYY"
                        maxDate={dayjs()}
                        value={value}
                        onChange={handleChange1}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            onKeyDown={(e: any) => e.preventDefault()}
                          />
                        )}
                      />
                    </LocalizationProvider>
                    <p className="form-error">{dateError}</p>
                  </div>
                </Grid>

                <Grid item xs={3} md={3} lg={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">
                      Connection Start Meter Reading
                    </h2>
                    <TextField
                      type="number"
                      autoComplete="off"
                      size="small"
                      name="connectionStartMeterReading"
                      id="connectionStartMeterReading"
                      onChange={(e: any) =>
                        e.target.value?.length > 14
                          ? e.preventDefault()
                          : e?.target?.value >= 0 ? handleChange(e) : 0
                      }

                      value={values?.connectionStartMeterReading}
                      onKeyDown={(e: any) => {
                        if (
                          e.target.selectionStart === 0 &&
                          e.code === "Space"
                        ) {
                          e.preventDefault();
                        }
                        if (e.key === '-' || e.key === '+' || e.key === "e" || e.key === "ArrowDown" || e.key === "ArrowUp" ) {
                          e.preventDefault();
                        }
                        blockInvalidChar(e);
                      }}
                    />
                    {touched.connectionStartMeterReading &&
                      errors.connectionStartMeterReading ? (
                      <p className="form-error">
                        {errors.connectionStartMeterReading}
                      </p>
                    ) : null}
                  </div>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Autocomplete
                    disablePortal
                    sx={{ backgroundColor: "#f3f3f3", borderRadius: "6px" }}
                    id="combo-box-demo"
                    getOptionLabel={(option) => {
                      return option?.name?.toString() || "";
                    }}
                    disabled
                    disableClearable
                    options={optionsDropDown || []}
                    onChange={(e, value: any) => {
                      setDocType(value);
                      setFieldValue("docType", value);
                    }}
                    placeholder="Document Type"
                    value={boqDrp}
                    renderInput={(params) => (
                      <TextField
                        name="docType"
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

                <Grid item xs={4} md={4} sx={{ position: "relative" }}>
                  <div className="input-form ">
                    <TextField
                      autoComplete="off"
                      size="small"
                      name="remark"
                      id="remark"
                      placeholder="Remark*"
                      onChange={(e: any) =>
                        e.target.value?.length > 50
                          ? e.preventDefault()
                          : handleChange(e)
                      }
                      value={values?.remark}

                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      onKeyDown={(e: any) => {
                        if (
                          e.target.selectionStart === 0 &&
                          e.code === "Space"
                        ) {
                          e.preventDefault();
                        }
                        regExpressionRemark(e);
                      }}
                    />
                    {touched.remark && errors.remark ? (
                      <p className="form-error">{errors.remark}</p>
                    ) : null}
                  </div>
                </Grid>

                <Grid item xs={6} md={4}>
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
                          if (mandateCode?.id === undefined) {
                            dispatch(fetchError("Please select Mandate !!!"));
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
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography>Version History</Typography>{" "}
            </div>
            <div style={{ height: getHeightForTable(), marginTop: "5px" }}>
              <CommonGrid
                defaultColDef={{ flex: 1 }}
                columnDefs={columnDefs}
                rowData={docUploadHistory || []}
                onGridReady={onGridReady}
                gridRef={gridRef}
                pagination={docUploadHistory?.length > 4 ? true : false}
                paginationPageSize={4}
              />
            </div>
            <Grid item xs={12} md={12} style={{ marginTop: "20px" }}>
              <h2 className="phaseLable">Electricity Details History</h2>
              <div
                style={{
                  height: getHeightForTable2(),
                  marginTop: "10px",
                  marginBottom: "20px",
                }}
              >
                <CommonGrid
                  defaultColDef={{ flex: 1 }}
                  columnDefs={columnDefs2}
                  rowData={electricityDetails || []}
                  onGridReady={onGridReady}
                  gridRef={gridRef}
                  pagination={electricityDetails?.length > 3 ? true : false}
                  paginationPageSize={4}
                />
              </div>
            </Grid>

            {action === "" && runtimeId === 0 && (
              <div className="bottom-fix-btn">
                <div className="remark-field">
                  <Button
                    style={{
                      padding: "2px 20px",
                      borderRadius: 6,
                      color: "rgb(255, 255, 255)",
                      borderColor: "rgb(0, 49, 106)",
                      backgroundColor: "rgb(0, 49, 106)",
                    }}
                    variant="outlined"
                    size="small"
                    type="submit"
                  >
                    Submit
                  </Button>
                </div>
                {userAction?.stdmsg !== undefined && (
                  <span className="message-right-bottom">
                    {userAction?.stdmsg}
                  </span>
                )}
              </div>
            )}
            {userAction?.module === module && (
              <>
                {action && action === "Create" && (
                  <div className="bottom-fix-btn">
                    <div className="remark-field">
                      <Button
                        style={{
                          padding: "2px 20px",
                          borderRadius: 6,
                          color: "rgb(255, 255, 255)",
                          borderColor: "rgb(0, 49, 106)",
                          backgroundColor: "rgb(0, 49, 106)",
                        }}
                        variant="outlined"
                        size="small"
                        type="submit"
                      >
                        Submit
                      </Button>
                    </div>
                    {userAction?.stdmsg !== undefined && (
                      <span className="message-right-bottom">
                        {userAction?.stdmsg}
                      </span>
                    )}
                  </div>
                )}
                {action === "" && runtimeId === 0 && (
                  <div className="bottom-fix-btn">
                    <div className="remark-field">
                      <Button
                        style={{
                          padding: "2px 20px",
                          borderRadius: 6,
                          color: "rgb(255, 255, 255)",
                          borderColor: "rgb(0, 49, 106)",
                          backgroundColor: "rgb(0, 49, 106)",
                        }}
                        variant="outlined"
                        size="small"
                        type="submit"
                      >
                        Submit
                      </Button>
                    </div>
                    {userAction?.stdmsg !== undefined && (
                      <span className="message-right-bottom">
                        {userAction?.stdmsg}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </form>
        </div>
      </div>
      <div className="bottom-fix-history" style={{ margin: "10px 0px" }}>
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

export default ElectricityDetails;
