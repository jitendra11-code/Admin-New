import { Button, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField, Grid, TableContainer, Autocomplete } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import * as React from 'react';
import { useFormik } from 'formik';
import blockInvalidChar from './blockInvalidChar ';
import { locationNoteApprovalNoteInitialValues, locationNoteApprovalNoteSchema } from '@uikit/schemas';
import ApproveAndRejectAction from 'pages/common-components/ApproveRejectAction';
import { useLocation, useNavigate } from 'react-router-dom';
import workflowFunctionAPICall from '../../workFlowActionFunction';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/store';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { useUrlSearchParams } from 'use-url-search-params';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import DataTable from '../../../common-components/Table';
import { fetchError, showMessage } from 'redux/actions';
import _generateData, { _createOptions } from 'pages/myTask/Components/Utility/PhaseApprovalNote';
import regExpressionTextField, { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';
import pdf from '../../../../assets/icon/pdfImg.png';
import NumberFormatCustom from './Utility/NumberFormat';
import RemoveThousandSeparator from '@uikit/common/NumberFormatTextField/RemoveThosandSeperator';

const LocationApprovalNote = ({ setActionName, mandateId, setMandateId, mandateInfo, currentRemark, currentStatus, locationApprovalNoteId, locationApprovalNoteScopeData, setLocationApprovalNoteId, locationData }) => {
    const navigate = useNavigate();
    const [sendBack, setSendBack] = React.useState(false);
    const [approved, setApproved] = React.useState(false);
    const [remark, setRemark] = React.useState('');
    const [userAction, setUserAction] = React.useState(null);
    let { id } = useParams();
    const [params] = useUrlSearchParams({}, {});
    const location = useLocation();
    const dispatch = useDispatch();

    const apiType = location?.state?.apiType || '';
    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const { user } = useAuthUser();
    const action = userAction?.action || '';
    const runtimeId = userAction?.runtimeId || 0;
    const [locationApprovalNoteData, setLocationApprovalNoteData] = React.useState<any>([]);

    const [locationApprovalGridData, setLocationApprovalGridData] = React.useState<any>([]);
    const [phaseApprovalNoteDataError, setPhaseApprovalNoteDataError] = React.useState<any>([]);
    const [keyCount, setKeyCount] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [submitFlag, setSubmitFlag] = React.useState(false);

    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined) {
            getLocationApprovalNoteById(mandateId?.id);
            setLocationApprovalNoteData({
                ...locationApprovalNoteData,
                id: mandateId?.id,
            });
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
    }, [mandateId, setMandateId]);
    React.useEffect(() => {
        if (userAction?.action !== undefined) {
            setActionName(userAction?.action);
        }
    }, [userAction?.action]);

    const phaseApprovalNoteDetailsAPICall = (amount, id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/LocationApprovalNoteApprovalDetails?amount=${amount}&Location_approval_note_id=${locationApprovalNoteId || 0}&mandateid=${mandateId?.id}`)
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data && response?.data?.length > 0) {
                    groupbyMultikeys(response?.data || []);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
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

    const locationApprovalNotePdfAPICall = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/GetPDFReportOfApprovalNote?LocationAppNoteId=${locationApprovalNoteId || 0}&mandateid=${id || 0}&noteType=location`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data) {
                    var fileName = 'Location Approval Note';

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
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const getLocationApprovalNoteById = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/LocationApprovalNoteById?id=${id}`)
            .then((response: any) => {
                if (!response) return;
                if (response?.data && response?.data?.length > 0) {
                    setLocationApprovalNoteData(response?.data[0] || []);
                    var id = response && response?.data?.[0]?.id;
                    if (id !== undefined) {
                        setLocationApprovalNoteId(id);
                    }
                } else {
                    setLocationApprovalNoteData(null);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const getBudgetByMandateId = (id) => {
        var newdata = { ...locationApprovalNoteData };
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/GetBudget?mandateid=${id}`)
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data !== undefined) {
                    newdata.approved_amount = response?.data;
                    // setLocationApprovalNoteData({
                    //   ...locationApprovalNoteData,
                    //   ["approved_amount"]: response?.data,
                    // });
                    setFieldValue('approved_amount', response?.data);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
        setLocationApprovalNoteData(newdata);
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
                if (locationApprovalNoteData?.id === undefined) {
                    value = d;
                } else {
                    var _item = getObjForPreparedBy(data, d);
                    value = _item;
                }
                if (!found) {
                    acc.push({ ...value, options: [value] }); // not found, so need to add data property
                } else {
                    found.options.push(value);
                }
                return acc;
            }, []);

        var _data = _generateData(res, locationApprovalNoteData, user);
        setLocationApprovalGridData(_data || []);
    };

    React.useEffect(() => {
        if (id !== 'noid' && id) {
            getLocationApprovalNoteById(id);
        }
    }, []);

    const handlePhaseApprovalNoteDataChange = (e: any) => {
        const { name, value } = e.target;
        if (name === 'activity_time_line') {
            setFieldValue('activity_time_line', value);
        }
        setLocationApprovalNoteData({ ...locationApprovalNoteData, [name]: value });
        setPhaseApprovalNoteDataError({
            ...phaseApprovalNoteDataError,
            [name]: '',
        });
    };
    const handleToggle = (e: any) => {
        const val = e.target.value === 'true' ? true : false;
        setFieldValue('non_budget_amount_switch', val);
        setLocationApprovalNoteData({
            ...locationApprovalNoteData,
            ['non_budgeted']: val,
        });
        setPhaseApprovalNoteDataError({
            ...phaseApprovalNoteDataError,
            ['non_budgeted']: '',
        });
    };
    const handleDateChange = (newValue: Dayjs | null) => {
        setLocationApprovalNoteData({
            ...locationApprovalNoteData,
            notedate: newValue?.toDate() || new Date(),
        });
    };
    const _validationPhaseApprovalNote = () => {
        if (locationApprovalNoteData?.id !== undefined) {
            if (locationApprovalNoteData?.location === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['location']: 'Please enter location',
                });
            }
            if (locationApprovalNoteData?.branchname === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['branchname']: 'Please enter branch name and address',
                });
            }
            if (locationApprovalNoteData?.purpose === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['purpose']: 'Please enter purpose',
                });
            }
            if (locationApprovalNoteData?.activity_time_line === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['activity_time_line']: 'Please enter activity time line',
                });
            }
            if (locationApprovalNoteData?.subject === '') {
                setPhaseApprovalNoteDataError({
                    ...phaseApprovalNoteDataError,
                    ['subject']: 'Please enter subject',
                });
            }
        }
    };

    const _saveLocationApprovalNoteScopeData = (id: number, locationApprovalNoteScopeData) => {
        const body =
            locationApprovalNoteScopeData &&
            locationApprovalNoteScopeData?.map((item, key) => {
                return {
                    ...item,
                    id: locationApprovalNoteId === undefined || locationApprovalNoteId === null ? 0 : item?.id,
                    createdBy: user?.UserName || '',
                    modifiedBy: user?.UserName || '',
                    createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    include: item?.include || 0,
                    location_approval_note_id: id || 0,
                };
            });
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/CreateLocationApprovalNoteScope`, body)
            .then((res: any) => {})
            .catch((err) => {});
    };

    const {
        values,

        handleBlur,
        handleChange,
        setFieldValue,
        handleSubmit,
        resetForm,
        errors,
        touched,
    } = useFormik({
        initialValues: locationNoteApprovalNoteInitialValues,
        validationSchema: locationNoteApprovalNoteSchema,
        validateOnChange: true,
        validateOnBlur: false,
        onSubmit: (values, action) => {
            if (locationData[0]?.Chargeable_Area > locationData[0]?.Carpet_Area) {
                dispatch(fetchError('Please check as chargeable area should not be more than carpet area'));
                return;
            }
            console.log('SSS outer', locationApprovalGridData);
            let flag = false;
            if (locationApprovalGridData && locationApprovalGridData?.length > 0) {
                locationApprovalGridData?.map((row, ind) => {
                    row &&
                        row?.options &&
                        row?.options.map((innerItem, innerkey) => {
                            var obj = [...locationApprovalGridData];
                            console.log('SSS', obj[ind].options[innerkey].values);
                            if (obj[ind].options[innerkey].values == null) {
                                dispatch(fetchError('Please select the mandatory fileds!!'));
                                flag = true;
                                return;
                            }
                        });
                });
            }
            if (flag) return;
            console.log('ZZZ', flag);
            // if (true) return;
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
                total_budget_amount: RemoveThousandSeparator(values?.total_budget_amount, 'int') || 0,
                cosumed_budget_amount: RemoveThousandSeparator(values?.cosumed_budget_amount, 'int') || 0,
                balance_budget_amount: RemoveThousandSeparator(values?.balance_budget_amount, 'int') || 0,
                activity_summary: values?.activity_summary || '',
                cost_justification: values?.cost_justification || '',
                cpu_remarks: values?.cpu_remarks || '',
                doa_remarks: '',
                approval_remarks: '',
                pdm_remarks: '',
                pm_remarks: '',
                createdby: user?.UserName,
                modifiedby: user?.UserName,
                notedate: (locationApprovalNoteData?.notedate && moment(locationApprovalNoteData?.notedate).format('YYYY-MM-DDTHH:mm:ss.SSS')) || moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                approved_by: '',
            };

            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/CreateLocationApprovalNote`, body)
                .then((response: any) => {
                    if (!response) return;
                    if (!response.status) {
                        dispatch(fetchError('Error Occurred !'));
                        return;
                    }

                    if (response && response?.data && response?.data?.data?.id) {
                        saveLocationApprovalNoteGridData(response?.data?.data?.id);
                        let id = response?.data?.data?.id;
                        if (id && id !== undefined) {
                            _saveLocationApprovalNoteScopeData(id, locationApprovalNoteScopeData);
                        }
                    }
                    dispatch(showMessage('Location approval note created successfully!'));
                    workFlow();
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                    resetForm();
                });
        },
    });
    const workFlow = () => {
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: runtimeId || 0,
            mandateId: id || locationApprovalNoteData?.id || 0,
            tableId: id || locationApprovalNoteData?.id || 0,
            remark: 'Submitted' || '',
            createdBy: user?.UserName || 'Admin',
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: 'Created' || '',
        };
        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) return;
                if (response) {
                    resetForm();
                    if (params?.source === 'list') {
                        navigate('/list/task');
                    } else {
                        navigate('/mandate');
                    }
                }
            })

            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    React.useEffect(() => {
        if (values?.approved_amount) {
            phaseApprovalNoteDetailsAPICall(values?.approved_amount, locationApprovalNoteData?.id);
        }
    }, [values?.approved_amount, locationApprovalNoteData?.id, setLocationApprovalNoteData]);

    const saveLocationApprovalNoteGridData = (id) => {
        var data = [...locationApprovalGridData];

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
                                location_approval_note_id: locationApprovalNoteData?.id || id || 0,
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
            url: `${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/CreateLocationApprovalNoteApprovalDetails`,
            data: _finalArr,
        })
            .then((response: any) => {
                if (!response) return;
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const getPhaseApprovalNoteCode = () => {
        var newdata = { ...locationApprovalNoteData };
        if (mandateId?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/GetNextLocationApprovalCode?MandetId=${mandateId?.id}`)
                .then((response: any) => {
                    if (!response) return;
                    if (response?.data) {
                        newdata.approval_note_no = response?.data;
                        // setLocationApprovalNoteData({
                        //   ...locationApprovalNoteData,
                        //   approval_note_no: response?.data,
                        // });
                        setFieldValue('approval_note_no', response?.data);
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
            setLocationApprovalNoteData(newdata);
        }
    };

    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid') {
            getBudgetByMandateId(mandateId?.id);
            getPhaseApprovalNoteCode();
        }
    }, [mandateId]);

    React.useEffect(() => {
        var newdata = { ...locationApprovalNoteData };
        if (mandateInfo && mandateInfo !== null) {
            setFieldValue('sub_department', mandateInfo?.verticalName);
            setFieldValue('location', mandateInfo?.no_of_branches);
            setFieldValue('subject', `Location Wise Approval Note ${mandateInfo?.phaseName || ''}`);
            setFieldValue('purpose', `Property commercial & Furnishing cost approval note ${mandateInfo?.location || ''}`);
            setFieldValue('branchname', '');
            newdata.purpose = `Property commercial & Furnishing cost approval note ${mandateInfo?.location || ''}`;
            newdata.subject = `Location Wise Approval Note ${mandateInfo?.phaseName || ''}`;
            newdata.location = mandateInfo?.no_of_branches;
            newdata.sub_department = mandateInfo?.verticalName;
            // setLocationApprovalNoteData({
            //   ...locationApprovalNoteData,
            //   purpose: `Property commercial & Furnishing cost approval note ${mandateInfo?.location || ""
            //     }`,
            //   subject: `Location Wise Approval Note ${mandateInfo?.phaseName || ""}`,
            //   location: mandateInfo?.no_of_branches,
            //   sub_department: mandateInfo?.verticalName,
            // });
        }
        setLocationApprovalNoteData(newdata);
    }, [mandateInfo]);

    const handleUpdateSubmit = (e: any) => {
        e.preventDefault();
        _validationPhaseApprovalNote();
        if (phaseApprovalNoteDataError && phaseApprovalNoteDataError?.length > 0) return;
        locationApprovalNoteData['location'] = locationApprovalNoteData['location']?.toString();
        locationApprovalNoteData['total_budget_amount'] = RemoveThousandSeparator(locationApprovalNoteData?.total_budget_amount, 'int');
        locationApprovalNoteData['approved_amount'] = RemoveThousandSeparator(locationApprovalNoteData?.approved_amount, 'int');
        locationApprovalNoteData['cosumed_budget_amount'] = RemoveThousandSeparator(locationApprovalNoteData?.cosumed_budget_amount, 'int');
        locationApprovalNoteData['balance_budget_amount'] = RemoveThousandSeparator(locationApprovalNoteData?.balance_budget_amount, 'int');
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/UpdateLocationApprovalNote?id=${locationApprovalNoteData?.id}`, locationApprovalNoteData)
            .then((response: any) => {
                dispatch(showMessage('Location approval note updated successfully!'));
                if (!response) return;

                saveLocationApprovalNoteGridData(locationApprovalNoteData?.id);
                let idx = locationApprovalNoteData?.id;
                if (idx && idx !== undefined) {
                    _saveLocationApprovalNoteScopeData(idx, locationApprovalNoteScopeData);
                }
                const token = localStorage.getItem('token');
                const body = {
                    runtimeId: runtimeId || 0,
                    mandateId: id || locationApprovalNoteData?.id || 0,
                    tableId: locationApprovalNoteData?.id || 0,
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
                        dispatch(fetchError('Error Occurred !'));
                    });
                if (params?.source === 'list') {
                    navigate('/list/task');
                } else {
                    navigate('/mandate');
                }
            })
            .catch((e: any) => {});
    };

    // React.useEffect(()=>{
    //   locationApprovalGridData &&
    //   locationApprovalGridData?.length > 0 &&
    //   locationApprovalGridData?.map((row, ind)=>{
    //     row && row?.options && row?.options.map((innerItem, innerkey) => {
    //       var obj = [...locationApprovalGridData];
    //       if(obj[ind].options[innerkey].values !== null){
    //         setSubmitFlag(true);
    //       } else {
    //         setSubmitFlag(false);
    //       }
    //     })
    //   })
    // },[locationApprovalGridData,setLocationApprovalGridData]);
    return (
        <>
            <div>
                <div style={{ padding: '10px !important' }} className="card-panal inside-scroll-360">
                    <form
                        onSubmit={
                            // submitFlag ?
                            locationApprovalNoteData?.id === undefined ? handleSubmit : handleUpdateSubmit
                            // : null
                        }
                    >
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
                                            value={values?.approval_note_no || locationApprovalNoteData?.approval_note_no}
                                            onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
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
                                                value={locationApprovalNoteData?.notedate}
                                                maxDate={dayjs()}
                                                onChange={handleDateChange}
                                                disabled
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
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
                                            value={values?.sub_department || locationApprovalNoteData?.sub_department || ''}
                                            onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
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
                                        <h2 className="phaseLable required">Location Name</h2>
                                        <TextField
                                            name="location"
                                            autoComplete="off"
                                            disabled
                                            id="location"
                                            variant="outlined"
                                            size="small"
                                            className="w-85"
                                            value={values?.location || locationApprovalNoteData?.location}
                                            onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                            onBlur={handleBlur}
                                            onKeyDown={(e: any) => {
                                                if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                    e.preventDefault();
                                                }
                                                regExpressionTextField(e);
                                            }}
                                        />
                                        {!locationApprovalNoteData && touched.location && errors.location ? <p className="form-error">{errors.location}</p> : null}

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
                                            value={values?.subject || locationApprovalNoteData?.subject}
                                            onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
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
                                            className="w-85"
                                            value={values?.branchname || locationApprovalNoteData?.branchname}
                                            onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                            onBlur={handleBlur}
                                            InputProps={{ inputProps: { min: 0, maxLength: 50 } }}
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
                                            disabled={action === 'Approve'}
                                        />
                                        {touched.branchname && errors.branchname ? <p className="form-error">{errors.branchname}</p> : null}
                                        {phaseApprovalNoteDataError?.branchname && phaseApprovalNoteDataError?.branchname ? <p className="form-error">{phaseApprovalNoteDataError?.branchname}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={4.3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Purpose</h2>
                                        <TextField
                                            name="purpose"
                                            id="purpose"
                                            variant="outlined"
                                            autoComplete="off"
                                            size="small"
                                            className="w-85"
                                            value={values?.purpose || locationApprovalNoteData?.purpose}
                                            onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                            onBlur={handleBlur}
                                            disabled
                                        />
                                        {touched.purpose && errors.purpose ? <p className="form-error">{errors.purpose}</p> : null}
                                        {phaseApprovalNoteDataError?.purpose && phaseApprovalNoteDataError?.purpose ? <p className="form-error">{phaseApprovalNoteDataError?.purpose}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={2.7} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Activity Time Line</h2>
                                        <TextField
                                            name="activity_time_line"
                                            id="activity_time_line"
                                            autoComplete="off"
                                            variant="outlined"
                                            size="small"
                                            className="w-85"
                                            value={values?.activity_time_line || locationApprovalNoteData?.activity_time_line}
                                            onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                            onBlur={handleBlur}
                                            InputProps={{ inputProps: { min: 0, maxLength: 50 } }}
                                            onPaste={(e: any) => {
                                                if (!textFieldValidationOnPaste(e)) {
                                                    dispatch(fetchError('You can not paste Spacial characters'));
                                                }
                                            }}
                                            disabled={action === 'Approve'}
                                            onKeyDown={(e: any) => {
                                                if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                    e.preventDefault();
                                                }
                                                regExpressionTextField(e);
                                            }}
                                        />
                                        {touched.activity_time_line && errors.activity_time_line ? <p className="form-error">{errors.activity_time_line}</p> : null}
                                        {phaseApprovalNoteDataError.activity_time_line && phaseApprovalNoteDataError?.activity_time_line ? <p className="form-error">{phaseApprovalNoteDataError?.activity_time_line || ''}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form "></div>
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
                                                        <TableCell>
                                                            <h2 className="phaseLable required"> Location Wise Budget</h2>
                                                        </TableCell>
                                                        <TableCell>
                                                            <NumberFormatCustom
                                                                locationApprovalNoteData={locationApprovalNoteData}
                                                                setLocationApprovalNoteData={setLocationApprovalNoteData}
                                                                setFieldValue={setFieldValue}
                                                                name="approved_amount"
                                                                type={'text'}
                                                                disabled
                                                                id="approved_amount"
                                                                variant="outlined"
                                                                InputProps={{
                                                                    inputProps: { min: 1, maxLength: 14 },
                                                                }}
                                                                onKeyDown={(e: any) => {
                                                                    blockInvalidChar(e);
                                                                    if (e?.key === 'Backspace' && keyCount > 0) {
                                                                        setKeyCount(keyCount - 1);

                                                                        if (keyCount === 1) setCount(0);
                                                                    }
                                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                size="small"
                                                                className="w-85"
                                                                inputValue={values?.approved_amount || locationApprovalNoteData?.approved_amount}
                                                                onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                                                onBlur={handleBlur}
                                                            />
                                                            {locationApprovalNoteData?.id === undefined && touched?.approved_amount && errors?.approved_amount ? <p className="form-error">{errors?.approved_amount}</p> : null}
                                                        </TableCell>
                                                        <TableCell className="required">Total Approved Amount </TableCell>
                                                        <TableCell>
                                                            <NumberFormatCustom
                                                                locationApprovalNoteData={locationApprovalNoteData}
                                                                setLocationApprovalNoteData={setLocationApprovalNoteData}
                                                                setFieldValue={setFieldValue}
                                                                name="total_budget_amount"
                                                                id="total_budget_amount"
                                                                sx={
                                                                    action === 'Approve' && {
                                                                        backgroundColor: '#f3f3f3',
                                                                        borderRadius: '6px',
                                                                    }
                                                                }
                                                                disabled={action === 'Approve'}
                                                                type="text"
                                                                InputProps={{
                                                                    inputProps: { min: 0, maxLength: 14 },
                                                                }}
                                                                onKeyDown={(e: any) => {
                                                                    blockInvalidChar(e);
                                                                    if (e?.key === 'Backspace' && keyCount > 0) {
                                                                        setKeyCount(keyCount - 1);

                                                                        if (keyCount === 1) setCount(0);
                                                                    }
                                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                variant="outlined"
                                                                size="small"
                                                                className="w-85"
                                                                inputValue={values?.total_budget_amount || locationApprovalNoteData?.total_budget_amount}
                                                                onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                                                onBlur={handleBlur}
                                                            />
                                                            {locationApprovalNoteData?.id === undefined && touched?.total_budget_amount && errors?.total_budget_amount ? <p className="form-error">{errors?.total_budget_amount}</p> : null}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="required">Estimated Expense</TableCell>
                                                        <TableCell>
                                                            <NumberFormatCustom
                                                                locationApprovalNoteData={locationApprovalNoteData}
                                                                setLocationApprovalNoteData={setLocationApprovalNoteData}
                                                                setFieldValue={setFieldValue}
                                                                name="cosumed_budget_amount"
                                                                type={'text'}
                                                                id="cosumed_budget_amount"
                                                                variant="outlined"
                                                                size="small"
                                                                className="w-85"
                                                                InputProps={{
                                                                    inputProps: { min: 1, maxLength: 14 },
                                                                }}
                                                                inputValue={values?.cosumed_budget_amount || locationApprovalNoteData?.cosumed_budget_amount}
                                                                onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                                                onBlur={handleBlur}
                                                                disabled={action === 'Approve'}
                                                                onKeyDown={(e: any) => {
                                                                    blockInvalidChar(e);
                                                                    if (e?.key === 'Backspace' && keyCount > 0) {
                                                                        setKeyCount(keyCount - 1);

                                                                        if (keyCount === 1) setCount(0);
                                                                    }
                                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                            {locationApprovalNoteData?.id === undefined && touched?.cosumed_budget_amount && errors?.cosumed_budget_amount ? <p className="form-error">{errors?.cosumed_budget_amount}</p> : null}
                                                        </TableCell>
                                                        <TableCell className="required">Consumed Estimated Expense</TableCell>
                                                        <TableCell>
                                                            <NumberFormatCustom
                                                                locationApprovalNoteData={locationApprovalNoteData}
                                                                setLocationApprovalNoteData={setLocationApprovalNoteData}
                                                                setFieldValue={setFieldValue}
                                                                name="balance_budget_amount"
                                                                type={'text'}
                                                                id="balance_budget_amount"
                                                                variant="outlined"
                                                                size="small"
                                                                className="w-85"
                                                                InputProps={{
                                                                    inputProps: { min: 1, maxLength: 14 },
                                                                }}
                                                                inputValue={values?.balance_budget_amount || locationApprovalNoteData?.balance_budget_amount}
                                                                onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                                                onBlur={handleBlur}
                                                                disabled={action === 'Approve'}
                                                                onKeyDown={(e: any) => {
                                                                    blockInvalidChar(e);
                                                                    if (e?.key === 'Backspace' && keyCount > 0) {
                                                                        setKeyCount(keyCount - 1);

                                                                        if (keyCount === 1) setCount(0);
                                                                    }
                                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                            {locationApprovalNoteData?.id === undefined && touched?.balance_budget_amount && errors?.balance_budget_amount ? <p className="form-error">{errors?.balance_budget_amount}</p> : null}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                                        <Grid marginBottom="0px" container item spacing={3} justifyContent="start" alignSelf="center">
                                            <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                                                <div className="input-form">
                                                    <h2 className="phaseLable required">Activity Summary</h2>
                                                    <TextField
                                                        name="activity_summary"
                                                        id="activity_summary"
                                                        variant="outlined"
                                                        className="w-85"
                                                        multiline
                                                        value={values?.activity_summary || locationApprovalNoteData?.activity_summary}
                                                        sx={
                                                            action === 'Approve' && {
                                                                backgroundColor: '#f3f3f3',
                                                                borderRadius: '6px',
                                                            }
                                                        }
                                                        onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                                        onBlur={handleBlur}
                                                        InputProps={{
                                                            inputProps: { min: 0, maxLength: 100 },
                                                        }}
                                                        onPaste={(e: any) => {
                                                            if (!textFieldValidationOnPaste(e)) {
                                                                dispatch(fetchError('You can not paste Spacial characters'));
                                                            }
                                                        }}
                                                        disabled={action === 'Approve'}
                                                        onKeyDown={(e: any) => {
                                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                e.preventDefault();
                                                            }
                                                            regExpressionTextField(e);
                                                        }}
                                                    />
                                                    {touched?.activity_summary && errors?.activity_summary ? <p className="form-error">{errors?.activity_summary}</p> : null}
                                                </div>
                                            </Grid>
                                            <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                                                <div className="input-form">
                                                    <h2 className="phaseLable required">Cost Justification</h2>
                                                    <TextField
                                                        name="cost_justification"
                                                        id="cost_justification"
                                                        variant="outlined"
                                                        className="w-85"
                                                        multiline
                                                        value={values?.cost_justification || locationApprovalNoteData?.cost_justification}
                                                        onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                                        sx={
                                                            action === 'Approve' && {
                                                                backgroundColor: '#f3f3f3',
                                                                borderRadius: '6px',
                                                            }
                                                        }
                                                        onBlur={handleBlur}
                                                        InputProps={{
                                                            inputProps: { min: 0, maxLength: 50 },
                                                        }}
                                                        onPaste={(e: any) => {
                                                            if (!textFieldValidationOnPaste(e)) {
                                                                dispatch(fetchError('You can not paste Spacial characters'));
                                                            }
                                                        }}
                                                        disabled={action === 'Approve'}
                                                        onKeyDown={(e: any) => {
                                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                e.preventDefault();
                                                            }
                                                            regExpressionTextField(e);
                                                        }}
                                                    />
                                                    {touched?.cost_justification && errors?.cost_justification ? <p className="form-error">{errors?.cost_justification}</p> : null}
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} md={12} sx={{ position: 'relative' }}>
                                                <div className="input-form">
                                                    <h2 className="phaseLable required">Remarks</h2>
                                                    <TextField
                                                        name="cpu_remarks"
                                                        id="cpu_remarks"
                                                        variant="outlined"
                                                        className="w-85"
                                                        multiline
                                                        value={values?.cpu_remarks || locationApprovalNoteData?.cpu_remarks}
                                                        onChange={locationApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                                                        sx={
                                                            action === 'Approve' && {
                                                                backgroundColor: '#f3f3f3',
                                                                borderRadius: '6px',
                                                            }
                                                        }
                                                        onBlur={handleBlur}
                                                        InputProps={{
                                                            inputProps: { min: 0, maxLength: 100 },
                                                        }}
                                                        onPaste={(e: any) => {
                                                            if (!textFieldValidationOnPaste(e)) {
                                                                dispatch(fetchError('You can not paste Spacial characters'));
                                                            }
                                                        }}
                                                        disabled={action === 'Approve'}
                                                        onKeyDown={(e: any) => {
                                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                e.preventDefault();
                                                            }
                                                            regExpressionRemark(e);
                                                        }}
                                                    />
                                                    {touched?.cpu_remarks && errors?.cpu_remarks ? <p className="form-error">{errors?.cpu_remarks}</p> : null}
                                                </div>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </div>
                        <div>
                            <TableContainer style={{ marginBottom: 20, marginTop: 10 }}>
                                <Table className="dense-table" sx={{ minWidth: '100%' }} size="small" aria-label="a dense table">
                                    <TableHead style={{ background: '#f4f7fe' }}>
                                        <TableRow>
                                            <TableCell>Authority Levels</TableCell>
                                            <TableCell align="left">Name</TableCell>
                                            <TableCell align="left">Designation</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {locationApprovalGridData &&
                                            locationApprovalGridData?.length > 0 &&
                                            locationApprovalGridData?.map((row, ind) => (
                                                <TableRow
                                                    key={ind}
                                                    sx={{
                                                        '&:last-child td, &:last-child th': { border: 0 },
                                                    }}
                                                >
                                                    <TableCell component="th" scope="row">
                                                        {row?.levels}
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        {row &&
                                                            row?.options &&
                                                            row?.options.map((innerItem, innerkey) => (
                                                                <>
                                                                    <div
                                                                        style={{
                                                                            marginTop: row?.options?.length > 1 ? 10 : 0,
                                                                            marginBottom: row?.options?.length > 1 ? 10 : 0,
                                                                        }}
                                                                    >
                                                                        <Autocomplete
                                                                            disablePortal
                                                                            value={innerItem?.values || null}
                                                                            id="combo-box-demo"
                                                                            sx={
                                                                                (action === 'Approve' || row?.levels?.trim() === 'Prepared By') &&
                                                                                innerItem?.values && {
                                                                                    backgroundColor: '#f3f3f3',
                                                                                    borderRadius: '6px',
                                                                                }
                                                                            }
                                                                            getOptionLabel={(option) => {
                                                                                return option?.userName?.toString() || '';
                                                                            }}
                                                                            disabled={(action === 'Approve' || row?.levels?.trim() === 'Prepared By') && innerItem?.values}
                                                                            disableClearable={true}
                                                                            options={(innerItem && _createOptions(innerItem)) || []}
                                                                            onChange={(e, value) => {
                                                                                var obj = [...locationApprovalGridData];
                                                                                var updated_obj = null;
                                                                                if (locationApprovalNoteData?.id === undefined) {
                                                                                    obj[ind].options[innerkey].values = value;
                                                                                    setLocationApprovalGridData(obj);
                                                                                } else {
                                                                                    const last_selected_record = obj[ind].options[innerkey].values;
                                                                                    updated_obj = {
                                                                                        ...value,
                                                                                        phase_detail_id: last_selected_record?.phase_detail_id,
                                                                                    };
                                                                                    obj[ind].options[innerkey].values = updated_obj;
                                                                                    setLocationApprovalGridData(obj);
                                                                                }
                                                                            }}
                                                                            placeholder="User Name"
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
                                                    <TableCell align="left">
                                                        {row &&
                                                            row?.options &&
                                                            row?.options.map((innerItem, innerkey) => (
                                                                <>
                                                                    {innerItem &&
                                                                        innerItem?.map((item, key) => (
                                                                            <div
                                                                                style={{
                                                                                    marginBottom: 0,
                                                                                    marginTop: 0,
                                                                                }}
                                                                            >
                                                                                {key === 0 && (item?.designation || '')}
                                                                            </div>
                                                                        ))}
                                                                </>
                                                            ))}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                        {mandateId && mandateId?.id !== undefined && <DataTable mandateId={mandateId?.id} pathName={module} />}
                        <div style={{ paddingLeft: '10%' }} className="bottom-fix-btn">
                            <div className="remark-field">
                                {action === '' && runtimeId === 0 && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            size="medium"
                                            style={{
                                                padding: '2px 20px',
                                                borderRadius: 6,
                                                color: '#00316a',
                                                borderColor: '#00316a',
                                                justifyContent: 'left',
                                            }}
                                            onClick={() => locationApprovalNotePdfAPICall(id)}
                                        >
                                            <img src={pdf} alt="" className="icon-size" /> Download
                                        </Button>
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
                        </div>

                        {userAction?.module === module && (
                            <>
                                <div style={{ paddingLeft: '10%' }} className="bottom-fix-btn">
                                    <div className="remark-field">
                                        {action && (action === 'Create' || action === 'Created') && (
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

                                        {action && action === 'View' && <>{userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}</>}
                                        {action && action === 'Approve' && (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    size="medium"
                                                    style={{
                                                        padding: '2px 20px',
                                                        borderRadius: 6,
                                                        color: '#00316a',
                                                        borderColor: '#00316a',
                                                        justifyContent: 'left',
                                                    }}
                                                    onClick={() => locationApprovalNotePdfAPICall(id)}
                                                    className="mar-right-11"
                                                >
                                                    <img src={pdf} alt="" className="icon-size" /> Download
                                                </Button>
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
                                                {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="bottom-fix-history" style={{ marginBottom: '5px' }}>
                            {mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid' && <MandateStatusHistory mandateCode={mandateId?.id} accept_Reject_Remark={currentRemark} accept_Reject_Status={currentStatus} />}
                        </div>
                        {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                    </form>
                </div>
            </div>
        </>
    );
};
export default LocationApprovalNote;
