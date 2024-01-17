import { Label } from '@mui/icons-material';
import { Box, Button, Stack, TextField, Grid, Autocomplete } from '@mui/material';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/store';
import workflowFunctionAPICall from '../myTask/Components/workFlowActionFunction';
import ApproveAndRejectAction from 'pages/common-components/ApproveRejectAction';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { useUrlSearchParams } from 'use-url-search-params';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import MandateInfo from 'pages/common-components/MandateInformation';
import VendorTable from './VendorTable';
import { fetchError, showMessage } from 'redux/actions';
import ToggleSwitch from '@uikit/common/ToggleSwitch';
import regExpressionTextField, { regExpressionRemark, textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';

const VendorAllocation = () => {
    const navigate = useNavigate();
    const [params] = useUrlSearchParams({}, {});
    const { user } = useAuthUser();
    const dispatch = useDispatch();

    const [data, setData] = React.useState<any>([]);
    const [editIndex, setEditIndex] = React.useState<any>(null);
    const [formData, setFormData] = React.useState<any>({});
    const [tableData, setTableData] = React.useState<any>([]);
    const { id } = useParams();

    const location = useLocation();
    const apiType = location?.state?.apiType || '';
    const [mandateList, setMandateList] = React.useState([]);
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    //   const [remark, setRemark] = React.useState("");
    const [userAction, setUserAction] = React.useState(null);
    const [mandateId, setMandateId] = React.useState(null);
    const [empaneled, setEmpaneled] = React.useState(true);
    const [vendorCategoryOption, setVendorCategoryOption] = React.useState([]);
    const [vendorNameOption, setVendorNameOption] = React.useState([]);
    const [vendorNameIds, setVendorNameIds] = useState({});
    const [updateVendorNameIds, setUpdateVendorNameIds] = useState({});
    const [mandateData, setMandateData] = useState({});
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const [error, setError] = useState(null);
    const [update, setUpdate] = useState(false);
    const [editButton, setEditButton] = useState(false);

    const [sendBack, setSendBack] = React.useState(false);
    const [selectedMandate, setSelectedMandate] = useState(null);
    const [approved, setApproved] = React.useState(false);
    const [errorVendor, setErrorVendor] = useState<any>({});
    const [count, setCount] = useState(0);
    const [remark, setRemark] = useState('');
    const action = userAction?.action || '';
    const runtimeId = userAction?.runtimeId || 0;
    const [contactError, setContactError] = useState(null);
    const [altContactError, setAltContactError] = useState(null);

    //   const navigate = useNavigate();
    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];

    React.useEffect(() => {
        setEmpaneled(true);
        if (mandateId && mandateId?.id !== undefined) {
            const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(mandateId?.id) && item?.module === module);
            if (apiType === '') {
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
    }, [mandateId, setMandateId]);
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
                    navigate('/list/task');
                }
            })
            .catch((e: any) => {});
    };
    const handleUpdateApprove = (e) => {
        e.preventDefault();
        const data = [...tableData];
        const modified = data?.map((item) => {
            if (updateVendorNameIds[item.fk_VendorPartnerMaster_id] !== undefined) {
                item['fk_VendorPartnerMaster_id'] = updateVendorNameIds[item.fk_VendorPartnerMaster_id];
            } else {
                item['fk_VendorPartnerMaster_id'] = vendorNameIds[item.fk_VendorPartnerMaster_id];
            }

            return item;
        });
        const Againmodified = data?.map((item) => {
            delete item['partnerName'];
            delete item['mandetCode'];
            return item;
        });
        if (modified?.length !== undefined && modified?.length !== 0) {
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/VendorAllocation/CreateVendorAllocationDetails`, Againmodified)
                .then((response) => {
                    setEditIndex(null);

                    if (!response) return;
                    if (response && response?.status === 200) {
                        setUpdate(false);
                        dispatch(showMessage('Record is added successfully!'));
                        workFlowMandate();
                    }
                })
                .catch((err) => {});
        }
    };

    const handleApprove = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const data = [...tableData];
        const modified = data?.map((item) => {
            item['id'] = 0;
            if (item.empaneled === true) {
                item['fk_VendorPartnerMaster_id'] = vendorNameIds[item.fk_VendorPartnerMaster_id];
            }
            delete item['partnerName'];
            delete item['mandetCode'];
            return item;
        });
        if (tableData?.length !== undefined && tableData?.length !== 0) {
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/VendorAllocation/CreateVendorAllocationDetails`, modified)
                .then((response) => {
                    if (!response) return;
                    if (response && response?.status === 200) {
                        setUpdate(false);
                        dispatch(showMessage('Record is added successfully!'));
                        workFlowMandate();
                    }
                })
                .catch((err) => {});
        }
    };
    function isValidEmail(email) {
        //return /\S+@\S+\.\S+/.test(email);
        return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
    }
    function isValidContactNo(contactno) {
        let regExp = new RegExp('^[9,8,7,6][0-9]*$');
        let regExp2 = new RegExp('\\d{10}');
        return regExp.test(contactno);
    }
    function isValidAltContactNo(altcontactno) {
        let regExp = new RegExp('^[9,8,7,6][0-9]*$');
        return regExp.test(altcontactno);
    }

    const _validation = () => {
        let temp = {};
        let no = 0;
        if (formData.vendorcategory === undefined || formData.vendorcategory == '' || formData.vendorcategory == null) {
            no++;
            temp = { vendorcategory: 'Please select Vendor Category' };
        }
        if (empaneled && (formData.fk_VendorPartnerMaster_id == '' || formData.fk_VendorPartnerMaster_id == null)) {
            no++;
            temp = {
                ...temp,
                fk_VendorPartnerMaster_id: 'Please select Vendor Name Code',
            };
        }
        if (!empaneled && (formData.vendorname == '' || formData.vendorname == null)) {
            no++;
            temp = {
                ...temp,
                fk_VendorPartnerMaster_id: 'Please select Vendor Name Code',
            };
        }
        setCount(no);
        setErrorVendor({ ...errorVendor, ...temp });
        return { ...errorVendor, ...temp };
    };
    const handleVendorNameChange = (e: any) => {
        const { name, value } = e.target;
        formData['fk_VendorPartnerMaster_id'] = 'temp';
        setFormData({ ...formData, [name]: value });
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleChangeEmail = (e: any) => {
        if (!isValidEmail(e.target.value) && e.target.value.trim() !== '') {
            setError('Please enter valid Email Id');
        } else {
            setError(null);
        }
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleChangeContactno = (e: any) => {
        if (!isValidContactNo(e.target.value) && e.target.value.trim() !== '') {
            setContactError('Contact Number must be start with 9,8,7 or 6');
        } else if (e.target.value?.length < 10 && e.target.value.trim() !== '') {
            setContactError('Contact Number must be 10 digit');
        } else {
            setContactError(null);
        }
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleChangeAltContactno = (e: any) => {
        if (!isValidAltContactNo(e.target.value) && e.target.value.trim() !== '') {
            setAltContactError('Contact Number must be start with 9,8,7 or 6');
        } else if (e.target.value?.length < 10 && e.target.value.trim() !== '') {
            setAltContactError('Contact Number must be 10 digit');
        } else {
            setAltContactError(null);
        }
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        if (mandateId?.id === undefined || mandateId?.id === null) {
            dispatch(fetchError('Please select Mandate Id'));
        } else {
            const errorFound = _validation();
            if (Object.keys(errorFound).length) return;

            const vendorNameCode = empaneled ? formData.fk_VendorPartnerMaster_id : formData?.vendorname;

            if (formData.vendorcategory !== undefined && vendorNameCode !== undefined && vendorNameCode !== '' && contactError === null && altContactError === null) {
                if (!empaneled) {
                    formData['fk_VendorPartnerMaster_id'] = 0;
                }
                if (mandateId?.id !== undefined) {
                    formData['fk_mandate_id'] = mandateId?.id;
                }
                if (formData['houseKeeping_vendorname'] === undefined) {
                    formData['houseKeeping_vendorname'] = '';
                }
                if (formData['contactno'] === undefined) {
                    formData['contactno'] = '';
                }
                if (formData['alternate_contactno'] === undefined) {
                    formData['alternate_contactno'] = '';
                }
                if (formData['email'] === undefined) {
                    formData['email'] = '';
                }
                formData['remarks'] = 'remarks';
                formData['status'] = 'active';
                formData['createdby'] = user?.UserName;
                formData['createddate'] = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
                formData['modifiedby'] = user?.UserName;
                formData['modifieddate'] = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
                formData['empaneled'] = empaneled;

                if (editIndex !== null && editButton) {
                    if (error === null) {
                        tableData[editIndex] = formData;
                        setTableData([...tableData]);
                        setEditButton(false);
                    }
                } else if (error === null) {
                    formData['id'] = 0;
                    setTableData([...tableData, { ...formData }]);
                }
            }
            if (error === null && contactError === null && altContactError === null && vendorNameCode != null) {
                setFormData({});
                setVendorNameOption([]);
                setEmpaneled(true);
            }
        }
    };
    const handelCategoryChange = (e, value, ind) => {
        formData['vendorcategory'] = value;
        if (formData.fk_VendorPartnerMaster_id !== undefined) delete formData.fk_VendorPartnerMaster_id;
        setFormData({
            ...formData,
        });
        console.log('formData2', formData);
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/InitiateLOI/GetVendorName?partnerCategory=${value}`)
            .then((response) => {
                const vendorIds = {};
                const vendorname = response?.data?.map((item, ind) => {
                    vendorIds[item.agencyName] = item.id;
                    return item.agencyName;
                });
                setVendorNameIds({ ...vendorNameIds, ...vendorIds });
                setVendorNameOption(vendorname);

                formData['fk_VendorPartnerMaster_id'] = tableData[ind]?.fk_VendorPartnerMaster_id || '';
                formData['vendorname'] = tableData[ind]?.vendorname || '';
                formData['houseKeeping_vendorname'] = tableData[ind]?.houseKeeping_vendorname || '';
                formData['contactno'] = tableData[ind]?.contactno || '';
                formData['alternate_contactno'] = tableData[ind]?.alternate_contactno || '';
                formData['email'] = tableData[ind]?.email || '';
                console.log('formData3', formData);
                setFormData({
                    ...formData,
                });
            })
            .catch((err) => {});
    };

    function swapKeysAndValues(obj) {
        const swapped = Object.entries(obj).map(([key, value]) => [value, key]);

        return Object.fromEntries(swapped);
    }

    const getData = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/VendorAllocation/GetVendorAllocationDetails?id=${mandateId?.id}`)
            .then((response) => {
                if (response && response?.data) {
                    const vendorIds = {};
                    const updatevendorname = response?.data?.map((item, ind) => {
                        vendorIds[item.partnerName] = item.fk_VendorPartnerMaster_id;
                    });

                    const table = [...response?.data];
                    const modified = table.map((item, index) => {
                        item['fk_VendorPartnerMaster_id'] = item['partnerName'];
                        return item;
                    });

                    if (response?.data?.length > 0) {
                        setUpdate(true);
                    } else {
                        setUpdate(false);
                    }
                    setUpdateVendorNameIds({ ...vendorIds });
                    setTableData([...modified]);
                }
            })
            .catch((err) => {});
    };

    React.useEffect(() => {
        setMandateId(id);
    }, []);

    React.useEffect(() => {
        if (mandateId?.id !== undefined && mandateId?.id !== 'noid') {
            getData();
        }
    }, [mandateId?.id]);

    const getVendorCategory = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/InitiateLOI/GetPartnerCategory`)
            .then((response) => {
                setVendorCategoryOption(response?.data);
            })
            .catch((err) => {});
    };
    useEffect(() => {
        getVendorCategory();
    }, []);

    const deleterow = (e, ind, idx) => {
        e.preventDefault();
        setEditButton(false);
        setFormData({});
        setEmpaneled(true);
        tableData.splice(ind, 1);

        setTableData([...tableData]);
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/VendorAllocation/DeleteEntry?id=${idx}`)
            .then((response) => {})
            .catch((err) => {});
    };
    const editrow = (ind, e) => {
        e.preventDefault();
        setEditButton(true);
        setErrorVendor({});
        setEditIndex(ind);
        setEmpaneled(tableData[ind].empaneled);
        console.log('editrow', tableData[ind]);
        setFormData({ ...tableData[ind] });
        handelCategoryChange(null, tableData[ind].vendorcategory, ind);
    };

    const handleEmpaneled = (e) => {
        setErrorVendor({});
        setEmpaneled(e.target.value === 'true' ? true : false);
        // vendorcategory
        delete formData['vendorcategory'];
        if (e.target.value === 'false') {
            delete formData['fk_VendorPartnerMaster_id'];
            // setFormData({ ...formData });
        } else {
            delete formData['vendorname'];
            handelCategoryChange(e, formData?.vendorcategory, null);
            // setFormData({ ...formData });
        }
        setFormData({ ...formData });
    };

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    console.log('formData', formData);
    return (
        <div>
            <Box component="h2" className="page-title-heading my-6">
                Vendor Allocation
            </Box>
            <div className="card-panal inside-scroll-233 vendor-wrapper">
                <MandateInfo mandateCode={mandateId} setMandateData={setMandateData} source="" pageType="" redirectSource={`${params?.source}`} setMandateCode={setMandateId} setpincode={() => {}} setCurrentStatus={setCurrentStatus} setCurrentRemark={setCurrentRemark} />

                <form>
                    <div className="phase-outer">
                        {action !== 'Approve' ? (
                            <Grid marginBottom="10px" marginTop="0px" container item spacing={5} justifyContent="start" alignSelf="center" sx={{ paddingTop: '0px!important' }}>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form custom-font">
                                        <h2 className="phaseLable required">Empaneled/Non Empaneled</h2>
                                        <ToggleSwitch alignment={empaneled} handleChange={(e) => handleEmpaneled(e)} yes={'Empaneled'} no={'Non Empaneled'} name={'Empaneled'} id="Empaneled" onBlur={() => {}} disabled={false} bold="false" />
                                    </div>
                                </Grid>

                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Vendor Category</h2>
                                        <Autocomplete
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => option?.toString() || ''}
                                            disableClearable={true}
                                            options={vendorCategoryOption || []}
                                            onChange={(e, value) => {
                                                handelCategoryChange(e, value, null);
                                                if (e !== null || value !== null) {
                                                    delete errorVendor['vendorcategory'];
                                                    setErrorVendor({ ...errorVendor });
                                                } else {
                                                    setErrorVendor({
                                                        ...errorVendor,
                                                        ['vendorcategory']: '',
                                                    });
                                                }
                                            }}
                                            value={formData?.vendorcategory !== undefined ? formData?.vendorcategory : ''}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="vendorcategory"
                                                    id="vendorcategory"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    size="small"
                                                    onKeyDown={(e: any) => {
                                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                    {errorVendor?.vendorcategory && errorVendor?.vendorcategory ? <p className="form-error">{errorVendor?.vendorcategory}</p> : null}
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Vendor Name Code</h2>
                                        {empaneled === true ? (
                                            <Autocomplete
                                                disablePortal
                                                id="combo-box-demo"
                                                getOptionLabel={(option) => option?.toString() || ''}
                                                disableClearable={true}
                                                options={vendorNameOption || []}
                                                onChange={(e, value) => {
                                                    formData['fk_VendorPartnerMaster_id'] = value;
                                                    formData['vendorname'] = '';
                                                    setFormData({
                                                        ...formData,
                                                    });
                                                    if (e !== null || value !== null) {
                                                        delete errorVendor['fk_VendorPartnerMaster_id'];
                                                        setErrorVendor({ ...errorVendor });
                                                    } else {
                                                        setErrorVendor({
                                                            ...errorVendor,
                                                            ['fk_VendorPartnerMaster_id']: '',
                                                        });
                                                    }
                                                }}
                                                value={formData?.fk_VendorPartnerMaster_id !== undefined ? formData?.fk_VendorPartnerMaster_id : ''}
                                                renderInput={(params) => (
                                                    <TextField
                                                        name="fk_VendorPartnerMaster_id"
                                                        id="fk_VendorPartnerMaster_id"
                                                        {...params}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            style: { height: `35 !important` },
                                                        }}
                                                        variant="outlined"
                                                        size="small"
                                                        onKeyDown={(e: any) => {
                                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        ) : (
                                            <TextField
                                                autoComplete="off"
                                                name="vendorname"
                                                id="vendorname"
                                                size="small"
                                                value={formData.vendorname !== undefined ? formData.vendorname : ''}
                                                onChange={(value) => {
                                                    handleVendorNameChange(value);
                                                    if (value !== null) {
                                                        delete errorVendor['fk_VendorPartnerMaster_id'];
                                                        setErrorVendor({ ...errorVendor });
                                                    } else {
                                                        setErrorVendor({
                                                            ...errorVendor,
                                                            ['fk_VendorPartnerMaster_id']: '',
                                                        });
                                                    }
                                                }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                //  onBlur={handleBlur}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                    regExpressionTextField(e);
                                                }}
                                            />
                                        )}
                                    </div>
                                    {errorVendor?.fk_VendorPartnerMaster_id && errorVendor?.fk_VendorPartnerMaster_id ? <p className="form-error">{errorVendor?.fk_VendorPartnerMaster_id}</p> : null}
                                </Grid>

                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable">House Keeping Vendor Name</h2>
                                        <TextField
                                            autoComplete="off"
                                            name="houseKeeping_vendorname"
                                            id="houseKeeping_vendorname"
                                            size="small"
                                            value={formData.houseKeeping_vendorname !== undefined ? formData.houseKeeping_vendorname : ''}
                                            onChange={handleChange}
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
                                                if (/[0-9]/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable">Contact Number</h2>
                                        <TextField
                                            autoComplete="off"
                                            name="contactno"
                                            id="contactno"
                                            type="text"
                                            variant="outlined"
                                            size="small"
                                            className="w-85"
                                            value={formData.contactno !== undefined ? formData.contactno : ''}
                                            onChange={handleChangeContactno}
                                            InputProps={{ inputProps: { min: 0, maxLength: 10 } }}
                                            onPaste={(e: any) => {
                                                if (!textFieldValidationOnPaste(e)) {
                                                    dispatch(fetchError('You can not paste Spacial characters'));
                                                }
                                            }}
                                            onKeyDown={(e: any) => {
                                                if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                    e.preventDefault();
                                                }
                                                if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </div>
                                    {contactError ? <p className="form-error">{contactError}</p> : ''}
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable">Alternate Contact Number</h2>
                                        <TextField
                                            autoComplete="off"
                                            name="alternate_contactno"
                                            id="alternate_contactno"
                                            type="text"
                                            variant="outlined"
                                            size="small"
                                            className="w-85"
                                            value={formData.alternate_contactno !== undefined ? formData.alternate_contactno : ''}
                                            onChange={handleChangeAltContactno}
                                            InputProps={{ inputProps: { min: 0, maxLength: 10 } }}
                                            onPaste={(e: any) => {
                                                if (!textFieldValidationOnPaste(e)) {
                                                    dispatch(fetchError('You can not paste Spacial characters'));
                                                }
                                            }}
                                            onKeyDown={(e: any) => {
                                                if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                    e.preventDefault();
                                                }
                                                if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </div>
                                    {altContactError ? <p className="form-error">{altContactError}</p> : ''}
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable">Email Id</h2>
                                        <TextField
                                            autoComplete="off"
                                            name="email"
                                            id="email"
                                            type="email"
                                            variant="outlined"
                                            size="small"
                                            className="w-85"
                                            value={formData.email !== undefined ? formData.email : ''}
                                            onChange={handleChangeEmail}
                                            onPaste={(e: any) => {
                                                if (!textFieldValidationOnPaste(e)) {
                                                    dispatch(fetchError('You can not paste Spacial characters'));
                                                }
                                            }}
                                            onKeyDown={(e: any) => {
                                                if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                    e.preventDefault();
                                                }
                                                if (e.code === 'Space') {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                        {error && <p className="form-error">{error}</p>}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div style={{ marginTop: '21px' }}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            disabled={action === 'Approve'}
                                            style={{
                                                padding: '6px 20px !important',
                                                marginLeft: '0 !important',
                                                borderRadius: 6,
                                                color: '#fff',
                                                borderColor: action === 'Approve' ? '' : '#00316a',
                                                backgroundColor: action === 'Approve' ? 'gray' : '#00316a',
                                            }}
                                            onClick={handleSubmit}
                                        >
                                            {editButton ? 'Update Vendor' : 'Add Vendor'}
                                        </Button>
                                    </div>
                                </Grid>
                            </Grid>
                        ) : (
                            ''
                        )}
                    </div>

                    <div>{tableData && tableData?.length > 0 && <VendorTable data={tableData} editrow={editrow} deleterow={deleterow} action={action} />}</div>
                    {mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid' && (
                        <div className="bottom-fix-history" style={{ marginBottom: 15 }}>
                            <MandateStatusHistory mandateCode={mandateId?.id} accept_Reject_Remark={currentRemark} accept_Reject_Status={currentStatus} />
                        </div>
                    )}

                    {tableData && tableData.length > 0 && mandateId && mandateId?.id !== undefined && (
                        <div className="bottom-fix-btn ptb-0">
                            <div className="remark-field" style={{ padding: '15px 0px', marginRight: '0px' }}>
                                <>
                                    {action && action === 'Approve' ? (
                                        <>
                                            <ApproveAndRejectAction
                                                approved={approved}
                                                sendBack={sendBack}
                                                setSendBack={setSendBack}
                                                setApproved={setApproved}
                                                remark={remark}
                                                setRemark={setRemark}
                                                approveEvent={() => {
                                                    workflowFunctionAPICall(runtimeId, mandateId?.id, mandateId?.id, remark, 'Approved', navigate, user, params, dispatch);
                                                }}
                                                sentBackEvent={() => {
                                                    workflowFunctionAPICall(runtimeId, mandateId?.id, mandateId?.id, remark, 'Sent Back', navigate, user, params, dispatch);
                                                }}
                                            />
                                            {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                                        </>
                                    ) : (
                                        action &&
                                        action === 'Create' && (
                                            <Stack display="flex" flexDirection="row" justifyContent="center" sx={{ margin: '0px' }} style={{ marginLeft: '-2.7%' }}>
                                                <Button
                                                    variant="outlined"
                                                    size="medium"
                                                    onClick={editIndex !== null || update ? handleUpdateApprove : handleApprove}
                                                    style={{
                                                        marginLeft: 10,
                                                        padding: '2px 20px',
                                                        borderRadius: 6,
                                                        color: '#fff',
                                                        borderColor: '#00316a',
                                                        backgroundColor: '#00316a',
                                                    }}
                                                >
                                                    Send for Approval
                                                </Button>

                                                {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                                            </Stack>
                                        )
                                    )}
                                </>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default VendorAllocation;
