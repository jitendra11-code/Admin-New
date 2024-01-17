import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Button, TextField, Autocomplete, Stack, Box, Tab, Tabs } from '@mui/material';
import FileUploadAction from './Actions/FileUploadAction';
import FileDownloadList from './Actions/FileDownloadList';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { AgGridReact } from 'ag-grid-react';
import { AppState } from 'redux/store';
import { useDispatch, useSelector } from 'react-redux';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import { useUrlSearchParams } from 'use-url-search-params';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import moment from 'moment';
import axios from 'axios';
import { fetchError, showMessage } from 'redux/actions';
import ApproveAndRejectAction from 'pages/common-components/ApproveRejectAction';
import workflowFunctionAPICall from 'pages/Mandate/workFlowActionFunction';
import { SHOW_MESSAGE } from 'types/actions/Common.action';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayJs, { Dayjs } from 'dayjs';
import ToggleSwitch from '@uikit/common/ToggleSwitch';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { DialogActions, Tooltip } from '@mui/material';
import { AiOutlinePlus } from 'react-icons/ai';
import { TbPencil } from 'react-icons/tb';
import MandateInfo from 'pages/common-components/MandateInformation';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import { Link } from 'react-router-dom';
import regExpressionTextField, { regExpressionRemark, textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';
import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: (props: TabPanelProps) => any = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {children}
        </div>
    );
};

declare global {
    interface Navigator {
        msSaveBlob?: (blob: any, defaultName?: string) => boolean;
    }
}

const QualityAuditReport = ({ tab }) => {
    const navigate = useNavigate();
    const [remark, setRemark] = useState('');
    const [error, setError] = useState(null);
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [sendBack, setSendBack] = React.useState(false);
    const [approved, setApproved] = React.useState(false);
    const location = useLocation();
    const apiType = location?.state?.apiType || '';
    const [selectedMandate, setSelectedMandate] = useState(null);
    const [userAction, setUserAction] = React.useState(null);
    const action = userAction?.action || '';
    const runtimeId = userAction?.runtimeId || 0;
    const [sectionDataList, setSectionDataList] = React.useState<any>([]);
    const gridRef = React.useRef<AgGridReact>(null);
    const gridRef2 = React.useRef<AgGridReact>(null);
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);

    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const [params] = useUrlSearchParams({}, {});
    const [mandateInfo, setMandateData] = React.useState(null);
    const [mandateId, setMandateId] = React.useState(null);
    const { id } = useParams();
    const { user } = useAuthUser();
    const [approvedLayout, setApprovedLayout] = React.useState(true);
    const [qualityId, setQualityId] = React.useState<any>();
    const [sectionName, setSectionName] = React.useState<any>();
    const [areaName, setAreaName] = React.useState<any>();
    const [reportDetails, setReportDetails] = React.useState<any>([]);
    const [open, setOpen] = React.useState(false);
    const [vendorInformation, setVendorInformation] = React.useState([]);
    const [isUpdated, setIsUpdated] = React.useState(false);
    const [errorVendor, setErrorVendor] = useState<any>({});
    const [count, setCount] = useState(0);
    const [gridApi, setGridApi] = React.useState(null);
    const [gridApi2, setGridApi2] = React.useState(null);
    const [columnListBasedAN, setColumnListBasedAN] = React.useState([]);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [gridColumnApi2, setGridColumnApi2] = React.useState(null);
    const dispatch = useDispatch();
    const [localData, setLocalData] = React.useState<any>([]);
    const [noSnag, setNoSnag] = React.useState(false);
    const [editButton, setEditButton] = useState(false);
    const [selectedRowIndex, setSelectedRowIndex] = React.useState<any>();
    const [selectedObj, setSelectedObj] = React.useState<any>();
    const [value, setValue] = React.useState<number>(2);
    const [availabelColList, setColumnList] = React.useState([]);
    const [keyCount, setKeyCount] = React.useState(0);
    const [countChar, setCountChar] = React.useState(0);
    const [formData, setFormData] = React.useState<any>({
        date: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
        TKORepresentative: '',
        branch_office: '',
        carpet_area: '',
        tkO_company: '',
        tko_start_date: null || new Date(),
        interior_completion_date: null || new Date(),
    });

    let statusList = ['Ok', 'Not Ok'];
    let impactList = ['High', 'Medium', 'Low'];
    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined) {
            const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(mandateId?.id) && item?.module === module);
            if (apiType === '' && userAction !== undefined) {
                setUserAction(userAction);
            } else {
                let action = mandateId;
                setUserAction(action);
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
    }, [mandateId]);

    useEffect(() => {
        var _colList: any;
        if (sectionName !== '' && sectionDataList?.length > 0) {
            _colList = sectionDataList && sectionDataList?.find((item) => item?.listName?.toUpperCase() === sectionName?.toUpperCase());
            _colList = _colList?.columnList;
            if (_colList !== undefined) {
                _colList = _colList?.split(',');
                _colList =
                    _colList &&
                    _colList?.map((item) => {
                        return item?.trim();
                    });
                setColumnList(_colList || []);
            }
        }
    }, [sectionName, sectionDataList]);

    useEffect(() => {
        if (mandateId?.id !== undefined && mandateId?.id !== 'noid' && sectionDataList && sectionDataList?.length > 0) {
            setAreaName(sectionDataList?.[0]);
            setSectionName(sectionDataList?.[0]?.listName || '');
            getQualityReportDetails(sectionDataList?.[0]);
        }
    }, [sectionDataList, tab, qualityId, mandateId, setSectionDataList]);

    React.useEffect(() => {
        if (id !== 'noid' && id) {
            setMandateId(id);
        }
        getAreaNameList();
    }, []);
    let columnDefsAreaList = [
        {
            field: 'listName',
            headerName: 'Area Name',
            headerTooltip: 'Area Name',
            sortable: true,
            resizable: true,
            width: 80,
            cellStyle: { fontSize: '13px' },
        },
    ];

    const onSectionChangeSelection = (params) => {
        getQualityReportDetails(params?.data);
    };
    let columnDefs = [
        {
            field: '',
            headerName: 'Action',
            headerTooltip: 'Action',
            resizable: true,
            width: 100,
            maxWidth: 100,
            pinned: 'left',
            cellRenderer: (e: any) => (
                <>
                    <div className="actions">
                        <Tooltip title="Edit Report" className="actionsIconsReport">
                            <button type="button" className="actionsIconsReport">
                                <TbPencil
                                    onClick={() => {
                                        let vendor = vendorInformation && vendorInformation?.find((item) => item?.id === e?.data?.vendorId);
                                        let obj = {};
                                        obj['observation'] = e?.data?.observation || '';
                                        obj['quantity'] = e?.data?.qty || '';
                                        obj['status'] = e?.data?.status || '';
                                        obj['impact'] = e?.data?.impact || '';
                                        obj['reading'] = e?.data?.reading || '';
                                        obj['vendorId'] = e?.data?.vendorId || '';
                                        obj['category'] = e?.data?.category || '';
                                        obj['vendor'] = vendor;
                                        setFormData((state) => ({
                                            ...state,
                                            ...obj,
                                        }));
                                        setSelectedRowIndex(e?.rowIndex);
                                        setSelectedObj(e?.data);
                                        handleOpen();
                                        setEditButton(true);
                                    }}
                                />
                            </button>
                        </Tooltip>

                        <>
                            <FileUploadAction selectedObj={selectedObj} sectionName={sectionName} localData={localData} setLocalData={setLocalData} id={e?.data?.recordId ? e?.data?.recordId : e?.data?.id ? e?.data?.id : areaName?.id * 100 + e?.data?.sequence} params={e} mandateId={mandateId?.id} />
                            <FileDownloadList recordId={e?.data?.recordId ? e?.data?.recordId : e.data?.id || 0} props={e} mandate={{ id: mandateId?.id }} />
                        </>
                    </div>
                </>
            ),
        },
        {
            field: '',
            headerName: 'Sr. No',
            headerTooltip: 'Serial Number',
            cellRenderer: (e: any) => {
                var index = e?.rowIndex;
                return index + 1;
            },

            sortable: true,
            resizable: true,
            width: 80,
            maxWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'observation',
            headerName: 'Observation',
            headerTooltip: 'Observation',
            tooltipField: 'observation',
            sortable: true,
            resizable: true,
            width: 130,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'qty',
            headerName: 'Quantity',
            headerTooltip: 'Quantity',
            sortable: true,
            resizable: true,
            width: 100,
            minWidth: 100,
            suppressSizeToFit: true,

            cellStyle: { fontSize: '13px', cursor: 'pointer' },
        },
        {
            field: 'reading',
            headerName: 'Reading',
            headerTooltip: 'Reading',
            sortable: true,
            resizable: true,
            width: 100,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'impact',
            headerName: 'Impact',
            headerTooltip: 'Impact',
            sortable: true,
            resizable: true,
            width: 100,
            minWidth: 100,
            suppressSizeToFit: true,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'status',
            headerName: 'Status',
            headerTooltip: 'Status',
            sortable: true,
            resizable: true,
            width: 100,
            minWidth: 100,
            suppressSizeToFit: true,
            cellStyle: { fontSize: '13px' },
        },

        {
            field: 'vendorName',
            headerName: 'Vendor Name',
            headerTooltip: 'Vendor Name',
            tooltipField: 'vendorName',
            sortable: true,
            resizable: true,
            width: 140,
            minWidth: 140,
            suppressSizeToFit: true,
            cellRenderer: (params: any) => {
                var vendor_id = params.data.vendorId;
                var vendorName;
                if (vendor_id !== 0) {
                    vendorName = params?.vendorInformation?.find((item) => item?.id === vendor_id);
                    vendorName = vendorName?.vendorname;
                }
                console.log('vendorname', params?.data?.vendorName, vendorName, vendor_id);
                return vendorName || params?.data?.vendorName || '';
            },
            cellRendererParams: {
                vendorInformation: vendorInformation,
            },
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'category',
            headerName: 'Category',
            headerTooltip: 'Category',
            tooltipField: 'category',
            sortable: true,
            resizable: true,
            width: 100,
            minWidth: 100,
            suppressSizeToFit: true,
            cellStyle: { fontSize: '13px' },
        },
    ];

    const getAreaNameList = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ITAsset/GetITAssets?Type=Quality Audit Sections&partnerCategory=All`)
            .then((response: any) => {
                if (response && response?.data && response?.data?.length > 0) {
                    setSectionDataList(response?.data);
                } else {
                    setSectionDataList([]);
                }
            })
            .catch((e: any) => {});
    };

    const getQualityReport = () => {
        formData['TKORepresentative'] = '';
        formData['branch_office'] = '';
        formData['carpet_area'] = '';
        formData['tkO_company'] = '';
        formData['date'] = moment().format('YYYY-MM-DDThh:mm:ss.SSS');
        formData['tko_start_date'] = null || new Date();
        formData['interior_completion_date'] = null || new Date();
        setApprovedLayout(true);
        setIsUpdated(false);
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/QualityAuditReport/GetQualityReport?mandateId=${mandateId?.id}`)
            .then((response: any) => {
                if (response && response?.data && response?.data?.length > 0) {
                    const result = response?.data;
                    setQualityId(result[0].id || 0);
                    setFormData({
                        TKORepresentative: result[0].tkO_Resepresentative || '',
                        branch_office: result[0].branch_office || '',
                        carpet_area: result[0].carpet_area,
                        tkO_company: result[0].tkO_company || '',
                        date: result[0]?.date && moment(result[0]?.date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                        tko_start_date: result[0]?.tkO_start_date && moment(result[0].tkO_start_date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                        interior_completion_date: result[0]?.interior_completion_date && moment(result[0].interior_completion_date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    });
                    setApprovedLayout(result[0].approved_layout || false);
                    setIsUpdated(true);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid') {
            getQualityReport();
            getVendorAllocationForBOQ();
        }
    }, [mandateId]);

    const getVendorAllocationForBOQ = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BOQ/GetVendorAllocationForBOQ?mandateid=${mandateId?.id}`)
            .then((response: any) => {
                if (response?.data && response?.data && response?.data?.length > 0) {
                    console.log('AAA', response);
                    setVendorInformation(response?.data);
                } else {
                    setVendorInformation([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const getQualityReportDetails = (item) => {
        setAreaName(item);
        setSectionName(item?.listName || '');
        if (mandateId?.id === undefined || mandateId?.id === null) {
            dispatch(fetchError('Please select Mandate Id'));
            return;
        }
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/QualityAuditReport/GetQualityReportDetails?qualityId=${qualityId || 0}&section=${item?.listName}`)
            .then((response: any) => {
                if (response?.data && response?.data && response?.data?.length > 0) {
                    var resArry = response?.data;

                    if (localData && localData?.length > 0) {
                        for (let item of resArry) {
                            var count = true;
                            for (let i = 0; localData.length > i; i++) {
                                if (item.id == localData[i].id && item.section == localData[i].section) {
                                    count = false;
                                }
                            }
                            if (count) {
                                localData.push(item);
                            }
                        }
                        let merge = localData?.filter((f) => f?.section === item?.listName);
                        let _json = [...merge];
                        var resArr = [];
                        _json?.forEach(function (item) {
                            var i = resArr.findIndex((x) => x.id == item.id);
                            if (i <= -1) {
                                resArr.push(item);
                            }
                        });

                        setReportDetails(resArr);
                    } else {
                        setLocalData(response?.data);
                        setReportDetails(response?.data);
                    }
                } else {
                    getQualityReportBySection(item);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const getQualityReportBySection = (item) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/QualityAuditReport/GetQualityReportBySection?section=${item?.listName || ''}`)
            .then((response: any) => {
                if (response?.data && response?.data && response?.data?.length > 0) {
                    var resArry = response?.data;
                    if (localData && localData?.length > 0) {
                        for (let item of resArry) {
                            var count = true;
                            for (let i = 0; localData.length > i; i++) {
                                if (item.id == localData[i]?.id && item.section == localData[i]?.section) {
                                    count = false;
                                }
                            }
                            if (count) {
                                localData.push(item);
                            }
                        }
                        let merge = localData?.filter((f) => f?.section === item?.listName);
                        let _json = [...merge];
                        var resArr = [];
                        _json?.forEach(function (item) {
                            var i = resArr.findIndex((x) => x.id == item.id);
                            if (i <= -1) {
                                resArr.push(item);
                            }
                        });
                        setReportDetails(resArr);
                    } else {
                        setLocalData(response?.data);
                        setReportDetails(response?.data);
                    }
                } else {
                    let merge = localData?.filter((f) => f?.section === item?.listName);
                    let _json = [...merge];
                    var resArr = [];
                    _json?.forEach(function (item) {
                        var i = resArr.findIndex((x) => x.id == item.id);
                        if (i <= -1) {
                            resArr.push(item);
                        }
                    });
                    setReportDetails(resArr);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const handleDateChange = (newValue: Dayjs | null, name) => {
        if (newValue !== null && dayJs(newValue).isValid()) formData[name] = newValue?.toDate();
        setFormData({ ...formData });
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (value === null) {
            delete setError[name];
            setError({ ...error });
        } else {
            setError({
                ...error,
                [name]: '',
            });
        }
    };

    React.useMemo(() => {
        var _noImpactList = reportDetails && reportDetails.filter((item) => item?.impact === '');
        if (reportDetails?.length === 0 || _noImpactList?.length == 0) {
            setNoSnag(true);
            return;
        }
        if (_noImpactList?.length === reportDetails?.length) {
            setNoSnag(false);
            return;
        }
        setNoSnag(true);
    }, [sectionName, reportDetails, setReportDetails]);
    const handleAddRow = () => {
        const count = _validationDiaglogBox();
        if (count > 0) return;
        if (editButton === true) {
            let obj = {
                id: selectedObj?.id || 0,
                uid: '',
                recordId: selectedObj?.id || 0,
                fk_Quality_Audit_Id: selectedObj?.fk_Quality_Audit_Id || 0,
                vendorId: formData['vendor']?.id || 0,
                vendorName: formData['vendor']?.vendorname || '',
                vendor: formData['vendor'] || null,
                section: sectionName || 0,
                sequence: selectedObj?.sequence || 0,
                observation: formData?.observation || '',
                qty: formData?.quantity || 0,
                reading: formData['reading'] || '',
                impact: formData['impact'],
                status: formData['status'],
                category: formData?.category || '',
                remarks: '',
                isDeleted: false,
                createdBy: user?.UserName ,
                createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                modifiedBy: user?.UserName ,
                modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                index: selectedRowIndex,
            };

            var reportDetailsData = [...reportDetails];
            reportDetailsData[selectedRowIndex] = obj;
            gridRef2?.current.api.setRowData(reportDetailsData);
            setReportDetails(reportDetailsData);
            for (let i = 0; localData?.length > i; i++) {
                if (localData?.[i].section === sectionName && localData?.[i]?.id === selectedObj?.id) {
                    localData[i] = obj;
                }
            }
            setLocalData(localData);
            formData['observation'] = '';
            formData['reading'] = '';
            formData['quantity'] = '';
            formData['status'] = '';
            formData['impact'] = '';
            formData['vendorname'] = '';
            formData['vendor'] = null;
            formData['category'] = '';
            handleClose();
        } else {
            let obj = {
                id: 0,
                uid: '',
                fk_Quality_Audit_Id: 0,
                vendorId: formData['vendor']?.id || 0,
                vendor: formData['vendor'] || null,
                vendorName: formData?.vendorName || '',
                section: sectionName,
                sequence: reportDetails?.length - 1 + 1 || 1,
                recordId: areaName?.id * 100 + (reportDetails?.length - 1 + 1 || 1),
                observation: formData?.observation || '',
                qty: formData?.quantity || 0,
                reading: formData['reading'] || '',
                impact: formData['impact'],
                status: formData['status'],
                category: formData?.category || '',
                remarks: '',
                isDeleted: false,
                createdBy: user?.UserName ,
                createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                modifiedBy: user?.UserName ,
                modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                index: reportDetails?.length,
            };
            setReportDetails([...reportDetails, obj]);
            if (localData && localData.length > 0) {
                setLocalData([...localData, obj]);
            } else {
                setLocalData([obj]);
            }
        }
        formData['observation'] = '';
        formData['reading'] = '';
        formData['quantity'] = '';
        formData['status'] = '';
        formData['impact'] = '';
        formData['vendorname'] = '';
        formData['vendor'] = null;
        formData['category'] = '';
        handleClose();
    };

    const _validation = () => {
        let temp = {};
        let no = 0;
        if (formData.TKORepresentative === undefined || formData.TKORepresentative === '' || formData.TKORepresentative === null) {
            no++;
            temp = { ...temp, TKORepresentative: 'Please enter TKO Representative' };
        }
        if (formData.branch_office === undefined || formData.branch_office == '' || formData.branch_office == null) {
            no++;
            temp = { ...temp, branch_office: 'Please enter Branch Office' };
        }
        if (formData.carpet_area === undefined || formData.carpet_area === '' || formData.carpet_area === null) {
            no++;
            temp = { ...temp, carpet_area: 'Please enter Carpet Area' };
        } else if (formData.carpet_area == 0) {
            no++;
            temp = { ...temp, carpet_area: 'Carpet Area should not accept only 0' };
        }
        if (formData.tkO_company === undefined || formData.tkO_company == '' || formData.tkO_company == null) {
            no++;
            temp = { ...temp, tkO_company: 'Please enter TKO Company' };
        }

        setError({ ...error, ...temp });
        return no;
    };

    useEffect(() => {
        if (formData?.length > 0) {
            _validation();
        }
    }, [formData]);

    const handleSubmit = () => {
        if (mandateId?.id === undefined || mandateId?.id === null) {
            dispatch(fetchError('Please select Mandate Id'));
            return;
        }
        var count = _validation();
        if (count > 0) {
            return false;
        }

        let postArr = [
            {
                id: 0,
                uid: 'string',
                mandateId: mandateId?.id,
                date: formData?.date && moment(formData?.date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                auditor_Name: '',
                tkO_Resepresentative: formData?.TKORepresentative || '',
                branch_office: formData?.branch_office || '',
                carpet_area: (formData?.carpet_area && parseInt(formData?.carpet_area)) || 0,
                approved_layout: approvedLayout,
                tkO_company: formData?.tkO_company || '',
                tkO_start_date: (formData?.tko_start_date && moment(formData?.tko_start_date).format('YYYY-MM-DDTHH:mm:ss.SSS')) || moment(formData?.tkO_start_date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                interior_completion_date: formData?.interior_completion_date && moment(formData?.interior_completion_date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                rectification_Time: 0,
                status: '',
                createdBy: user?.UserName ,
                createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                modifiedBy: user?.UserName ,
                modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            },
        ];

        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/QualityAuditReport/CreateQualityReport`, postArr)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response) {
                    workFlowMandate('Send Back');
                    getFkQualityAuditId();
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const getFkQualityAuditId = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/QualityAuditReport/GetQualityReport?mandateId=${mandateId?.id}`)
            .then((response: any) => {
                if (response && response?.data) {
                    const result = response?.data;
                    var _id = result[0]?.id;
                    if (_id !== undefined && _id !== 0) {
                        postCreateQualityReportDetails(_id);
                    }
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const postCreateQualityReportDetails = (id) => {
        localData.forEach((element) => {
            element.fk_Quality_Audit_Id = id;
            element.createdBy = user?.UserName;
            element.createdDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
            element.modifiedBy = user?.UserName ;
            element.modifiedDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
            element.remarks = '';
            element.sequence = 0;
            element.uid = '';

            element.isDeleted = false;
            element.vendorId = 0;
        });

        var postArray = [];
        localData &&
            localData.map((f) => {
                var que = {
                    category: f.category,
                    createdBy: f.createdBy,
                    recordId: f?.recordId || 0,
                    createdDate: f.createdDate,
                    fk_Quality_Audit_Id: f.fk_Quality_Audit_Id,
                    id: 0,
                    impact: f.impact,
                    isDeleted: f.isDeleted,
                    modifiedBy: f.modifiedBy,
                    modifiedDate: f.modifiedDate,
                    observation: f.observation,
                    qty: f.qty || 0,
                    reading: f.reading,
                    remarks: f.remarks,
                    section: f.section,
                    sequence: f.sequence,
                    status: f.status,
                    uid: f.uid,
                    vendorId: f.vendorId,
                };
                postArray.push(que);
            });

        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/QualityAuditReport/CreateQualityReportDetails`, postArray)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response) {
                    dispatch(showMessage('Quality Audit Report is added successfully!'));
                    setApprovedLayout(true);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const handleUpdate = () => {
        var count = _validation();
        if (count > 0) {
            return false;
        }

        let postArrUpdate = [
            {
                id: qualityId || 0,
                uid: '',
                mandateId: mandateId?.id || 0,
                date: formData?.date && moment(formData?.date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                auditor_Name: '',
                tkO_Resepresentative: formData?.TKORepresentative || '',
                branch_office: formData?.branch_office || '',
                carpet_area: (formData?.carpet_area && parseInt(formData?.carpet_area)) || 0,
                approved_layout: approvedLayout,
                tkO_company: formData?.tkO_company || '',
                tkO_start_date: formData?.tko_start_date && moment(formData?.tko_start_date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                interior_completion_date: formData?.interior_completion_date && moment(formData?.interior_completion_date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                rectification_Time: 0,
                status: '',
                createdBy: user?.UserName ,
                createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                modifiedBy: user?.UserName ,
                modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            },
        ];

        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/QualityAuditReport/UpdateQualityReport`, postArrUpdate)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response) {
                    workFlowMandate('Send Back');
                    postUpdateQualityReportDetails();
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const postUpdateQualityReportDetails = () => {
        localData &&
            localData.map((element) => {
                return {
                    fk_Quality_Audit_Id: qualityId,
                    createdBy: user?.UserName ,
                    createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    modifiedBy: user?.UserName ,
                    modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    remarks: '',
                    sequence: 0,
                    recordId: element?.recordId || 0,
                    uid: '',
                    isDeleted: false,
                    vendorId: element?.vendorId,
                };
            });

        var postArray = [];
        postArray =
            localData &&
            localData.map((f) => {
                return {
                    category: f.category,
                    createdBy: f.createdBy,
                    createdDate: f.createdDate,
                    fk_Quality_Audit_Id: f.fk_Quality_Audit_Id || qualityId,
                    id: f.id,
                    impact: f.impact,
                    isDeleted: f.isDeleted,
                    modifiedBy: f.modifiedBy,
                    modifiedDate: f.modifiedDate,
                    observation: f.observation,
                    qty: f.qty || 0,
                    reading: f.reading,
                    remarks: f.remarks,
                    recordId: f?.recordId || 0,
                    section: f.section,
                    sequence: f.sequence,
                    status: f.status,
                    uid: f.uid,
                    vendorId: f.vendorId,
                };
            });

        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/QualityAuditReport/UpdateQualityReportDetails`, postArray)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }

                if (response) {
                    dispatch(showMessage('Quality Audit Report is updated successfully!'));
                    setApprovedLayout(true);
                    setIsUpdated(false);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const handleApprovedLayout = (e) => {
        setApprovedLayout(e.target.value === 'true' ? true : false);
    };

    const handleNoSnag = () => {
        if (mandateId?.id === undefined || mandateId?.id === null) {
            dispatch(fetchError('Please select Mandate Id'));
            return;
        }

        var count = _validation();
        if (count > 0) {
            return false;
        }

        let postArr = [
            {
                id: 0,
                uid: 'string',
                mandateId: mandateId?.id || 0,
                date: formData?.date && moment(formData?.date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                auditor_Name: '',
                tkO_Resepresentative: formData?.TKORepresentative || '',
                branch_office: formData?.branch_office || '',
                carpet_area: (formData?.carpet_area && parseInt(formData?.carpet_area)) || 0,
                approved_layout: approvedLayout,
                tkO_company: formData?.tkO_company || '',
                tkO_start_date: (formData?.tko_start_date && moment(formData?.tko_start_date).format('YYYY-MM-DDTHH:mm:ss.SSS')) || moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                interior_completion_date: formData?.interior_completion_date && moment(formData?.interior_completion_date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                rectification_Time: 0,
                status: '',
                createdBy: user?.UserName ,
                createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                modifiedBy: user?.UserName ,
                modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            },
        ];

        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/QualityAuditReport/CreateQualityReport`, postArr)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.status == 200) {
                    getFkQualityAuditId();
                    workFlowMandate('Created');
                    dispatch(showMessage('Record is added successfully!'));
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const _validationDiaglogBox = () => {
        let temp = {};
        let no = 0;
        if (availabelColList?.includes('observation') && (formData.observation === undefined || formData.observation == '' || formData.observation == null)) {
            no++;
            temp = { ...temp, observation: 'Please enter Observation' };
        }
        if (availabelColList?.includes('reading') && (formData.reading === undefined || formData.reading === '' || formData.reading === null)) {
            no++;

            temp = { ...temp, reading: 'Please enter Reading' };
        }
        if (availabelColList?.includes('status') && (formData.status === undefined || formData.status === '' || formData.status === null)) {
            no++;
            temp = { ...temp, status: 'Please select Status' };
        }

        if (availabelColList?.includes('impact') && (formData.impact === undefined || formData.impact === '' || formData.impact === null)) {
            no++;
            temp = { ...temp, impact: 'Please select Impact' };
        }

        if (availabelColList?.includes('qty') && (formData.quantity === undefined || formData.quantity === '' || formData.quantity === null)) {
            no++;
            temp = { ...temp, quantity: 'Please enter Quantity' };
        }
        if (availabelColList?.includes('category') && (formData.category === undefined || formData.category.trim() == '' || formData.category == null)) {
            no++;
            temp = { ...temp, category: 'Please enter Category' };
        }
        setError({ ...error, ...temp });
        return no;
    };

    const _getRuntimeId = (id) => {
        const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(id) && item?.module === module);
        return userAction?.runtimeId || 0;
    };

    const workFlowMandate = (action) => {
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: _getRuntimeId(mandateId.id) || 0,
            mandateId: mandateId?.id || 0,
            tableId: mandateId?.id || 0,
            remark: 'Created',
            createdBy: user?.UserName ,
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: action || '',
        };
        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ''}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                dispatch({
                    type: SHOW_MESSAGE,
                    message: 'Task Completed Successfully!',
                });
                if (!response) return;
                if (response?.data === true) {
                    navigate('/list/task');
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    function onGridReady(params) {
        setGridApi(params.api);
        gridRef.current!.api.sizeColumnsToFit();
    }

    function onGridReady2(params) {
        setGridApi2(params.api);
        setColumnListBasedAN(params.api.getColumnDefs());
        setGridColumnApi2(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }

    const getColDef = useCallback(() => {
        var filterdColList = [];
        var _finalColDef = [];
        if (sectionName !== undefined && availabelColList && availabelColList?.length > 0) {
            var commonDef = columnDefs && columnDefs.filter((item) => item?.field === '');
            filterdColList = columnDefs.filter((item) => availabelColList?.includes(item?.field));
            _finalColDef = commonDef.concat(filterdColList);
            return _finalColDef || [];
        }
        return [];
    }, [sectionName, tab, qualityId, setSectionName, availabelColList]);

    const handleClose = () => {
        setOpen(false);
        setEditButton(false);
        formData['observation'] = '';
        formData['quantity'] = '';
        formData['status'] = '';
        formData['impact'] = '';
        formData['vendorname'] = '';
        formData['vendor'] = null;

        formData['category'] = '';
        formData['reading'] = '';
        setError({});
    };

    const handleOpen = () => {
        if (sectionName === undefined || sectionName === null || sectionName == '') {
            dispatch(fetchError('Please Select Section'));
            return;
        }
        setOpen(true);
    };
    const handleTab = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const onKeyDown = (e) => {
        e.preventDefault();
    };

    const onPrint = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/QualityAuditReport/GetPDFQualityReport?mandateId=${mandateId?.id || 0}&qualityId=${qualityId || 0}`)
            .then((res) => {
                const linkSource = `data:application/pdf;base64,${res?.data}`;
                const downloadLink = document.createElement('a');
                const fileName = `Quality_Audit_${mandateId?.id}.pdf`;

                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();
                dispatch(showMessage('Download Quality Audit Successfully!'));
            })
            .catch((err) => {});
    };

    return (
        <>
            <div style={{ padding: '10px !important' }} className="card-panal inside-scroll-208 qualityauditreport">
                <MandateInfo mandateCode={mandateId} pageType="" source="" redirectSource={`${params?.source}`} setMandateCode={setMandateId} setMandateData={setMandateData} setpincode={() => {}} setCurrentStatus={setCurrentStatus} setCurrentRemark={setCurrentRemark} />
                {/* <TabContext value={value}> */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleTab} aria-label="lab API tabs example">
                        <Tab value={0} label="Assign Quality Auditor" to={`/mandate/${id}/quality-audit`} component={Link} />
                        <Tab value={1} label="Asset Verification" to={`/mandate/${id}/boq-verification`} component={Link} />
                        <Tab value={2} label="Quality Audit Report" to={`/mandate/${id}/quality-audit-report`} component={Link} />
                        <Tab value={3} label="Quality Audit Derived Report" to={`/mandate/${id}/quality-audit-derived-report`} component={Link} />
                    </Tabs>
                </Box>
                {/* </TabContext> */}
                <>
                    <form>
                        <div className="phase-outer" style={{ paddingLeft: '10px' }}>
                            <Grid container item display="flex" flexDirection="row" spacing={5} marginTop="0px" justifyContent="start" alignSelf="center">
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Date</h2>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DesktopDatePicker className="w-85" disabled inputFormat="DD/MM/YYYY" value={formData['date']} onChange={(e) => handleDateChange(e, 'date')} renderInput={(params) => <TextField {...params} sx={{ backgroundColor: '#f3f3f3' }} size="small" />} />
                                        </LocalizationProvider>
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">TKO Representative</h2>
                                        <TextField
                                            autoComplete="off"
                                            InputProps={{ inputProps: { maxLength: 20 } }}
                                            onPaste={(e: any) => {
                                                if (!textFieldValidationOnPaste(e)) {
                                                    dispatch(fetchError('You can not paste Spacial characters'));
                                                }
                                            }}
                                            name="TKORepresentative"
                                            id="TKORepresentative"
                                            type="text"
                                            size="small"
                                            value={formData.TKORepresentative !== undefined ? formData.TKORepresentative : ''}
                                            onChange={handleChange}
                                            onKeyDown={(e: any) => {
                                                if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                    e.preventDefault();
                                                }
                                                regExpressionTextField(e);
                                            }}
                                        />
                                    </div>
                                    {error?.TKORepresentative && error?.TKORepresentative ? <p className="form-error">{error?.TKORepresentative}</p> : null}
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Branch Office</h2>
                                        <TextField
                                            autoComplete="off"
                                            name="branch_office"
                                            id="branch_office"
                                            type="text"
                                            InputProps={{ inputProps: { maxLength: 20 } }}
                                            onPaste={(e: any) => {
                                                if (!textFieldValidationOnPaste(e)) {
                                                    dispatch(fetchError('You can not paste Spacial characters'));
                                                }
                                            }}
                                            size="small"
                                            value={formData.branch_office !== undefined ? formData.branch_office : ''}
                                            onChange={handleChange}
                                            onKeyDown={(e: any) => {
                                                if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                    e.preventDefault();
                                                }
                                                regExpressionTextField(e);
                                            }}
                                        />
                                    </div>
                                    {error?.branch_office && error?.branch_office ? <p className="form-error">{error?.branch_office}</p> : null}
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Carpet Area</h2>
                                        <TextField
                                            autoComplete="off"
                                            name="carpet_area"
                                            id="carpet_area"
                                            InputProps={{ inputProps: { maxLength: 5 } }}
                                            type="text"
                                            size="small"
                                            value={formData.carpet_area !== undefined ? formData.carpet_area : ''}
                                            onChange={handleChange}
                                            onPaste={(e: any) => {
                                                if (!textFieldValidationOnPaste(e)) {
                                                    dispatch(fetchError('You can not paste Spacial characters'));
                                                }
                                            }}
                                            onKeyDown={(e: any) => {
                                                blockInvalidChar(e);
                                                if (e?.key === 'Backspace' && keyCount > 0) {
                                                    setKeyCount(keyCount - 1);

                                                    if (keyCount === 1) setCountChar(0);
                                                }
                                                if (e.target.selectionStart === 0 && (e.code === 'Space' || e.code === 'Numpad0' || e.code === 'Digit0')) {
                                                    e.preventDefault();
                                                }

                                                if (!(countChar > 0 && e?.key === '.')) setKeyCount(keyCount + 1);
                                                if (e?.key === '.') {
                                                    setCount(count + 1);
                                                }
                                                if (
                                                    (!/[0-9.]/.test(e.key) || (countChar > 0 && e?.key === '.')) && (e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight")) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </div>
                                    {error?.carpet_area && error?.carpet_area ? <p className="form-error">{error?.carpet_area}</p> : null}
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Interiors As Approved Layout</h2>
                                        <ToggleSwitch alignment={approvedLayout} handleChange={(e) => handleApprovedLayout(e)} yes={'Yes'} no={'No'} name={'approved_layout'} id="approved_layout" onBlur={() => {}} disabled={false} bold="false" />
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">TKO Company</h2>
                                        <TextField
                                            autoComplete="off"
                                            name="tkO_company"
                                            id="tkO_company"
                                            type="text"
                                            size="small"
                                            value={formData.tkO_company !== undefined ? formData.tkO_company : ''}
                                            onChange={handleChange}
                                            InputProps={{ inputProps: { maxLength: 20 } }}
                                            onPaste={(e: any) => {
                                                if (!textFieldValidationOnPaste(e)) {
                                                    dispatch(fetchError('You can not paste Spacial characters'));
                                                }
                                            }}
                                            onKeyDown={(e: any) => {
                                                if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                    e.preventDefault();
                                                }
                                                regExpressionTextField(e);
                                            }}
                                        />
                                    </div>
                                    {error?.tkO_company && error?.tkO_company ? <p className="form-error">{error?.tkO_company}</p> : null}
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">TKO Start Date</h2>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DesktopDatePicker
                                                className="w-85"
                                                inputFormat="DD/MM/YYYY"
                                                maxDate={dayJs()}
                                                value={formData['tko_start_date'] || dayJs()}
                                                onChange={(e) => handleDateChange(e, 'tko_start_date')}
                                                renderInput={(params) => <TextField {...params} onKeyDown={onKeyDown} size="small" />}
                                            />
                                        </LocalizationProvider>
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Interior Completion Date</h2>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DesktopDatePicker
                                                className="w-85"
                                                inputFormat="DD/MM/YYYY"
                                                value={formData['interior_completion_date'] || new Date()}
                                                onChange={(e) => handleDateChange(e, 'interior_completion_date')}
                                                renderInput={(params) => <TextField {...params} onKeyDown={onKeyDown} size="small" />}
                                            />
                                        </LocalizationProvider>
                                    </div>
                                </Grid>

                                <Grid item xs={12} md={12} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <Button
                                            title="Add Item"
                                            style={{
                                                borderRadius: '50%',
                                                border: '1px solid #00316a',
                                                padding: '1px',
                                                fontSize: '13px',
                                                marginRight: '8px',
                                                color: '#00316a',
                                                cursor: 'pointer',
                                                width: '20px',
                                                minWidth: '20px',
                                            }}
                                            onClick={handleOpen}
                                        >
                                            <AiOutlinePlus />
                                        </Button>
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                    <div style={{ height: 'calc(100vh - 438px)' }}>
                                        <CommonGrid
                                            onFirstDataRendered={(params) => {
                                                params?.api?.getDisplayedRowAtIndex(0)?.setSelected(true);
                                            }}
                                            rowHeight={35}
                                            getRowId={(params) => {
                                                return params?.data?.id;
                                            }}
                                            rowSelection={'single'}
                                            onRowClicked={(params) => {
                                                onSectionChangeSelection(params);
                                            }}
                                            defaultColDef={{ flex: 1 }}
                                            columnDefs={columnDefsAreaList}
                                            rowData={sectionDataList || []}
                                            onGridReady={onGridReady}
                                            gridRef={gridRef}
                                            pagination={false}
                                            paginationPageSize={null}
                                        />
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={9} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                    <div style={{ height: 'calc(100vh - 438px)' }}>
                                        <CommonGrid
                                            defaultColDef={{
                                                singleClickEdit: true,
                                                flex: 1,
                                            }}
                                            rowHeight={35}
                                            columnDefs={getColDef() || []}
                                            rowData={reportDetails || []}
                                            onGridReady={onGridReady2}
                                            gridRef={gridRef2}
                                            pagination={false}
                                            paginationPageSize={null}
                                        />
                                    </div>
                                </Grid>
                            </Grid>
                        </div>

                        <div className="bottom-fix-history">
                            <MandateStatusHistory mandateCode={mandateId?.id} accept_Reject_Remark={currentRemark} accept_Reject_Status={currentStatus} />
                        </div>

                        {action === '' && runtimeId === 0 && (
                            <div className="bottom-fix-btn bg-pd">
                                <div className="remark-field" style={{ marginRight: '0px' }}>
                                    <Stack display="flex" flexDirection="row" justifyContent="space-between" alignItems={'center'} alignContent="center" sx={{ margin: '10px' }} style={{ marginLeft: '-2.7%' }}>
                                        <Button
                                            variant="outlined"
                                            size="medium"
                                            name="submit"
                                            onClick={isUpdated ? handleUpdate : handleSubmit}
                                            style={{
                                                marginLeft: 10,
                                                padding: '2px 20px',
                                                borderRadius: 6,
                                                color: '#fff',
                                                borderColor: '#00316a',
                                                backgroundColor: '#00316a',
                                            }}
                                        >
                                            {isUpdated ? 'Send Back To PM' : 'Send Back To PM'}
                                        </Button>

                                        {
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                name="submit"
                                                disabled={noSnag}
                                                onClick={handleNoSnag}
                                                style={{
                                                    marginLeft: 10,
                                                    padding: '2px 20px',
                                                    borderRadius: 6,
                                                    color: '#fff',
                                                    borderColor: '#00316a',
                                                    backgroundColor: noSnag ? '#f3f3f3' : '#00316a',
                                                }}
                                            >
                                                No Snag Found
                                            </Button>
                                        }
                                        {
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                name="submit"
                                                onClick={() => onPrint()}
                                                style={{
                                                    marginLeft: 10,
                                                    padding: '2px 20px',
                                                    borderRadius: 6,
                                                    color: '#fff',
                                                    borderColor: '#00316a',
                                                    backgroundColor: '#00316a',
                                                }}
                                            >
                                                Print
                                            </Button>
                                        }

                                        {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                                    </Stack>
                                </div>
                            </div>
                        )}

                        {userAction?.module === module && (
                            <>
                                {action && action === 'Create' && (
                                    <div className="bottom-fix-btn bg-pd">
                                        <div className="remark-field">
                                            <Stack display="flex" flexDirection="row" justifyContent="space-between" alignItems={'center'} alignContent="center" sx={{ margin: '10px' }} style={{ marginLeft: '-2.7%' }}>
                                                <Button
                                                    variant="outlined"
                                                    size="medium"
                                                    name="submit"
                                                    onClick={isUpdated ? handleUpdate : handleSubmit}
                                                    style={{
                                                        marginLeft: 10,
                                                        padding: '2px 20px',
                                                        borderRadius: 6,
                                                        color: '#fff',
                                                        borderColor: '#00316a',
                                                        backgroundColor: '#00316a',
                                                    }}
                                                >
                                                    {isUpdated ? 'Send Back To PM' : 'Send Back To PM'}
                                                </Button>

                                                {user?.role !== 'Project Manager' && (
                                                    <Button
                                                        variant="outlined"
                                                        size="medium"
                                                        name="submit"
                                                        disabled={noSnag}
                                                        onClick={handleNoSnag}
                                                        style={{
                                                            marginLeft: 10,
                                                            padding: '2px 20px',
                                                            borderRadius: 6,
                                                            color: '#fff',
                                                            borderColor: '#00316a',
                                                            backgroundColor: noSnag ? '#f3f3f3' : '#00316a',
                                                        }}
                                                    >
                                                        No Snag Found
                                                    </Button>
                                                )}

                                                {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                                            </Stack>
                                        </div>
                                    </div>
                                )}
                                {action && action === 'Verify and Submit' && (
                                    <div className="bottom-fix-btn bg-pd">
                                        <div className="remark-field">
                                            <Stack display="flex" flexDirection="row" justifyContent="space-between" alignItems={'center'} alignContent="center" sx={{ margin: '10px' }} style={{ marginLeft: '-2.7%' }}>
                                                <Button
                                                    variant="outlined"
                                                    size="medium"
                                                    name="submit"
                                                    onClick={isUpdated ? handleUpdate : handleSubmit}
                                                    style={{
                                                        marginLeft: 10,
                                                        padding: '2px 20px',
                                                        borderRadius: 6,
                                                        color: '#fff',
                                                        borderColor: '#00316a',
                                                        backgroundColor: '#00316a',
                                                    }}
                                                >
                                                    {isUpdated ? 'Send Back To PM' : 'Send Back To PM'}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="medium"
                                                    name="submit"
                                                    onClick={(e) => {
                                                        var count = _validation();
                                                        if (count > 0) {
                                                            return false;
                                                        } else {
                                                            workFlowMandate('Verify and Submit');
                                                        }
                                                    }}
                                                    style={{
                                                        marginLeft: 10,
                                                        padding: '2px 20px',
                                                        borderRadius: 6,
                                                        color: '#fff',
                                                        borderColor: '#00316a',
                                                        backgroundColor: '#00316a',
                                                    }}
                                                >
                                                    Verify and Submit
                                                </Button>

                                                {user?.role !== 'Project Manager' && action !== 'Verify and Submit' && (
                                                    <Button
                                                        variant="outlined"
                                                        size="medium"
                                                        name="submit"
                                                        disabled={noSnag}
                                                        onClick={handleNoSnag}
                                                        style={{
                                                            marginLeft: 10,
                                                            padding: '2px 20px',
                                                            borderRadius: 6,
                                                            color: '#fff',
                                                            borderColor: '#00316a',
                                                            backgroundColor: noSnag ? '#f3f3f3' : '#00316a',
                                                        }}
                                                    >
                                                        Verify and Submit
                                                    </Button>
                                                )}

                                                {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                                            </Stack>
                                        </div>
                                    </div>
                                )}
                                {action && action === 'Activity Completed' && (
                                    <div className="bottom-fix-btn bg-pd">
                                        <div className="remark-field">
                                            <Stack display="flex" flexDirection="row" justifyContent="space-between" alignItems={'center'} alignContent="center" sx={{ margin: '10px' }} style={{ marginLeft: '-2.7%' }}>
                                                <Button
                                                    variant="outlined"
                                                    size="medium"
                                                    name="submit"
                                                    onClick={(e) => {
                                                        var count = _validation();
                                                        if (count > 0) {
                                                            return false;
                                                        } else {
                                                            workFlowMandate('Activity Completed');
                                                        }
                                                    }}
                                                    style={{
                                                        marginLeft: 10,
                                                        padding: '2px 20px',
                                                        borderRadius: 6,
                                                        color: '#fff',
                                                        borderColor: '#00316a',
                                                        backgroundColor: '#00316a',
                                                    }}
                                                >
                                                    Activity Completed
                                                </Button>
                                                {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                                            </Stack>
                                        </div>
                                    </div>
                                )}

                                {action && action === 'Resubmit Clarification' && (
                                    <div className="bottom-fix-btn bg-pd">
                                        <div className="remark-field" style={{ marginRight: '0px' }}>
                                            <Stack display="flex" flexDirection="row" justifyContent="space-between" alignItems={'center'} alignContent="center" sx={{ margin: '10px' }} style={{ marginLeft: '-2.7%' }}>
                                                <Button
                                                    variant="outlined"
                                                    size="medium"
                                                    name="submit"
                                                    onClick={(e) => {
                                                        var count = _validation();
                                                        if (count > 0) {
                                                            return false;
                                                        } else {
                                                            workFlowMandate('Resubmit Clarification');
                                                        }
                                                    }}
                                                    style={{
                                                        marginLeft: 10,
                                                        padding: '2px 20px',
                                                        borderRadius: 6,
                                                        color: '#fff',
                                                        borderColor: '#00316a',
                                                        backgroundColor: '#00316a',
                                                    }}
                                                >
                                                    Resubmit Clarification
                                                </Button>
                                                {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                                            </Stack>
                                        </div>
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
                                                setRemark={setRemark}
                                                approveEvent={() => {
                                                    workflowFunctionAPICall(runtimeId, mandateId?.id, remark, 'Approved', navigate, user);
                                                }}
                                                sentBackEvent={() => {
                                                    workflowFunctionAPICall(runtimeId, mandateId?.id, remark, 'Sent Back', navigate, user);
                                                }}
                                            />
                                            <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </form>
                </>
            </div>

            <Dialog fullWidth maxWidth="xl" open={open} onClose={handleClose}>
                <DialogTitle style={{ paddingRight: 20, fontSize: 16, color: '#000' }}>Add Item</DialogTitle>
                <div style={{ height: 'calc(100vh - 360px)', margin: '0px 20px 0px' }}>
                    <form>
                        <div className="phase-outer" style={{ paddingLeft: '10px' }}>
                            <Grid marginBottom="10px" marginTop="5px" container item spacing={5} justifyContent="start" alignSelf="center" sx={{ paddingTop: '0px!important' }}>
                                {availabelColList?.includes('observation') && (
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Observation</h2>
                                            <TextField
                                                autoComplete="off"
                                                name="observation"
                                                id="observation"
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                type="text"
                                                size="small"
                                                value={formData.observation !== undefined ? formData.observation : ''}
                                                onChange={handleChange}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                    regExpressionTextField(e);
                                                }}
                                            />
                                        </div>
                                        {error?.observation && error?.observation ? <p className="form-error">{error?.observation}</p> : null}
                                    </Grid>
                                )}

                                {availabelColList?.includes('reading') && (
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Reading</h2>
                                            <TextField
                                                autoComplete="off"
                                                name="reading"
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                id="reading"
                                                type="text"
                                                size="small"
                                                value={formData?.reading !== undefined ? formData?.reading : ''}
                                                onChange={handleChange}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                    regExpressionTextField(e);
                                                }}
                                            />
                                        </div>
                                        {error?.reading && error?.reading ? <p className="form-error">{error?.reading}</p> : null}
                                    </Grid>
                                )}

                                {availabelColList?.includes('qty') && (
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Quantity</h2>
                                            <TextField
                                                autoComplete="off"
                                                name="quantity"
                                                id="quantity"
                                                type="number"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                inputProps={{
                                                    min: 0,
                                                    inputMode: 'numeric',
                                                    pattern: '[0-9]',
                                                }}
                                                onKeyDown={(e: any) => {
                                                    blockInvalidChar(e);
                                                    if (e.keyCode === 69) e?.preventDefault();
                                                }}
                                                value={formData.quantity !== undefined ? formData.quantity : ''}
                                                onChange={handleChange}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                            />
                                        </div>
                                        {error?.quantity && error?.quantity ? <p className="form-error">{error?.quantity}</p> : null}
                                    </Grid>
                                )}

                                {availabelColList?.includes('status') && (
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Status</h2>
                                            <Autocomplete
                                                disablePortal
                                                id="combo-box-demo"
                                                getOptionLabel={(option) => option?.toString() || ''}
                                                disableClearable
                                                options={statusList || []}
                                                value={formData?.status}
                                                onChange={(e, value: any) => {
                                                    setFormData({ ...formData, status: value });
                                                    setError({ ...error, status: '' });
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
                                                    />
                                                )}
                                            />
                                        </div>
                                        {error?.status && error?.status ? <p className="form-error">{error?.status}</p> : null}
                                    </Grid>
                                )}

                                {availabelColList?.includes('impact') && (
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Impact</h2>
                                            <Autocomplete
                                                disablePortal
                                                id="combo-box-demo"
                                                getOptionLabel={(option: any) => option?.toString() || ''}
                                                disableClearable
                                                options={impactList || []}
                                                onChange={(e, value: any) => {
                                                    setFormData({ ...formData, impact: value });
                                                    setError({ ...error, impact: '' });
                                                }}
                                                value={formData?.impact}
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
                                        </div>
                                        {error?.impact && error?.impact ? <p className="form-error">{error?.impact}</p> : null}
                                    </Grid>
                                )}

                                {availabelColList?.includes('vendorName') && (
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable ">Vendor</h2>
                                            <Autocomplete
                                                disablePortal
                                                id="combo-box-demo"
                                                getOptionLabel={(option: any) => option?.vendorname?.toString() || ''}
                                                disableClearable
                                                options={vendorInformation || []}
                                                onChange={(e, value: any) => {
                                                    setFormData({
                                                        ...formData,
                                                        vendor: value,
                                                        vendorName: value?.vendorname,
                                                    });
                                                }}
                                                value={formData?.vendor}
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
                                                        required
                                                        size="small"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </Grid>
                                )}

                                {availabelColList?.includes('category') && (
                                    <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Category</h2>
                                            <TextField
                                                autoComplete="off"
                                                name="category"
                                                id="category"
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
                                                type="text"
                                                size="small"
                                                value={formData.category !== undefined ? formData.category : ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {error?.category && error?.category ? <p className="form-error">{error?.category}</p> : null}
                                    </Grid>
                                )}
                            </Grid>
                        </div>
                    </form>
                </div>
                <DialogActions className="button-wrap">
                    <Button className="yes-btn" onClick={handleAddRow}>
                        {editButton ? 'Update' : 'Submit'}
                    </Button>
                    <Button className="yes-btn" onClick={handleClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default QualityAuditReport;
