import { Box, Button, MenuItem, Stack, TextField, Grid, createFilterOptions, Autocomplete, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import Select from '@mui/material/Select';
import { useFormik } from 'formik';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';
import React, { useEffect, useMemo, useState } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';
import { updateMandateInitialValues, updateMandateSchema } from '@uikit/schemas';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { SHOW_MESSAGE } from 'types/actions/Common.action';
import { AppState } from 'redux/store';
import { useUrlSearchParams } from 'use-url-search-params';
import { submit, reset } from '../../../shared/constants/CustomColor';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import { fetchError } from 'redux/actions';
import regExpressionTextField, { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';
import PhaseInfo from 'pages/common-components/PhaseInformation';

const AddMandate = () => {
    const [mandateCode, setMandateCode] = useState(null);
    const [mandateInfo, setMandateData] = React.useState(null);
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [phaseApprovalNoteId, setPhaseApprovalNoteId] = React.useState(null);
    const [phaseApprovalNoteScopeData, setPhaseApprovalNoteScopeData] = React.useState([]);
    const [value, setValue] = React.useState<number>(0);
    let { id } = useParams();
    const [phaseId, setPhaseId] = useState(null);
    const location = useLocation();
    const dispatch = useDispatch();
    const [branchType, setBranchType] = React.useState([]);
    const [glCategories, setGlCategories] = React.useState([]);
    const [projectManager, setProjectManager] = React.useState([]);
    const [sourcingAssociate, setSourcingAssociate] = React.useState([]);
    const [mandateList, setMandateList] = React.useState([]);
    const [phaseList, setPhaseList] = React.useState([]);
    const [projectManagerID, setProjectManagerID] = React.useState();
    const [userAction, setUserAction] = React.useState(null);
    const [sourcingAssociateID, setSourcingAssociateID] = React.useState();
    const [phaseValueDefault, setPhaseValueDefault] = useState(null);
    const [phaseData, setPhaseData] = useState<any>({});
    const [stateList, setStateList] = React.useState(null);
    const [districtList, setDistrictList] = React.useState(null);
    const [cityList, setCityList] = React.useState(null);
    const [tierList, setTierList] = React.useState(null);
    const [tierName, setTierName] = React.useState(null);
    const [businessTypeList, setBusinessTypeList] = React.useState(null);
    const [businessAssociateList, setBusinessAssociateList] = React.useState(null);
    const [adminVerticalList, setAdminVerticalList] = React.useState(null);
    const [state, setState] = React.useState(null);
    const [district, setDistrict] = React.useState(null);
    const [city, setCity] = React.useState(null);
    const [businessType, setBusinessType] = React.useState(null);
    const [businessAssociate, setBusinessAssociate] = React.useState(null);
    const [adminVertical, setAdminVertical] = React.useState([]);
    const [verticalHead, setVerticalHead] = React.useState([]);
    const [verticalHeadList, setVerticalHeadList] = React.useState(null);
    const [projectDeliveryManager, setProjectDeliveryManager] = React.useState(null);
    const [projectDeliveryManagerList, setProjectDeliveryManagerList] = React.useState([]);
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    let { phaseid, mandateId } = useParams();
    const { user } = useAuthUser();
    const [params] = useUrlSearchParams({}, {});

    const [open, setOpen] = React.useState(false);
    const [flag, setFlag] = React.useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen1 = () => {
        setIsOpen(true);
    };

    const handleClose1 = () => {
        setIsOpen(false);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    React.useEffect(() => {
        if (mandateId !== 'noid' && userActionList && userActionList?.length > 0) {
            if (!mandateId) return;
            const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(mandateId) && item?.module === module);

            setUserAction(userAction);
        }
    }, [userActionList, mandateId]);

    const action = userAction?.action || '';
    const runtimeId = userAction?.runtimeId || 0;

    const navigate = useNavigate();
    const _getMandateList = () => {
        axios({
            method: 'get',
            url: `${process.env.REACT_APP_BASEURL}/api/Mandates/DropDownMandet`,
        }).then((res) => {
            if (res && res.data && res.data.length > 0) {
                setMandateList(res?.data);
            }
        });
    };
    useEffect(() => {
        _getMandateList();
        _getPhaseCodeList();
    }, []);
    const _getPhaseCodeList = () => {
        axios({
            method: 'get',
            url: `${process.env.REACT_APP_BASEURL}/api/Mandates/DropDownPhase`,
        }).then((res) => {
            if (res && res.data && res.data.length > 0) {
                setPhaseList(res?.data);
            }
        });
    };

    const getProjectManagerRoleID = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/GetRoleId?Role_Name=Project Manager`)
            .then((response: any) => {
                setProjectManagerID(response?.data);
            })
            .catch((e: any) => {});
    };

    const getSourcingAssociateRoleID = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/GetRoleId?Role_Name=Sourcing Associate`)
            .then((response: any) => {
                setSourcingAssociateID(response?.data);
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        getProjectManagerRoleID();
        getSourcingAssociateRoleID();
    }, []);

    function removeDuplicates(arr) {
        var unique = [];
        var temp = [];
        arr.forEach((element) => {
            if (!unique.includes(element?.glCategoryName)) {
                unique.push(element?.glCategoryName);
                temp.push(element);
            }
        });
        return temp;
    }

    const getPhaseInformationById = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Phases/GetPhase?id=${id || 0}`)
            .then((response: any) => {
                if (response && response?.data) {
                    setPhaseData(response?.data || {});
                } else {
                    setPhaseData({});
                }
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        if (phaseData?.verticalId !== undefined && phaseData?.verticalId != 0) {
            getGlCategory(phaseData?.verticalId);
        }
    }, [phaseData?.verticalId]);

    const getGlCategory = (verticalId) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AdminBusinessMaster/GetGLCategoryList?fk_vertical_id=${verticalId || 0}`)
            .then((response: any) => {
                // const unqData = removeDuplicates(response?.data);
                setGlCategories(response?.data);
            })
            .catch((e: any) => {});
    };
    const getBranchType = (glCategoryId) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AdminBusinessMaster/GetBranchTypeList?fk_gl_category=${glCategoryId || 0}&fk_vertical_id=${phaseData?.verticalId}`)
            .then((response: any) => {
                setBranchType(response?.data || []);
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        if (!projectManagerID) return;
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Countries/getAllWithDataWithDesignation?RollId=${projectManagerID}`)
            .then((response: any) => {
                setProjectManager(response?.data?.data);
            })
            .catch((e: any) => {});
        if (!sourcingAssociateID) return;
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Countries/getAllWithDataWithDesignation?RollId=${sourcingAssociateID}`)
            .then((response: any) => {
                setSourcingAssociate(response?.data?.data);
            })
            .catch((e: any) => {});
    }, [projectManagerID, sourcingAssociateID]);

    const getPhaseId = (phase) => {
        return (phase && phase.phaseId) || 0;
    };

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetStateList`)
            .then((response: any) => {
                console.log('res-state', response);
                setStateList(response?.data || []);
            })
            .catch((e: any) => {});
    }, []);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/TierMaster/GetTierMasterList`)
            .then((response: any) => {
                console.log('res-state', response);
                setTierList(response?.data || []);
            })
            .catch((e: any) => {});
    }, []);

    useEffect(() => {
        if (state?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetDistrictList?stateid=${state?.id}`)
                .then((response: any) => {
                    console.log('res-dist', response);
                    setDistrictList(response?.data || []);
                })
                .catch((e: any) => {});
        }
    }, [state?.id]);

    useEffect(() => {
        if (district?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetCityList?stateid=${state?.id}&districtid=${district?.id}`)
                .then((response: any) => {
                    console.log('dis-city', response);
                    setCityList(response?.data || []);
                })
                .catch((e: any) => {});
        }
    }, [state?.id, district?.id]);

    useEffect(() => {
        if (district?.id !== undefined && district?.id !== undefined && city?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetAdminVerticalList?stateid=${state?.id}&districtid=${district?.id}&cityid=${city?.id}`)
                .then((response: any) => {
                    console.log('dis-admin', response);

                    // const newAdminVertical = [...adminVertical, response?.data[0]?.verticalName]
                    const adminVerticalId = response?.data.find((item) => item.id);
                    setAdminVerticalList(adminVerticalId);
                    console.log('adminVerticalId', adminVerticalId);
                    setAdminVertical([response?.data[0]?.admin_Vertical_List_Name]);
                })
                .catch((e: any) => {});
        }
    }, [state?.id, district?.id, city?.id]);

    useEffect(() => {
        if (district?.id !== undefined && district?.id !== undefined && city?.id !== undefined && adminVerticalList?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetVerticalHeadList?stateid=${state?.id}&districtid=${district?.id}&cityid=${city?.id}&fk_admin_vertical_id=${adminVerticalList?.id}`)
                .then((response: any) => {
                    console.log('dis-vertical', response);
                    // setAdminVerticalList(response?.data || [])
                    // const newAdminVertical = [...adminVertical, response?.data[0]?.verticalName]
                    setVerticalHeadList(response?.data.find((item) => item.id));
                    setVerticalHead([response?.data[0]?.userName]);
                })
                .catch((e: any) => {});
        }
    }, [state?.id, district?.id, city?.id, adminVerticalList?.id]);

    const { values, handleBlur, handleChange, setFieldValue, handleSubmit, errors, touched, resetForm } = useFormik({
        initialValues: updateMandateInitialValues,
        validationSchema: updateMandateSchema,
        validateOnChange: true,
        validateOnBlur: false,
        onSubmit: (values, action) => {
            if (!flag) {
                let newStatus = '';
                if (values.locationName !== '' && tierName?.tierName !== '' && values.remarks !== '') {
                    newStatus = 'Initiated';
                } else {
                    newStatus = 'Created';
                }

                const body = {
                    id: 0,
                    uid: '',
                    status: newStatus,
                    phaseId: (values && values?.phaseId && getPhaseId(values?.phaseId)) || phaseValueDefault?.phaseId || '',
                    mandateCode: values?.mandateId,
                    glCategoryId: +values?.glCategory,
                    branchId: +values.branchType,
                    pincode: (values?.pinCode && values?.pinCode.toString()) || '',
                    state: state?.stateName || values?.state,
                    region: values?.region,
                    district: district?.districtName || values.district,
                    city: city?.cityName || values.city,
                    location: values?.locationName,
                    tierName: tierName?.tierName || values?.tierName,
                    fk_business_type: businessType?.id || 0,
                    fk_business_associate: businessAssociate?.id || 0,
                    fk_admin_vertical: adminVerticalList?.id || 0,
                    fk_vertical_head: verticalHeadList?.id || 0,
                    fk_project_delivery_manager: projectDeliveryManager?.id || 0,
                    remark: values?.remarks,
                    projectManagerId: values?.projectManager || 0,
                    pM_Remarks: '',
                    branchCode: values.branchCode || '',
                    completionPer: 0,
                    accept_Reject_Status: 'Pending',
                    accept_Reject_Remark: 'Pending',
                    createdDate: values?.createdDate === '0001-01-01T00:00:00' ? '-' : moment().format('YYYY-MM-DDTHH:mm:ss.SSS' || ''),
                    modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    createdBy: user?.UserName,
                    modifiedBy: user?.UserName,
                };
                axios
                    .post(`${process.env.REACT_APP_BASEURL}/api/Mandates/CreateMandates`, body)
                    .then((response: any) => {
                        if (!response) return;
                        if (response && response.data) {
                            dispatch({
                                type: SHOW_MESSAGE,
                                message: response?.data?.message + '!' || '',
                            });
                            workFlowMandate(response?.data?.data?.id);
                            action.resetForm();
                        }
                    })
                    .catch((e: any) => {
                        action.resetForm();
                    });
            } else {
                dispatch(fetchError("You can't add more mandates!!"));
            }
        },
    });

    console.log('error', errors);

    useEffect(() => {
        if (state) {
            errors.state = null;
        }
        if (district) {
            errors.district = null;
        }
        if (city) {
            errors.city = null;
        }
        if (businessAssociate) {
            errors.fk_business_associate = null;
        }
        if (businessType) {
            errors.fk_business_type = null;
        }
        for (const key in errors) {
            // Check if the value is null
            if (errors[key] === null) {
                // Use the delete operator to remove the key
                delete errors[key];
            }
        }
    }, [state, district, city, errors, businessType, businessAssociate]);

    useEffect(() => {
        if (phaseData?.verticalId !== undefined && phaseData?.verticalId != 0) {
            const glCategoryId = +values?.glCategory;
            getBusinessType(phaseData?.verticalId, glCategoryId);
        }
    }, [phaseData?.verticalId, values?.glCategory]);

    const getBusinessType = (verticalId, glCategoryId) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AdminBusinessMaster/GetBusinessTypeList?fk_vertical_id=${verticalId || 0}&fk_gl_category=${glCategoryId || 0}`)
            .then((response: any) => {
                console.log('res-businesstype', response);
                setBusinessTypeList(response?.data || []);
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        if (businessType?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/AdminBusinessMaster/GetBusinessAssociateList?fk_business_type=${businessType?.id}`)
                .then((response: any) => {
                    console.log('res-businesstype', response);
                    setBusinessAssociateList(response?.data || []);
                })
                .catch((e: any) => {});
        }
    }, [businessType?.id]);

    const _phaseId: any = values && values?.phaseId && getPhaseId(values?.phaseId);
    React.useEffect(() => {
        if (
            phaseList &&
            phaseList?.length > 0
            // params &&
            // Object.keys(params).length > 0 &&
            // params?.source === "list"
        ) {
            if (phaseid && phaseid !== '') {
                var obj = phaseList && phaseList?.length > 0 && phaseList.find((item) => item.phaseCode === phaseid);
                if (mandateId && mandateId !== 'nomandateId') {
                    setMandateId(obj?.phaseId, obj?.phaseCode);
                }
                if (phaseid && phaseid !== 'nophaseid') {
                    setPhaseValueDefault(obj || null);
                }
            }
        }
    }, [phaseList, setPhaseList, phaseid, mandateId]);

    useEffect(() => {
        if (phaseValueDefault?.phaseId) setFieldValue('phaseId', phaseValueDefault);
    }, [phaseValueDefault]);

    const getSourcingAssociateName = (id) => {
        var obj = sourcingAssociate && sourcingAssociate?.find((item) => item.id === id);
        return obj && obj?.userName;
    };

    const getMandateIdByCode = (code) => {
        var obj = mandateList && mandateList?.length > 0 && mandateList?.find((item) => item?.mandetCode === code);
        return (obj && obj?.mandetId) || 0;
    };
    const setMandateId = (id, phaseid) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/GenerateMandetId?phaseId=${id}`)
            .then((response: any) => {
                setFieldValue('mandateId', response?.data);
                getPhaseInformationById(id);
                navigate(`/mandate/${phaseid ? phaseid : 'nophaseid'}/${response?.data ? response?.data : 'nomandateId'}/add`);
            })
            .catch((e: any) => {});
    };

    const dialogstate = useMemo(() => {
        var phase: any = values?.phaseId;
        if (phase && phase?.phaseId !== 0 && phaseList.length > 0) {
            if (phase?.no_of_Mandets >= phase?.no_of_branches) {
                setFlag(true);
                setOpen(true);
            } else {
                setFlag(false);
                setOpen(false);
            }
        }
    }, [values?.phaseId, phaseList, setFlag]);

    useEffect(() => {
        if (mandateId !== undefined) {
            setMandateCode(mandateId);
        }
    }, [mandateId]);

    useEffect(() => {
        if (state?.id !== undefined && district?.id !== undefined && city?.id !== undefined && adminVerticalList?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetPDMList?fk_state_id=${state?.id}&fk_district_id=${district?.id}&fk_city_id=${city?.id}&fk_admin_vertical_id=${adminVerticalList?.id}`)
                .then((response: any) => {
                    console.log('pdm', response);
                    setProjectDeliveryManagerList([response?.data[0]?.userName]);
                    setProjectDeliveryManager(response?.data.find((item) => item.id));
                })
                .catch((e: any) => {});
        }
    }, [state?.id, district?.id, city?.id, adminVerticalList?.id]);

    const workFlowMandate = (mandateId: any) => {
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: 0,
            mandateId: mandateId || 0,
            tableId: mandateId || 0,
            remark: values?.remarks || 'Created',
            createdBy: user?.UserName,
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: "Submit Mandate",
        };
        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ''}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) return;
                if (response?.data === true) {
                    if (params?.source === 'list') {
                        navigate('/list/task');
                    } else {
                        navigate('/mandate');
                    }
                }
            })
            .catch((e: any) => {});
    };
    const filterOptions = (options, { inputValue }) => {
        console.log('Filter', options, inputValue.toLowerCase());
        const res = options.filter((option) => option?.phaseCode?.toString().toLowerCase().includes(inputValue.toLowerCase()));
        return res;
    };
    return (
        <div>
            <Box component="h2" className="page-title-heading my-6">
                Add Mandate
            </Box>
            {_phaseId && _phaseId !== undefined && <PhaseInfo phaseId={phaseId == null ? _phaseId : phaseId} setPhaseId={setPhaseId} />}

            <div className="card-panal" style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <form onSubmit={handleSubmit}>
                    <div className="phase-outer">
                        <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center">
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Phase Code</h2>
                                    <Autocomplete
                                        freeSolo
                                        disablePortal
                                        disabled={phaseValueDefault?.phaseId ? true : false}
                                        sx={
                                            phaseValueDefault?.phaseId && {
                                                backgroundColor: '#f3f3f3',
                                                borderRadius: '6px',
                                            }
                                        }
                                        id="combo-box-demo"
                                        value={phaseValueDefault?.phaseId ? phaseValueDefault : values?.phaseId}
                                        getOptionLabel={(option) => option?.phaseCode?.toString() || ''}
                                        disableClearable={true}
                                        options={phaseList || []}
                                        filterOptions={filterOptions}
                                        onChange={(e, value: any) => {
                                            setFieldValue('phaseId', value);
                                            navigate(`/mandate/${value?.phaseCode ? value?.phaseCode : 'nophaseid'}/${values.mandateId ? values.mandateId : 'nomandateId'}/add`);
                                            setMandateId(value?.phaseId && parseInt(value?.phaseId), value.phaseCode);
                                            getPhaseInformationById(id);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                name="phaseId"
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

                                    {touched?.phaseId && errors?.phaseId ? <p className="form-error">{errors?.phaseId}</p> : null}
                                </div>
                            </Grid>
                            {flag ? (
                                <div>
                                    <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                                        <DialogTitle id="alert-dialog-title">{'Alert Message'}</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText id="alert-dialog-description">You can't add more mandates.</DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => navigate('/mandate')} variant="contained" size="small" sx={{ alignItems: 'center' }}>
                                                {' '}
                                                Ok
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </div>
                            ) : (
                                <div></div>
                            )}
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable">Mandate ID</h2>
                                    <TextField name="mandateID" id="mandateID" variant="outlined" size="small" className="w-85" value={values?.mandateId || ''} onChange={handleChange} disabled />
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">GL Category</h2>
                                    <Select
                                        displayEmpty
                                        inputProps={{ 'aria-label': 'Without label' }}
                                        size="small"
                                        className="w-85"
                                        name="glCategory"
                                        id="glCategory"
                                        value={values.glCategory || ''}
                                        onChange={(e) => {
                                            handleChange(e);
                                            getBranchType(e.target.value);
                                            setBusinessType(null);
                                            setBusinessAssociate(null);
                                        }}
                                        onBlur={handleBlur}
                                        onOpen={handleOpen1}
                                        onClose={handleClose1}
                                    >
                                        {glCategories?.map((v) => (
                                            <MenuItem key={v?.id} value={v?.id}>
                                                {v?.glCategoryName}
                                            </MenuItem>
                                        ))}
                                        {isOpen && glCategories?.length === 0 && <MenuItem disabled>No options</MenuItem>}
                                    </Select>
                                    {touched.glCategory && errors.glCategory ? <p className="form-error">{errors.glCategory}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Branch Type</h2>
                                    <Select displayEmpty inputProps={{ 'aria-label': 'Without label' }} size="small" className="w-85" name="branchType" id="branchType" value={values.branchType} onChange={handleChange} onBlur={handleBlur} onOpen={handleOpen1} onClose={handleClose1}>
                                        {branchType?.map((v: any) => (
                                            <MenuItem value={v?.id}>{v?.branchTypeName}</MenuItem>
                                        ))}
                                        {isOpen && branchType?.length === 0 && (
                                            <MenuItem disabled>
                                                <p style={{ color: 'rgba(0, 0, 0, 0.54)' }}>No options</p>
                                            </MenuItem>
                                        )}
                                    </Select>
                                    {touched.branchType && errors.branchType ? <p className="form-error">{errors.branchType}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Pin Code</h2>
                                    <TextField
                                        autoComplete="off"
                                        name="pinCode"
                                        id="pinCode"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        className="w-85"
                                        value={values?.pinCode}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        InputProps={{ inputProps: { min: 0, maxLength: 6 } }}
                                        onKeyPress={(e: any) => {
                                            if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                    />
                                    {touched.pinCode && errors.pinCode ? <p className="form-error">{errors.pinCode}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">State</h2>
                                    {/* <TextField
                    name="state"
                    autoComplete="off"
                    id="state"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.state}
                    onChange={handleChange}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e);
                      if (/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onBlur={handleBlur}
                  /> */}
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => {
                                            return option?.stateName?.toString() || '';
                                        }}
                                        disableClearable={true}
                                        // disabled={roleList?.length === 1 ? true : false}
                                        options={stateList || []}
                                        onChange={(e, value) => {
                                            console.log('value', value);
                                            setState(value);
                                            setDistrict(null);
                                            setCity(null);
                                            setAdminVertical([]);
                                            setVerticalHead([]);
                                            setProjectDeliveryManager(null);
                                            setCityList([]);
                                            setDistrictList([]);
                                        }}
                                        // onChange={handleChange}
                                        placeholder="State"
                                        value={state}
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
                                    {touched.state && errors.state && state === null ? <p className="form-error">{errors.state}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable">Region</h2>
                                    <TextField
                                        name="region"
                                        id="region"
                                        autoComplete="off"
                                        variant="outlined"
                                        size="small"
                                        className="w-85"
                                        value={values.region}
                                        onChange={handleChange}
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                            if (/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        onBlur={handleBlur}
                                    />
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">District</h2>
                                    {/* <TextField
                    name="district"
                    id="district"
                    variant="outlined"
                    size="small"
                    autoComplete="off"
                    className="w-85"
                    value={values.district}
                    onChange={handleChange}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e);
                      if (/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onBlur={handleBlur}
                  /> */}

                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => {
                                            return option?.districtName?.toString() || '';
                                        }}
                                        disableClearable={true}
                                        // disabled={roleList?.length === 1 ? true : false}
                                        options={districtList || []}
                                        onChange={(e, value) => {
                                            console.log('value', value);
                                            setDistrict(value);
                                            setCity(null);
                                            setCityList([]);
                                        }}
                                        // onChange={handleChange}
                                        placeholder="District"
                                        value={district}
                                        renderInput={(params) => (
                                            <TextField
                                                name="district"
                                                id="district"
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
                                    {touched.district && errors.district && district === null ? <p className="form-error">{errors.district}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">City</h2>
                                    {/* <TextField
                    name="city"
                    id="city"
                    autoComplete="off"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.city}
                    onChange={handleChange}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e);
                      if (/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onBlur={handleBlur}
                  /> */}

                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => {
                                            return option?.cityName?.toString() || '';
                                        }}
                                        disableClearable={true}
                                        // disabled={roleList?.length === 1 ? true : false}
                                        options={cityList || []}
                                        onChange={(e, value) => {
                                            console.log('value', value);
                                            setCity(value);
                                        }}
                                        // onChange={handleChange}
                                        placeholder="City"
                                        value={city}
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
                                            />
                                        )}
                                    />
                                    {touched.city && errors.city && city === null ? <p className="form-error">{errors.city}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable ">Location Name</h2>
                                    <TextField
                                        autoComplete="off"
                                        name="locationName"
                                        id="locationName"
                                        variant="outlined"
                                        size="small"
                                        className="w-85"
                                        value={values.locationName}
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {touched.locationName && errors.locationName ? <p className="form-error">{errors.locationName}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable">Tier Name</h2>
                                    {/* <TextField
                    name="tierName"
                    autoComplete="off"
                    id="tierName"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.tierName}
                    onChange={handleChange}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e);
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onBlur={handleBlur}
                  /> */}

                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => {
                                            return option?.tierName?.toString() || '';
                                        }}
                                        disableClearable={true}
                                        // disabled={roleList?.length === 1 ? true : false}
                                        options={tierList || []}
                                        onChange={(e, value) => {
                                            console.log('value', value);
                                            setTierName(value);
                                        }}
                                        placeholder="Business Type"
                                        value={tierName}
                                        renderInput={(params) => (
                                            <TextField
                                                name="tierName"
                                                id="tierName"
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
                                    <h2 className="phaseLable required">Business Type</h2>
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => {
                                            return option?.business_type?.toString() || '';
                                        }}
                                        disableClearable={true}
                                        // disabled={roleList?.length === 1 ? true : false}
                                        options={businessTypeList || []}
                                        onChange={(e, value) => {
                                            console.log('value', value);
                                            setBusinessType(value);
                                            setBusinessAssociate(null);
                                        }}
                                        placeholder="Business Type"
                                        value={businessType}
                                        renderInput={(params) => (
                                            <TextField
                                                name="businessType"
                                                id="businessType"
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
                                    {touched.fk_business_type && errors.fk_business_type && businessType === null ? <p className="form-error">{errors.fk_business_type}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Business Associate</h2>
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => {
                                            console.log('option', option);
                                            return option?.userName || '';
                                        }}
                                        disableClearable={true}
                                        // disabled={roleList?.length === 1 ? true : false}
                                        options={businessAssociateList || []}
                                        onChange={(e, value) => {
                                            setBusinessAssociate(value);
                                        }}
                                        placeholder="Business Type"
                                        value={businessAssociate || []}
                                        renderInput={(params) => (
                                            <TextField
                                                name="businessAssociate"
                                                id="businessAssociate"
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
                                    {touched.fk_business_associate && errors.fk_business_associate && businessAssociate === null ? <p className="form-error">{errors.fk_business_associate}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable">Admin Vertical</h2>
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        sx={{
                                            backgroundColor: '#f3f3f3',
                                            borderRadius: '6px',
                                        }}
                                        // getOptionLabel={(option) => {
                                        //   console.log('option',option)
                                        //   return option?.toString();
                                        // } }
                                        disableClearable={true}
                                        disabled
                                        options={[]}
                                        onChange={(e, value) => {}}
                                        placeholder="Admin Vertical"
                                        value={adminVertical}
                                        renderInput={(params) => (
                                            <TextField
                                                name="verticalName"
                                                id="verticalName"
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
                                    <h2 className="phaseLable">Vertical Head</h2>
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        sx={{
                                            backgroundColor: '#f3f3f3',
                                            borderRadius: '6px',
                                        }}
                                        // getOptionLabel={(option) => {} }
                                        disableClearable={true}
                                        disabled
                                        options={[]}
                                        onChange={(e, value) => {}}
                                        placeholder="Business Type"
                                        value={verticalHead || []}
                                        renderInput={(params) => (
                                            <TextField
                                                name="verticalHead"
                                                id="verticalHead"
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
                                    <h2 className="phaseLable">Project Delivery Manager</h2>
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        sx={{
                                            backgroundColor: '#f3f3f3',
                                            borderRadius: '6px',
                                        }}
                                        getOptionLabel={(option) => {
                                            return option?.userName?.toString() || '';
                                        }}
                                        disableClearable={true}
                                        disabled
                                        options={projectDeliveryManagerList || []}
                                        onChange={(e, value) => {
                                            setProjectDeliveryManager(value);
                                        }}
                                        placeholder="Business Type"
                                        value={projectDeliveryManager || []}
                                        renderInput={(params) => (
                                            <TextField
                                                name="projectDeliveryManager"
                                                id="projectDeliveryManager"
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
                                    <h2 className="phaseLable ">Remarks</h2>
                                    <TextField
                                        name="remarks"
                                        autoComplete="off"
                                        id="remarks"
                                        variant="outlined"
                                        size="small"
                                        className="w-85"
                                        value={values.remarks}
                                        onChange={handleChange}
                                        onKeyDown={(e: any) => {
                                            regExpressionRemark(e);
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        onBlur={handleBlur}
                                    />
                                    {touched.remarks && errors.remarks ? <p className="form-error">{errors.remarks}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable">Project Manager</h2>
                                    <Select
                                        displayEmpty
                                        inputProps={{ 'aria-label': 'Without label' }}
                                        size="small"
                                        className="w-85"
                                        style={{
                                            backgroundColor: '#f3f3f3',
                                            borderRadius: '6px',
                                        }}
                                        disabled
                                        name="projectManager"
                                        id="projectManager"
                                        value={values.projectManager}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    >
                                        {projectManager?.map((v) => (
                                            <MenuItem value={v?.id}>{v?.userName}</MenuItem>
                                        ))}
                                    </Select>
                                    {touched.projectManager && errors.projectManager ? <p className="form-error">{errors.projectManager}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable">Project Manager Remarks</h2>
                                    <TextField
                                        name="projectManagerRemarks"
                                        id="projectManagerRemarks"
                                        variant="outlined"
                                        size="small"
                                        disabled
                                        className="w-85"
                                        value={values.projectManagerRemarks}
                                        onChange={handleChange}
                                        onKeyDown={(e: any) => {
                                            regExpressionRemark(e);
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        onBlur={handleBlur}
                                    />
                                    {touched.projectManagerRemarks && errors.projectManagerRemarks ? <p className="form-error">{errors.projectManagerRemarks}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable">Branch Code</h2>
                                    <TextField name="branchCode" id="branchCode" variant="outlined" size="small" className="w-85" disabled value={values.branchCode} onChange={handleChange} onBlur={handleBlur} />
                                    {touched.branchCode && errors.branchCode ? <p className="form-error">{errors.branchCode}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable">Sourcing Associate</h2>
                                    <Select
                                        displayEmpty
                                        inputProps={{ 'aria-label': 'Without label' }}
                                        size="small"
                                        sx={{ backgroundColor: '#f3f3f3', borderRadius: '6px' }}
                                        className="w-85"
                                        name="sourcingAssociate"
                                        id="sourcingAssociate"
                                        value={values?.sourcingAssociate}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        disabled
                                    >
                                        {sourcingAssociate?.map((v) => (
                                            <MenuItem value={v?.id}>{v?.userName}</MenuItem>
                                        ))}
                                    </Select>
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable">Branch Admin</h2>
                                    <Autocomplete
                                        disablePortal
                                        sx={{
                                            backgroundColor: '#f3f3f3',
                                            borderRadius: '6px',
                                        }}
                                        id="combo-box-demo"
                                        disabled={true}
                                        getOptionLabel={(option) => option?.userName?.toString() || ''}
                                        disableClearable={true}
                                        options={[]}
                                        filterOptions={createFilterOptions({
                                            stringify: (option) => option?.userName,
                                        })}
                                        value={null}
                                        defaultValue={null}
                                        onChange={(e: any, value) => {}}
                                        renderInput={(params) => (
                                            <TextField
                                                name="branchAdmin"
                                                id="branchAdmin"
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
                    <Stack display="flex" flexDirection="row" justifyContent="center" sx={{ margin: '10px' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            type="reset"
                            style={reset}
                            onClick={() => {
                                resetForm({
                                    values: {
                                        ...values,
                                        glCategory: '',
                                        branchType: '',
                                        pinCode: '',
                                        state: '',
                                        region: '',
                                        district: '',
                                        city: '',
                                        locationName: '',
                                        tierName: '',
                                        remarks: '',
                                        projectManager: '',
                                    },
                                });
                                setState(null);
                                setDistrict(null);
                                setCity(null);
                                setTierName(null);
                                setBusinessType(null);
                                setBusinessAssociate(null);
                                setAdminVertical(null);
                                setVerticalHead(null);
                                setProjectDeliveryManager(null);
                            }}
                        >
                            RESET
                        </Button>

                        <Button variant="outlined" size="medium" type="submit" style={submit} name="submit">
                            SUBMIT
                        </Button>
                    </Stack>
                </form>
            </div>
        </div>
    );
};

export default AddMandate;
