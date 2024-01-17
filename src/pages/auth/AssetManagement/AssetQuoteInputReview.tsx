import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Select, Stack, SwipeableDrawer, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import AppTooltip from '@uikit/core/AppTooltip';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import AssetInfo from 'pages/common-components/AssetInformation';
import React, { useCallback, useEffect, useState } from 'react';
import { GrAddCircle } from 'react-icons/gr';
import { useNavigate, useParams } from 'react-router-dom';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useDispatch, useSelector } from 'react-redux';
import { fetchError, showMessage, showWarning } from 'redux/actions';
import Checkbox from '@mui/material/Checkbox';
import workflowFunctionAPICall from 'pages/Mandate/workFlowActionFunction';
import ApproveAndRejectAction from 'pages/common-components/ApproveRejectAction';
import { AppState } from 'redux/store';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import regExpressionTextField, { regExpressionRemark,regExpressionRemarkk, textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';
import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';
import AssetCodeDrawer from './AssetCodeDrawer';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import InputQuotationFileUpload from './InputQuotationFileUpload';
import InputQuotationViewList from 'pages/Mandate/Staff/Components/Actions/InputQuotationViewList';
import { TbH3 } from 'react-icons/tb';
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

function QuoteInput() {
    const exceptThisSymbols = ['e', 'E', '+', '-', '.'];
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useAuthUser();
    const [assetCode, setAssetCode] = useState<any>('');
    const [vertical, setVertical] = React.useState([]);
    const [open, setOpen] = useState(false);
    const [tOpen, setTOpen] = useState(false);
    const [iOpen, setIOpen] = useState(false);
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [error, setError] = useState({});
    const [contactError, setContactError] = useState(null);
    const [gstError, setGstError] = useState(null);
    const [assetDetails, setassetDetails] = useState([]);
    const [sourceBranch, setsourceBranch] = useState([]);
    const [destinationBranch, setdestinationBranch] = useState([]);
    const [userAction, setUserAction] = React.useState(null);
    const [approvedStatus, setApprovedStatus] = useState(false);
    const [sendBack, setSendBack] = React.useState(false);
    const [rejected, setRejected] = React.useState(false);
    const [remark, setRemark] = React.useState('');
    const [approved, setApproved] = React.useState(false);
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const action = userAction?.action || '';
    const runtimeId = userAction?.runtimeId || 0;
    const [assetDataById, setAssetDataById] = useState([]);
    const [formData, setformData] = useState({ id: 0, record_Id: null, fk_quote_id: 0, firmCompanyName: '', proporiterSPOCName: '', address: '', mobileNumber: '', emailID: '', gstNumber: '', totalQuotedAmount: '', vendorCategory: '', status: '' });
    const [isEdit, setisEdit] = useState(false);
    const [view, setview] = useState(false);
    const [editId, seteditId] = useState(null);
    const [params, setParams] = useState(null);
    const [delparams, setDelParams] = useState(null);
    const [openDel, setOpenDel] = useState(false);
    const [transportVendor, setTransportVendor] = useState([]);
    const [installationVendor, setInstallationVendor] = useState([]);
    const [fileLength, setFileLength] = React.useState(0);
    const [assetDrawerData, setAssetDrawerData] = React.useState(null);
    const [openDrawerAssetCode, setOpenDrawerAssetCode] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [assetRequestNo, setassetRequestNo] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [checkedT, setCheckedT] = React.useState({});
    const [checkedI, setCheckedI] = React.useState({});
    const [upload, setUpload] = React.useState(false);
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const classes = useStyles();
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
            setAssetCode(id);
        }
    }, [id]);
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
            getQuoteId(id);
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
    const getTransportDetails = (quoteId) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AssetQuotation/GetVendorDetailsById?Id=&quoteId=${quoteId}&vendorcategory=Transport Vendor`)
            .then((response: any) => {
                console.log('RRR', response);
                setTransportVendor(response?.data || []);
                // getVendorDetails(response?.data?.[0]?.id);
                // setdestinationBranch(response?.data || []);
            })
            .catch((e: any) => {});
    };
    const getInstallationDetails = (quoteId) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AssetQuotation/GetVendorDetailsById?Id=&quoteId=${quoteId}&vendorcategory=Installation Vendor`)
            .then((response: any) => {
                console.log('RRR', response);
                setInstallationVendor(response?.data || []);
                // getVendorDetails(response?.data?.[0]?.id);
                // setdestinationBranch(response?.data || []);
            })
            .catch((e: any) => {});
    };
    const getQuoteId = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AssetQuotation/GetAssetQuationById?Id=&requestId=${id}`)
            .then((response: any) => {
                console.log('ZZZ', assetCode, response);
                getTransportDetails(response?.data?.[response?.data?.length - 1]?.id);
                getInstallationDetails(response?.data?.[response?.data?.length - 1]?.id);
                // setdestinationBranch(response?.data || []);
            })
            .catch((e: any) => {});
    };
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
    console.log('AAA', assetCode);
    const getAssetDetails = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestMovementDetailsByAssetId?assetId=${id}&assetcode=''`)
            .then((response: any) => {
                console.log('setassetDetails', response);
                setassetDetails(response?.data || []);
            })
            .catch((e: any) => {});
    };
    const submitAllVendor = () => {
        if (transportVendor?.length < 2 || installationVendor?.length < 2) {
            dispatch(fetchError('Minimum 2 Transport Vendor and 2 Installation Vendor Required'));
            return;
        }
    };
    const handleSubmitVendor = (category) => {
        const errors = Validation();
        console.log('Vndor Error', errors, transportVendor);
        if (errors && Object.keys(errors).length > 0) return;

        const payload = { ...formData, id: isEdit ? editId : 0, fk_quote_id: 1, vendorCategory: category, status: 'active', createddate: '2023-11-21T12:04:50.059Z', createdby: 'jjj', modifieddate: '2023-11-21T12:04:50.059Z', ModifiedBy: 'kkk' };
        if (category === 'Transport Vendor') {
            if (isEdit) {
                const index = params?.rowIndex;
                const trans = [...transportVendor];
                const prevQuotedAmount = trans[index]?.totalQuotedAmount;
                trans[index] = { ...payload, isEdit: true };
                setTransportVendor(trans);
                if (checkedT[params?.rowIndex]) setTotalAmount(totalAmount - parseInt(prevQuotedAmount, 10) + parseInt(payload?.totalQuotedAmount, 10));
            } else {
                setTransportVendor([...transportVendor, payload]);
            }
            setTOpen(false);
        }
        if (category === 'Installation Vendor') {
            if (isEdit) {
                const index = params?.rowIndex;
                const trans = [...installationVendor];
                const prevQuotedAmount = trans[index]?.totalQuotedAmount;
                trans[index] = { ...payload, isEdit: true };
                setInstallationVendor(trans);
                if (checkedI[params?.rowIndex]) setTotalAmount(totalAmount - parseInt(prevQuotedAmount, 10) + parseInt(payload?.totalQuotedAmount, 10));
            } else {
                setInstallationVendor([...installationVendor, payload]);
            }
            setIOpen(false);
        }

        if (isEdit) {
            dispatch(showMessage('Vendor Updated Successfully'));
            setisEdit(false);
            seteditId(null);
        } else {
            dispatch(showMessage('Vendor Added Successfully'));
        }
        setformData({ id: 0, record_Id: null, fk_quote_id: 0, firmCompanyName: '', proporiterSPOCName: '', address: '', mobileNumber: '', emailID: '', gstNumber: '', totalQuotedAmount: '', vendorCategory: '', status: '' });
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

    function isValidGSTNo(gstno) {
        let gstRegex = /^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/;
        if (!gstRegex.test(gstno)) {
            setGstError('Please enter valid GST Number');
            return false;
        } else if (gstno?.length < 15) {
            setGstError('Please enter 15 digits Gst Number');
            return false;
        }
        return true;
    }

    function isValidEmailFormat(email) {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            setError('Please enter valid email id');
            return false;
        }
        const specialChars = /[!#$%^&*()+=\[\]{}\\|<>\/?]+/;
        if (specialChars.test(email)) {
            setError('Please enter valid email id');
            return false;
        }
        return true;
    }

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
    const handleCloseDel = () => {
        setOpenDel(false);
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
    const handleRemove = (paramsD) => {
        if (paramsD?.data?.id == 0) {
            if (paramsD?.data?.vendorCategory === 'Transport Vendor') {
                const trans = [...transportVendor];
                const filter = trans?.filter((item, index) => index !== paramsD?.rowIndex);
                if (checkedT[paramsD?.rowIndex]) {
                    setTotalAmount(totalAmount - parseInt(paramsD?.data?.totalQuotedAmount, 10));
                    delete checkedT[paramsD?.rowIndex];
                    setCheckedT(checkedT);
                }
                setTransportVendor(filter);
            } else if (paramsD?.data?.vendorCategory === 'Installation Vendor') {
                const install = [...installationVendor];
                const filter = install?.filter((item, index) => index !== paramsD?.rowIndex);
                if (checkedI[paramsD?.rowIndex]) {
                    setTotalAmount(totalAmount - parseInt(paramsD?.data?.totalQuotedAmount, 10));
                    delete checkedI[paramsD?.rowIndex];
                    setCheckedI(checkedI);
                }
                setInstallationVendor([...filter]);
            }
            dispatch(showMessage('vendor deleted successfully'));
            setOpenDel(false);
        }
    };
    let columnDefsT = [
        {
            field: 'action',
            headerName: 'Actions',
            headerTooltip: 'Actions',
            sortable: true,
            resizable: true,
            width: 180,
            minWidth: 180,
            cellStyle: { fontSize: '13px' },
            cellRenderer: (params: any) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                        checked={checkedT[params?.rowIndex] || false}
                        onChange={(e) => {
                            setCheckedT({ ...checkedT, [params?.rowIndex]: e?.target?.checked });
                            if (e?.target?.checked) {
                                setTotalAmount(totalAmount + parseInt(params?.data?.totalQuotedAmount, 10));
                            } else {
                                setTotalAmount(totalAmount - parseInt(params?.data?.totalQuotedAmount, 10));
                            }
                        }}
                    />
                    <Tooltip title="Edit" className="actionsIcons">
                        <EditIcon
                            fontSize="medium"
                            style={{
                                cursor: 'pointer',
                                fontSize: '20px',
                                color: params?.data?.id !== 0 ? '#888' : '#000',
                            }}
                            // disabled={params?.data?.id !== 0}
                            onClick={(e) => {
                                console.log('parr', params);
                                if (params?.data?.id == 0) {
                                    setformData({ ...params?.data });
                                    setisEdit(true);
                                    seteditId(params?.data?.id);
                                    setParams(params);
                                    if (params?.data?.vendorCategory === 'Transport Vendor') {
                                        setTOpen(true);
                                    } else {
                                        setIOpen(true);
                                    }
                                }
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Delete" className="actionsIcons">
                        <DeleteIcon
                            onClick={() => {
                                if (params?.data?.id == 0) {
                                    setOpenDel(true);
                                    setDelParams(params);
                                }
                            }}
                            fontSize="medium"
                            style={{
                                cursor: 'pointer',
                                fontSize: '20px',
                                color: params?.data?.id !== 0 ? '#888' : '#000',
                            }}
                            // disabled={params?.data?.id !== 0}
                        />
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
                            docType={'Review'}
                        />
                    </Tooltip>

                    <Tooltip title="View" className="actionsIcons">
                        <InputQuotationViewList assetCode={assetRequestNo} props={params} recId={params?.data?.record_Id} />
                    </Tooltip>
                </div>
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
            headerName: 'proprietor/SPOC Name',
            headerTooltip: 'proprietor/SPOC Name',
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
            headerTooltip: 'Sequence',
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
    let columnDefsI = [
        {
            field: 'action',
            headerName: 'Actions',
            headerTooltip: 'Actions',
            sortable: true,
            resizable: true,
            width: 180,
            minWidth: 180,
            cellStyle: { fontSize: '13px' },
            cellRenderer: (params: any) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                        checked={checkedI[params?.rowIndex] || false}
                        onChange={(e) => {
                            setCheckedI({ ...checkedI, [params?.rowIndex]: e?.target?.checked });
                            if (e?.target?.checked) {
                                setTotalAmount(totalAmount + parseInt(params?.data?.totalQuotedAmount, 10));
                            } else {
                                setTotalAmount(totalAmount - parseInt(params?.data?.totalQuotedAmount, 10));
                            }
                        }}
                    />
                    <Tooltip title="Edit Item" className="actionsIcons">
                        <EditIcon
                            fontSize="medium"
                            style={{
                                cursor: 'pointer',
                                fontSize: '20px',
                                color: params?.data?.id !== 0 ? '#888' : '#000',
                            }}
                            // disabled={params?.data?.id !== 0}
                            onClick={(e) => {
                                console.log('parr', params);
                                if (params?.data?.id == 0) {
                                    setformData({ ...params?.data });
                                    setisEdit(true);
                                    seteditId(params?.data?.id);
                                    setParams(params);
                                    if (params?.data?.vendorCategory === 'Transport Vendor') {
                                        setTOpen(true);
                                    } else {
                                        setIOpen(true);
                                    }
                                }
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Item" className="actionsIcons">
                        <DeleteIcon
                            onClick={() => {
                                if (params?.data?.id == 0) {
                                    setOpenDel(true);
                                    setDelParams(params);
                                }
                            }}
                            fontSize="medium"
                            style={{
                                cursor: 'pointer',
                                fontSize: '20px',
                                color: params?.data?.id !== 0 ? '#888' : '#000',
                            }}
                        />
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
                            docType={'Review'}
                        />
                    </Tooltip>

                    <Tooltip title="View" className="actionsIcons">
                        <InputQuotationViewList assetCode={assetRequestNo} props={params} recId={params?.data?.record_Id} />
                    </Tooltip>
                </div>
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
            headerName: 'proprietor/SPOC Name',
            headerTooltip: 'proprietor/SPOC Name',
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
            headerTooltip: 'Sequence',
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
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'balance_Useful_life_as_per_Admin',
            headerName: 'Balance Useful Life As Per Finance',
            headerTooltip: 'Balance Useful Life As Per Finance',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'used_Unused',
            headerName: 'Used/Unused',
            headerTooltip: 'Used/Unused',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
    ];
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

    function onGridReady(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridApi(params.api);
    }
    const handleVendor = (e) => {
        const { name, value } = e?.target;
        if (name == 'totalQuotedAmount') {
            if (value[0] == '0' || value?.length > 10) return;
        }
        setformData({ ...formData, [name]: value });
    };
    console.log('TTT', transportVendor);
    return (
        <>
            <Dialog className="dialog-wrap" open={openDel} onClose={handleCloseDel} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title" className="title-model">
                    Are you sure you want to delete ?
                </DialogTitle>
                <DialogActions className="button-wrap">
                    <Tooltip title="Cancel">
                        <Button
                            className="no-btn"
                            onClick={() => {
                                handleCloseDel();
                            }}
                        >
                            Cancel
                        </Button>
                    </Tooltip>
                    <Tooltip title="Yes">
                        <Button className="yes-btn" onClick={() => delparams?.data?.id == 0 && handleRemove(delparams)}>
                            Yes
                        </Button>
                    </Tooltip>
                </DialogActions>
            </Dialog>
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
                    Review Quotation
                </Box>
            </Grid>
            <div className="card-panal inside-scroll-217" style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <AssetInfo setassetRequestNo={setassetRequestNo} assetCode={assetCode} disabledStatus={false} source="" pageType="propertyAdd" redirectSource={``} setAssetCode={setAssetCode} setMandateData={() => {}} setpincode={() => {}} setCurrentStatus={() => {}} setCurrentRemark={() => {}} />

                <Stack display="flex" alignItems="flex-end" justifyContent="space-between" flexDirection="row" sx={{ mb: -2 }}>
                    <Box>
                        <h5>Asset Details</h5>
                    </Box>
                    <div style={{ marginBottom: 10 }}></div>
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
                                        <TableCell className="w-75" align="left">
                                            {sourceBranch?.[0]?.region}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">State</TableCell>
                                        <TableCell className="w-75" align="left">
                                            {sourceBranch?.[0]?.state}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">Branch Name</TableCell>
                                        <TableCell className="w-75" align="left">
                                            {sourceBranch?.[0]?.branch_Name}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">Address & PIN Code</TableCell>
                                        <TableCell className="w-75" align="left">
                                            {sourceBranch?.length ? sourceBranch?.[0]?.address + ',\xa0\xa0' + sourceBranch?.[0]?.pincode : ''}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">Branch SPOC & Phone</TableCell>

                                        <TableCell className="w-75" align="left">
                                            {sourceBranch?.length ? sourceBranch?.[0]?.branch_SPOC + ',\xa0\xa0' + sourceBranch?.[0]?.contact_Person_Phone : ''}
                                        </TableCell>
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
                                        <TableCell className="w-75" align="left">
                                            {destinationBranch?.[0]?.region}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">State</TableCell>
                                        <TableCell className="w-75" align="left">
                                            {destinationBranch?.[0]?.state}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">Branch Name</TableCell>
                                        <TableCell className="w-75" align="left">
                                            {destinationBranch?.[0]?.branch_Name}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">Address & PIN Code</TableCell>
                                        <TableCell className="w-75" align="left">
                                            {destinationBranch?.length ? destinationBranch?.[0]?.address + ',\xa0\xa0' + destinationBranch?.[0]?.pincode : ''}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="field-bold">Branch SPOC & Phone</TableCell>
                                        <TableCell className="w-75" align="left">
                                            {destinationBranch?.length ? destinationBranch?.[0]?.branch_SPOC + ',\xa0\xa0' + destinationBranch?.[0]?.contact_Person_Phone : ''}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Grid>
                </Grid>

                <hr style={{ marginTop: 10, marginBottom: 10 }} />
                <Stack display="flex" alignItems="flex-start" justifyContent="space-between" flexDirection="row" sx={{ mb: -2 }}>
                    <Box>
                        <h5>Input Transport Vendor Quote Details</h5>
                    </Box>
                    <Box>
                        <GrAddCircle style={{ fontSize: 20, marginRight: 10 }} onClick={handleClickTransportVendorOpen} />
                    </Box>
                </Stack>

                <div style={{ marginBottom: 8 }}></div>
                <div className="ag-theme-alpine" style={{ height: getHeightForTransportTable(), marginTop: '10px' }}>
                    <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefsT} rowData={transportVendor || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                </div>

                <hr style={{ marginTop: 10, marginBottom: 10 }} />
                <Stack display="flex" alignItems="flex-start" justifyContent="space-between" flexDirection="row" sx={{ mb: -2 }}>
                    <Box>
                        <h5>Input Associated Expenses Quote Details</h5>
                    </Box>
                    <Box>
                        <GrAddCircle style={{ fontSize: 20, marginRight: 10 }} onClick={handleClickInstallVendorOpen} />
                    </Box>
                </Stack>
                <div style={{ marginBottom: 8 }}></div>
                <div className="ag-theme-alpine" style={{ height: getHeightForInstallationTable(), marginTop: '10px' }}>
                    <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefsI} rowData={installationVendor || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                </div>
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
                                    onKeyDown={(e: any) => {
                                        blockInvalidChar(e);
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
                                    inputProps={{
                                        maxLength: 10,
                                    }}
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
                                    onKeyDown={(e: any) => {
                                        blockInvalidChar(e);
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
                                    inputProps={{
                                        maxLength: 10,
                                        // pattern: '[0-9]*',
                                    }}
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
                <div className="bottom-fix-history">{id && id !== undefined && id !== 'noid' && <MandateStatusHistory mandateCode={id} accept_Reject_Status={currentStatus} accept_Reject_Remark={currentRemark} />}</div>
                <div className="bottom-fix-btn">
                    <div className="remark-field" style={{ marginRight: '0px' }}>
                        <Tooltip title="Back">
                            <Button
                                variant="outlined"
                                size="medium"
                                type="submit"
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
                                    padding: '2px 20px',
                                    borderRadius: 6,
                                    color: '#fff',
                                    borderColor: '#00316a',
                                    backgroundColor: '#00316a',
                                }}
                                // onClick={() => {
                                //     workflowFunctionAPICall(runtimeId, id, remark, 'Proceed', navigate, user);
                                // }}
                            >
                                Proceed
                            </Button>
                        </Tooltip>
                        {action && action === 'Approve' && !approvedStatus && (
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
                                                workflowFunctionAPICall(runtimeId, id, remark, 'Approved', navigate, user);
                                            }}
                                            sentBackEvent={() => {
                                                workflowFunctionAPICall(runtimeId, id, remark, 'Sent Back', navigate, user);
                                            }}
                                        />
                                        <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* {action === "" && runtimeId === 0 && ( */}
                <div className="bottom-fix-btn bg-pd">
                    <h5 className="AssetQuoth5">
                        <span style={{ fontWeight: 'bolder' }}>Total Amount : </span>
                        {totalAmount}
                    </h5>
                    <div className="remark-field" style={{ marginRight: '0px' }}>
                        <Stack display="flex" flexDirection="row" justifyContent="space-between" alignItems={'center'} alignContent="center" sx={{ margin: '10px' }} style={{ marginLeft: '-2.7%' }}>
                            <Tooltip title="SUBMIT">
                                <Button
                                    variant="outlined"
                                    size="medium"
                                    name="submit"
                                    // onClick={(e) => {
                                    //   e.preventDefault();
                                    //   if (mandateId?.id === undefined) {
                                    //     dispatch(fetchError("Please select Mandate !!!"));
                                    //     return;
                                    //   }
                                    //   if (
                                    //     docUploadHistory &&
                                    //     docUploadHistory?.length === 0
                                    //   ) {
                                    //     dispatch(fetchError("Please upload file"));
                                    //     return;
                                    //   }
                                    //   workFlowMandate();
                                    // }}
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
                            {/* {userAction?.stdmsg !== undefined && (
                      <span className="message-right-bottom">
                        {userAction?.stdmsg}
                      </span>
                    )} */}
                        </Stack>
                    </div>
                </div>
                {/* )} */}
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
