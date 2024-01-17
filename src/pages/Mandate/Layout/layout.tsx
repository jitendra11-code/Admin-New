import React, { useCallback, useEffect, useState } from 'react';
import { Button, Grid, Box, Typography, TextField, Autocomplete, Checkbox, FormControlLabel } from '@mui/material';
import DataTable from '../../common-components/Table';
import DownloadIcon from '@mui/icons-material/Download';
import { secondaryButton } from 'shared/constants/CustomColor';
import { AppState } from 'redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import { useUrlSearchParams } from 'use-url-search-params';
import moment from 'moment';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { fetchError, showMessage } from 'redux/actions';
import MandateInfo from 'pages/common-components/MandateInformation';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { AgGridReact } from 'ag-grid-react';
import { downloadFileLayout } from './DownloadFile';
import { _validationMaxFileSizeUpload } from '../DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import groupByDocumentData from './GroupDataByVersionNumber';
import FileNameDiaglogList from '../DocumentUploadMandate/Components/Utility/Diaglogbox';
import regExpressionTextField, { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';
import { Tooltip } from '@mui/material';
import ApproveAndRejectAction from './ApproveAndRejectAction';

const MAX_COUNT = 8;
const layoutOptions = [{ key: 'Layout', name: 'Layout' }];
const bOQValue = {
    key: 'Layout',
    name: 'Layout',
};
const Layout = () => {
    const today = new Date();
    const location = useLocation();
    const [boqDrp, setBoQ] = React.useState<any>(bOQValue);
    const [checked, setChecked] = useState([]);
    const apiType = location?.state?.apiType || '';
    const dispatch = useDispatch();
    const fileInput = React.useRef(null);
    const [sendBack, setSendBack] = React.useState(false);
    const [approved, setApproved] = React.useState(false);
    const [remark, setRemark] = React.useState('');
    const [error, setError] = React.useState({});
    const [isApproved, setIsApproved] = useState(false);
    const [mandateId, setMandateId] = useState(null);
    const [mandateInfo, setMandateData] = React.useState(null);
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [formData, setFormData] = useState({});
    const [spaceAvailability, setSpaceAvailability] = useState({});
    const [spaceCat, setSpaceCat] = useState([]);
    const [vendorList, setVendorList] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileLimit, setFileLimit] = useState(false);
    const [fileLength, setFileLength] = useState(0);
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [historyData, setHistoryData] = useState([]);
    const navigate = useNavigate();
    const [userAction, setUserAction] = React.useState(null);
    const [bussinessApproval, setBussinessApproval] = useState(true);
    const [params] = useUrlSearchParams({}, {});

    const [option1, setOption1] = React.useState(layoutOptions[0] || null);
    const gridRef = React.useRef<AgGridReact>(null);
    const { user } = useAuthUser();
    const [readOnlyData, setReadOnlyData] = useState<any>({});
    const [isFinal, setisFinal] = useState<any>('');
    const { id } = useParams();

    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const [layoutId, setLayoutId] = useState(0);
    const action = userAction?.action || '';
    const runtimeId = userAction?.runtimeId || 0;
    let columnDefs = [
        {
            field: '',
            headerName: 'Action',
            headerTooltip: 'Action',
            maxWidth: 80,
            resizable: true,
            cellRenderer: (params) => {
                return (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            margin: '0px',
                            justifyContent: 'center',
                        }}
                    >
                        <Checkbox
                            size="small"
                            style={{ fontSize: 10 }}
                            checked={params?.historyData?.[params?.rowIndex]?.isCheckBoxSelected}
                            onChange={(e) => {
                                var data = [...params?.historyData];
                                var approvedLayout = data && data?.filter((item) => item?.isCheckBoxSelected === true);
                                var previousFlagg = data?.[params?.rowIndex]?.isCheckBoxSelected;
                                if (data[params?.rowIndex].isCheckBoxSelected == true) {
                                    data[params?.rowIndex].isCheckBoxSelected = !previousFlagg;
                                    params?.setHistoryData(data);
                                    return;
                                }
                                if (!bussinessApproval) {
                                    if (approvedLayout && approvedLayout?.length === 1) {
                                        params?.dispatch(params?.fetchError('You can approve only one layout'));
                                        return;
                                    }
                                }
                                if (user?.role === 'Business Associate') {
                                    if (approvedLayout && approvedLayout?.length === 1) {
                                        params?.dispatch(params?.fetchError('You can approve only one layout'));
                                        var previousFlag = data?.[params?.rowIndex]?.isCheckBoxSelected;
                                        data[params?.rowIndex].isCheckBoxSelected = false;
                                        params?.setHistoryData(data);
                                        return;
                                    }
                                }

                                data[params?.rowIndex].isCheckBoxSelected = !previousFlagg;
                                params?.setHistoryData(data);
                            }}
                        />
                    </div>
                );
            },
            cellRendererParams: {
                dispatch: dispatch,
                fetchError: fetchError,
                historyData: historyData,
                setHistoryData: setHistoryData,
            },
            hide: user?.role === 'Vendor',
            width: 110,
            minWidth: 100,
            cellStyle: { fontSize: '13px', textAlign: 'center' },
        },
        {
            field: 'srno',
            headerName: 'Sr. No',
            headerTooltip: 'Serial Number',
            flex: 1,
            maxWidth: 80,
            cellRenderer: (e: any) => {
                var index = e?.rowIndex;
                return index + 1;
            },

            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'reporttype',
            headerName: 'Report Type',
            headerTooltip: 'Report Type',
            sortable: true,
            resizable: true,
            minWidth: 150,
            cellRenderer: (e: any) => {
                var data = e.data.documenttype;
                if (data !== null && typeof data !== 'object') data = data?.split('.');
                data = data?.[0];
                return data || '';
            },
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
                if (data !== null && typeof data !== 'object') data = data?.split('.');
                data = data?.[0];
                return data || '';
            },
            maxWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'remark',
            headerName: 'Remark',
            headerTooltip: 'Remark',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.remarks;
                if (data !== null && typeof data !== 'object') data = data?.split('.');
                data = data?.[0];
                return data || '';
            },
            minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'CreatedDate',
            headerName: 'Created Date',
            headerTooltip: 'Created Date',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.CreatedDate).format('DD/MM/YYYY');
            },
            maxWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdDate',
            headerName: 'Created Time',
            headerTooltip: 'Created Time',
            cellRenderer: (e: any) => {
                return moment(e?.data?.CreatedDate).format('h:mm:ss A');
            },
            sortable: true,
            resizable: true,
            maxWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'CreatedBy',
            headerName: 'Created By',
            headerTooltip: 'Created By',
            sortable: true,
            resizable: true,
            maxWidth: 110,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'Status',
            headerName: 'Status',
            headerTooltip: 'Status',
            sortable: true,
            resizable: true,
            maxWidth: 110,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'Download',
            headerName: 'Download',
            headerTooltip: 'Download',
            resizable: true,
            maxWidth: 110,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <Tooltip title="Download" className="actionsIcons">
                            <DownloadIcon style={{ fontSize: '15px' }} onClick={() => downloadFileLayout(obj?.data, mandateId, dispatch)} className="actionsIcons" />
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
            width: 110,
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

    const workflowFunctionAPICall = async (runtimeId, mandateId, remark, action, navigate, user) => {
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: runtimeId || 0,
            mandateId: mandateId || 0,
            tableId: layoutId || 0,
            remark: remark || '',
            createdBy: user?.UserName || 'Admin',
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: action || '',
        };

        if (action === 'Approved' && userAction?.action === 'Approve') {
            var isLayoutApproved = historyData && historyData?.filter((item) => item?.isCheckBoxSelected === true);
            if (historyData?.length > 0 && isLayoutApproved && isLayoutApproved?.length === 0) {
                setApproved(false);
                dispatch(fetchError('You can select at least one layout'));
                return;
            }
            if (historyData?.length > 0 && isLayoutApproved && isLayoutApproved?.length > 0 && mandateId) {
                await axios
                    .post(`${process.env.REACT_APP_BASEURL}/api/Measurement/UpdateApprovalStatus?measurnmentId=${layoutId ?? 0}&mandateId=${mandateId ?? 0}&status=${bussinessApproval}`, {})
                    .then((response: any) => {})
                    .catch((e) => {});
            }
            CreateMeasurementHistory(layoutId, 'Approve');
        }
        if (action === 'Send Back' && userAction?.action === 'Approve') {
            var isLayoutSendBack = historyData && historyData?.filter((item) => item?.isCheckBoxSelected === true);
            if (isLayoutSendBack && isLayoutSendBack?.length === 0) {
                setSendBack(false);
                dispatch(fetchError('Please select layout to Send Back !!!'));
                return;
            }
            CreateMeasurementHistory(layoutId, 'Approve');
        }
        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${remark}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) return;
                if (response?.data === true) {
                    navigate('/list/task');
                }
            })
            .catch((e: any) => {});
    };

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }
    const getVendorNameList = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Measurement/GetVendorNameByMandetId?mandateId=${mandateId?.id}&vendorType=${user?.vendorType || ''}`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data && response?.data && response?.data?.length > 0) {
                    setVendorList(response?.data || []);
                }
                if (response && response?.data?.length === 0) {
                    setVendorList([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    const getSpaceAvailability = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Measurement/GetSpaceAvailabilityDetails?formname=measurement and layout`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data && response?.data && response?.data?.length > 0) {
                    setSpaceCat(response?.data || []);
                }
                if (response && response?.data?.length === 0) {
                    setSpaceCat([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    useEffect(() => {
        getSpaceAvailability();
    }, []);

    useEffect(() => {
        if (id && id !== 'noid') {
            setMandateId(id);
        }
    }, [id]);
    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid') {
            getVendorNameList();
        }
    }, [mandateId?.id, layoutId]);
    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid') {
            getVersionHistoryDataLayout();
        }
    }, [mandateId?.id, layoutId]);
    React.useEffect(() => {
        console.log('MMM', mandateId);
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid') {
            if (vendorList && vendorList?.length > 0) getLayoutData();
        }
    }, [mandateId?.id, vendorList, setVendorList]);

    useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid') {
            const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(mandateId?.id) && item?.module === module);

            if (apiType === '') {
                setUserAction(userAction);
            } else {
                let action = mandateId;
                setUserAction({ ...action, runtimeId: action.runtime });
            }
            if (params.source === 'list') {
                navigate(`/mandate/${mandateId?.id}/${module}?source=list`, {
                    state: { apiType: apiType },
                });
            } else {
                navigate(`/mandate/${mandateId?.id}/${module}`, {
                    state: { apiType: apiType },
                });
            }
        }
    }, [mandateId,setMandateId]);
    const getVersionHistoryData = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId?.id}&documentType=Layout`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data && response?.data && response?.data?.length > 0) {
                    var data = groupByDocumentData(response?.data, 'VersionNumber');
                    setHistoryData(data || []);
                }

                if (response && response?.data?.length === 0) {
                    setHistoryData([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const handleUploadFiles = async (e, files) => {
        const uploaded = [...uploadedFiles];
        let limitExceeded = false;
        files &&
            files?.some((file) => {
                if (uploaded && uploaded?.findIndex((f) => f.name === file.name) === -1) {
                    uploaded.push(file);
                    if (uploaded?.length === MAX_COUNT) setFileLimit(true);
                    if (uploaded?.length > MAX_COUNT) {
                        dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));
                        e.target.value = null;
                        setFileLimit(false);
                        limitExceeded = true;
                        return;
                    }
                }
            });
        if (limitExceeded) {
            e.target.value = null;
            dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));

            return;
        }

        if (!limitExceeded) setUploadedFiles(uploaded);
        setFileLength((uploaded && uploaded?.length) || 0);
        const form: any = new FormData();
        form.append('mandate_id', mandateId?.id);
        form.append('documenttype', 'Layout');
        form.append('CreatedBy', user?.UserName || '');
        form.append('ModifiedBy', user?.UserName || '');
        form.append('entityname', 'DocumentUpload');
        form.append('RecordId', layoutId || 0);
        form.append('remarks', formData['remarks'] || '');

        for (var key in uploaded) {
            await form.append('file', uploaded[key]);
        }

        if (uploaded?.length === 0) {
            setUploadedFiles([]);
            setFileLimit(false);
            e.target.value = null;
            dispatch(fetchError('Error Occurred !'));
            return;
        }

        if (mandateId?.id !== undefined) {
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`, form)
                .then((response: any) => {
                    e.target.value = null;
                    console.log('RR', response);
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
                        getVersionHistoryData();
                        return;
                    } else if (response?.status === 200) {
                        setUploadedFiles([]);
                        setFileLimit(false);
                        formData['remarks'] = '';
                        dispatch(showMessage('Documents are uploaded successfully!'));
                        CreateMeasurementHistory(mandateId?.id, 'upload');
                        getVersionHistoryDataLayout();
                    }
                })
                .catch((e: any) => {
                    e.target.value = null;
                    dispatch(fetchError('Error Occurred !'));
                });
        }
    };

    const getVersionHistoryDataLayout = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Measurement/GetMeasurmentAllocationHistory?mandateId=${mandateId?.id || 0}&layoutId=${layoutId || 0}&roleName=${user?.role}`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data && response?.data && response?.data?.length > 0) {
                    var data = groupByDocumentData(response?.data, 'VersionNumber');
                    data =
                        data &&
                        data?.map((item) => {
                            return {
                                ...item,
                                isCheckBoxSelected: false,
                            };
                        });
                    setHistoryData(data.reverse() || []);
                }

                if (response && response?.data?.length === 0) {
                    setHistoryData([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
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
            tableId: mandateId?.id || 0,
            remark: 'Created',
            createdBy: user?.UserName || 'Admin',
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: 'Created',
        };

        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ''}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) return;
                if (response?.data === true) {
                    dispatch(showMessage('Record Added Successfully!'));
                    navigate('/list/task');
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const generateSequence = (role) => {
        if (role === 'Vendor') {
            return 1;
        } else if (role === 'Project Manager') {
            return 2;
        } else if (role === 'Business Associate') {
            return 3;
        } else {
            return 0;
        }
    };

    const CreateMeasurementHistory = (id, source) => {
        var data = [...historyData];
        data =
            data &&
            data?.map((item) => {
                return {
                    id: item?.historyid || 0,
                    uid: item?.Uid || '',
                    fk_measurement_id: id || 0,
                    mandateId: mandateId?.id || 0,
                    fk_doc_id: item?.Id || 0,
                    userName: user?.UserName || '',
                    roleName: user?.role || '',
                    sequence: generateSequence(user?.role),
                    status: user?.role === 'Vendor' ? 'Pending' : item?.isCheckBoxSelected === true ? 'Approved' : 'Rejected',
                    createdBy: user?.UserName || '',
                    createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    modifiedBy: user?.UserName || '',
                    modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                };
            });

        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/Measurement/CreateMeasurementHistory`, data)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response) {
                    if (source !== 'upload') {
                        setFormData({});
                    }
                    // setSpaceAvailability({});
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const handleSubmit = () => {
        if (historyData?.length == 0) {
            dispatch(fetchError('Please upload files!'));
        } else {
            const finalData = {};
            const finalSpace = [];
            Object.keys(spaceAvailability).forEach(function (key, idx) {
                finalSpace.push({ category: key, value: spaceAvailability[key] });
            });
            finalData['mandateId'] = mandateId?.id;
            finalData['measurementId'] = layoutId || 0;
            finalData['createdBy'] = user?.UserName || '';
            finalData['updatedBy'] = user?.UserName || '';
            finalData['createdOn'] = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
            finalData['updatedOn'] = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
            finalData['spaceAvailabilityDetailsViewModel'] = [...finalSpace];
            finalData['vendorName'] = formData['vendorName']?.vendorName;
            if (formData['vendorName'] === undefined || !dayjs(formData['measurementDate']).isValid()) {
                console.log('DDD', formData);
                const err = {};
                if (formData['vendorName'] === undefined) {
                    err['vendorName'] = 'Please Enter Vendor Name';
                }
                if (!dayjs(formData['measurementDate']).isValid()) {
                    err['measurementDate'] = 'Please Enter Valid Date';
                }
                setError(err);
                return;
            }

            if (layoutId === 0) {
                axios
                    .post(`${process.env.REACT_APP_BASEURL}/api/Measurement/InsertMeasurementDetails`, { ...formData, ...finalData })
                    .then((response: any) => {
                        if (!response) {
                            dispatch(fetchError('Error Occurred !'));
                            return;
                        }
                        if (response && response?.data && response?.data?.data) {
                            var _id = (response && response?.data?.data?.id) || 0;
                            CreateMeasurementHistory(_id, 'Create');
                            setFormData({});
                            setSpaceAvailability({});
                            workFlowMandate();
                        }
                    })
                    .catch((e: any) => {
                        dispatch(fetchError('Error Occurred !'));
                    });
            } else {
                axios
                    .post(`${process.env.REACT_APP_BASEURL}/api/Measurement/UpdateMeasurementDetails`, { ...formData, ...finalData })
                    .then((response: any) => {
                        if (!response) {
                            dispatch(fetchError('Error Occurred !'));
                            return;
                        }
                        if (response && response?.data && response?.data?.data) {
                            var _id = (response && response?.data?.data?.id) || 0;
                            CreateMeasurementHistory(_id, 'Create');
                            setFormData({});
                            setSpaceAvailability({});
                            workFlowMandate();
                        }
                    })
                    .catch((e: any) => {
                        dispatch(fetchError('Error Occurred !'));
                    });
            }
        }
    };
    const getVendorName = (name) => {
        const obj = vendorList && vendorList.find((item) => item?.vendorName?.toUpperCase() === name?.toUpperCase());
        return obj || null;
    };

    const getLayoutData = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Measurement/GetMeasurementDetails?id=${mandateId?.id}`)
            .then((response: any) => {
                const obj = {};
                if (!response) return;
                if (response && response?.data && response?.data?.length > 0) {
                    var _id = response?.data?.[0]?.measurementId || 0;
                    setLayoutId(_id);
                    response?.data?.[0]?.spaceAvailabilityDetailsViewModel?.map((item) => (obj[item.category] = item.value));
                    setFormData({
                        vendorName: response?.data?.[0]?.vendorName && getVendorName(response?.data?.[0]?.vendorName),
                        remarks: response?.data?.[0]?.remarks,
                        measurementDate: response?.data?.[0]?.measurementDate || new Date(),
                    });
                    setBussinessApproval(response?.data?.[0]?.isBusinessApprovalRequired == null ? false : true);
                    setSpaceAvailability({ ...obj });
                } else {
                    console.log('WWW');
                    setLayoutId(0);
                    if (vendorList && vendorList?.length === 1) {
                        let vendor = vendorList?.[0];
                        setFormData({ ...formData, vendorName: vendor });
                    }
                }

                if (!response) {
                    setFormData({});

                    setSpaceAvailability({});
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
            })
            .catch((e: any) => {
                setFormData({});
                setSpaceAvailability({});
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const handleFileEvent = (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files);
        if (_validationMaxFileSizeUpload(e, dispatch)) {
            handleUploadFiles(e, chosenFiles);
        }
    };

    const handleDateChange = (newValue: Dayjs | null) => {
        setFormData({ ...formData, measurementDate: newValue });
        setError({ ...error, measurementDate: '' });
    };

    const getHeightForTable = useCallback(() => {
        var height = 0;
        var dataLength = (historyData && historyData?.length) || 0;
        if (dataLength === 0) return '0px';
        height = 45 * dataLength + 57;

        if (height > 0 && dataLength <= 4) return `${height}px`;
        return '200px';
    }, [historyData]);
    console.log('Useee', formData);
    return (
        <>
            <Box component="h2" className="page-title-heading my-6">
                Layout
            </Box>
            <div className="card-panal inside-scroll-234" style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <MandateInfo mandateCode={mandateId} source="" pageType="" setMandateData={setMandateData} redirectSource={`${params?.source}`} setMandateCode={setMandateId} setpincode={() => {}} setCurrentStatus={setCurrentStatus} setCurrentRemark={setCurrentRemark} />
                <div className="section" style={{ border: 'none' }}>
                    <Typography className="section-heading">Layout Details</Typography>
                    <Grid marginBottom="0px" container item spacing={5} justifyContent="start" alignSelf="center">
                        <Grid item xs={6} md={3} lg={3} sx={{ position: 'relative' }}>
                            <Autocomplete
                                disablePortal
                                sx={{
                                    backgroundColor: '#f3f3f3',
                                    borderRadius: '6px',
                                }}
                                id="combo-box-demo"
                                getOptionLabel={(option: any) => option?.name?.toString() || ''}
                                disableClearable={true}
                                disabled={true}
                                options={[boqDrp] || []}
                                placeholder="Document Type"
                                value={boqDrp || null}
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
                        </Grid>
                        <Grid item xs={6} md={4} lg={6} sx={{ position: 'relative' }}>
                            <TextField
                                name="remarks"
                                id="remarks"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                type="text"
                                placeholder="Admin Remarks"
                                value={formData['remarks'] || ''}
                                onChange={(val) => setFormData({ ...formData, remarks: val.target.value })}
                                onKeyDown={(e: any) => {
                                    regExpressionRemark(e);
                                }}
                                onPaste={(e: any) => {
                                    if (!textFieldValidationOnPaste(e)) {
                                        dispatch(fetchError('You can not paste Spacial characters'));
                                    }
                                }}
                                disabled={action && action === 'Approve' ? true : false}
                            />
                        </Grid>
                        <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                            <div>
                                <Button
                                    onClick={() => {
                                        if (mandateId?.id === undefined) {
                                            dispatch(fetchError('Please select mandate !!!'));
                                            return;
                                        }
                                        fileInput.current.click();
                                    }}
                                    sx={
                                        action === 'Approve' && {
                                            backgroundColor: '#f3f3f3',
                                            borderRadius: '6px',
                                        }
                                    }
                                    disabled={action === 'Approve'}
                                    variant="outlined"
                                    size="medium"
                                    style={secondaryButton}
                                >
                                    Upload
                                </Button>
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
                        </Grid>

                        {mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid' && (
                            <div className="bottom-fix-history">
                                <MandateStatusHistory mandateCode={mandateId?.id} accept_Reject_Remark={currentRemark} accept_Reject_Status={currentStatus} />
                            </div>
                        )}

                        {action === '' && runtimeId === 0 && (
                            <div className="bottom-fix-btn">
                                <div className="remark-field">
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
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (mandateId?.id === undefined) {
                                                dispatch(fetchError('Please select mandate !!!'));
                                                return;
                                            }

                                            handleSubmit();
                                        }}
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Grid>
                    {userAction?.module === module && (
                        <>
                            {action && (action === 'Create' || action === 'Upload') && (
                                <div className="bottom-fix-btn">
                                    <div className="remark-field">
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
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (mandateId?.id === undefined) {
                                                    dispatch(fetchError('Please select mandate !!!'));
                                                    return;
                                                }
                                                if (historyData && historyData?.length === 0) {
                                                    dispatch(fetchError('Please upload file'));
                                                    return;
                                                }
                                                handleSubmit();
                                            }}
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                    <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                </div>
                            )}

                            {action && action === 'Approve' && (
                                <div className="bottom-fix-btn">
                                    <div className="remark-field">
                                        <ApproveAndRejectAction
                                            approved={approved}
                                            sendBack={sendBack}
                                            setSendBack={setSendBack}
                                            setApproved={setApproved}
                                            remark={remark}
                                            historyData={historyData}
                                            setRemark={setRemark}
                                            approveEvent={() => {
                                                workflowFunctionAPICall(runtimeId, id, remark, 'Approved', navigate, user);
                                            }}
                                            sentBackEvent={() => {
                                                workflowFunctionAPICall(runtimeId, id, remark, 'Send Back', navigate, user);
                                            }}
                                        />
                                        <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div
                        style={{
                            height: getHeightForTable(),
                            marginTop: '10px',
                            marginBottom: '10px',
                        }}
                    >
                        <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={historyData || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                    </div>
                    <div>{mandateId?.id !== undefined && <DataTable mandateId={mandateId?.id} pathName={module} />}</div>
                </div>
                <div className="section" style={{ paddingTop: 0 }}>
                    <Typography className="section-heading">Measurement Details</Typography>
                    <Grid marginBottom="0px" container item spacing={5} justifyContent="start" alignSelf="center">
                        <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                            <div>
                                <h2 className="phaseLable required">Vendor Name</h2>
                            </div>
                            <Autocomplete
                                disablePortal
                                id="combo-box-demo"
                                getOptionLabel={(option) => option?.vendorName?.toString() || ''}
                                sx={
                                    action === 'Approve' && {
                                        backgroundColor: '#f3f3f3',
                                        borderRadius: '6px',
                                    }
                                }
                                disableClearable={true}
                                options={vendorList || []}
                                placeholder="Vendor Name"
                                value={formData['vendorName'] || ''}
                                onChange={(e: any, value) => {
                                    setFormData({ ...formData, vendorName: value });

                                    if (value !== undefined) {
                                        setError({ ...error, vendorName: undefined });
                                    }
                                }}
                                disabled={action && action === 'Approve' ? true : false}
                                renderInput={(params) => (
                                    <TextField
                                        name="vendorName"
                                        id="vendorName"
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

                            <p className="form-error">{error['vendorName'] !== undefined ? error['vendorName'] : ''}</p>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                            <div>
                                <h2 className="phaseLable required">Date</h2>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DesktopDatePicker
                                        className="w-85"
                                        maxDate={dayjs()}
                                        inputFormat="DD/MM/YYYY"
                                        value={formData['measurementDate'] || new Date()}
                                        onChange={handleDateChange}
                                        disabled={action && action === 'Approve' ? true : false}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                onKeyDown={(e) => {
                                                    e.preventDefault();
                                                }}
                                                sx={
                                                    action === 'Approve' && {
                                                        backgroundColor: '#f3f3f3',
                                                        borderRadius: '6px',
                                                    }
                                                }
                                            />
                                        )}
                                    />
                                </LocalizationProvider>

                                <p className="form-error">{error['measurementDate'] !== undefined ? error['measurementDate'] : ''}</p>
                            </div>
                        </Grid>
                    </Grid>
                </div>

                <div className="section">
                    <Typography className="section-heading">Space Availability</Typography>
                    <Grid marginBottom="0px" container item spacing={5} justifyContent="start" alignSelf="center">
                        {spaceCat?.map((item, ind) => (
                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                <div>
                                    <h2 className="phaseLable ">{item?.fieldname}</h2>
                                </div>

                                <TextField
                                    name={item?.category}
                                    id={item?.category}
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    type="text"
                                    disabled={action && action === 'Approve' ? true : false}
                                    InputProps={{ inputProps: { min: 0, maxLength: 30 } }}
                                    value={spaceAvailability[`${item?.fieldname}`] || ''}
                                    onChange={(val) => {
                                        spaceAvailability[`${item?.fieldname}`] = val.target.value;
                                        setSpaceAvailability({ ...spaceAvailability });
                                    }}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Special characters'));
                                        }
                                    }}
                                    onKeyDown={(e: any) => {
                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                            e.preventDefault();
                                        }
                                        regExpressionTextField(e);
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </div>
                {user?.role === 'Project Manager' && (
                    <div className="section">
                        <Typography className="section-heading">Business Approval</Typography>
                        <Grid marginBottom="0px" container item spacing={5} justifyContent="start" alignSelf="center">
                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                <div className="">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                disabled={user?.role === 'Business Associate' ? true : false}
                                                checked={bussinessApproval}
                                                onChange={() => {
                                                    setBussinessApproval(!bussinessApproval);
                                                    setHistoryData(
                                                        historyData?.map((v) => {
                                                            return { ...v, isCheckBoxSelected: false };
                                                        }),
                                                    );
                                                }}
                                            />
                                        }
                                        label="Business Approval Required"
                                        className="mb-2"
                                        name="active"
                                    />
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                )}
            </div>
        </>
    );
};

export default Layout;
