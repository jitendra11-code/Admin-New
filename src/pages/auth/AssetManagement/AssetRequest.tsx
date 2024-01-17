import {
  Button,
  MenuItem,
  Stack,
  TextField,
  Box,
  Grid,
  Autocomplete,
  NativeSelect,
  styled,
  InputBase,
  Typography,
  SwipeableDrawer,
  Link,
  Tooltip,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import regExpressionTextField, {
  regExpressionRemark,
  textFieldValidationOnPaste,
} from "@uikit/common/RegExpValidation/regForTextField";
import {
  addPhaseInitialValues,
  addPhaseSchema,
  assetRequestInitialValues,
  assetRequestSchema,
} from "@uikit/schemas";
import { useFormik } from "formik";
import blockInvalidChar from "pages/Mandate/Location/Components/blockInvalidChar ";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import { submit } from "shared/constants/CustomColor";
import DrawerComponent from "./DrawerComponent";
import AssetInfo from "pages/common-components/AssetInformation";
import axios from "axios";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import moment from "moment";
import { AgGridReact } from "ag-grid-react";
import { useNavigate, useParams } from "react-router-dom";
import AssetCodeDrawer from "./AssetCodeDrawer";




const AssetRequest = () => {
  const dispatch = useDispatch();
  const { user } = useAuthUser();
  const { id } = useParams();
  const [assetDetaildView, setAssetDetaildView] = useState([]);
  const [selectedDropdown, setSelectedDropdown] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDrawerAssetCode, setOpenDrawerAssetCode] = useState(false);
  const [shiftingType, setShiftingType] = useState([]);
  const [state, setState] = React.useState(null);
  const [district, setDistrict] = React.useState(null);
  const [city, setCity] = React.useState(null);
  const [stateList, setStateList] = React.useState(null);
  const [districtList, setDistrictList] = React.useState(null);
  const [cityList, setCityList] = React.useState(null);
  const [branchDetails, setBranchDetails]= React.useState(null);
  const [branchNameDetails, setBranchNameDetails]= React.useState(null);
  const [toBranchId, setToBranchId]= React.useState(null);
  const [edit, setEdit] = React.useState(false);
  const [assetDataById, setAssetDataById] = useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [assetDrawerData, setAssetDrawerData]= React.useState(null);
  let navigate = useNavigate();

  const [assetTypeOptions, setAssetTypeOptions] = React.useState([]);
  
  console.log('user',user)

  useEffect(() => {
    setAssetTypeOptions([{assetRequestType : 'New Asset Request'},{assetRequestType : 'Replacement Asset Request'}])
  }, [])
  

  const handleDrawerComponentData = useCallback((dataFromDrawer) => {
    // (dataFromDrawer) => {
    // Do something with the data received from the child component
    console.log('Data from child:', dataFromDrawer);
    setAssetDetaildView(dataFromDrawer);
  },[assetDetaildView]);
console.log('assetDetaildView',assetDetaildView)
  const getShiftingType = async() => {
    await axios
    .get(
      `${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName`
    )
    .then((response: any) => {
      setShiftingType(
        response?.data?.filter((v) => v?.masterName == "ShiftingType")
      );
    }).catch((error) => {
      console.log(error);
    })
  }
  console.log("shiftingType",shiftingType)

  useEffect(() => {
    getShiftingType()
  }, [])

  const getAssetById = (id) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestById?id=${id}`
      )
      .then((response: any) => {
        if (response && response?.data) {
          setAssetDataById(response?.data) 
          setFieldValue("assetRequestType",{assetRequestType : response?.data[0]?.assetRequestType});
          setFieldValue("shiftingType",{formName : response?.data[0]?.shiftingType});
          setFieldValue("branchName",{branch_Name : response?.data[0]?.branchName});
          setFieldValue("branchCode",response?.data[0]?.branchCode);
          setFieldValue("branchAddress",response?.data[0]?.branchAddress);
          setFieldValue("pinCode",response?.data[0]?.pinCode);
          setState({stateName : response?.data[0]?.state});
          setDistrict({districtName : response?.data[0]?.district});
          setCity({cityName : response?.data[0]?.city});
          setFieldValue("remarks",response?.data[0]?.remarks);
          setFieldValue("requiredFor",response?.data[0]?.requiredFor);
          setFieldValue("dateofCommissioning",response?.data[0]?.dateofCommissioning);
          setToBranchId(response?.data[0]?.fk_to_branch_id);
        }
      })
      .catch((e: any) => { });
  };
  const getAssetRequestMovementDetailsData = async (id) => {
    await axios 
    .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestMovementDetailsByAssetId?assetId=${id}`)
    .then((response : any)=>{
      setAssetDetaildView(response?.data || []);
        console.log('res',response)
    })
    .catch((e:any) => {});
};

// useEffect(() =>{
//   if (id && id!="id") {
//     getAssetRequestMovementDetailsData(id);
//   }

// },[id]);
  
  React.useEffect(() => {
    if (id && id!="id") {
      getAssetById(id);
      setEdit(true);
      getAssetRequestMovementDetailsData(id);
    }
    
  }, [id]);

  
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
    initialValues: assetRequestInitialValues,
    validationSchema: assetRequestSchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: (values, action) => {
      console.log("values", values);
      const body = {
        type : assetDetaildView[0]?.assetType || null,
        isSkip: true,
        requestStatus: "Active",
        requestRemarks: "Active",
        requestNo: "AR_002",
        assetRequestType : values?.assetRequestType?.assetRequestType,
        requesterName: user?.UserName || values?.requesterName,
        requesterEmployeeID: user?.id.toString() || values?.requesterEmployeeID,
        shiftingType: values?.shiftingType?.formName || selectedDropdown?.shiftingType?.formName,
        branchName: selectedDropdown?.branchName?.branch_Name || values?.branchName?.branch_Name  ,
        branchCode: values?.branchCode,
        branchAddress: values?.branchAddress,
        pinCode: values?.pinCode?.toString(),
        city: values?.city || city?.cityName || "",
        state: values?.state || state?.stateName || "",
        district : district?.districtName || "",
        dateofCommissioning: values?.dateofCommissioning,
        remarks: values?.remarks,
        requiredFor : values?.requiredFor,
        fk_from_branch_id: user?.branchMasterId,
        fk_to_branch_id : branchNameDetails?.id ? branchNameDetails?.id : toBranchId,
        status: "",
        createdBy: user?.UserName,
        createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        modifiedBy: user?.UserName,
        modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        id: edit ? assetDataById[0]?.id : 0,
        uid: "3420eafc-2ec7-4e69-ba37-0569987c75a9"
    };
    console.log(" values body", body)
    if (values?.dateofCommissioning == "") {
      dispatch(fetchError("Please select the Date of commissioning!!"))
      return;
    }
    if (edit) {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/Asset/InsertUpdateAssetRequest`,
          body
        )
        .then((response: any) => {
          console.log("response", response);
          // setAssetDetaildView([...assetDetaildView, {requestId : response?.data?.data?.id}])
          const updatedAssetDetaildView = assetDetaildView.map(obj => ({ ...obj, requestId: response?.data?.data?.id }));
          if (response?.data?.code === 200 && response?.data?.status === true ) {
          
           axios
           .post(
            `${process.env.REACT_APP_BASEURL}/api/Asset/InsertUpdateAssetRequestMovementDetails`,
            updatedAssetDetaildView
          ).then ((response: any) => {
            console.log("response", response);
          }).catch((e) => {
            console.log("e", e);
          });
          dispatch(showMessage(response?.data?.message));
          navigate("/AssetRequestList");
          }
          

        })
        .catch((e) => {
          console.log("e", e);
        });

    } else {

    
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/Asset/InsertUpdateAssetRequest`,
          body
        )
        .then((response: any) => {
          console.log("response", response);
          // setAssetDetaildView([...assetDetaildView, {requestId : response?.data?.data?.id}])
          const updatedAssetDetaildView = assetDetaildView.map(obj => ({ ...obj, requestId: response?.data?.data?.id,id: 0 }));
          if (response?.data?.code === 200 && response?.data?.status === true ) {
          
           axios
           .post(
            `${process.env.REACT_APP_BASEURL}/api/Asset/InsertUpdateAssetRequestMovementDetails`,
            updatedAssetDetaildView
          ).then ((response: any) => {
            console.log("response", response);
          }).catch((e) => {
            console.log("e", e);
          });
          dispatch(showMessage(response?.data?.message));
          navigate("/AssetRequestList");
          }
          

        })
        .catch((e) => {
          console.log("e", e);
        });
      }
        
    },
  });
  const getBranchDetails = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetAllDestinationBranchDetailsByFromBranchId?frombranchid=${user?.branchMasterId}`
      )
      .then((response: any) => {
        console.log('res',response)
        setBranchDetails(response?.data || []);
        
      })
      .catch((e: any) => { });
  };

  useEffect (() => {
    getBranchDetails();
  }, [])

  

  // const branchName = branchDetails?.map((item) => item?.branch_Name);


   useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetStateList`)
      .then((response: any) => {
        console.log('res-state',response)
        setStateList(response?.data || [])
      })
      .catch((e: any) => {
      });
  }, []);

  useEffect(() => {
    if (state?.id !== undefined) {
      axios
      .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetDistrictList?stateid=${state?.id}`)
      .then((response: any) => {
        console.log('res-dist',response)
        setDistrictList(response?.data || [])
      })
      .catch((e: any) => {
      });

    }    
  }, [state?.id])

  useEffect(() => {
    if (district?.id !== undefined) {
      axios
      .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetCityList?stateid=${state?.id}&districtid=${district?.id}`)
      .then((response: any) => {
        console.log('dis-city',response)
        setCityList(response?.data || [])
      })
      .catch((e: any) => {
      });

    }    
  }, [state?.id, district?.id]);
  console.log('branchNameDetails',branchNameDetails)

  useEffect(() => {
    if (branchNameDetails !== null) {
      setState(stateList.find((item)=> item?.stateName?.toLowerCase() === branchNameDetails?.state?.toLowerCase()))
    }
  }, [stateList,branchNameDetails?.state,branchNameDetails])
  
  useEffect(() => {
    console.log('branchNameDetails',branchNameDetails,districtList)
    if (branchNameDetails !== null && districtList !== null) {
      setDistrict(districtList.find((item)=> item?.districtName?.toLowerCase() === branchNameDetails?.district?.toLowerCase()))
    }
  }, [districtList,branchNameDetails?.district,branchNameDetails])

  useEffect(() => {
    if (branchNameDetails !== null && cityList !== null) {
    setCity(cityList.find((item)=> item?.cityName?.toLowerCase() === branchNameDetails?.city?.toLowerCase()))
    }
  }, [cityList,branchNameDetails?.city,branchNameDetails])

  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }


  let columnDefs2 = [
    {
      field: "assetCode",
      headerName: "Asset Code",
      headerTooltip: "Asset Code",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
      cellRenderer: (params) => {
        {console.log('params',params)}
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        return  <a  href= "#" style={{ color: 'blue' }} onClick={() => {setAssetDrawerData(params?.data);setOpenDrawerAssetCode(!openDrawerAssetCode)}} >
          {params?.data?.assetCode}
          </a>
      },
    },
    {
      field: "assetType",
      headerName: "Asset Type",
      headerTooltip: "Asset Type",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "assetCategorisation",
      headerName: "Asset Categorisation",
      headerTooltip: "Asset Categorisation",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "assetClassDescription",
      headerName: "Asset Class Description",
      headerTooltip: "Asset Class Description",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "asset_description",
      headerName: "Asset Description",
      headerTooltip: "Asset Description",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "paV_Location",
      headerName: "PAV Location",
      headerTooltip: "PAV Location",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "book_val",
      headerName: "Book Value",
      headerTooltip: "Book Value",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 120,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "balance_Useful_life_as_per_Finance",
      headerName: "Balance Useful Life as per Finance",
      headerTooltip: "Balance Useful Life as per Finance",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "balance_Useful_life_as_per_Admin",
      headerName: "Balance Useful Life as per Admin",
      headerTooltip: "Balance Useful Life as per Admin",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "used_Unused",
      headerName: "Used / Unused",
      headerTooltip: "Used / Unused",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
  ];

  const getHeightForTable = useCallback(() => {
    const dataLength = assetDetaildView ? assetDetaildView.length : 0;

    if (dataLength === 0) {
        return '30px';
    } else if (dataLength === 1) {
        return '85px';
    } else if (dataLength === 2) {
        return '127px';
    } else if (dataLength === 3) {
        return '169px';
    } else {
        return '169px';
    }
}, [assetDetaildView]);

  
  return (
    <>
      <div>
        {edit ? 
          <Box component="h2" className="page-title-heading my-6">
            Update Asset Request
          </Box> 
        :
          <Box component="h2" className="page-title-heading my-6">
            Asset Request
          </Box>
        }
        <div
            className="card-panal inside-scroll-170"
            style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
          >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              // marginBottom: "10px",
            }}
          >
            <Typography
              className="section-headingTop"
              style={{ margin: "0px" }}
            >
              Requester Details
            </Typography>
          </div>
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
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form" style={{ marginTop: "7px" }}>
                  <h2 className="phaseLable ">Asset Request Type</h2>
                  <Autocomplete
                    disablePortal
                    // sx={{
                    //   backgroundColor: "#f3f3f3",
                    //   borderRadius: "6px",
                    // }}
                    id="combo-box-demo"
                    getOptionLabel={(option) => {


                      return option?.assetRequestType?.toString() || ""
                    }
                    }
                    disableClearable={true}
                    options={assetTypeOptions || []}
                    onChange={(e, v) => {
                      
                      setSelectedDropdown({ ...selectedDropdown, ["assetRequestType"]: v });
                      setFieldValue("assetRequestType", v);
                    }}
                    placeholder="Document Type"
                    defaultValue={["New Asset Request"]}
                    value={values?.assetRequestType}
                    renderInput={(params) => (
                      <TextField
                        name="assetRequestType"
                        id="assetRequestType"
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
                  <div className="input-form" style={{ marginTop: "7px" }}>
                    <h2 className="phaseLable ">Requester Name</h2>
                    <TextField
                      autoComplete="off"
                      name="requesterName"
                      id="requesterName"
                      variant="outlined"
                      size="small"
                      className="w-85"
                      value={user?.UserName || values?.requesterName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled
                    />
                  </div>
                </Grid>

                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form" style={{ marginTop: "7px" }}>
                    <h2 className="phaseLable ">Requester Emp. ID</h2>
                    <TextField
                      autoComplete="off"
                      name="requesterEmployeeID"
                      id="requesterEmployeeID"
                      variant="outlined"
                      size="small"
                      className="w-85"
                      value={user?.id ||values?.requesterEmployeeID}
                      disabled
                      onChange={handleChange}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(
                            fetchError("You can not paste Spacial characters")
                          );
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
                      onBlur={handleBlur}
                    />
                   
                  </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form" style={{ marginTop: "7px" }}>
                    <h2 className="phaseLable ">Shifting Type</h2>
                    <Autocomplete
                      disablePortal
                      // sx={{
                      //   backgroundColor: "#f3f3f3",
                      //   borderRadius: "6px",
                      // }}
                      id="combo-box-demo"
                      getOptionLabel={(option) =>
                        option?.formName?.toString() || ""
                      }
                      // disableClearable={true}
                      options={shiftingType}
                      onChange={(e, v) => {
                        console.log('v',v)
                        setSelectedDropdown({ ...selectedDropdown, ["shiftingType"]: v });
                        setFieldValue("shiftingType", v);
                      }}
                      placeholder="Document Type"
                      value={selectedDropdown?.shiftingType || values?.shiftingType}
                      renderInput={(params) => (
                        <TextField
                          name="shiftingType"
                          id="shiftingType"
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
            <div
              style={{ border: "1px solid lightgray", margin: "-15px 0px" }}
            ></div>
        
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <Typography className="section-headingTop">
                Requesting Branch Details
              </Typography>
            </div>

            <Grid
              marginBottom="30px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form" style={{ marginTop: "7px" }}>
                  <h2 className="phaseLable ">Branch Name</h2>
                  <Autocomplete
                    disablePortal
                    // sx={{
                    //   backgroundColor: "#f3f3f3",
                    //   borderRadius: "6px",
                    // }}
                    id="combo-box-demo"
                    getOptionLabel={(option : any) =>
                      option?.branch_Name?.toString() || ""
                    }
                    disableClearable={true}
                    options={branchDetails || []}
                    onChange={(e, v) => {
                      console.log('v',v)
                      setSelectedDropdown({ ...selectedDropdown, ["branchName"]: v });
                      setFieldValue("branchName", v);
                      setFieldValue("branchCode",v?.branch_Code);
                      setFieldValue("branchAddress",v?.address);
                      setFieldValue("pinCode",v?.pincode);
                      setBranchNameDetails(v)
                      
                    }}
                    placeholder="Document Type"
                    value={selectedDropdown?.branchName || values?.branchName}
                    renderInput={(params) => (
                      <TextField
                        name="branchName"
                        id="branchName"
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
                <div className="input-form" style={{ marginTop: "7px" }}>
                  <h2 className="phaseLable ">Branch Code</h2>
                  <TextField
                    autoComplete="off"
                    name="branchCode"
                    id="branchCode"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values?.branchCode}
                    disabled
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form" style={{ marginTop: "7px" }}>
                  <h2 className="phaseLable ">Branch Address</h2>
                  <TextField
                    autoComplete="off"
                    name="branchAddress"
                    id="branchAddress"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values?.branchAddress}
                    disabled
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form" style={{ marginTop: "7px" }}>
                  <h2 className="phaseLable ">PIN Code</h2>
                  <TextField
                    autoComplete="off"
                    name="pinCode"
                    id="pinCode"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values?.pinCode}
                    onChange={handleChange}
                    disabled
                    onBlur={handleBlur}
                  />
                </div>
              </Grid>
              <Grid
                item
                xs={6}
                md={3}
                sx={{ position: "relative", paddingTop: "0px !important" }}
              >
                <div className="input-form" style={{ marginTop: "7px" }}>
                  <h2 className="phaseLable ">State</h2>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    getOptionLabel={(option) => {
                      return option?.stateName?.toString() || ""
                    } }
                    disableClearable={true}
                    disabled
                    options={stateList || []}
                    onChange={(e, value) => {
                      console.log('value',value)
                      setState(value);
                      setDistrict(null);
                      setCity(null);
                      setCityList([])
                      setDistrictList([])
                    }}
                    // onChange={handleChange}
                    placeholder="State"
                    value={state}
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
                </div>
              </Grid>
              <Grid
                item
                xs={6}
                md={3}
                sx={{ position: "relative", paddingTop: "0px !important" }}
              >
                <div className="input-form" style={{ marginTop: "7px" }}>
                  <h2 className="phaseLable ">District</h2>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    getOptionLabel={(option) => {
                      return option?.districtName?.toString() || ""
                    } }
                    disableClearable={true}
                    disabled
                    options={districtList || []}
                    onChange={(e, value) => {
                      console.log('value',value)
                      setDistrict(value);
                      setCity(null);
                      setCityList([]);
                    }}
                    // onChange={handleChange}
                    placeholder="District"
                    value={district}
                    renderInput={(params) => (
                        <TextField
                        name="district"
                        id="district"
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
              <Grid
                item
                xs={6}
                md={3}
                sx={{ position: "relative", paddingTop: "0px !important" }}
              >
                <div className="input-form" style={{ marginTop: "7px" }}>
                  <h2 className="phaseLable ">City</h2>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    getOptionLabel={(option) => {
                      return option?.cityName?.toString() || ""
                    } }
                    disableClearable={true}
                    disabled
                    options={cityList || []}
                    onChange={(e, value) => {
                      console.log('value',value)
                      setCity(value);
                    }}
                    // onChange={handleChange}
                    placeholder="City"
                    value={city}
                    renderInput={(params) => (
                        <TextField
                        name="city"
                        id="city"
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

            <div
              style={{ border: "1px solid lightgray", margin: "-15px 0px" }}
            ></div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
                marginBottom :"5px"
              }}
            >
              <Typography className="section-headingTop" style = {{marginRight:"20px"}}>
                Asset Details
              </Typography>
              
            </div>
            <Grid
              marginBottom="30px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
               
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div >
                  <h2 className="phaseLable " style={{ marginTop: "-10px " }}>Remarks</h2>
                  <textarea
                    name="remarks"
                    autoComplete="off"
                    id="remarks"
                    // variant="outlined"
                    // size="small"
                    className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                    value={values?.remarks}
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
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div>
                  <h2 className="phaseLable " style={{ marginTop: "-10px " }}>Why do You require this Asset? </h2>
                  <textarea
                    name="requiredFor"
                    autoComplete="off"
                    id="requiredFor"
                    // variant="outlined"
                    // size="small"
                    className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                    value={values?.requiredFor}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={(e: any) => {
                      regExpressionRemark(e);
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                  />
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div>
                  <h2 className="phaseLable " style={{ marginTop: "-10px " }}>
                    Date of Commissioning
                  </h2>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      // disabled={closureDateDisable}
                      className="w-85"
                      inputFormat="DD/MM/YYYY"
                      value={values?.dateofCommissioning}
                      onChange={
                        (newValue) =>setFieldValue("dateofCommissioning", moment(new Date(newValue)).format())
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="dateofCommissioning"
                          size="small"
                          onKeyDown={(e: any) => e.preventDefault()}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  
                </div>
              </Grid>

              {/* <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div style={{ marginTop: "15px" }}>
                  <Button
                    variant="contained"
                    // type="submit"
                    size="small"
                    style={{ ...submit, marginLeft: "0px !important" }}
                    onClick={() => setOpenDrawer(!openDrawer)}
                  >
                    SEARCH ASSET
                  </Button>
                </div>
              </Grid> */}
            </Grid>
          
            <div
              style={{ border: "1px solid lightgray", margin: "-15px 0px" }}
            ></div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <Typography className="section-headingTop">
                Asset Detailed View
              </Typography>
              <Tooltip title="SEARCH ASSET">
                <Button
                      variant="contained"
                      // type="submit"
                      size="small"
                      style={{ ...submit, marginLeft: "0px !important", marginTop:"10px" }}
                      onClick={() => setOpenDrawer(!openDrawer)}
                    >
                      SEARCH ASSET
                </Button>
              </Tooltip>
            </div>
            <div style={{ height: getHeightForTable(), marginTop: "10px" }}>
              <CommonGrid
                defaultColDef={{ flex: 1 }}
                columnDefs={columnDefs2}
                rowData={assetDetaildView || []}
                onGridReady={onGridReady}
                gridRef={gridRef}
                pagination={false}
                paginationPageSize={null}
              />
            </div>
            <div className="bottom-fix-btn bg-pd">
            <Stack
              // className="bottom-fix-btn"
              display="flex"
              flexDirection="row"
              justifyContent="center"
              sx={{ margin: "10px" }}
              style={{
                marginTop: "20px",
                position: "fixed",
                bottom: "5px",
                left: "40%"
              }}
            >
              {edit ? 
              <Tooltip title="Update MOVEMENT">
                <Button
                  variant="contained"
                  type="submit"
                  size="small"
                  style={submit}
                >
                  Update MOVEMENT
                </Button>
              </Tooltip>
              :
              <Tooltip title="INITIATE MOVEMENT">
                <Button
                  variant="contained"
                  type="submit"
                  size="small"
                  style={submit}
                >
                  INITIATE MOVEMENT
                </Button>
              </Tooltip>
              }
              <Tooltip title="SKIP TO NEW REQUEST">
                <Button
                  variant="contained"
                  type="button"
                  size="small"
                  style={submit}
                  // onClick={() => handleClose()}
                  >
                    SKIP TO NEW REQUEST
                </Button>
              </Tooltip>
          </Stack>
          </div>
          </form>
        </div>
      </div>
      <SwipeableDrawer
        anchor={"right"}
        open={openDrawer}
        onClose={(e) => {
          setOpenDrawer(!openDrawer);
        }}
        onOpen={(e) => {
          setOpenDrawer(!openDrawer);
        }}
      >
        {/* <ComplienceTimeline mandateCode={mandateCode} /> */}
        
        <DrawerComponent
          onAssetDetaildViewData={handleDrawerComponentData}
          handleClose={() => setOpenDrawer(false)}
        />
      </SwipeableDrawer>
      <SwipeableDrawer
        anchor={"right"}
        open={openDrawerAssetCode}
        onClose={(e) => {
          setOpenDrawerAssetCode(!openDrawerAssetCode);
        }}
        onOpen={(e) => {
          setOpenDrawerAssetCode(!openDrawerAssetCode);
        }}
      >
        {/* <ComplienceTimeline mandateCode={mandateCode} /> */}
        
        <AssetCodeDrawer
          onAssetDrawerData={assetDrawerData}
          handleClose={() => setOpenDrawerAssetCode(false)}
        />
      </SwipeableDrawer>
     
    </>
  );
};

export default AssetRequest;
