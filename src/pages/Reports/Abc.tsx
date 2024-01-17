import { Grid, Stack, TextField, InputAdornment, Tooltip, IconButton, Select, MenuItem, Button, Typography, Autocomplete } from "@mui/material";
import Box from "@mui/material/Box";
import SearchIcon from "@mui/icons-material/Search";
import React, { useEffect, useState } from "react";
import { TbPencil } from "react-icons/tb";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { GridApi } from "ag-grid-community";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import { useDispatch } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import { useNavigate, useParams } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment";
import { useUrlSearchParams } from "use-url-search-params";
import { getIdentifierList } from "@uikit/common/Validation/getIdentifierListMenuWise";
import { AiFillFileExcel } from "react-icons/ai";
import AppTooltip from "@uikit/core/AppTooltip";
import { useFormik } from "formik";
import csv from "../../assets/icon/csv.png";
import excel from "../../assets/icon/excel.png";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useAuthUser } from "@uikit/utility/AuthHooks";
function Abc() {
  const [mandateReportData, setMandateReportData] = React.useState<any>([]);
  const [employeeList, setEmployeeList] = React.useState<any>([]);
  const [adminVerticalList, setAdminVerticalList] = React.useState<any>([]);
  const [roleNameList, setRoleNameList] = React.useState<any>([]);
  const [designationList, setDesignationList] = React.useState<any>([]);
  const [statusList, setStatusList] = React.useState<any>([]);
  const [locationList, setLocationList] = React.useState<any>([]);
  const [branchTypeList, setBranchTypeList] = React.useState<any>([]);
  const [nextTaskList, setNextTaskList] = React.useState<any>([]);
  const [nextTaskForUserList, setNextTaskForUserList] = React.useState<any>([]);
  const [mandateCodeList, setMandateCodeList] = React.useState<any>([]);
  const [subFilterList, setSubFilterList] = React.useState<any>([]);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const [_validationIdentifierList, setValidationIdentifierList] =
    React.useState([]);
  const [params]: any = useUrlSearchParams({}, {});
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [iFromDate, setIFromDate] = useState(null)
  const [iToDate, setIToDate] = useState(null)
  const [iStartFromDate, setIStartFromDate] = useState(null)
  const [iStartToDate, setIStartToDate] = useState(null)
  const [iEndFromDate, setIEndFromDate] = useState(null)
  const [iEndToDate, setIEndToDate] = useState(null)
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("")
  const [selectedDesignation, setSelectedDesignation] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedAdminVertical, setSelectedAdminVertical] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedShowNewAccess, setSelectedShowNewAccess] = useState("")
  const [selectedSubFilter, setSelectedSubFilter] = useState("")
  const [selectedFromDate, setSelectedFromDate] = useState("")
  const [selectedToDate, setSelectedToDate] = useState("")
  const [selectedStartDateFrom, setSelectedStartDateFrom] = useState("")
  const [selectedStartDateTo, setSelectedStartDateTo] = useState("")
  const [selectedEndDateFrom, setSelectedEndDateFrom] = useState("")
  const [selectedEndDateTo, setSelectedEndDateTo] = useState("")
  const [selectedPinCode, setSelectedPinCode] = useState("")
  const [selectedBranchType, setSelectedBranchType] = useState("")
  const [pinCodeError, setPinCodeError] = useState("")
  // const [flag, setFlag] = useState(false)

  
  const optionsDropDown = [
    { label: 'Within 07 Days' },
    { label: 'Within 15 Days' },
    { label: 'Within 30 Days' },
    { label: 'Custom' },
  ];

  const handleFromDateChange = (date) => {
    const formattedDate = moment(new Date(date)).format('YYYY-MM-DD');
    if (moment(formattedDate).isAfter(iToDate)) {
      setIFromDate(iToDate);
      setFieldValue("fromDate",iToDate)
    } else {
      setIFromDate(formattedDate);
    }
  };

  const handleToDateChange = (date) => {
    setIToDate(moment(new Date(date)).format('YYYY-MM-DD'));
    setFieldValue("toDate",moment(new Date(date)).format());
  };

  const handleStartFromDateChange = (date) => {
    const formattedDate = moment(new Date(date)).format('YYYY-MM-DD');
    if (moment(formattedDate).isAfter(iStartToDate)) {
      setIStartFromDate(iToDate);
      setFieldValue("startDateFrom",iStartToDate)
    } else {
      setIStartFromDate(formattedDate);
    }
  };

  const handleStartToDateChange = (date) => {
    setIStartToDate(moment(new Date(date)).format('YYYY-MM-DD'));
    setFieldValue("startDateTo",moment(new Date(date)).format());
  };

  const handleEndFromDateChange = (date) => {
    const formattedDate = moment(new Date(date)).format('YYYY-MM-DD');
    if (moment(formattedDate).isAfter(iStartToDate)) {
      setIEndFromDate(iToDate);
      setFieldValue("endDateFrom",iStartToDate)
    } else {
        setIEndFromDate(formattedDate);
    }
  };

  const handleEndToDateChange = (date) => {
    setIEndToDate(moment(new Date(date)).format('YYYY-MM-DD'));
    setFieldValue("endDateTo",moment(new Date(date)).format());
  };

  useEffect(() => {
    const subfilter = optionsDropDown.map(item => item.label)
    setSubFilterList(subfilter)
  }, [])

  console.log("optionsDropDown",user)
  useEffect(() => {
    var _validationIdentifierList = getIdentifierList()
    setValidationIdentifierList(
      _validationIdentifierList?.map((v: any) => v.trim()) || []
    );
  }, [])

  useEffect(() => {
    if (gridApi) {
      gridApi!.sizeColumnsToFit();
    }
  }, [mandateReportData]);

  // const getMandateStatusReport = async () => {
  //   await axios
  //     .get(
  //       `${process.env.REACT_APP_BASEURL}/api/Mandates/GetMandateReportDetails?PhaseCode=&GeoVertical=&AdminVertical=&Location=&NextTask=&NextTaskForUser=&MandateCode=&PinCode=&BranchType=`
  //     )
  //     .then((response: any) => {
  //       console.log("response",response?.data)
  //       setMandateReportData(response.data);
  //     })
  //     .catch((e: any) => { });
  // };

  const handleUserAnalytics = () => {
    // if (selectedPhaseCode || selectedGeoVertical || selectedAdminVertical || selectedLocation || selectedNextTask || selectedNextTaskForUser || selectedMandateCode || selectedPinCode || selectedBranchType ) {
    //     const santitizedSelectedAdminVertical = encodeURIComponent(selectedAdminVertical);
    //     axios
    //         .get(
    //             `${process.env.REACT_APP_BASEURL}/api/Mandates/GetMandateReportDetails?PhaseCode=${selectedPhaseCode}&GeoVertical=${selectedGeoVertical}&AdminVertical=${santitizedSelectedAdminVertical}&Location=${selectedLocation}&NextTask=${selectedNextTask}&NextTaskForUser=${selectedNextTaskForUser}&MandateCode=${selectedMandateCode}&PinCode=${selectedPinCode}&BranchType=${selectedBranchType}`
    //         )
    //         .then((response: any) => {
    //           console.log("filter",response)
    //           setMandateReportData(response.data);
    //         })
    //         .catch((e: any) => {
    //         });
    // }
    // else {

    // }
  }

  const handleReset = () => {
    setFieldValue("empName","");
    setFieldValue("designation","");
    setFieldValue("role","");
    setFieldValue("adminVertical","");
    setFieldValue("status","");
    setFieldValue("showNewAccess","");
    setFieldValue("subFilter","");
    setFieldValue("fromDate",moment(new Date()).format());
    setFieldValue("toDate",moment(new Date()).format());
    setFieldValue("startDateFrom",moment(new Date()).format());
    setFieldValue("startDateTo",moment(new Date()).format());
    setFieldValue("endDateFrom",moment(new Date()).format());
    setFieldValue("endDateTo",moment(new Date()).format());
    setIFromDate(null)
    setIToDate(null)
    setIStartFromDate(null)
    setIStartToDate(null)
    setIEndFromDate(null)
    setIEndToDate(null)
    resetForm();
    // setShowAdvanced(false)
  }

  const getEmpName = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/User/UserManagementUsersList`
      )
      .then((response: any) => {
        const data = response?.data || [];
  console.log("employee",response)

        const empNames = data.map(item => item.userName);
        const status : string[] = Array.from(new Set(data.filter(item => item.status && item.status.trim() !== '').map(item => item.status)));
        console.log("PhaseCode",status)
        setEmployeeList(empNames);
        setStatusList(status)
      })
      .catch((e: any) => { });
  };   
  // console.log("employee",employeeList)
  // const getEmpName = async () => {
  //   try {
  //     const response = await axios.get(`${process.env.REACT_APP_BASEURL}/api/User/UserManagementUsersList`);
  //     const data = response?.data || [];
  
  //     // Use Set to get distinct employee names
  //     const empNamesSet = new Set(data.map(item => item.userName));
  //     const empNames = Array.from(empNamesSet);
      
  //     const status : string[] = Array.from(new Set(data.filter(item => item.status && item.status.trim() !== '').map(item => item.status)));

  //     console.log("PhaseCode", empNames);
  //     setEmployeeList(empNames);
  //     setStatusList(status)
  //   } catch (error) {
  //     // Handle errors if needed
  //     console.error('Error fetching employee names:', error);
  //   }
  // };
  
  
  const getAdminVertical = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=Admin_Vertical_List&conditions=`
      )
      .then((response: any) => {
        const data = response?.data?.data || [];
        const adminVerticalNames = data.map(item => item.admin_Vertical_List_Name);
        setAdminVerticalList(adminVerticalNames );
      })
      .catch((e: any) => { });
  };
  // const getRole = async () => {
  //   await axios
  //     .get(
  //       `${process.env.REACT_APP_BASEURL}/api/User/UserManagementRoleList`
  //     )
  //     .then((response: any) => {
  //       const data = response?.data || [];
  //       const roleNames = data.map(item => item.role_Name);
  //       setRoleNameList(roleNames);
  //     })
  //     .catch((e: any) => { });
  // };
  const getRole = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASEURL}/api/User/UserManagementRoleList`);
      const data = response?.data || [];
      
      // Filter out roles with empty names
      const roleNames = data.filter(item => item.role_Name.trim() !== '').map(item => item.role_Name);
      
      setRoleNameList(roleNames);
    } catch (error) {
      // Handle errors if needed
      console.error('Error fetching user roles:', error);
    }
  };
  
  const getDesignation = async () => {
    await axios
        .get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Designation`)
        .then((response: any) => {
          const data = response?.data || [];
          const designation = data.map(item => item.formName);
          setDesignationList(designation);
          console.log("response",response?.data)

        })
        .catch((e: any) => {});
  };
  
  useEffect(() => {
    // getMandateStatusReport();
    getEmpName();
    getAdminVertical();
    getRole();
    getDesignation();
  }, []);
  // function onGridReady(params) {
  //   gridRef.current!.api.sizeColumnsToFit();
  //   setGridApi(params.api);
  // }
  const onFilterTextChange = async (e) => {
    gridApi?.setQuickFilter(e.target.value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"));
    }
  };

  // const handleDateChange = (date, name) => {
  //   const formattedDate = moment(new Date(date)).format('DD/MM/YYYY');
  //   console.log("date",formattedDate)
  //   setFieldValue(name, formattedDate);
  //   // Additional logic based on the field name
  //   if (name === "fromDate" && values.toDate && formattedDate > values.toDate) {
  //     console.log("abcd",values?.fromDate)
  //     setFieldValue("toDate", moment(new Date(formattedDate)).format());
  //   } else if (name === "toDate" && values.fromDate && formattedDate < values.fromDate) {
  //     console.log("abcde",values?.fromDate)
  //     setFieldValue("fromDate", moment(new Date(formattedDate)).format());
  //   } else if (name === "startDateFrom" && values.startDateTo && formattedDate > values.startDateTo) {
  //     setFieldValue("startDateTo", moment(new Date(formattedDate)).format());
  //   } else if (name === "startDateTo" && values.startDateFrom && formattedDate < values.startDateFrom) {
  //     setFieldValue("startDateFrom", moment(new Date(formattedDate)).format());
  //   } else if (name === "endDateFrom" && values.endDateTo && formattedDate > values.endDateTo) {
  //     setFieldValue("endDateTo", moment(new Date(formattedDate)).format());
  //   } else if (name === "endDateTo" && values.endDateFrom && formattedDate < values.endDateFrom) {
  //     setFieldValue("endDateFrom", moment(new Date(formattedDate)).format());
  //   }
  //   // Your additional logic here, if needed
  // };
  
  const userFilterInitialValues = {
    empName : "",
    designation : "",
    role : "",
    adminVertical : "",
    status : "",
    showNewAccess : "",
    subFilter : "",
    fromDate : "",
    toDate : "",
    startDateFrom : "",
    startDateTo : "",
    endDateFrom : "",
    endDateTo : "",
  }
  const {
    values,
    handleBlur,
    setFieldValue,
    handleChange,
    handleSubmit,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: userFilterInitialValues,
    // validationSchema: assetRequestSchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: (values, action) => {
      console.log("values", values);
      // const body = {
      //   empName: values?.empName || "",
      //   designation: values?.designation || "",
      //   role: values?.role || "",
      //   adminVertical: values?.adminVertical || "",
      //   status: values?.status || "",
      //   showNewAccess: values?.showNewAccess || "",
      //   subFilter: values?.subFilter || "",
      //   fromDate: values?.fromDate || "",
      //   toDate: values?.toDate || "",
      //   startDateFrom: values?.startDateFrom || "",
      //   startDateTo: values?.startDateTo || "",
      //   endDateFrom: values?.endDateFrom || "",
      //   endDateTo: values?.endDateTo || "",
      // }
      const body = {
        empName: values?.empName || "",
        designation: values?.designation || "",
        role: values?.role || "",
        adminVertical: values?.adminVertical || "",
        status: values?.status || "",
        showNewAccess: values?.showNewAccess || "",
        subFilter: values?.subFilter || "",
        // fromDate: values?.fromDate ? moment(new Date(values?.fromDate)).format('YYYY-MM-DD') : "",
        // toDate: values?.toDate ? moment(new Date(values?.toDate)).format('YYYY-MM-DD') : "",
        // startDateFrom: values?.startDateFrom ? moment(new Date(values?.startDateFrom)).format('YYYY-MM-DD') : "",
        // startDateTo: values?.startDateTo ? moment(new Date(values?.startDateTo)).format('YYYY-MM-DD') : "",
        // endDateFrom: values?.endDateFrom ? moment(new Date(values?.endDateFrom)).format('YYYY-MM-DD') : "",
        // endDateTo: values?.endDateTo ? moment(new Date(values?.endDateTo)).format('YYYY-MM-DD') : "",
        fromDate: iFromDate ? moment(new Date(iFromDate)).format('YYYY-MM-DD') : "",
        toDate: iToDate ? moment(new Date(iToDate)).format('YYYY-MM-DD') : "",
        startDateFrom: iStartFromDate ? moment(new Date(iStartFromDate)).format('YYYY-MM-DD') : "",
        startDateTo: iStartToDate ? moment(new Date(iStartToDate)).format('YYYY-MM-DD') : "",
        endDateFrom: iEndFromDate ? moment(new Date(iEndFromDate)).format('YYYY-MM-DD') : "",
        endDateTo: iEndToDate ? moment(new Date(iEndToDate)).format('YYYY-MM-DD') : "",
      }
      console.log("body",body)
      if (pinCodeError) {
        // dispatch(fetchError("Pin Code is Not Valid"));
        return;
      }
      if (body?.empName || body?.designation || body?.role || body?.adminVertical || body?.status || body?.showNewAccess || body?.subFilter || body?.fromDate || body?.toDate || body?.startDateFrom || body?.startDateTo || body?.endDateFrom || body?.endDateTo) {
        const santitizedSelectedAdminVertical = encodeURIComponent(body?.adminVertical);
        axios
            .get(
                `${process.env.REACT_APP_BASEURL}/api/Mandates/GetUserAccessReport?EmployeeName=${body?.empName}&Designation=${body?.designation}&AdminVertical=${santitizedSelectedAdminVertical}&Role=${body?.role}&Status=${body?.status}&Subfilter=${body?.subFilter}&Customfromdate=${body?.fromDate}&custometodate=${body?.toDate}&StartDateFrom=${body?.startDateFrom}&StartDateTo=${body?.startDateTo}&EndDateFrom=${body?.endDateFrom}&EndDateTo=${body?.endDateTo}&loginRole=${user?.role}&loginuser=${user?.UserName}`
            )
            .then((response: any) => {
              // console.log("filter",response)
              setMandateReportData(response.data);
              setSelectedEmployeeName(body?.empName);
              setSelectedDesignation(body?.designation);
              setSelectedRole(body?.role);
              setSelectedAdminVertical(body?.adminVertical);
              setSelectedStatus(body?.status);
              setSelectedShowNewAccess(body?.showNewAccess);
              setSelectedSubFilter(body?.subFilter);
              setSelectedFromDate(body?.fromDate);
              setSelectedToDate(body?.toDate);
              setSelectedStartDateFrom(body?.startDateFrom);
              setSelectedStartDateTo(body?.startDateTo);
              setSelectedEndDateFrom(body?.endDateFrom);
              setSelectedEndDateTo(body?.endDateTo);
            })
            .catch((e: any) => {
            });
      }
      else {
        axios
        .get(
          `${process.env.REACT_APP_BASEURL}/api/Mandates/GetUserAccessReport?EmployeeName=&Designation=&AdminVertical=&Role=&Status=&Subfilter=&Customfromdate=&custometodate=&StartDateFrom=&StartDateTo=&EndDateFrom=&EndDateTo=&loginRole=${user?.role}&loginuser=${user?.UserName}`
        )
        .then((response: any) => {
          console.log("response",response?.data)
          setMandateReportData(response.data);
          setSelectedEmployeeName("");
          setSelectedDesignation("");
          setSelectedRole("");
          setSelectedAdminVertical("");
          setSelectedStatus("");
          setSelectedShowNewAccess("");
          setSelectedSubFilter("");
          setSelectedFromDate("");
          setSelectedToDate("");
          setSelectedStartDateFrom("");
          setSelectedStartDateTo("");
          setSelectedEndDateFrom("");
          setSelectedEndDateTo("");
        })
        .catch((e: any) => { });
      }
    }
  })
  const handleDateChange = (date, name) => {
    const formattedDate = moment(new Date(date)).format('DD/MM/YYYY');
    console.log("date",formattedDate)
    setFieldValue(name, formattedDate);
    // Additional logic based on the field name
    if (name === "fromDate" && values.toDate && formattedDate > values.toDate) {
      console.log("abcd",values?.fromDate)
      setFieldValue("toDate", moment(new Date(formattedDate)).format());
    } else if (name === "toDate" && values.fromDate && formattedDate < values.fromDate) {
      console.log("abcde",values?.fromDate)
      setFieldValue("fromDate", moment(new Date(formattedDate)).format());
    } else if (name === "startDateFrom" && values.startDateTo && formattedDate > values.startDateTo) {
      setFieldValue("startDateTo", moment(new Date(formattedDate)).format());
    } else if (name === "startDateTo" && values.startDateFrom && formattedDate < values.startDateFrom) {
      setFieldValue("startDateFrom", moment(new Date(formattedDate)).format());
    } else if (name === "endDateFrom" && values.endDateTo && formattedDate > values.endDateTo) {
      setFieldValue("endDateTo", moment(new Date(formattedDate)).format());
    } else if (name === "endDateTo" && values.endDateFrom && formattedDate < values.endDateFrom) {
      setFieldValue("endDateFrom", moment(new Date(formattedDate)).format());
    }
    // Your additional logic here, if needed
  };
  const handleExportData = () => {    
    const santitizedSelectedAdminVertical = encodeURIComponent(selectedAdminVertical);
    axios
        .get(
          `${process.env.REACT_APP_BASEURL}/api/Mandates/GetUserAccessReportForExcel?EmployeeName=${selectedEmployeeName}&Designation=${selectedDesignation}&AdminVertical=${santitizedSelectedAdminVertical}&Role=${selectedRole}&Status=${selectedStatus}&Subfilter=${selectedSubFilter}&Customfromdate=${selectedFromDate}&custometodate=${selectedToDate}&StartDateFrom=${selectedStartDateFrom}&StartDateTo=${selectedStartDateTo}&EndDateFrom=${selectedEndDateFrom}&EndDateTo=${selectedEndDateTo}&loginRole=${user?.role}&loginuser=${user?.UserName}&type=1`
        )
        .then((response) => {
          if (!response) {
            dispatch(fetchError("Error occurred in Export !!!"));
            return;
          }
          // console.log("response?.data",response?.data)
          if (response?.data) {
            // var filename = "UserAccessReport.xlsx";
            var filename = "UserAccessReport.csv";
            if (filename && filename === "") {
              dispatch(fetchError("Error Occurred !"));
              return;
            }
            const binaryStr = atob(response?.data);
            const byteArray = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              byteArray[i] = binaryStr.charCodeAt(i);
            }

            var blob = new Blob([byteArray], {
              type: "application/octet-stream",
            });
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

              dispatch(
                showMessage("User Access Report downloaded successfully!")
              );
            }
          }
        });
  };

  // const getDynamicColumn = (obj) => {
  //   if (obj != null)
  //     return Object.keys(obj).map(key => ({ field: key }))
  // }

  const getDynamicColumn = (obj) => {
    if (obj != null) {
      return Object.keys(obj).map(key => ({
        field: key,
        headerName: key, // Set the column header name
        headerTooltip: key, // Set the tooltip for the column header
      }));
    }
    return [];
  };

  function onGridReady(params) {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    params.api.setColumnDefs(getDynamicColumn(mandateReportData ?.[0]))
  }

  return (
    <>
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "15px",
        }}
      >
        <Box component="h2" className="page-title-heading mtb-10">
          User Access Report
        </Box>
        <div className="phase-grid">
          <Stack
            display="flex"
            alignItems="flex-end"
            justifyContent="space-between"
            flexDirection="row"
            sx={{ mb: -2 }}
          ></Stack>
        </div>
      </Grid>
      <div
        className="card-panal inside-scroll-142"
        style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
      >
        <div
          style={{ border: "1px solid lightgray", margin: "-15px 0px" }}
        ></div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        ></div>
        <form onSubmit={handleSubmit}>
          <Grid
            marginBottom="30px"
            container
            item
            spacing={5}
            justifyContent="start"
            alignSelf="center"
          >
            {/* Field: Employee Name */}
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
            <div className="input-form">
                        <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Employee Name</h2>
                        <Autocomplete
                          disablePortal
                          // sx={{
                          //   backgroundColor: "#f3f3f3",
                          //   borderRadius: "6px",
                          // }}
                          id="combo-box-demo"
                          getOptionLabel={(option : any ) => 
                            option?.toString() || ""
                          }
                          // disableClearable={true}
                          options={employeeList}
                          onChange={(e, v) => {
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("empName", v);
                            console.log("val",v)
                            // setSelectedPhaseCode(v);
                          }}
                          placeholder="Document Type"
                          value={values?.empName || ""}
                          renderInput={(params) => (
                            <TextField
                              name="empName"
                              id="empName"
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
  
            {/* Field: Designation */}
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
            <div className="input-form">
                        <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Designation</h2>
                        <Autocomplete
                          disablePortal
                          // sx={{
                          //   backgroundColor: "#f3f3f3",
                          //   borderRadius: "6px",
                          // }}
                          id="combo-box-demo"
                          getOptionLabel={(option : any ) => 
                            option?.toString() || ""
                          }
                          // disableClearable={true}
                          options={designationList}
                          onChange={(e, v) => {
                            // console.log("val",v,v?.admin_Vertical_List_Name)
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("designation", v);
                            // setSelectedGeoVertical(v);
                          }}
                          placeholder="Document Type"
                          value={values?.designation || ""}
                          renderInput={(params) => (
                            <TextField
                              name="designation"
                              id="designation"
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
  
            {/* Field: Role */}
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
            <div className="input-form">
                        <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Role</h2>
                        <Autocomplete
                          disablePortal
                          // sx={{
                          //   backgroundColor: "#f3f3f3",
                          //   borderRadius: "6px",
                          // }}
                          id="combo-box-demo"
                          getOptionLabel={(option : any ) => 
                            option?.toString() || ""
                          }
                          // disableClearable={true}
                          options={roleNameList}
                          onChange={(e, v) => {
                            // console.log("val",v,v?.admin_Vertical_List_Name)
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("role", v);
                            // setSelectedGeoVertical(v);
                          }}
                          placeholder="Document Type"
                          value={values?.role || ""}
                          renderInput={(params) => (
                            <TextField
                              name="role"
                              id="role"
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
  
            {/* Field: Admin Vertical */}
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
            <div className="input-form">
                      <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Admin Vertical</h2>                  
                      <Autocomplete
                          disablePortal
                          // sx={{
                          //   backgroundColor: "#f3f3f3",
                          //   borderRadius: "6px",
                          // }}
                          id="combo-box-demo"
                          getOptionLabel={(option : any ) => 
                            option?.toString() || ""
                          }
                          // disableClearable={true}
                          options={adminVerticalList}
                          onChange={(e, v) => {
                            // console.log("val",v,v)
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("adminVertical", v);
                            // setSelectedAdminVertical(v);
                          }}
                          placeholder="Document Type"
                          value={values?.adminVertical || ""}
                          renderInput={(params) => (
                            <TextField
                              name="adminVertical"
                              id="adminVertical"
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
  
            {/* Field: Status */}
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
            <div className="input-form">
                      <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Status</h2>                  
                      <Autocomplete
                          disablePortal
                          // sx={{
                          //   backgroundColor: "#f3f3f3",
                          //   borderRadius: "6px",
                          // }}
                          id="combo-box-demo"
                          getOptionLabel={(option : any ) => 
                            option?.toString() || ""
                          }
                          // disableClearable={true}
                          options={statusList}
                          onChange={(e, v) => {
                            // console.log("val",v,v)
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("status", v);
                            // setSelectedAdminVertical(v);
                          }}
                          placeholder="Document Type"
                          value={values?.status || ""}
                          renderInput={(params) => (
                            <TextField
                              name="status"
                              id="status"
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
  
            {/* Field: Show New Access */}
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
            <div className="input-form">
                      <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Show New Access</h2>                  
                      <Autocomplete
                          disablePortal
                          // sx={{
                          //   backgroundColor: "#f3f3f3",
                          //   borderRadius: "6px",
                          // }}
                          id="combo-box-demo"
                          getOptionLabel={(option : any ) => 
                            option?.toString() || ""
                          }
                          // disableClearable={true}
                          options={adminVerticalList}
                          onChange={(e, v) => {
                            // console.log("val",v,v)
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("showNewAccess", v);
                            // setSelectedAdminVertical(v);
                          }}
                          placeholder="Document Type"
                          value={values?.showNewAccess || ""}
                          renderInput={(params) => (
                            <TextField
                              name="showNewAccess"
                              id="showNewAccess"
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
  
            {/* Field: Sub Filter */}
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
            <div className="input-form">
                      <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Sub Filter</h2>
                      <Autocomplete
                          disablePortal
                          // sx={{
                          //   backgroundColor: "#f3f3f3",
                          //   borderRadius: "6px",
                          // }}
                          id="combo-box-demo"
                          getOptionLabel={(option : any ) => 
                            option?.toString() || ""
                          }
                          // disableClearable={true}
                          options={subFilterList}
                          onChange={(e, v) => {
                            console.log("subFilter",v?.label)
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("subFilter", v);
                            setSelectedSubFilter(v)
                          }}
                          placeholder="Document Type"
                          value={values?.subFilter || ""}
                          renderInput={(params) => (
                            <TextField
                              name="subFilter"
                              id="subFilter"
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
  
            {/* Additional Fields based on conditions */}
            {values?.subFilter === "Custom" && (
              <>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                        <h2 className="phaseLable"  style={{ marginTop: "-25px " }}>From Date</h2>
                          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                  // disabled={inspectionDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  value={moment(new Date(values.fromDate)).format("DD/MM/YYYY")}
                                  // value={iFromDate}
                                  maxDate={new Date()}
                                  // onChange={(date) => handleDateChange(date, "fromDate")}
                                  onChange={(date) => handleDateChange(date, "fromDate")}
                                //   onChange={(newValue) => {
                                //     const formattedDate = moment(new Date(newValue)).format('DD/MM/YYYY');
                                //     if (moment(formattedDate).isAfter(iToDate)) {
                                //         setIFromDate(iToDate);
                                //         setFieldValue("fromDate",iToDate)
                                //         // setFromDateError('');
                                //     } else {
                                //       setIFromDate(formattedDate);
                                //       setFieldValue("fromDate",formattedDate)
                                //         // setFromDateError('');
                                //     }
                                // }}
                                  renderInput={(params) => <TextField {...params} name="fromDate" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                              />
                          </LocalizationProvider> */}
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                  // disabled={inspectionDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  maxDate={new Date()}
                                  value={iFromDate}
                                  onChange={handleFromDateChange}
                                  renderInput={(params) => <TextField {...params} name="startDateFrom" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                              />
                          </LocalizationProvider>
                          {/* {!inspectionDateDisable && touched.inspection_date && errors.inspection_date ? <p className="form-error">{errors.inspection_date || dateError}</p> : null} */}
                        </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                        <h2 className="phaseLable"  style={{ marginTop: "-25px " }}>To Date</h2>
                          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                  // disabled={inspectionDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  // value={iToDate}
                                  value={moment(new Date(values.toDate)).format("DD/MM/YYYY")}
                                  maxDate={new Date()}
                                  minDate={values.fromDate ? new Date(moment(new Date(values.fromDate)).format("DD-MM-YYYY")) : null}
                                  onChange={(date) => handleDateChange(date, "toDate")}
                                  renderInput={(params) => <TextField {...params} name="toDate" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                              />
                          </LocalizationProvider> */}
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                  // disabled={inspectionDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  // value={moment(new Date(values.startDateFrom)).format("DD/MM/YYYY")}
                                  maxDate={new Date()}
                                  minDate={iFromDate}
                                  // onChange={(date) => handleDateChange(date, "startDateFrom")}
                                  value={iToDate}
                                  onChange={handleToDateChange}
                                  renderInput={(params) => <TextField {...params} name="startDateFrom" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                              />
                          </LocalizationProvider>
                          {/* {!inspectionDateDisable && touched.inspection_date && errors.inspection_date ? <p className="form-error">{errors.inspection_date || dateError}</p> : null} */}
                        </div>
                </Grid>
              </>
            )}
  
            {showAdvanced && (
              <>
                {/* Additional Fields for Advanced Search */}
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                          <h2 className="phaseLable"  style={{ marginTop: "-25px " }}>Start Date From</h2>
                          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                  // disabled={inspectionDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  value={moment(new Date(values.startDateFrom)).format("DD/MM/YYYY")}
                                  maxDate={new Date()}
                                  onChange={(date) => handleDateChange(date, "startDateFrom")}
                                  renderInput={(params) => <TextField {...params} name="startDateFrom" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                              />
                          </LocalizationProvider> */}
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                  // disabled={inspectionDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  maxDate={new Date()}
                                  value={iStartFromDate}
                                  onChange={handleStartFromDateChange}
                                  renderInput={(params) => <TextField {...params} name="startDateFrom" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                              />
                          </LocalizationProvider>
                        {/* {!inspectionDateDisable && touched.inspection_date && errors.inspection_date ? <p className="form-error">{errors.inspection_date || dateError}</p> : null} */}
                        </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                          <h2 className="phaseLable"  style={{ marginTop: "-25px " }}>Start Date To</h2>
                          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                  // disabled={inspectionDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  value={moment(new Date(values.startDateTo)).format("DD/MM/YYYY")}
                                  maxDate={new Date()}
                                  onChange={(date) => handleDateChange(date, "startDateTo")}
                                  renderInput={(params) => <TextField {...params} name="startDateTo" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                              />
                          </LocalizationProvider> */}
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                  // disabled={inspectionDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  maxDate={new Date()}
                                  minDate={iStartFromDate}
                                  value={iStartToDate}
                                  onChange={handleStartToDateChange}
                                  renderInput={(params) => <TextField {...params} name="startDateFrom" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                              />
                          </LocalizationProvider>
                        {/* {!inspectionDateDisable && touched.inspection_date && errors.inspection_date ? <p className="form-error">{errors.inspection_date || dateError}</p> : null} */}
                        </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                          <h2 className="phaseLable"  style={{ marginTop: "-25px " }}>End Date From</h2>
                          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                  // disabled={inspectionDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  value={moment(new Date(values.endDateFrom)).format("DD/MM/YYYY")}
                                  maxDate={new Date()}
                                  onChange={(date) => handleDateChange(date, "endDateFrom")}
                                  renderInput={(params) => <TextField {...params} name="endDateFrom" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                              />
                          </LocalizationProvider> */}
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                  // disabled={inspectionDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  maxDate={new Date()}
                                  value={iEndFromDate}
                                  onChange={handleEndFromDateChange}
                                  renderInput={(params) => <TextField {...params} name="startDateFrom" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                              />
                          </LocalizationProvider>
                        {/* {!inspectionDateDisable && touched.inspection_date && errors.inspection_date ? <p className="form-error">{errors.inspection_date || dateError}</p> : null} */}
                        </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                          <h2 className="phaseLable"  style={{ marginTop: "-25px " }}>End Date To</h2>
                          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                  // disabled={inspectionDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  value={moment(new Date(values.endDateTo)).format("DD/MM/YYYY")}
                                  maxDate={new Date()}
                                  onChange={(date) => handleDateChange(date, "endDateTo")}
                                  renderInput={(params) => <TextField {...params} name="endDateTo" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                              />
                          </LocalizationProvider> */}
                           <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                  // disabled={inspectionDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  maxDate={new Date()}
                                  minDate={iEndFromDate}
                                  value={iEndToDate}
                                  onChange={handleEndToDateChange}
                                  renderInput={(params) => <TextField {...params} name="startDateFrom" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                              />
                          </LocalizationProvider>
                        {/* {!inspectionDateDisable && touched.inspection_date && errors.inspection_date ? <p className="form-error">{errors.inspection_date || dateError}</p> : null} */}
                        </div>
                </Grid>
              </>
            )}
  
            {/* Buttons */}
            {values?.subFilter !== "Custom" &&
            <>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}></Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}></Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}></Grid>
            </>
            }
            {values?.subFilter === "Custom" &&
            <>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}></Grid>
            </>
            }
            <Grid item xs={12} md={6} sx={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ marginTop: "20px" }}>
                  {/* {!showAdvanced && ( */}
                    <Button
                      variant="contained"
                      type="submit"
                      size="small"
                      style={{
                        marginLeft: 0,
                        padding: "2px 20px",
                        borderRadius: 6,
                        color: "#fff",
                        borderColor: "#00316a",
                        backgroundColor: "#00316a",
                        marginTop: "25px !important",
                      }}
                    >
                      Search
                    </Button>
                  {/* )} */}
                  {/* {values?.subFilter === "Custom" && ( */}
                    <Button
                      variant="contained"
                      size="small"
                      style={{
                        marginLeft: !showAdvanced ? 5 : 5,
                        padding: "2px 20px",
                        borderRadius: 6,
                        color: "#fff",
                        borderColor: "#00316a",
                        backgroundColor: "#00316a",
                        marginTop: "25px !important",
                      }}
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      {showAdvanced ? "Hide Advanced Search Filter" : "Show Advanced Search Filter"}
                    </Button>
                  {/* )} */}
                  {/* {!showAdvanced && ( */}
                    <Button
                      variant="contained"
                      type="reset"
                      size="small"
                      style={{
                        marginLeft: 5,
                        padding: "2px 20px",
                        borderRadius: 6,
                        color: "#fff",
                        borderColor: "#00316a",
                        backgroundColor: "#00316a",
                        marginTop: "25px !important",
                        marginRight: "auto",
                      }}
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                  {/* )} */}
                </div>
                {/* {!showAdvanced && ( */}
                  <div style={{ marginTop: "20px", display: "flex", alignItems: "center" }}>
                    <Button
                      variant="outlined"
                      size="medium"
                      style={{
                        padding: "2px 20px",
                        fontSize: 12,
                        borderRadius: 6,
                        color: "#00316a",
                        borderColor: mandateReportData.length === 0 ? "gray" : "#00316a",
                        backgroundColor: mandateReportData.length === 0 ? "gray" : "",
                      }}
                      disabled={mandateReportData.length === 0}
                      onClick={() => {
                        handleExportData();
                      }}
                    >
                      <img src={csv} alt="" className="icon-size" /> Download
                    </Button>
                  </div>
                {/* )} */}
              </div>
            </Grid>
          </Grid>
        </form>
        <hr style={{ border: "1px solid lightgray", marginTop: "-10px", marginBottom: 10 }} />
        {mandateReportData && mandateReportData ?.length > 0 && (
            <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
              <AgGridReact
                defaultColDef={{ flex: 1, resizable: true, width: 150, minWidth: 150, sortable: true }}
                rowData={mandateReportData || []}
                onGridReady={onGridReady}
                pagination={true}
                paginationPageSize={10}
              />
            </div>)}
      </div>
    </>
  );
}

export default Abc;
