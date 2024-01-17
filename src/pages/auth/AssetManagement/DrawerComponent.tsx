import { Autocomplete, Button, Checkbox, FormControlLabel, Grid, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid'
import regExpressionTextField, { textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';
import { assetDetailsInitialValues } from '@uikit/schemas';
import { useFormik } from 'formik';
import moment from 'moment';
import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';
import React, { useCallback, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux';
import { fetchError } from 'redux/actions';
import { submit } from 'shared/constants/CustomColor';
import axios from "axios";


const DrawerComponent = ({onAssetDetaildViewData,handleClose}) => {
  const dispatch = useDispatch();
    const [checked, setChecked] = React.useState({});
    const [selectedDropdown, setSelectedDropdown] = React.useState(null);
    const [unutilisedData, setUnutilisedData] = React.useState(null);
    const [assignedAssetData, setAssignedAssetData] = React.useState([]);
    const [flag, setFlag] = React.useState(false);
    const [assetPoolDetails, setAssetPoolDetails]= React.useState(null);
    const [assetTypeDetails, setAssetTypeDetails]= React.useState(null);
    const [assetClassDescriptionDetails, setAssetClassDescriptionDetails]= React.useState(null);
    const [assetCategoryDetails, setAssetCategoryDetails]= React.useState(null);
    const [assetDescriptionDetails, setAssetDescriptionDetails]= React.useState(null);

    const canAddToArray = (newObj, array) => {
      // Check if any object in the array has the same properties as newObj
      return !array.some(obj => obj.assetCode === newObj.assetCode);
    };
console.log('flag',flag)
    let columnDefs2 = [
      {
        field: "filename",
        headerName: "Select",
        headerTooltip: "Select",
        sortable: true,
        resizable: true,
        width: 400,
        minWidth: 90,
        cellStyle: { fontSize: "13px" },
        cellRenderer: (e: any) => (
          <>
          <FormControlLabel
            control={
              <Checkbox
                checked={checked[e?.rowIndex]   || false}
                onChange={() => {
                  const newChecked = { ...checked };
                  setFlag(false)
                  // Toggle the selected state for the current row
                  newChecked[e?.rowIndex] = !newChecked[e?.rowIndex];

                  // Update the state with the new selection
                  setChecked(newChecked);

                  console.log('eeeee',e,checked[e?.rowIndex],assignedAssetData.filter(obj => obj.assetCode.includes(e?.data?.assetcode)),newChecked)

                  // newChecked[e?.rowIndex] =
                  //   checked[e?.rowIndex] === undefined
                  //     ? true
                  //     : !checked[e?.rowIndex];
                  // setChecked({ ...checked });
                  if (
                    newChecked[e?.rowIndex] === undefined ||
                    newChecked[e?.rowIndex]
                  ) {
                    // assignedAssetData[e?.rowIndex] = { ...e?.data };
                    setAssignedAssetData([ ...assignedAssetData,{ ...e?.data } ]);
                   
                  } else if (newChecked[e?.rowIndex]=== false) {
                    // delete assignedAssetData[e?.rowIndex];
                    // setAssignedAssetData([ ...assignedAssetData ]);
                    setAssignedAssetData(assignedAssetData.filter(obj => obj?.id !== e?.data?.id))
                  }

                  // if (assignedAssetData ) {
                  //   newChecked[e?.rowIndex] = false;
                  //   setChecked(newChecked);
                  // }
                  
                 
                }}
              />
            }
            label=""
          />
        </>
        ),

      },
        
        {
          field: "assetCode",
          headerName: "Asset Code",
          headerTooltip: "Asset Code",
          sortable: true,
          resizable: true,
          width: 400,
          minWidth: 150,
          cellStyle: { fontSize: "13px" },
          // tooltipComponent: 'customTooltip',
          // tooltipComponentParams: { color: '#ececec' },
          // // cellRenderer : (e: any ) => (
          // //   <div style={{ height: getHeightForTable(), marginTop: "10px" }}>
          // //       <CommonGrid
          // //         defaultColDef={{ flex: 1 }}
          // //         columnDefs={columnDefs}
          // //         rowData={assetPoolDetails || []}
          // //         onGridReady={null}
          // //         gridRef={null}
          // //         pagination={false}
          // //         paginationPageSize={null}
          // //       />
          // //     </div>
          // // )
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
          minWidth: 150,
          cellStyle: { fontSize: "13px" },
        },
        {
          field: "balance_Useful_life_as_per_Finance",
          headerName: "Balance Useful (Finance)",
          headerTooltip: "Balance Useful (Finance)",
          sortable: true,
          resizable: true,
          width: 400,
          minWidth: 150,
          cellStyle: { fontSize: "13px" },
        },
        {
          field: "balance_Useful_life_as_per_Admin",
          headerName: "Balance Useful (Admin)",
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
      

      console.log('assigned',assignedAssetData,selectedDropdown)
      const sendDataToParent = () => {
        // Call the function passed from the parent with the data
       
        
        
        // setAssetClassDescriptionDetails(null);
        // setAssetTypeDetails(null);
        // setAssetCategoryDetails(null);
        // setAssetCategoryDetails(null);
        // setAssetDescriptionDetails(null);
        // setAssignedAssetData([]);
        if (canAddToArray(unutilisedAssetData,assignedAssetData) ){
          onAssetDetaildViewData(assignedAssetData);
          handleClose();
          setFlag(true);
          setUnutilisedData(null);
          setSelectedDropdown(null);
        } else {
          dispatch(fetchError("Dublicate data not exist!!"))
          return;
        }
      };

      const validationOnAsset = () =>{
        if (assignedAssetData?.length === 0) {
          dispatch(fetchError("Please select atleast One Asset!!"))
        } else if (assignedAssetData?.length > 20) {
          dispatch(fetchError("Please don't select Asset more than 20 !!"))
        }
      }
      console.log('unutilisedData',unutilisedData)
      const unutilisedAssetData = () => {
        if (selectedDropdown?.assetType !== undefined && selectedDropdown?.assetCategorisation === undefined 
          && selectedDropdown?.assetClassDescription === undefined && selectedDropdown?.asset_description === undefined ){
          axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/AssetPool/GetAssetPoolDetails?&AssetType=${selectedDropdown?.assetType}`
          )
          .then((res: any)=> {
              console.log('res-assetPool',res)
              setUnutilisedData(res?.data)
          }).catch((e:any)=> {

          })
        }else if (selectedDropdown?.assetType === undefined && selectedDropdown?.assetCategorisation === undefined 
          && selectedDropdown?.assetClassDescription === undefined && selectedDropdown?.asset_description === undefined ){
            setUnutilisedData(null)
        } else if (selectedDropdown?.assetType === undefined && selectedDropdown?.assetCategorisation !== undefined 
          && selectedDropdown?.assetClassDescription === undefined && selectedDropdown?.asset_description === undefined ){
          axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/AssetPool/GetAssetPoolDetails?&AssetCategorisation=${selectedDropdown?.assetCategorisation}`
          )
          .then((res: any)=> {
              console.log('res-assetPool',res)
              setUnutilisedData(res?.data)
          }).catch((e:any)=> {

          })
        } else if (selectedDropdown?.assetType === undefined && selectedDropdown?.assetCategorisation === undefined 
          && selectedDropdown?.assetClassDescription !== undefined && selectedDropdown?.asset_description === undefined ){
          axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/AssetPool/GetAssetPoolDetails?&AssetClassDescription=${selectedDropdown?.assetClassDescription}`
          )
          .then((res: any)=> {
              console.log('res-assetPool',res)
              setUnutilisedData(res?.data)
          }).catch((e:any)=> {

          })
        } else if (selectedDropdown?.assetType === undefined && selectedDropdown?.assetCategorisation === undefined 
          && selectedDropdown?.assetClassDescription === undefined && selectedDropdown?.asset_description !== undefined ){
          axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/AssetPool/GetAssetPoolDetails?&AssetDescription=${selectedDropdown?.asset_description}`
          )
          .then((res: any)=> {
              console.log('res-assetPool',res)
              setUnutilisedData(res?.data)
          }).catch((e:any)=> {

          })
        } else if (selectedDropdown?.assetType !== undefined && selectedDropdown?.assetCategorisation !== undefined
          && selectedDropdown?.assetClassDescription === undefined && selectedDropdown?.asset_description === undefined){
          axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/AssetPool/GetAssetPoolDetails?&AssetType=${selectedDropdown?.assetType}&AssetCategorisation=${selectedDropdown?.assetCategorisation}`
          )
          .then((res: any)=> {
              console.log('res-assetPool',res)
              setUnutilisedData(res?.data)
          }).catch((e:any)=> {

          })
        } else if (selectedDropdown?.assetType !== undefined && selectedDropdown?.assetCategorisation === undefined
          && selectedDropdown?.assetClassDescription !== undefined && selectedDropdown?.asset_description === undefined){
          axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/AssetPool/GetAssetPoolDetails?&AssetType=${selectedDropdown?.assetType}&AssetClassDescription=${selectedDropdown?.assetClassDescription}`
          )
          .then((res: any)=> {
              console.log('res-assetPool',res)
              setUnutilisedData(res?.data)
          }).catch((e:any)=> {

          })
        }  else if (selectedDropdown?.assetType !== undefined && selectedDropdown?.assetCategorisation === undefined
          && selectedDropdown?.assetClassDescription === undefined && selectedDropdown?.asset_description !== undefined){
          axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/AssetPool/GetAssetPoolDetails?&AssetType=${selectedDropdown?.assetType}&AssetDescription=${selectedDropdown?.asset_description}`
          )
          .then((res: any)=> {
              console.log('res-assetPool',res)
              setUnutilisedData(res?.data)
          }).catch((e:any)=> {

          })
        }  else if (selectedDropdown?.assetType === undefined && selectedDropdown?.assetCategorisation !== undefined
          && selectedDropdown?.assetClassDescription !== undefined && selectedDropdown?.asset_description === undefined){
          axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/AssetPool/GetAssetPoolDetails?&AssetCategorisation=${selectedDropdown?.assetCategorisation}&AssetClassDescription=${selectedDropdown?.assetClassDescription}`
          )
          .then((res: any)=> {
              console.log('res-assetPool',res)
              setUnutilisedData(res?.data)
          }).catch((e:any)=> {

          })
        } else if (selectedDropdown?.assetType === undefined && selectedDropdown?.assetCategorisation !== undefined
          && selectedDropdown?.assetClassDescription === undefined && selectedDropdown?.asset_description !== undefined){
          axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/AssetPool/GetAssetPoolDetails?&AssetCategorisation=${selectedDropdown?.assetCategorisation}&AssetDescription=${selectedDropdown?.asset_description}`
          )
          .then((res: any)=> {
              console.log('res-assetPool',res)
              setUnutilisedData(res?.data)
          }).catch((e:any)=> {

          })
        }  else if (selectedDropdown?.assetType === undefined && selectedDropdown?.assetCategorisation === undefined
          && selectedDropdown?.assetClassDescription !== undefined && selectedDropdown?.asset_description !== undefined){
          axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/AssetPool/GetAssetPoolDetails?&AssetClassDescription=${selectedDropdown?.assetClassDescription}&AssetDescription=${selectedDropdown?.asset_description}`
          )
          .then((res: any)=> {
              console.log('res-assetPool',res)
              setUnutilisedData(res?.data)
          }).catch((e:any)=> {

          })
        }

        else if (selectedDropdown?.assetType !== undefined && selectedDropdown?.assetCategorisation !== undefined
          && selectedDropdown?.assetClassDescription !== undefined && selectedDropdown?.asset_description === undefined){
          axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/AssetPool/GetAssetPoolDetails?&AssetType=${selectedDropdown?.assetType}&AssetCategorisation=${selectedDropdown?.assetCategorisation}&AssetClassDescription=${selectedDropdown?.assetClassDescription}`
          )
          .then((res: any)=> {
              console.log('res-assetPool',res)
              setUnutilisedData(res?.data)
          }).catch((e:any)=> {

          })
        } 
        else if (selectedDropdown?.assetType !== undefined && selectedDropdown?.assetCategorisation !== undefined
         && selectedDropdown?.assetClassDescription !== undefined && selectedDropdown?.asset_description !== undefined) {
        axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/AssetPool/GetAssetPoolDetails?&AssetType=${selectedDropdown?.assetType}&AssetCategorisation=${selectedDropdown?.assetCategorisation}&AssetClassDescription=${selectedDropdown?.assetClassDescription}&AssetDescription=${selectedDropdown?.asset_description}`
          )
          .then((res: any)=> {
              console.log('res-assetPool',res)
              setUnutilisedData(res?.data)
          }).catch((e:any)=> {

          })
        }
      };
      

      const getAssetPoolDetails = () => {
        axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/assetpool/GetAssetPoolDetails`
          )
          .then((response: any) => {
            console.log('resAssset',response)
            setAssetPoolDetails(response?.data || []);
            
          })
          .catch((e: any) => { });
      };
      const getAssetPoolAssetTypeDetails = () => {
        axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Asset Type`
          )
          .then((response: any) => {
            console.log('resAsssetType',response)
            setAssetTypeDetails(response?.data || []);
            
          })
          .catch((e: any) => { });
      };
      const getAssetPoolAssetClassDescriptionDetails = () => {
        axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Asset Class Description`
          )
          .then((response: any) => {
            console.log('resAsssetClassDes',response)
            setAssetClassDescriptionDetails(response?.data || []);
            
          })
          .catch((e: any) => { });
      };
      const getAssetPoolAssetCategoryDetails = () => {
        axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Asset Category`
          )
          .then((response: any) => {
            console.log('resAsssetCat',response)
            setAssetCategoryDetails(response?.data || []);
            
          })
          .catch((e: any) => { });
      };
      const getAssetPoolAssetDescriptionDetails = () => {
        axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Asset Description`
          )
          .then((response: any) => {
            console.log('resAsssetCat',response)
            setAssetDescriptionDetails(response?.data || []);
            
          })
          .catch((e: any) => { });
      };

    
      useEffect (() => {
        getAssetPoolDetails();
        getAssetPoolAssetTypeDetails();
        getAssetPoolAssetClassDescriptionDetails();
        getAssetPoolAssetCategoryDetails();
        getAssetPoolAssetDescriptionDetails();
      }, [])

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
        initialValues: assetDetailsInitialValues,
        // validationSchema: assetRequestSchema,
        validateOnChange: true,
        validateOnBlur: false,
        onSubmit: (values, action) => {
          console.log("values", values);
          const body = {
            assetType: values?.assetType,
            classDescription: values?.classDescription,
            description: values?.description,
            category: values?.category,
            requiredQuantity: values?.requiredQuantity?.toString(),
            // dateofCommissioning: values?.dateofCommissioning,
          }
        }
      })

      const getHeightForTable = useCallback(() => {
        var height = 0;
        var dataLength = (assetPoolDetails && assetPoolDetails?.length) || 0;
        if (dataLength === 0) return "0px";
        height = 45 * dataLength + 97;
    
        if (height > 0 && dataLength <= 4) return `${height}px`;
        return "210px";
      }, [assetPoolDetails]);
  return (
    <div style={{padding : "20px", width: "71vw",}}>
         <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "-10px",
            }}
          >
            <Typography className="section-headingTop">
              Unutilized Asset Details
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
                  <h2 className="phaseLable ">Asset Type</h2>
                  <Autocomplete
                    disablePortal
                    // sx={{
                    //   backgroundColor: "#f3f3f3",
                    //   borderRadius: "6px",
                    // }}
                    id="combo-box-demo"
                    getOptionLabel={(option : any ) => 
                      option?.formName?.toString() || ""
                    }
                    // disableClearable={true}
                    options={assetTypeDetails}
                    onChange={(e, v) => {
                      console.log('v',v)
                      setSelectedDropdown({ ...selectedDropdown, ["assetType"]: v?.formName });
                      setFieldValue("assetType", v?.formName);
                    }}
                    placeholder="Document Type"
                    value={selectedDropdown?.assetType}
                    renderInput={(params) => (
                      <TextField
                        name="assetType"
                        id="assetType"
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
              </Grid>{" "}
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form" style={{ marginTop: "7px" }}>
                  <h2 className="phaseLable ">Asset Class Description</h2>
                  <Autocomplete
                    disablePortal
                    // sx={{
                    //   backgroundColor: "#f3f3f3",
                    //   borderRadius: "6px",
                    // }}
                    id="combo-box-demo"
                    getOptionLabel={(option : any) =>
                      option?.formName?.toString() || ""
                    }
                    // disableClearable={true}
                    options={assetClassDescriptionDetails}
                    onChange={(e, v) => {
                      setSelectedDropdown({ ...selectedDropdown, ["assetClassDescription"]: v?.formName });
                      setFieldValue("classDescription", v);
                    }}
                    placeholder="Document Type"
                    value={selectedDropdown?.classDescription}
                    renderInput={(params) => (
                      <TextField
                        name="classDescription"
                        id="classDescription"
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
              </Grid>{" "}
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form" style={{ marginTop: "7px" }}>
                  <h2 className="phaseLable ">Asset Category</h2>
                  <Autocomplete
                    disablePortal
                    // sx={{
                    //   backgroundColor: "#f3f3f3",
                    //   borderRadius: "6px",
                    // }}
                    id="combo-box-demo"
                    getOptionLabel={(option : any) =>
                      option?.formName?.toString() || ""
                    }
                    // disableClearable={true}
                    options={assetCategoryDetails}
                    onChange={(e, v) => {
                      setSelectedDropdown({ ...selectedDropdown, ["assetCategorisation"]: v?.formName});
                      setFieldValue("category", v);
                    }}
                    placeholder="Document Type"
                    // value={values?.category}
                    renderInput={(params) => (
                      <TextField
                        name="category"
                        id="category"
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
              </Grid>{" "}
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form" style={{ marginTop: "7px" }}>
                  <h2 className="phaseLable ">Asset Description</h2>
                  <Autocomplete
                    disablePortal
                    // sx={{
                    //   backgroundColor: "#f3f3f3",
                    //   borderRadius: "6px",
                    // }}
                    id="combo-box-demo"
                    getOptionLabel={(option : any) =>
                      option?.formName?.toString() || ""
                    }
                    // disableClearable={true}
                    options={assetDescriptionDetails}
                    onChange={(e, v) => {
                      setSelectedDropdown({ ...selectedDropdown, ["asset_description"]: v?.formName });
                      setFieldValue("description", v);
                    }}
                    placeholder="Document Type"
                    // value={docType}
                    renderInput={(params) => (
                      <TextField
                        name="description"
                        id="description"
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
                  <h2 className="phaseLable ">Asset Required Quantity</h2>
                  <TextField
                    autoComplete="off"
                    type="number"
                    name="requiredQuantity"
                    id="requiredQuantity"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    inputProps={{ min: '0' }}
                    // value={values?.requiredQuantity}
                    // onChange={handleChange}
                    // onBlur={handleBlur}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e);
                      blockInvalidChar(e);
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(
                          fetchError("You can not paste Spacial characters")
                        );
                      }
                    }}
                  />
                  {/* {touched.numberOfBranch && errors.numberOfBranch ? (
                    <p className="form-error">{errors.numberOfBranch}</p>
                  ) : null} */}
                </div>
              </Grid>
              <Grid
                item
                xs={6}
                md={3}
                sx={{ position: "relative", paddingTop: "0px !important" }}
              >
                <div className="input-form" style={{ marginTop: "31px" }}>
                  <Tooltip title="Search">
                    <Button
                      variant="contained"
                      type="button"
                      size="small"
                      style={submit}
                      onClick={() => unutilisedAssetData()}
                    >
                      Search
                    </Button>
                  </Tooltip>
                </div>
             
              </Grid>
              </Grid>
             {/* <div style = {{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',}}>
             
             </div> */}
             
             {unutilisedData !== null &&
              <div style={{ height: getHeightForTable(), marginTop: "10px" }}>
                <CommonGrid
                  defaultColDef={{ flex: 1 }}
                  columnDefs={columnDefs2}
                  rowData={unutilisedData || []}
                  onGridReady={null}
                  gridRef={null}
                  pagination={false}
                  paginationPageSize={null}
                />
              </div>
              }

          <Stack
            display="flex"
            flexDirection="row"
            justifyContent="center"
            sx={{ margin: "10px" }}
            style={{
              marginTop: "20px",
              position: "fixed",
              bottom: "30px",
              left: "55%"
            }}
          >
            <Tooltip title="BACK">
              <Button
                variant="contained"
                type="button"
                size="small"
                style={submit}
                onClick={() => {handleClose()}}
              >
                BACK
              </Button>
            </Tooltip>
            <Tooltip title="ADD ASSETS">
              <Button
                variant="contained"
                type="button"
                size="small"
                style={submit}
                onClick={() => { assignedAssetData?.length === 0 || assignedAssetData?.length > 20 
                  ?  validationOnAsset() : sendDataToParent();}}
              >
                ADD ASSETS
              </Button>
            </Tooltip>
          </Stack>
    </div>
  )
}

export default DrawerComponent