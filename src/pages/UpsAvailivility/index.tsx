import React, { useState, useCallback } from "react";
import {
  Button,
  Box,
  TextField,
  Grid,
  Autocomplete,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { downloadFile } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import { _validationMaxFileSizeUpload } from "../Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import MandateInfo from "pages/common-components/MandateInformation";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useUrlSearchParams } from "use-url-search-params";
import axios from "axios";
import { fetchError, showMessage } from "redux/actions";
import ToggleSwitch from "@uikit/common/ToggleSwitch";
import { useDispatch, useSelector } from "react-redux";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import moment from "moment";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { secondaryButton } from "shared/constants/CustomColor";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import DataTable from "../common-components/Table";
import { AgGridReact } from "ag-grid-react";
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import { AppState } from "@auth0/auth0-react";
import { Tooltip } from "@mui/material";
import regExpressionTextField, {
  textFieldValidationOnPaste, regExpressionRemark
} from "@uikit/common/RegExpValidation/regForTextField";

const MAX_COUNT = 8;
const upsDocumentOption = [
  {
    key: "UPS Documents",
    name: "UPS Documents",
  },
];
const bOQValue = {
  key: "UPS Availability",
  name: "UPS Availability",
};
const bOQValue2 = {
  key: "Open",
  name: "Open",
};
const bOQValue1 = [
  {
    key: "Open",
    name: "Open",
  },
  {
    key: "Dispatch",
    name: "Dispatch",
  },
  {
    key: "Deliver",
    name: "Deliver",
  },
];

const UpsAvailivility = () => {
  const [docType, setDocType] = useState(null);
  const [projectPlanData, setProjectPlanData] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  let { id } = useParams();
  const { user } = useAuthUser();
  const [fileLength, setFileLength] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [boqDrp, setBoQ] = React.useState<any>(bOQValue);
  const [boqDrp1, setBoQ1] = React.useState<any>(bOQValue1);
  const [boqDrp2, setBoQ2] = React.useState<any>("Open");
  const [fileLimit, setFileLimit] = useState(false);
  const [uploadFlag, setUploadFlag] = useState(false);
  const [mandateId, setMandateId] = useState(null);
  const [params] = useUrlSearchParams({}, {});
  const [mandateInfo, setMandateData] = React.useState(null);
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [switchOn, setSwitchOn] = React.useState(true);
  const [isUpdated, setIsUpdated] = React.useState(false);
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState({
    actual_delivery_date: "",
    date_of_Dispatch: "",
    installation_Date: "",
  });
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const fileInput = React.useRef(null);
  const gridRef = React.useRef<AgGridReact>(null);
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const [formData, setFormData] = useState<any>({
    id: 0,
    uid: "string",
    mandateId: mandateId?.id || 0,
    available_Status: "Available",
    installation_Date: null,
    from_Branch: "",
    to_Branch: "",
    date_of_Dispatch: null,
    expected_Delivery_Date: null,
    actual_delivery_date: null,
    delivery_status: null,
    remarks: "",
    status: "",
    createdBy: user?.UserName || "",
    createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
    modifiedBy: user?.UserName || "",
    modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
  });

  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateId(id);
    }
  }, []);

  React.useEffect(() => {
    if (mandateId && mandateId?.id !== undefined) {
      setFormData({
        id: 0,
        uid: "string",
        mandateId: mandateId?.id || 0,
        available_Status: "Available",
        installation_Date: null,
        from_Branch: "",
        to_Branch: "",
        date_of_Dispatch: null,
        expected_Delivery_Date: null,
        actual_delivery_date: null,
        delivery_status: "open",
        remarks: "",
        status: "",
        createdBy: user?.UserName || "",
        createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        modifiedBy: user?.UserName || "",
        modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      });
      getUpsDetails();
      getVersionHistoryData();
    }
  }, [mandateId?.id]);

  React.useEffect(() => {
    if (mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid") {
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
      width: 80,
      minWidth: 80,
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "reporttype",
      headerName: "Report Type",
      headerTooltip: "Report Type",
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
      field: "remark",
      headerName: "Remark",
      headerTooltip: "Remark",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.remarks;
        data = data?.split(".");
        data = data?.[0];
        return data || "";
      },
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
      maxWidth: 110,
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
      runtimeId: _getRuntimeId(mandateId?.id) || 0,
      mandateId: (id && parseInt(mandateId?.id)) || 0,
      tableId: (id && parseInt(mandateId?.id)) || 0,
      remark: formData["remarks"] || "Created",
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
          dispatch(showMessage("Record is added successfully!"));
          navigate("/list/task");
        } else {
          dispatch(fetchError("Error Occurred !"));
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  const handleToggle = (e: any) => {
    const val = e.target.value === "true" ? true : false;
    setSwitchOn(val);
    if (val === true){
      formData["installation_Date"] = null;
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
    const form: any = new FormData();
    form.append("mandate_id", mandateId?.id);
    form.append("documenttype", "UPS Documents");
    form.append("CreatedBy", user?.UserName || "");
    form.append("ModifiedBy", user?.UserName || "");
    form.append("entityname", "DocumentUpload");
    form.append("RecordId", mandateId?.id);
    form.append("remarks", formData["remarks"]);

    for (var key in uploaded) {
      await form.append("file", uploaded[key]);
    }

    if (uploaded?.length === 0) {
      setUploadedFiles([]);
      setFileLimit(false);
      e.target.value = null;
      dispatch(fetchError("Error Occurred !"));
      return;
    }

    if (mandateId?.id !== undefined) {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`,
          form
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
            formData["remarks"] = "";
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

  const getVersionHistoryData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId?.id}&documentType=UPS Documents`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
          setHistoryData(data || []);
        }

        if (response && response?.data?.length === 0) {
          setHistoryData([]);
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
  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (historyData && historyData?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [historyData, docType]);

  const getUpsDetails = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/UPSAvailability/GetUPSAvailabilityDetails?mandateId=${mandateId?.id}`
      )
      .then((response) => {
        if (!response) return;
        if (response && response?.data?.length > 0) {
          setSwitchOn(
            response?.data[0]?.available_Status === "Available" ? true : false
          );
          const temp = response?.data[0]?.delivery_status;
          setFormData({
            ...response?.data[0],
            delivery_status: { key: temp, name: temp },
          });
          setIsUpdated(true);
        }
      })
      .catch((err) => { });
  };

  const handleUpdate = () => {
    const data = formData;
    data["mandateId"] = mandateId?.id;
    data["available_Status"] = switchOn ? "Available" : "Not Available";
    data["delivery_status"] = formData["delivery_status"]?.name;
    data["installation_Date"] =
      formData["installation_Date"] &&
      moment(formData["installation_Date"]).isValid() &&
      moment(formData["installation_Date"]).format("YYYY-MM-DDTHH:mm:ss.SSS");
    data["expected_Delivery_Date"] =
      formData["expected_Delivery_Date"] &&
      moment(formData["expected_Delivery_Date"]).isValid() &&
      moment(formData["expected_Delivery_Date"]).format(
        "YYYY-MM-DDTHH:mm:ss.SSS"
      );
    data["actual_delivery_date"] =
      formData["actual_delivery_date"] &&
      moment(formData["actual_delivery_date"]).isValid() &&
      moment(formData["actual_delivery_date"]).format(
        "YYYY-MM-DDTHH:mm:ss.SSS"
      );
    data["date_of_Dispatch"] =
      formData["date_of_Dispatch"] &&
      moment(formData["date_of_Dispatch"]).isValid() &&
      moment(formData["date_of_Dispatch"]).format("YYYY-MM-DDTHH:mm:ss.SSS");

    if (historyData && historyData?.length === 0) {
      dispatch(fetchError("Please upload file !!"));
      return;
    } else if (formData["installation_Date"] === null && action === "Update Installation Date") {
      dispatch(fetchError("Please select Installation Date !!"));
      return;
    } else {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/UPSAvailability/UpdateUPSAvailabilityDetails`,
          data
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (response) {
            setFormData({
              id: 0,
              uid: "string",
              mandateId: mandateId?.id || 0,
              available_Status: "Available",
              installation_Date: null,
              from_Branch: "",
              to_Branch: "",
              date_of_Dispatch: null,
              expected_Delivery_Date: null,
              actual_delivery_date: null,
              delivery_status: "open",
              remarks: "",
              status: "",
              createdBy: user?.UserName || "",
              createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
              modifiedBy: user?.UserName || "",
              modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            });
            workFlowMandate();
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occurred !"));
        });
    }
  };
  const _validation = (data) => {
    let count = 0;
    const temp = {
      actual_delivery_date: "",
      date_of_Dispatch: "",
      installation_Date: "",
    };
    if (
      data?.delivery_status === "Deliver" &&
      data?.actual_delivery_date === null
    ) {
      count++;
      temp["actual_delivery_date"] = "Please Fill Delivery Date";
    }
    if (
      data?.delivery_status === "Dispatch" &&
      data?.date_of_Dispatch === null
    ) {
      count++;
      temp["date_of_Dispatch"] = "Please Fill Date Of Dispatch";
    }
    if (
      action === "Update Installation Date" &&
      data?.installation_Date === null
    ) {
      count++;
      temp["installation_Date"] = "Please Fill Installation Date";
    }

    setError({ ...temp });
    return count;
  };
  const handleSubmit = () => {
    const noOfErrors = _validation(formData);
    if (noOfErrors > 0) return;

    const data = formData;
    data["installation_Date"] =
      formData["installation_Date"] &&
      moment(formData["installation_Date"]).isValid() &&
      moment(formData["installation_Date"]).format("YYYY-MM-DDTHH:mm:ss.SSS");
    data["expected_Delivery_Date"] =
      formData["expected_Delivery_Date"] &&
      moment(formData["expected_Delivery_Date"]).isValid() &&
      moment(formData["expected_Delivery_Date"]).format(
        "YYYY-MM-DDTHH:mm:ss.SSS"
      );
    data["actual_delivery_date"] =
      formData["actual_delivery_date"] &&
      moment(formData["actual_delivery_date"]).isValid() &&
      moment(formData["actual_delivery_date"]).format(
        "YYYY-MM-DDTHH:mm:ss.SSS"
      );
    data["date_of_Dispatch"] =
      formData["date_of_Dispatch"] &&
      moment(formData["date_of_Dispatch"]).isValid() &&
      moment(formData["date_of_Dispatch"]).format("YYYY-MM-DDTHH:mm:ss.SSS");

    data["mandateId"] = mandateId?.id;
    data["available_Status"] = switchOn ? "Available" : "Not Available";

    data["delivery_status"] = formData["delivery_status"]?.name;
    if (mandateId?.id === undefined) {
      dispatch(fetchError("Please select Mandate Id !!"));
      return;
    } else if (historyData && historyData?.length === 0) {
      dispatch(fetchError("Please upload file !!"));
      return;
    } else {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/UPSAvailability/CreateUPSAvailabilityDetails`,
          data
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (response) {
            setFormData({
              id: 0,
              uid: "string",
              mandateId: mandateId?.id || 0,
              available_Status: "Available",
              installation_Date: null,
              from_Branch: "",
              to_Branch: "",
              date_of_Dispatch: null,
              expected_Delivery_Date: null,
              actual_delivery_date: null,
              delivery_status: "",
              remarks: "",
              status: "",
              createdBy: user?.UserName || "",
              createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
              modifiedBy: user?.UserName || "",
              modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            });
            workFlowMandate();
            dispatch(showMessage("Record is added successfully!"));
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occurred !"));
        });
    }
  };

  const handleBranch = (e) => {
    const { name, value } = e?.target;
    formData[name] = value;
    setFormData({ ...formData });
  };

  const handleDateChange = (newValue: Dayjs | null, name) => {
    if (
      (formData["delivery_status"]?.name === "Dispatch" &&
        name === "date_of_Dispatch") 
        // ||
      // name === "installation_Date"
    ) {
      if (!dayjs(newValue).isValid()) {
        setError({
          ...error,
          [name]: "Please  enter valid date",
        });
        return;
      } else if (newValue?.toDate() > new Date()) {
        setError({
          ...error,
          [name]: "Please do not enter future date",
        });
        return;
      } else {
        if (newValue !== null && dayjs(newValue).isValid())
          formData[name] = newValue?.toDate();
        setFormData({ ...formData });
        setError({ ...error, [name]: "", actual_delivery_date: "" });
        return;
      }
    }
    if (
      name === "actual_delivery_date" &&
      formData["date_of_Dispatch"] === null
    ) {
      setError({
        ...error,
        actual_delivery_date: "Please Select Date Of Dispatch First",
      });
      return;
    }
    if (name === "date_of_Dispatch") {
      setError({
        ...error,
        actual_delivery_date: "",
      });
    }
    if (newValue !== null && dayjs(newValue).isValid())
      formData[name] = newValue?.toDate();
    setFormData({ ...formData });
  };

  return (
    <div className="">
      <Box component="h2" className="page-title-heading my-6">
        UPS Availability Status
      </Box>
      <div
        style={{
          border: "1px solid rgba(0, 0, 0, 0.12)",
        }}
        className="card-panal inside-scroll-225"
      >
        <MandateInfo
          mandateCode={mandateId}
          pageType=""
          source=""
          redirectSource={`${params?.source}`}
          setMandateCode={setMandateId}
          setMandateData={setMandateData}
          setpincode={() => { }}
          setCurrentStatus={setCurrentStatus}
          setCurrentRemark={setCurrentRemark}
        />
        <div className="section" style={{ border: "none", paddingTop: 0 }}>
          <Grid
            marginBottom="0px"
            container
            item
            spacing={5}
            justifyContent="start"
            alignSelf="center"
          >
            <Grid
              item
              xs={6}
              md={4}
              lg={3}
              sx={{ position: "relative" }}
              mt={3}
            >
              <div>
                <h2 className="phaseLable ">UPS Status (In nearby branch)</h2>
              </div>

              <ToggleSwitch
                alignment={switchOn}
                handleChange={handleToggle}
                yes={"Available"}
                no={"Not Available"}
                name="non_budget_amount_switch"
                id="non_budget_amount_switch"
                onBlur={() => { }}
                disabled={false}
                bold="false"
              />
            </Grid>
            {!switchOn && (
              <Grid item xs={6} md={3} sx={{ position: "relative" }} mt={3}>
                <div>
                  <h2 className="phaseLable "> Installation Date</h2>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      className="w-85"
                      // maxDate={dayjs()}
                      inputFormat="DD/MM/YYYY"
                      value={formData["installation_Date"]}
                      onChange={(e) => handleDateChange(e, "installation_Date")}
                      renderInput={(params) => (
                        <TextField
                          onKeyDown={(e) => e?.preventDefault()}
                          {...params}
                          size="small"
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
                <p className="form-error">{error?.installation_Date}</p>
              </Grid>
            )}
          </Grid>
          {switchOn && (
            <Grid
              marginBottom="0px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
              mt={1}
            >
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <h2 className="phaseLable ">From Branch</h2>
                </div>

                <TextField
                  name="from_Branch"
                  id="from_Branch"
                  variant="outlined"
                  disabled={action === "Update Installation Date"}
                  size="small"
                  className="w-85"
                  type="text"
                  value={formData?.from_Branch}
                  onChange={(e) => handleBranch(e)}
                  onKeyDown={(e: any) => {
                    regExpressionTextField(e);
                  }}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <h2 className="phaseLable ">To Branch</h2>
                </div>

                <TextField
                  name="to_Branch"
                  id="to_Branch"
                  variant="outlined"
                  size="small"
                  className="w-85"
                  disabled={action === "Update Installation Date"}
                  type="text"
                  value={formData?.to_Branch}
                  onChange={(e) => handleBranch(e)}
                  onKeyDown={(e: any) => {
                    regExpressionTextField(e);
                  }}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <h2 className="phaseLable">Status</h2>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  getOptionLabel={(option: any) =>
                    option?.name?.toString() || ""
                  }
                  disableClearable
                  options={boqDrp1 || []}
                  onChange={(e, value: any) => {
                    setFormData({ ...formData, delivery_status: value });
                  }}
                  sx={
                    action === "Update Installation Date" && {
                      backgroundColor: "#f3f3f3",
                      borderRadius: "6px",
                    }
                  }
                  placeholder="Document Type"
                  disabled={action === "Update Installation Date"}
                  value={formData?.delivery_status || boqDrp2}
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
                      placeholder="Select Status"
                      onKeyDown={(e: any) => {
                        regExpressionTextField(e);
                      }}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div>
                  <h2 className="phaseLable ">Date of Dispatch</h2>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      className="w-85"
                      maxDate={
                        formData["actual_delivery_date"] === null
                          ? dayjs()
                          : formData["actual_delivery_date"]
                      }
                      inputFormat="DD/MM/YYYY"
                      value={formData["date_of_Dispatch"] || null}
                      disabled={
                        formData?.delivery_status?.key === "Open" ||
                        formData?.delivery_status?.key === "Deliver" ||
                        action === "Update Installation Date"
                      }
                      onChange={(e) => handleDateChange(e, "date_of_Dispatch")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          onKeyDown={(e) => {
                            e.preventDefault();
                          }}
                          sx={
                            (formData?.delivery_status?.key === "Open" ||
                              formData?.delivery_status?.key === "Deliver" ||
                              action === "Update Installation Date") && {
                              backgroundColor: "#f3f3f3",
                              borderRadius: "6px",
                            }
                          }
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
                <p className="form-error">{error?.date_of_Dispatch}</p>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div>
                  <h2 className="phaseLable " style={{ marginTop: "5px" }}>
                    {" "}
                    Expected Delivery Date
                  </h2>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      className="w-85"
                      disabled={action === "Update Installation Date"}
                      minDate={formData["date_of_Dispatch"]}
                      inputFormat="DD/MM/YYYY"
                      value={formData["expected_Delivery_Date"]}
                      onChange={(e) =>
                        handleDateChange(e, "expected_Delivery_Date")
                      }
                      renderInput={(params) => (
                        <TextField
                          onKeyDown={(e) => {
                            e.preventDefault();
                          }}
                          sx={
                            action === "Update Installation Date" && {
                              backgroundColor: "#f3f3f3",
                              borderRadius: "6px",
                            }
                          }
                          {...params}
                          size="small"
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div>
                  <h2 className="phaseLable " style={{ marginTop: "5px" }}>
                    Actual Date Of Delivery
                  </h2>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      className="w-85"
                      minDate={formData["date_of_Dispatch"]}
                      inputFormat="DD/MM/YYYY"
                      value={formData["actual_delivery_date"] || null}
                      disabled={
                        action === "Update Installation Date" ||
                        formData?.delivery_status?.key === "Open" ||
                        formData?.delivery_status?.key === "Dispatch"
                      }
                      onChange={(e) =>
                        handleDateChange(e, "actual_delivery_date")
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          onKeyDown={(e) => {
                            e.preventDefault();
                          }}
                          sx={
                            (formData?.delivery_status?.key === "Open" ||
                              formData?.delivery_status?.key === "Dispatch" ||
                              action === "Update Installation Date") && {
                              backgroundColor: "#f3f3f3",
                              borderRadius: "6px",
                            }
                          }
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
                <p className="form-error">{error?.actual_delivery_date}</p>
              </Grid>

              <Grid item xs={6} md={3}>
                <div>
                  <h2 className="phaseLable" style={{ marginTop: "5px" }}>
                    {" "}
                    Installation Date
                  </h2>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      className="w-85"
                      disabled={action !== "Update Installation Date"}
                      inputFormat="DD/MM/YYYY"
                      value={formData["installation_Date"]}
                      onChange={(e) => handleDateChange(e, "installation_Date")}
                      renderInput={(params) => (
                        <TextField
                          onKeyDown={(e) => {
                            e?.preventDefault();
                          }}
                          sx={
                            action !== "Update Installation Date" && {
                              backgroundColor: "#f3f3f3",
                              borderRadius: "6px",
                            }
                          }
                          {...params}
                          size="small"
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
              </Grid>
            </Grid>
          )}
        </div>

        <div className="section" style={{ border: "none", paddingTop: "15px" }}>
          <Grid
            marginBottom="0px"
            container
            item
            spacing={5}
            justifyContent="start"
            alignSelf="center"
          >
            <Grid item xs={6} md={3} lg={3} sx={{ position: "relative" }}>
             
              <Autocomplete
                disablePortal
                sx={{
                  backgroundColor: "#f3f3f3",
                  borderRadius: "6px",
                }}
                id="combo-box-demo"
                disableClearable={true}
                disabled={true}
                options={[boqDrp] || []}
                placeholder="Document Type"
                getOptionLabel={(option: any) => option?.name?.toString() || ""}
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
            <Grid item xs={6} md={4} lg={6} sx={{ position: "relative" }}>
           
              <TextField
                name="remarks"
                id="remarks"
                variant="outlined"
                size="small"
                className="w-85"
                type="text"
                placeholder="Remarks"
                value={formData["remarks"] || ""}
                onChange={(e) => {
                  handleBranch(e);
                }}
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
            </Grid>
            <Grid
              item
              xs={6}
              md={4}
              lg={3}
              sx={{ position: "relative", paddingTop: "0px" }}
            >
             
              <div>
                <Button
                  onClick={() => {
                    if (mandateId?.id === undefined) {
                      dispatch(fetchError("Please select mandate !!!"));
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
              <div
                className="required"
                style={{ marginLeft: "100px", marginTop: "-40Px" }}
              >
                <span>Atleast one file to be Uploaded</span>
              </div>
            </Grid>

            <div className="bottom-fix-history">
              <MandateStatusHistory
                mandateCode={mandateId?.id}
                accept_Reject_Remark={currentRemark}
                accept_Reject_Status={currentStatus}
              />
            </div>
          </Grid>

          <div style={{ height: getHeightForTable(), marginTop: "10px" }}>
            <CommonGrid
              defaultColDef={{ flex: 1 }}
              columnDefs={columnDefs}
              rowData={historyData || []}
              onGridReady={onGridReady}
              gridRef={gridRef}
              pagination={false}
              paginationPageSize={null}
            />
          </div>
          <div>
            {mandateId?.id !== undefined && (
              <DataTable mandateId={mandateId?.id} pathName={module} />
            )}
          </div>
          {userAction?.module === module && (
            <>
              {action && action === "Create" && (
                <div className="bottom-fix-btn">
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={isUpdated ? handleUpdate : handleSubmit}
                    style={{
                      marginLeft: 10,
                      padding: "2px 20px",
                      borderRadius: 6,
                      color: "#fff",
                      borderColor: "#00316a",
                      backgroundColor: "#00316a",
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
              )}
              {action && action === "Update Installation Date" && (
                <div className="bottom-fix-btn">
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={isUpdated ? handleUpdate : handleSubmit}
                    style={{
                      marginLeft: 10,
                      padding: "2px 20px",
                      borderRadius: 6,
                      color: "#fff",
                      borderColor: "#00316a",
                      backgroundColor: "#00316a",
                    }}
                  >
                    Update Installation Date
                  </Button>
                  {userAction?.stdmsg !== undefined && (
                    <span className="message-right-bottom">
                      {userAction?.stdmsg}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpsAvailivility;
