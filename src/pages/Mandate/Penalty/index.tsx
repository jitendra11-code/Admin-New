import { Autocomplete, Button, Grid, TextField, Box, Tab } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import { submit } from 'shared/constants/CustomColor';
import axios from 'axios';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import groupByDocumentData from '../DocumentUploadMandate/Components/Utility/groupByDocumentData';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import ApproveAndRejectAction from 'pages/common-components/ApproveRejectAction';
import ApproveSendBackRejectAction from 'pages/common-components/ApproveSendBackRejectAction';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import MandateInfo from 'pages/common-components/MandateInformation';
import { Link } from 'react-router-dom';
import ToggleSwitch from '@uikit/common/ToggleSwitch';
import { AppState } from '@auth0/auth0-react';
import { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';

import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';
import { useUrlSearchParams } from 'use-url-search-params';
import NumberFormatAmount from '@uikit/common/NumberFormatTextField/NumberFormatAmount';
import RemoveThousandSeparator from '@uikit/common/NumberFormatTextField/RemoveThosandSeperator';
const MAX_COUNT = 8;

const bOQValue = {
    key: 'No Due Certificate',
    name: 'No Due Certificate',
};
const NDC = () => {
    const dispatch = useDispatch();
    let { id } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = React.useState<any>({
        vendorname: '',
        vendorId: 0,
        id: 0,
        vendorcategory: '',
    });
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const [vendorInformation, setVendorInformation] = React.useState([]);
    const [vendorCatInformation, setVendorCatInformation] = React.useState([]);
    const [allVendor, setAllVendor] = React.useState([]);
    const [mandateId, setMandateId] = React.useState(null);
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [mandateData, setMandateData] = React.useState({});
    const [userAction, setUserAction] = React.useState(null);
    const [params] = useUrlSearchParams({}, {});
    const [boqDrp, setBoQ] = React.useState<any>(bOQValue);
    const [docType, setDocType] = React.useState<any>(null);
    const fileInput = React.useRef(null);
    const [fileLimit, setFileLimit] = React.useState(false);
    const [edit, setEdit] = React.useState(false);
    const [editIndex, setEditIndex] = React.useState(null);
    const [uploadedFiles, setUploadedFiles] = React.useState([]);
    const [fileLength, setFileLength] = React.useState(0);
    const [docUploadHistory, setDocUploadHistory] = React.useState([]);
    const gridRef = React.useRef<AgGridReact>(null);
    const [sendBack, setSendBack] = React.useState(false);
    const [approved, setApproved] = React.useState(false);
    const [remark, setRemark] = useState('');
    const location = useLocation();
    const apiType = location?.state?.apiType || '';
    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const action = userAction?.action || '';
    const runtimeId = userAction?.runtimeId || 0;
    const [rejected, setRejected] = React.useState(false);
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);

    const [approvedStatus, setApprovedStatus] = useState(false);
    const [totalTAT, setTotalTAT] = React.useState(false);
    const [formData, setFormData] = React.useState({
        id: 0,
        uid: 'uid',
        mandates_Id: null,
        vendor_Id: null,
        total_TAT: null,
        total_Delays: null,
        penalty_Matrix: null,
        penalty_Amount: null,
        final_PO_Value: null,
        BOQ_Amount: null,
        remarks: '',
        status: totalTAT?.toString(),
    });
    const [value, setValue] = React.useState('4');

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    const { user } = useAuthUser();

    useMemo(() => {
        if (mandateId?.id !== undefined && vendor?.vendorId !== undefined && user?.role === 'Vendor') {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/GetAcceptPenaltyStatus?mandateid=${mandateId?.id || 0}&TableID=${vendor?.vendorId || 0}&RoleName=${user?.role}`)
                .then((response: any) => {
                    if (!response) setApprovedStatus(false);
                    if (response && response?.data === true) {
                        setApprovedStatus(true);
                    } else {
                        setApprovedStatus(false);
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
        if (mandateId?.id !== undefined && vendor?.vendorId !== undefined && user?.role !== 'Vendor') {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/GetApprovalPenaltyStatus?mandateid=${mandateId?.id || 0}&TableID=${vendor?.vendorId || 0}&RoleName=${user?.role}`)
                .then((response: any) => {
                    if (!response) setApprovedStatus(false);
                    if (response && response?.data === true) {
                        setApprovedStatus(true);
                    } else {
                        setApprovedStatus(false);
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
    }, [mandateId, vendor?.vendorId, user?.role]);

    useEffect(() => {
        if (mandateId?.id !== undefined && vendor?.vendorId !== undefined && vendor?.vendorId !== 0) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/GetPOBOQAmount?mandateid=${mandateId?.id || 0}&vendorid=${vendor?.vendorId || 0}`)
                .then((response: any) => {
                    if (!response) return;
                    if (response && response?.data && response?.data?.length > 0) {
                        var item = response?.data?.[0];
                        setFormData((state) => ({
                            ...state,
                            final_PO_Value: item?.poamount || 0,
                            BOQ_Amount: item?.boqamount || 0,
                        }));
                    } else {
                        setFormData((state) => ({ ...state, final_PO_Value: 0, BOQ_Amount: 0 }));
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
    }, [mandateId, vendor?.vendorId]);

    const downloadTemplate = (docType) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/DownloadTemplate?documenttype=Penalty Calculation`, {
                responseType: 'arraybuffer',
            })
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data) {
                    var filename = response.headers['content-disposition'].split("''")[1];
                    if (!filename) {
                        dispatch(fetchError('Error Occurred !'));
                        return;
                    }

                    var blob = new Blob([response?.data], {
                        type: 'application/octet-stream',
                    });
                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        window.navigator.msSaveBlob(blob, filename);
                    } else {
                        var blobURL = window.URL && window.URL.createObjectURL ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
                        var tempLink = document.createElement('a');
                        tempLink.style.display = 'none';
                        tempLink.href = blobURL;
                        tempLink.setAttribute('download', filename);
                        if (typeof tempLink.download === 'undefined') {
                            tempLink.setAttribute('target', '_blank');
                        }

                        document.body.appendChild(tempLink);
                        tempLink.click();

                        setTimeout(function () {
                            document.body.removeChild(tempLink);
                            window.URL.revokeObjectURL(blobURL);
                        }, 200);

                        dispatch(showMessage('Document Template is downloaded successfully!'));
                    }
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const workflowFunctionAPICall = (runtimeId, mandateId, tableId, remark, action, navigate, user) => {
        if (userAction?.action?.trim() === 'Approve or Reject' && user?.role?.trim() === 'Vertical Head') {
            const data = [...allVendor];
            data[editIndex] = formData;
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/UpdateExcelData`, data)
                .then((response: any) => {
                    if (!response) return;
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: runtimeId || 0,
            mandateId: mandateId || 0,
            tableId: tableId || 0,
            remark: remark || '',
            createdBy: user?.UserName || 'Admin',
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: action || '',
        };
        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${remark}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) return;
                if (response?.data === true) {
                    dispatch(showMessage('Submitted Successfully!'));
                    navigate('/list/task');
                }
            })
            .catch((e: any) => {});
    };

    const handleUploadFiles = async (files) => {
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
        formData.append('mandate_id', mandateId?.id);
        formData.append('documenttype', 'Penalty Calculation');
        formData.append('CreatedBy', user?.UserName || '');
        formData.append('ModifiedBy', user?.UserName || '');
        formData.append('entityname', 'Penalty Calculation');
        formData.append('RecordId', mandateId?.id);

        uploaded &&
            uploaded?.map((file) => {
                formData.append('file', file);
            });
        if (uploaded?.length === 0) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError('Error Occurred !'));
            return;
        }

        if (mandateId?.id !== undefined) {
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`, formData)
                .then((response: any) => {
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
                        getVersionHistoryData(formData?.vendor_Id || 0);
                        return;
                    } else if (response?.status === 200) {
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(showMessage('Documents are uploaded successfully!'));
                        getVersionHistoryData(formData?.vendor_Id || 0);
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
    };
    const getVersionHistoryData = (RecordId) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId?.id}&documentType=Penalty Calculation&recordId=${RecordId || 0}`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }

                if (response?.data && response?.data && response?.data?.length > 0) {
                    var data = groupByDocumentData(response?.data, 'versionNumber');
                    setDocUploadHistory(data || []);
                }
                if (response && response?.data?.length === 0) {
                    setDocUploadHistory([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    useEffect(() => {
        if (mandateId?.id !== undefined) {
            setVendor({
                vendorname: '',
                vendorId: 0,
                id: 0,
                vendorcategory: '',
            });
        }
    }, [mandateId?.id]);

    React.useEffect(() => {
        if (id !== 'noid' && id) {
            setMandateId(id);
        }
    }, []);

    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined) {
            const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(mandateId?.id) && item?.module === module);

            if (apiType === '') {
                setUserAction(userAction);
            } else {
                let action = mandateId;
                setUserAction(action);
            }
        }
    }, [mandateId]);

    useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid' && user && user?.role === 'Vendor') {
            const obj = { vendorcategory: user?.vendorType || '' };
            const data = [
                {
                    vendorcategoryKey: user?.vendorType || '',
                    vendorcategory: user?.vendorType || '',
                },
            ];
            setVendor((state) => ({
                ...state,
                vendorcategoryKey: user?.vendorType || '',
                vendorcategory: user?.vendorType || '',
            }));

            setVendorCatInformation([...data]);
            handelCategoryChange('e', obj);
        }
    }, [mandateId]);
    const handelCategoryChange = (e, value) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PODetails/GetVendorDropDown?mandateId=${mandateId?.id}&vendorCategory=${value?.vendorcategory}`)
            .then((response) => {
                if (!response) return;
                if (user?.role === 'Vendor' && response?.data && response?.data?.length === 1) {
                    setVendor({
                        vendorname: response?.data?.[0]?.vendorname || '',
                        vendorId: response?.data?.[0]?.id || 0,
                        id: response?.data?.[0]?.id || 0,
                        vendorcategory: user?.vendorType || '',
                    });
                }
                if (user?.role !== 'Vendor' && response?.data && response?.data?.length === 1) {
                    setVendor({
                        vendorname: response?.data?.[0]?.vendorname || '',
                        vendorId: response?.data?.[0]?.id || 0,
                        id: response?.data?.[0]?.id || 0,
                        vendorcategory: response?.data?.[0]?.vendorcategory || 0,
                    });
                }

                setVendorInformation(response?.data);
            })
            .catch((err) => {});
    };

    const getVendorCategory = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PODetails/GetVendorCategoryByMandateId?mandateId=${mandateId?.id === undefined ? mandateId : mandateId?.id}`)
            .then((response) => {
                setVendorCatInformation(response?.data);
            })
            .catch((err) => {});
    };
    useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid' && user && user?.role !== 'Vendor') {
            getVendorCategory();
        }
    }, [mandateId]);

    useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && !totalTAT && vendor?.vendorname !== '' && vendor?.vendorcategory !== '') {
            getPenaltyDetails();
        }
    }, [mandateId, totalTAT, vendor]);
    const getVendorData = (response) => {
        const data = response?.filter((item, index) => {
            if (item?.vendor_Id === vendor?.vendorId) {
                setEditIndex(index);
                return true;
            } else {
                return false;
            }
        });
        return data;
    };

    const getPenaltyDetails = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/GetPenaltyDetailsByMandateId?mandates_Id=${mandateId?.id}&Vendor_Id=${vendor?.vendorId || 0}`)
            .then((response: any) => {
                if (!response) {
                    return;
                }
                if (response && response?.data && response?.data?.length === 0) {                
                    setFormData({
                        id: 0,
                        uid: 'uid',
                        mandates_Id: mandateId?.id,
                        vendor_Id: 0,
                        total_TAT: null,
                        total_Delays: null,
                        penalty_Matrix: null,
                        penalty_Amount: null,
                        final_PO_Value: formData?.final_PO_Value || null,
                        BOQ_Amount: formData?.BOQ_Amount || null,
                        remarks: '',
                        status: totalTAT?.toString(),
                    });
                }
                if (response && response?.data && response?.data?.length > 0) {
                    setTotalTAT(response?.data?.[0]?.status === 'true' ? true : false);
                    setAllVendor([...response?.data]);
                    const vendorData = getVendorData(response?.data);                 
                    if (vendorData && vendorData?.length > 0) setEdit(true);
                    vendorData &&
                        vendorData?.length &&
                        setFormData({
                            id: vendorData?.[0]?.id || 0,
                            uid: 'uid',
                            mandates_Id: mandateId?.id || 0,
                            vendor_Id: vendorData?.[0]?.vendor_Id || 0,
                            total_TAT: vendorData?.[0]?.total_TAT || null,
                            total_Delays: vendorData?.[0]?.total_Delays || null,
                            penalty_Matrix: vendorData?.[0]?.penalty_Matrix || null,
                            penalty_Amount: RemoveThousandSeparator(vendorData?.[0]?.penalty_Amount, 'int') || null,
                            remarks: vendorData?.[0]?.remarks || null,
                            status: vendorData?.[0]?.status?.toString() || '',
                            final_PO_Value: RemoveThousandSeparator(formData?.final_PO_Value, 'int') || null,
                            BOQ_Amount: RemoveThousandSeparator(formData?.BOQ_Amount, 'int') || null,
                        });
                }
            })
            .catch((e: any) => {});
    };

    const handleTat = (e) => {
        if (e.target.value === 'true') {
            setFormData({
                id: 0,
                uid: 'uid',
                mandates_Id: mandateId?.id,
                vendor_Id: vendor?.vendorId,
                total_TAT: null,
                total_Delays: null,
                penalty_Matrix: null,
                penalty_Amount: null,
                final_PO_Value: formData?.final_PO_Value || null,
                BOQ_Amount: formData?.BOQ_Amount || null,
                remarks: '',
                status: 'true',
            });
        }
        setTotalTAT(e.target.value === 'true' ? true : false);
    };
    const handleFormData = (e) => {
        console.log('WWW', e);
        const { name, value } = e?.target;
        console.log('AAA', name, value, e?.target);
        if (name !== 'remarks') {
            setFormData({ ...formData, [name]: parseFloat(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    const _getRuntimeId = (id) => {
        const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(id) && item?.module === module);

        return userAction?.runtimeId || 0;
    };
    const workFlowMandate = () => {
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: _getRuntimeId(mandateId.id) || 0,
            mandateId: mandateId?.id || 0,
            tableId: formData?.vendor_Id || 0,
            remark: 'Created',
            createdBy: user?.UserName || 'Admin',
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: 'Created',
        };
        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ''}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) return;
                if (response?.data === true) {
                    dispatch(showMessage('Submitted successfully!'));
                    navigate('/list/task');
                }
            })
            .catch((e: any) => {});
    };

    const handleSubmit = () => {
        formData['Mandates_Id'] = mandateId?.id;
        formData['vendor_Id'] = vendor?.vendorId;
        if (edit === false || totalTAT) {
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/SavePenaltyDetails`, formData)
                .then((response: any) => {
                    if (!response) return;
                    workFlowMandate();
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        } else {
            const data = [...allVendor];
            data[editIndex] = formData;
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/UpdateExcelData`, data)
                .then((response: any) => {
                    if (!response) return;
                    workFlowMandate();
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
    };

    return (
        <>
            <div className="invoicing">
                <Box component="h2" className="page-title-heading my-6">
                    Invoicing
                </Box>

                <div
                    style={{
                        backgroundColor: '#fff',
                        padding: '0px',
                        border: '1px solid #0000001f',
                        borderRadius: '5px',
                    }}
                    className="card-panal inside-scroll-194-invoicing"
                >
                    <div style={{ padding: '10px' }}>
                        <MandateInfo mandateCode={mandateId} setMandateData={setMandateData} source="" pageType="" redirectSource={'list'} setMandateCode={setMandateId} setCurrentStatus={setCurrentStatus} setCurrentRemark={setCurrentRemark} setpincode={() => {}} />
                    </div>
                    <div className="phase-outer" style={{ paddingLeft: '10px' }}>
                        <Grid marginBottom="2px" container item spacing={5} justifyContent="start" alignSelf="center">
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable">Vendor Category</h2>

                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        sx={
                                            user?.role === 'Vendor' && {
                                                backgroundColor: '#f3f3f3',
                                                borderRadius: '6px',
                                            }
                                        }
                                        getOptionLabel={(option) => {
                                            return option?.vendorcategory?.toString() || '';
                                        }}
                                        disabled={user?.role === 'Vendor'}
                                        disableClearable
                                        options={vendorCatInformation || []}
                                        placeholder="Vendor Category"
                                        onChange={(e, value: any) => {
                                            setVendor((state) => ({
                                                ...state,
                                                vendorname: value?.vendorname || '',
                                                vendorId: value?.id || 0,
                                                id: value?.id || 0,
                                                vendorcategory: value?.vendorcategory || '',
                                            }));
                                            handelCategoryChange(e, value);
                                        }}
                                        value={vendor || null}
                                        renderInput={(params) => (
                                            <TextField
                                                name="vendor_category"
                                                id="vendor_category"
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
                                    <h2 className="phaseLable">Vendor Name</h2>
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        sx={
                                            user?.role === 'Vendor' &&
                                            vendorInformation &&
                                            vendorInformation?.length === 1 && {
                                                backgroundColor: '#f3f3f3',
                                                borderRadius: '6px',
                                            }
                                        }
                                        disabled={user?.role === 'Vendor' && vendorInformation && vendorInformation?.length === 1}
                                        getOptionLabel={(option) => {
                                            return option?.vendorname?.toString() || '';
                                        }}
                                        disableClearable
                                        options={vendorInformation || []}
                                        onChange={(e, value: any) => {
                                            setVendor((state) => ({
                                                ...state,
                                                vendorname: value?.vendorname || '',
                                                vendorId: value?.id || 0,
                                                id: value?.id || 0,
                                                vendorcategory: value?.vendorcategory || '',
                                            }));
                                        }}
                                        value={user?.role === 'Vendor' && vendorInformation && vendorInformation?.length === 1 ? vendorInformation?.[0] : vendor || null}
                                        placeholder="Vendor Name"
                                        renderInput={(params) => (
                                            <TextField
                                                name="vendor_name"
                                                id="vendor_name"
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

                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example">
                                <Tab label="Invoice" value="1" to={`/mandate/${id}/invoicing`} component={Link} />
                                <Tab label="PO" value="2" to={`/mandate/${id}/quality-po`} component={Link} />
                                <Tab label="NDC" value="3" to={`/mandate/${id}/ndc`} component={Link} />
                                <Tab label="PENALTY CALCULATION" value="4" to={`/mandate/${id}/penalty-calculation`} component={Link} />
                            </TabList>
                        </Box>
                    </TabContext>
                    <div
                        style={{
                            padding: '10px !important',
                            border: '1px solid rgba(0, 0, 0, 0.12)',
                        }}
                        className="card-panal Tat-pad0"
                    >
                        <Grid container item spacing={5} justifyContent="start" alignSelf="center" sx={{ paddingTop: '0px!important' }}>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable">In TAT</h2>
                                    <ToggleSwitch alignment={totalTAT} handleChange={(e) => handleTat(e)} yes={'Yes'} no={'No'} name={'Qty'} id="Qty" onBlur={() => {}} disabled={action === 'Approve' && (user.role === 'Vendor' || user.role === 'Project Manager')} bold="false" />
                                </div>
                            </Grid>
                            {!totalTAT && (
                                <>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable">Total TAT</h2>
                                            <TextField
                                                name="total_TAT"
                                                id="total_TAT"
                                                type="number"
                                                variant="outlined"
                                                disabled={action === 'Approve' && (user.role === 'Vendor' || user.role === 'Project Manager')}
                                                size="small"
                                                className="w-85"
                                                value={formData?.total_TAT || ''}
                                                onChange={(value) => handleFormData(value)}
                                                onKeyDown={(e: any) => {
                                                    blockInvalidChar(e);
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable"> Total Number of delays</h2>
                                            <TextField
                                                name="total_Delays"
                                                id="total_Delays"
                                                variant="outlined"
                                                type="number"
                                                disabled={action === 'Approve' && (user.role === 'Vendor' || user.role === 'Project Manager')}
                                                size="small"
                                                className="w-85"
                                                value={formData?.total_Delays || ''}
                                                onChange={(value) => handleFormData(value)}
                                                onKeyDown={(e: any) => {
                                                    blockInvalidChar(e);
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable"> Penalty Matrix</h2>
                                            <TextField
                                                disabled={action === 'Approve' && (user.role === 'Vendor' || user.role === 'Project Manager')}
                                                name="penalty_Matrix"
                                                id="penalty_Matrix"
                                                variant="outlined"
                                                type="number"
                                                size="small"
                                                className="w-85"
                                                value={formData?.penalty_Matrix || ''}
                                                onChange={(value) => handleFormData(value)}
                                                onKeyDown={(e: any) => {
                                                    blockInvalidChar(e);
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form" style={{ marginTop: '0px' }}>
                                            <h2 className="phaseLable"> PO Amount</h2>
                                            <NumberFormatAmount
                                                state={formData}
                                                setState={setFormData}
                                                name="final_PO_Value"
                                                type="text"
                                                disabled
                                                id="final_PO_Value"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                inputValue={+formData?.final_PO_Value || 0}
                                                // onChange={(value) => handleFormData(value)}
                                            />
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form" style={{ marginTop: '0px' }}>
                                            <h2 className="phaseLable"> BOQ Amount</h2>
                                            <NumberFormatAmount state={formData} setState={setFormData} name="BOQ_Amount" type="text" disabled id="boq_Amount" variant="outlined" size="small" className="w-85" inputValue={+formData?.BOQ_Amount || 0} onChange={(value) => handleFormData(value)} />
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form" style={{ marginTop: '0px' }}>
                                            <h2 className="phaseLable"> Penalty Amount</h2>
                                            <NumberFormatAmount
                                                state={formData}
                                                setState={setFormData}
                                                name="penalty_Amount"
                                                type="text"
                                                disabled={action === 'Approve' && (user.role === 'Vendor' || user.role === 'Project Manager')}
                                                id="penalty_Amount"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                inputValue={+formData?.penalty_Amount || 0}
                                                onChange={handleFormData}
                                                onKeyDown={(e: any) => {
                                                    blockInvalidChar(e);
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form" style={{ marginTop: '0px' }}>
                                            <h2 className="phaseLable"> Remarks</h2>
                                            <TextField
                                                name="remarks"
                                                id="remarks"
                                                disabled={action === 'Approve' && (user.role === 'Vendor' || user.role === 'Project Manager')}
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={formData?.remarks || ''}
                                                onChange={(value) => handleFormData(value)}
                                                onKeyDown={(e: any) => {
                                                    regExpressionRemark(e);
                                                }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                        {mandateId && mandateId?.id && mandateId?.id !== undefined && (
                            <div className="bottom-fix-history">
                                <MandateStatusHistory mandateCode={mandateId?.id} accept_Reject_Remark={currentRemark} accept_Reject_Status={currentStatus} />
                            </div>
                        )}

                        {vendor && vendor?.vendorname !== '' && vendor?.vendorcategory !== '' && (
                            <>
                                {userAction?.module === module && (
                                    <>
                                        {action && action === 'Create' && (
                                            <div className="bottom-fix-btn">
                                                <div className="remark-field">
                                                    <Button variant="contained" type="submit" size="small" style={submit} onClick={handleSubmit}>
                                                        Submit
                                                    </Button>
                                                    {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {vendor?.vendorId && action && action === 'Approve' && !approvedStatus && (
                                    <div className="bottom-fix-btn ptb-0">
                                        <div className="remark-field" style={{ padding: '15px 0px' }}>
                                            <>
                                                <ApproveAndRejectAction
                                                    approved={approved}
                                                    sendBack={sendBack}
                                                    setSendBack={setSendBack}
                                                    setApproved={setApproved}
                                                    remark={remark}
                                                    setRemark={setRemark}
                                                    approveEvent={() => {
                                                        workflowFunctionAPICall(runtimeId, mandateId?.id, formData?.vendor_Id, remark, 'Approved', navigate, user);
                                                    }}
                                                    sentBackEvent={() => {
                                                        workflowFunctionAPICall(runtimeId, mandateId?.id, formData?.vendor_Id, remark, 'Sent Back', navigate, user);
                                                    }}
                                                />
                                                {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                                            </>
                                        </div>
                                    </div>
                                )}
                                {vendor?.vendorId && action && action?.trim() === 'Approve or Reject' && !approvedStatus && user?.role === 'Vertical Head' && (
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
                                                    workflowFunctionAPICall(runtimeId, mandateId?.id, formData?.vendor_Id, remark, 'Approved', navigate, user);
                                                }}
                                                sentBackEvent={() => {
                                                    workflowFunctionAPICall(runtimeId, mandateId?.id, formData?.vendor_Id, remark, 'Approved_Partial', navigate, user);
                                                }}
                                                rejectEvent={() => {
                                                    workflowFunctionAPICall(runtimeId, mandateId?.id, formData?.vendor_Id, remark, 'Rejected', navigate, user);
                                                }}
                                            />
                                            <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NDC;
