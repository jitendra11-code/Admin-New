import { Autocomplete, Box, Button, Grid, MenuItem, Select, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Tooltip, SwipeableDrawer } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFormik } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import AssetInfo from 'pages/common-components/AssetInformation';
import React, { useCallback, useEffect, useState } from 'react';
import groupByDocumentData from 'pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import { fetchError, showMessage } from 'redux/actions';
import { useDispatch } from 'react-redux';
import { reset } from 'shared/constants/CustomColor';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { AgGridReact } from 'ag-grid-react';
import { GridApi } from 'ag-grid-community';
import * as Yup from 'yup';
import { _validationMaxFileSizeUpload, downloadAssetFile, downloadFile } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import FileNameDiaglogList from 'pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox';
import DownloadIcon from '@mui/icons-material/Download';
import AssetCodeDrawer from './AssetCodeDrawer';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import { regExpressionRemark, textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';

const AssetInward = () => {
    const date = new Date();
    const [dateError, setDateError] = useState<any>('');
    const [value, setValue] = React.useState(moment(date).format());
    const { id } = useParams();
    const { user } = useAuthUser();
    const fileInput = React.useRef(null);
    const [apiCalled, setApiCalled] = useState(false);
    const [assetCode, setAssetCode] = useState<any>('');
    const [getPassId, setGetPassId] = useState('');
    const [getForeignKey, setGetForeignKey] = useState('');
    const [getPassTypeDropdown, setGetPassTypeDropdown] = useState([]);
    const [getAssetTypeDropdown, setGetAssetTypeDropdown] = useState([]);
    const [getPurposeTypeDropdown, setGetPurposeTypeDropdown] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [assetDataById, setAssetDataById] = useState([]);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const gridRef = React.useRef<AgGridReact>(null);
    const [assetData, setAssetData] = React.useState<any>([]);
    const [fromBranchDetails, setFromBranchDetails] = useState([]);
    const [toBranchDetails, setToBranchDetails] = useState([]);
    const [allData, setAllData] = React.useState<any>([]);
    const [assetRequestNo, setassetRequestNo] = useState('');
    const [authorizedDataOn, setAuthorizedDataOn] = useState('');
    const [userDetails, setUserDetails] = React.useState<any>([]);
    const [selectedDateTime, setSelectedDateTime] = useState(dayjs());
    const [fileLimit, setFileLimit] = useState(false);
    const [fileLength, setFileLength] = useState(0);
    const [requestIdNo, setRequestIdNo] = useState();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [docUploadHistory, setDocUploadHistory] = useState([]);
    const [openDrawerAssetCode, setOpenDrawerAssetCode] = useState(false);
    const [assetDrawerData, setAssetDrawerData] = React.useState(null);
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [loader, setLoader] = React.useState(false);
    const handleDateTimeChange = (dateTime) => {
        setSelectedDateTime(dateTime);
    };

    useEffect(() => {
        if (id && id != 'noid') {
            setAssetCode(getForeignKey);
        }
        // else{
        //   setAssetCode("0")
        // }
    }, [getForeignKey]);
    console.log('userDetails111', assetDataById?.[0]?.requestNo, allData?.id);
    console.log('getForeignKey', getForeignKey);

    const getAssetById = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestById?id=${id}`)
            .then((response: any) => {
                if (response && response?.data) {
                    setAssetDataById(response?.data);
                    setRequestIdNo(response?.data?.[0]?.id);
                }
            })
            .catch((e: any) => {});
    };
    console.log('assetDataById', assetDataById);
    const getGatePassType = async () => {
        await axios.get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=GatePassType`).then((response: any) => {
            const getPassType = response?.data;
            setGetPassTypeDropdown(getPassType);
            console.log('getPassType', getPassTypeDropdown);
        });
    };

    const getGatePassId = async () => {
        await axios.get(`${process.env.REACT_APP_BASEURL}/api/AssetGatePass/GetAssetGatePassRequestId`).then((response: any) => {
            // const getPassId = response?.data;
            // setGetPassTypeDropdown(getPassType);
            setGetPassId(response?.data);
            console.log('getPassid', getPassId);
        });
    };

    const getGateAssetType = async () => {
        await axios.get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Asset Type`).then((response: any) => {
            const getAssetType = response?.data;
            setGetAssetTypeDropdown(getAssetType);
            console.log('getAssetType', getAssetTypeDropdown);
        });
    };

    const getGatePurposeType = async () => {
        await axios.get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Purpose of Movement`).then((response: any) => {
            const getPurposeType = response?.data;
            setGetPurposeTypeDropdown(getPurposeType);
            console.log('getPurposeType', getPurposeTypeDropdown);
        });
    };

    const getAssetRequestMovementDetailsData = async (assetCode) => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestMovementDetailsByAssetId?assetId=${assetCode}`)
            .then((response: any) => {
                setAssetData(response?.data || []);
                console.log('res', response);
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        if (assetCode && assetCode != 'id') {
            getAssetRequestMovementDetailsData(assetCode);
        }
    }, [assetCode]);

    useEffect(() => {
        getGatePassType();
        getGateAssetType();
        getGatePurposeType();
        getGatePassId();
        setUserDetails(user);
    }, []);

    // useEffect(() => {
    //   getAssetById(getForeignKey);
    // }, [getForeignKey]);

    useEffect(() => {
        if (assetCode) getAssetById(assetCode);
    }, [assetCode]);

    const handleBackClick = () => {
        navigate('/AssetGateInwardList');
    };

    console.log('toBranchDetails', user?.userName);
    useEffect(() => {
        // if (id !== "noid" && id) {
        if (id !== 'noid' && id) {
            axios.get(`${process.env.REACT_APP_BASEURL}/api/AssetGatePass/GetAllAssetInwardDetails?Id=${id}&RequestId=`).then((response: any) => {
                const responseData = response?.data.find((item) => item.id == id);
                setAllData(responseData);
                console.log('response123', responseData);
                setAuthorizedDataOn(response?.authorized_on);
                setGetForeignKey(responseData?.fk_request_id);
                // setFieldValue(
                //   "requestNo",
                //   responseData?.assetRequests?.[0]?.requestNo
                // );
                // if (responseData?.gate_pass_no.length > 0) {
                // setFieldValue("gate_pass_no", responseData?.gate_pass_no);
                // } else {
                //   setFieldValue("gate_pass_no", getPassId);
                // }
                // setFieldValue("gate_pass_date", responseData?.gate_pass_date);
                // setFieldValue("gate_pass_date", moment(new Date()).format());
                // setFieldValue("gate_pass_type", responseData?.gate_pass_type);
                // setFieldValue("asset_type", responseData?.asset_type);
                // setFieldValue("retun_date", responseData?.retun_date);
                // setFieldValue("purpose", responseData?.purpose);
                setFieldValue('inward_ackn_by', response?.data?.[0]?.inward_ackn_by);
                setFieldValue('inward_ackn_emp_id', response?.data?.[0]?.inward_ackn_emp_id);
                setFieldValue('inward_ackn_remarks', response?.data?.[0]?.inward_ackn_remarks);
                // handleDateTimeChange(response?.data?.[0]?.inward_ackn_on);
                setFieldValue('inward_ackn_on', selectedDateTime);
                setFieldValue('inward_received_qty', response?.data?.[0]?.inward_received_qty);
                setFieldValue('inward_dmg_missing_qty', response?.data?.[0]?.inward_dmg_missing_qty);

                // console.log("userNameee",ackn_by)
                // setFieldValue("fk_request_id", responseData?.fk_request_id);
            });
        } else {
            axios.get(`${process.env.REACT_APP_BASEURL}/api/AssetGatePass/GetAssetGatePassDetails?Id=&fk_asset_request_id=${requestIdNo}`).then((response: any) => {
                const responseData = response?.data.find((item) => item.id == requestIdNo);
                setAllData(response?.data?.[0]);
                console.log('response1234', response?.data);
                setAuthorizedDataOn(response?.authorized_on);
                setGetForeignKey(response?.data?.[0]?.fk_request_id);
                // setFieldValue(
                //   "requestNo",
                //   response?.data?.[0]?.assetRequests?.[0]?.requestNo
                // );
                // if (response?.data?.[0]?.gate_pass_no.length > 0) {
                // setFieldValue("gate_pass_no", response?.data?.[0]?.gate_pass_no);
                // } else {
                //   setFieldValue("gate_pass_no", getPassId);
                // }
                // setFieldValue("gate_pass_date", response?.data?.[0]?.gate_pass_date);
                // setFieldValue("gate_pass_date", moment(new Date()).format());
                // setFieldValue("gate_pass_type", response?.data?.[0]?.gate_pass_type);
                // setFieldValue("asset_type", response?.data?.[0]?.asset_type);
                // setFieldValue("retun_date", response?.data?.[0]?.retun_date);
                // setFieldValue("purpose", response?.data?.[0]?.purpose);
                setFieldValue('inward_ackn_by', response?.data?.[0]?.inward_ackn_by);
                setFieldValue('inward_ackn_emp_id', response?.data?.[0]?.inward_ackn_emp_id);
                setFieldValue('inward_ackn_remarks', response?.data?.[0]?.inward_ackn_remarks);
                // if (response?.data?.[0]?.inward_ackn_on.length > 0) {
                //   handleDateTimeChange(response?.data?.[0]?.inward_ackn_on);
                //   setFieldValue("inward_ackn_on", selectedDateTime);
                // }else{
                setFieldValue('inward_ackn_on', selectedDateTime);
                // }
                setFieldValue('inward_received_qty', response?.data?.[0]?.inward_received_qty);
                setFieldValue('inward_dmg_missing_qty', response?.data?.[0]?.inward_dmg_missing_qty);

                // console.log("userNameee",ackn_by)
                // setFieldValue("fk_request_id", responseData?.fk_request_id);
            });
        }
    }, [id, requestIdNo]);

    const formatDateString = (dateString) => {
        const date = new Date(dateString);
        return `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()} & ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
    };

    const handleGetPassDate = (newValue) => {
        if (newValue !== null && dayjs(newValue).isValid()) {
            setDateError('');
            setValue(moment(new Date(newValue)).format());
            setFieldValue('gate_pass_date', moment(new Date(newValue)).format());
        } else {
            setDateError('please enter valid date');
        }
    };

    const getFromBranchDetails = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterDetails?Id=${assetDataById[0]?.fk_from_branch_id}`)
            .then((response: any) => {
                console.log('res', response);
                setFromBranchDetails(response?.data || []);
            })
            .catch((e: any) => {});
    };

    console.log('fromBranchDetails', fromBranchDetails);

    useEffect(() => {
        if (assetDataById[0]?.fk_from_branch_id !== undefined) {
            if (assetDataById[0]?.fk_from_branch_id || id) {
                getFromBranchDetails();
            }
        }
    }, [assetDataById[0]?.fk_from_branch_id, id]);

    const getToBranchDetails = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterDetails?Id=${assetDataById[0]?.fk_to_branch_id}`)
            .then((response: any) => {
                console.log('res', response);
                setToBranchDetails(response?.data || []);
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        if (assetDataById[0]?.fk_to_branch_id !== undefined) {
            if (assetDataById[0]?.fk_to_branch_id || id) {
                getToBranchDetails();
            }
        }
    }, [assetDataById[0]?.fk_to_branch_id, id]);

    console.log('assetDataById1', assetDataById);
    const handleReturnDate = (newValue) => {
        if (newValue !== null && dayjs(newValue).isValid()) {
            setDateError('');
            setValue(moment(new Date(newValue)).format());
            setFieldValue('retun_date', moment(new Date(newValue)).format());
        } else {
            setDateError('please enter valid date');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
        }
    };

    const getVersionHistoryData = async (rec_id) => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistoryForAssetPool?assetcode=${assetDataById?.[0]?.requestNo}&RecordId=&documentType=Asset Pool&entityname=Asset Inward`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }

                if (response?.data && response?.data && response?.data?.length > 0) {
                    var data = groupByDocumentData(response?.data, 'versionNumber');
                    setDocUploadHistory(data || []);
                    values['remark'] = '';
                }
                if (response && response?.data?.length === 0) {
                    setDocUploadHistory([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
                resetForm();
            });
    };

    React.useEffect(() => {
        if (assetDataById?.[0]?.requestNo !== undefined && allData?.id !== undefined) {
            getVersionHistoryData(id);
        }
    }, [id, assetDataById?.[0]?.requestNo, allData?.id]);

    const MAX_COUNT = 8;

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
        formData.append('assetcode', assetDataById?.[0]?.requestNo || 0);
        formData.append('documenttype', 'Asset Pool');
        formData.append('CreatedBy', user?.UserName);
        formData.append('ModifiedBy', user?.UserName);
        formData.append('entityname', 'Asset Inward');
        formData.append('RecordId', allData?.id || 0);
        formData.append('remarks', '');
        // formData.append('Remarks', values?.remark);

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

        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/imagestorage/FileUploadForAssetPool`, formData)
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
                    getVersionHistoryData(0);
                    return;
                } else if (response?.status === 200) {
                    setUploadedFiles([]);
                    setFileLimit(false);
                    dispatch(showMessage('Documents are uploaded Successfully.'));
                    getVersionHistoryData(allData?.id);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
                resetForm();
            });
    };

    const handleFileEvent = (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files);
        if (_validationMaxFileSizeUpload(e, dispatch)) {
            handleUploadFiles(chosenFiles);
        }
    };
    // console.log("foreginKey",foreginKey)
    const updatedAssetDetaildView = assetData.map((obj) => ({ ...obj, fk_asset_inward_id: '5', fk_gate_pass_id: 'five', fk_mov_req_id: obj?.id, id: 0 }));
    console.log('updatedAssetDetaildView', updatedAssetDetaildView, assetData);
    const { values, handleBlur, handleChange, setFieldValue, handleSubmit, setFieldError, errors, touched, resetForm } = useFormik({
        initialValues: {
            inward_ackn_by: '',
            inward_ackn_emp_id: '',
            inward_ackn_on: '',
            inward_ackn_remarks: '',
            inward_received_qty: '',
            inward_dmg_missing_qty: '',
            // fk_request_id: ""
        },
        // validationSchema: validateSchema,
        validationSchema: Yup.object({
            inward_ackn_remarks: Yup.string().required('Please enter Acknowledgement Remarks'),
            inward_received_qty: Yup.string().nullable().required('Please enter Received Quantity'),
            inward_dmg_missing_qty: Yup.string().nullable().required('Please enter Damaged / Received Quantity'),
        }),
        validateOnChange: true,
        validateOnBlur: false,
        onSubmit: (values, action) => {
            // debugger
            if (assetCode == '') return;
            console.log('submit', values);
            const body = {
                id: id === 'noid' ? 0 : parseInt(id),
                uid: '',
                asset_type: allData?.asset_type,
                gate_pass_type: allData?.gate_pass_type,
                gate_pass_no: allData?.gate_pass_no,
                purpose: allData?.purpose,
                gate_pass_date: allData?.gate_pass_date,
                retun_date: allData?.retun_date,
                fk_request_id: getForeignKey,
                authorized_by: '',
                authorized_emp_id: '',
                authorized_remarks: '',
                authorized_on: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                authorization_status: '',
                validated_by: '',
                validated_emp_id: '',
                validated_remarks: '',
                validated_on: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                validated_status: '',
                carrier_movement_by: allData?.carrier_movement_by,
                carrier_name: allData?.carrier_name,
                carrier_contact: '',
                inward_ackn_by: userDetails?.UserName,
                inward_ackn_emp_id: String(userDetails?.id),
                inward_ackn_on: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                inward_ackn_remarks: values?.inward_ackn_remarks,
                inward_received_qty: values?.inward_received_qty,
                inward_dmg_missing_qty: values?.inward_dmg_missing_qty,
                movementBy: '',
                name: '',
                courier_Person_ContactNumber: allData?.courier_Person_ContactNumber,
                individual_Vendor_Name: allData?.individual_Vendor_Name,
                courier_Person_Name: allData?.courier_Person_Name,
                courier_Person_PhoneNumber: allData?.courier_Person_PhoneNumber,
                status: '',
                createdBy: user?.UserName || 'Admin',
                createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                modifiedBy: user?.userName || 'Admin',
                modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                // assetRequest: assetDataById && assetDataById.map((item)=> {
                //   return {
                //     id: item?.id || 0,
                //     uid: "",
                //     type: item?.assetRequestType,
                //     classDescription: item?.classDescription,
                //     description: item?.description,
                //     category: item?.category,
                //     requiredQuantity: item?.requiredQuantity,
                //     dateofCommissioning: item?.dateofCommissioning,
                //     remarks : item?.remarks,
                //     requiredFor: item?.requiredFor,
                //     isSkip: item?.isSkip,
                //     requestStatus: item?.requestStatus,
                //     requestRemarks: item?.requestRemarks,
                //     requestNo: item?.requestNo,
                //     requesterName: item?.requesterName,
                //     requesterEmployeeID: item?.requesterEmployeeID,
                //     shiftingType: item?.shiftingType,
                //     branchName: item?.branchName,
                //     branchCode: item?.branchCode,
                //     branchAddress: item?.branchAddress,
                //     pinCode: item?.pinCode,
                //     city: item?.city,
                //     state: item?.state,
                //     fk_from_branch_id: item?.fk_from_branch_id,
                //     fk_to_branch_id: item?.fk_to_branch_id,
                //     status: item?.status,
                //     createdBy: item?.createdBy,
                //     createdDate: item?.createdDate,
                //     modifiedBy: item?.modifiedBy,
                //     modifiedDate: item?.modifiedDate
                //   }
                // })
            };
            // if (docUploadHistory?.length === 0) {
            //   dispatch(fetchError('Please Upload Documents'));
            //   return; // Prevent further execution of form submission logic
            // }
            console.log('body', body);
            // if(assetCode === "" || assetCode === null || assetCode === undefined ){
            //   dispatch(fetchError('Please select Request Number'));
            //   return;
            // }
            if (id && id != 'noid') {
                axios
                    .post(`${process.env.REACT_APP_BASEURL}/api/AssetGatePass/InsertOrUpdateAssetInward`, body)
                    .then((response: any) => {
                        if (!response) {
                            dispatch(fetchError('Gate Inward Pass details not updated'));
                            // setOpen(false);
                            return;
                        }
                        if (response && response?.data?.code === 200 && response?.data?.status === true) {
                            console.log('updatedAssetDetaildView123', response);
                            const updatedAssetDetaildView = assetData.map((obj) => ({ ...obj, fk_asset_inward_id: response?.data?.data?.id, fk_mov_req_id: obj?.id, id: 0 }));
                            axios
                                .post(`${process.env.REACT_APP_BASEURL}/api/AssetGatePass/InsertOrUpdateAssetInwardAssetDetailsList`, updatedAssetDetaildView)
                                .then((response: any) => {
                                    console.log('response', response);
                                })
                                .catch((e) => {
                                    console.log('e', e);
                                });
                            dispatch(showMessage('Gate Inward Pass Updated successfully'));
                            navigate('/AssetGateInwardList');
                            // setOpen(false);
                            // showRightData(body);
                            return;
                        } else {
                            dispatch(fetchError('Gate Inward Pass details already exists'));
                            // setOpen(false);
                            return;
                        }
                    })
                    .catch((e: any) => {
                        // setOpen(false);
                        dispatch(fetchError('Error Occurred !'));
                    });
            } else {
                axios
                    .post(`${process.env.REACT_APP_BASEURL}/api/AssetGatePass/InsertOrUpdateAssetInward`, body)
                    .then((response: any) => {
                        if (!response) {
                            dispatch(fetchError('Gate Inward Pass details not updated'));
                            // setOpen(false);
                            return;
                        }
                        if (response && response?.data?.code === 200 && response?.data?.status === true) {
                            const updatedAssetDetaildView = assetData.map((obj) => ({ ...obj, fk_asset_inward_id: response?.data?.data?.id, fk_mov_req_id: obj?.id, id: 0 }));
                            axios
                                .post(`${process.env.REACT_APP_BASEURL}/api/AssetGatePass/InsertOrUpdateAssetInwardAssetDetailsList`, updatedAssetDetaildView)
                                .then((response: any) => {
                                    console.log('response', response);
                                })
                                .catch((e) => {
                                    console.log('e', e);
                                });
                            dispatch(showMessage('Gate Inward Pass added successfully'));
                            navigate('/AssetGateInwardList');
                            // setOpen(false);
                            // showRightData(body);
                            return;
                        } else {
                            dispatch(fetchError('Gate Inward Pass details already exists'));
                            // setOpen(false);
                            return;
                        }
                    })
                    .catch((e: any) => {
                        // setOpen(false);
                        dispatch(fetchError('Error Occurred !'));
                    });
            }
        },
    });
    console.log('errors', errors);

    function onGridReady(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridApi(params.api);
    }

    const onFilterTextChange = async (e) => {
        gridApi?.setQuickFilter(e.target.value);
        if (gridApi.getDisplayedRowCount() == 0) {
            dispatch(fetchError('Data not found!'));
        }
    };

    let columnDefs = [
        // {
        //   field: "medals.bronze",
        //   headerName: "Action",
        //   headerTooltip: "Actions",
        //   width: 100,
        //   minWidth: 100,
        //   pinned: "left",
        //   cellRenderer: (e: any) => (
        //     <>
        //       <div className="actions">
        //         <Tooltip title="Edit Request" className="actionsIcons">
        //           <button
        //             className="actionsIcons actionsIconsSize"
        //             hidden={_validationIdentifierList.includes("request_edit_icon")}
        //           >
        //             <TbPencil
        //               onClick={() =>
        //                 // console.log("eval",e)
        //                 navigate(
        //                   `/${e?.data?.id}/asset-gate-pass`
        //                   // `/${e?.data?.id}/asset-gate-pass?action=update`
        //                 )
        //               }
        //             />
        //           </button>
        //         </Tooltip>
        //         {/* <Tooltip
        //           title="View Request"
        //           className="actionsIcons actionsIconsSize"
        //         >
        //           <button className="actionsIcons actionsIconsSiz">
        //             <VisibilityIcon
        //               style={{ fontSize: "15px" }}
        //               onClick={() =>
        //                 navigate(
        //                   `/intimation/${e?.data?.id}/create-request?action=view`
        //                 )
        //               }
        //             />
        //           </button>
        //         </Tooltip> */}
        //       </div>
        //     </>
        //   ),
        // },
        {
            field: 'assetCode',
            headerName: 'Asset Code',
            headerTooltip: 'Asset Code',
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
            sortable: true,
            resizable: true,
            width: 200,
            //   minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'assetType',
            headerName: 'Asset Type',
            headerTooltip: 'Asset Type',
            sortable: true,
            resizable: true,
            width: 120,
            // minWidth: 120,
            cellStyle: { fontSize: '13px' },
            // valueFormatter: (params) => {
            //   if (params?.data?.gate_pass_date !== null) {
            //     return moment(params?.data?.gate_pass_date).format("DD-MM-YYYY");
            //   }
            //   return "-";
            // },
        },
        {
            field: 'assetCategorisation',
            headerName: 'Asset Categorisation',
            headerTooltip: 'Asset Categorisation',
            sortable: true,
            resizable: true,
            width: 220,
            // minWidth: 180,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'assetClassDescription',
            headerName: 'Asset class description',
            headerTooltip: 'Asset class description',
            sortable: true,
            resizable: true,
            width: 350,
            //   minWidth: 140,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'asset_description',
            headerName: 'Asset description',
            headerTooltip: 'Asset description',
            sortable: true,
            resizable: true,
            width: 150,
            // minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'paV_Location',
            headerName: 'PAV Location',
            headerTooltip: 'PAV Location',
            sortable: true,
            resizable: true,
            width: 120,
            // minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'book_val',
            headerName: 'Book Value',
            headerTooltip: 'Book Value',
            sortable: true,
            resizable: true,
            width: 180,
            // minWidth: 180,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'balance_Useful_life_as_per_Finance',
            headerName: 'Balance Useful (Finance)',
            headerTooltip: 'Balance Useful Life as per Finance',
            sortable: true,
            resizable: true,
            width: 400,
            minWidth: 210,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'balance_Useful_life_as_per_Admin',
            headerName: 'Balance Useful (Admin)',
            headerTooltip: 'Balance Useful Life as per Admin',
            sortable: true,
            resizable: true,
            width: 400,
            minWidth: 200,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'used_Unused',
            headerName: 'Used / Unused',
            headerTooltip: 'Used / Unused',
            sortable: true,
            resizable: true,
            width: 400,
            minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
    ];
    let columnDefs1 = [
        {
            field: 'srno',
            headerName: 'Sr. No',
            headerTooltip: 'Serial Number',
            cellRenderer: (e: any) => {
                var index = e?.rowIndex;
                return index + 1;
            },

            sortable: true,
            resizable: true,
            width: 80,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'filename',
            headerName: 'File Name',
            headerTooltip: 'File Name',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.filename;
                data = data?.split('.');
                data = data?.[0];
                return data || '';
            },
            width: 200,
            minWidth: 200,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'documenttype',
            headerName: 'Document Type',
            headerTooltip: 'Document Type',
            sortable: true,
            resizable: true,
            width: 200,
            minWidth: 200,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdDate',
            headerName: 'Created Date',
            headerTooltip: 'Created Date',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.createdDate).format('DD/MM/YYYY');
            },
            width: 150,
            minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdDate',
            headerName: 'Created Time',
            headerTooltip: 'Created Time',
            cellRenderer: (e: any) => {
                return moment(e?.data?.createdDate).format('h:mm:ss A');
            },
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdBy',
            headerName: 'Created By',
            headerTooltip: 'Created By',
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'Download',
            headerName: 'Download',
            headerTooltip: 'Download',
            resizable: true,
            width: 100,
            minWidth: 100,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <Tooltip title="Download" className="actionsIcons">
                            <DownloadIcon
                                style={{ fontSize: '15px' }}
                                onClick={() => {
                                    downloadAssetFile(obj?.data, allData?.id, setLoader, dispatch);
                                }}
                                className="actionsIcons"
                            />
                        </Tooltip>
                    </div>
                </>
            ),
        },
        {
            field: '',
            headerName: 'View',
            headerTooltip: 'View',
            resizable: true,
            width: 100,
            minWidth: 100,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <FileNameDiaglogList props={obj} />
                    </div>
                </>
            ),
        },
    ];

    const getHeightForDocTable = useCallback(() => {
        const dataLength = docUploadHistory ? docUploadHistory.length : 0;

        if (dataLength === 0) {
            return '30px';
        } else if (dataLength === 1) {
            return '75px';
        } else if (dataLength === 2) {
            return '117px';
        } else if (dataLength === 3) {
            return '159px';
        } else {
            return '159px';
        }
    }, [docUploadHistory]);

    const getHeightForTable = useCallback(() => {
        const dataLength = assetData ? assetData.length : 0;

        if (dataLength === 0) {
            return '30px';
        } else if (dataLength === 1) {
            return '75px';
        } else if (dataLength === 2) {
            return '117px';
        } else if (dataLength === 3) {
            return '159px';
        } else {
            return '159px';
        }
    }, [assetData]);

    const handleButtonClick = () => {
        if (assetCode == '') {
            dispatch(fetchError('Please select Request Number'));
        }
    };
    return (
        <>
            <div>
                <Box component="h2" className="page-title-heading my-6">
                    Asset Inward Gate Pass
                </Box>

                <div className="card-panal" style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                    <AssetInfo
                        setassetRequestNo={setassetRequestNo}
                        assetCode={assetCode}
                        source=""
                        disabledStatus={true}
                        pageType="propertyAdd"
                        redirectSource={id !== 'noid' ? 'list' : ``}
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
              // marginBottom: "10px",
            }}
          ></div> */}
                    <div className={id === 'noid' ? 'card-panal inside-scroll-asset-227' : 'card-panal inside-scroll-asset-226'} style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                        <form onSubmit={handleSubmit}>
                            <Typography className="section-headingTop" style={{ marginTop: '0px' }}>
                                Gate Pass
                            </Typography>
                            <div className="phase-outer">
                                <Grid marginBottom="7px" container item spacing={5} justifyContent="start" alignSelf="center">
                                    {/* <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                    <div className="input-form">
                      <h2 className="phaseLable">Request Number</h2>
                      <TextField
                        // disabled
                        name="requestNo"
                        id="requestNo"
                        variant="outlined"
                        size="small"
                        className="w-85"
                        onChange={(e: any) =>
                          e.target.value?.length > 14
                            ? e.preventDefault()
                            : handleChange(e)
                        }
                        value={values?.requestNo}
                        // value={
                        //   id === "noid"
                        //     ? requestNumber.toUpperCase()
                        //     : values?.request_no.toUpperCase()
                        // }
                      />
                    </div>
                  </Grid> */}
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable">Gate Pass Number</h2>
                                            <TextField
                                                disabled
                                                name="gate_pass_no"
                                                id="gate_pass_no"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                onChange={(e: any) => {}}
                                                value={allData?.gate_pass_no}
                                                // value={
                                                //   id === "noid"
                                                //     ? requestNumber.toUpperCase()
                                                //     : values?.request_no.toUpperCase()
                                                // }
                                            />
                                        </div>
                                        {/* {touched.gate_pass_no && errors.gate_pass_no ? (
                      <p className="form-error">{errors.gate_pass_no}</p>
                    ) : null} */}
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div>
                                            <h2 className="phaseLable">Gate Pass Date</h2>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DesktopDatePicker
                                                    disabled
                                                    className="w-85"
                                                    inputFormat="DD/MM/YYYY"
                                                    value={allData?.gate_pass_date || '' || null}
                                                    // minDate={values.inspection_date}
                                                    onChange={(e: any) => {}}
                                                    renderInput={(params) => <TextField {...params} name="gate_pass_date" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                                                />
                                            </LocalizationProvider>
                                            {/* {touched.gate_pass_date && errors.gate_pass_date ? (
                        <p className="form-error">{errors.gate_pass_date}</p>
                      ) : null} */}
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable">Gate Pass Type</h2>
                                            <Select
                                                disabled
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="gate_pass_type"
                                                id="gate_pass_type"
                                                value={allData?.gate_pass_type || ''}
                                                onChange={(e: any) => {}}
                                                onBlur={handleBlur}
                                                sx={{
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '6px',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select Gate Pass Type</em>
                                                </MenuItem>
                                                {getPassTypeDropdown?.map((v: any) => (
                                                    <MenuItem value={v?.formName}>{v?.formName}</MenuItem>
                                                ))}
                                            </Select>
                                            {/* {touched.gate_pass_type && errors.gate_pass_type ? (
                        <p className="form-error">{errors.gate_pass_type}</p>
                      ) : null} */}
                                            {/* <TextField
                        // disabled
                        name="gate_pass_type"
                        id="gate_pass_type"
                        variant="outlined"
                        size="small"
                        className="w-85"
                        onChange={(e: any) =>
                          e.target.value?.length > 14
                            ? e.preventDefault()
                            : handleChange(e)
                        }
                        value={values?.gate_pass_type}
                        // value={
                        //   id === "noid"
                        //     ? requestNumber.toUpperCase()
                        //     : values?.request_no.toUpperCase()
                        // }
                      /> */}
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div>
                                            <h2 className="phaseLable">Date Of Return</h2>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DesktopDatePicker
                                                    disabled
                                                    className="w-85"
                                                    inputFormat="DD/MM/YYYY"
                                                    value={allData?.retun_date || '' || null}
                                                    // minDate={values.inspection_date}
                                                    onChange={(e: any) => {}}
                                                    renderInput={(params) => <TextField {...params} name="retun_date" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                                                />
                                            </LocalizationProvider>
                                            {/* {touched.retun_date && errors.retun_date ? (
                        <p className="form-error">{errors.retun_date}</p>
                      ) : null} */}
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable">Asset Type</h2>
                                            <Select
                                                disabled
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="asset_type"
                                                id="asset_type"
                                                value={allData?.asset_type || ''}
                                                onChange={(e: any) => {}}
                                                onBlur={handleBlur}
                                                sx={{
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '6px',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select Asset Type</em>
                                                </MenuItem>
                                                {getAssetTypeDropdown?.map((v: any) => (
                                                    <MenuItem value={v?.formName}>{v?.formName}</MenuItem>
                                                ))}
                                            </Select>
                                            {/* {touched.asset_type && errors.asset_type ? (
                        <p className="form-error">{errors.asset_type}</p>
                      ) : null} */}
                                            {/* <TextField
                        // disabled
                        name="asset_type"
                        id="asset_type"
                        variant="outlined"
                        size="small"
                        className="w-85"
                        onChange={(e: any) =>
                          e.target.value?.length > 14
                            ? e.preventDefault()
                            : handleChange(e)
                        }
                        value={values?.asset_type}
                        // value={
                        //   id === "noid"
                        //     ? requestNumber.toUpperCase()
                        //     : values?.request_no.toUpperCase()
                        // }
                      /> */}
                                        </div>
                                    </Grid>
                                    <Grid
                                        item
                                        xs={6}
                                        md={3}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        sx={{ position: 'relative' }}
                                    >
                                        <div className="input-form">
                                            <h2 className="phaseLable">Purpose Of Movement</h2>
                                            <Select
                                                disabled
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="purpose"
                                                id="purpose"
                                                value={allData?.purpose || ''}
                                                onChange={(e: any) => {}}
                                                onBlur={handleBlur}
                                                sx={{
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '6px',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select Purpose</em>
                                                </MenuItem>
                                                {getPurposeTypeDropdown?.map((v: any) => (
                                                    <MenuItem value={v?.formName}>{v?.formName}</MenuItem>
                                                ))}
                                            </Select>

                                            {/* {touched.purpose && errors.purpose ? (
                        <p className="form-error" style={{ marginTop: -5 }}>{errors.purpose}</p>
                      ) : null} */}
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>

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
                                                        To Branch Detailed
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
                                                    <TableCell className="font_bold">Branch Name & Code</TableCell>
                                                    <TableCell className="w-71">{toBranchDetails[0]?.branch_Name !== undefined ? `${toBranchDetails[0]?.branch_Name}-${toBranchDetails[0]?.branch_Code}` : ''}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font_bold w-35">Branch Address & PIN Code</TableCell>
                                                    <TableCell className="w-71">{toBranchDetails[0]?.address !== undefined ? `${toBranchDetails[0]?.address}-${toBranchDetails[0]?.pincode}` : ''}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font_bold">State & City</TableCell>
                                                    <TableCell className="w-71">{toBranchDetails[0]?.state !== undefined ? `${toBranchDetails[0]?.state}-${toBranchDetails[0]?.city}` : ''}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font_bold">Contact Person Name</TableCell>
                                                    <TableCell className="w-71">{toBranchDetails[0]?.branch_SPOC !== undefined ? toBranchDetails[0]?.branch_SPOC : ''}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font_bold width_30">Contact Person Number</TableCell>
                                                    <TableCell className="w-71">{toBranchDetails[0]?.branch_SPOC_Phone ? toBranchDetails[0]?.branch_SPOC_Phone : ''}</TableCell>
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
                                                        From Branch Detailed
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
                                                    <TableCell className="font_bold">Branch Name & Code</TableCell>
                                                    <TableCell className="w-71">{fromBranchDetails[0]?.branch_Name !== undefined ? `${fromBranchDetails[0]?.branch_Name}-${fromBranchDetails[0]?.branch_Code}` : ''}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font_bold w-35">Branch Address & PIN Code</TableCell>
                                                    <TableCell className="w-71">{fromBranchDetails[0]?.address !== undefined ? `${fromBranchDetails[0]?.address}-${fromBranchDetails[0]?.pincode}` : ''}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font_bold">State & City</TableCell>
                                                    <TableCell className="w-71">{fromBranchDetails[0]?.state !== undefined ? `${fromBranchDetails[0]?.state}-${fromBranchDetails[0]?.city}` : ''}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font_bold">Contact Person Name</TableCell>
                                                    <TableCell className="w-71">{fromBranchDetails[0]?.branch_SPOC !== undefined ? fromBranchDetails[0]?.branch_SPOC : ''}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font_bold width_30">Contact Person Number</TableCell>
                                                    <TableCell className="w-71">{fromBranchDetails[0]?.branch_SPOC_Phone ? fromBranchDetails[0]?.branch_SPOC_Phone : ''}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Grid>
                            </Grid>
                            <Typography className="section-headingTop" style={{ marginTop: 10 }}>
                                Asset Details
                            </Typography>
                            <div style={{ height: getHeightForTable(), marginBottom: '10px' }}>
                                <CommonGrid
                                    defaultColDef={{ flex: 1 }}
                                    columnDefs={columnDefs}
                                    rowData={assetData}
                                    // onGridReady={onGridReady}
                                    // gridRef={gridRef}
                                    onGridReady={null}
                                    gridRef={null}
                                    pagination={false}
                                    paginationPageSize={10}
                                />
                            </div>
                            <Typography className="section-headingTop" style={{ marginTop: 10 }}>
                                Authorization Details
                            </Typography>
                            <Grid item xs={12} md={12} sx={{ position: 'relative' }}>
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
                                            <TableRow sx={{ backgroundColor: '#f3f3f3 !important' }}>
                                                <TableCell align="center" className="font_bold w-25">
                                                    Authorized By
                                                </TableCell>
                                                <TableCell align="center" className="font_bold w-25">
                                                    Authorized Date & Time
                                                </TableCell>
                                                <TableCell align="center" className="font_bold w-25">
                                                    Authorized Employee ID
                                                </TableCell>
                                                <TableCell align="center" className="font_bold w-25">
                                                    Authorized Remarks
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="w-25">{allData?.authorized_by}</TableCell>
                                                <TableCell className="w-25">{allData?.authorized_on ? formatDateString(allData?.authorized_on) : ''}</TableCell>
                                                <TableCell className="w-25">{allData?.authorized_emp_id}</TableCell>
                                                <TableCell className="w-25">{allData?.authorized_remarks}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </Grid>
                            <Typography className="section-headingTop" style={{ marginTop: 10 }}>
                                Courier Details
                            </Typography>
                            <Grid item xs={12} md={12} sx={{ position: 'relative' }}>
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
                                            <TableRow sx={{ backgroundColor: '#f3f3f3 !important' }}>
                                                <TableCell align="center" className="font_bold w-12">
                                                    Movement By
                                                </TableCell>
                                                <TableCell align="center" className="font_bold w-16">
                                                    Name
                                                </TableCell>
                                                <TableCell align="center" className="font_bold w-20">
                                                    Courier / Person Contact Name
                                                </TableCell>
                                                <TableCell align="center" className="font_bold w-16">
                                                    Individual / Vendor Name
                                                </TableCell>
                                                <TableCell align="center" className="font_bold w-16">
                                                    Courier / Person Name
                                                </TableCell>
                                                <TableCell align="center" className="font_bold w-20">
                                                    Courier / Person Phone Number
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="w-12">{allData?.carrier_movement_by}</TableCell>
                                                <TableCell className="w-16">{allData?.carrier_name}</TableCell>
                                                <TableCell className="w-20">+91-{allData?.courier_Person_ContactNumber}</TableCell>
                                                <TableCell className="w-16">{allData?.individual_Vendor_Name}</TableCell>
                                                <TableCell className="w-16">{allData?.courier_Person_Name}</TableCell>
                                                <TableCell className="w-20">{allData?.courier_Person_PhoneNumber}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </Grid>
                            <Typography className="section-headingTop" style={{ marginTop: 10 }}>
                                Inward Details
                            </Typography>
                            <div className="phase-outer" style={{ marginBottom: '0px' }}>
                                <Grid marginBottom="7px" container item spacing={5} justifyContent="start" alignSelf="center">
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Acknowledged By</h2>
                                            <TextField
                                                disabled
                                                name="inward_ackn_by"
                                                id="inward_ackn_by"
                                                // type={"number"}
                                                variant="outlined"
                                                size="small"
                                                InputProps={{ inputProps: { min: 0 } }}
                                                inputProps={{ min: 0 }}
                                                className="w-85"
                                                value={userDetails?.UserName || ''}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                }}
                                            />
                                        </div>
                                        {/* {touched.inward_ackn_by && errors.inward_ackn_by ? (
                      <p className="form-error">{errors.inward_ackn_by}</p>
                    ) : null} */}
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Acknowledged By Employee ID</h2>
                                            <TextField
                                                disabled
                                                name="inward_ackn_emp_id"
                                                id="inward_ackn_emp_id"
                                                // type={"number"}
                                                variant="outlined"
                                                size="small"
                                                InputProps={{ inputProps: { min: 0 } }}
                                                inputProps={{ min: 0 }}
                                                className="w-85"
                                                value={userDetails?.id || ''}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                }}
                                            />
                                        </div>
                                        {/* {touched.inward_ackn_emp_id && errors.inward_ackn_emp_id ? (
                      <p className="form-error">{errors.inward_ackn_emp_id}</p>
                    ) : null} */}
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Acknowledgement Date & Time</h2>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DesktopDatePicker
                                                    disabled
                                                    className="w-85"
                                                    inputFormat="DD/MM/YYYY & HH:mm" // Adjust the format to include time
                                                    value={moment().format('YYYY-MM-DDTHH:mm:ss.SSS')} // Use the selectedDateTime state as the value
                                                    onChange={handleDateTimeChange} // Handle date and time changes
                                                    renderInput={(params) => <TextField {...params} name="inward_ackn_on" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                                                />
                                            </LocalizationProvider>
                                        </div>
                                        {/* {touched.inward_ackn_on && errors.inward_ackn_on ? (
                      <p className="form-error">{errors.inward_ackn_on}</p>
                    ) : null} */}
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Acknowledgement Remarks</h2>
                                            <TextField
                                                name="inward_ackn_remarks"
                                                id="inward_ackn_remarks"
                                                // type={"number"}
                                                variant="outlined"
                                                size="small"
                                                InputProps={{ inputProps: { min: 0 } }}
                                                inputProps={{ min: 0 }}
                                                className="w-85"
                                                value={values?.inward_ackn_remarks || ''}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                }}
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
                                        </div>
                                        {touched.inward_ackn_remarks && errors.inward_ackn_remarks ? <p className="form-error">{errors.inward_ackn_remarks}</p> : null}
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Received Quantity</h2>
                                            <TextField
                                                autoComplete="off"
                                                name="inward_received_qty"
                                                id="inward_received_qty"
                                                type="number"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values?.inward_received_qty}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                }}
                                                onKeyDown={handleKeyPress}
                                                onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
                                            />
                                        </div>
                                        {touched.inward_received_qty && errors.inward_received_qty ? <p className="form-error">{errors.inward_received_qty}</p> : null}
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Damaged / Missing Quantity</h2>
                                            <TextField
                                                name="inward_dmg_missing_qty"
                                                id="inward_dmg_missing_qty"
                                                type="number"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values?.inward_dmg_missing_qty}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                }}
                                                onKeyDown={handleKeyPress}
                                                onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
                                            />
                                        </div>
                                        {touched.inward_dmg_missing_qty && errors.inward_dmg_missing_qty ? <p className="form-error">{errors.inward_dmg_missing_qty}</p> : null}
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable">Attach Picture</h2>
                                            <div>
                                                <Tooltip title="Upload">
                                                    <Button
                                                        onClick={() => {
                                                            fileInput.current.click();
                                                        }}
                                                        variant="outlined"
                                                        size="medium"
                                                        // style={secondaryButton}
                                                        sx={
                                                            // (user?.role === 'Compliance Partner' && stageName === 'Translate Document') ||
                                                            // (user?.role === 'Payroll Team' && stageName === 'Payroll -Team Documents To Upload') ||
                                                            // (user?.role === 'Exit Team' && stageName === 'Exit Team- Documents To Upload') ||
                                                            // (stageName === 'Receives Acknowledgment Receipt' && user?.role === 'Compliance Partner')
                                                            //     ? { padding: '5px 20px', border: '1px solid red', color: 'rgb(0, 49, 106)', marginRight: '10px' }
                                                            // :
                                                            {
                                                                padding: '5px 20px',
                                                                color: 'rgb(0, 49, 106)',
                                                                borderColor: 'rgb(0, 49, 106)',
                                                                marginRight: '10px',
                                                            }
                                                        }
                                                        // disabled={_validationIdentifierList.includes('btn_request_upload')}
                                                    >
                                                        Upload
                                                    </Button>
                                                </Tooltip>
                                                <input
                                                    ref={fileInput}
                                                    multiple
                                                    onChange={handleFileEvent}
                                                    disabled={fileLimit}
                                                    accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
                                      text/plain, application/pdf, image/*"
                                                    type="file"
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                            <Typography
                                className="section-headingTop"
                                // style={{ marginTop: 10 }}
                            >
                                Document
                            </Typography>
                            {/* {docUploadHistory.length > 0 && */}
                            {/* <div style={{marginBottom:"30px"}}> */}
                            <div style={{ height: getHeightForDocTable(), marginBottom: '0px' }}>
                                <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs1} rowData={docUploadHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={docUploadHistory?.length > 4 ? true : false} paginationPageSize={4} />
                            </div>
                            {/* </div> */}
                            {/* } */}
                            {id && id !== undefined && id !== 'noid' && (
                                <div className="bottom-fix-history" style={{ marginBottom: '-15px' }}>
                                    {<MandateStatusHistory mandateCode={assetCode} accept_Reject_Status={currentStatus} accept_Reject_Remark={currentRemark} />}
                                </div>
                            )}
                            <div className="bottom-fix-btn">
                                <div className="remark-field">
                                    <Tooltip title="Back">
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            type="reset"
                                            style={reset}
                                            sx={{
                                                padding: '6px 20px !important',
                                                marginRight: '10px !important',
                                            }}
                                            onClick={handleBackClick}
                                        >
                                            Back
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Submit">
                                        <Button
                                            style={{
                                                padding: '2px 20px',
                                                borderRadius: 6,
                                                color: 'rgb(255, 255, 255)',
                                                borderColor: 'rgb(0, 49, 106)',
                                                backgroundColor: 'rgb(0, 49, 106)',
                                            }}
                                            variant="outlined"
                                            size="small"
                                            type="submit"
                                            onClick={handleButtonClick}
                                        >
                                            Submit
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>
                        </form>
                        {/* <div className="bottom-fix-history">{id && id !== undefined && id !== 'noid' && <MandateStatusHistory mandateCode={id} accept_Reject_Status={currentStatus} accept_Reject_Remark={currentRemark} />}</div> */}
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
                    </div>
                </div>
            </div>
        </>
    );
};

export default AssetInward;
