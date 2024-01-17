import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Tooltip } from '@mui/material'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import regExpressionTextField, { regExpressionRemark, textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';
import { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';
import AssetInfo from 'pages/common-components/AssetInformation'
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import React, { useState } from 'react'
import { GrAddCircle } from 'react-icons/gr';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage, showWarning } from 'redux/actions';
import { reset } from 'shared/constants/CustomColor';
import EditIcon from '@mui/icons-material/Edit';
import DeleteDialog from './DeleteDialog';
// import InputQuotationViewList from 'pages/Mandate/Staff/Components/Actions/InputQuotationViewList';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { _validationMaxFileSizeUpload } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import axios from 'axios';
import UtrVendorDocumentUploadListView from 'pages/Mandate/Staff/Components/Actions/UtrVendorDocumentUploadListView';

const MAX_COUNT = 8;

const VendorUTRDetails = () =>  {
    const [assetRequestNo, setassetRequestNo] = useState('');
    const [assetCode, setAssetCode] = useState<any>("");
    const [currentStatus, setCurrentStatus] = React.useState("");
    const [currentRemark, setCurrentRemark] = React.useState("");
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [utrData, setUtrData] = React.useState(null);
    const [rowData, setRowData] = React.useState([]);
    const [isEdit, setisEdit] = useState(false)
    const [editId, seteditId] = useState(null);
    const [params, setParams] = useState(null);
    const fileInput = React.useRef(null);
    const [fileLimit, setFileLimit] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileLength, setFileLength] = useState(0);
    const [upload, setUpload] = React.useState(false);
    const [uploadedValue, setUploadedValue] = useState(null);
    const [error, setError] = useState({});
    const [recordId,setRecordId] = useState(null);

    const dispatch = useDispatch();


    function onGridReady(params) {
        setGridApi(params.api);
        gridRef.current!.api.sizeColumnsToFit();
    };

    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
      setUtrData(null);
      setError({});
    };

    const handleUtrVendor = (e) => {
      const { name, value } = e?.target;

      if (e?.target?.value && e?.target?.name =='vendorCategory') {
        delete error['vendorCategory'];
      }
      if (e?.target?.value && e?.target?.name =='vendorNameCode') {
        delete error['vendorNameCode'];
      }
      if (e?.target?.value && e?.target?.name =='amount') {
        delete error['amount'];
      }
      if (e?.target?.value && e?.target?.name =='utrNo') {
        delete error['utrNo'];
      }
      if (e?.target?.value && e?.target?.name =='remark') {
        delete error['remark'];
      }
     
      setUtrData({ ...utrData, [name]: value });
  };

  console.log('utrData',utrData,rowData)

  function Validation() {

    if (utrData?.vendorCategory?.trim() == null || utrData?.vendorCategory?.trim() == '') {
        error['vendorCategory'] = 'Please enter Vendor Category';
    } else {
        delete error['vendorCategory'];
    }
    if (utrData?.vendorNameCode?.trim() == null || utrData?.vendorNameCode?.trim() == '') {
      error['vendorNameCode'] = 'Please enter Vendor Name Code';
    } else {
        delete error['vendorNameCode'];
    }
    if (utrData?.amount?.trim() == null || utrData?.amount?.trim() == '') {
      error['amount'] = 'Please enter Amount';
    } else {
        delete error['amount'];
    }
    if (utrData?.utrNo?.trim() == null || utrData?.utrNo?.trim() == '') {
      error['utrNo'] = 'Please enter UTR Number';
    } else {
        delete error['utrNo'];
    }
    if (utrData?.remark?.trim() == null || utrData?.remark?.trim() == '') {
      error['remark'] = 'Please enter Remark';
    } else {
        delete error['remark'];
    }
    setError({ ...error });
    return error;
  }

  const handleSubmitUtrVendor = () => {
    const errors = Validation();
    if (errors && Object.keys(errors).length > 0) return;
    if (isEdit){
      setRowData([utrData])
    } else {
      setRowData([...rowData,utrData]);
    }
    
    setOpen(false);
    setUtrData(null);

  }
 

  const handleUploadFiles = async (e, files, recId) => {
    
    const uploaded = [...uploadedFiles];
    let limitExceeded = false;
    files &&
        files?.some((file) => {
            if (uploaded && uploaded?.findIndex((f) => f.name === file.name) === -1) {
                uploaded.push(file);
                if (uploaded?.length === MAX_COUNT) setFileLimit(true);
                if (uploaded?.length > MAX_COUNT) {
                    dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));
                    setFileLimit(false);
                    limitExceeded = true;
                    return;
                }
            }
        });

    if (limitExceeded) {
        dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));

        return;
    }
    if (!limitExceeded) setUploadedFiles(uploaded);
    setFileLength((uploaded && uploaded?.length) || 0);
    const formData: any = new FormData();
    formData.append('assetcode', assetCode || 0);
    formData.append('documenttype', 'Asset Utr Vendor Details');
    formData.append('CreatedBy', '');
    formData.append('ModifiedBy', '');
    formData.append('entityname', 'Utr Vendor Details');
    formData.append('RecordId', recId || 0);
    formData.append('remarks', '');
    for (var key in uploaded) {
        await formData.append('file', uploaded[key]);
    }

    if (uploaded?.length === 0) {
        setUploadedFiles([]);
        setFileLimit(false);
        dispatch(fetchError('Error Occurred !'));
        return;
    }
    if (formData) {
        dispatch(showWarning('Upload is in progress, please check after sometime'));

        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/imagestorage/FileUploadForAssetPool`, formData)
            .then((response: any) => {
                e.target.value = null;
                if (!response) {
                    setUploadedFiles([]);
                    setFileLimit(false);
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data?.data == null) {
                    setUploadedFiles([]);
                    setFileLimit(false);
                    dispatch(fetchError('Documents are not uploaded!'));
                    // getVersionHistoryData();
                    return;
                } 
                if (response) {
                  
                    // if (uploadedValue != null) {
                    //     if (uploadedValue?.data) {
                    //         const index = uploadedValue?.rowIndex;
                    //         const trans = [...utrData];
                    //         if (uploadedValue?.data) {
                    //             trans[index] = { ...trans[index], record_Id: recId, isEdit: true };
                    //             setUtrData(trans);
                    //             setUpload(true);
                    //         } else {
                    //             trans[index] = { ...trans[index], record_Id: recId };
                    //             setUtrData(trans);
                    //         }
                    //         // setTransportVendor(trans);
                    //         // if (params?.data?.id != 0) {
                    //         //     setFlag(true);
                    //         // }
                    //     } else if (params?.data?.vendorCategory == 'Installation Vendor') {
                    //         const index = params?.rowIndex;
                    //         // const install = [...installationVendor];
                    //         // if (params?.data?.id !== 0) {
                    //         //     install[index] = { ...install[index], record_Id: recId, isEdit: true };
                    //         //     setTransportVendor(install);
                    //         //     setUpload(true);
                    //         // } else {
                    //         //     install[index] = { ...install[index], record_Id: recId };
                    //         //     setTransportVendor(install);
                    //         // }
                    //         // setInstallationVendor(install);
                    //         // if (params?.data?.id != 0) {
                    //         //     setFlag(true);
                    //         // }
                    //     }
                    // }
                    // console.log('flag33', flag);
                    setUploadedFiles([]);
                    setFileLimit(false);
                    dispatch(showMessage('Documents are uploaded successfully!'));
                    // getVersionHistoryData();
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    }
};
  const handleUploadFilesByGetRecId = (e, files) => {
    axios
        .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetRecordId`)
        .then((response: any) => {
            if (!response) return;
            
            if (response && response?.data && response?.data && response?.status === 200) {
                var recId = response?.data;
                setRecordId(response?.data);
                handleUploadFiles(e, files, recId);
            } else {
                e.target.value = null;
                dispatch(fetchError('Error Occurred !'));
                return;
            }
        })
        .catch((e: any) => {
            dispatch(fetchError('Error Occurred !'));
        });
};

  const handleFileEvent = (e) => { 
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch)) {
      // uploadedValue?.data?.record_Id == null ? handleUploadFilesByGetRecId(e, chosenFiles) : handleUploadFiles(e, chosenFiles, uploadedValue?.data?.record_Id);
      handleUploadFilesByGetRecId(e, chosenFiles)
    }
  };
    let columnDefs = [
      {
        field: 'action',
        headerName: 'Actions',
        headerTooltip: 'Actions',
        sortable: true,
        resizable: true,
        width: 90,
        minWidth: 90,
        cellStyle: { fontSize: '13px' },
        cellRenderer: (params: any) => (
            <>
                <Tooltip title="Edit Item" className="actionsIcons">
                    <EditIcon
                        fontSize="medium"
                        style={{
                            cursor: 'pointer',
                            fontSize: '20px',
                            color: '#000',
                        }}
                        onClick={(e) => {
                            setUtrData({ ...params?.data });
                            setisEdit(true);
                            seteditId(params?.data?.id);
                            setParams(params);
                            if (params?.data) {
                                setOpen(true);
                            } else {
                                setOpen(true);
                            }
                        }}
                    />
                </Tooltip>
                {/* <Tooltip title="Delete Item" className="actionsIcons">
                    <DeleteDialog params={params} id={id} transportVendor={transportVendor} setTransportVendor={setTransportVendor} installationVendor={installationVendor} setInstallationVendor={setInstallationVendor} getTranportVendor={getTranportVendor} />
                </Tooltip> */}
                <Tooltip title="Upload Document" className="actionsIcons">
                  <AddPhotoAlternateOutlinedIcon
                    style={{ cursor: 'pointer', fontSize: '20px', color: '#000' }}
                    onClick={() => {
                      if (assetCode == null || assetCode == "") {
                        dispatch(fetchError("Please select Request Number!!"))
                        return;
                      }
                      fileInput.current.click();
                      // setUploadedValue(params);
                  }}
                  fontSize="medium"

                  />
                </Tooltip>
                <input ref={fileInput} multiple onChange={(e) => {handleFileEvent(e); setUploadedValue(params)}} disabled={fileLimit} accept="image/*" type="file" style={{ display: 'none' }} />
                <Tooltip title="View" className="actionsIcons">
                    <UtrVendorDocumentUploadListView assetCode={assetCode} props={uploadedValue} recId={recordId} />
                </Tooltip>
            </>
        ),
        },
        
        {
          field: "vendorCategory",
          headerName: "Vendor Category",
          headerTooltip: "Vendor Category",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 160,
          minWidth: 140,
        },
        {
            field: "vendorNameCode",
            headerName: "Vendor Name Code",
            headerTooltip: "Vendor Name Code",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 160,
            minWidth: 140,
        },
        {
            field: "dateOfPayment",
            headerName: "Date of payment",
            headerTooltip: "Date of payment",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            cellRenderer: function (params) {
              var formattedDate = moment(params.value).format('DD/MM/YYYY');
              return formattedDate;
            },
            width: 150,
            minWidth: 120,
        },
       
        {
          field: "amount",
          headerName: "Amount",
          headerTooltip: "Amount",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 160,
          minWidth: 140,
        },
        {
            field: "utrNo",
            headerName: "UTR Number",
            headerTooltip: "UTR Number",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 160,
            minWidth: 140,
        },
        {
            field: "remark",
            headerName: "Remark",
            headerTooltip: "Remark",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 160,
            minWidth: 140,
        },
        {
            field: "poAmount",
            headerName: "PO Amount",
            headerTooltip: "PO Amount",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 160,
            minWidth: 140,
        },
        
        
        ];

  return (
    <>
        <div>
            <Box component="h2" className="page-title-heading my-6">
                Vendor UTR Details
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
                disabledStatus={true}
                pageType="propertyAdd"
                redirectSource={``}
                setAssetCode={setAssetCode}
                setMandateData={() => { }}
                setpincode={() => { }}
                setCurrentStatus={() => { }}
                setCurrentRemark={() => { }}
            />
            <div style={{display:'flex', justifyContent: 'flex-end' , marginBottom:"-35px"}}>
              <Box>
                  <GrAddCircle style={{ fontSize: 20, marginRight: 10 }} 
                    onClick={() => {handleClickOpen();setisEdit(false);}} 
                  />
              </Box>
            </div>




            <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center">
                    <Dialog
                        open={open}
                        // onClose={handleTransportVendorClose}
                        aria-describedby="alert-dialog-slide-description"
                        maxWidth="lg"
                        PaperProps={{
                            style: {
                                borderRadius: '27px',
                            },
                        }}
                    >
                      { isEdit ? 
                      <DialogTitle id="alert-dialog-title" className="title-model">
                        Update UTR Vendor Details
                      </DialogTitle> 
                      :
                        <DialogTitle id="alert-dialog-title" className="title-model">
                            Add UTR Vendor Details
                        </DialogTitle>  }
                        <DialogContent style={{ width: '450px',marginBottom: '30px' }}>
                            <div className="input-form">
                                <h2 className="phaseLable required"> Vendor Category</h2>
                                <TextField
                                    autoComplete="off"
                                    name="vendorCategory"
                                    id="vendorCategory"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={utrData?.vendorCategory || ''}
                                    onChange={handleUtrVendor}
                                    onKeyDown={(e: any) => {
                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                            e.preventDefault();
                                        }
                                        regExpressionRemark(e);
                                    }}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Spacial characters'));
                                        }
                                    }}
                                    // disabled
                                    // onBlur={handleBlur}
                                />
                                {error['vendorCategory'] !== undefined ? <p className="form-error" style={{marginTop: '0px'}}>{error['vendorCategory']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">Vendor Name Code</h2>
                                <TextField
                                    autoComplete="off"
                                    name="vendorNameCode"
                                    id="vendorNameCode"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={utrData?.vendorNameCode || ''}
                                    onChange={handleUtrVendor}
                                    onKeyDown={(e: any) => {
                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                            e.preventDefault();
                                        }
                                        regExpressionRemark(e);
                                    }}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Spacial characters'));
                                        }
                                    }}
                                   
                                />
                              {error['vendorNameCode'] !== undefined ? <p className="form-error"style={{marginTop: '0px'}}>{error['vendorNameCode']}</p> : null}  
                            </div>
                            <div className="input-form">
                              <h2 className="phaseLable " > Date of Payment</h2>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DesktopDatePicker
                                  // disabled={closureDateDisable}
                                  className="w-85"
                                  inputFormat="DD/MM/YYYY"
                                  value={utrData?.dateOfPayment}
                                  onChange={
                                    (newValue) =>setUtrData({...utrData,dateOfPayment: moment(new Date(newValue)).format()})
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      name="dateOfPayment"
                                      size="small"
                                      onKeyDown={(e: any) => e.preventDefault()}
                                    />
                                  )}
                                />
                              </LocalizationProvider>
                              
                            </div>
                            
                            <div className="input-form">
                                <h2 className="phaseLable required">Amount</h2>
                                <TextField
                                    autoComplete="off"
                                    name="amount"
                                    id="amount"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    
                                    value={utrData?.amount || ''}
                                    onChange={handleUtrVendor}
                                    onKeyDown={(e: any) => {
                                      if (e.target.selectionStart === 0 && e.code === 'Space') {
                                          e.preventDefault();
                                      }
                                  
                                      // Allow only numbers (0-9) and backspace
                                      const isNumericOrBackspace = /^[0-9\s]*$/.test(e.key) || e.code === 'Backspace';
                                  
                                      if (!isNumericOrBackspace) {
                                          e.preventDefault();
                                      }
                                  }}
                                  
                                    type='number'
                                    
                                />
                              {error['amount'] !== undefined ? <p className="form-error"style={{marginTop: '0px'}}>{error['amount']}</p> : null}  
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">UTR Number</h2>
                                <TextField
                                    autoComplete="off"
                                    name="utrNo"
                                    id="utrNo"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={utrData?.utrNo || ''}
                                    onChange={handleUtrVendor}
                                    onKeyDown={(e: any) => {
                                        
                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                            e.preventDefault();
                                        }
                                    }}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Spacial characters'));
                                        }
                                    }}
                                    // value={assetDataById[0]?.pinCode}
                                    // disabled
                                    // onBlur={handleBlur}
                                />
                              {error['utrNo'] !== undefined ? <p className="form-error" style={{marginTop: '0px'}}>{error['utrNo']}</p> : null}  
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">Remark</h2>
                                <textarea
                                    autoComplete="off"
                                    name="remark"
                                    id="remark"
                                    className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                                    value={utrData?.remark || ''}
                                    onChange={handleUtrVendor}
                                    onKeyDown={(e: any) => {
                                      if (e.target.selectionStart === 0 && e.code === 'Space') {
                                          e.preventDefault();
                                      }
                                      const isAlphanumeric = /^[a-zA-Z0-9\s, _]*$/; // Only allows letters, digits, and spaces
                                      const isValidInput = isAlphanumeric.test(e.key);

                                      if (!isValidInput) {
                                      e.preventDefault();
                                      }
                                  }}
                                    // value={assetDataById[0]?.pinCode}
                                    // disabled
                                    // onBlur={handleBlur}
                                />
                             {error['remark'] !== undefined ? <p className="form-error"style={{marginTop: '-4px'}}>{error['remark']}</p> : null}    
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable ">PO Amount</h2>
                                <TextField
                                    autoComplete="off"
                                    name="poAmount"
                                    id="poAmount"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    InputProps={{ inputProps: { min: 0, maxLength: 15 } }}
                                    value={utrData?.poAmount || ''}
                                    onChange={handleUtrVendor}
                                    type='number'
                                    onKeyDown={(e: any) => {
                                      if (e.target.selectionStart === 0 && e.code === 'Space') {
                                          e.preventDefault();
                                      }
                                  
                                      // Allow only numbers (0-9) and backspace
                                      const isNumericOrBackspace = /^[0-9\s]*$/.test(e.key) || e.code === 'Backspace';
                                  
                                      if (!isNumericOrBackspace) {
                                          e.preventDefault();
                                      }
                                  }}
                                  
                                    // onKeyDown={(e: any) => {
                                    //     blockInvalidChar(e);
                                    // }}
                                    // onPaste={(e: any) => {
                                    //     if (!textFieldValidationOnPaste(e)) {
                                    //         dispatch(fetchError('You can not paste Spacial characters'));
                                    //     }
                                    // }}
                                    // value={assetDataById[0]?.pinCode}
                                    // disabled
                                    // onBlur={handleBlur}
                                />
                                
                            </div>
                            <div>
                            <DialogActions className="button-wrap" style={{ marginTop: '7%' }}>
                              <Tooltip title="Submit" placement='top'>  
                                <Button className="yes-btn" onClick={() => handleSubmitUtrVendor()}>
                                    Submit
                                </Button>
                              </Tooltip>
                              <Tooltip title="Cancel" placement='top'>  
                                <Button className="no-btn" onClick={handleClose}>
                                    Cancel
                                </Button>
                              </Tooltip>
                            </DialogActions>
                            </div>
                        </DialogContent>


                    </Dialog>
                 
                 
                  </Grid>





             <div className="bottom-fix-history" style={{marginBottom: "-15px"}}>
              {(
                  <MandateStatusHistory
                    mandateCode={assetCode}
                    accept_Reject_Status={currentStatus}
                    accept_Reject_Remark={currentRemark}
                  />
                )}
              </div>

              <div className="bottom-fix-btn bg-pd"  >
                {/* <div className="remark-field"> */}
                <Tooltip title="Back">
                  <Button
                    variant="outlined"
                    size="small"
                    type="reset"
                    style={reset}
                    sx={{
                      padding: "2px 20px !important",
                      marginRight: "10px !important",
                      borderRadius: 6,
                      marginTop:"11px"
                    }}
                    // onClick={handleBackClick}
                  >
                    Back
                  </Button>
                </Tooltip>
                <Tooltip title="Proceed">
                  <Button
                    style={{
                      padding: "2px 20px",
                      borderRadius: 6,
                      color: "rgb(255, 255, 255)",
                      borderColor: "rgb(0, 49, 106)",
                      backgroundColor: "rgb(0, 49, 106)",
                      marginTop:"13px"
                    }}
                    variant="outlined"
                    size="small"
                    type="submit"
                  >
                    Proceed
                  </Button>
                </Tooltip>
                {/* </div> */}
              </div>
        </div>
        <CommonGrid
            defaultColDef={{ flex: 1 }}
            columnDefs={columnDefs}
            rowData={rowData}
            onGridReady={onGridReady}
            gridRef={gridRef}
            pagination={true}
            paginationPageSize={10}
        />
    </>
  )
}

export default VendorUTRDetails;