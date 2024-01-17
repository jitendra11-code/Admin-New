import { Autocomplete, Box, Button, Grid, MenuItem, Select, SwipeableDrawer, TextField, Typography, 
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Tooltip,} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import regExpressionTextField, { textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';
import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';
import React, { useCallback, useEffect, useState } from 'react'
import { fetchError } from 'redux/actions';
import { submit } from 'shared/constants/CustomColor';
import DrawerComponent from './DrawerComponent';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import AssetInfo from 'pages/common-components/AssetInformation';
import { useNavigate, useParams } from 'react-router-dom';
import ApproveAndRejectAction from 'pages/common-components/ApproveRejectAction';
import { AppState } from 'redux/store';
import workflowFunctionAPICall from 'pages/Mandate/workFlowActionFunction';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import AssetCodeDrawer from './AssetCodeDrawer';


const AssetRequestReview = () => {
  const dispatch = useDispatch()
  const { id } = useParams();
  const [assetDetaildView, setAssetDetaildView] = useState([]);
  const [assetCode, setAssetCode] = useState<any>("");
  const [assetDataById, setAssetDataById] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [fromBranchDetails, setFromBranchDetails] = useState([]);
  const [toBranchDetails, setToBranchDetails] = useState([]);
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const [sendBack, setSendBack] = React.useState(false);
  const [rejected, setRejected] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const [approvedStatus, setApprovedStatus] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const [remark, setRemark] = React.useState("");
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [assetDrawerData, setAssetDrawerData]= React.useState(null);
  const [openDrawerAssetCode, setOpenDrawerAssetCode] = useState(false);
  const [assetRequestNo, setassetRequestNo] = useState('');
  // const { values, handleBlur, setFieldValue, handleChange, handleSubmit, errors, touched, resetForm } =
  // useFormik({
  //   initialValues: addPhaseInitialValues,
  //   validationSchema: addPhaseSchema,
  //   validateOnChange: true,
  //   validateOnBlur: false,
  //   onSubmit: (values, action) => {
     
  //     console.log("values", values)
        
  // });

  const getAssetRequestMovementDetailsData = async (id) => {
    await axios 
    .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestMovementDetailsByAssetId?assetId=${id}`)
    .then((response : any)=>{
      setAssetDetaildView(response?.data || []);
        console.log('res',response)
    })
    .catch((e:any) => {});
};

useEffect(() =>{
  if (id && id!="id") {
    getAssetRequestMovementDetailsData(id);
  }

},[id]);

useEffect(() => {
  if (id && id !="id") {
    setAssetCode(id)
  }
  
}, [id]);

const getAssetById = (id) => {
  axios
    .get(
      `${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestById?id=${id}`
    )
    .then((response: any) => {
      if (response && response?.data) {
        setAssetDataById(response?.data) 
      }
    })
    .catch((e: any) => { });
};

React.useEffect(() => {
  if (id && id!="id") {
    getAssetById(id);
    
  }
  
}, [id]);

const getFromBranchDetails = () => {
  axios
    .get(
      `${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterDetails?Id=${assetDataById[0]?.fk_from_branch_id}`
    )
    .then((response: any) => {
      console.log('res',response)
      setFromBranchDetails(response?.data || []);
      
    })
    .catch((e: any) => { });
};

useEffect (() => {
  if (assetDataById[0]?.fk_from_branch_id || id){
      getFromBranchDetails();
  }
}, [assetDataById[0]?.fk_from_branch_id,id]);

const getToBranchDetails = () => {
  axios
    .get(
      `${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterDetails?Id=${assetDataById[0]?.fk_to_branch_id}`
    )
    .then((response: any) => {
      console.log('res',response)
      setToBranchDetails(response?.data || []);
      
    })
    .catch((e: any) => { });
};

useEffect (() => {
  if (assetDataById[0]?.fk_to_branch_id || id){
    getToBranchDetails();
  }
}, [assetDataById[0]?.fk_to_branch_id,id])

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
        
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        return  <a  href= "#" style={{ color: 'blue' }} onClick={() => {setAssetDrawerData(params?.data);setOpenDrawerAssetCode(!openDrawerAssetCode)}} >
          {params?.data?.assetCode}
          </a>
      }
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
      headerName: "Book Val.",
      headerTooltip: "Book Value",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "balance_Useful_life_as_per_Finance",
      headerName: "Balance Useful (Finance)",
      headerTooltip: "Balance Useful Life as per Finance",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 210,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "balance_Useful_life_as_per_Admin",
      headerName: "Balance Useful (Admin)",
      headerTooltip: "Balance Useful Life as per Admin",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 200,
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

  console.log('assetCode',assetCode)
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
      
        <Box component="h2" className="page-title-heading my-6">
          Asset Request Review
        </Box>
        </div>
        <div
        className="card-panal"
        style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
        >
          <AssetInfo 
            setassetRequestNo={setassetRequestNo} 
            assetCode={assetCode}
            source=""
            pageType="propertyAdd"
            disabledStatus = {false}
            redirectSource={``}
            setAssetCode={setAssetCode}
            setMandateData={() => {}}
            setpincode={() => {}}
            setCurrentStatus={() => {}}
            setCurrentRemark={() => {}}
              />
    
        {/* <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              // marginTop: "10px",
            }}
          >
            <Typography className="section-headingTop">
              Requesting Branch Details
            </Typography>
        </div> */}
      
        <div
            className="card-panal inside-scroll-asset-226"
            style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
          >

          {/* <Grid
              marginBottom="30px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
          <Grid item xs={6} md={3}  sx={{ position: "relative" }}>
              <div className="input-form" style={{marginTop : "7px"}}>
                  <h2 className="phaseLable ">Branch Name</h2>
              
              <TextField
                    autoComplete="off"
                    name="branchName"
                    id="branchName"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={assetDataById[0]?.branchName}
                    disabled
                    // onBlur={handleBlur}
                  />
              </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form" style={{marginTop : "7px"}}>
                  <h2 className="phaseLable ">Branch Code</h2>
                  <TextField
                    autoComplete="off"
                    name="branchCode"
                    id="branchCode"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={assetDataById[0]?.branchCode}
                    disabled
                    // onBlur={handleBlur}
                  />

                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form" style={{marginTop : "7px"}}>
                  <h2 className="phaseLable ">Branch Address</h2>
                  <TextField
                    autoComplete="off"
                    name="branchAddress"
                    id="branchAddress"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={assetDataById[0]?.branchAddress}
                    disabled
                    // onBlur={handleBlur}
                  />

                </div>
              </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form" style={{marginTop : "7px"}}>
                  <h2 className="phaseLable ">PIN Code</h2>
                  <TextField
                    autoComplete="off"
                    name="pinCode"
                    id="pinCode"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={assetDataById[0]?.pinCode}
                    disabled
                    // onBlur={handleBlur}
                  />

                </div>
              </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative",paddingTop : "0px !important" }}>
                <div className="input-form" style={{marginTop : "7px"}}>
                  <h2 className="phaseLable ">City</h2>
                  <TextField
                    autoComplete="off"
                    name="city"
                    id="city"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={assetDataById[0]?.city}
                    disabled
                    // onBlur={handleBlur}
                  />

                </div>
              </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative", paddingTop : "0px !important" }}>
                <div className="input-form" style={{marginTop : "7px"}}>
                  <h2 className="phaseLable ">State</h2>
                  <TextField
                    autoComplete="off"
                    name="state"
                    id="state"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={assetDataById[0]?.state}
                    disabled
                    // onBlur={handleBlur}
                  />

                </div>
              </Grid>
          </Grid> */}

              <Grid
                marginBottom="30px"
                marginTop="0px"
                container
                item
                spacing={3}
                justifyContent="start"
                alignSelf="center"
              >
                <Grid item xs={6} md={6} sx={{ position: "relative" }}>
                  <div className="approval-table pl-0">
                    <Table
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: "1px solid rgba(0, 0, 0, 0.12)",
                        },
                        mt: 0,
                        mb: 0,
                      }}
                      aria-label="spanning table"
                    >
                      <TableHead>
                        <TableRow sx={{ lineHeight: "0.5rem" }}>
                          <TableCell align="center" colSpan={2}>
                            From Branch Details
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            align="center"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            style={{ width: '185px' }}
                          >
                            Field
                          </TableCell>
                          <TableCell
                            align="center"
                            className="w-75"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                          >
                            Values
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font_bold">Branch Name & Code</TableCell>
                          <TableCell className="w-71" >{`${fromBranchDetails[0]?.branch_Name}-${fromBranchDetails[0]?.branch_Code}`}</TableCell>
                        </TableRow>                       
                        <TableRow>
                          <TableCell className="font_bold w-35">Branch Address & PIN Code</TableCell>
                          <TableCell className="w-71" >{`${fromBranchDetails[0]?.address}-${fromBranchDetails[0]?.pincode}`}</TableCell>
                        </TableRow>                     
                        <TableRow>
                          <TableCell className="font_bold">State & City</TableCell>
                          <TableCell className="w-71" >{`${fromBranchDetails[0]?.state}-${fromBranchDetails[0]?.city}`}</TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell className="font_bold">Contact Person Name</TableCell>
                          <TableCell className="w-71" >{fromBranchDetails[0]?.branch_SPOC}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font_bold width_30">Contact Person Number</TableCell>
                          <TableCell className="w-71" >{fromBranchDetails[0]?.branch_SPOC_Phone}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </Grid>
                <Grid item xs={6} md={6} sx={{ position: "relative" }}>
                  <div className="approval-table pl-0">
                    <Table
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: "1px solid rgba(0, 0, 0, 0.12)",
                        },
                        mt: 0,
                        mb: 0,
                      }}
                      aria-label="spanning table"
                    >
                      <TableHead>
                        <TableRow sx={{ lineHeight: "0.5rem" }}>
                          <TableCell align="center" colSpan={2}>
                            To Branch Details
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            align="center"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            style={{ width: '185px' }}
                          >
                            Field
                          </TableCell>
                          <TableCell
                            align="center"
                            className="w-75"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                          >
                            Values
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font_bold">Branch Name & Code</TableCell>
                          <TableCell className="w-71" >{toBranchDetails[0]?.branch_Name !== undefined 
                           ? `${toBranchDetails[0]?.branch_Name}-${toBranchDetails[0]?.branch_Code}` : ""}</TableCell>
                        </TableRow>                       
                        <TableRow>
                          <TableCell className="font_bold w-35">Branch Address & PIN Code</TableCell>
                          <TableCell className="w-71" >{toBranchDetails[0]?.address !== undefined
                          ? `${toBranchDetails[0]?.address}-${toBranchDetails[0]?.pincode}` : ""}</TableCell>
                        </TableRow>                        
                        <TableRow>
                          <TableCell className="font_bold">State & City</TableCell>
                          <TableCell className="w-71" >{toBranchDetails[0]?.state !== undefined
                          ? `${toBranchDetails[0]?.state}-${toBranchDetails[0]?.city}` : ""}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font_bold">Contact Person Name</TableCell>
                          <TableCell className="w-71" >{toBranchDetails[0]?.branch_SPOC !== undefined ? 
                          toBranchDetails[0]?.branch_SPOC : ""}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font_bold width_30">Contact Person Number</TableCell>
                          <TableCell className="w-71" >{toBranchDetails[0]?.branch_SPOC_Phone ?
                          toBranchDetails[0]?.branch_SPOC_Phone : ""}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </Grid>
              </Grid>
              
            <div style={{ border: "1px solid lightgray", margin : "-15px 0px" }}></div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
                marginBottom :"10px"
              }}
            >
              <Typography className="section-headingTop" style = {{marginRight:"20px"}}>
                Asset Details
              </Typography>
              {/* <Button
                    variant="contained"
                    // type="submit"
                    size="small"
                    style={{ ...submit, marginLeft: "0px !important" }}
                    onClick={() => setOpenDrawer(!openDrawer)}
                  >
                    SEARCH ASSET
              </Button> */}
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
                    disabled
                    name="remarks"
                    autoComplete="off"
                    id="remarks"
                    // variant="outlined"
                    // size="small"
                    className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                    value={assetDataById[0]?.remarks}
                    // onChange={handleChange}
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div>
                  <h2 className="phaseLable " style={{ marginTop: "-10px " }}>Why do You require this Asset? </h2>
                  <textarea
                    disabled
                    name="requiredFor"
                    autoComplete="off"
                    id="requiredFor"
                    // variant="outlined"
                    // size="small"
                    className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                    value={assetDataById[0]?.requiredFor}
                    // onChange={handleChange}
                    // onBlur={handleBlur}
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
                      disabled
                      className="w-85"
                      inputFormat="DD/MM/YYYY"
                      value={assetDataById[0]?.dateofCommissioning}
                      onChange={()=> {}}
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
          </div>
          
          <div style={{ height:getHeightForTable()}}>
            <CommonGrid
              defaultColDef={{ flex: 1 }}
              columnDefs={columnDefs2}
              rowData={assetDetaildView || []}
              onGridReady={null}
              gridRef={null}
              pagination={false}
              paginationPageSize={null}
            />
          </div>
        </div>
        <div className="bottom-fix-history" style={{marginBottom: "-15px"}}>
              {  (
                  <MandateStatusHistory
                    mandateCode={assetCode}
                    accept_Reject_Status={currentStatus}
                    accept_Reject_Remark={currentRemark}
                  />
                )}
          </div>
          <div className="bottom-fix-btn">
          
                    <div
                      className="remark-field"
                      style={{ marginRight: "0px" }}
                    >
                      <Tooltip title="Back">
                        <Button
                          variant="outlined"
                          size="medium"
                          type="submit"
                          style={{
                            marginLeft: 10,
                            padding: "2px 20px",
                            borderRadius: 6,
                            color: "#fff",
                            borderColor: "#00316a",
                            backgroundColor: "#00316a",
                          }}
                          onClick={() => {navigate('/AssetRequestList')}}
                        >
                          Back
                        </Button>
                      </Tooltip>
                      <Tooltip title="Proceed">
                      <Button
                        variant="outlined"
                        size="medium"
                          type="submit"
                          style={{
                            marginLeft: 10,
                            padding: "2px 20px",
                            borderRadius: 6,
                            color: "#fff",
                            borderColor: "#00316a",
                            backgroundColor: "#00316a",
                          }}
                          onClick={() => {
                            workflowFunctionAPICall(
                              runtimeId,
                              id,
                              remark,
                              "Proceed",
                              navigate,
                              user
                            );
                          }}
                        >
                          Proceed
                        </Button>
                      </Tooltip>
                      {action &&
                        action === "Approve" &&
                        !approvedStatus &&
                        (
                          <>
                            <div className="bottom-fix-btn">
                              <div className="remark-field">
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
                                      id,
                                      remark,
                                      "Approved",
                                      navigate,
                                      user
                                    );
                                  }}
                                  sentBackEvent={() => {
                                    workflowFunctionAPICall(
                                      runtimeId,
                                      id,
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
                  </div>
                </div>
              </>
            )}
          </div>
          </div>
        </div>
        
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
          
        
     <SwipeableDrawer
     anchor={"right"}
     open={openDrawer}
     onClose={(e) => { setOpenDrawer(!openDrawer) }}
     onOpen={(e) => { setOpenDrawer(!openDrawer) }}
     >
     {/* <ComplienceTimeline mandateCode={mandateCode} /> */}
    {/* <DrawerComponent onAssetDetaildViewData={assetDetaildView} handleClose={() => setOpenDrawer(false)}/> */}

    </SwipeableDrawer>
    </>
  );
};


export default AssetRequestReview