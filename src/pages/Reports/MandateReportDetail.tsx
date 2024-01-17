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
function MandateReportDetail() {
  const [mandateReportData, setMandateReportData] = React.useState<any>([]);
  const [phaseCodeList, setPhaseCodeList] = React.useState<any>([]);
  const [adminVerticalList, setAdminVerticalList] = React.useState<any>([]);
  const [geoVerticalList, setGeoVerticalList] = React.useState<any>([]);
  const [locationList, setLocationList] = React.useState<any>([]);
  const [branchTypeList, setBranchTypeList] = React.useState<any>([]);
  const [nextTaskList, setNextTaskList] = React.useState<any>([]);
  const [nextTaskForUserList, setNextTaskForUserList] = React.useState<any>([]);
  const [mandateCodeList, setMandateCodeList] = React.useState<any>([]);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const [_validationIdentifierList, setValidationIdentifierList] =
    React.useState([]);
  const [params]: any = useUrlSearchParams({}, {});
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedAdminVertical, setSelectedAdminVertical] = useState("")
  const [selectedGeoVertical, setSelectedGeoVertical] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedNextTask, setSelectedNextTask] = useState("")
  const [selectedNextTaskForUser, setSelectedNextTaskForUser] = useState("")
  const [selectedPhaseCode, setSelectedPhaseCode] = useState("")
  const [selectedMandateCode, setSelectedMandateCode] = useState("")
  const [selectedPinCode, setSelectedPinCode] = useState("")
  const [selectedBranchType, setSelectedBranchType] = useState("")
  const [pinCodeError, setPinCodeError] = useState("")
  
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
    setFieldValue("phaseCode","");
    setFieldValue("geoVertical","");
    setFieldValue("adminVertical","");
    setFieldValue("location","");
    setFieldValue("nextTask","");
    setFieldValue("nextTaskForUser","");
    setFieldValue("mandateCode","");
    setFieldValue("pinCode","");
    setFieldValue("branchType","");
    console.log("abcd",selectedPhaseCode)
    // setSelectedPhaseCode(""); // Resetting selected values for Autocomplete
    // setSelectedGeoVertical("");
    // setSelectedAdminVertical("");
    // setSelectedLocation("")
    // setSelectedNextTask("")
    // setSelectedNextTaskForUser("")
    // setSelectedMandateCode("")
    // setSelectedPinCode("");
    // setSelectedBranchType("");
    // setPinCodeError("")
    resetForm();
  }

  const getPhaseCode = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/GetPhaseCodeList`
      )
      .then((response: any) => {
        // console.log("PhaseCode",response)
        setPhaseCodeList(response?.data);
      })
      .catch((e: any) => { });
  };
  console.log("PhaseCodeList",phaseCodeList)

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
  const getGeoVertical = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=VerticalMaster&conditions=`
      )
      .then((response: any) => {
        const data = response?.data?.data || [];
        const verticalNames = data.map(item => item.verticalName);
        setGeoVerticalList(verticalNames );
      })
      .catch((e: any) => { });
  };
  const getLocation = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/GetMandateLocationList`
      )
      .then((response: any) => {
        console.log("location",response)
        setLocationList(response?.data);
      })
      .catch((e: any) => { });
  };
  console.log("adminVerticalList",adminVerticalList)
  const getBranchType = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/mandates/GetDistinctBranchTypeList`
      )
      .then((response: any) => {
        const data = response?.data || [];
        // const branchNames = data.map(item => item.branchTypeName);
        setBranchTypeList(data);
      })
      .catch((e: any) => { });
  };
  const getNewTask = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/GetWorkItemList`
      )
      .then((response: any) => {
        setNextTaskList(response?.data);
      })
      .catch((e: any) => { });
  };
  const getNewTaskForUser = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/GetNextTaskForUserDDL`
      )
      .then((response: any) => {
        console.log("responseNewTaskForUser",response)
        // const adminVerticalNames = response?.data?.data.map(item => item.admin_Vertical_List_Name);
        setNextTaskForUserList(response?.data);
      })
      .catch((e: any) => { });
  };

  const getMandateCode = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/GetMandateCodeList`
      )
      .then((response: any) => {
        console.log("Mandate",response)
        // const adminVerticalNames = response?.data?.data.map(item => item.admin_Vertical_List_Name);
        setMandateCodeList(response?.data);
      })
      .catch((e: any) => { });
  };
  
  useEffect(() => {
    // getMandateStatusReport();
    getPhaseCode();
    getAdminVertical();
    getGeoVertical();
    getLocation();
    getBranchType();
    getNewTask();
    getNewTaskForUser();
    getMandateCode();
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
  let columnDefs = [
    {
      field: "PhaseCode",
      headerName: "Phase Code",
      headerTooltip: "Phase Code",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "MandateCode",
      headerName: "Mandate Code",
      headerTooltip: "Mandate Code",
      cellRenderer: (e: any) => {
        var index = e?.value.toUpperCase();
        return index;
      },
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "GeoVertical",
      headerName: "Geo Vertical",
      headerTooltip: "Geo Vertical",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "AdminVertical",
      headerName: "Admin Vertical",
      headerTooltip: "Admin Vertical",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Location",
      headerName: "Location",
      headerTooltip: "Location",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "PinCode",
      headerName: "Pin Code",
      headerTooltip: "Pin Code",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Branch_Type",
      headerName: "Branch Type",
      headerTooltip: "Branch Type",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "ProjectDeliveryManager",
      headerName: "Project Delivery Manager",
      headerTooltip: "Project Delivery Manager",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "ProjectManager",
      headerName: "Project Manager",
      headerTooltip: "Project Manager",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Previous_Task_Completed",
      headerName: "Previous Task Completed",
      headerTooltip: "Previous Task Completed",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Previous_Task_Completedby_Role",
      headerName: "Previous Task Completed By Role",
      headerTooltip: "Previous Task Completed By Role",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Previous_Task_completedBy_user",
      headerName: "Previous Task Completed By User",
      headerTooltip: "Previous Task Completed By User",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Previous_task_Completed_On",
      headerName: "Previous Task Completed On",
      headerTooltip: "Previous Task Completed On",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellRenderer: (e: any) => {
        console.log("abc",e)
        return moment(e?.data?.Previous_task_Completed_On).format("DD/MM/YYYY HH:mm:ss");
      },
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "NextTask",
      headerName: "Next Task",
      headerTooltip: "Next Task",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Next_Task_For_Role",
      headerName: "Next Task For Role",
      headerTooltip: "Next Task For Role",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Next_Task_For_User",
      headerName: "Next Task For User",
      headerTooltip: "Next Task For User",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Status",
      headerName: "Status",
      headerTooltip: "Status",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Aging_in_Days",
      headerName: "Ageing(In Days)",
      headerTooltip: "Ageing(In Days)",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
  ];

  const mandateFilterInitialValues = {
    phaseCode : "",
    geoVertical : "",
    adminVertical : "",
    location : "",
    nextTask : "",
    nextTaskForUser : "",
    mandateCode : "",
    pinCode : "",
    branchType : ""
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
    initialValues: mandateFilterInitialValues,
    // validationSchema: assetRequestSchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: (values, action) => {
      console.log("values", values);
      const body = {
        phaseCode: values?.phaseCode || "",
        geoVertical: values?.geoVertical || "",
        adminVertical: values?.adminVertical || "",
        location: values?.location || "",
        nextTask: values?.nextTask || "",
        nextTaskForUser: values?.nextTaskForUser || "",
        mandateCode: values?.mandateCode || "",
        pinCode: values?.pinCode || "",
        branchType: values?.branchType || "",
      }
      if (pinCodeError) {
        // dispatch(fetchError("Pin Code is Not Valid"));
        return;
      }
      if (body?.phaseCode || body?.geoVertical || body?.adminVertical || body?.location || body?.nextTask || body?.nextTaskForUser || body?.mandateCode || body?.pinCode || body?.branchType ) {
        const santitizedSelectedAdminVertical = encodeURIComponent(body?.adminVertical);
        axios
            .get(
                `${process.env.REACT_APP_BASEURL}/api/Mandates/GetMandateReportDetails?PhaseCode=${body?.phaseCode}&GeoVertical=${body?.geoVertical}&AdminVertical=${santitizedSelectedAdminVertical}&Location=${body?.location}&NextTask=${body?.nextTask}&NextTaskForUser=${body?.nextTaskForUser}&MandateCode=${body?.mandateCode}&PinCode=${body?.pinCode}&BranchType=${body?.branchType}`
            )
            .then((response: any) => {
              // console.log("filter",response)
              setMandateReportData(response.data);
              setSelectedPhaseCode(body?.phaseCode);
              setSelectedGeoVertical(body?.geoVertical);
              setSelectedAdminVertical(body?.adminVertical);
              setSelectedLocation(body?.location);
              setSelectedNextTask(body?.nextTask);
              setSelectedNextTaskForUser(body?.nextTaskForUser);
              setSelectedMandateCode(body?.mandateCode);
              setSelectedPinCode(body?.pinCode);
              setSelectedBranchType(body?.branchType);
            })
            .catch((e: any) => {
            });
      }
      else {
        axios
        .get(
          `${process.env.REACT_APP_BASEURL}/api/Mandates/GetMandateReportDetails?PhaseCode=&GeoVertical=&AdminVertical=&Location=&NextTask=&NextTaskForUser=&MandateCode=&PinCode=&BranchType=`
        )
        .then((response: any) => {
          console.log("response",response?.data)
          setMandateReportData(response.data);
          setSelectedPhaseCode(""); // Resetting selected values for Autocomplete
          setSelectedGeoVertical("");
          setSelectedAdminVertical("");
          setSelectedLocation("")
          setSelectedNextTask("")
          setSelectedNextTaskForUser("")
          setSelectedMandateCode("")
          setSelectedPinCode("");
          setSelectedBranchType("");
          setPinCodeError("")
        })
        .catch((e: any) => { });
      }
    }
  })

  const handleExportData = () => {    
    const santitizedSelectedAdminVertical = encodeURIComponent(selectedAdminVertical);
    axios
        .get(
          `${process.env.REACT_APP_BASEURL}/api/Mandates/GetMandateReportDetailsForExcel?PhaseCode=${selectedPhaseCode}&GeoVertical=${selectedGeoVertical}&AdminVertical=${santitizedSelectedAdminVertical}&Location=${selectedLocation}&NextTask=${selectedNextTask}&NextTaskForUser=${selectedNextTaskForUser}&MandateCode=${selectedMandateCode}&PinCode=${selectedPinCode}&BranchType=${selectedBranchType}&type=1`
        )
        .then((response) => {
          if (!response) {
            dispatch(fetchError("Error occurred in Export !!!"));
            return;
          }
          // console.log("response?.data",response?.data)
          if (response?.data) {
            // var filename = "MandateReportDetail.xlsx";
            var filename = "MandateReportDetail.csv";
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
                showMessage("Mandate Report Details downloaded successfully!")
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
        <Box component="h2" className="page-title-heading mtb-10" >
          Mandate Report Details
        </Box>
        <div className="phase-grid">
          <Stack
            display="flex"
            alignItems="flex-end"
            justifyContent="space-between"
            flexDirection="row"
            sx={{ mb: -2 }}
          >
            {/* <TextField
              size="small"
              sx={{ marginRight: "10px" }}
              variant="outlined"
              name="search"
              onChange={(e) => onFilterTextChange(e)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />       */}
            {/* <AppTooltip title="Export Excel">
              <IconButton
                className="icon-btn"
                sx={{
                  // borderRadius: "50%",
                  // borderTopColor:"green",
                  width: 35,
                  height: 35,
                  // color: (theme) => theme.palette.text.secondary,
                  color: "white",
                  backgroundColor: "green",
                  "&:hover, &:focus": {
                    backgroundColor: "green", // Keep the color green on hover
                  },
                }}
                onClick={() => { handleExportData(); }}
                size="large"
              >
                <AiFillFileExcel />
              </IconButton>
            </AppTooltip> */}

          </Stack>
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
                marginBottom: "20px"
              }}
            >
              {/* <Typography className="section-headingTop" style={{ marginRight: "20px" }}>
                Asset Details
              </Typography> */}
              {/* <Button
                    variant="contained"
                    // type="submit"
                    size="small"
                    style={{ ...submit, marginLeft: "0px !important" }}
                    onClick={() => setOpenDrawer(!openDrawer)}
                  >
                    Search ASSET
              </Button> */}
            </div>
            <form onSubmit={handleSubmit}>
              <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center">
                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                    <div className="input-form">
                        <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Phase Code</h2>
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
                          options={phaseCodeList}
                          onChange={(e, v) => {
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("phaseCode", v);
                            console.log("val",v)
                            // setSelectedPhaseCode(v);
                          }}
                          placeholder="Document Type"
                          value={values?.phaseCode || ""}
                          renderInput={(params) => (
                            <TextField
                              name="phaseCode"
                              id="phaseCode"
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
                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                    <div className="input-form">
                        <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Geo Vertical</h2>
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
                          options={geoVerticalList}
                          onChange={(e, v) => {
                            // console.log("val",v,v?.admin_Vertical_List_Name)
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("geoVertical", v);
                            // setSelectedGeoVertical(v);
                          }}
                          placeholder="Document Type"
                          value={values?.geoVertical || ""}
                          renderInput={(params) => (
                            <TextField
                              name="geoVertical"
                              id="geoVertical"
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
                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
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
                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                    <div className="input-form">
                      <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Location</h2>
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
                          options={locationList}
                          onChange={(e, v) => {
                            // console.log("valNewTask",v,v?.admin_Vertical_List_Name)
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("location", v);
                            // setSelectedLocation(v);
                          }}
                          placeholder="Document Type"
                          value={values?.location || ""}
                          renderInput={(params) => (
                            <TextField
                              name="location"
                              id="location"
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
                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                    <div className="input-form">
                        <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Next Task</h2>
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
                          options={nextTaskList}
                          onChange={(e, v) => {
                            // console.log("valNewTask",v,v?.admin_Vertical_List_Name)
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("nextTask", v);
                            // setSelectedNextTask(v);
                          }}
                          placeholder="Document Type"
                          value={values?.nextTask || ""}
                          renderInput={(params) => (
                            <TextField
                              name="nextTask"
                              id="nextTask"
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
                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                    <div className="input-form">
                        <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Next Task For User</h2>
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
                          value={values?.nextTaskForUser || ""}
                          options={nextTaskForUserList}
                          onChange={(e, v) => {
                            // console.log("valNewTask",v,v?.admin_Vertical_List_Name)
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("nextTaskForUser", v);
                            // setSelectedNextTaskForUser(v);
                          }}
                          placeholder="Document Type"
                          // //value={values?.assetType}
                          renderInput={(params) => (
                            <TextField
                              name="nextTaskForUser"
                              id="nextTaskForUser"
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
                {/* <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                      <div style={{ marginTop: "20px" }}>
                        <Button
                          variant="contained"
                          // type="submit"
                          size="small"
                          style={{ ...search, marginLeft: "0px !important",marginTop:"25px !important" }}
                          onClick={handleUserAnalytics}
                        >
                          Search 
                        </Button>
                      </div>
                  </Grid> */}
                  <Grid item xs={12} md={6} sx={{ position: "relative" }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ marginTop: "20px" }}>
                        {!showAdvanced &&
                          <Button
                            variant="contained"
                            type="submit"
                            size="small"
                            style={{
                              marginLeft:0,
                              padding: "2px 20px",
                              borderRadius: 6,
                              color: "#fff",
                              borderColor: "#00316a",
                              backgroundColor:"#00316a",
                              marginTop:"25px !important"
                            }}
                            // onClick={handleUserAnalytics}
                            // onClick={handleSubmit}
                          >
                            Search 
                          </Button>
                        }
                        <Button
                          variant="contained"
                          size="small"
                          style={{
                            marginLeft: !showAdvanced ? 5 : 0,
                            padding: "2px 20px",
                            borderRadius: 6,
                            color: "#fff",
                            borderColor: "#00316a",
                            backgroundColor:"#00316a",
                            marginTop:"25px !important"
                          }}
                          onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                          {showAdvanced ? 'Hide Advanced Search Filter' : 'Show Advanced Search Filter'} 
                        </Button>
                        {!showAdvanced &&
                          <Button
                              variant="contained"
                              type="reset"
                              size="small"
                              style={{
                                marginLeft: 5,
                                padding: '2px 20px',
                                borderRadius: 6,
                                color: '#fff',
                                borderColor: '#00316a',
                                backgroundColor: '#00316a',
                                marginTop: '25px !important',
                                marginRight: 'auto', // Push the button to the left end
                              }}
                              // onClick={handleUserAnalytics}
                              onClick={handleReset}
                            >
                              Reset
                            </Button>
                          }
                      </div>
                      {!showAdvanced &&
                        <div style={{ marginTop: "20px", display: 'flex', alignItems: 'center' }}>
                          {/* <AppTooltip title="Export Excel">
                            <IconButton
                              className="icon-btn"
                              sx={{
                                width: 35,
                                height: 35,
                                color: 'white',
                                backgroundColor: 'green',
                                '&:hover, &:focus': {
                                  backgroundColor: 'green',
                                },
                              }}
                              onClick={() => {
                                handleExportData();
                              }}
                              size="large"
                            >
                              <AiFillFileExcel />
                            </IconButton>
                          </AppTooltip> */}
                          <Button
                            variant="outlined"
                            size="medium"
                            style={{
                              padding: "2px 20px",
                              fontSize: 12,
                              borderRadius: 6,
                              color: "#00316a",
                              // borderColor: "#00316a",
                              borderColor: mandateReportData.length === 0 ? 'gray' : '#00316a',
                              backgroundColor: mandateReportData.length === 0 ? 'gray' : '',
                            }}
                            disabled={mandateReportData.length === 0}
                            onClick={() => {
                              handleExportData();
                            }}
                          >
                            <img src={csv} alt="" className="icon-size" /> Download
                          </Button>
                        </div>
                      }
                    </div>
                  </Grid>
                  {showAdvanced && 
                    <>
                    {/* <Grid item xs={6} md={3} sx={{ position: 'relative' }}></Grid> */}
                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                    <div className="input-form">
                        <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Mandate Code</h2>
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
                          options={mandateCodeList}
                          value={values?.mandateCode || ""}
                          onChange={(e, v) => {
                            // console.log("val",v,v?.admin_Vertical_List_Name)
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("mandateCode", v);
                            // setSelectedMandateCode(v);
                          }}
                          placeholder="Document Type"
                          // //value={values?.assetType}
                          renderInput={(params) => (
                            <TextField
                              name="mandateCode"
                              id="mandateCode"
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
                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                    <div className="input-form">
                      <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Pin Code</h2>
                      <TextField
                        // disabled={params?.action === 'view' ? true : _validationIdentifierList.includes('request_inspector_email')}
                        autoComplete="off"
                        name="pinCode"
                        id="pinCode"
                        type="number"
                        variant="outlined"
                        size="small"
                        className="w-85"
                        InputProps={{ inputProps: { min: 0, maxLength: 6 } }}                                    
                        value={values?.pinCode || ""}
                      //   onChange={(e) => {
                      //     const inputPin = e.target.value;
                      //     if (inputPin.length <= 6) {
                      //         if (inputPin.length === 6) {
                      //             if (inputPin.charAt(0) === '0') {
                      //                 setPinCodeError("Pin Code should not start with 0");
                      //             }
                      //             else {
                      //                 setPinCodeError(""); // Clear error if conditions are met
                      //             }
                      //         } else {
                      //             setPinCodeError("Pin Code must be 6 digits");
                      //         }
                      //         setFieldValue('pinCode', inputPin);
                      //         setSelectedPinCode(inputPin);
                      //     }
                      // }}
                      onChange={(e) => {
                        const inputPin = e.target.value;
                        if (inputPin.length <= 6) {
                          if (inputPin.length === 6) {
                            if (inputPin.charAt(0) === '0') {
                              setPinCodeError("Pin Code should not start with 0");
                            } else {
                              setPinCodeError(""); 
                            }
                          } else if (inputPin.length === 0) { 
                            setPinCodeError(""); 
                          } else {
                            setPinCodeError("Pin Code must be 6 digits");
                          }
                          setFieldValue('pinCode', inputPin);
                          // setSelectedPinCode(inputPin);
                        }
                      }}
                      
                      onKeyDown={(e) => {
                        const disallowedKeys = ['e', '.', '-','+'];
                        if (disallowedKeys.includes(e.key.toLowerCase()) || e.keyCode === 69) {
                          e.preventDefault(); // Prevent default behavior for disallowed keys
                        }
                      }}
                      />
                      {pinCodeError && <p className="form-error">{pinCodeError}</p>}
                    </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                    <div className="input-form">
                      <h2 className="phaseLable"  style={{ marginTop: "-20px " }}>Branch Type</h2>                  
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
                          value={values?.branchType || ""}
                          options={branchTypeList}
                          onChange={(e, v) => {
                            // console.log("val",v,v?.branchTypeName)
                            // setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.assetType });
                            setFieldValue("branchType", v);
                            // setSelectedBranchType(v);
                          }}
                          placeholder="Document Type"
                          // //value={values?.assetType}
                          renderInput={(params) => (
                            <TextField
                              name="branchType"
                              id="branchType"
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
                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                  <div style={{ marginTop: '-5px', display: 'flex', alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      type="submit"
                      size="small"
                      style={{
                        padding: '2px 20px',
                        borderRadius: 6,
                        color: '#fff',
                        borderColor: '#00316a',
                        backgroundColor: '#00316a',
                        marginTop: '25px',
                      }}
                      // onClick={handleUserAnalytics}
                    >
                      Search
                    </Button>
                    <Button
                      variant="contained"
                      type="reset"
                      size="small"
                      style={{
                        padding: '2px 20px',
                        borderRadius: 6,
                        color: '#fff',
                        borderColor: '#00316a',
                        backgroundColor: '#00316a',
                        marginTop: '25px',
                        marginLeft: '5px',
                      }}
                      // onClick={handleUserAnalytics}
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                    <div style={{marginLeft: 'auto', marginRight: '0px' }}>
                      {/* <AppTooltip title="Export Excel">
                        <IconButton
                          className="icon-btn"
                          sx={{
                            width: 35,
                            height: 35,
                            color: 'white',
                            backgroundColor: 'green',
                            '&:hover, &:focus': {
                              backgroundColor: 'green',
                            },
                            marginTop: "25px"
                          }}
                          onClick={() => {
                            handleExportData();
                          }}
                          size="large"
                        >
                          <AiFillFileExcel />
                        </IconButton>
                      </AppTooltip> */}
                      <Button
                        variant="outlined"
                        size="medium"
                        style={{
                          padding: "2px 20px",
                          fontSize: 12,
                          borderRadius: 6,
                          color: "#00316a",
                          // borderColor: "#00316a",
                          marginTop: '25px',
                          marginLeft: '5px',
                          borderColor: mandateReportData.length === 0 ? 'gray' : 'rgb(0, 49, 106)',
                          backgroundColor: mandateReportData.length === 0 ? 'gray' : '',
                        }}
                        disabled={mandateReportData.length === 0}
                        onClick={() => {
                          handleExportData();
                        }}
                      >
                        <img src={csv} alt="" className="icon-size" /> Download
                      </Button>
                    </div>
                  </div>
                </Grid>

                    </>
                  }
              </Grid>
            </form>
        <hr style={{ border : "1px solid lightgray", marginTop : "-10px", marginBottom : 10 }}/>
        
        {/* <CommonGrid
          defaultColDef={{ flex: 1 }}
          columnDefs={columnDefs}
          rowData={mandateReportData}
          onGridReady={onGridReady}
          gridRef={gridRef}
          pagination={true}
          paginationPageSize={10}
        /> */}
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

export default MandateReportDetail;
