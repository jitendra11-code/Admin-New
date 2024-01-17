import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, SwipeableDrawer, Grid, IconButton, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import regExpressionTextField, { regExpressionRemark,regExpressionRemarkk, textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { DriveFolderUpload } from '@mui/icons-material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import InputQuotationFileUpload from './InputQuotationFileUpload';
import moment from 'moment';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';
import AssetInfo from 'pages/common-components/AssetInformation';
import React, { useCallback, useEffect, useState } from 'react';
import { GrAddCircle } from 'react-icons/gr';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchError, showMessage, showWarning } from 'redux/actions';
import InputQuotationViewList from 'pages/Mandate/Staff/Components/Actions/InputQuotationViewList';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import { secondaryButton } from 'shared/constants/CustomColor';
import { _validationMaxFileSizeUpload } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import AssetCodeDrawer from './AssetCodeDrawer';
import DeleteDialog from './DeleteDialog';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import { useAuthUser } from '@uikit/utility/AuthHooks';
const useStyles = makeStyles((theme) => ({
    greenButton: {
        width: 35,
        height: 35,
        color: 'white',
        backgroundColor: 'green',
        '&:hover, &:focus': {
            backgroundColor: 'darkgreen',
        },
    },
}));
const MAX_COUNT = 8;
function QuoteInput() {
    const exceptThisSymbols = ['e', 'E', '+', '-', '.'];
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { user } = useAuthUser();
    const [assetCode, setAssetCode] = useState<any>('');
    const [vertical, setVertical] = React.useState([]);
    const [transportVendor, setTransportVendor] = useState([]);
    const [installationVendor, setInstallationVendor] = useState([]);
    const [open, setOpen] = useState(false);
    const [tOpen, setTOpen] = useState(false);
    const [iOpen, setIOpen] = useState(false);
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const classes = useStyles();
    const [error, setError] = useState({});
    const [assetDetails, setassetDetails] = useState([]);
    const [sourceBranch, setsourceBranch] = useState([]);
    const [destinationBranch, setdestinationBranch] = useState([]);
    const [upload, setUpload] = React.useState(false);
    const [fileLimit, setFileLimit] = React.useState(false);
    const [formData, setformData] = useState({ id: 0, record_Id: null, fk_quote_id: 0, firmCompanyName: '', proporiterSPOCName: '', address: '', mobileNumber: '', emailID: '', gstNumber: '', totalQuotedAmount: '', vendorCategory: '', status: '' });
    const [fileLength, setFileLength] = React.useState(0);
    const [isEdit, setisEdit] = useState(false);
    const [view, setview] = useState(false);
    const [editId, seteditId] = useState(null);
    const [params, setParams] = useState(null);
    const [addedUpdatedVendor, setaddedUpdatedVendor] = useState([]);
    const [assetDataById, setAssetDataById] = useState([]);
    const [assetDrawerData, setAssetDrawerData] = React.useState(null);
    const [openDrawerAssetCode, setOpenDrawerAssetCode] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [assetRequestNo, setassetRequestNo] = useState('');
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const fileInput = React.useRef(null);
    const getHeightForAssetTable = useCallback(() => {
        const dataLength = assetDetails ? assetDetails.length : 0;
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
    }, [assetDetails]);
    const getHeightForTransportTable = useCallback(() => {
        const dataLength = transportVendor ? transportVendor.length : 0;
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
    }, [transportVendor]);
    const getHeightForInstallationTable = useCallback(() => {
        const dataLength = installationVendor ? installationVendor.length : 0;
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
    }, [installationVendor]);
    useEffect(() => {
        if (id && id != 'noid') {
            console.log('###', id, assetCode);
            setAssetCode(id);
        }
    }, [id]);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=VerticalMaster`)
            .then((response: any) => {
                setVertical(response?.data?.data || []);
            })
            .catch((e: any) => {});
    }, []);
    const getAssetById = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestById?id=${id}`)
            .then((response: any) => {
                if (response && response?.data) {
                    setAssetDataById(response?.data);
                }
            })
            .catch((e: any) => {});
    };

    React.useEffect(() => {
        if (id && id != 'id') {
            getAssetById(id);
        }
    }, [id]);
    useEffect(() => {
        if (assetDataById[0]?.fk_from_branch_id || id) {
            if (assetDataById[0]?.fk_to_branch_id) getSourceBranch();
        }
    }, [assetDataById[0]?.fk_from_branch_id, id]);
    useEffect(() => {
        if (assetDataById[0]?.fk_to_branch_id || id) {
            getDestinationBranch();
        }
    }, [assetDataById[0]?.fk_to_branch_id, id]);
    useEffect(() => {
        if (id && id != 'id') {
            getAssetDetails(id);
            getTranportVendor(id);
        }
    }, [id]);

    const getDestinationBranch = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/branchmaster/GetBranchMasterDetails?Id=${assetDataById[0]?.fk_to_branch_id}&FK_Branch_Admin=${encodeURIComponent('')}&FK_Regional_Manger=${encodeURIComponent('')}&FK_Location_Coordinator=${encodeURIComponent('')}`)
            .then((response: any) => {
                console.log('setdestinationBranch', response);
                setdestinationBranch(response?.data || []);
            })
            .catch((e: any) => {});
    };
    const getSourceBranch = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/branchmaster/GetBranchMasterDetails?Id=${assetDataById[0]?.fk_from_branch_id}&FK_Branch_Admin=${encodeURIComponent('')}&FK_Regional_Manger=${encodeURIComponent('')}&FK_Location_Coordinator=${encodeURIComponent('')}`)
            .then((response: any) => {
                console.log('sourceBranch', response);
                setsourceBranch(response?.data || []);
            })
            .catch((e: any) => {});
    };
    const getAssetDetails = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestMovementDetailsByAssetId?assetId=${id}&assetcode=''`)
            .then((response: any) => {
                console.log('setassetDetails', response);
                setassetDetails(response?.data || []);
            })
            .catch((e: any) => {});
    };
    const getTranportVendor = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AssetQuotation/GetVendorDetailsById?requestid=${id}`)
            .then((response: any) => {
                console.log('allVendor', response);
                const Transport = response?.data?.filter((item) => item?.vendorCategory === 'Transport Vendor');
                const Installation = response?.data?.filter((item) => item?.vendorCategory === 'Installation Vendor');
                setTransportVendor(Transport || []);
                setInstallationVendor(Installation || []);
            })
            .catch((e: any) => {});
    };
    const submitVendor = (id, upload = false) => {
        const vendorArray = [...transportVendor, ...installationVendor];
        const payload = vendorArray.filter((item) => item?.id === 0 || item?.isEdit === true);
        const removeEdit = payload.map(({ ['isEdit']: _, ...rest }) => rest);
        const body = removeEdit.map((item) => ({ ...item, fk_quote_id: id }));
        console.log('UUU', upload, vendorArray, payload, removeEdit, body);
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/AssetQuotation/InsertUpdateVendorDetails`, body)
            .then((response) => {
                if (!response) return;
                if (!upload && response && response?.status === 200) {
                    dispatch(showMessage('vendor submit Successfully!'));
                    navigate('/AssetQuoteInputList');
                }
                setUpload(false);
            })
            .catch((err) => console.log('error'));
    };
    const submitAsset = (id) => {
        const payload = assetDetails?.map((item, index) => ({
            id: 0,
            uid: 'string',
            fk_quote_id: id,
            fk_movement_id: item?.id,
            quote_details_remarks: 'string',
            quote_details_status: 'string',
            quote_details_surrent_remarks: 'string',
            status: 'Active',
            createdby: user?.UserName,
            createddate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            modifiedby: user?.UserName,
            modifieddate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
        }));

        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/AssetQuotation/InsertUpdateAssetQuoteDetails`, payload)
            .then((response) => {
                if (!response) return;
                if (response && response?.status === 200) {
                    //    getQuoteId();
                }
                // setTOpen(false);
            })
            .catch((err) => console.log('error'));
    };
    const submitAllVendor = (upload = false) => {
        if ((!upload && transportVendor?.length < 2) || installationVendor?.length < 2) {
            dispatch(fetchError('Minimum 2 Transport Vendor and 2 Installation Vendor Required'));
            return;
        }
        const payload = [
            {
                id: 0,
                uid: 'string',
                quote_no: 'string',
                quote_remarks: 'string',
                fk_request_id: id,
                status: 'Active',
                createdby: user?.UserName,
                createddate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                modifiedby: user?.UserName,
                modifieddate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            },
        ];
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/AssetQuotation/InsertUpdateAssetQuotation`, payload)
            .then((response) => {
                if (!response) return;
                if (response && response?.status === 200) {
                    console.log('Quote  id', response);
                    if (!upload) submitAsset(response?.data?.data?.[0]?.id);
                    submitVendor(response?.data?.data?.[0]?.id, upload);
                }
                // setTOpen(false);
            })
            .catch((err) => console.log('error'));
    };
    function Validation() {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
        let gstRegex = /^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/;
        const specialChars = /[!#$%^&*()+=\[\]{}\\|<>\/?]+/;
        if (formData?.firmCompanyName?.trim() == '') {
            error['firmCompanyName'] = 'Please enter Firm/Company Name';
        } else {
            delete error['firmCompanyName'];
        }
        if (formData?.proporiterSPOCName?.trim() == '') {
            error['proporiterSPOCName'] = 'Please enter Proprietor/SPOC Name';
        } else {
            delete error['proporiterSPOCName'];
        }
        if (formData?.address?.trim() == '') {
            error['address'] = 'Please enter Address';
        } else {
            delete error['address'];
        }
        if (formData?.totalQuotedAmount == '') {
            error['totalQuotedAmount'] = 'Please enter Total Quoted Amount';
        } else {
            delete error['totalQuotedAmount'];
        }
        if (formData?.mobileNumber == '') {
            error['mobileNumber'] = 'Please enter Mobile Number';
        } else if (formData?.mobileNumber?.[0] == '-') {
            error['mobileNumber'] = 'Invalid Mobile Number';
        } else if (formData?.mobileNumber?.[0] !== '6' && formData?.mobileNumber?.[0] !== '7' && formData?.mobileNumber?.[0] !== '8' && formData?.mobileNumber?.[0] !== '9') {
            error['mobileNumber'] = 'Mobile Number should start with 6,7,8,9';
        } else if (formData?.mobileNumber && formData?.mobileNumber?.length !== 10) {
            error['mobileNumber'] = 'Mobile Number must be 10 digits';
        } else {
            delete error['mobileNumber'];
        }
        if (formData?.gstNumber == '') {
            delete error['gstNumber'];
        } else if (!gstRegex.test(formData?.gstNumber)) {
            error['gstNumber'] = 'Please enter valid GST Number';
        } else if (formData?.gstNumber?.length < 15) {
            error['gstNumber'] = 'Please enter 15 digits GST Number';
        } else {
            delete error['gstNumber'];
        }

        if (!emailRegex.test(formData?.emailID)) {
            error['emailID'] = 'Please enter valid Email ID';
        } else if (specialChars.test(formData?.emailID)) {
            error['emailID'] = 'Please enter valid Email ID';
        } else {
            delete error['emailID'];
        }
        setError({ ...error });
        return error;
    }

    const handleSubmitVendor = (category) => {
        const errors = Validation();
        console.log('Vndor Error', errors, transportVendor);
        if (errors && Object.keys(errors).length > 0) return;

        const payload = { ...formData, id: isEdit ? editId : 0, fk_quote_id: 1, vendorCategory: category, status: 'Active', createdby: user?.UserName, createddate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'), modifiedby: user?.UserName, modifieddate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS') };
        if (category === 'Transport Vendor') {
            if (isEdit) {
                const index = params?.rowIndex;
                const trans = [...transportVendor];
                trans[index] = { ...payload, isEdit: true };
                setTransportVendor(trans);
            } else {
                setTransportVendor([...transportVendor, payload]);
            }
            setTOpen(false);
        }
        if (category === 'Installation Vendor') {
            if (isEdit) {
                const index = params?.rowIndex;
                const trans = [...installationVendor];
                trans[index] = { ...payload, isEdit: true };
                setInstallationVendor(trans);
            } else {
                setInstallationVendor([...installationVendor, payload]);
            }
            setIOpen(false);
        }

        if (isEdit) {
            dispatch(showMessage('vendor updated successfully'));
            setisEdit(false);
            seteditId(null);
        } else {
            dispatch(showMessage('vendor added successfully'));
        }
        setformData({ id: 0, record_Id: null, fk_quote_id: 0, firmCompanyName: '', proporiterSPOCName: '', address: '', mobileNumber: '', emailID: '', gstNumber: '', totalQuotedAmount: '', vendorCategory: '', status: '' });
    };
    const handleClickVendorOpen = () => {
        setOpen(true);
    };
    const handleClickTransportVendorOpen = () => {
        setTOpen(true);
    };
    const handleClickInstallVendorOpen = () => {
        setIOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleTransportVendorClose = () => {
        setTOpen(false);
        setError({});
        setformData({ id: 0, record_Id: null, fk_quote_id: 0, firmCompanyName: '', proporiterSPOCName: '', address: '', mobileNumber: '', emailID: '', gstNumber: '', totalQuotedAmount: '', vendorCategory: '', status: '' });
    };
    const handleInstallClose = () => {
        setIOpen(false);
        setError({});
        setformData({ id: 0, record_Id: null, fk_quote_id: 0, firmCompanyName: '', proporiterSPOCName: '', address: '', mobileNumber: '', emailID: '', gstNumber: '', totalQuotedAmount: '', vendorCategory: '', status: '' });
    };

    const handleChangeContactno = (e: any) => {
        const { name, value } = e.target;
        setformData({ ...formData, [name]: value });
    };

    const handleChangeGstNo = (e: any) => {
        const { name, value } = e.target;
        setformData({ ...formData, [name]: value });
    };

    const handleChangeEmail = (e: any) => {
        const { name, value } = e.target;
        setformData({ ...formData, [name]: value });
    };
    // const handleFileEvent = (e) => {
    //     console.log('handleFileEvent', params);
    //     const chosenFiles = Array.prototype.slice.call(e.target.files);
    //     // setParams(params);
    //     if (_validationMaxFileSizeUpload(e, dispatch)) {
    //         params?.data?.record_Id == null ? handleUploadFilesByGetRecId(e, chosenFiles, params) : handleUploadFiles(e, chosenFiles, params?.data?.record_Id);
    //     }
    // };
    // const handleUploadFilesByGetRecId = (e, files, paramss) => {
    //     axios
    //         .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetRecordId`)
    //         .then((response: any) => {
    //             if (!response) return;
    //             console.log('recId', response);
    //             if (response && response?.data && response?.data && response?.status === 200) {
    //                 var recId = response?.data;
    //                 handleUploadFiles(e, files, recId, paramss);
    //             } else {
    //                 e.target.value = null;
    //                 dispatch(fetchError('Error Occurred !'));
    //                 return;
    //             }
    //         })
    //         .catch((e: any) => {
    //             dispatch(fetchError('Error Occurred !'));
    //         });
    // };
    // const handleUploadFiles = async (e, files, recId, paramss = null) => {
    //     const uploaded = [...uploadedFiles];
    //     let limitExceeded = false;
    //     files &&
    //         files?.some((file) => {
    //             if (uploaded && uploaded?.findIndex((f) => f.name === file.name) === -1) {
    //                 uploaded.push(file);
    //                 if (uploaded?.length === MAX_COUNT) setFileLimit(true);
    //                 if (uploaded?.length > MAX_COUNT) {
    //                     dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));
    //                     setFileLimit(false);
    //                     limitExceeded = true;
    //                     return;
    //                 }
    //             }
    //         });

    //     if (limitExceeded) {
    //         dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));

    //         return;
    //     }
    //     if (!limitExceeded) setUploadedFiles(uploaded);
    //     setFileLength((uploaded && uploaded?.length) || 0);
    //     const formData: any = new FormData();
    //     formData.append('mandate_id', id || 0);
    //     formData.append('documenttype', 'asset_quote_input_transport_vendor_details');
    //     formData.append('CreatedBy', '');
    //     formData.append('ModifiedBy', '');
    //     formData.append('entityname', 'Asset Quotation');
    //     formData.append('RecordId', recId || 0);
    //     formData.append('remarks', '');
    //     for (var key in uploaded) {
    //         await formData.append('file', uploaded[key]);
    //     }

    //     if (uploaded?.length === 0) {
    //         setUploadedFiles([]);
    //         setFileLimit(false);
    //         dispatch(fetchError('Error Occurred !'));
    //         return;
    //     }
    //     if (formData) {
    //         dispatch(showWarning('Upload is in progress, please check after sometime'));

    //         axios
    //             .post(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`, formData)
    //             .then((response: any) => {
    //                 e.target.value = null;
    //                 if (!response) {
    //                     setUploadedFiles([]);
    //                     setFileLimit(false);
    //                     dispatch(fetchError('Error Occurred !'));
    //                     return;
    //                 }
    //                 if (response?.data?.data == null) {
    //                     setUploadedFiles([]);
    //                     setFileLimit(false);
    //                     dispatch(fetchError('Documents are not uploaded!'));
    //                     // getVersionHistoryData();
    //                     return;
    //                 } else if (response?.status === 200) {
    //                     console.log('paramssssss', paramss);
    //                     if (paramss != null) {
    //                         if (paramss?.data?.vendorCategory == 'Transport Vendor') {
    //                             const index = paramss?.rowIndex;
    //                             const trans = [...transportVendor];
    //                             trans[index] = { ...trans[index], record_Id: recId };
    //                             console.log('@@@###', trans);
    //                             setTransportVendor(trans);
    //                         } else if (paramss?.data?.vendorCategory == 'Installation Vendor') {
    //                             const index = paramss?.rowIndex;
    //                             const install = [...installationVendor];
    //                             install[index] = { ...install[index], record_Id: recId };
    //                             setInstallationVendor(install);
    //                         }
    //                     }
    //                     setUploadedFiles([]);
    //                     setFileLimit(false);
    //                     dispatch(showMessage('Documents are uploaded successfully!'));
    //                     // getVersionHistoryData();
    //                 }
    //             })
    //             .catch((e: any) => {
    //                 dispatch(fetchError('Error Occurred !'));
    //             });
    //     }
    // };
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
                    <Tooltip title="Edit" className="actionsIcons">
                        <EditIcon
                            fontSize="medium"
                            style={{
                                cursor: 'pointer',
                                fontSize: '20px',
                                color: '#000',
                            }}
                            onClick={(e) => {
                                console.log('parr', params);
                                setformData({ ...params?.data });
                                setisEdit(true);
                                seteditId(params?.data?.id);
                                setParams(params);
                                if (params?.data?.vendorCategory === 'Transport Vendor') {
                                    setTOpen(true);
                                } else {
                                    setIOpen(true);
                                }
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Delete" className="actionsIcons">
                        <DeleteDialog params={params} id={id} transportVendor={transportVendor} setTransportVendor={setTransportVendor} installationVendor={installationVendor} setInstallationVendor={setInstallationVendor} getTranportVendor={getTranportVendor} />
                    </Tooltip>
                    <Tooltip title="Upload" className="actionsIcons">
                        <InputQuotationFileUpload
                            assetCode={assetRequestNo}
                            params={params}
                            id={id}
                            transportVendor={transportVendor}
                            setTransportVendor={setTransportVendor}
                            installationVendor={installationVendor}
                            setInstallationVendor={setInstallationVendor}
                            submitAllVendor={submitAllVendor}
                            upload={upload}
                            setUpload={setUpload}
                            docType={'Input'}
                        />
                    </Tooltip>

                    <Tooltip title="View" className="actionsIcons">
                        <InputQuotationViewList assetCode={assetRequestNo} props={params} recId={params?.data?.record_Id} />
                    </Tooltip>
                </>
            ),
        },
        {
            field: 'firmCompanyName',
            headerName: 'Firm/Company Name',
            headerTooltip: 'Firm/Company Name',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'proporiterSPOCName',
            headerName: 'Proprietor/SPOC Name',
            headerTooltip: 'Proprietor/SPOC Name',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'address',
            headerName: 'Address',
            headerTooltip: 'Address',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'mobileNumber',
            headerName: 'Mobile Number',
            headerTooltip: 'Mobile Number',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'emailID',
            headerName: 'Email ID',
            headerTooltip: 'Email ID',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'gstNumber',
            headerName: 'GST Number',
            headerTooltip: 'GST Number',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'totalQuotedAmount',
            headerName: 'Total Quoted Amount',
            headerTooltip: 'Total Quoted Amount',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
    ];

    let columnDefs1 = [
        {
            field: 'assetCode',
            headerName: 'Asset Code',
            headerTooltip: 'Asset Code',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
            cellRenderer: (params) => {
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                return (
                    <a
                        href="#"
                        style={{ color: 'blue' }}
                        onClick={() => {
                            setAssetDrawerData(params?.data);
                            setOpenDrawerAssetCode(!openDrawerAssetCode);
                        }}
                    >
                        {params?.data?.assetCode}
                    </a>
                );
            },
        },
        {
            field: 'assetType',
            headerName: 'Asset Type',
            headerTooltip: 'Asset Type',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'assetCategorisation',
            headerName: 'Asset categorization',
            headerTooltip: 'Asset categorization',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'assetClassDescription',
            headerName: 'Asset Class Description',
            headerTooltip: 'Asset Class Description',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'asset_description',
            headerName: 'Asset Description',
            headerTooltip: 'Asset Description',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'paV_Location',
            headerName: 'PAV Location',
            headerTooltip: 'PAV Location',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'book_val',
            headerName: 'Book Value',
            headerTooltip: 'Book Value',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'balance_Useful_life_as_per_Finance',
            headerName: 'Balance Useful Life As Per Finance',
            headerTooltip: 'Balance Useful Life As Per Finance',
            sortable: true,
            resizable: true,
            width: 60,
            minWidth: 60,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'balance_Useful_life_as_per_Admin',
            headerName: 'Balance Useful Life As Per Finance',
            headerTooltip: 'Balance Useful Life As Per Finance',
            sortable: true,
            resizable: true,
            width: 60,
            minWidth: 60,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'used_Unused',
            headerName: 'Used/Unused',
            headerTooltip: 'Used/Unused',
            sortable: true,
            resizable: true,
            width: 60,
            minWidth: 60,
            cellStyle: { fontSize: '13px' },
        },
    ];

    function onGridReady(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridApi(params.api);
    }

    // const handleVendor = (e) => {
    //     const { name, value } = e?.target;
      
    //     // Restrict special characters
    //     if (/[^A-Za-z\s]/.test(value)) {
    //       // If the value contains any special character, don't update the state
    //       return;
    //     }
      
    //     // Handle specific conditions for 'totalQuotedAmount'
    //     if (name === 'totalQuotedAmount') {
    //       if (value[0] === '0' || value?.length > 10) return;
    //     }
      
    //     setformData({ ...formData, [name]: value });
    //   };
      
    const handleVendor = (e) => {
        const { name, value } = e?.target;
        console.log('!!!', value);
        if (name == 'totalQuotedAmount') {
            if (value[0] == '0' || value?.length > 10) return;
        }
        setformData({ ...formData, [name]: value });
    };
    console.log('@@##', transportVendor, installationVendor);
    console.log('AAA', assetCode, assetRequestNo);
    return (
        <>
            <Grid
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0px',
                    marginTop: '-8px !important',
                }}
            >
                <Box component="h2" className="page-title-heading my-0">
                    Input Quotation
                </Box>
                {/* <Stack
          display="flex"
          alignItems="flex-end"
          justifyContent="space-between"
          flexDirection="row"
          sx={{ mb: -2 }}
        >
          <Button
            size="small"
            style={primaryButtonSm}
            sx={{ color: "#fff", fontSize: "12px" }}
            onClick={handleClickVendorOpen}
          >
            Add Vendor
          </Button>
        </Stack> */}
            </Grid>
            <div className="card-panal inside-scroll-201" style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <AssetInfo setassetRequestNo={setassetRequestNo} assetCode={assetCode} disabledStatus={false} source="" pageType="propertyAdd" redirectSource={``} setAssetCode={setAssetCode} setMandateData={() => {}} setpincode={() => {}} setCurrentStatus={() => {}} setCurrentRemark={() => {}} />

                <Stack display="flex" alignItems="flex-end" justifyContent="space-between" flexDirection="row" sx={{ mb: -2 }}>
                    <Box>
                        <h5>Asset Details</h5>
                    </Box>
                </Stack>
                <div className="ag-theme-alpine" style={{ height: getHeightForAssetTable(), marginTop: '10px' }}>
                    <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs1} rowData={assetDetails || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                </div>
                <hr style={{ marginTop: 10 }} />
                <Grid marginBottom="0px" marginTop="0px" container item spacing={3} justifyContent="start" alignSelf="center">
                    <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                        <div className="approval-table pl-0">
                            <Table
                                sx={{
                                    '&:last-child td, &:last-child th': {
                                        border: '1px solid rgba(0, 0, 0, 0.12)',
                                    },
                                    mt: 0,
                                    mb: 0,
                                }}
                                aria-label="spanning table"
                            >
                                <TableHead>
                                    <TableRow sx={{ lineHeight: '0.5rem' }}>
                                        <TableCell align="center" colSpan={2}>
                                            Source Branch
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align="center" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                                            Field
                                        </TableCell>
                                        <TableCell align="center" className="w-75" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                                            Values
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="field-bold">Vertical & Region</TableCell>
                                        <TableCell className="w-75">{sourceBranch?.[0]?.region}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">State</TableCell>
                                        <TableCell className="w-75">{sourceBranch?.[0]?.state}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">Branch Name</TableCell>
                                        <TableCell className="w-75">{sourceBranch?.[0]?.branch_Name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">Address & PIN Code</TableCell>
                                        <TableCell className="w-75" align="left">
                                            {sourceBranch?.length ? sourceBranch?.[0]?.address + ',\xa0\xa0' + sourceBranch?.[0]?.pincode : ''}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">Branch SPOC & Phone</TableCell>
                                        <TableCell className="w-75"> {sourceBranch?.length ? sourceBranch?.[0]?.branch_SPOC + ',\xa0\xa0' + sourceBranch?.[0]?.contact_Person_Phone : ''}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Grid>
                    <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                        <div className="approval-table pl-0">
                            <Table
                                sx={{
                                    '&:last-child td, &:last-child th': {
                                        border: '1px solid rgba(0, 0, 0, 0.12)',
                                    },
                                    mt: 0,
                                    mb: 0,
                                }}
                                aria-label="spanning table"
                            >
                                <TableHead>
                                    <TableRow sx={{ lineHeight: '0.5rem' }}>
                                        <TableCell align="center" colSpan={2}>
                                            Destination Branch
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align="center" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                                            Field
                                        </TableCell>
                                        <TableCell align="center" className="w-75" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                                            Values
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="field-bold">Vertical & Region</TableCell>
                                        <TableCell className="w-75">{destinationBranch?.[0]?.region}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">State</TableCell>
                                        <TableCell className="w-75">{destinationBranch?.[0]?.state}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">Branch Name</TableCell>
                                        <TableCell className="w-75">{destinationBranch?.[0]?.branch_Name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">Address & PIN Code</TableCell>
                                        <TableCell className="w-75" align="left">
                                            {destinationBranch?.length ? destinationBranch?.[0]?.address + ',\xa0\xa0' + destinationBranch?.[0]?.pincode : ''}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">Branch SPOC & Phone</TableCell>
                                        <TableCell className="w-75">{destinationBranch?.length ? destinationBranch?.[0]?.branch_SPOC + ',\xa0\xa0' + destinationBranch?.[0]?.contact_Person_Phone : ''}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Grid>
                </Grid>
                <hr style={{ marginTop: 10 }} />
                <Grid marginBottom="-5px" marginTop="0px" container item spacing={3} justifyContent="start" alignSelf="center">
                    <Grid item xs={6} md={12} sx={{ position: 'relative' }}>
                        <Stack display="flex" alignItems="flex-start" justifyContent="space-between" flexDirection="row" sx={{ mb: -2 }}>
                            <Box>
                                <h5>Transport Vendor</h5>
                            </Box>
                            <Box>
                                <GrAddCircle style={{ fontSize: 20, marginRight: 10 }} onClick={handleClickTransportVendorOpen} />
                            </Box>
                        </Stack>
                        {/* <Stack
          display="flex"
          alignItems="flex-end"
          justifyContent="space-between"
          flexDirection="row"
          sx={{ mb: -2 }}
        >
          <Button
            size="small"
            style={primaryButtonSm}
            sx={{ color: "#fff", fontSize: "12px" }}
            onClick={handleClickVendorOpen}
          >
            Add
          </Button>
        </Stack> */}
                        <div className="ag-theme-alpine" style={{ height: getHeightForTransportTable(), marginTop: '10px' }}>
                            <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={transportVendor || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                        </div>
                    </Grid>
                    <Grid item xs={6} md={12} sx={{ position: 'relative' }}>
                        <Stack display="flex" alignItems="flex-start" justifyContent="space-between" flexDirection="row" sx={{ mb: -2 }}>
                            <Box>
                                <h5>Installation/Service Vendor</h5>
                            </Box>
                            <Box>
                                <GrAddCircle style={{ fontSize: 20, marginRight: 10 }} onClick={handleClickInstallVendorOpen} />
                            </Box>
                        </Stack>
                        {/* <Stack
          display="flex"
          alignItems="flex-end"
          justifyContent="space-between"
          flexDirection="row"
          sx={{ mb: -2 }}
        >
          <Button
            size="small"
            style={primaryButtonSm}
            sx={{ color: "#fff", fontSize: "12px" }}
            onClick={handleClickVendorOpen}
          >
            Add
          </Button>
        </Stack> */}
                        <div className="ag-theme-alpine" style={{ height: getHeightForInstallationTable(), marginTop: '10px' }}>
                            <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={installationVendor || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                        </div>
                    </Grid>
                </Grid>

                <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center">
                    <Dialog
                        open={tOpen}
                        onClose={handleTransportVendorClose}
                        aria-describedby="alert-dialog-slide-description"
                        maxWidth="lg"
                        PaperProps={{
                            style: {
                                borderRadius: '27px',
                            },
                        }}
                    >
                        <DialogTitle id="alert-dialog-title" className="title-model">
                            Add Transport Vendor
                        </DialogTitle>
                        <DialogContent style={{ width: '450px' }}>
                            <div className="input-form">
                                <h2 className="phaseLable required">Firm/Company Name</h2>
                                <TextField
                                    autoComplete="off"
                                    name="firmCompanyName"
                                    id="firmCompanyName"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={formData?.firmCompanyName || ''}
                                    onChange={handleVendor}

                                    //first change

                                    onKeyDown={(e: any) => {
                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                            e.preventDefault();
                                        }
                                        regExpressionRemarkk(e);
                                    }}
                                      
                                    
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Spacial characters'));
                                        }
                                    }}
                                    // disabled
                                    // onBlur={handleBlur}
                                />
                                {error['firmCompanyName'] !== undefined ? <p className="form-error">{error['firmCompanyName']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">Proprietor/SPOC Name</h2>
                                <TextField
                                    autoComplete="off"
                                    name="proporiterSPOCName"
                                    id="proporiterSPOCName"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={formData?.proporiterSPOCName || ''}
                                    onChange={handleVendor} 


                                    //second part
                                    onKeyDown={(e: any) => {
                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                            e.preventDefault();
                                        }
                                        regExpressionRemarkk(e);
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
                                {error['proporiterSPOCName'] !== undefined ? <p className="form-error">{error['proporiterSPOCName']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">Address</h2>
                                <textarea
                                    autoComplete="off"
                                    name="address"
                                    id="address"
                                    className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                                    value={formData?.address || ''}
                                    onChange={handleVendor}
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
                                {error['address'] !== undefined ? <p className="form-error">{error['address']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">Mobile Number</h2>
                                <TextField
                                    autoComplete="off"
                                    name="mobileNumber"
                                    id="mobileNumber"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    InputProps={{ inputProps: { min: 0, maxLength: 10 } }}
                                    value={formData?.mobileNumber || ''}
                                    onChange={(e) => e.target.value.length <= 10 && +e.target.value >= 0 && handleChangeContactno(e)}
                                    onKeyDown={(e: any) => {
                                        regExpressionTextField(e);
                                        blockInvalidChar(e);
                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                    }}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Spacial characters'));
                                        }
                                    }}

                                    // disabled
                                    // onBlur={handleBlur}
                                />
                                {error['mobileNumber'] !== undefined ? <p className="form-error">{error['mobileNumber']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">Email ID</h2>
                                <TextField
                                    autoComplete="off"
                                    name="emailID"
                                    id="emailID"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={formData?.emailID || ''}
                                    onChange={handleChangeEmail}
                                    onKeyDown={(e: any) => {
                                        if (e.key === '@' || e.key === '.') {
                                            return;
                                        }
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
                                {error['emailID'] !== undefined ? <p className="form-error">{error['emailID']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable ">GST Number</h2>
                                <TextField
                                    autoComplete="off"
                                    name="gstNumber"
                                    id="gstNumber"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    InputProps={{ inputProps: { min: 0, maxLength: 15 } }}
                                    value={formData?.gstNumber || ''}
                                    onChange={handleChangeGstNo}
                               //third change
                                    onKeyDown={(e: any) => {
                                        const restrictSpecialChars = (e) => {
                                          // Check if the pressed key is not alphanumeric or is a special symbol
                                        //   if (!/^[A-Za-z0-9]$/.test(e.key) || /[!@#$%^&*()_+={}\[\]:;<>,.?~\\/]/.test(e.key)) {
                                            if (!/^[A-Za-z0-9]+$/.test(e.key) ) {
                                            e.preventDefault();
                                          }
                                        };
                                      
                                        restrictSpecialChars(e);
                                      }}
                                      
                                    
                                   
                                    //  onKeyDown={(e: any) => {
                                    //     blockInvalidChar(e);
                                    // }}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Spacial characters'));
                                        }
                                    }}
                                    // value={assetDataById[0]?.pinCode}
                                    // disabled
                                    // onBlur={handleBlur}
                                />
                                {error['gstNumber'] !== undefined ? <p className="form-error">{error['gstNumber']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">Total Quoted Amount</h2>
                                <TextField
                                    autoComplete="off"
                                    name="totalQuotedAmount"
                                    id="totalQuotedAmount"
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    className="w-85"
                                    value={formData?.totalQuotedAmount || ''}
                                    onChange={handleVendor}
                                    onKeyDown={(e) => exceptThisSymbols.includes(e.key) && e.preventDefault()}
                                    onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
                                    // value={assetDataById[0]?.pinCode}
                                    // disabled
                                    // onBlur={handleBlur}
                                />
                                {error['totalQuotedAmount'] !== undefined ? <p className="form-error">{error['totalQuotedAmount']}</p> : null}
                            </div>
                        </DialogContent>
                        <DialogActions className="button-wrap" style={{ marginTop: '7%' }}>
                            <Tooltip title="Submit" placement="top">
                                <Button className="yes-btn" onClick={() => handleSubmitVendor('Transport Vendor')}>
                                    Submit
                                </Button>
                            </Tooltip>
                            <Tooltip title="Cancel" placement="top">
                                <Button className="no-btn" onClick={handleTransportVendorClose}>
                                    Cancel
                                </Button>
                            </Tooltip>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        open={iOpen}
                        onClose={handleInstallClose}
                        aria-describedby="alert-dialog-slide-description"
                        maxWidth="lg"
                        PaperProps={{
                            style: {
                                borderRadius: '27px',
                            },
                        }}
                    >
                        <DialogTitle id="alert-dialog-title" className="title-model">
                            Add Installation/Service Vendor
                        </DialogTitle>
                        <DialogContent style={{ width: '450px' }}>
                            <div className="input-form">
                                <h2 className="phaseLable required">Firm/Company Name</h2>
                                <TextField
                                    autoComplete="off"
                                    name="firmCompanyName"
                                    id="firmCompanyName"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={formData?.firmCompanyName || ''}
                                    onChange={handleVendor}
                                    onKeyDown={(e: any) => {
                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                            e.preventDefault();
                                        }
                                        regExpressionRemarkk(e);
                                    }}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Spacial characters'));
                                        }
                                    }}
                                    // disabled
                                    // onBlur={handleBlur}
                                />
                                {error['firmCompanyName'] !== undefined ? <p className="form-error">{error['firmCompanyName']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">Proprietor/SPOC Name</h2>
                                <TextField
                                    autoComplete="off"
                                    name="proporiterSPOCName"
                                    id="proporiterSPOCName"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={formData?.proporiterSPOCName || ''}
                                    onChange={handleVendor}
                                    onKeyDown={(e: any) => {
                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                            e.preventDefault();
                                        }
                                        regExpressionRemarkk(e);
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
                                {error['proporiterSPOCName'] !== undefined ? <p className="form-error">{error['proporiterSPOCName']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">Address</h2>
                                <textarea
                                    autoComplete="off"
                                    name="address"
                                    id="address"
                                    className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                                    value={formData?.address || ''}
                                    onChange={handleVendor}
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
                                {error['address'] !== undefined ? <p className="form-error">{error['address']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">Mobile Number</h2>
                                <TextField
                                    autoComplete="off"
                                    name="mobileNumber"
                                    id="mobileNumber"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    InputProps={{ inputProps: { min: 0, maxLength: 10 } }}
                                    value={formData?.mobileNumber || ''}
                                    onChange={(e) => e.target.value.length <= 10 && +e.target.value >= 0 && handleChangeContactno(e)}
                                    onKeyDown={(e: any) => {
                                        regExpressionTextField(e);
                                        blockInvalidChar(e);
                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
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
                                {error['mobileNumber'] !== undefined ? <p className="form-error">{error['mobileNumber']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">Email ID</h2>
                                <TextField
                                    autoComplete="off"
                                    name="emailID"
                                    id="emailID"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={formData?.emailID || ''}
                                    onChange={handleChangeEmail}
                                    onKeyDown={(e: any) => {
                                        if (e.key === '@' || e.key === '.') {
                                            return;
                                        }
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

                                {error['emailID'] !== undefined ? <p className="form-error">{error['emailID']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable ">GST Number</h2>
                                <TextField
                                    autoComplete="off"
                                    name="gstNumber"
                                    id="gstNumber"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    InputProps={{ inputProps: { min: 0, maxLength: 15 } }}
                                    value={formData?.gstNumber || ''}
                                    onChange={handleChangeGstNo}

                                    //forth part
                                    onKeyDown={(e: any) => {
                                        const restrictSpecialChars = (e) => {
                                          // Check if the pressed key is not alphanumeric or is a special symbol
                                        //   if (!/^[A-Za-z0-9]$/.test(e.key) || /[!@#$%^&*()_+={}\[\]:;<>,.?~\\/]/.test(e.key)) {
                                            if (!/^[A-Za-z0-9]+$/.test(e.key) ) {
                                            e.preventDefault();
                                          }
                                        };
                                      
                                        restrictSpecialChars(e);
                                      }}
                                    
                                    // onKeyDown={(e: any) => {
                                    //     blockInvalidChar(e);
                                    // }}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Spacial characters'));
                                        }
                                    }}
                                    // value={assetDataById[0]?.pinCode}
                                    // disabled
                                    // onBlur={handleBlur}
                                />
                                {error['gstNumber'] !== undefined ? <p className="form-error">{error['gstNumber']}</p> : null}
                            </div>
                            <div className="input-form">
                                <h2 className="phaseLable required">Total Quoted Amount</h2>
                                <TextField
                                    autoComplete="off"
                                    name="totalQuotedAmount"
                                    id="totalQuotedAmount"
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    className="w-85"
                                    value={formData?.totalQuotedAmount || ''}
                                    onChange={handleVendor}
                                    onKeyDown={(e) => exceptThisSymbols.includes(e.key) && e.preventDefault()}
                                    onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
                                    // value={assetDataById[0]?.pinCode}
                                    // disabled
                                    // onBlur={handleBlur}
                                />
                                {error['totalQuotedAmount'] !== undefined ? <p className="form-error">{error['totalQuotedAmount']}</p> : null}
                            </div>
                        </DialogContent>
                        <DialogActions className="button-wrap" style={{ marginTop: '7%' }}>
                            <Tooltip title="Submit" placement="top">
                                <Button className="yes-btn" onClick={() => handleSubmitVendor('Installation Vendor')}>
                                    Submit
                                </Button>
                            </Tooltip>
                            <Tooltip title="Cancel" placement="top">
                                <Button className="no-btn" onClick={handleInstallClose}>
                                    Cancel
                                </Button>
                            </Tooltip>
                        </DialogActions>
                    </Dialog>
                </Grid>
                {id && id !== undefined && id !== 'noid' && (
                    <div className="bottom-fix-history" style={{ marginBottom: '-15px' }}>
                        {<MandateStatusHistory mandateCode={id} accept_Reject_Status={currentStatus} accept_Reject_Remark={currentRemark} />}
                    </div>
                )}
                {/* <div className="bottom-fix-history">{id && id !== undefined && id !== 'noid' && <MandateStatusHistory mandateCode={id} accept_Reject_Status={currentStatus} accept_Reject_Remark={currentRemark} />}</div> */}
                <div className="bottom-fix-btn bg-pd">
                    <div className="remark-field" style={{ marginRight: '0px' }}>
                        <Stack display="flex" flexDirection="row" justifyContent="space-between" alignItems={'center'} alignContent="center" sx={{ margin: '10px' }} style={{ marginLeft: '-2.7%' }}>
                            <Tooltip title="SUBMIT">
                                <Button
                                    variant="outlined"
                                    size="medium"
                                    name="submit"
                                    onClick={() => submitAllVendor()}
                                    style={{
                                        marginLeft: 10,
                                        padding: '2px 20px',
                                        borderRadius: 6,
                                        color: '#fff',
                                        borderColor: '#00316a',
                                        backgroundColor: '#00316a',
                                    }}
                                >
                                    SUBMIT
                                </Button>
                            </Tooltip>
                        </Stack>
                    </div>
                </div>
                {/* <div
          className="ag-theme-alpine"
          style={{ height: "calc(50vh - 200px)", marginTop: "10px" }}
        >
          <CommonGrid
            defaultColDef={null}
            columnDefs={columnDefs}
            rowData={[]}
            onGridReady={onGridReady}
            gridRef={gridRef}
            pagination={false}
            paginationPageSize={null}
          />
        </div> */}
            </div>
            <SwipeableDrawer
                anchor={'right'}
                open={openDrawerAssetCode}
                onClose={(e) => {
                    setOpenDrawerAssetCode(!openDrawerAssetCode);
                }}
                onOpen={(e) => {
                    setOpenDrawerAssetCode(!openDrawerAssetCode);
                }}
            >
                {/* <ComplienceTimeline mandateCode={mandateCode} /> */}

                <AssetCodeDrawer onAssetDrawerData={assetDrawerData} handleClose={() => setOpenDrawerAssetCode(false)} />
            </SwipeableDrawer>

            <SwipeableDrawer
                anchor={'right'}
                open={openDrawer}
                onClose={(e) => {
                    setOpenDrawer(!openDrawer);
                }}
                onOpen={(e) => {
                    setOpenDrawer(!openDrawer);
                }}
            >
                {/* <ComplienceTimeline mandateCode={mandateCode} /> */}
                {/* <DrawerComponent onAssetDetaildViewData={assetDetaildView} handleClose={() => setOpenDrawer(false)}/> */}
            </SwipeableDrawer>
        </>
    );
}

export default QuoteInput;
