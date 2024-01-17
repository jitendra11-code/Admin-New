import { Button, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField, Grid, TableContainer, Autocomplete } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import * as React from 'react';
import { useFormik } from 'formik';
import { updatePhaseApprovalNoteInitialValues, updatePhaseApprovalNoteSchema } from '@uikit/schemas';
import ApproveAndRejectAction from 'pages/common-components/ApproveRejectAction';
import '../style.css';
import { useLocation, useNavigate } from 'react-router-dom';
import workflowFunctionAPICall from '../workFlowActionFunction';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/store';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { useUrlSearchParams } from 'use-url-search-params';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import DataTable from 'pages/common-components/Table';
import { fetchError, showMessage } from 'redux/actions';
import ToggleSwitch from '@uikit/common/ToggleSwitch';
import _generateData from '../Utility/PhaseApprovalNote';
import { _createOptions } from '../Utility/PhaseApprovalNote';
import regExpressionTextField, { textFieldValidationOnPaste, regExpressionRemark, isCrossWordLimit } from '@uikit/common/RegExpValidation/regForTextField';
import pdf from '../../../../assets/icon/pdfImg.png';
import NumberFormatCustom from '@uikit/common/NumberFormatTextField';
import RemoveThousandSeparator from '@uikit/common/NumberFormatTextField/RemoveThosandSeperator';

const MainInfo = ({ setActionName, mandateId, mandateInfo, currentRemark, currentStatus, phaseApprovalNoteId, phaseApprovalNoteScopeData, setPhaseApprovalNoteId, pathName = '', phaseData }) => {
    const navigate = useNavigate();
    const today = new Date();
    const [sendBack, setSendBack] = React.useState(false);
    const [approved, setApproved] = React.useState(false);
    const [remark, setRemark] = React.useState('');
    const [userAction, setUserAction] = React.useState(null);
    const [updateError, setUpdateError] = React.useState({});
    const { user } = useAuthUser();
    const action = userAction?.action || '';
    const runtimeId = userAction?.runtimeId || 0;
    const [phaseApprovalNoteData, setPhaseApprovalNoteData] = React.useState<any>(null);
    const [phaseOpsGridData, setPhaseApprovaGridData] = React.useState<any>([]);
    const [phaseApprovalNoteDataError, setPhaseApprovalNoteDataError] = React.useState<any>([]);
    const [dateValue, setDateValue] = React.useState<Dayjs | null>(dayjs(today));
    const [count, setCount] = React.useState(0);
    const [keyCount, setKeyCount] = React.useState(0);
    let { id } = useParams();
    const [params] = useUrlSearchParams({}, {});
    const location = useLocation();
    const dispatch = useDispatch();
    const [data1, setData1] = React.useState<any>({});
    const [data2, setData2] = React.useState<any>({});
    const apiType = location?.state?.apiType || '';
    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);

    const style = {
        border: '1px solid rgba(224, 224, 224, 1)',
        padding: '7px 7px',
        borderRight: '0px !important',
    };

    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/GetGlCategoryCount?PhaseId=${mandateId?.phaseId || 0}`)
                .then((res) => {
                    const groupedData = res?.data?.reduce((groups, item) => {
                        const groupKey = item.glCategory;
                        if (!groups[groupKey]) {
                            groups[groupKey] = [];
                        }
                        groups[groupKey].push(item);
                        return groups;
                    }, {});
                    setData1(groupedData);
                })
                .catch((err) => {});
        }
    }, [mandateId]);

    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/GetBusinessCount?PhaseId=${mandateId?.phaseId || 0}`)
                .then((res) => {
                    const groupedData = res?.data?.reduce((groups, item) => {
                        const groupKey = item.businessType;
                        if (!groups[groupKey]) {
                            groups[groupKey] = [];
                        }
                        groups[groupKey].push(item);
                        return groups;
                    }, {});
                    setData2(groupedData);
                })
                .catch((err) => {});
        }
    }, [mandateId]);

    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined) {
            getPhaseApprovalNoteById(mandateId?.id);
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
    }, [mandateId]);

    React.useEffect(() => {
        if (userAction?.action !== undefined) {
            setActionName(userAction?.action);
        }
    }, [userAction?.action]);

    const phaseApprovalNoteDetailsAPICall = (amount, id) => {
        axios
            .get(
                `${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/PhaseApprovalNoteApprovalDetails?amount=${amount}&Phase_approval_note_id=${id || 0}&phaseId=${mandateId?.phaseId || 0}&noBudgetAmount=${
                    phaseApprovalNoteData?.nonBudgeted === 'false' ? 0 : RemoveThousandSeparator(values?.nonBudgetAmount || phaseApprovalNoteData?.nonBudgetAmount, 'int') || 0
                }`,
            )
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data && response?.data?.length > 0) {
                    groupbyMultikeys(response?.data || []);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error occurred !'));
            });
    };

    function base64ToBlob(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; ++i) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return new Blob([bytes], { type: 'text/plain' });
    }

    const phaseApprovalNotePdfAPICall = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/GetPDFReportOfApprovalNote?PhaseAppNoteId=${id || 0}&mandateid=${id || 0}&noteType=Phase&noBudgetAmount=${values?.nonBudgetAmount || 0}`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error occurred !'));
                    return;
                }

                if (response?.data) {
                    var fileName = 'Phase_Approval_Note' + '_' + phaseApprovalNoteData?.phaseName;

                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        let byteChar = atob(response?.data);
                        let byteArray = new Array(byteChar.length);
                        for (let i = 0; i < byteChar.length; i++) {
                            byteArray[i] = byteChar.charCodeAt(i);
                        }
                        let uIntArray = new Uint8Array(byteArray);
                        let blob = new Blob([uIntArray], { type: 'application/pdf' });
                        window.navigator.msSaveBlob(blob, 'filename.pdf');
                    } else {
                        const source = `data:application/pdf;base64,${response?.data}`;
                        const link = document.createElement('a');
                        link.href = source;
                        link.download = `${fileName}.pdf`;
                        link.click();
                        dispatch(showMessage('PDF is downloaded successfully!'));
                    }
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error occurred !'));
            });
    };

    const getPhaseApprovalNoteById = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/PhaseApprovalNoteById?id=${id}`)
            .then((response: any) => {
                if (!response) return;
                if (response?.data && response?.data?.length > 0) {
                    var id = response && response?.data?.[0]?.id;
                    var notedate = response && response?.data?.[0]?.notedate;
                    var non_budget_flag = response?.data?.[0]?.nonBudgeted;
                    var non_budegeted_amt = response && response?.data?.[0]?.nonBudgetAmount;
                    setDateValue(notedate);

                    if (id !== undefined) {
                        setPhaseApprovalNoteId(id);
                    }
                    setPhaseApprovalNoteData(response?.data[0] || null);
                    setPhaseApprovalNoteData((state) => ({
                        ...state,
                        nonBudgeted: non_budget_flag ? 'true' : non_budget_flag === undefined ? '' : 'false',
                    }));
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error occurred !'));
            });
    };

    const getBudgetByMandateId = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/GetBudget?mandateid=${id}`)
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data !== undefined) {
                    setFieldValue('approved_amount', response?.data);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error occurred !'));
            });
    };

    const getObjByMandateId = (id, data, item) => {
        var obj = null;
        if (item?.levels?.trim() === 'Prepared By' && phaseApprovalNoteData?.id === undefined) {
            obj = data?.find((item) => item?.userName === user?.UserName && item?.levels?.trim() === 'Prepared By');
            return obj || null;
        }
        obj = data?.find((item) => item?.lastselected_id === id);
        return obj || null;
    };
    const getObjForPreparedBy = (data, d) => {
        var found = data && data.find((a) => a.levels === d.levels && a.sequence === d.sequence && a.designation === d.designation && a.lastselected_id !== 0);

        return found || null;
    };

    const groupbyMultikeys = (data) => {
        var res =
            data &&
            data.reduce((acc, d) => {
                var found = null;
                found = acc.find((a) => a.levels === d.levels && a.sequence === d.sequence && a.designation === d.designation);
                var value = null;
                if (phaseApprovalNoteData?.id === undefined) {
                    value = d;
                } else {
                    var _item = getObjForPreparedBy(data, d);

                    if (_item !== null) value = _item;
                }

                if (!found) {
                    if (value && value !== null) acc.push({ ...value, options: [value] });
                } else {
                    if (value && value !== null) found.options.push(value);
                }
                return acc;
            }, []);

        var _data = _generateData(res, phaseApprovalNoteData, user);
        setPhaseApprovaGridData(_data || []);
    };

    const handlePhaseApprovalNoteDataChange = (e: any) => {
        const { name, value } = e.target;

        setPhaseApprovalNoteData({ ...phaseApprovalNoteData, [name]: value });
        setUpdateError({ ...updateError, [name]: '' });
        setPhaseApprovalNoteDataError({
            ...phaseApprovalNoteDataError,
            [name]: '',
        });
    };
    const handleDateChange = (newValue: Dayjs | null) => {
        setDateValue(newValue);
        setPhaseApprovalNoteData({
            ...phaseApprovalNoteData,
            ['notedate']: newValue,
        });
    };
    const _validationPhaseApprovalNote = () => {
        if (phaseApprovalNoteData?.id !== undefined) {
            if (phaseApprovalNoteData?.location === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['location']: 'Please enter location',
                });
            }
            if (phaseApprovalNoteData?.activity_summary === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['activity_summary']: 'Please enter Activity Summary',
                });
            }
            if (phaseApprovalNoteData?.cost_justification === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['cost_justification']: 'Please enter cost justification',
                });
            }
            if (phaseApprovalNoteData?.cpu_remarks === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['cpu_remarks']: 'Please enter remarks',
                });
            }
            if (phaseApprovalNoteData?.cosumed_budget_amount === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['cosumed_budget_amount']: 'Please enter Consumed Budget',
                });
            }
            if (phaseApprovalNoteData?.balance_budget_amount === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['balance_budget_amount']: 'Please enter Balance Budget Amount',
                });
            }
            if (phaseApprovalNoteData?.total_budget_amount === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['total_budget_amount']: 'Please enter total budget amount',
                });
            }
            if (phaseApprovalNoteData?.cpu_remarks === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['location']: 'Please enter remarks',
                });
            }
            if (phaseApprovalNoteData?.branchname === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['branchname']: 'Please enter branch name and address',
                });
            }
            if (phaseApprovalNoteData?.purpose === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['purpose']: 'Please enter purpose',
                });
            }
            if (phaseApprovalNoteData?.activity_time_line === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['activity_time_line']: 'Please enter activity time line',
                });
            }
            if (phaseApprovalNoteData?.subject === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['subject']: 'Please enter subject',
                });
            }
        }
    };

    const _savePhaseApprovalNoteScopeData = (id: number, phaseApprovalNoteScopeData) => {
        const body =
            phaseApprovalNoteScopeData &&
            phaseApprovalNoteScopeData?.map((item, key) => {
                return {
                    ...item,
                    id: phaseApprovalNoteId === undefined || phaseApprovalNoteId === null ? 0 : id,
                    createdBy: user?.UserName || '',
                    modifiedBy: user?.UserName || '',
                    createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    include: item?.include || '',
                    phase_approval_note_id: id || 0,
                };
            });
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/CreatePhaseApprovalNoteScope`, body)
            .then((res: any) => {})
            .catch((err) => {});
    };

    const { values, handleBlur, handleChange, setFieldValue, handleSubmit, errors, touched } = useFormik({
        initialValues: updatePhaseApprovalNoteInitialValues,
        validationSchema: updatePhaseApprovalNoteSchema,
        validateOnChange: true,
        validateOnBlur: false,
        onSubmit: (values, action) => {
            var data = phaseOpsGridData?.map((item, ind) => {
                return item?.options[0]?.values;
            });
            var _validationArr = data?.filter((item) => item == null);

            if (phaseData[0]?.Chargeable_Area > phaseData[0]?.Carpet_Area) {
                dispatch(fetchError('Please check as chargeable area should not be more than carpet area'));
                return;
            }

            if (_validationArr.length > 0) {
                dispatch(fetchError('Please select mandatory fileds!!'));
                return;
            }
            const body = {
                id: 0,
                status: 'Active',
                fk_mandate_id: mandateId?.id || 0,
                uid: '',
                createddate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                modifieddate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                approval_note_no: values?.approval_note_no || '',
                sub_department: values?.sub_department,
                location: (values?.location && values?.location?.toString()) || '',
                subject: values?.subject,
                branchname: values?.branchname,
                purpose: values?.purpose,
                activity_time_line: values?.activity_time_line,
                approved_amount: RemoveThousandSeparator(values?.approved_amount, 'int') || 0,
                total_budget_amount: RemoveThousandSeparator(parseInt(values?.total_budget_amount), 'int') || 0,
                cosumed_budget_amount: RemoveThousandSeparator(parseInt(values?.cosumed_budget_amount), 'int') || 0,
                balance_budget_amount: RemoveThousandSeparator(parseInt(values?.balance_budget_amount), 'int') || 0,
                activity_summary: values?.activity_summary || '',
                cost_justification: values?.cost_justification || '',
                cpu_remarks: values?.cpu_remarks || '',
                doa_remarks: '',
                approval_remarks: '',
                pdm_remarks: '',
                pm_remarks: '',
                createdby: user?.UserName,
                modifiedby: user?.UserName,
                notedate: (phaseApprovalNoteData?.notedate && moment(phaseApprovalNoteData?.notedate).format('YYYY-MM-DDTHH:mm:ss.SSS')) || moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                approved_by: '',
                nonBudgeted: values?.non_budget_amount_switch === 'true' ? true : false,
                nonBudgetAmount: RemoveThousandSeparator(values?.nonBudgetAmount, 'string')?.toString() || '',
            };
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/CreatePhaseApprovalNote`, body)
                .then((response: any) => {
                    if (!response) return;
                    if (!response.status) {
                        dispatch(fetchError('Error occurred !'));
                        return;
                    }

                    if (response && response?.data && response?.data?.data?.id) {
                        savePhaseApprovalNoteGridData(response?.data?.data?.id);
                        _savePhaseApprovalNoteScopeData(response?.data?.data?.id, phaseApprovalNoteScopeData);
                    }
                    const token = localStorage.getItem('token');
                    const body = {
                        runtimeId: runtimeId || 0,
                        mandateId: id || phaseApprovalNoteData?.id || 0,
                        tableId: mandateId?.phaseId || 0,
                        remark: 'Submitted' || '',
                        createdBy: user?.UserName,
                        createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                        action: 'Created' || '',
                    };
                    axios({
                        method: 'post',
                        url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark}`,
                        headers: { Authorization: `Bearer ${token}` },
                    })
                        .then((response: any) => {
                            dispatch(showMessage('Phase approval note created Successfully!'));
                            if (!response) return;
                            if (response) {
                                action.resetForm();
                                if (params?.source === 'list') {
                                    navigate('/list/task');
                                } else {
                                    navigate('/mandate');
                                }
                            }
                        })
                        .catch((e: any) => {
                            dispatch(fetchError('Error occurred !'));
                        });
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error occurred !'));
                    action.resetForm();
                });
        },
    });
    React.useEffect(() => {
        if (values?.approved_amount) {
            phaseApprovalNoteDetailsAPICall(values?.approved_amount, phaseApprovalNoteData?.id);
        }
        if (phaseApprovalNoteData?.nonBudgetAmount !== undefined) {
            phaseApprovalNoteDetailsAPICall(values?.approved_amount, phaseApprovalNoteData?.id);
        }
    }, [values?.approved_amount, values?.nonBudgetAmount, phaseApprovalNoteData?.id, phaseApprovalNoteData?.nonBudgetAmount]);

    const savePhaseApprovalNoteGridData = (id) => {
        var data = [...phaseOpsGridData];
        var _finalArr: any = [];
        data =
            data &&
            data?.map((innerItem) => {
                innerItem &&
                    innerItem?.options &&
                    Object.values(innerItem?.options).map((item: any, key) => {
                        if (item?.values !== undefined && item?.values !== null) {
                            let obj = {
                                id: item?.values?.phase_detail_id || 0,
                                uid: '',
                                phase_approval_note_id: phaseApprovalNoteData?.id || id || 0,
                                level: item?.values?.levels || '',
                                authority_name: item?.values?.userName || '',
                                authority_Id: item?.values?.id || '',
                                designation: item?.values?.designation || '',
                                signature: item?.values?.signature || '',
                                sequence: item?.values?.sequence || 0,
                                remarks: 'Created',
                                status: 'Create',
                                createdby: user?.UserName || '',
                                createddate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                                modifiedby: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                            };
                            _finalArr.push(obj);
                        }
                    });
            });

        const body = {};
        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/CreatePhaseApprovalNoteApprovalDetails`,
            data: _finalArr,
        })
            .then((response: any) => {
                if (!response) return;
            })
            .catch((e: any) => {
                dispatch(fetchError('Error occurred !'));
            });
    };

    const getPhaseApprovalNoteCode = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/GetNextPhaseApprovalCode?PhaseId=${mandateId?.phaseId || 0}`)
            .then((response: any) => {
                if (!response) return;
                if (response?.data) {
                    setFieldValue('approval_note_no', response?.data);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error occurred !'));
            });
    };

    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid') {
            getPhaseApprovalNoteCode();
            getBudgetByMandateId(mandateId?.id);
        }
    }, [mandateId]);

    React.useEffect(() => {
        if (mandateInfo && mandateInfo !== null) {
            setFieldValue('sub_department', mandateInfo?.verticalName);
            setFieldValue('location', mandateInfo?.no_of_branches);
            setFieldValue('subject', `Mandate Geo Expansion ${mandateInfo?.phaseName || ''}`);
            setFieldValue('purpose', `Launching of ${mandateInfo?.verticalName || ''} Branches  - ${mandateInfo?.no_of_branches || ''} Locations. `);
            setFieldValue('branchname', 'As per mandate');
        }
    }, [mandateInfo]);

    const handleUpdateSubmit = (e: any) => {
        e.preventDefault();
        _validationPhaseApprovalNote();
        if (phaseApprovalNoteDataError && phaseApprovalNoteDataError?.length > 0) return;
        var data = [...phaseOpsGridData];

        var _phaseApprovalNoteData = phaseApprovalNoteData;
        _phaseApprovalNoteData['total_budget_amount'] = RemoveThousandSeparator(parseInt(_phaseApprovalNoteData?.total_budget_amount), 'int');
        _phaseApprovalNoteData['cosumed_budget_amount'] = RemoveThousandSeparator(parseInt(_phaseApprovalNoteData?.cosumed_budget_amount), 'int');
        _phaseApprovalNoteData['balance_budget_amount'] = RemoveThousandSeparator(parseInt(_phaseApprovalNoteData?.balance_budget_amount), 'int');
        _phaseApprovalNoteData['nonBudgetAmount'] = RemoveThousandSeparator(parseInt(_phaseApprovalNoteData?.nonBudgetAmount), 'string');
        _phaseApprovalNoteData['approved_amount'] = RemoveThousandSeparator(_phaseApprovalNoteData?.approved_amount, 'int');
        _phaseApprovalNoteData['nonBudgeted'] = _phaseApprovalNoteData?.nonBudgeted === 'true' ? true : false;

        const body = {};
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/UpdatePhaseApprovalNote?id=${phaseApprovalNoteData?.id}`, _phaseApprovalNoteData)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Phase Approval Note not Submitted!'));
                    return;
                }
                if (response && response?.data?.message == 'Record Updated Successfully') {
                    dispatch(showMessage('Phase Approval Note Submit Successfully!'));
                    savePhaseApprovalNoteGridData(phaseApprovalNoteData?.id);
                    let idx = phaseApprovalNoteData?.id;
                    if (idx && idx !== undefined) {
                        _savePhaseApprovalNoteScopeData(idx, phaseApprovalNoteScopeData);
                    }
                    const token = localStorage.getItem('token');
                    const body = {
                        runtimeId: runtimeId || 0,
                        mandateId: id || phaseApprovalNoteData?.id || 0,
                        tableId: mandateId?.phaseId || 0,
                        remark: 'Submitted' || '',
                        createdBy: user?.UserName,
                        createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                        action: 'Update',
                    };
                    axios({
                        method: 'post',
                        url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark}`,
                        headers: { Authorization: `Bearer ${token}` },
                    })
                        .then((response: any) => {
                            if (!response) return;
                        })
                        .catch((e: any) => {
                            dispatch(fetchError('Error occurred !'));
                        });
                    if (params?.source === 'list') {
                        navigate('/list/task');
                    } else {
                        navigate('/mandate');
                    }
                } else {
                    dispatch(fetchError('Phase Approval Note not Submitted !'));
                    return;
                }
            })
            .catch((e: any) => {});
    };
    const onKeyDown = (e) => {
        e.preventDefault();
    };
    return (
        <div className="card-panal inside-scroll-339-phase">
            <form onSubmit={phaseApprovalNoteData?.id === undefined ? handleSubmit : handleUpdateSubmit} style={{ marginBottom: '20px' }}>
                <div className="phase-outer">
                    <Grid marginBottom="0px" container item spacing={3} justifyContent="start" alignSelf="center">
                        <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable">Approval Note No.</h2>
                                <TextField
                                    name="approval_note_no"
                                    id="approval_note_no"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={values?.approval_note_no || phaseApprovalNoteData?.approval_note_no}
                                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                    onBlur={handleBlur}
                                    disabled
                                />
                            </div>
                        </Grid>

                        <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable required">Date</h2>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DesktopDatePicker
                                        className="w-85"
                                        inputFormat="DD/MM/YYYY"
                                        minDate={dayjs()}
                                        value={dateValue || new Date()}
                                        disabled
                                        onChange={handleDateChange}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                onKeyDown={onKeyDown}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '6px',
                                                }}
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable required">Sub Department</h2>
                                <Select
                                    displayEmpty
                                    sx={{
                                        backgroundColor: '#f3f3f3',
                                        borderRadius: '6px',
                                    }}
                                    inputProps={{ 'aria-label': 'Without label' }}
                                    size="small"
                                    className="w-85"
                                    name="sub_department"
                                    id="sub_department"
                                    value={values?.sub_department || phaseApprovalNoteData?.sub_department || ''}
                                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                    onBlur={handleBlur}
                                    disabled
                                >
                                    <MenuItem value={values?.sub_department}>{values?.sub_department}</MenuItem>
                                </Select>
                                {touched.sub_department && errors.sub_department ? <p className="form-error">{errors.sub_department}</p> : null}
                            </div>
                        </Grid>

                        <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable required">No of Mandate</h2>
                                <TextField
                                    name="location"
                                    autoComplete="off"
                                    disabled
                                    id="location"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={values?.location || phaseApprovalNoteData?.location}
                                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                    onBlur={handleBlur}
                                />
                                {touched.location && errors.location ? <p className="form-error">{errors.location}</p> : null}

                                {phaseApprovalNoteDataError?.location && phaseApprovalNoteDataError?.location ? <p className="form-error">{phaseApprovalNoteDataError?.location}</p> : null}
                            </div>
                        </Grid>

                        <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable required">Subject</h2>
                                <TextField
                                    name="subject"
                                    id="subject"
                                    autoComplete="off"
                                    variant="outlined"
                                    size="small"
                                    className="w-86"
                                    onKeyDown={(e: any) => {
                                        regExpressionTextField(e);
                                    }}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Special characters'));
                                        }
                                    }}
                                    value={values?.subject || phaseApprovalNoteData?.subject}
                                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                    disabled
                                />
                                {touched.subject && errors.subject ? <p className="form-error">{errors.subject}</p> : null}
                                {phaseApprovalNoteDataError?.subject && phaseApprovalNoteDataError?.subject ? <p className="form-error">{phaseApprovalNoteDataError?.subject}</p> : null}
                            </div>
                        </Grid>
                        <Grid item xs={6} md={2} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable required">Branch Name & Address</h2>
                                <TextField
                                    name="branchname"
                                    id="branchname"
                                    variant="outlined"
                                    autoComplete="off"
                                    size="small"
                                    disabled
                                    className="w-85"
                                    value={values?.branchname || phaseApprovalNoteData?.branchname}
                                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                    onKeyDown={(e: any) => {
                                        regExpressionTextField(e);
                                    }}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Special characters'));
                                        }
                                    }}
                                    onBlur={handleBlur}
                                />
                                {touched.branchname && errors.branchname ? <p className="form-error">{errors.branchname}</p> : null}
                                {phaseApprovalNoteDataError?.branchname && phaseApprovalNoteDataError?.branchname ? <p className="form-error">{phaseApprovalNoteDataError?.branchname}</p> : null}
                            </div>
                        </Grid>
                        <Grid item xs={6} md={4} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable required">Purpose</h2>
                                <TextField
                                    name="purpose"
                                    id="purpose"
                                    variant="outlined"
                                    autoComplete="off"
                                    size="small"
                                    className="w-85"
                                    value={values?.purpose || phaseApprovalNoteData?.purpose}
                                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                    onBlur={handleBlur}
                                    onKeyDown={(e: any) => {
                                        regExpressionTextField(e);
                                    }}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Special characters'));
                                        }
                                    }}
                                    disabled
                                />
                                {touched.purpose && errors.purpose ? <p className="form-error">{errors.purpose}</p> : null}
                                {phaseApprovalNoteDataError?.purpose && phaseApprovalNoteDataError?.purpose ? <p className="form-error">{phaseApprovalNoteDataError?.purpose}</p> : null}
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable required">Activity Time Line</h2>
                                <TextField
                                    name="activity_time_line"
                                    id="activity_time_line"
                                    autoComplete="off"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={values?.activity_time_line || phaseApprovalNoteData?.activity_time_line}
                                    InputProps={{
                                        inputProps: { min: 0, maxLength: 50 },
                                    }}
                                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Special characters'));
                                        }
                                    }}
                                    onBlur={handleBlur}
                                    disabled={action === 'Approve' || pathName === 'phase-approval-note-view'}
                                    onKeyDown={(e: any) => {
                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                            e.preventDefault();
                                        }
                                        regExpressionTextField(e);
                                    }}
                                />
                                {phaseApprovalNoteData === null && touched.activity_time_line && errors.activity_time_line !== '' ? <p className="form-error">{errors.activity_time_line}</p> : null}
                                {phaseApprovalNoteDataError.activity_time_line && phaseApprovalNoteDataError?.activity_time_line !== '' ? <p className="form-error">{phaseApprovalNoteDataError?.activity_time_line || ''}</p> : null}
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                            <div className="input-form"></div>
                        </Grid>
                        <Grid marginBottom="0px" container item spacing={3} justifyContent="start" alignSelf="center">
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
                                                    Cost till Date
                                                </TableCell>
                                                <TableCell align="center" colSpan={2}>
                                                    Budget Allocated
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="left" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                                                    Particular
                                                </TableCell>
                                                <TableCell align="left" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                                                    Amount(Rs.)
                                                </TableCell>
                                                <TableCell align="left" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                                                    Capex Details for FY
                                                </TableCell>
                                                <TableCell align="left" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                                                    Amount(Rs.)
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="required">Total Cost to be approved</TableCell>
                                                <TableCell>
                                                    <NumberFormatCustom
                                                        phaseApprovalNoteData={phaseApprovalNoteData}
                                                        setPhaseApprovalNoteData={setPhaseApprovalNoteData}
                                                        setFieldValue={setFieldValue}
                                                        name="approved_amount"
                                                        type={'text'}
                                                        disabled
                                                        id="approved_amount"
                                                        variant="outlined"
                                                        size="small"
                                                        className="w-85"
                                                        inputValue={values?.approved_amount || phaseApprovalNoteData?.approved_amount}
                                                        onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e: any) => {
                                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                    {touched?.approved_amount && errors?.approved_amount ? <p className="form-error">{errors?.approved_amount}</p> : null}
                                                    {updateError && <p className="form-error">{updateError['approved_amount'] !== undefined ? updateError['approved_amount'] : ''}</p>}
                                                </TableCell>
                                                <TableCell className="required"> Total Budget FY</TableCell>
                                                <TableCell>
                                                    <NumberFormatCustom
                                                        phaseApprovalNoteData={phaseApprovalNoteData}
                                                        setPhaseApprovalNoteData={setPhaseApprovalNoteData}
                                                        setFieldValue={setFieldValue}
                                                        name="total_budget_amount"
                                                        id="total_budget_amount"
                                                        sx={
                                                            action === 'Approve' && {
                                                                backgroundColor: '#f3f3f3',
                                                                borderRadius: '6px',
                                                            }
                                                        }
                                                        disabled={action === 'Approve' || pathName === 'phase-approval-note-view'}
                                                        type="text"
                                                        variant="outlined"
                                                        size="small"
                                                        className="w-85"
                                                        inputValue={values?.total_budget_amount || phaseApprovalNoteData?.total_budget_amount !== 0 ? phaseApprovalNoteData?.total_budget_amount : '0'}
                                                        onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                                        onBlur={handleBlur}
                                                        InputProps={{
                                                            inputProps: { min: 0, maxLength: 14 },
                                                        }}
                                                        onKeyDown={(e: any) => {
                                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                e.preventDefault();
                                                            }
                                                            regExpressionTextField(e);
                                                        }}
                                                    />
                                                    {phaseApprovalNoteData === null && touched?.total_budget_amount && errors?.total_budget_amount !== '' ? <p className="form-error">{errors?.total_budget_amount}</p> : null}
                                                    {updateError && <p className="form-error">{updateError['total_budget_amount'] !== undefined ? updateError['total_budget_amount'] : ''}</p>}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="required">Consumed Budget FY</TableCell>
                                                <TableCell>
                                                    <NumberFormatCustom
                                                        phaseApprovalNoteData={phaseApprovalNoteData}
                                                        setPhaseApprovalNoteData={setPhaseApprovalNoteData}
                                                        setFieldValue={setFieldValue}
                                                        name="cosumed_budget_amount"
                                                        type={'text'}
                                                        id="cosumed_budget_amount"
                                                        variant="outlined"
                                                        size="small"
                                                        className="w-85"
                                                        inputValue={values?.cosumed_budget_amount || phaseApprovalNoteData?.cosumed_budget_amount !== 0 ? phaseApprovalNoteData?.cosumed_budget_amount : '0'}
                                                        onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                                        onBlur={handleBlur}
                                                        disabled={action === 'Approve' || pathName === 'phase-approval-note-view'}
                                                        InputProps={{
                                                            inputProps: { min: 0, maxLength: 14 },
                                                        }}
                                                        onKeyDown={(e: any) => {
                                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                e.preventDefault();
                                                            }
                                                            regExpressionTextField(e);
                                                        }}
                                                    />
                                                    {phaseApprovalNoteData === null && touched?.cosumed_budget_amount && errors?.cosumed_budget_amount !== '' ? <p className="form-error">{errors?.cosumed_budget_amount}</p> : null}
                                                    {updateError && <p className="form-error">{updateError['cosumed_budget_amount'] !== undefined ? updateError['cosumed_budget_amount'] : ''}</p>}
                                                </TableCell>
                                                <TableCell className="required">Balance Budget FY</TableCell>
                                                <TableCell>
                                                    <NumberFormatCustom
                                                        phaseApprovalNoteData={phaseApprovalNoteData}
                                                        setPhaseApprovalNoteData={setPhaseApprovalNoteData}
                                                        setFieldValue={setFieldValue}
                                                        name="balance_budget_amount"
                                                        type={'text'}
                                                        id="balance_budget_amount"
                                                        variant="outlined"
                                                        size="small"
                                                        className="w-85"
                                                        inputValue={values?.balance_budget_amount || phaseApprovalNoteData?.balance_budget_amount !== 0 ? phaseApprovalNoteData?.balance_budget_amount : '0'}
                                                        onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                                        onBlur={handleBlur}
                                                        disabled={action === 'Approve' || pathName === 'phase-approval-note-view'}
                                                        InputProps={{
                                                            inputProps: { min: 0, maxLength: 14 },
                                                        }}
                                                        onKeyDown={(e: any) => {
                                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                    {phaseApprovalNoteData === null && touched?.balance_budget_amount && errors?.balance_budget_amount !== '' ? <p className="form-error">{errors?.balance_budget_amount}</p> : null}
                                                    {updateError && <p className="form-error">{updateError['balance_budget_amount'] !== undefined ? updateError['balance_budget_amount'] : ''}</p>}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Non Budgeted</TableCell>
                                                <TableCell>
                                                    <ToggleSwitch
                                                        disabled={action === 'Approve' || pathName === 'phase-approval-note-view'}
                                                        alignment={phaseApprovalNoteData?.nonBudgeted === 'true' || values.non_budget_amount_switch === 'true'}
                                                        handleChange={(e: any) => {
                                                            if (phaseApprovalNoteData?.nonBudgetAmount === undefined) {
                                                                setFieldValue('non_budget_amount_switch', e.target.value);
                                                                e.target.value === 'false' && setFieldValue('nonBudgetAmount', '');
                                                            } else {
                                                                setPhaseApprovalNoteData({
                                                                    ...phaseApprovalNoteData,
                                                                    nonBudgeted: e.target.value,
                                                                });
                                                                if (e.target.value === 'false') {
                                                                    setPhaseApprovalNoteData({
                                                                        ...phaseApprovalNoteData,
                                                                        nonBudgetAmount: '',
                                                                    });
                                                                }
                                                            }
                                                        }}
                                                        yes={'yes'}
                                                        no={'no'}
                                                        name={'non_budget_amount_switch'}
                                                        id="non_budget_amount_switch"
                                                        onBlur={handleBlur}
                                                        bold="true"
                                                    />
                                                </TableCell>
                                                <TableCell className={phaseApprovalNoteData?.nonBudgeted === 'true' || values?.non_budget_amount_switch === 'true' ? 'required' : 'non_required'}>Non Budget Amount</TableCell>
                                                <TableCell>
                                                    <NumberFormatCustom
                                                        phaseApprovalNoteData={phaseApprovalNoteData}
                                                        setPhaseApprovalNoteData={setPhaseApprovalNoteData}
                                                        setFieldValue={setFieldValue}
                                                        name="nonBudgetAmount"
                                                        type={'text'}
                                                        id="nonBudgetAmount"
                                                        variant="outlined"
                                                        size="small"
                                                        className="w-85"
                                                        inputValue={values?.nonBudgetAmount || phaseApprovalNoteData?.nonBudgetAmount !== 0 ? phaseApprovalNoteData?.nonBudgetAmount : '0'}
                                                        onChange={(e) => {
                                                            if (e.target.value?.length > 15) {
                                                                e.preventDefault();
                                                            } else {
                                                                if (phaseApprovalNoteData?.id === undefined) {
                                                                    handleChange(e);
                                                                } else {
                                                                    handlePhaseApprovalNoteDataChange(e);
                                                                }
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            phaseApprovalNoteDetailsAPICall(values?.approved_amount, phaseApprovalNoteData?.id);
                                                        }}
                                                        disabled={action === 'Approve' || pathName === 'phase-approval-note-view' || (phaseApprovalNoteData?.id === undefined && values?.non_budget_amount_switch === 'false') || phaseApprovalNoteData?.nonBudgeted === 'false'}
                                                        InputProps={{
                                                            inputProps: { min: 0, maxLength: 14 },
                                                        }}
                                                        onKeyDown={(e: any) => {
                                                            if (e?.key === 'Backspace' && keyCount > 0) {
                                                                setKeyCount(keyCount - 1);

                                                                if (keyCount === 1) setCount(0);
                                                            }
                                                            if (!(count > 0 && e?.key === '.')) setKeyCount(keyCount + 1);
                                                            if (e?.key === '.') {
                                                                setCount(count + 1);
                                                            }
                                                            // if (
                                                            //   e.target.selectionStart === 0 &&
                                                            //   e.code === "Space"
                                                            // ) {
                                                            //   e.preventDefault();
                                                            // }
                                                            // if (
                                                            //   !/[0-9.]/.test(e.key) ||
                                                            //   (count > 0 && e?.key === ".")
                                                            // ) {
                                                            //   e.preventDefault();
                                                            // }
                                                        }}
                                                    />
                                                    {touched?.nonBudgetAmount && (values?.non_budget_amount_switch === 'true' || phaseApprovalNoteData?.nonBudgeted === 'true') && errors?.nonBudgetAmount ? <p className="form-error">{errors?.nonBudgetAmount}</p> : null}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </Grid>
                            <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                                <Grid marginBottom="0px" container item spacing={3} justifyContent="start" alignSelf="center">
                                    <Grid item xs={12} md={12} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Activity Summary</h2>
                                            <textarea
                                                name="activity_summary"
                                                id="activity_summary"
                                                style={{ padding: '10px', height: '75px' }}
                                                className="w-85 textAreaVertical"
                                                value={values?.activity_summary || phaseApprovalNoteData?.activity_summary}
                                                onChange={(e) => {
                                                    if (isCrossWordLimit(e, 1500)) {
                                                        dispatch(fetchError('You can add maximum 1500 words'));
                                                    } else {
                                                        phaseApprovalNoteData?.id === undefined ? handleChange(e) : handlePhaseApprovalNoteDataChange(e);
                                                    }
                                                }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Special characters'));
                                                    }
                                                }}
                                                onBlur={handleBlur}
                                                disabled={action === 'Approve' || pathName === 'phase-approval-note-view'}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                    regExpressionTextField(e);
                                                }}
                                            />
                                            {phaseApprovalNoteData === null && touched?.activity_summary && errors?.activity_summary !== '' ? <p className="form-error">{errors?.activity_summary}</p> : null}
                                        </div>
                                    </Grid>
                                    <Grid item xs={12} md={12} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Cost Justification</h2>
                                            <textarea
                                                name="cost_justification"
                                                id="cost_justification"
                                                style={{ padding: '10px', height: '75px' }}
                                                className="w-85 textAreaVertical"
                                                value={values?.cost_justification || phaseApprovalNoteData?.cost_justification}
                                                onChange={(e) => {
                                                    if (isCrossWordLimit(e, 1500)) {
                                                        dispatch(fetchError('You can add maximum 1500 words'));
                                                    } else {
                                                        phaseApprovalNoteData?.id === undefined ? handleChange(e) : handlePhaseApprovalNoteDataChange(e);
                                                    }
                                                }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Special characters'));
                                                    }
                                                }}
                                                onBlur={handleBlur}
                                                disabled={action === 'Approve' || pathName === 'phase-approval-note-view'}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                    regExpressionTextField(e);
                                                }}
                                            />
                                            {phaseApprovalNoteData === null && touched?.cost_justification && errors?.cost_justification !== '' ? <p className="form-error">{errors?.cost_justification}</p> : null}
                                        </div>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} md={12} sx={{ position: 'relative', marginBottom: '10px' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Remarks</h2>
                                    <textarea
                                        name="cpu_remarks"
                                        id="cpu_remarks"
                                        style={{ padding: '10px', height: '100px' }}
                                        className="w-85 textAreaVertical"
                                        value={values?.cpu_remarks || phaseApprovalNoteData?.cpu_remarks}
                                        onChange={(e) => {
                                            if (isCrossWordLimit(e, 5000)) {
                                                dispatch(fetchError('You can add maximum 5000 words'));
                                            } else {
                                                phaseApprovalNoteData?.id === undefined ? handleChange(e) : handlePhaseApprovalNoteDataChange(e);
                                            }
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Special characters'));
                                            }
                                        }}
                                        onBlur={handleBlur}
                                        disabled={action === 'Approve' || pathName === 'phase-approval-note-view'}
                                        onKeyDown={(e: any) => {
                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                            regExpressionRemark(e);
                                        }}
                                    />
                                    {phaseApprovalNoteData === null && touched?.cpu_remarks && errors?.cpu_remarks !== '' ? <p className="form-error">{errors?.cpu_remarks}</p> : null}
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
                <div>
                    <Grid marginBottom="0px" container item spacing={3} justifyContent="start" alignSelf="center">
                        <Grid item xs={6} md={8} sx={{ position: 'relative' }}>
                            <TableContainer>
                                <Table className="dense-table" sx={{ minWidth: '100%', border: '1px solid rgba(224, 224, 224, 1)' }} size="small" aria-label="a dense table">
                                    <TableHead style={{ background: '#f4f7fe' }}>
                                        <TableRow>
                                            <TableCell style={{ width: '25%' }}>Authority Levels</TableCell>
                                            <TableCell align="left" style={{ width: '40%' }}>
                                                Name
                                            </TableCell>
                                            <TableCell align="left" style={{ width: '35%' }}>
                                                Designation
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {phaseOpsGridData &&
                                            phaseOpsGridData?.length > 0 &&
                                            phaseOpsGridData?.map((row, ind) => (
                                                <TableRow key={ind} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell component="th" scope="row" className="tablePad" sx={{ lineHeight: '0' }}>
                                                        {(user?.role === 'Project Delivery Manager' || user?.role === 'GEO Manager') && row?.levels?.trim() === 'Prepared By' ? 'Created and Checked By' : row?.levels}
                                                    </TableCell>
                                                    <TableCell align="left" sx={{ paddingTop: '0px', paddingBottom: '0px' }}>
                                                        {row &&
                                                            row?.options &&
                                                            row?.options.map((innerItem, innerkey) => (
                                                                <>
                                                                    <div
                                                                        style={{
                                                                            marginTop: row?.options?.length >= 1 ? 10 : 0,
                                                                            marginBottom: row?.options?.length >= 1 ? 10 : 0,
                                                                        }}
                                                                    >
                                                                        <Autocomplete
                                                                            disablePortal
                                                                            value={innerItem?.values || null}
                                                                            id="combo-box-demo"
                                                                            sx={
                                                                                (action === 'Approve' || pathName === 'phase-approval-note-view' || row?.levels?.trim() === 'Prepared By') &&
                                                                                innerItem?.values && {
                                                                                    backgroundColor: '#f3f3f3',
                                                                                    borderRadius: '6px',
                                                                                }
                                                                            }
                                                                            getOptionLabel={(option) => {
                                                                                return option?.userName?.toString() || '';
                                                                            }}
                                                                            disabled={(action === 'Approve' || pathName === 'phase-approval-note-view' || row?.levels?.trim() === 'Prepared By') && innerItem?.values}
                                                                            disableClearable={true}
                                                                            options={(innerItem && _createOptions(innerItem)) || []}
                                                                            onChange={(e, value) => {
                                                                                var obj = [...phaseOpsGridData];
                                                                                var updated_obj = null;
                                                                                if (phaseApprovalNoteData?.id === undefined) {
                                                                                    obj[ind].options[innerkey].values = value;
                                                                                    setPhaseApprovaGridData(obj);
                                                                                } else {
                                                                                    const last_selected_record = obj[ind].options[innerkey].values;
                                                                                    updated_obj = {
                                                                                        ...value,
                                                                                        phase_detail_id: last_selected_record?.phase_detail_id,
                                                                                    };
                                                                                    obj[ind].options[innerkey].values = updated_obj;
                                                                                    setPhaseApprovaGridData(obj);
                                                                                }
                                                                            }}
                                                                            placeholder="User Name"
                                                                            defaultValue={row?.options?.length === 1 && row?.options?.[0]}
                                                                            renderInput={(params) => (
                                                                                <TextField
                                                                                    name="state"
                                                                                    id="state"
                                                                                    error={innerItem?.values === null ? true : false}
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
                                                                </>
                                                            ))}
                                                    </TableCell>
                                                    <TableCell align="left" sx={{ paddingTop: '0px', paddingBottom: '0px' }}>
                                                        {row && row?.options && row?.options.map((innerItem, innerkey) => <>{innerItem && innerItem?.map((item, key) => <div style={{ marginBottom: '10px', marginTop: '10px' }}>{key === 0 && (item?.designation || '')}</div>)}</>)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid item xs={6} md={4} sx={{ position: 'relative' }}>
                            <table style={{ borderCollapse: 'collapse', border: '1px solid rgba(224, 224, 224, 1)', fontSize: '12px', width: '100%', marginBottom: '10px' }}>
                                <tr style={{ background: '#f3f3f3' }}>
                                    <th style={{ ...style, textAlign: 'start', fontWeight: '500' }}>GL Category</th>
                                    <th style={{ ...style, textAlign: 'start', fontWeight: '500' }}>Branch Type</th>
                                    <th style={{ ...style, textAlign: 'start', fontWeight: '500' }}>Branch Total</th>
                                    <th style={{ ...style, textAlign: 'start', fontWeight: '500' }}>GL Category Total</th>
                                </tr>
                                <tr></tr>
                                {data1 &&
                                    Object.keys(data1)?.map((v, i) => {
                                        return data1?.[v]?.map((k, index) => {
                                            return i < Object.keys(data1).length - 1 ? (
                                                <tr style={{ background: 'transperant' }}>
                                                    <td style={style}>{v}</td>
                                                    <td style={style}>{k?.branchType}</td>
                                                    <td style={{ ...style, textAlign: 'center' }}>{k?.branchTotal}</td>
                                                    {index == 0 && (
                                                        <td style={{ ...style, textAlign: 'center' }} rowSpan={data1[v]?.length}>
                                                            {data1[v]?.length}
                                                        </td>
                                                    )}
                                                </tr>
                                            ) : (
                                                <tr style={{ background: '#f3f3f3' }}>
                                                    <th style={style}></th>
                                                    <th style={{ ...style, textAlign: 'start', fontWeight: '500' }}>{k?.branchType}</th>
                                                    <th style={style}></th>
                                                    <th style={{ ...style, fontWeight: '500' }}>{k?.glCategoryTotal}</th>
                                                </tr>
                                            );
                                        });
                                    })}

                                <tr></tr>
                            </table>
                            <table style={{ borderCollapse: 'collapse', border: '1px solid rgba(224, 224, 224, 1)', fontSize: '12px', width: '100%', marginBottom: '10px' }}>
                                <tr style={{ background: '#f3f3f3' }}>
                                    <th style={{ ...style, textAlign: 'start', fontWeight: '500' }}>Business Type</th>
                                    <th style={{ ...style, textAlign: 'start', fontWeight: '500' }}>Branch Type</th>
                                    <th style={{ ...style, textAlign: 'start', fontWeight: '500' }}>Branch Total</th>
                                    <th style={{ ...style, textAlign: 'start', fontWeight: '500' }}>Business Type Total</th>
                                </tr>
                                <tr></tr>
                                {data2 &&
                                    Object.keys(data2)?.map((v, i) => {
                                        return data2?.[v]?.map((k, index) => {
                                            return i < Object.keys(data2).length - 1 ? (
                                                <tr style={{ background: 'transperant' }}>
                                                    <td style={style}>{v}</td>
                                                    <td style={style}>{k?.branchType}</td>
                                                    <td style={{ ...style, textAlign: 'center' }}>{k?.branchTotal}</td>
                                                    {index == 0 && (
                                                        <td style={{ ...style, textAlign: 'center' }} rowSpan={data2[v]?.length}>
                                                            {data2[v]?.length}
                                                        </td>
                                                    )}
                                                </tr>
                                            ) : (
                                                <tr style={{ background: '#f3f3f3' }}>
                                                    <th style={style}></th>
                                                    <th style={{ ...style, textAlign: 'start', fontWeight: '500' }}>{k?.branchType}</th>
                                                    <th style={style}></th>
                                                    <th style={{ ...style, fontWeight: '500' }}>{k?.businessTypeTotal}</th>
                                                </tr>
                                            );
                                        });
                                    })}

                                <tr></tr>
                            </table>
                        </Grid>
                    </Grid>
                </div>
                {mandateId && mandateId?.id !== undefined && <DataTable mandateId={mandateId?.id} pathName={module} />}

        {pathName !== "phase-approval-note-view" && userAction?.module === module && (
          <div style={{ paddingLeft: "10%" }} className="bottom-fix-btn">
            <div className="remark-field">
              {action && action === "View" && (
                <>
                  {userAction?.stdmsg !== undefined && (
                    <span className="message-right-bottom">
                      {userAction?.stdmsg}
                    </span>
                  )}
                </>
              )}
              {action !== "Approve" && userAction?.stdmsg !== "Please Assign Project Manager To Phase"
                &&  (user?.role === "MD" || user?.role === "Project Delivery Manager" || user?.role === "Vertical Head")  && (
                    <Button
                      variant="outlined"
                      size="medium"
                      style={{
                        marginRight: 10,
                        padding: "2px 20px",
                        borderRadius: 6,
                        color: "#00316a",
                        borderColor: "#00316a",
                        justifyContent: "center",
                      }}
                      onClick={() => phaseApprovalNotePdfAPICall(id)}
                    >
                      <img src={pdf} alt="" className="icon-size" /> Download
                    </Button>
                  )}
              {action === "Approve" && (
                <>
                  {(user?.role === "MD" || user?.role === "Project Delivery Manager" || user?.role === "Vertical Head") && (
                    <Button
                      variant="outlined"
                      size="medium"
                      style={{
                        marginRight: 10,
                        padding: "2px 20px",
                        borderRadius: 6,
                        color: "#00316a",
                        borderColor: "#00316a",
                        justifyContent: "left",
                      }}
                      onClick={() => phaseApprovalNotePdfAPICall(id)}
                    >
                      <img src={pdf} alt="" className="icon-size" /> Download
                    </Button>
                  )}
                  <ApproveAndRejectAction
                    approved={approved}
                    sendBack={sendBack}
                    setSendBack={setSendBack}
                    setApproved={setApproved}
                    remark={remark}
                    setRemark={setRemark}
                    approveEvent={() => {
                      workflowFunctionAPICall(
                        runtimeId,
                        phaseApprovalNoteData?.id,
                        mandateId?.id,
                        remark,
                        "Approved",
                        navigate,
                        user,
                        params,
                        dispatch
                      );
                    }}
                    sentBackEvent={() => {
                      workflowFunctionAPICall(
                        runtimeId,
                        phaseApprovalNoteData?.id,
                        mandateId?.id,
                        remark,
                        "Sent Back",
                        navigate,
                        user,
                        params,
                        dispatch
                      );
                    }}
                  />
                  {userAction?.stdmsg !== undefined && (
                    <span className="message-right-bottom">
                      {userAction?.stdmsg}
                    </span>
                  )}
                </>
              )}
            </div>

                        {action && (action === 'Create' || action === 'Created' || action === 'Assign Project Manager') && (
                            <>
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
                                >
                                    SUBMIT
                                </Button>

                                {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                            </>
                        )}
                    </div>
                )}

                <div className="bottom-fix-history-PhaseApprovalNote">{mandateId?.id !== undefined && <MandateStatusHistory mandateCode={mandateId?.id} accept_Reject_Remark={currentRemark} accept_Reject_Status={currentStatus} />}</div>

                {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
            </form>
        </div>
    );
};

export default MainInfo;
