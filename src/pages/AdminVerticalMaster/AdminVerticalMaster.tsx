import {
  Grid,
  Button,
  TextField,
  Autocomplete,
  Stack,
  Box,
  InputAdornment,
  IconButton
} from "@mui/material";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import SearchIcon from "@mui/icons-material/Search";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import React, { memo, useCallback, useEffect, useState } from "react";
import { useUrlSearchParams } from "use-url-search-params";
import { fetchError, fetchSuccess, showMessage } from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { DialogActions, Tooltip, DialogContent } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { TbPencil } from "react-icons/tb";
import { primaryButtonSm } from "shared/constants/CustomColor";
import { AiFillFileExcel } from "react-icons/ai";
import AppTooltip from "@uikit/core/AppTooltip";

const AdminVerticalMaster = () => {
  let districtObj;
  let cityObj;
  let stateObj;
  // let regionObj;
  let projectDeliveryManagerObj;
  let vericalHeadObj;
  let vericalObj;
  const [stateList, setStateList] = React.useState([]);
  const [districtList, setDistrictList] = React.useState([]);
  const [cityList, setCityList] = React.useState([]);
  // const [regionList, setRegionList] = React.useState([]);
  const [projectDeliveryManagerList, setProjectDeliveryManagerList] = React.useState([]);
  const [verticalHeadList, setVerticalHeadList] = React.useState([]);
  const [verticalMasterList, setVerticalMasterList] = React.useState([]);
  const [adminVerticalList, setAdminVerticalList] = React.useState<any>([]);
  const [value1, setValue1] = useState<any>({});
  const [selectedObj, setSelectedObj] = React.useState<any>();
  const [error, setError] = useState(null);
  const [params] = useUrlSearchParams({}, {});
  const dispatch = useDispatch();
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction ?.action || "";
  const [open, setOpen] = React.useState(false);
  const [editButton, setEditButton] = useState(false);
  const [valueState, setState] = useState<any>({});
  const [valueDistrict, setDistrict] = useState<any>({});
  const [valueCity, setCity] = useState<any>({});

  let columnDefsForm = [
    {
      field: "",
      headerName: "Action",
      headerTooltip: "Action",
      resizable: false,
      width: 80,
      minWidth: 80,
      pinned: "left",
      cellRenderer: (e: any) => (
        <>
          <div className="actions">
            <Tooltip title="Edit" className="actionsIcons">
            <button type="button" className="actionsIcons actionsIconsSize">
              <TbPencil
                onClick={() => {
                  console.log("e ?.data", e ?.data);
                  
                  stateObj =
                    stateList &&
                      stateList ?.find(
                        (item) => item ?.id === e ?.data ?.fk_state_id
                      );

                  getDistrictEdit(e ?.data);;

                  // regionObj =
                  //   regionList &&
                  //     regionList ?.find(
                  //       (item) => item ?.id === e ?.data ?.fk_region_id
                  //     );

                  projectDeliveryManagerObj =
                  projectDeliveryManagerList &&
                  projectDeliveryManagerList ?.find(
                        (item) => item ?.id === e ?.data ?.fk_PDM
                      );

                  vericalHeadObj =
                  verticalHeadList &&
                  verticalHeadList ?.find(
                        (item) => item ?.id === e ?.data ?.fk_vertical_head
                      );

                  vericalObj =
                    verticalMasterList &&
                      verticalMasterList ?.find(
                        (item) => item ?.id === e ?.data ?.fk_admin_vertical_id
                      );

                  setSelectedObj(e ?.data);
                  handleOpen();
                  setEditButton(true);
                }}
              />
            </button>
            </Tooltip>
          </div>
        </>
      ),
    },
    {
      field: "admin_Vertical_List_Name",
      headerName: "Vertical",
      headerTooltip: "Vertical",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "state",
      headerName: "State",
      headerTooltip: "State",
      sortable: true,
      resizable: true,
      width: 170,
      minWidth: 170,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "district",
      headerName: "District",
      headerTooltip: "District",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "city",
      headerName: "City",
      headerTooltip: "City",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    // {
    //   field: "region",
    //   headerName: "Region",
    //   headerTooltip: "Region",
    //   sortable: true,
    //   resizable: true,
    //   width: 150,
    //   minWidth: 150,
    //   cellStyle: { fontSize: "13px" },
    // },
    {
      field: "project_delivery_manager",
      headerName: "Project Delivery Manager",
      headerTooltip: "Project Delivery Manager",
      sortable: true,
      resizable: true,
      width: 270,
      minWidth: 270,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "vertical_head",
      headerName: "Vertical Head",
      headerTooltip: "Vertical Head",
      sortable: true,
      resizable: true,
      width: 220,
      minWidth: 220,
      cellStyle: { fontSize: "13px" },
    },

  ];

  const getAdminVerticalMasterList = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetAdminVerticalMasterList`)
      .then((response: any) => {
        setAdminVerticalList(response ?.data || [])
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  const getState = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=StateMaster&conditions=`)
      .then((response: any) => {
        setStateList(response ?.data ?.data || []);
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  const getDistrict = (e, v) => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetDistricts?stateid=${v ?.id}`)
      .then((response: any) => {
        setDistrictList(response ?.data || []);
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  const getDistrictEdit = (v) => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetDistricts?stateid=${v ?.fk_state_id}`)
      .then((response: any) => {
        setDistrictList(response ?.data || []);
       
        districtObj = response ?.data &&
          response ?.data ?.find(
            (item) => item ?.id === v ?.fk_district_id);

        getCityEdit(v);

      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  const getCity = (e, v) => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetCities?stateid=${valueState ?.state ?.id}&districtid=${v ?.id}`)
      .then((response: any) => {
        setCityList(response ?.data || []);
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  const getCityEdit = (v) => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetCities?stateid=${v ?.fk_state_id}&districtid=${v ?.fk_district_id}`)
      .then((response: any) => {
        setCityList(response ?.data || []);

        cityObj = response ?.data &&
          response ?.data ?.find(
            (item) => item ?.id === v ?.fk_city_id);

        setValue1({
          // region: regionObj,
          projectDeliveryManager: projectDeliveryManagerObj,
          vericalHead: vericalHeadObj,
          verical: vericalObj
        });

        setState({
          state: stateObj
        });

        setDistrict({
          district: districtObj
        });

        setCity({
          city: cityObj
        });

      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  // const getRegion = async () => {
  //   await axios
  //     .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=RegionMaster&conditions=`)
  //     .then((response: any) => {
  //       setRegionList(response ?.data ?.data || []);
  //     })
  //     .catch((e: any) => {
  //       dispatch(fetchError("Error Occured !!!"));
  //     });
  // }

  const getProjectDeliveryManagerList = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/User/GetUserListByRole?rolename=Project Delivery Manager`)
      .then((response: any) => {
        setProjectDeliveryManagerList(response ?.data || []);
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  const getVerticalHead = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/user/GetUserListByRole?rolename=Vertical Head`)
      .then((response: any) => {
        setVerticalHeadList(response ?.data || []);
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  const getVerticalMasterList = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=Admin_Vertical_List&conditions=`)
      .then((response: any) => {
        setVerticalMasterList(response ?.data ?.data || []);
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  useEffect(() => {
    getState()
    // getRegion();
    getProjectDeliveryManagerList()
    getVerticalHead()
    getVerticalMasterList()
    getAdminVerticalMasterList()
  }, [])

  const handleClose = () => {
    setOpen(false);
    setTimeout(()=>{
      setEditButton(false);
      emptyForm();
      setError({});
      setDistrictList([]);
      setCityList([]);
    },100)
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleAddNew = () => {
    const count = _validationDiaglogBox();
    if (count > 0) return;
    if (editButton == true) {
      let obj = {
        "id": selectedObj ?.id || 0,
        "uid": "",
        "fk_state_id": valueState ?.state ?.id,
        "fk_district_id": valueDistrict ?.district ?.id,
        "fk_city_id": valueCity ?.city ?.id,
        // "fk_region_id": value1 ?.region ?.id,
        "fk_PDM": value1 ?.projectDeliveryManager ?.id,
        "fk_vertical_head": value1 ?.vericalHead ?.id,
        "fk_admin_vertical_id": value1 ?.verical ?.id,
        "status": "Active",
      }
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/InsertOrUpdateAdminVerticalMaster`,
          obj
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Error Occured !!!"));
            setOpen(false);
            return;
          }
          if (response) {
            dispatch(showMessage("Data Updated Successfully"));
            setOpen(false);
            getAdminVerticalMasterList();
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occured !!!"));
          setOpen(false);
        });
    } else {
      let obj = {
        "id": 0,
        "uid": "",
        "fk_state_id": valueState ?.state ?.id,
        "fk_district_id": valueDistrict ?.district ?.id,
        "fk_city_id": valueCity ?.city ?.id,
        // "fk_region_id": value1 ?.region ?.id,
        "fk_PDM": value1 ?.projectDeliveryManager ?.id,
        "fk_vertical_head": value1 ?.vericalHead ?.id,
        "fk_admin_vertical_id": value1 ?.verical ?.id,
        "status": "Active"
      }
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/InsertOrUpdateAdminVerticalMaster`,
          obj
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Error Occured !!!"));
            setOpen(false);
            return;
          }
          if (response) {
            dispatch(showMessage("Data Inserted Successfully"));
            setOpen(false);
            getAdminVerticalMasterList();
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occured !!!"));
          setOpen(false);
        });
    }
    setTimeout(()=>{
      emptyForm();
      handleClose();
    },1000);

  }

  const emptyForm = () => {
    setValue1({
      ...value1,
      // ["region"]: "",
      ["projectDeliveryManager"]: "",
      ["vericalHead"]: "",
      ["verical"]: ""
    });

    setState({ ...valueState, ["state"]: "" });
    setDistrict({ ...valueDistrict, ["district"]: "" });
    setCity({ ...valueCity, ["city"]: "" });

  }

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  const onFilterTextChange = (e) => {
    gridApi ?.setQuickFilter(e ?.target ?.value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"))
    }
  };

  const _validationDiaglogBox = () => {
    let temp = {};
    let no = 0;
    
    if
      (value1.verical === undefined ||
        value1.verical === "" ||
        value1.verical === null) {
      no++;
      temp = { ...temp, verical: "Please select Vertical" };
    }
    if
      (valueState.state === undefined ||
        valueState.state === "" ||
        valueState.state === null) {
      no++;
      temp = { ...temp, state: "Please select State" };
    }
    if
      (valueDistrict.district === undefined ||
        valueDistrict.district === "" ||
        valueDistrict.district === null) {
      no++;
      temp = { ...temp, district: "Please select District" };
    }
    if
      (valueCity.city === undefined ||
        valueCity.city === "" ||
        valueCity.city === null) {
      no++;
      temp = { ...temp, city: "Please select City" };
    }
    // if
    //   (value1.region === undefined ||
    //     value1.region === "" ||
    //     value1.region === null) {
    //   no++;
    //   temp = { ...temp, region: "Please select Region" };
    // }
    if
      (value1.projectDeliveryManager === undefined ||
        value1.projectDeliveryManager === "" ||
        value1.projectDeliveryManager === null) {
      no++;
      temp = { ...temp, projectDeliveryManager: "Please select Project Delivery Manager" };
    }
    if
      (value1.vericalHead === undefined ||
        value1.vericalHead === "" ||
        value1.vericalHead === null) {
      no++;
      temp = { ...temp, vericalHead: "Please select Vertical Head" };
    }
    
    setError({ ...error, ...temp });
    return no;
  };

  const handleExportData = () => {
    axios
    .get(
      `${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetExcelReport`
    )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "AdminVerticalMaster.xlsx";
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

            // Fixes "webkit blob resource error 1"
            setTimeout(function () {
              document.body.removeChild(tempLink);
              window.URL.revokeObjectURL(blobURL);
            }, 200);

            dispatch(
              showMessage("Admin Vertical Master data downloaded successfully!")
            );
          }
        }
      });
  };

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
        <Box component="h2" className="page-title-heading mb-0">
          Admin Vertical Master
        </Box>
        <div className="phase-grid">
          <Stack
            display="flex"
            alignItems="flex-end"
            justifyContent="space-between"
            flexDirection="row"
            sx={{ mb: -2 }}
          >
            <TextField
            size="small"
            // label='Search'
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
          />
            <Button
              onClick={handleOpen}
              size="small"
              sx={{ color: "#fff", fontSize: "12px" }}
              style={primaryButtonSm}
            >
              Add New
            </Button>
            <AppTooltip title="Export Excel">
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
                onClick={() => {handleExportData();}}
                size="large"
              >
                <AiFillFileExcel />
              </IconButton>
            </AppTooltip>
          </Stack>
        </div>
      </Grid>
      {/* <div style={{ height: "calc(100vh - 150px)", marginTop: "10px", overflow: "hidden" }}> */}
      <CommonGrid
        defaultColDef={{flex : 1}}
        columnDefs={columnDefsForm}
        rowData={adminVerticalList || []}
        onGridReady={onGridReady}
        gridRef={gridRef}
        pagination={true}
        paginationPageSize={10}
      />
{/* </div> */}
      <Dialog
        // fullWidth
        maxWidth="xl"
        open={open}
        aria-describedby="alert-dialog-description"
        PaperProps={{ style: { borderRadius: '20px' } }}
      >
        <DialogTitle id="alert-dialog-title" className="title-model">
        {editButton ? "Edit" : "Add"} Vertical Master
        </DialogTitle>
        <DialogContent style={{ width: "450px", height: "510px" }}>
          <form>
            <div className="phase-outer" style={{ paddingLeft: "10px" }} >
              <Grid
                marginBottom="10px"
                marginTop="5px"
                container
                item
                spacing={5}
                justifyContent="start"
                alignSelf="center"
                sx={{ paddingTop: "0px!important" }}
              >
                <Grid item xs={12} md={12} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Vertical</h2>
                    <Autocomplete
                      disablePortal
                      disableClearable={true}
                      options={verticalMasterList || []}
                      getOptionLabel={(option) => {
                        return option ?.admin_Vertical_List_Name ?.toString() || "";
                      }}
                      defaultValue={value1 ?.vertical || ""}
                      value={value1 ?.verical || ""}
                      onChange={(e, v) => {
                        setValue1({ ...value1, ["verical"]: v });
                        setError({ ...error, verical: "" });
                      }}
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
                          className="w-85"
                        />
                      )}
                    />
                  </div>
                  {error?.verical && error?.verical ? (
                      <p className="form-error">{error?.verical}</p>
                    ) : null}
                </Grid>

                <Grid item xs={12} md={12} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">State</h2>
                    <Autocomplete
                      disablePortal
                      disableClearable={true}
                      options={stateList || []}
                      getOptionLabel={(option) => {
                        return option ?.stateName ?.toString() || "";
                      }}
                      defaultValue={valueState ?.state || ""}
                      value={valueState ?.state || ""}
                      onChange={(e, v) => {
                        setState({ ...valueState, ["state"]: v });
                        setDistrict({ ...valueDistrict, ["district"]: "" });
                        setCity({ ...valueCity, ["city"]: "" });
                        setError({ ...error, state: "" });
                        getDistrict(e, v)
                      }}
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
                          className="w-85"
                        />
                      )}
                    />
                  </div>
                  {error?.state && error?.state ? (
                      <p className="form-error">{error?.state}</p>
                    ) : null}
                </Grid>

                <Grid item xs={12} md={12} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">District</h2>
                    <Autocomplete
                      disablePortal
                      disableClearable={true}
                      options={districtList || []}
                      getOptionLabel={(option) => {
                        return option ?.districtName ?.toString() || "";
                      }}
                      defaultValue={valueDistrict ?.district || ""}
                      value={valueDistrict ?.district || ""}
                      onChange={(e, v) => {
                        setDistrict({ ...valueDistrict, ["district"]: v });
                        setCity({ ...valueCity, ["city"]: "" });
                        setError({ ...error, district: "" });
                        getCity(e, v)
                      }}
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
                          className="w-85"
                        />
                      )}
                    />
                  </div>
                  {error?.district && error?.district ? (
                      <p className="form-error">{error?.district}</p>
                    ) : null}
                </Grid>

                <Grid item xs={12} md={12} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">City</h2>
                    <Autocomplete
                      disablePortal
                      disableClearable={true}
                      options={cityList || []}
                      getOptionLabel={(option) => {
                        return option ?.cityName ?.toString() || "";
                      }}
                      defaultValue={valueCity ?.city || ""}
                      value={valueCity ?.city || ""}
                      onChange={(e, v) => {
                        setCity({ ...valueCity, ["city"]: v });
                        setError({ ...error, city: "" });
                      }}
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
                          className="w-85"
                        />
                      )}
                    />
                  </div>
                  {error?.city && error?.city ? (
                      <p className="form-error">{error?.city}</p>
                    ) : null}
                </Grid>

                {/* <Grid item xs={12} md={12} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Region</h2>
                    <Autocomplete
                      disablePortal
                      disableClearable={true}
                      options={regionList || []}
                      getOptionLabel={(option) => {
                        return option ?.regionName ?.toString() || "";
                      }}
                      defaultValue={value1 ?.region || ""}
                      value={value1 ?.region || ""}
                      onChange={(e, v) => {
                        setValue1({ ...value1, ["region"]: v });
                        setError({ ...error, region: "" });
                      }}
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
                          className="w-85"
                        />
                      )}
                    />
                  </div>
                  {error?.region && error?.region ? (
                      <p className="form-error">{error?.region}</p>
                    ) : null}
                </Grid> */}

                <Grid item xs={12} md={12} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Project Delivery Manager</h2>
                    <Autocomplete
                      disablePortal
                      disableClearable={true}
                      options={projectDeliveryManagerList || []}
                      getOptionLabel={(option) => {
                        return option ?.userFullName ?.toString() || "";
                      }}
                      defaultValue={value1 ?.projectDeliveryManager || ""}
                      value={value1 ?.projectDeliveryManager || ""}
                      onChange={(e, v) => {
                        setValue1({ ...value1, ["projectDeliveryManager"]: v });
                        setError({ ...error, projectDeliveryManager: "" });
                      }}
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
                          className="w-85"
                        />
                      )}
                    />
                  </div>
                  {error?.projectDeliveryManager && error?.projectDeliveryManager ? (
                      <p className="form-error">{error?.projectDeliveryManager}</p>
                    ) : null}
                </Grid>

                <Grid item xs={12} md={12} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Vertical Head</h2>
                    <Autocomplete
                      disablePortal
                      disableClearable={true}
                      options={verticalHeadList || []}
                      getOptionLabel={(option) => {
                        return option ?.userFullName ?.toString() || "";
                      }}
                      defaultValue={value1 ?.vericalHead || ""}
                      value={value1 ?.vericalHead || ""}
                      onChange={(e, v) => {
                        setValue1({ ...value1, ["vericalHead"]: v });
                        setError({ ...error, vericalHead: "" });
                      }}
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
                          className="w-85"
                        />
                      )}
                    />
                  </div>
                  {error?.vericalHead && error?.vericalHead ? (
                      <p className="form-error">{error?.vericalHead}</p>
                    ) : null}
                </Grid>

              </Grid>
            </div>
          </form>
        </DialogContent>
        <DialogActions className="button-wrap">
          <Button className="yes-btn" onClick={handleAddNew}>
            {editButton ? "Update" : "Submit"}
          </Button>
          <Button className="yes-btn" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminVerticalMaster;
