import { Box, Grid, TextField, Typography } from '@mui/material'
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid'
import axios from 'axios'
import ApproveSendBackRejectAction from 'pages/common-components/ApproveSendBackRejectAction'
import AssetInfo from 'pages/common-components/AssetInformation'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

const AdminCMView = () => {
    const dispatch = useDispatch()
  const { id } = useParams();
  const [assetDetaildView, setAssetDetaildView] = useState([]);
  const [assetCode, setAssetCode] = useState<any>("");
  const [assetDataById, setAssetDataById] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [approved, setApproved] = React.useState(false);
  const [sendBack, setSendBack] = React.useState(false);
  const [rejected, setRejected] = React.useState(false);
  const [remark, setRemark] = useState("");
  // const { values, handleBlur, setFieldValue, handleChange, handleSubmit, errors, touched, resetForm } =
  // useFormik({
  //   initialValues: addPhaseInitialValues,
  //   validationSchema: addPhaseSchema,
  //   validateOnChange: true,
  //   validateOnBlur: false,
  //   onSubmit: (values, action) => {
     
  //     console.log("values", values)
        
  // });

  const getAllData = async (id) => {
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
    getAllData(id);
}    

},[id]);

useEffect(() => {
  if (id && id!="noid") {
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
  if (id && id !="id") { 
    getAssetById(id);
  }

}, [id]);

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
      field: "assetCategory",
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
      field: "assetDescription",
      headerName: "Asset Description",
      headerTooltip: "Asset Description",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "pavLocation",
      headerName: "PAV Location",
      headerTooltip: "PAV Location",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "bookValue",
      headerName: "Book Val.",
      headerTooltip: "Book Value",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "balanceUsefulLifeAsPerFinance",
      headerName: "Balance Useful Life as per Finance",
      headerTooltip: "Balance Useful Life as per Finance",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "balanceUsefulLifeAsPerAdmin",
      headerName: "Balance Useful Life as per Admin",
      headerTooltip: "Balance Useful Life as per Admin",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "isUsed",
      headerName: "Used / Unused",
      headerTooltip: "Used / Unused",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
  
   
  ];
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
          Admin CM View
        </Box>
      </Grid>
      <div
          className="card-panal"
          style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
        >
          <AssetInfo  
            assetCode={assetCode}
            source=""
            pageType="propertyAdd"
            redirectSource={``}
            setAssetCode={() => {}}
            setMandateData={() => {}}
            setpincode={() => {}}
            setCurrentStatus={() => {}}
            setCurrentRemark={() => {}}
              />

        <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              // marginTop: "10px",
            }}
          >
            <Typography className="section-headingTop">
              Movement from Branch Details
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
              </Grid>
              
            <div style={{ border: "1px solid lightgray", margin : "-15px 0px" }}></div>
            <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <Typography className="section-headingTop">
              Movement To Branch Details
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
          <Grid item xs={6} md={3}  sx={{ position: "relative" }}>
              <div className="input-form" style={{marginTop : "7px"}}>
                  <h2 className="phaseLable ">Branch Admin Name</h2>
              
              <TextField
                    autoComplete="off"
                    name="branchAdminName"
                    id="branchAdminName"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    // value={assetDataById[0]?.branchName}
                    disabled
                    // onBlur={handleBlur}
                  />
              </div>
              </Grid>
              <Grid item xs={6} md={3}  sx={{ position: "relative" }}>
              <div className="input-form" style={{marginTop : "7px"}}>
                  <h2 className="phaseLable ">Branch Admin Employee Id</h2>
              
              <TextField
                    autoComplete="off"
                    name="brancAdminEmployeeId"
                    id="brancAdminEmployeeId"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    // value={assetDataById[0]?.branchName}
                    disabled
                    // onBlur={handleBlur}
                  />
              </div>
              </Grid>
              
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
              <Grid item xs={6} md={3} sx={{ position: "relative",paddingTop : "0px !important" }}>
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
            <Grid item xs={6} md={3} sx={{ position: "relative",paddingTop : "0px !important" }}>
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
              <Grid item xs={6} md={3}  sx={{ position: "relative" , paddingTop : "0px !important"}}>
              <div className="input-form" style={{marginTop : "7px"}}>
                  <h2 className="phaseLable ">Total Requested Assets</h2>
              
              <TextField
                    autoComplete="off"
                    name="totalRequestedAssets"
                    id="totalRequestedAssets"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    // value={assetDataById[0]?.branchName}
                    disabled
                    // onBlur={handleBlur}
                  />
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
            }}
          >
            <Typography className="section-headingTop">
              Asset Detailed View
            </Typography>
          </div>
          
          <div style={{ height: "300px", marginTop: "10px" }}>
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
                            //   workflowFunctionAPICall(
                            //     runtimeId,
                            //     mandateId?.id,
                            //     vendor?.vendorId,
                            //     remark,
                            //     "Approved",
                            //     navigate,
                            //     user
                            //   );
                            }}
                            sentBackEvent={() => {
                            //   workflowFunctionAPICall(
                            //     runtimeId,
                            //     mandateId?.id,
                            //     vendor?.vendorId,
                            //     remark,
                            //     "Sent back",
                            //     navigate,
                            //     user
                            //   );
                            }}
                            rejectEvent={() => {
                            //   workflowFunctionAPICall(
                            //     runtimeId,
                            //     mandateId?.id,
                            //     vendor?.vendorId,
                            //     remark,
                            //     "Rejected",
                            //     navigate,
                            //     user
                            //   );
                            }}
                          />
                          
                        </div>
                      </div>
    </>
  )
}

export default AdminCMView
