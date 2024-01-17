import { Autocomplete, Box, Button, Checkbox, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, MenuItem, OutlinedInput, Radio, RadioGroup, Select, TextField } from '@mui/material';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { addUserInitialValues, addUserSchema } from '@uikit/schemas';
import { fetchError, showMessage } from 'redux/actions';
import regExpressionTextField from '@uikit/common/RegExpValidation/regForTextField';
import { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';
import { RollerShadesClosedSharp, Visibility, VisibilityOff } from '@mui/icons-material';
import moment from 'moment';
import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';
import { primaryButtonSm } from 'shared/constants/CustomColor';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const AddUser = ({ type }) => {
    const [vertical, setVertical] = React.useState([]);
    const [designation, setDesignation] = useState([]);
    const [reportingUser, setReportingUser] = useState([]);
    const [role, setRole] = useState([]);
    const [vendorType, setVendorType] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [dropdowns, setDropdowns] = useState<any>({});
    const [actionData, setActionData] = useState<any>({});
    const [selectedAdditionlRole, setSelectedAdditionlRole] = useState([]);
    const [radioButton, setRadioButton] = useState('Employee');
    const [search, setSearch] = useState('');
    const [empCode, setEmpCode] = useState('');
    const dispatch = useDispatch();
    const { id } = useParams();
    let navigate = useNavigate();
    const { user } = useAuthUser();
    const [adminVerticalList, setAdminVerticalList] = React.useState([]);
    const [modulesList, setModuleslList]= React.useState(null);
    const [modulesListName, setModuleslListName]= React.useState(null);
    const [isChecked, setChecked] = useState(true);

    const handleRadioChange = (event) => {
        setRadioButton(event.target.value);
    };
    const handleActiveChange = (event) => {
        setChecked(event.target.checked);
      };

    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);

    const getvendorType = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/VendorAllocation/GetVendorList`)
            .then((response: any) => {
                setVendorType(response?.data || []);
            })
            .catch((e: any) => {});
    };
    const getRole = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/User/UserManagementRoleList`)
            .then((response: any) => {
                setRole(response?.data || []);
            })
            .catch((e: any) => {});
    };
    const getReportingUser = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/User/UserManagementUsersList`)
            .then((response: any) => {
                setReportingUser(response?.data || []);
            })
            .catch((e: any) => {});
    };
    const getVertical = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=VerticalMaster`)
            .then((response: any) => {
                setVertical(response?.data?.data || []);
            })
            .catch((e: any) => {});
    };
    const getDesignation = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Designation`)
            .then((response: any) => {
                setDesignation(response?.data || []);
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
           axios
          .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=Admin_Vertical_List`)
          .then((response: any) => {
            console.log('dis-admin',response)
            
            const adminVerticalId = response?.data?.data.map((item)=> item.admin_Vertical_List_Name);
            setAdminVerticalList(adminVerticalId);
            console.log('adminVerticalId',adminVerticalId,adminVerticalList);
          })
          .catch((e: any) => {
          });   
      }, [])

      useEffect(() => {
           axios
          .get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Modules`)
          .then((response: any) => {
            console.log('modules',response)
            const modulesName = response?.data?.map((item)=> item.formName );
            setModuleslList(modulesName);
          })
          .catch((e: any) => {
          });   
      }, [])

      console.log('adminvertical',adminVerticalList)
    const getUserById = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/User/UserById?id=${id}`)
            .then((response: any) => {
                console.log('modulelist',response?.data[0]?.moduleList.split(","))
                setModuleslListName(response?.data[0]?.moduleList.split(","))
                setActionData(response?.data[0] || []);
                setFieldValue('userName', response?.data[0]?.userName);
                setFieldValue('password', response?.data[0]?.password);
                setFieldValue('fullName', response?.data[0]?.userFullName);
                setFieldValue('mobileNo', response?.data[0]?.mobileNumber);
                setFieldValue('emailId', response?.data[0]?.email);
                setFieldValue('active', response?.data[0]?.isActive);
                setFieldValue('role', response?.data[0]?.roleId);
                setFieldValue('designation', response?.data[0]?.designation);
                setFieldValue('vertical', response?.data[0]?.verticalType);
                setFieldValue('reportingUser', response?.data[0]?.reporting_user_id);
                setFieldValue('vendorType', response?.data[0]?.vendorType);
                setFieldValue('defaultModule',response?.data[0]?.defaultModule);
                // setFieldValue('moduleList',response?.data[0]?.moduleList.split(","));
                console.log('AAA', role, designation, vertical, reportingUser, vendorType);
                setDropdowns({
                    role: role?.find((v) => v.id == response?.data[0]?.roleId),
                    designation: designation?.find((v) => v.formName == response?.data[0]?.designation),
                    // vertical: vertical?.find((v) => v.verticalName == response?.data[0]?.verticalType),
                    vertical: response?.data[0]?.verticalType,
                    defaultModule:response?.data[0]?.defaultModule,
                    // moduleList:response?.data[0]?.moduleList.split(","),
                    reportingUser: reportingUser?.find((v) => v.id == response?.data[0]?.reporting_user_id),
                    vendorType: vendorType?.find((v) => v.partnerCategory == response?.data[0]?.vendorType),
                });
            })
            .catch((e: any) => {});
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/UserAdditionalRole/GetUserAdditionalRoleList?id=${id}`)
            .then((response: any) => {
                const result = role.map((r) => {
                    const iid = response?.data?.find((k) => k?.roleId == r?.id);
                    if (iid) {
                        return r;
                    }
                });
                setSelectedAdditionlRole(result);
            })
            .catch((e: any) => {});
           
    };

    useEffect(() => {
        if (type === 'edit') {
            // const roleData = role?.find((v) => v?.id == actionData?.roleId);
            setFieldValue('userName', actionData?.userName);
            setFieldValue('password', actionData?.password);
            setFieldValue('fullName', actionData?.userFullName);
            setFieldValue('mobileNo', actionData?.mobileNumber);
            setFieldValue('emailId', actionData?.email);
            setFieldValue('active', actionData?.isActive);
            setFieldValue('role', actionData?.roleId);
            setFieldValue('designation', actionData?.designation);
            setFieldValue('vertical', actionData?.verticalType);
            setFieldValue('reportingUser', actionData?.reporting_user_id);
            setFieldValue('vendorType', actionData?.vendorType);
            setFieldValue('defaultModule', actionData?.defaultModule);
            // setFieldValue('moduleList', actionData?.moduleList.split(","));
            setRadioButton(actionData?.userType || '');

            const foundRole = role?.find((v) => v?.id == actionData?.roleId);
            const result = {
                role: foundRole,
                designation: designation?.find((v) => v.formName == actionData?.designation),
                // vertical: vertical?.find((v) => v.verticalName == actionData?.verticalType),
                vertical:actionData?.verticalType,
                defaultModule:actionData?.defaultModule,
                // moduleList:actionData?.moduleList,
                reportingUser: reportingUser?.find((v) => v.id == actionData?.reporting_user_id),
                vendorType: vendorType?.find((v) => v.partnerCategory == actionData?.vendorType),
            };
            console.log('RoleData', result);
            setDropdowns({
                ...result,
                // role: foundRole,
            });

            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/UserAdditionalRole/GetUserAdditionalRoleList?id=${id}`)
                .then((response: any) => {
                    const result = role.map((r) => {
                        const iid = response?.data?.find((k) => k?.roleId == r?.id);
                        if (iid) {
                            return r;
                        }
                    });
                    setSelectedAdditionlRole(result?.filter((v) => v !== undefined));
                })
                .catch((e: any) => {});
        }
    }, [actionData, role, reportingUser]);

    useEffect(() => {
        getVertical();
        getDesignation();
        getReportingUser();
        getRole();
        getvendorType();
        if (type === 'edit') {
            getUserById();
        }
    }, []);
    // useEffect(() => {
    //     if (type === 'edit' && role && role?.length > 0) {
    //         getUserById();
    //     }
    // }, [role]);
    const { values, handleBlur, setFieldValue, handleChange, handleSubmit, errors, touched, resetForm } = useFormik({
        initialValues: addUserInitialValues,
        validationSchema: addUserSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values, action) => {
            const body = {
                Id: type === 'add' ? 0 : id,
                Designation: dropdowns?.designation?.formName,
                UserId: values?.userName || '',
                UserName: values?.userName || '',
                Password: values?.password || '',
                MobileNumber: values?.mobileNo?.toString() || '',
                Email: values?.emailId || '',
                IsActive: isChecked || values?.active || null,
                CreatedDate: type === 'add' ? moment().format('YYYY-MM-DDTHH:mm:ss.SSS') : actionData?.createdDate,
                CreatedUser: type === 'add' ? user?.UserName : actionData?.createdUser,
                ModifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                ModifiedUser: user?.UserName || '',
                RoleId: dropdowns?.role?.id || 0,
                VendorType: dropdowns?.vendorType?.partnerCategory || '',
                UserFullName: values?.fullName || '',
                VerticalType: dropdowns?.vertical || '',
                defaultModule: dropdowns?.defaultModule || '',
                moduleList: modulesListName.toString() || '',
                Reporting_user_id: dropdowns?.reportingUser?.id || 0,
                UserType: radioButton || '',
                EmployeeCode: empCode || '',
                uid: '',
            };
            if (type === 'edit') {
                axios
                    .post(`${process.env.REACT_APP_BASEURL}/api/User/UpdateUser`, body)
                    .then(async (response: any) => {
                        if (response) {
                            if (selectedAdditionlRole?.length > 0) {
                                let bodyRole = [];
                                for (let i = 0; i < selectedAdditionlRole?.length; i++) {
                                    bodyRole?.push({
                                        UserId: id,
                                        Id: 0,
                                        uid: '',
                                        RoleId: role?.find((k) => k?.id == selectedAdditionlRole[i]['id'])?.id,
                                        Status: 'Active',
                                        CreatedDate: type === 'add' ? moment().format('YYYY-MM-DDTHH:mm:ss.SSS') : actionData?.createdDate,
                                        CreatedUser: type === 'add' ? user?.UserName : actionData?.createdUser,
                                        ModifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                                        ModifiedUser: user?.UserName || '',
                                    });
                                }

                                await axios.post(`${process.env.REACT_APP_BASEURL}/api/UserAdditionalRole/UpdateAdditionalRoles?id=${id}`, bodyRole).then((res) => {
                                    if (res) {
                                        dispatch(showMessage('user update successfully'));
                                        action.resetForm();
                                        getReportingUser();
                                        setDropdowns({
                                            role: null,
                                            designation: null,
                                            vertical: null,
                                            reportingUser: null,
                                            vendorType: null,
                                            defaultModule:null,
                                        });
                                        setActionData({});
                                        navigate('/user-managment');
                                    }
                                });
                            } else {
                                dispatch(showMessage('user update successfully'));
                                action.resetForm();
                                getReportingUser();
                                setDropdowns({
                                    role: null,
                                    designation: null,
                                    vertical: null,
                                    reportingUser: null,
                                    vendorType: null,
                                    defaultModule:null,
                                });
                                setActionData({});
                                navigate('/user-managment');
                            }
                        }
                    })
                    .catch((e: any) => {
                        action.resetForm();
                        setDropdowns({
                            role: null,
                            designation: null,
                            vertical: null,
                            reportingUser: null,
                            vendorType: null,
                            defaultModule:null,
                        });
                        setActionData({});
                    });
            } else {
                let isApiCall: any = false;
                if (radioButton == 'Employee') {
                    await axios.get(`${process.env.REACT_APP_BASEURL}/api/User/GetUserByEmployeeCode?employeeCode=${empCode}`).then((rrr) => {
                        if (rrr?.data?.data) {
                            return dispatch(fetchError('Employee is already exists in User Master'));
                        } else {
                            isApiCall = true;
                        }
                    });
                } else {
                    await axios.get(`${process.env.REACT_APP_BASEURL}/api/User/GetUserByVendorPartnerDetails?fullName=${values?.fullName || ''}&vendorType=${dropdowns?.vendorType?.partnerCategory || ''}`).then((rrr) => {
                        if (rrr?.data?.data) {
                            return dispatch(fetchError('Vendor is already exists in User Master'));
                        } else {
                            isApiCall = true;
                        }
                    });
                }
                if (isApiCall == true) {
                    axios
                        .post(`${process.env.REACT_APP_BASEURL}/api/User/SaveUser`, body)
                        .then(async (response: any) => {
                            if (response) {
                                if (selectedAdditionlRole?.length > 0) {
                                    let bodyRole = [];
                                    for (let i = 0; i < selectedAdditionlRole?.length; i++) {
                                        bodyRole?.push({
                                            UserId: response?.data?.data?.Id || 0,
                                            Id: 0,
                                            uid: '',
                                            RoleId: role?.find((k) => k.id == selectedAdditionlRole[i]['id'])?.id,
                                            Status: 'Active',
                                            CreatedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                                            CreatedUser: user?.UserName || '',
                                            ModifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                                            ModifiedUser: user?.UserName || '',
                                        });
                                    }

                                    await axios.post(`${process.env.REACT_APP_BASEURL}/api/UserAdditionalRole/InsertAdditionalRoles?id=${response?.data?.data?.Id}`, bodyRole).then((res) => {
                                        if (res) {
                                            dispatch(showMessage('user added successfully'));
                                            action.resetForm();
                                            getReportingUser();
                                            setDropdowns({
                                                role: null,
                                                designation: null,
                                                vertical: null,
                                                reportingUser: null,
                                                vendorType: null,
                                                defaultModule:null,
                                            });
                                            setActionData({});
                                            navigate('/user-managment');
                                        }
                                    });
                                } else {
                                    dispatch(showMessage('user added successfully'));
                                    action.resetForm();
                                    getReportingUser();
                                    setDropdowns({
                                        role: null,
                                        designation: null,
                                        vertical: null,
                                        reportingUser: null,
                                        vendorType: null,
                                        defaultModule:null,
                                    });
                                    setActionData({});
                                    navigate('/user-managment');
                                }
                            } else {
                                dispatch(showMessage('user added successfully'));
                                action.resetForm();
                                getReportingUser();
                                setDropdowns({
                                    role: null,
                                    designation: null,
                                    vertical: null,
                                    reportingUser: null,
                                    vendorType: null,
                                    defaultModule:null,
                                });
                                setActionData({});
                                navigate('/user-managment');
                            }
                        })
                        .catch((e: any) => {
                            action.resetForm();
                            setDropdowns({
                                role: null,
                                designation: null,
                                vertical: null,
                                reportingUser: null,
                                vendorType: null,
                                defaultModule:null,
                            });
                            setActionData({});
                        });
                }
            }
        },
    });

    const handleSearch = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/User/${radioButton == 'Employee' ? 'GetEmployeeBySearch' : 'GetVendorPartnerBySearch'}?search=${search}`)
            .then((res) => {
                setActionData(res?.data?.[0] || []);
                setEmpCode(res?.data?.[0]?.employeeCode);
                setFieldValue('fullName', res?.data?.[0]?.firstName ? res?.data?.[0]?.firstName?.toString() + res?.data?.[0]?.lastName?.toString() : '');
                setFieldValue('mobileNo', res?.data?.[0]?.mobileNo);
                setFieldValue('emailId', res?.data?.[0]?.email);
                setFieldValue('designation', res?.data?.[0]?.designation);
                setDropdowns({
                    designation: designation?.find((v) => v.formName == actionData?.designation),
                });
            })
            .catch((e) => {});
    };
    useEffect(() => {
        if (designation?.length > 0 && type !== 'edit') {
            console.log('designation UseEffect');
            setDropdowns({
                ...dropdowns,
                designation: designation?.find((v) => v.formName == actionData?.designation),
            });
        }
    }, [designation]);
    console.log('Drop', dropdowns);
    return (
        <div>
            <Box component="h2" className="page-title-heading my-6">
                {type === 'add' ? 'Add' : 'Update'} User
            </Box>

            <div
                className="card-panal"
                style={{
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    height: '83vh',
                    padding: '10px',
                }}
            >
                <form>
                    <div className="phase-outer">
                        <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center">
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <RadioGroup aria-labelledby="demo-controlled-radio-buttons-group" name="controlled-radio-buttons-group" value={radioButton} onChange={handleRadioChange} style={{ display: 'flex', flexDirection: 'row' }}>
                                        <FormControlLabel value="Employee" control={<Radio />} label="Employee" />
                                        <FormControlLabel value="Vendor" control={<Radio />} label="Vendor" />
                                    </RadioGroup>
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form" style={{ display: 'flex', alignItems: 'center' }}>
                                    <TextField
                                        autoComplete="off"
                                        placeholder={radioButton == 'Employee' ? 'search by employee code' : 'search by vendor name'}
                                        type="text"
                                        name="search"
                                        id="search"
                                        variant="outlined"
                                        size="small"
                                        className="w-85"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                        }}
                                    />
                                    <Button style={primaryButtonSm} sx={{ height: '100%', marginLeft: '5px' }} onClick={() => handleSearch()} type="button">
                                        Search
                                    </Button>
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}></Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}></Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">User Name</h2>
                                    <TextField
                                        autoComplete="off"
                                        type="text"
                                        name="userName"
                                        id="userName"
                                        variant="outlined"
                                        size="small"
                                        className="w-85"
                                        value={values.userName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        // onKeyDown={(e: any) => {
                                        //   regExpressionTextField(e);
                                        // }}
                                    />
                                    {touched.userName && errors.userName ? <p className="form-error">{errors.userName}</p> : null}
                                </div>
                            </Grid>

                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Password</h2>
                                    <TextField
                                        autoComplete="off"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        id="password"
                                        variant="outlined"
                                        size="small"
                                        className="w-85"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        // onKeyDown={(e: any) => {
                                        //   regExpressionTextField(e);
                                        // }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} style={{ width: '25px' }}>
                                                        {showPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    {touched.password && errors.password ? <p className="form-error">{errors.password}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Full Name</h2>
                                    <TextField
                                        autoComplete="off"
                                        type="text"
                                        name="fullName"
                                        id="fullName"
                                        variant="outlined"
                                        size="small"
                                        className="w-85"
                                        value={values.fullName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                        }}
                                    />
                                    {touched.fullName && errors.fullName ? <p className="form-error">{errors.fullName}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Mobile No.</h2>
                                    <TextField
                                        autoComplete="off"
                                        type="number"
                                        name="mobileNo"
                                        id="mobileNo"
                                        variant="outlined"
                                        size="small"
                                        className="w-85"
                                        value={values.mobileNo}
                                        onChange={(e: any) => (e.target.value?.length > 10 ? e.preventDefault() : handleChange(e))}
                                        onBlur={handleBlur}
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                            blockInvalidChar(e);
                                        }}
                                    />
                                    {touched.mobileNo && errors.mobileNo ? <p className="form-error">{errors.mobileNo}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Email Id</h2>
                                    <TextField
                                        autoComplete="off"
                                        type="email"
                                        name="emailId"
                                        id="emailId"
                                        variant="outlined"
                                        size="small"
                                        className="w-85"
                                        value={values.emailId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        onKeyDown={(e: any) => {
                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                            if (e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                    {touched.emailId && errors.emailId ? <p className="form-error">{errors.emailId}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Primary Role</h2>
                                    <Autocomplete
                                        style={{ zIndex: 9999999 }}
                                        disablePortal={false}
                                        id="combo-box-demo"
                                        getOptionLabel={(option: any) => {
                                            return option?.role_Name?.toString() || '';
                                        }}
                                        disableClearable
                                        options={role || []}
                                        onBlur={handleBlur}
                                        onChange={(e, value: any) => {
                                            {
                                                setDropdowns({ ...dropdowns, role: value });
                                                setFieldValue('role', value?.id);
                                            }
                                        }}
                                        placeholder="Document Type"
                                        value={dropdowns?.role || null}
                                        renderInput={(params) => (
                                            <TextField
                                                name="role"
                                                id="role"
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
                                    {touched.role && errors.role ? <p className="form-error">{errors?.role}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Designation</h2>
                                    <Autocomplete
                                        style={{ zIndex: 9999999 }}
                                        disablePortal={false}
                                        id="combo-box-demo"
                                        getOptionLabel={(option: any) => {
                                            return option?.formName?.toString() || '';
                                        }}
                                        disableClearable
                                        options={designation || []}
                                        onBlur={handleBlur}
                                        onChange={(e, value: any) => {
                                            {
                                                setDropdowns({ ...dropdowns, designation: value });
                                                setFieldValue('designation', value?.id);
                                            }
                                        }}
                                        placeholder="Document Type"
                                        value={dropdowns?.designation || null}
                                        renderInput={(params) => (
                                            <TextField
                                                name="designation"
                                                id="designation"
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
                                    {touched.designation && errors.designation ? <p className="form-error">{errors?.designation}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable ">Admin Vertical </h2>
                                    <Autocomplete
                                        style={{ zIndex: 9999999 }}
                                        disablePortal={false}
                                        id="combo-box-demo"
                                        getOptionLabel={(option: any) => {
                                            return option?.toString() || '';
                                        }}
                                        disableClearable
                                        options={adminVerticalList || []}
                                        onBlur={handleBlur}
                                        onChange={(e, value: any) => {
                                            {
                                                setDropdowns({ ...dropdowns, vertical: value });
                                                setFieldValue('vertical', value);
                                            }
                                        }}
                                        placeholder="Document Type"
                                        value={dropdowns?.vertical || null}
                                        renderInput={(params) => (
                                            <TextField
                                                name="vertical "
                                                id="vertical "
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
                                    {touched.vertical && errors.vertical ? <p className="form-error">{errors?.vertical}</p> : null}
                                </div>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable ">Reporting User</h2>
                                    <Autocomplete
                                        style={{ zIndex: 9999999 }}
                                        disablePortal={false}
                                        id="combo-box-demo"
                                        getOptionLabel={(option: any) => {
                                            return option?.userName?.toString() || '';
                                        }}
                                        disableClearable
                                        options={reportingUser || []}
                                        onBlur={handleBlur}
                                        onChange={(e, value: any) => {
                                            {
                                                setDropdowns({ ...dropdowns, reportingUser: value });
                                                setFieldValue('reportingUser', value?.id);
                                            }
                                        }}
                                        placeholder="Document Type"
                                        value={dropdowns?.reportingUser || null}
                                        renderInput={(params) => (
                                            <TextField
                                                name="reportingUser"
                                                id="reportingUser"
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
                                    <h2 className="phaseLable ">Vendor Type</h2>
                                    <Autocomplete
                                        style={{ zIndex: 9999999 }}
                                        disablePortal={false}
                                        id="combo-box-demo"
                                        getOptionLabel={(option: any) => {
                                            return option?.partnerCategory?.toString() || '';
                                        }}
                                        disableClearable
                                        options={vendorType || []}
                                        onBlur={handleBlur}
                                        onChange={(e, value: any) => {
                                            {
                                                setDropdowns({ ...dropdowns, vendorType: value });
                                                setFieldValue('vendorType', value?.id);
                                            }
                                        }}
                                        placeholder="Document Type"
                                        value={dropdowns?.vendorType || null}
                                        renderInput={(params) => (
                                            <TextField
                                                name="vendorType"
                                                id="vendorType"
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
                            <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable ">Additional Roles</h2>
                                    <Autocomplete
                                        multiple
                                        limitTags={2}
                                        style={{ zIndex: 9999999 }}
                                        disablePortal={false}
                                        id="combo-box-demo"
                                        getOptionLabel={(option: any) => {
                                            return option?.role_Name?.toString() || '';
                                        }}
                                        disableClearable
                                        options={role || []}
                                        onBlur={handleBlur}
                                        onChange={(e, value: any) => {
                                            {
                                                setSelectedAdditionlRole(value);
                                            }
                                        }}
                                        placeholder="Document Type"
                                        value={selectedAdditionlRole || []}
                                        renderInput={(params) => (
                                            <TextField
                                                name="vendorType"
                                                id="vendorType"
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
                                    <h2 className="phaseLable ">Default Modules</h2>
                                    <Autocomplete
                                        style={{ zIndex: 9999999 }}
                                        disablePortal={false}
                                        id="combo-box-demo"
                                        getOptionLabel={(option: any) => {
                                            return option?.toString() || '';
                                        }}
                                        disableClearable
                                        options={modulesList || []}
                                        onBlur={handleBlur}
                                        onChange={(e, value: any) => {
                                            {
                                                setDropdowns({ ...dropdowns, defaultModule: value });
                                                setFieldValue('defaultModule', value);
                                            }
                                        }}
                                        placeholder="Document Type"
                                        value={dropdowns?.defaultModule || null}
                                        renderInput={(params) => (
                                            <TextField
                                                name="defaultModule "
                                                id="defaultModule "
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
                                    <h2 className="phaseLable ">Modules Permission </h2>
                                    <Autocomplete
                                        multiple
                                        limitTags={2}
                                        style={{ zIndex: 9999999 }}
                                        disablePortal={false}
                                        id="combo-box-demo"
                                        getOptionLabel={(option: any) => {
                                            return option?.toString() || '';
                                        }}
                                        disableClearable
                                        options={modulesList || []}
                                        onBlur={handleBlur}
                                        onChange={(e, value: any) => {
                                            {
                                                console.log('value',value)
                                                setModuleslListName(value)
                                                // setDropdowns({ ...dropdowns, moduleList : value });
                                                // setFieldValue('moduleList', value);
                                            }
                                        }}
                                        placeholder="Document Type"
                                        value={modulesListName || []}
                                        renderInput={(params) => (
                                            <TextField
                                                name="moduleList "
                                                id="moduleList "
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
                                    <h2 className="phaseLable">Employee Code</h2>
                                    <TextField
                                        autoComplete="off"
                                        type="text"
                                        name="empCode"
                                        disabled
                                        id="empCode"
                                        variant="outlined"
                                        size="small"
                                        className="w-85"
                                        value={empCode || ''}
                                        onBlur={handleBlur}
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                        }}
                                    />
                                </div>
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                md={3}
                                sx={{
                                    position: 'relative',
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >
                                <div className="input-form">
                                    <FormControlLabel control={<Checkbox checked={isChecked} onChange={(e) => {handleActiveChange(e);
                                    }
                                } />} label="Active User" className="mb-2" name="active" />
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {type !== 'edit' && (
                            <Button
                                className="no-btn"
                                sx={{ marginRight: '5px' }}
                                onClick={() => {
                                    resetForm();
                                    setActionData({});
                                    setSearch('');
                                    setEmpCode('');
                                    setDropdowns({
                                        role: null,
                                        designation: null,
                                        vertical: null,
                                        reportingUser: null,
                                        vendorType: null,
                                    });
                                }}
                            >
                                Reset
                            </Button>
                        )}
                        <Button style={primaryButtonSm} sx={{ height: '30px', marginLeft: '5px' }} onClick={() => handleSubmit()}>
                            {type === 'edit' ? 'Update' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUser;
