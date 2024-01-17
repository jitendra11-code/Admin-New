import { Autocomplete, Button, Grid, TextField, Typography, FormControlLabel, Checkbox, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ToggleSwitch from '@uikit/common/ToggleSwitch';
import { CreateRequestInitialValues, createRequestSchema } from '@uikit/schemas';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import { useFormik } from 'formik';
import MandateInfo from 'pages/common-components/MandateInformation';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toggleTitle, secondaryButton, errorClass } from 'shared/constants/CustomColor';
import { reset, submit } from 'shared/constants/CustomColor';
import { useUrlSearchParams } from 'use-url-search-params';
import axios from 'axios';
import moment from 'moment';
import { fetchError, showMessage } from 'redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';
import { downloadFile, downloadTemplate, _validationMaxFileSizeUpload } from '../Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import groupByDocumentData from 'pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import DownloadIcon from '@mui/icons-material/Download';
import { AgGridReact } from 'ag-grid-react';
import { AppState } from 'redux/store';
import MandateStatusHistory from 'pages/common-components/MandateInformation/ComplienceMandateStatusHistory';
import regExpressionTextField, { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';
import dayjs, { Dayjs } from 'dayjs';
import StatusValueEditor from 'pages/Mandate/PropertyManagment/Components/ProjectPlan/Editors/StatusValueEditor';
import * as Yup from 'yup';
import { getIdentifierList } from '@uikit/common/Validation/getIdentifierListMenuWise';
import FileNameDiaglogList from 'pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox';
import {} from 'react-router-dom';
import ApproveSendBackRejectAction from 'pages/common-components/ApproveSendBackRejectAction';
import ApproveAndRejectAction from 'pages/common-components/ApproveRejectAction';
import workflowFunctionAPICall from 'pages/Mandate/workFlowComplienceActionFunction';
import { store } from 'redux/store';
import { styled } from '@mui/system';
import CustomeDialogBox from './CustomeDialogBox';
import ApproveAndRejectActionForCompliance from 'pages/common-components/ApproveAndRejectActionForCompliance';

const notesValue = {
    key: 'ElectricityDocument',
    name: 'Electricity Document',
};

const bOQValue = {
    key: 'Intimation Request Document',
    name: 'Intimation Request Document',
};

const optionsDropDown = [
    {
        bOQValue,
    },
];

const CreateRequest = () => {
    const date = new Date();
    const { user } = useAuthUser();
    const [vendorNameOption, setVendorNameOption] = React.useState([]);
    const [error, setError] = useState(null);
    const [mandateInfo, setMandateData] = React.useState(null);
    const [docType, setDocType] = useState(null);
    const [boqDrp, setBoQ] = useState<any>(bOQValue);
    const cat = { vendor_category: { vendorcategory: '' } };
    const [pincode, setpincode] = useState('');
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [notesDrp, setNotesDrp] = useState<any>(notesValue);
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [switchOn, setSwitchOn] = React.useState(true);
    const [sendBack, setSendBack] = React.useState(false);
    const [rejected, setRejected] = React.useState(false);
    const [approved, setApproved] = React.useState(false);
    const [sendBackFlag, setSendBackFlag] = React.useState(false);
    const [flag, setFlag] = React.useState(false);
    const fileInput = React.useRef(null);
    const [fileLimit, setFileLimit] = useState(false);
    const [fileLength, setFileLength] = useState(0);
    const [docUploadHistory, setDocUploadHistory] = useState([]);
    const { id } = useParams();
    const [mandateCode, setMandateCode] = useState<any>('');
    const [toggleSwitch, settoggleSwitch] = React.useState<any>({
        traslation_required: false,
        isAuthority_Available: true,
        isSatisfied: true,
    });
    const [alignment, setAlignment] = React.useState('yes');
    const [value, setValue] = React.useState(moment(date).format());
    const [vendorNameIds, setVendorNameIds] = useState({});
    const [contactError, setContactError] = useState(null);
    const [value1, setValue1] = useState<any>({});
    const [_validationIdentifierList, setValidationIdentifierList] = React.useState([]);

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [gridApi, setGridApi] = React.useState(null);
    const [userComplienceAction, setUserComplienceAction] = React.useState(null);
    const complienceAction = (userComplienceAction && userComplienceAction?.action) || '';
    const runtimeId = userComplienceAction?.runtimeId || 0;
    const location = useLocation();
    const [locationData, setLocationData] = useState('');
    const apiType = location?.state?.apiType || '';
    const { userComplienceActionList } = useSelector<AppState, AppState['userComplienceAction']>(({ userComplienceAction }) => userComplienceAction);

    const [payroll, setPayroll] = useState(CreateRequestInitialValues.payroll_team);
    const [exit, setExit] = useState(CreateRequestInitialValues.exit_team);
    const [requestNumber, setRequestNumber] = useState('');
    const [requestId, setRequestId] = useState('');
    const [contactFocused, setContactFocused] = useState(false);
    const [updateData, setUpdateData] = useState<any>({});
    const [formData, setFormData] = React.useState<any>({
        id: 0,
        uid: 'string',
        mandateId: 0,
        vendor_Id: 0,
        vendor_category: '',
        vendor_code: '',
        vendor_name: '',
        po_number: '',
        po_amount: '',
        po_release_date: new Date().toISOString().substring(0, 10),
        is_file_upload: false,
        remarks: '',
        status: '',
        createdby: user?.UserName,
        createddate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
        modifiedby: user?.UserName,
        modifieddate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
    });
    const navigate = useNavigate();
    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const [params]: any = useUrlSearchParams({}, {});
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const gridRef = React.useRef<AgGridReact>(null);
    const [electricityDetails, setElectricityDetails] = React.useState<any>([]);
    const [deliveryData, setDeliveryData] = useState<any>({});
    const [dateError, setDateError] = useState<any>('');
    const [remark, setRemark] = useState('');

    const handleBackClick = () => {
        const currentPath = window.location.pathname;
        if (currentPath === '/intimation-request-list') {
            navigate('/intimation-my-request-list');
        } else {
            navigate('/intimation-request-list');
        }
    };

    const [noticeTypeDropdown, setNoticeTypeDropdown] = useState([]);
    const [noticeSubTypeOption, setNoticeSubTypeOption] = useState([]);
    const [initimationTypeDropdown, setInitimationTypeDropdown] = useState([]);
    const [cityDropdown, setCityDropdown] = useState([]);
    const [stateDropdown, setStateDropdown] = useState([]);
    const [BranchCode, setBranchCode] = useState([]);
    const [branchDataDropdown, setBranchDataDropdown] = useState([]);
    const [reportedLocationOption, setReportedLocationOption] = useState([]);
    const [ReportedLocation, setReportedLocation] = useState([]);
    const [actsDropdown, setActsDropdown] = useState([]);
    const [noticeCategoryOption, setNoticeCategoryOption] = useState([]);
    const [statusDropdown, setStatusDropdown] = useState([]);
    const [submitFlag, setSubmitFlag] = React.useState(false);
    const [keyCount, setKeyCount] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [NoticeSubTypeDropdown, setNoticeSubTypeDropdown] = useState([]);
    const [NoticeCategoryDropdown, setNoticeCategoryDropdown] = useState([]);
    const [cityName, setCityName] = useState('');
    const [stateId, setStateId] = useState('');
    const [stateName, setStateName] = useState('');
    const [stageName, setStageName] = useState('');
    const [stageNameHrc, setStageNameHrc] = useState('');
    const [buttonName, setButtonName] = useState('');
    const [noticeTypeName, setNoticeTypeName] = useState('');
    const [dropDownById, setDropDownById] = useState({});
    const [tableId, setTableId] = useState(0);
    const [loader, setLoader] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const handleClickOpen = () => {
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleConfirmSubmit = () => {
        // Logic for submitting the form
        // You can place your form submission logic here
        handleSubmit();
        setOpenDialog(false);
    };
    const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
        '& .MuiSvgIcon-root': {
            width: 20, // Change the width to your desired size
            height: 20, // Change the height to your desired size
        },
    }));
    const CenteredFormControlLabel = styled(FormControlLabel)`
        display: flex;
        margin-left: 0px;
        margin-bottom: 3px;
    `;
    const noticeTypeDisable = params?.action === 'view' ? true : _validationIdentifierList.includes('request_notice_type');

    const noticeSubTypeDisable = params?.action === 'view' ? true : _validationIdentifierList.includes('request_noticesub_type');

    const intimationTypeDisable = params?.action === 'view' ? true : _validationIdentifierList.includes('request_intimation_type');

    const cityDisable = params?.action === 'view' ? true : _validationIdentifierList.includes('request_city');

    const stateDisable = params?.action === 'view' ? true : _validationIdentifierList.includes('request_state');

    const branchCodeDisable = params?.action === 'view' ? true : _validationIdentifierList.includes('request_branch_code');

    const reportedLocationDisable = params?.action === 'view' ? true : _validationIdentifierList.includes('request_location');

    const actsDisable = params?.action === 'view' ? true : _validationIdentifierList.includes('request_acts');

    const inspectionDateDisable = params?.action === 'view' ? true : _validationIdentifierList.includes('request_inspection_date');

    const closureDateDisable = params?.action === 'view' ? true : _validationIdentifierList.includes('request_closure_date');

    const statusDisable = params?.action === 'view' ? true : _validationIdentifierList.includes('request_stage');

    const remarksDisable = params?.action === 'view' ? true : _validationIdentifierList.includes('request_remarks');

    const handleReset = () => {
        if (id == 'noid') {
            resetForm();
            setValue1({
                noticeType: value1?.noticeType,
                noticeSubType: '',
                initimationType: '',
                state: '',
                city: '',
                branchCode: '',
                reportedLocation: '',
                acts: '',
                noticeCategory: '',
                status: value1?.status,
            });
            setPayroll(false);
            setExit(false);
            settoggleSwitch({
                traslation_required: false,
                isAuthority_Available: true,
                isSatisfied: true,
            });
            setFieldValue('inspection_date', moment(new Date()).format());
            setFieldValue('inspector_email', '');
            setFieldValue('inspector_contact', '');
            setFieldValue('noticeType', value1?.noticeType?.masterName);
            setFormData({ inspector_email: '', inspector_contact: '' });
        }
    };

    const getMyRequest = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetMyComplianceRequest?rollname=${user?.role}&username=${user?.UserName}`)
            .then((response: any) => {
                const filterData = response?.data.find((item) => item.Id == id);
                setStageName(filterData?.WorkItem);
                const filterData1 = response?.data.find((item) => item.WorkItem == 'HR Compliance Review Request' && item.Id == id);
                setStageNameHrc(filterData1?.WorkItem);
            })
            .catch((e: any) => {});
    };
    useEffect(() => {
        getMyRequest();
    }, [id]);

    const getState = async () => {
        await axios.get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=StateMaster&conditions`).then((response: any) => {
            const state = response?.data?.data;
            setStateDropdown(state);
        });
    };
    const GetCityByState = async () => {
        await axios.get(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetCityByState?stateId=${stateId}`).then((response: any) => {
            const city = response?.data;
            setCityDropdown(city);
        });
    };

    const getBranchData = async () => {
        await axios
            .get(
                // `${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetBranchLocation?state=${stateName}&city=${cityName}&branchCode=${BranchCode}`
                `${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetBranchLocation?state=${stateName}&city=${cityName}&branchCode=`,
            )
            .then((response: any) => {
                const branchData = response?.data;
                setBranchDataDropdown(branchData);
            });
    };

    function base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    const DownloadZipFile = (e) => {
        var list: any = [];
        docUploadHistory &&
            docUploadHistory?.length > 0 &&
            docUploadHistory.map((item) => {
                list?.push(item?.filename);
            });
        if (list && list.length === 0) {
            dispatch(fetchError('No files available to download'));
            return;
        }
        if (id === undefined || id === null) {
            dispatch(fetchError('Please select Mandate !!!'));
            return;
        }
        const fileId = id !== 'noid' ? id : requestNumber?.split('_')[1];
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/DownloadZipFile?mandateid=0&recordId=${fileId}`, list, {})
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error occurred in downloading file !!!'));
                    return;
                }
                if (response?.data) {
                    var filename = response?.data?.filename || '';
                    if (filename && filename === '') {
                        dispatch(fetchError('Error Occurred !'));
                        return;
                    }
                    var blob = new Blob([base64ToArrayBuffer(response?.data?.base64String)], { type: 'application/zip' });
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

                        dispatch(showMessage('Document is downloaded successfully!'));
                    }
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const getMasterData = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetComplianceCommonMaster?mastercategory=&parentId=`)
            .then((response: any) => {
                const data = response?.data;
                const drop = { ...dropDownById };
                const masterNameById = data?.map((v) => {
                    const temp = { ...drop[v?.mastercategory], [v?.id]: v };
                    drop[v?.mastercategory] = temp;
                });
                // setDropDownById(masterNameById);
                setDropDownById(drop);
                if (id == 'noid') {
                    const val = response?.data?.filter((v) => v?.mastercategory == 'Notice Type' && v?.masterName == 'Compliance Notice');
                    const val1 = response?.data?.filter((v) => v?.mastercategory == 'Status' && v?.masterName == 'Open');
                    filterNoticeSubType(val?.[0]?.masterName);
                    setValue1({
                        ...value1,
                        ['noticeType']: val?.[0],
                        ['status']: val1?.[0],
                    });
                    setFieldValue('noticeType', val?.[0]?.masterName);
                    setFieldValue('status', val1?.[0]?.masterName);
                }
                setNoticeTypeDropdown(response?.data?.filter((v) => v?.mastercategory == 'Notice Type'));

                setNoticeSubTypeOption(response?.data?.filter((v) => v?.mastercategory == 'Notice Sub Type'));

                setInitimationTypeDropdown(response?.data?.filter((v) => v?.mastercategory == 'Initimation Type'));
                setCityDropdown(response?.data?.filter((v) => v?.mastercategory == 'City'));
                setActsDropdown(response?.data?.filter((v) => v?.mastercategory == 'Acts'));
                setNoticeCategoryOption(response?.data?.filter((v) => v?.mastercategory == 'Notice Category'));
                setStatusDropdown(response?.data?.filter((v) => v?.mastercategory == 'Status'));
            })
            .catch((e: any) => {
                resetForm();
            });
    };

    useEffect(() => {
        if (id == 'noid') {
            resetForm();
            setValue1({
                noticeType: value1?.noticeType,
                noticeSubType: '',
                initimationType: '',
                state: '',
                city: '',
                branchCode: '',
                reportedLocation: '',
                acts: '',
                noticeCategory: '',
                status: value1?.status,
            });
            setPayroll(false);
            setExit(false);
            settoggleSwitch({
                traslation_required: false,
                isAuthority_Available: true,
                isSatisfied: true,
            });
            setFieldValue('inspection_date', moment(new Date()).format());
            setFieldValue('inspector_contact', '');
            setFieldValue('noticeType', value1?.noticeType?.masterName);
            setFormData({ inspector_email: '', inspector_contact: '' });
        }
    }, [id]);

    useEffect(() => {
        getMasterData();
        getState();
    }, [id]);

    useEffect(() => {
        if (stateId) {
            GetCityByState();
        }
    }, [id, stateId]);

    const getIdentifierListCreateReq = (action) => {
        let path = window.location.pathname?.split('/');
        let url: any = window.location.pathname?.split('/')?.[path.length - 1];
        var menuList = store?.getState()?.menu?.userOriginalMenuList || [];
        if (menuList && menuList?.length === 0) return [];
        var identifireList: any;
        identifireList = menuList && menuList?.length > 0 && menuList.find((item) => item?.menuname && typeof item?.menuname !== 'object' && item?.menuname === action && item?.isparent == 1);
        identifireList = identifireList?.componantlist;
        if (identifireList && typeof identifireList !== 'object') {
            identifireList = identifireList && identifireList?.split(',');
            return identifireList || [];
        }
        return [];
    };

    const action1 = id === 'noid' ? 'Create Request' : params?.action === 'update' ? 'View Request' : 'My Request';
    const result = getIdentifierListCreateReq(action1);
    useEffect(() => {
        var _validationIdentifierList = getIdentifierListCreateReq(action1);
        setValidationIdentifierList(_validationIdentifierList?.map((v: any) => v.trim()) || []);
    }, []);

    useEffect(() => {
        if (cityName && stateName && BranchCode) {
            getBranchData();
        }
    }, [cityName, stateName]);

    useEffect(() => {
        if (noticeSubTypeOption?.length > 0) {
            filterNoticeSubType(values?.noticeType);
        }
    }, [noticeSubTypeOption]);

    const filterNoticeSubType = (val) => {
        if (noticeSubTypeOption?.length > 0) {
            setNoticeSubTypeDropdown(noticeSubTypeOption?.filter((v) => v?.parentMaster == val));
        }
    };

    useEffect(() => {
        if (noticeCategoryOption?.length > 0) {
            filterNoticeCategory(values?.noticeSubType);
            setLoader(false);
        } else {
            setLoader(false);
        }
    }, [noticeCategoryOption]);

    const filterNoticeCategory = (val) => {
        if (noticeCategoryOption?.length > 0) {
            setNoticeCategoryDropdown(noticeCategoryOption?.filter((v) => v?.parentMaster == val));
        }
    };

    function isValidEmailFormat(email) {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            return false;
        }

        const specialChars = /[!#$%^&*()+=\[\]{}\\|<>\/?]+/;
        if (specialChars.test(email)) {
            return false;
        }

        return true;
    }

    function isValidContactNo(contactno) {
        let regExp = new RegExp('^[9,8,7,6][0-9]*$');
        let regExp2 = new RegExp('\\d{10}');
        return regExp.test(contactno);
    }

    // const handleChangeContactno = (e: any) => {
    //   if (!isValidContactNo(e.target.value) && e.target.value.trim() !== "") {
    //     setContactError("Contact Number must be start with 9,8,7 or 6");
    //   } else if (e.target.value?.length < 10 && e.target.value.trim() !== "") {
    //     setContactError("Contact Number must be 10 digit");
    //   } else {
    //     setContactError(null);
    //   }
    //   const { name, value } = e.target;
    //   setFormData({ ...formData, [name]: value });
    // };

    const handleChangeContactno = (e: any) => {
        if (!isValidContactNo(e.target.value) && e.target.value.trim() !== '') {
            setContactError('Contact Number must start with 9, 8, 7, or 6');
            setFormData({ ...formData, inspector_contact: '' }); // Remove the entered number
        } else if (e.target.value?.length < 10 && e.target.value.trim() !== '') {
            setContactError('Contact Number must be 10 digits');
            setFormData({ ...formData, inspector_contact: '' }); // Remove the entered number
        } else {
            setContactError(null);
        }
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleChangeEmail = (e: any) => {
        if (!isValidEmailFormat(e.target.value) && e.target.value.trim() !== '') {
            setError('Please enter valid Email Id');
        } else {
            setError(null);
        }
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleToggle = (e: any) => {
        const val = e.target.value === 'true' ? true : false;
        setSwitchOn(val);
    };

    React.useEffect(() => {
        if (id !== 'noid' && id) {
            setMandateCode(id);
        }
    }, []);

    React.useEffect(() => {
        var userAction = null;
        if (userComplienceActionList?.length > 0) {
            userAction = userComplienceActionList && userComplienceActionList?.find((item) => item?.tableId === parseInt(params?.tableId) && item?.module === module);
            setUserComplienceAction(userAction);
        }
    }, [id, userComplienceActionList]);

    let columnDefs = [
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
            width: 300,
            minWidth: 200,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'documenttype',
            headerName: 'Document Type',
            headerTooltip: 'Document Type',
            sortable: true,
            resizable: true,
            width: 300,
            minWidth: 200,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'remarks',
            headerName: 'Remark',
            headerTooltip: 'Remark',
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
            width: 100,
            minWidth: 100,
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
            width: 100,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdBy',
            headerName: 'Created By',
            headerTooltip: 'Created By',
            sortable: true,
            resizable: true,
            width: 100,
            minWidth: 100,
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
                            <DownloadIcon style={{ fontSize: '15px' }} onClick={() => downloadFile(obj?.data, mandateCode, dispatch)} className="actionsIcons" />
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

    const getData = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ElectricityDetails/GetElctricityDetails?id=${mandateCode?.id}`)
            .then((response: any) => {
                setDeliveryData(response?.data?.[0]);
                settoggleSwitch({
                    ...toggleSwitch,
                    electricityConnection: response?.data?.[0]?.electricity_connection_by == 'BFL' ? true : false,
                });
                setFieldValue('electricityConnection', response?.data?.[0]?.electricity_connection_by == 'BFL' ? true : false ?? true);
                setFieldValue('inspector_name', response?.data?.[0]?.inspectorname ?? '');
                setFieldValue('accountNumber', response?.data?.[0]?.account_no ?? '');
                setFieldValue('vendorCode', response?.data?.[0]?.vendor_code ?? '');
                setFieldValue('meterNumber', response?.data?.[0]?.meter_no ?? '');
                setFieldValue('connectionStartMeterReading', response?.data?.[0]?.connection_start_meter_reading ?? '');
                setFieldValue('connectionDate', response?.data?.[0]?.connection_date ?? new Date());
                setValue(response?.data?.[0]?.connection_date ?? new Date());
                setFieldValue('remark', response?.data?.[0]?.remark ?? '');
            })
            .catch((e: any) => {
                resetForm();
            });
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ElectricityDetails/GetElctricityDetailsByMandateId?mandateId=${mandateCode?.id}`)
            .then((response: any) => {
                if (!response) return;
                setElectricityDetails(response?.data || []);
            })
            .catch((e: any) => {
                resetForm();
            });
    };

    React.useEffect(() => {
        if (mandateCode && mandateCode?.id !== undefined && mandateCode?.id !== 'noid') {
            getData();
            getLocationInfo();
        }
    }, [mandateCode]);

    useEffect(() => {
        if (id !== 'noid' && id && !(Object.keys(dropDownById).length === 0)) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetComplianceIntimationRequestById?id=${id}`)
                .then((response: any) => {
                    const responseData = response?.data.find((item) => item.id == id);

                    if (responseData?.noticeType && responseData?.noticeType.length <= 0) {
                        // Perform a hard refresh here
                        window.location.reload();
                    }
                    setTableId(responseData?.id);
                    setUpdateData(response?.data?.[0]);
                    setFieldValue('request_no', responseData?.request_no);
                    setFieldValue('inspector_name', responseData?.inspector_name);
                    setFieldValue('payroll_remarks', responseData?.payroll_remarks);
                    setFieldValue('exit_remarks', responseData?.exit_remarks);
                    setRequestId(responseData?.request_no);
                    setFieldValue('inspector_contact', responseData?.inspector_contact);
                    setFieldValue('inspector_email', responseData?.inspector_email);
                    setFieldValue('inspection_date', responseData?.inspection_date);
                    setFieldValue('closure_date', responseData?.closure_date);
                    // if (responseData?.current_status === "Request Initiated") {
                    //   setFieldValue("remarks", responseData?.remarks);
                    // }
                    if (params?.action === "view") {
                      setFieldValue("remarks", responseData?.remarks);
                    }
                    // setFieldValue("remarks", responseData?.remarks);
                    setFieldValue('noticeType', responseData?.noticeType);
                    setFieldValue('noticeSubType', responseData?.noticeSubType);
                    setFieldValue('noticeCategory', responseData?.noticeCategory);
                    setFieldValue('city', responseData?.city);
                    setFieldValue('state', responseData?.state);
                    setStateId(responseData?.fk_state);
                    setStateName(responseData?.state);
                    setCityName(responseData?.city);
                    setBranchCode(responseData?.branch_code);
                    setFieldValue('branch_code', responseData?.branch_code);
                    setFieldValue('reported_location', responseData?.reported_location);
                    setFieldValue('intimationType', responseData?.intimationType);
                    setFieldValue('acts', responseData?.acts);
                    setFieldValue('status', responseData?.status);
                    const temp = {
                        ['noticeType']: dropDownById['Notice Type'][responseData?.fk_notice_type],
                        ['noticeSubType']: dropDownById['Notice Sub Type'][responseData?.fk_notice_sub_type],
                        ['noticeCategory']: dropDownById['Notice Category'][responseData?.fk_notice_category],
                        ['city']: {
                            ['cityName']: responseData?.city,
                            id: responseData?.fk_city,
                        },
                        ['state']: {
                            ['stateName']: responseData?.state,
                            id: responseData?.fk_state,
                        },
                        ['branch_code']: {
                            ['BranchCode']: responseData?.branch_code,
                        },
                        ['reported_location']: {
                            ['Location']: responseData?.reported_location,
                        },
                        ['intimationType']: dropDownById['Initimation Type'][responseData?.fk_intimation_type],
                        ['acts']: dropDownById['Acts'][responseData?.acts],
                        ['status']: dropDownById['Status'][responseData?.fk_status],
                    };
                    setValue1({ ...value1, ...temp });
                    setFieldValue('payroll_team', responseData?.payroll_team);
                    setFieldValue('exit_team', responseData?.exit_team);
                    setPayroll(responseData?.payroll_team);
                    setExit(responseData?.exit_team);
                    setFieldValue('traslation_required', responseData?.traslation_required);
                    setFieldValue('isAuthority_Available', responseData?.isAuthority_Available);
                    setFieldValue('isSatisfied', responseData?.isSatisfied);
                    settoggleSwitch({
                        ...toggleSwitch,
                        traslation_required: responseData?.traslation_required,
                    });
                    filterNoticeSubType(responseData?.noticeType);
                    filterNoticeCategory(responseData?.noticeSubType);
                    setCurrentRemark(responseData?.current_remarks);
                    setCurrentStatus(responseData?.current_status);
                    setLoader(false);
                })
                .catch((error) => {
                    // Handle error
                    console.error('Error fetching data:', error);
                    setLoader(false);
                });
        } else {
            setLoader(false);
        }
    }, [id, dropDownById, setDropDownById]);

    const dispatch = useDispatch();

    const getLocationInfo = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/mandatesById?id=${mandateCode?.id}`)
            .then((response: any) => {
                if (response && response?.data) {
                    setLocationData(response?.data?.location || '');
                }
            })
            .catch((e: any) => {});
    };

    const handleChangeInspectionDate = (newValue) => {
        if (newValue !== null && dayjs(newValue).isValid()) {
            if (new Date(newValue) > new Date()) {
                setDateError('please enter till today date');
            } else {
                setDateError('');
                setValue(moment(new Date(newValue)).format());
                setFieldValue('inspection_date', moment(new Date(newValue)).format());
            }
        } else {
            setDateError('please enter valid date');
        }
    };

    const handleChangeClosureDate = (newValue) => {
        if (newValue !== null && dayjs(newValue).isValid()) {
            setDateError('');
            setValue(moment(new Date(newValue)).format());
            setFieldValue('closure_date', moment(new Date(newValue)).format());
        } else {
            setDateError('please enter valid date');
        }
    };

    const handleChangeToggle = (event: any, newAlignment: string) => {
        settoggleSwitch({
            ...toggleSwitch,
            [newAlignment]: event.target.value === 'true' ? true : false,
        });
    };

    const handleButtonClick = (button) => {
        if (button === 'Sent Back To HRC') {
            setButtonName('Sent Back To HRC');
        } else if (button === 'Gather Documents') {
            setButtonName('Gather Documents');
        } else if (button === 'Send Back') {
            setButtonName('Send Back');
        } else if (button === 'Request Close') {
            setButtonName('Request Close');
        }
    };

    const { values, handleBlur, handleChange, setFieldValue, handleSubmit, setFieldError, errors, touched, resetForm } = useFormik({
        initialValues: CreateRequestInitialValues,
        validationSchema: createRequestSchema,
        validateOnChange: true,
        validateOnBlur: false,
        onSubmit: (values) => {
            if (dateError) {
                dispatch(fetchError(dateError));
            } else if (id === 'noid') {
                if (user?.UserName === 'user_hrc' || user?.UserName === 'user_payroll') {
                    const { payroll_team, exit_team } = values;

                    // if (!payroll_team && !exit_team) {
                    //   dispatch(fetchError("Please select at least one checkbox"));
                    // }
                    // else {
                    if (payroll_team && !values.payroll_remarks && exit_team && !values.exit_remarks) {
                        dispatch(fetchError('Payroll remarks and Exit remarks are required'));
                    } else if (payroll_team && !values.payroll_remarks) {
                        dispatch(fetchError('Payroll remarks are required'));
                    } else if (exit_team && !values.exit_remarks) {
                        dispatch(fetchError('Exit remarks are required'));
                    } else {
                        submitForm(values);
                    }
                    // }
                } else {
                    submitForm(values);
                }
            } else if (docUploadHistory?.length == 0) {
                dispatch(fetchError('Please Upload Documents'));
            } else if (values?.remarks == '') {
                dispatch(fetchError('Please fill all Field'));
            } else if (user?.UserName === 'user_hrc' || user?.UserName === 'user_payroll') {
                const { payroll_team, exit_team } = values;

                // if (!payroll_team && !exit_team) {
                //   dispatch(fetchError("Please select at least one checkbox"));
                // }
                // else {
                if (payroll_team && !values.payroll_remarks && exit_team && !values.exit_remarks) {
                    dispatch(fetchError('Payroll remarks and Exit remarks are required'));
                } else if (payroll_team && !values.payroll_remarks) {
                    dispatch(fetchError('Payroll remarks are required'));
                } else if (exit_team && !values.exit_remarks) {
                    dispatch(fetchError('Exit remarks are required'));
                } else {
                    submitForm(values);
                    setSubmitFlag(false)
                    setSendBackFlag(false)
                }
                // }
            } else {
                submitForm(values);
                setSubmitFlag(false)
                setSendBackFlag(false)
            }
        },
    });

    const submitForm = (values) => {
        const body = {
            Id: id == 'noid' ? 0 : id,
            Uid: '',
            request_no: id == 'noid' ? requestNumber : requestId,
            fk_notice_type: value1?.noticeType?.id || 0,
            fk_notice_sub_type: value1?.noticeSubType?.id || 0,
            fk_intimation_type: value1?.intimationType?.id || 0,
            fk_state: value1?.state?.id || 0,
            fk_city: value1?.city?.id || 0,
            reported_location: value1?.reported_location?.Location || '',
            branch_code: value1?.branch_code?.BranchCode || '',
            fk_notice_category: value1?.noticeCategory?.id || 0,
            acts: value1?.acts?.id?.toString() || '',
            inspector_name: values?.inspector_name || '',
            payroll_remarks: values?.payroll_remarks || '',
            exit_remarks: values?.exit_remarks || '',
            inspector_email: values?.inspector_email || formData?.inspector_email || '',
            inspector_contact: values?.inspector_contact || formData?.inspector_contact || '',
            inspection_date: values?.inspection_date || moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            // remarks:
            //   stageNameHrc === "HR Compliance Review Request"
            //     ? values?.remarks + " " +
            //       (values?.payroll_remarks) +
            //       " " +
            //       (values?.exit_remarks )
            //     : values?.remarks || "",
            remarks: values?.remarks || '',
            // remarks : (values?.remarks?.concat(" ",payroll_remarks_team," ",exit_remarks_team) ),
            closure_date: values?.closure_date || '' || null,
            traslation_required: values?.traslation_required || false,
            isAuthority_Available: values?.isAuthority_Available ?? stageName === 'Compliance to review document' ? true : values?.isAuthority_Available === false ? false : null,
            isSatisfied: values?.isSatisfied ?? values?.isAuthority_Available === false ? null : values?.isSatisfied === false ? false : stageName === 'Compliance to review document' ? true : null,
            fk_status: value1?.status?.id || 0,
            payroll_team: values?.payroll_team || false,
            exit_team: values?.exit_team || false,
            current_status: '',
            current_remarks: '',
            CreatedOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            CreatedBy: user?.UserName,
            UpdatedOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            UpdatedBy: user?.UserName,
            remark: values?.remark || '',
        };
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/InsertUpdateComplianceIntimationRequest`, body)
            .then((response: any) => {
                if (!response) return;
                if (response?.data?.message == 'Already Exists !') {
                    axios
                        .post(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/InsertUpdateComplianceIntimationRequest?id=${deliveryData?.id}`, body)
                        .then((response: any) => {
                            if (!response) return;
                            setTableId(response?.data?.id);
                            if (!flag) {
                                workFlow(response?.data?.id);
                            } else {
                                if(!sendBackFlag){
                                  workflowFunctionAPICall(runtimeId, 0, response?.data?.id, remark, 'Approved', navigate, user);
                                }
                                else{
                                  workflowFunctionAPICall(runtimeId, 0, tableId, remark, 'Sent Back', navigate, user);
                                }                                
                            }
                            resetForm();
                        })
                        .catch((error) => {});
                } else {
                    setTableId(response?.data?.data?.id);
                    if (!flag) {
                        workFlow(response?.data?.data?.id);
                    } else {
                        if(!sendBackFlag){
                          workflowFunctionAPICall(runtimeId, 0, response?.data?.data?.id, remark, 'Approved', navigate, user);
                        } 
                        else{
                          workflowFunctionAPICall(runtimeId, 0, tableId, remark, 'Sent Back', navigate, user);
                        }
                    }
                }
            })
            .catch((error) => {});
    };

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }
    const getVersionHistoryData = async (rec_id) => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateCode?.id || 0}&RecordId=${rec_id || 0}&documentType=Intimation Request Document`)
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
        if (id !== 'noid' && id) {
            getVersionHistoryData(id);
        }
    }, [id]);

    React.useEffect(() => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GenerateNo`).then((response: any) => {
            setRequestNumber(response?.data);
        });
    }, []);

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
        formData.append('mandate_id', mandateCode?.id || 0);
        formData.append('documenttype', 'Intimation Request Document');
        formData.append('CreatedBy', user?.UserName);
        formData.append('ModifiedBy', user?.UserName);
        formData.append('entityname', 'Intimation Request Document');
        formData.append('RecordId', id !== 'noid' ? id : requestNumber?.split('_')[1]);
        formData.append('Remarks', values?.remark);

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
                    getVersionHistoryData(requestNumber?.split('_')[1]);
                    return;
                } else if (response?.status === 200) {
                    setUploadedFiles([]);
                    setFileLimit(false);
                    dispatch(showMessage('Documents are uploaded Successfully.'));
                    getVersionHistoryData(id !== 'noid' ? id : requestNumber?.split('_')[1]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
                resetForm();
            });
    };
    const _getRuntimeId = (id) => {
        const userAction = userComplienceActionList && userComplienceActionList?.find((item) => item?.mandateId === parseInt(id) && item?.module === module);

        return userAction?.runtimeId || 0;
    };

    const workFlow = (tableId) => {
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: runtimeId || 0,
            mandateId: 0,
            tableId: tableId,
            // remark: stageNameHrc === "HR Compliance Review Request"
            // ? values?.remarks == "" && (exit || payroll) ?
            //   (values?.payroll_remarks) +
            //   " " +
            //   (values?.exit_remarks ) : values?.remarks + " " + (values?.payroll_remarks) + " " + (values?.exit_remarks )
            // : values?.remarks || "",
            remark: values?.remarks || '',
            createdBy: user?.UserName,
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: buttonName || 'Initiate Request',
            userName: user?.UserName,
        };
        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ''}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) return;
                if (response?.data === true) {
                    if (id == 'noid') {
                        dispatch(showMessage('Request Assigned successfully with service request number ' + requestNumber + ' !'));
                    } else {
                        dispatch(showMessage('Request Assigned successfully with service request number ' + requestId + ' !'));
                    }
                    navigate('/intimation-request-list');
                } else {
                    dispatch(fetchError('Error Occurred !'));
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    const handleFileEvent = (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files);
        if (_validationMaxFileSizeUpload(e, dispatch)) {
            handleUploadFiles(chosenFiles);
        }
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;

        switch (name) {
            case 'payroll_team':
                setPayroll(checked);
                setFieldValue('payroll_team', checked);
                break;

            case 'exit_team':
                setExit(checked);
                setFieldValue('exit_team', checked);
                break;
            default:
                break;
        }
    };

    React.useEffect(() => {
        if (!payroll) {
            setFieldValue("payroll_remarks",'')
        }
        if (!exit) {
            setFieldValue("exit_remarks",'')
        }
    }, [payroll,exit]);

    const getHeightForTable = useCallback(() => {
        var height = 0;
        var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
        if (dataLength === 0) return '0px';
        height = 45 * dataLength + 57;

        if (height > 0 && dataLength <= 4) return `${height}px`;
        return '200px';
    }, [docUploadHistory, docType]);

    const getHeightForTable2 = useCallback(() => {
        var height = 0;
        var dataLength = (electricityDetails && electricityDetails?.length) || 0;
        if (dataLength === 0) return '0px';
        height = 45 * dataLength + 57;

        if (height > 0 && dataLength <= 4) return `${height}px`;
        return '200px';
    }, [electricityDetails, docType]);

    const onKeyDown = (e) => {
        e.preventDefault();
    };

    useEffect(() => {
      console.log("abcd",values.remarks,values.remarks.length)
      if (values.remarks.length !== 0) {
        console.log("abcde",values.remarks.length)
        setSubmitFlag(true)
      }
      else{
        setSubmitFlag(false)
      }
    }, [values?.remarks]);

    return (
        <>
            {loader ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <Box component="h2" className="page-title-heading my-6">
                        {id == 'noid' ? 'Create Request' : params?.action === 'view' ? 'View Request' : 'Update Request'}
                    </Box>
                    <CustomeDialogBox openDialog={openDialog} handleClose={handleClose} handleConfirmSubmit={handleConfirmSubmit} />
                    <div className="card-panal inside-scroll-create-225" style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="phase-outer">
                                <Grid marginBottom="7px" container item spacing={5} justifyContent="start" alignSelf="center">
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable">Request Number</h2>
                                            <TextField
                                                disabled
                                                name="request_no"
                                                id="request_no"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                onChange={(e: any) => (e.target.value?.length > 14 ? e.preventDefault() : handleChange(e))}
                                                value={id === 'noid' ? requestNumber.toUpperCase() : values?.request_no.toUpperCase()}
                                            />
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Notice Type</h2>
                                            <Autocomplete
                                                disabled={noticeTypeDisable}
                                                className="w-85"
                                                options={noticeTypeDropdown || []}
                                                getOptionLabel={(option) => {
                                                    return option?.masterName?.toString() || '';
                                                }}
                                                disableClearable={true}
                                                defaultValue={value1?.noticeType || ''}
                                                value={value1?.noticeType || ''}
                                                onChange={(e, v) => {
                                                    filterNoticeSubType(v.masterName);
                                                    setValue1({ ...value1, ['noticeType']: v });
                                                    setFieldValue('noticeType', v.masterName);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
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
                                            {!noticeTypeDisable && touched.noticeType && errors.noticeType ? <p className="form-error">{errors.noticeType}</p> : null}
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Notice Sub Type</h2>

                                            <Autocomplete
                                                disabled={noticeSubTypeDisable}
                                                disablePortal
                                                id="combo-box-demo"
                                                disableClearable={true}
                                                options={NoticeSubTypeDropdown || []}
                                                getOptionLabel={(option) => {
                                                    return option?.masterName?.toString() || '';
                                                }}
                                                defaultValue={value1?.noticeSubType || ''}
                                                value={value1?.noticeSubType || ''}
                                                onChange={(e, v) => {
                                                    filterNoticeCategory(v.masterName);
                                                    setValue1({ ...value1, ['noticeSubType']: v });
                                                    setFieldValue('noticeSubType', v.masterName);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        name="noticeSubType"
                                                        id="noticeSubType"
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
                                            {!noticeSubTypeDisable && touched.noticeSubType && errors.noticeSubType ? <p className="form-error">{errors.noticeSubType}</p> : null}
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Intimation Type</h2>

                                            <Autocomplete
                                                disabled={intimationTypeDisable}
                                                disablePortal
                                                id="combo-box-demo"
                                                disableClearable={true}
                                                options={initimationTypeDropdown || []}
                                                getOptionLabel={(option) => {
                                                    return option?.masterName?.toString() || '';
                                                }}
                                                defaultValue={value1?.intimationType || ''}
                                                value={value1?.intimationType || ''}
                                                onChange={(e, v) => {
                                                    setValue1({ ...value1, ['intimationType']: v });
                                                    setFieldValue('intimationType', v.masterName);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        name="intimationType"
                                                        id="intimationType"
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
                                            {!intimationTypeDisable && touched.intimationType && errors.intimationType ? <p className="form-error">{errors.intimationType}</p> : null}
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">State</h2>

                                            <Autocomplete
                                                disabled={stateDisable}
                                                disablePortal
                                                disableClearable={true}
                                                options={stateDropdown || []}
                                                getOptionLabel={(option) => {
                                                    return option?.stateName?.toString() || '';
                                                }}
                                                defaultValue={value1?.state || ''}
                                                value={value1?.state || ''}
                                                onChange={(e, v) => {
                                                    setValue1({ ...value1, ['state']: v, ['city']: '', ['branch_code']: '', ['reported_location']: '' });
                                                    setStateName(v?.stateName);
                                                    setFieldValue('state', v?.stateName);
                                                    setStateId(v?.id);
                                                    setCityName('');
                                                    setBranchDataDropdown([]);
                                                    setBranchCode([]);
                                                    setReportedLocationOption([]);
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
                                            {!stateDisable && touched.state && errors.state ? <p className="form-error">{errors.state}</p> : null}
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">City</h2>
                                            <Autocomplete
                                                disabled={cityDisable}
                                                disablePortal
                                                disableClearable={true}
                                                options={cityDropdown || []}
                                                getOptionLabel={(option) => {
                                                    return option?.cityName?.toString() || '';
                                                }}
                                                defaultValue={value1?.city || ''}
                                                value={value1?.city || ''}
                                                onChange={(e, v) => {
                                                    setValue1({ ...value1, ['city']: v, ['branch_code']: '', ['reported_location']: '' });
                                                    setCityName(v?.cityName);
                                                    setFieldValue('city', v.cityName);
                                                    setBranchCode([]);
                                                    setReportedLocationOption([]);
                                                }}
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
                                                        className="w-85"
                                                    />
                                                )}
                                            />
                                            {!cityDisable && touched.city && errors.city ? <p className="form-error">{errors.city}</p> : null}
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Branch Code</h2>

                                            <Autocomplete
                                                disabled={branchCodeDisable}
                                                disablePortal
                                                disableClearable={true}
                                                options={branchDataDropdown || []}
                                                getOptionLabel={(option) => {
                                                    return option?.BranchCode?.toString() || '';
                                                }}
                                                defaultValue={value1?.branch_code || ''}
                                                value={value1?.branch_code || ''}
                                                onChange={(e, v) => {
                                                    setValue1({ ...value1, ['branch_code']: v, ['reported_location']: '' });
                                                    setBranchCode(v?.BranchCode);
                                                    setReportedLocationOption([v]);
                                                    setFieldValue('branch_code', v.BranchCode);
                                                    // setReportedLocationOption([])
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        name="branch_code"
                                                        id="branch_code"
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
                                            {!branchCodeDisable && touched.branch_code && errors.branch_code ? <p className="form-error">{errors.branch_code}</p> : null}
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Reported Location</h2>

                                            <Autocomplete
                                                disabled={reportedLocationDisable}
                                                disablePortal
                                                disableClearable={true}
                                                options={reportedLocationOption || []}
                                                getOptionLabel={(option) => {
                                                    return option?.Location?.toString() || '';
                                                }}
                                                defaultValue={value1?.reported_location || ''}
                                                value={value1?.reported_location || ''}
                                                onChange={(e, v) => {
                                                    setValue1({ ...value1, ['reported_location']: v });
                                                    setFieldValue('reported_location', v.Location);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        name="reported_location"
                                                        id="reported_location"
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
                                            {!reportedLocationDisable && touched.reported_location && errors.reported_location ? <p className="form-error">{errors.reported_location}</p> : null}
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Acts</h2>
                                            <Autocomplete
                                                disabled={actsDisable}
                                                disablePortal
                                                disableClearable={true}
                                                options={actsDropdown || []}
                                                getOptionLabel={(option) => {
                                                    return option?.masterName?.toString() || '';
                                                }}
                                                defaultValue={value1?.acts || ''}
                                                value={value1?.acts || ''}
                                                onChange={(e, v) => {
                                                    setValue1({ ...value1, ['acts']: v });
                                                    setDeliveryData(v);
                                                    setFieldValue('acts', v.masterName);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        name="acts"
                                                        id="acts"
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
                                            {!actsDisable && touched.acts && errors.acts ? <p className="form-error">{errors.acts}</p> : null}
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable">Notice Category</h2>
                                            <Autocomplete
                                                disabled={params?.action === 'view' ? true : _validationIdentifierList.includes('request_notice_category')}
                                                disablePortal
                                                id="combo-box-demo"
                                                disableClearable={true}
                                                options={NoticeCategoryDropdown || []}
                                                getOptionLabel={(option) => {
                                                    return option?.masterName?.toString() || '';
                                                }}
                                                defaultValue={value1?.noticeCategory || ''}
                                                value={value1?.noticeCategory || ''}
                                                onChange={(e, v) => {
                                                    setValue1({ ...value1, ['noticeCategory']: v });
                                                    setFieldValue('noticeCategory', v.masterName);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        name="noticeCategory"
                                                        id="noticeCategory"
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
                                            <h2 className="phaseLable">Inspector Name</h2>
                                            <TextField
                                                disabled={params?.action === 'view' ? true : _validationIdentifierList.includes('request_inspector_name')}
                                                name="inspector_name"
                                                id="inspector_name"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                onChange={(e) => {
                                                    handleChange(e);
                                                }}
                                                value={values?.inspector_name}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                    regExpressionTextField(e);
                                                }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div>
                                            <h2 className="phaseLable">Inspector Contact Number</h2>
                                            <TextField
                                                disabled={params?.action === 'view' ? true : _validationIdentifierList.includes('request_inspector_contact')}
                                                onFocus={() => setContactFocused(true)}
                                                onBlur={() => setContactFocused(false)}
                                                autoComplete="off"
                                                name="inspector_contact"
                                                id="inspector_contact"
                                                type="text"
                                                InputProps={{ inputProps: { min: 0, maxLength: 10 } }}
                                                onChange={(e: any) => {
                                                    handleChangeContactno(e);
                                                }}
                                                value={values?.inspector_contact || formData.inspector_contact}
                                                // onKeyDown={(event) => {
                                                //     if (event.key === 'Backspace') {
                                                //         event.preventDefault();
                                                //         const updatedContact = formData.inspector_contact.slice(0, -1);
                                                //         setFormData({ ...formData, inspector_contact: updatedContact });
                                                //     } else if (!/[0-9]/.test(event.key)) {
                                                //         event.preventDefault();
                                                //     }
                                                // }}
                                                onKeyDown={(e: any) => {
                                                  blockInvalidChar(e);
                                                  
                                                  if (e?.key === "Backspace" && keyCount > 0) {
                                                    setKeyCount(keyCount - 1);
                                        
                                                    if (keyCount === 1) setCount(0);
                                                  }
                                                  if (
                                                    e.target.selectionStart === 0 &&
                                                    e.code === "Space"
                                                  ) {
                                                    e.preventDefault();
                                                  }
                                        
                                                  if (!(count > 0 && e?.key === "."))
                                                    setKeyCount(keyCount + 1);
                                                  if (e?.key === ".") {
                                                    setCount(count + 1);
                                                  }
                                                  if (
                                                    (!/[0-9.]/.test(e.key) ||
                                                    (count > 0 && e?.key === ".")) && (e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight")
                                                  ) {
                                                    e.preventDefault();
                                                  }
                                                }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                style={{ marginRight: '10px' }}
                                                variant="outlined"
                                                size="small"
                                                placeholder="Contact Number"
                                            />
                                            <p className="form-error">{contactError}</p>
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable">Inspector Email Id</h2>
                                            <TextField
                                                disabled={params?.action === 'view' ? true : _validationIdentifierList.includes('request_inspector_email')}
                                                autoComplete="off"
                                                name="inspector_email"
                                                id="inspector_email"
                                                type="email"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values?.inspector_email || formData.inspector_email}
                                                onChange={handleChangeEmail}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                onKeyDown={(e: any) => {
                                                    if (e.key === '@' || e.key === '.') {
                                                        return;
                                                    }
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                            {error && <p className="form-error">{error}</p>}
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div>
                                            <h2 className="phaseLable required">Inspection Date</h2>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DesktopDatePicker
                                                    disabled={inspectionDateDisable}
                                                    className="w-85"
                                                    inputFormat="DD/MM/YYYY"
                                                    value={values.inspection_date}
                                                    maxDate={new Date()}
                                                    onChange={handleChangeInspectionDate}
                                                    renderInput={(params) => <TextField {...params} name="inspection_date" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                                                />
                                            </LocalizationProvider>
                                            {!inspectionDateDisable && touched.inspection_date && errors.inspection_date ? <p className="form-error">{errors.inspection_date || dateError}</p> : null}
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div>
                                            <h2 className="phaseLable required">Query Expected Closure Date</h2>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DesktopDatePicker
                                                    disabled={closureDateDisable}
                                                    className="w-85"
                                                    inputFormat="DD/MM/YYYY"
                                                    value={values.closure_date || '' || null}
                                                    minDate={values.inspection_date}
                                                    onChange={handleChangeClosureDate}
                                                    renderInput={(params) => <TextField {...params} name="closure_date" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                                                />
                                            </LocalizationProvider>
                                            {!closureDateDisable && touched.closure_date && errors.closure_date ? <p className="form-error">{errors.closure_date || dateError}</p> : null}
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Status</h2>
                                            <Autocomplete
                                                disablePortal
                                                disabled={statusDisable || (stageName !== "Compliance to review document" && stageName !== "Review and Validate Request")}
                                                id="combo-box-demo"
                                                disableClearable={true}
                                                options={statusDropdown || []}
                                                getOptionLabel={(option) => {
                                                    return option?.masterName?.toString() || '';
                                                }}
                                                defaultValue={value1?.status || ''}
                                                value={value1?.status || ''}
                                                onChange={(e, v) => {
                                                    setValue1({ ...value1, ['status']: v });
                                                    setFieldValue('status', v.masterName);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        name="status"
                                                        id="status"
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
                                            {!statusDisable && touched.status && errors.status ? <p className="form-error">{errors.status}</p> : null}
                                        </div>
                                    </Grid>
                                    {(stageName === 'Translate Document' && user?.role === 'Compliance Partner') ||
                                    (stageName === 'Compliance to review document' && user?.role === 'Compliance Partner') ||
                                    (stageName === 'Extended Time Line - Revist Pending (Authority Not Available)' && user?.role === 'Compliance Partner') ||
                                    (stageName === 'Extended Time Line - Revist Pending (Authority Not Satisfied)' && user?.role === 'Compliance Partner') ||
                                    (stageName === 'Receives Acknowledgment Receipt' && user?.role === 'Compliance Partner') ||
                                    (user?.role === 'Payroll Team' && stageName === 'Payroll -Team Documents To Upload') ||
                                    (user?.role === 'Exit Team' && stageName === 'Exit Team- Documents To Upload') ||
                                    (user?.role === 'HR Compliance' && stageName === 'HR to Compile doc provided by Exit and Payroll team') ||
                                    (user?.role === 'HR Compliance' && stageName === 'HR Compliance Review Request') ? (
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
                                                <h2 className="phaseLable" style={{ color: 'red' }}>
                                                    {user?.role} Remarks
                                                </h2>
                                                <textarea
                                                    // disabled={remarksDisable || stageNameHrc === "HR Compliance Review Request" ? ((payroll && exit) || payroll || exit) : (!(payroll && exit) || !payroll || !exit)}
                                                    // disabled={stageNameHrc === "HR Compliance Review Request" ? payroll || exit : remarksDisable}
                                                    disabled={remarksDisable}
                                                    name="remarks"
                                                    id="remarks"
                                                    autoComplete="off"
                                                    // variant="outlined"
                                                    className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                                                    // multiline
                                                    style={errorClass}
                                                    // InputProps={{
                                                    //   inputProps: { min: 0, maxLength: 100 },
                                                    // }}
                                                    onChange={(e: any) => {
                                                        e.target.value?.length > 100 ? e.preventDefault() : handleChange(e);
                                                        // setFieldValue("remarks",values?.payroll_remarks + " " + values?.exit_remarks);
                                                    }}
                                                    value={values?.remarks}
                                                    // value={stageNameHrc === "HR Compliance Review Request" && (payroll || exit)
                                                    // ? `${values?.remarks}${values?.payroll_remarks ? values?.payroll_remarks + '\n' : ''}${values?.exit_remarks ? values?.exit_remarks : ''}`
                                                    // : values?.remarks}
                                                    // value={(payroll || exit) ? values?.remarks
                                                    // : !payroll && !exit ? values?.remarks
                                                    // :  values?.remarks +"\n" +values?.payroll_remarks + "\n" + values?.exit_remarks || "" }
                                                    // value={`${values?.remarks || ''}${values?.remarks && (values?.payroll_remarks || values?.exit_remarks) ? '\n' : ''}${values?.payroll_remarks ? values?.payroll_remarks + '\n' : ''}${values?.exit_remarks ? values?.exit_remarks : ''}`}

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
                                                {!remarksDisable && touched.remarks && errors.remarks ? (
                                                    <p className="form-error" style={{ marginTop: -5 }}>
                                                        {errors.remarks}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </Grid>
                                    ) : (
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
                                                <h2 className="phaseLable required">{user?.role} Remarks</h2>
                                                <textarea
                                                    disabled={remarksDisable}
                                                    name="remarks"
                                                    id="remarks"
                                                    autoComplete="off"
                                                    // variant="outlined"
                                                    className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                                                    // multiline
                                                    style={_validationIdentifierList.includes('request_remarks') ? { backgroundColor: '#F3F3F3' } : { backgroundColor: '' }}
                                                    // InputProps={{
                                                    //   inputProps: { min: 0, maxLength: 100 },
                                                    // }}
                                                    onChange={(e: any) => (e.target.value?.length > 100 ? e.preventDefault() : handleChange(e))}
                                                    value={values?.remarks}
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

                                                {!remarksDisable && touched.remarks && errors.remarks ? (
                                                    <p className="form-error" style={{ marginTop: -5 }}>
                                                        {errors.remarks}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </Grid>
                                    )}
                                    {user?.role === 'HR Compliance' && stageName === 'HR Compliance Review Request' ? (
                                        exit || payroll ? (
                                            <Grid item xs={3} md={3} lg={3} sx={{ position: 'relative' }}>
                                                <div className="input-form">
                                                    <CenteredFormControlLabel
                                                        disabled={params?.action === 'view' ? true : _validationIdentifierList.includes('request_payroll_team')}
                                                        // control={
                                                        //   <Checkbox
                                                        //     name="payroll_team"
                                                        //     checked={payroll}
                                                        //     onChange={handleCheckboxChange}
                                                        //   />
                                                        // }
                                                        control={<StyledCheckbox name="payroll_team" checked={payroll} onChange={handleCheckboxChange} style={{ padding: '0px', textAlign: 'center' }} />}
                                                        label={
                                                            <span className={`mar-left-5 ${params?.action === 'view' || _validationIdentifierList.includes('request_payroll_team') ? 'disabled-label' : ''}`} style={{ color: 'red' }}>
                                                                Payroll Team
                                                            </span>
                                                        }
                                                        // label="Payroll Team"
                                                    />
                                                    <textarea
                                                        className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                                                        disabled={!payroll || params?.action === 'view' ? true : _validationIdentifierList.includes('request_payroll_team')}
                                                        style={errorClass}
                                                        name="payroll_remarks"
                                                        id="payroll_remarks"
                                                        placeholder="Document Required From Payroll Team"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            // setFieldValue("remarks", e?.target?.value || "" + " "+ values?.exit_remarks)
                                                        }}
                                                        value={payroll ? values?.payroll_remarks : ''}
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
                                            </Grid>
                                        ) : (
                                            <Grid item xs={3} md={3} lg={3} sx={{ position: 'relative' }}>
                                                <div className="input-form">
                                                    <CenteredFormControlLabel
                                                        disabled={params?.action === 'view' ? true : _validationIdentifierList.includes('request_payroll_team')}
                                                        // control={
                                                        //   <Checkbox
                                                        //     name="payroll_team"
                                                        //     checked={payroll}
                                                        //     onChange={handleCheckboxChange}
                                                        //   />
                                                        // }
                                                        control={<StyledCheckbox name="payroll_team" checked={payroll} onChange={handleCheckboxChange} style={{ padding: '0px', textAlign: 'center' }} />}
                                                        label={
                                                            <span className={`mar-left-5 ${params?.action === 'view' || _validationIdentifierList.includes('request_payroll_team') ? 'disabled-label' : ''}`} style={{ color: 'red' }}>
                                                                Payroll Team
                                                            </span>
                                                        }
                                                        // label="Payroll Team"
                                                    />
                                                    <textarea
                                                        className="w-85 bor-rad-10 height-create pad-cre"
                                                        disabled={!payroll || params?.action === 'view' ? true : _validationIdentifierList.includes('request_payroll_team')}
                                                        style={errorClass}
                                                        name="payroll_remarks"
                                                        id="payroll_remarks"
                                                        placeholder="Document Required From Payroll Team"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            // setFieldValue("remarks", e?.target?.value + " " + values?.exit_remarks)
                                                        }}
                                                        value={payroll ? values?.payroll_remarks : ''}
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
                                            </Grid>
                                        )
                                    ) : (
                                        <Grid item xs={3} md={3} lg={3} sx={{ position: 'relative' }}>
                                            <div className="input-form">
                                                <CenteredFormControlLabel
                                                    disabled={params?.action === 'view' || stageName === "HR to Compile doc provided by Exit and Payroll team" ? true : _validationIdentifierList.includes('request_payroll_team')}
                                                    // control={
                                                    //   <Checkbox
                                                    //     name="payroll_team"
                                                    //     checked={payroll}
                                                    //     onChange={handleCheckboxChange}
                                                    //   />
                                                    // }
                                                    control={<StyledCheckbox name="payroll_team" checked={payroll} onChange={handleCheckboxChange} style={{ padding: '0px', textAlign: 'center' }} />}
                                                    label={<span className={`mar-left-5 ${params?.action === 'view' || _validationIdentifierList.includes('request_payroll_team') ? 'disabled-label' : ''}`}>Payroll Team</span>}
                                                    // label="Payroll Team"
                                                />
                                                <textarea
                                                    className="w-85 bor-rad-10 height-create pad-cre textarea_create place-opa"
                                                    disabled={!payroll || params?.action === 'view' || stageName === "HR to Compile doc provided by Exit and Payroll team" ? true : _validationIdentifierList.includes('request_payroll_team')}
                                                    style={!payroll || _validationIdentifierList.includes('request_payroll_team') ? { backgroundColor: '#F3F3F3' } : { backgroundColor: '' }}
                                                    name="payroll_remarks"
                                                    id="payroll_remarks"
                                                    placeholder="Document Required From Payroll Team"
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                    }}
                                                    value={values?.payroll_remarks}
                                                    onKeyDown={(e: any) => {
                                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                        if (e.key === ' ' || e.key === '_' || e.key === ',') {
                                                            return;
                                                        }
                                                        regExpressionTextField(e);
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </Grid>
                                    )}
                                    {user?.role === 'HR Compliance' && stageName === 'HR Compliance Review Request' ? (
                                        payroll || exit ? (
                                            <Grid item xs={3} md={3} lg={3} sx={{ position: 'relative' }}>
                                                <div className="input-form">
                                                    <CenteredFormControlLabel
                                                        disabled={params?.action === 'view' ? true : _validationIdentifierList.includes('request_exit_team')}
                                                        control={<StyledCheckbox name="exit_team" checked={exit} onChange={handleCheckboxChange} style={{ padding: '0px', textAlign: 'center' }} />}
                                                        label={
                                                            <h2 className={`mar-left-5 ${params?.action === 'view' || _validationIdentifierList.includes('request_exit_team') ? 'disabled-label' : ''}`} style={{ color: 'red' }}>
                                                                Exit Team
                                                            </h2>
                                                        }
                                                        // <h2 className="phaseLable required">Notice Type</h2>
                                                    />
                                                    <textarea
                                                        className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                                                        disabled={!exit || params?.action === 'view' ? true : _validationIdentifierList.includes('request_exit_team')}
                                                        style={errorClass}
                                                        name="exit_remarks"
                                                        id="exit_remarks"
                                                        placeholder="Document Required From Exit Team"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            // setFieldValue("remarks",  values?.payroll_remarks +" "+ e?.target?.value  )
                                                        }}
                                                        value={exit ? values?.exit_remarks : ''}
                                                        onKeyDown={(e: any) => {
                                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                e.preventDefault();
                                                            }
                                                            if (e.key === ' ' || e.key === '_' || e.key === ',') {
                                                                return;
                                                            }
                                                            regExpressionTextField(e);
                                                        }}
                                                        onPaste={(e: any) => {
                                                            if (!textFieldValidationOnPaste(e)) {
                                                                dispatch(fetchError('You can not paste Spacial characters'));
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </Grid>
                                        ) : (
                                            <Grid item xs={3} md={3} lg={3} sx={{ position: 'relative' }}>
                                                <div className="input-form">
                                                    <CenteredFormControlLabel
                                                        disabled={params?.action === 'view' ? true : _validationIdentifierList.includes('request_exit_team')}
                                                        control={<StyledCheckbox name="exit_team" checked={exit} onChange={handleCheckboxChange} style={{ padding: '0px', textAlign: 'center' }} />}
                                                        label={
                                                            <h2 className={`mar-left-5 ${params?.action === 'view' || _validationIdentifierList.includes('request_exit_team') ? 'disabled-label' : ''}`} style={{ color: 'red' }}>
                                                                Exit Team
                                                            </h2>
                                                        }
                                                        // <h2 className="phaseLable required">Notice Type</h2>
                                                    />
                                                    <textarea
                                                        className="w-85 bor-rad-10 height-create pad-cre"
                                                        disabled={!exit || params?.action === 'view' ? true : _validationIdentifierList.includes('request_exit_team')}
                                                        style={errorClass}
                                                        name="exit_remarks"
                                                        id="exit_remarks"
                                                        placeholder="Document Required From Exit Team"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            // setFieldValue("remarks",  e?.target?.value + " "+ values?.payroll_remarks )
                                                        }}
                                                        value={exit ? values?.exit_remarks : ''}
                                                        onKeyDown={(e: any) => {
                                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                e.preventDefault();
                                                            }
                                                            if (e.key === ' ' || e.key === '_' || e.key === ',') {
                                                                return;
                                                            }
                                                            regExpressionTextField(e);
                                                        }}
                                                        onPaste={(e: any) => {
                                                            if (!textFieldValidationOnPaste(e)) {
                                                                dispatch(fetchError('You can not paste Spacial characters'));
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </Grid>
                                        )
                                    ) : (
                                        <Grid item xs={3} md={3} lg={3} sx={{ position: 'relative' }}>
                                            <div className="input-form">
                                                <CenteredFormControlLabel
                                                    disabled={params?.action === 'view' || stageName === "HR to Compile doc provided by Exit and Payroll team" ? true : _validationIdentifierList.includes('request_exit_team')}
                                                    control={<StyledCheckbox name="exit_team" checked={exit} onChange={handleCheckboxChange} style={{ padding: '0px', textAlign: 'center' }} />}
                                                    label={<h2 className={`mar-left-5 ${params?.action === 'view' || _validationIdentifierList.includes('request_exit_team') ? 'disabled-label' : ''}`}>Exit Team</h2>}
                                                    // <h2 className="phaseLable required">Notice Type</h2>
                                                />
                                                <textarea
                                                    className="w-85 bor-rad-10 height-create pad-cre place-opa textarea_create"
                                                    disabled={!exit || params?.action === 'view' || stageName === "HR to Compile doc provided by Exit and Payroll team" ? true : _validationIdentifierList.includes('request_exit_team')}
                                                    style={!exit || _validationIdentifierList.includes('request_exit_team') ? { backgroundColor: '#F3F3F3' } : { backgroundColor: '' }}
                                                    name="exit_remarks"
                                                    id="exit_remarks"
                                                    placeholder="Document Required From Exit Team"
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                    }}
                                                    value={values?.exit_remarks}
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
                                        </Grid>
                                    )}
                                    <Grid item xs={6} md={3} lg={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable">Translation Required</h2>
                                            <ToggleSwitch
                                                alignment={toggleSwitch?.traslation_required}
                                                handleChange={(e: any) => {
                                                    handleChangeToggle(e, 'traslation_required');
                                                    setFieldValue('traslation_required', e.target.value === 'true' ? true : false);
                                                }}
                                                yes={'YES'}
                                                no={'NO'}
                                                name="traslation_required"
                                                id="traslation_required"
                                                onBlur={handleBlur}
                                                disabled={params?.action === 'view' ? true : _validationIdentifierList.includes('request_transaction_required')}
                                                bold="false"
                                            />
                                        </div>
                                    </Grid>
                                    {/* <Grid item xs={3} md={3} lg={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <FormControlLabel
                      disabled={
                        params?.action === "view"
                          ? true
                          : _validationIdentifierList.includes(
                            "request_exit_team"
                          )
                      }
                      control={
                        <Checkbox
                          name="exit_team"
                          checked={exit}
                          onChange={handleCheckboxChange}
                        />
                      }
                      label="Exit Team"
                    />
                  </div>
                </Grid> */}
                                    {stageName === 'Compliance to review document' ? (
                                        <>
                                            <Grid item xs={6} md={3} lg={3} sx={{ position: 'relative' }}>
                                                <div className="input-form">
                                                    {user?.role === 'Compliance Partner' &&
                                                    (stageName === 'Compliance to review document' || stageName === 'Extended Time Line - Revist Pending (Authority Not Available)' || stageName === 'Extended Time Line - Revist Pending (Authority Not Satisfied)') ? (
                                                        <h2 className="phaseLable" style={{ color: 'red' }}>
                                                            Authority Available
                                                        </h2>
                                                    ) : (
                                                        <h2 className="phaseLable">Authority Available</h2>
                                                    )}
                                                    <ToggleSwitch
                                                        alignment={toggleSwitch?.isAuthority_Available}
                                                        handleChange={(e: any) => {
                                                            handleChangeToggle(e, 'isAuthority_Available');
                                                            setFieldValue('isAuthority_Available', e.target.value === 'true' ? true : false);
                                                        }}
                                                        yes={'YES'}
                                                        no={'NO'}
                                                        name="isAuthority_Available"
                                                        id="isAuthority_Available"
                                                        onBlur={handleBlur}
                                                        disabled={false}
                                                        bold="false"
                                                    />
                                                </div>
                                            </Grid>
                                            {toggleSwitch?.isAuthority_Available && (
                                                <Grid item xs={6} md={3} lg={3} sx={{ position: 'relative' }}>
                                                    <div className="input-form">
                                                        {user?.role === 'Compliance Partner' &&
                                                        (stageName === 'Compliance to review document' || stageName === 'Extended Time Line - Revist Pending (Authority Not Available)' || stageName === 'Extended Time Line - Revist Pending (Authority Not Satisfied)') ? (
                                                            <h2 className="phaseLable" style={{ color: 'red' }}>
                                                                Satisfied
                                                            </h2>
                                                        ) : (
                                                            <h2 className="phaseLable">Satisfied</h2>
                                                        )}

                                                        <ToggleSwitch
                                                            alignment={toggleSwitch?.isSatisfied}
                                                            handleChange={(e: any) => {
                                                                handleChangeToggle(e, 'isSatisfied');
                                                                setFieldValue('isSatisfied', e.target.value === 'true' ? true : false);
                                                            }}
                                                            yes={'SATISFIED'}
                                                            no={'NOT SATISFIED'}
                                                            name="isSatisfied"
                                                            id="isSatisfied"
                                                            onBlur={handleBlur}
                                                            disabled={false}
                                                            bold="false"
                                                        />
                                                    </div>
                                                </Grid>
                                            )}
                                            {!(toggleSwitch.isAuthority_Available && toggleSwitch.isSatisfied) ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <div>
                                                        {user?.role === 'Compliance Partner' &&
                                                        (stageName === 'Compliance to review document' || stageName === 'Extended Time Line - Revist Pending (Authority Not Available)' || stageName === 'Extended Time Line - Revist Pending (Authority Not Satisfied)') ? (
                                                            <h2 className="phaseLable" style={{ color: 'red' }}>
                                                                New Timeline
                                                            </h2>
                                                        ) : (
                                                            <h2 className="phaseLable">New Timeline</h2>
                                                        )}
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DesktopDatePicker
                                                                // disabled={closureDateDisable}
                                                                className="w-85"
                                                                inputFormat="DD/MM/YYYY"
                                                                value={values.closure_date || '' || null}
                                                                minDate={values.inspection_date}
                                                                onChange={handleChangeClosureDate}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        name="closure_date"
                                                                        size="small"
                                                                        onKeyDown={(e: any) => e.preventDefault()}
                                                                        sx={
                                                                            user?.role === 'Compliance Partner' &&
                                                                            (stageName === 'Compliance to review document' || stageName === 'Extended Time Line - Revist Pending (Authority Not Available)' || stageName === 'Extended Time Line - Revist Pending (Authority Not Satisfied)') && {
                                                                                border: '2px solid red',
                                                                                borderRadius: '6px',
                                                                            }
                                                                        }
                                                                    />
                                                                )}
                                                            />
                                                        </LocalizationProvider>
                                                        {!closureDateDisable && touched.closure_date && errors.closure_date ? <p className="form-error">{errors.closure_date || dateError}</p> : null}
                                                    </div>
                                                </Grid>
                                            ) : null}
                                            {toggleSwitch.isAuthority_Available ? (
                                                <>
                                                    <Grid item xs={6} md={3} lg={3} sx={{ position: 'relative' }}></Grid>
                                                </>
                                            ) : (
                                                <Grid item xs={6} md={3} lg={3} sx={{ position: 'relative' }}></Grid>
                                            )}
                                            {toggleSwitch.isSatisfied && <Grid item xs={6} md={3} lg={3} sx={{ position: 'relative' }}></Grid>}
                                        </>
                                    ) : null}

                                    {/* <Grid item xs={6} md={3}>
                  <Autocomplete
                    disablePortal
                    sx={{ backgroundColor: "#f3f3f3", borderRadius: "6px" }}
                    id="combo-box-demo"
                    getOptionLabel={(option) => {
                      return option?.name?.toString() || "";
                    }}
                    disabled
                    disableClearable
                    options={optionsDropDown || []}
                    onChange={(e, value: any) => {
                      setDocType(value);
                      setFieldValue("docType", value);
                    }}
                    placeholder="Document Type"
                    value={boqDrp}
                    renderInput={(params) => (
                      <TextField
                        name="docType"
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
                </Grid> */}

                                    {/* {params?.action !== "view" && complienceAction !== "Approve" && (
                  <Grid item xs={4} md={4} sx={{ position: "relative" }}>
                    <div className="input-form ">
                      <TextField

                        autoComplete="off"
                        size="small"
                        name="remark"
                        id="remark"
                        placeholder="Remark"
                        onChange={(e: any) =>
                          e.target.value?.length > 50
                            ? e.preventDefault()
                            : handleChange(e)
                        }
                        value={values?.remark}
                        error={user?.role ==="Compliance Partner" || stageName==="Translate Document"
                                || user?.role=== "Payroll Team" || stageName==="Payroll -Team Documents To Upload"}
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
                          regExpressionRemark(e);
                        }}
                      />

                    </div>
                  </Grid>
                )}
                <Grid item xs={6} md={4}>
                  <div style={{ display: "flex" }}>
                    {docType?.templatePath && (
                      <Button
                        variant="outlined"
                        size="medium"
                        style={secondaryButton}
                      >
                        Download Template
                      </Button>
                    )}
                    <div>
                      {params?.action !== "view" && complienceAction !== "Approve" && (
                        <Button
                          onClick={() => {

                            fileInput.current.click();
                          }}
                          variant="outlined"
                          size="medium"
                          // style={secondaryButton}
                          sx={(user?.role === "Compliance Partner" || stageName==="Translate Document"
                          || user?.role=== "Payroll Team" || stageName==="Payroll -Team Documents To Upload" ) ? 
                              {padding: "5px 20px", border : "2px solid red", color:"rgb(0, 49, 106)",marginRight:"10px",}
                            :{
                              padding: "5px 20px",
                              color: "rgb(0, 49, 106)",
                              borderColor: "rgb(0, 49, 106)",
                              marginRight:"10px",
                            }}
                          disabled={_validationIdentifierList.includes(
                            "btn_request_upload"
                          )}
                        >
                          Upload
                        </Button>
                      )}
                      <input
                        ref={fileInput}
                        multiple
                        onChange={handleFileEvent}
                        disabled={fileLimit}
                        accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
                        text/plain, application/pdf, image/*"
                        type="file"
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                </Grid> */}
                                </Grid>
                            </div>
                            {/* <div
              style={{
                display: "flex",
                // justifyContent: "space-between",
                // alignItems: "center",
              }}
            > */}
                            <hr style={{ marginBottom: '5px' }} />
                            <div className="phase-outer">
                                <Grid marginBottom="7px" container item spacing={5} justifyContent="start" alignSelf="center">
                                    <Grid item xs={4} md={4} sx={{ position: 'relative', marginTop: '5px' }}>
                                        <h5>Documents</h5>{' '}
                                    </Grid>

                                    {params?.action !== 'view' ? (
                                        <Grid item xs={3} md={5} sx={{ position: 'relative' }}>
                                            <div className="input-form ">
                                                <TextField
                                                    autoComplete="off"
                                                    size="small"
                                                    name="remark"
                                                    id="remark"
                                                    placeholder="Document Remarks"
                                                    onChange={(e: any) => (e.target.value?.length > 50 ? e.preventDefault() : handleChange(e))}
                                                    value={values?.remark}
                                                    error={
                                                        (user?.role === 'Compliance Partner' && stageName === 'Translate Document') ||
                                                        (user?.role === 'Payroll Team' && stageName === 'Payroll -Team Documents To Upload') ||
                                                        (user?.role === 'Exit Team' && stageName === 'Exit Team- Documents To Upload') ||
                                                        (stageName === 'Receives Acknowledgment Receipt' && user?.role === 'Compliance Partner')
                                                    }
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onKeyDown={(e: any) => {
                                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                        regExpressionRemark(e);
                                                    }}
                                                />
                                            </div>
                                        </Grid>
                                    ) : (
                                        <Grid item xs={3} md={5} sx={{ position: 'relative' }}></Grid>
                                    )}
                                    <Grid item xs={3} md={1}>
                                        <div style={{ display: 'flex' }}>
                                            {docType?.templatePath && (
                                                <Button variant="outlined" size="medium" style={secondaryButton}>
                                                    Download Template
                                                </Button>
                                            )}
                                            <div>
                                                {params?.action !== 'view' ? (
                                                    <Button
                                                        onClick={() => {
                                                            fileInput.current.click();
                                                        }}
                                                        variant="outlined"
                                                        size="medium"
                                                        // style={secondaryButton}
                                                        sx={
                                                            (user?.role === 'Compliance Partner' && stageName === 'Translate Document') ||
                                                            (user?.role === 'Payroll Team' && stageName === 'Payroll -Team Documents To Upload') ||
                                                            (user?.role === 'Exit Team' && stageName === 'Exit Team- Documents To Upload') ||
                                                            (stageName === 'Receives Acknowledgment Receipt' && user?.role === 'Compliance Partner')
                                                                ? { padding: '5px 20px', border: '1px solid red', color: 'rgb(0, 49, 106)', marginRight: '10px' }
                                                                : {
                                                                      padding: '5px 20px',
                                                                      color: 'rgb(0, 49, 106)',
                                                                      borderColor: 'rgb(0, 49, 106)',
                                                                      marginRight: '10px',
                                                                  }
                                                        }
                                                        disabled={_validationIdentifierList.includes('btn_request_upload')}
                                                    >
                                                        Upload
                                                    </Button>
                                                ) : (
                                                    <Grid item xs={3} md={1}></Grid>
                                                )}
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
                                    <Grid item xs={3} md={2}>
                                        <Box textAlign="right">
                                            <Button
                                                onClick={(e) => DownloadZipFile(e)}
                                                // style={{ minWidth: "100px", width: "175px", flex: "right" }}
                                                variant="outlined"
                                                size="medium"
                                                style={secondaryButton}
                                                // className="list-button"
                                            >
                                                <DownloadIcon style={{ fontSize: '22px' }} />
                                                Download As Zip
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </div>
                            <div style={{ height: '175px', marginTop: '5px' }}>
                                <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={docUploadHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={docUploadHistory?.length > 4 ? true : false} paginationPageSize={4} />
                            </div>

                            <div className="bottom-fix-history" style={{ marginBottom: 0 }}>
                                <MandateStatusHistory mandateCode={id} accept_Reject_Status={currentStatus} accept_Reject_Remark={currentRemark} />
                            </div>

                            <div className="bottom-fix-btn">
                                <div className="remark-field">
                                    {complienceAction && complienceAction === 'Approve' && params?.tableId && (
                                        <>
                                            {/* <ApproveAndRejectAction
                                                approved={approved}
                                                sendBack={sendBack}
                                                setSendBack={setSendBack}
                                                setApproved={setApproved}
                                                remark={remark}
                                                setRemark={setRemark}
                                                approveEvent={() => {
                                                    setFlag(true);
                                                    handleSubmit();
                                                }}
                                                sentBackEvent={() => {
                                                    handleSubmit();
                                                    workflowFunctionAPICall(runtimeId, 0, tableId, remark, 'Sent Back', navigate, user);
                                                }}
                                            /> */}
                                            <ApproveAndRejectActionForCompliance
                                              approved={approved}
                                              sendBack={sendBack}
                                              setSendBack={setSendBack}
                                              setApproved={setApproved}
                                              remark={remark}
                                              setRemark={setRemark}
                                              submitFlag={submitFlag}
                                              approveEvent={() => {
                                                setFlag(true);
                                                handleSubmit();
                                              }}
                                              sentBackEvent={() => {
                                                setFlag(true);
                                                setSendBackFlag(true)
                                                handleSubmit();
                                                // workflowFunctionAPICall(
                                                //   runtimeId,
                                                //   0,
                                                //   tableId,
                                                //   remark,
                                                //   "Sent Back",
                                                //   navigate,
                                                //   user
                                                // );
                                              }}
                                            />
                                            <span className="message-right-bottom">{userComplienceAction?.stdmsg}</span>
                                        </>
                                    )}
                                    {complienceAction && complienceAction?.trim() === 'Approve or Reject' && (
                                        <>
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
                                                    setFlag(true);
                                                    handleSubmit();
                                                }}
                                                sentBackEvent={() => {
                                                    workflowFunctionAPICall(runtimeId, 0, tableId, remark, 'Sent Back', navigate, user);
                                                }}
                                                rejectEvent={() => {
                                                    workflowFunctionAPICall(runtimeId, 0, tableId, remark, 'Rejected', navigate, user);
                                                }}
                                            />
                                            <span className="message-right-bottom">{userComplienceAction?.stdmsg}</span>
                                        </>
                                    )}
                                    {complienceAction && complienceAction === 'Create' && params?.tableId && (
                                        <>
                                            <div className="bottom-fix-btn">
                                                <div className="remark-field">
                                                    {toggleSwitch?.isAuthority_Available && toggleSwitch?.isSatisfied && stageName === 'Compliance to review document' ? (
                                                        // <Button
                                                        //   style={{
                                                        //     padding: "2px 20px",
                                                        //     borderRadius: 6,
                                                        //     color: "rgb(255, 255, 255)",
                                                        //     borderColor: "rgb(0, 49, 106)",
                                                        //     backgroundColor: "rgb(0, 49, 106)",
                                                        //   }}
                                                        //   variant="outlined"
                                                        //   size="small"
                                                        //   type="submit"
                                                        //   disabled={values?.status === "In Progress"}
                                                        // >
                                                        //   Acknowledgement Received
                                                        // </Button>
                                                        <Button
                                                            style={{
                                                                padding: '2px 20px',
                                                                borderRadius: 6,
                                                                color: 'rgb(255, 255, 255)',
                                                                borderColor: values?.status !== 'Close' ? 'gray' : 'rgb(0, 49, 106)',
                                                                backgroundColor: values?.status !== 'Close' ? 'gray' : 'rgb(0, 49, 106)',
                                                            }}
                                                            variant="outlined"
                                                            size="small"
                                                            type="submit"
                                                            disabled={values?.status !== 'Close'}
                                                        >
                                                            Acknowledgement Received
                                                        </Button>
                                                    ) : toggleSwitch?.isAuthority_Available && !toggleSwitch?.isSatisfied && stageName === 'Compliance to review document' ? (
                                                        <>
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
                                                                onClick={() => handleButtonClick('Sent Back To HRC')}
                                                            >
                                                                Sent Back To HRC
                                                            </Button>
                                                            <Button
                                                                style={{
                                                                    padding: '5px 20px',
                                                                    borderRadius: 6,
                                                                    // color: "rgb(0, 49, 106)",
                                                                    // borderColor: "rgb(0, 49, 106)",
                                                                    color: 'rgb(255, 255, 255)',
                                                                    borderColor: 'rgb(0, 49, 106)',
                                                                    backgroundColor: 'rgb(0, 49, 106)',
                                                                    marginRight: '10px',
                                                                    marginLeft: '20px',
                                                                }}
                                                                variant="outlined"
                                                                size="small"
                                                                type="submit"
                                                                onClick={() => handleButtonClick('Gather Documents')}
                                                            >
                                                                Gather Documents
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
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
                                                                // type="submit"
                                                                onClick={handleClickOpen}
                                                            >
                                                                {stageNameHrc === 'HR Compliance Review Request' ? (payroll && exit ? 'Submit to Payroll and Exit Team' : payroll ? 'Submit to Payroll Team' : exit ? 'Submit to Exit Team' : 'Submit to Compliance Partner') : 'Submit'}
                                                            </Button>
                                                            {stageNameHrc === 'HR Compliance Review Request' && (
                                                                <Button
                                                                    style={{
                                                                        padding: '2px 20px',
                                                                        borderRadius: 6,
                                                                        color: 'rgb(255, 255, 255)',
                                                                        borderColor: 'rgb(0, 49, 106)',
                                                                        backgroundColor: 'rgb(0, 49, 106)',
                                                                        marginLeft: '20px',
                                                                    }}
                                                                    variant="outlined"
                                                                    size="small"
                                                                    type="submit"
                                                                    onClick={() => handleButtonClick('Request Close')}
                                                                >
                                                                    {' '}
                                                                    Request Close
                                                                </Button>
                                                            )}
                                                            {stageNameHrc === 'HR Compliance Review Request' && (
                                                                <Button
                                                                    style={{
                                                                        padding: '5px 20px',
                                                                        borderRadius: 6,
                                                                        color: 'rgb(0, 49, 106)',
                                                                        borderColor: 'rgb(0, 49, 106)',
                                                                        marginRight: '10px',
                                                                        marginLeft: '20px',
                                                                    }}
                                                                    variant="outlined"
                                                                    size="small"
                                                                    type="submit"
                                                                    onClick={() => handleButtonClick('Send Back')}
                                                                >
                                                                    {' '}
                                                                    Send Back
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                {userComplienceAction?.stdmsg !== undefined && <span className="message-right-bottom">{userComplienceAction?.stdmsg}</span>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {!params?.tableId && params?.action !== 'view' && (
                                <div className="bottom-fix-btn">
                                    <div className="remark-field">
                                        <div className="row centerProj">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                type="reset"
                                                style={reset}
                                                sx={{
                                                    padding: '6px 20px !important',
                                                    marginLeft: '10px !important',
                                                }}
                                                onClick={handleBackClick}
                                            >
                                                Back
                                            </Button>
                                            {params?.action !== 'update' && (
                                                <Button
                                                    sx={{
                                                        padding: '6px 20px !important',
                                                        marginLeft: '10px !important',
                                                    }}
                                                    variant="outlined"
                                                    size="small"
                                                    type="reset"
                                                    style={reset}
                                                    onClick={handleReset}
                                                >
                                                    Reset
                                                </Button>
                                            )}
                                            <Button
                                                variant="contained"
                                                // type="submit"
                                                onClick={handleClickOpen}
                                                size="small"
                                                style={submit}
                                                sx={{
                                                    padding: '6px 20px !important',
                                                    marginLeft: '10px !important',
                                                }}
                                            >
                                                Submit
                                            </Button>
                                        </div>
                                        {userComplienceAction?.stdmsg !== undefined && <span className="message-right-bottom">{userComplienceAction?.stdmsg}</span>}
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreateRequest;
