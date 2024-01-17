// import React from "react";
import { Box, Button, Autocomplete, Dialog, DialogActions, DialogContent, DialogTitle, Grid, createFilterOptions, Typography, MenuItem, Tooltip, Stack } from '@mui/material';
import { useFormik } from 'formik';
import TextField from '@mui/material/TextField';
import { accordionTitle, toggleTitle, imageCard, secondaryButton, toggleTitle1 } from 'shared/constants/CustomColor';
import logoImage from '../../../assets/images/AssetImg.png';
import Select from '@mui/material/Select';
import HistoryIcon from '@mui/icons-material/History';
import BranchMasterTimelineHistory from 'pages/common-components/BranchMasterInfo/BranchMasterTimelineHistory';
import { TbPencil } from 'react-icons/tb';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { fetchError, showMessage } from 'redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { updateMandateInitialValues, updateMandateSchema } from '@uikit/schemas';
import regExpressionTextField, { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';
import moment from 'moment';
import { useLocation, useParams } from 'react-router-dom';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import BranchModal from 'pages/auth/AssetManagement/BranchModal';
// import { SHOW_MESSAGE } from 'types/actions/Common/actions';
import EmailIcon from '@mui/icons-material/Email';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ContactsIcon from '@mui/icons-material/Contacts';
import { AppState } from 'redux/store';
import ApproveAndRejectAction from 'pages/common-components/ApproveReject';
import ValidateReject from 'pages/common-components/ValidateReject';
import workflowFunctionAPICall from 'pages/Mandate/workFlowActionFunction';
import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';

const spocTitle = ['FPR', 'Admin SPOC', 'ESC LEVEL 01', 'ESC LEVEL 02', 'ESC LEVEL 03', 'CFA', 'Vertical Head'];
const BranchMaster = () => {
    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const [remark, setRemark] = useState('');
    const [sendBack, setSendBack] = React.useState(false);
    const [approved, setApproved] = React.useState(false);
    const [branchMasterAction, setBranchMasterAction] = React.useState(null);
    const [dropDownDataList, setDropDownDataList] = React.useState<any>([]);
    const [open, setOpen] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [projectManagerData, setProjectManagerData] = React.useState(null);
    // const [stateDropdown, setStateDropdown] = useState([]);
    const [roleList, setRoleList] = useState<any>([]);
    const [spocEmptyTitle, setSpocEmptyTitle] = React.useState([]);
    const [role, setRole] = React.useState(null);
    const dispatch = useDispatch();
    const [userListByRole, setUserListByRole] = useState([]);
    const [currentUser, setCurrentUser] = React.useState(null);
    const [newUser, setNewUser] = React.useState(null);
    const [employeeCode, setEmployeeCode] = useState('');
    const [fullName, setFullName] = useState('');
    const [emailId, setEmailId] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [nation, setDesignation] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [cardData, setCardData] = useState({});
    const [dialogTitle, setDialogTitle] = useState('');
    const [cardId, setCardId] = useState('');
    const [formData, setFormData] = useState({});
    const [editFlag, setEditFlag] = useState(false);
    const [assetDataById, setAssetDataById] = useState([]);
    const [apiCalled, setApiCalled] = useState(false);
    const [getPassId, setGetPassId] = useState('');
    const [SPOCdata, setSPOCdata] = useState({});
    const [tableData, setTableData] = React.useState<any>([]);
    const [phaseList, setPhaseList] = React.useState([]);
    const [phaseId, setPhaseId] = useState(null);
    const { phaseid, mandateId } = useParams();
    const [mandateList, setMandateList] = React.useState([]);
    const { id } = useParams();
    const [countryList, setCountryList] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [districtList, setDistrictList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [tierList, setTierList] = useState([]);
    const [adminVerticalListName, setadminVerticalListName] = useState([]);
    const [gLCategoryName, SetGLCategoryName] = useState([]);
    const [BranchTypeName, setBranchTypeName] = useState([]);
    const [PremiseType, setPremiseType] = useState([]);
    const [verticalName, setVerticalName] = useState([]);
    const [floornumber, setFloornumber] = useState([]);
    const [propertyType, setPropertyType] = useState([]);
    const [dateError, setDateError] = useState<any>('');
    const [selectedMandateId, setSelectedMandateId] = useState(null);
    const date = new Date();
    const [value, setValue] = React.useState(moment(date).format());
    const [selectedPhaseId, setSelectedPhaseId] = useState('');
    const [selectedIdOnEdit, setSelectedIdOnEdit] = useState('');
    const navigate = useNavigate();
    const [cardFirst, setCardFirst] = useState([]);
    const { user } = useAuthUser();
    const [spoc, setSpoc] = useState({});
    const [locationCode, setLocationCode] = useState('');
    const [spocDetails, setSpocDetails] = useState([]);
    // const action = branchMasterAction?.action || '';
    // const { branchMasterActionList } = useSelector<AppState, AppState['branchMasterAction']>(({ branchMasterAction }) => branchMasterAction);
    const location = useLocation();
    const apiType = location?.state?.apiType || '';
    const action = location?.state?.action || '';
    const runtimeId = branchMasterAction?.runtimeId || 0;
    const [flag, setFlag] = useState(false);
    const [selectedPhaseCode, setSelectedPhaseCode] = useState('');
    // const isMountedOne = useRef(false);
    // const isMountedTwo = useRef(false);
    // const isMountedThree = useRef(false);
    // const isMountedFour = useRef(false);
    const handleCancelChanges = () => {
        // Close the dialog without saving changes
        setOpen(false);
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({});
    };
    useEffect(() => {
        if (!apiCalled && id !== undefined && id) {
            axios.get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterDetails?id=${id}`).then((response: any) => {
                //const responseData = response?.data.find((item) => item.id == id); response.data[0];
                console.log('222', response);
                const responseData = response?.data[0];
                setLocationCode(responseData?.locationCode || '');
                setSelectedIdOnEdit(responseData?.id || '');
                setFieldValue('locationCode', responseData?.locationCode);
                setFieldValue('phaseCode', responseData?.phaseCode);
                setFieldValue('mandateCode', responseData?.mandateCode);
                //setFieldValue('goLiveDate', responseData?.goLiveDate);
                setFieldValue('goLiveDate', moment(responseData?.goLiveDate).format().toString());
                setFieldValue('address', responseData?.address);
                setFieldValue('adminVertical', responseData?.adminVertical);
                setFieldValue('branchACType', responseData?.branchACType);
                setFieldValue('branchAdmin', responseData?.branchAdmin);
                setFieldValue('branchRegionalManager', responseData?.branchRegionalManager);
                setFieldValue('branchType', responseData?.branchType);
                setFieldValue('branch_Code', responseData?.branch_Code);
                // setFieldValue('branch_Name', responseData?.branch_Name);
                setFieldValue('branch_SPOC', responseData?.branch_SPOC);
                setFieldValue('branch_SPOC_Email', responseData?.branch_SPOC_Email);
                setFieldValue('branch_SPOC_Phone', responseData?.branch_SPOC_Phone);
                setFieldValue('buildingConstructedInYear', responseData?.buildingConstructedInYear);
                setFieldValue('buildingName', responseData?.buildingName);
                setFieldValue('carpetArea', responseData?.carpetArea);
                setFieldValue('chargeableArea', responseData?.chargeableArea);
                setFieldValue('City', responseData?.city);
                setFieldValue('clustorManager', responseData?.clustorManager);
                setFieldValue('constructedArea', responseData?.constructedArea);
                setFieldValue('contact_Person', responseData?.contact_Person);
                setFieldValue('contact_Person_Email', responseData?.contact_Person_Email);
                setFieldValue('contact_Person_Phone', responseData?.contact_Person_Phone);
                setFieldValue('Country', responseData?.country);
                setFieldValue('createdBy', responseData?.createdBy);
                setFieldValue('createdDate', responseData?.createdDate);
                setFieldValue('fk_Branch_Admin', responseData?.fk_Branch_Admin);
                setFieldValue('fk_Branch_Regional_Manager', responseData?.fk_Branch_Regional_Manager);
                setFieldValue('fk_Clustor_Manager_id', responseData?.fk_Clustor_Manager_id);
                setFieldValue('fk_Location_Coordinator', responseData?.fk_Location_Coordinator);
                setFieldValue('floor', responseData?.floor);
                setFieldValue('geoVertical', responseData?.geoVertical);
                setFieldValue('goldOrNonGold', responseData?.goldOrNonGold);
                setFieldValue('id', responseData?.id);
                setFieldValue('latitude', responseData?.latitude);
                setFieldValue('locationCoordinator', responseData?.locationCoordinator);
                setFieldValue('branch_Name', responseData?.branch_Name);
                setFieldValue('longitude', responseData?.longitude);
                setFieldValue('modifiedBy', responseData?.modifiedBy);
                setFieldValue('modifiedDate', responseData?.modifiedDate);
                setFieldValue('parentLocationCode', responseData?.parentLocationCode);
                setFieldValue('pennantCode', responseData?.pennantCode);
                setFieldValue('pincode', responseData?.pincode);
                setFieldValue('premiseType', responseData?.premiseType);
                setFieldValue('propertyType', responseData?.propertyType);
                setFieldValue('region', responseData?.region);
                setFieldValue('sapLocationCode', responseData?.sapLocationCode);
                setFieldValue('sapNewLocationCode', responseData?.sapNewLocationCode);
                setFieldValue('State', responseData?.state);
                setFieldValue('District', responseData?.district);
                setFieldValue('status', responseData?.status);
                setFieldValue('subAdminVertical', responseData?.subAdminVertical);
                setFieldValue('tier', responseData?.tier);
                setFieldValue('uid', responseData?.uid);
                setFieldValue('zone', responseData?.zone);
            });
        }
    }, [id, apiCalled, phaseId, mandateId, flag]);

    useEffect(() => {
        if (!apiCalled && id !== 'noid' && id) {
            axios.get(`${process.env.REACT_APP_BASEURL}/api/BranchMasterSPOC/GetBranchMasterSPOCDetails?LocationCode=${locationCode}`).then((response: any) => {
                const transformedData = {};
                response.data.forEach((item) => {
                    transformedData[item.spocType] = item;
                });
                console.log('transformedData', transformedData, response);
                // setSPOCdata(transformedData);
                setSpoc(transformedData);
            });
        }
    }, [id, apiCalled, locationCode]);

    const styling = {
        marginTop: '5px',
        marginBottom: '5px',
    };

    const GetBranchMasterView = async (phaseId, mandateId) => {
        console.log('111HHH', phaseId, mandateId);
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterView?phaseId=${phaseId}&mandateId=${mandateId}`)
            .then((response: any) => {
                if (response && response?.data && response?.data?.length > 0) {
                    setDropDownDataList(response?.data);
                    setMandateList(response?.data);
                    const resData = response?.data;
                    setTableData(response?.data);
                    const uniquePhaseCode = Array.from(new Set(response.data.map((data) => data.phasecode)));
                    const uniqueCountries = Array.from(new Set(response.data.map((data) => data.Country)));
                    const uniqueState = Array.from(new Set(response.data.map((data) => data.State)));
                    const uniqueDistrict = Array.from(new Set(response.data.map((data) => data.District)));
                    const uniqueCity = Array.from(new Set(response.data.map((data) => data.City)));
                    const uniqueTier = Array.from(new Set(response.data.map((data) => data.tier)));
                    const uniqueAdminVertical = Array.from(new Set(response.data.map((data) => data.adminVertical)));
                    const uniqueGLCategoryName = Array.from(new Set(response.data.map((data) => data.goldOrNonGold)));
                    const uniqueBranchTypeName = Array.from(new Set(response.data.map((data) => data.branchType)));
                    const uniquePremiseType = Array.from(new Set(response.data.map((data) => data.PremiseType)));
                    const uniqueFloorNumber = Array.from(new Set(response.data.map((data) => data.floor)));
                    const uniquePropertyType = Array.from(new Set(response.data.map((data) => data.PropertyType)));

                    setPhaseList(uniquePhaseCode);
                    setStateList(uniqueState);
                    setCountryList(uniqueCountries);
                    setDistrictList(uniqueDistrict);
                    setCityList(uniqueCity);
                    setTierList(uniqueTier);
                    setadminVerticalListName(uniqueAdminVertical);
                    SetGLCategoryName(uniqueGLCategoryName);
                    setBranchTypeName(uniqueBranchTypeName);
                    setPremiseType(uniquePremiseType);
                    setFloornumber(uniqueFloorNumber);
                } else {
                    setTableData([]);
                    setDropDownDataList([]);
                }
            })
            .catch((e: any) => {});
    };
    useEffect(() => {
        GetBranchMasterView(0, 0);
    }, []);

    const getBrachMasterWithPhaseId = async (phaseId) => {
        console.log('222HHH', phaseId, mandateId);
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterView?phaseId=${phaseId}&mandateId=0`)
            .then((response: any) => {
                if (response && response?.data && response?.data?.length > 0) {
                    const filteredMandateList = response.data.filter((item) => item?.phasecode === values?.phaseCode);

                    setDropDownDataList(response?.data);
                    setMandateList(filteredMandateList);
                } else {
                    setTableData([]);
                    setDropDownDataList([]);
                }
            })
            .catch((e: any) => {});
    };
    // 2nd changes
    const getBrachMasterWithPhaseIdAndMandateId = async (phaseId, mandateId) => {
        console.log('333HHH', phaseId, mandateId);
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterView?phaseId=${phaseId}&mandateId=${mandateId}`)
            .then((response: any) => {
                if (response && response?.data && response?.data?.length > 0) {
                    setDropDownDataList(response?.data);
                    const resDataFromMandate = response?.data[0];
                    // setFieldValue('locationCode', resDataFromMandate?.locationCode);
                    setFieldValue('adminVertical', resDataFromMandate?.adminVertical);
                    setFieldValue('buildingConstructedInYear', Object.keys(resDataFromMandate?.buildingConstructedInYear).length == 0 ? '' : resDataFromMandate?.buildingConstructedInYear);
                    setFieldValue('branch_Code', resDataFromMandate?.branch_Code);
                    setFieldValue('constructedArea', resDataFromMandate?.constructedArea);
                    setFieldValue('branchType', resDataFromMandate?.branchType);
                    setFieldValue('buildingName', resDataFromMandate?.buildingName);
                    setFieldValue('City', resDataFromMandate?.City);
                    setFieldValue('Country', resDataFromMandate?.Country);
                    setFieldValue('District', resDataFromMandate?.District);
                    setFieldValue('goldOrNonGold', resDataFromMandate?.goldOrNonGold);
                    setFieldValue('pincode', resDataFromMandate?.pincode);
                    setFieldValue('State', resDataFromMandate?.State);
                    setFieldValue('tier', resDataFromMandate?.tier);
                    setFieldValue('address', resDataFromMandate?.address);
                    setFieldValue('chargeableArea', resDataFromMandate?.chargeableArea);
                    setFieldValue('floor', resDataFromMandate?.floor);
                    setFlag(true);
                } else {
                    // setTableData([]);
                    setDropDownDataList([]);
                }
            })
            .catch((e: any) => {});
    };

    // React.useEffect(() => {
    //     var branchAction = null;
    //     if (branchMasterActionList?.length > 0) {
    //         branchAction = branchMasterActionList && branchMasterActionList?.find((item) => item?.mandateId === parseInt(id) && item?.module === module);
    //         setBranchMasterAction(branchAction);
    //     }
    // }, [id, branchMasterActionList]);
    const handleGetPassDate = (newValue) => {
        if (newValue !== null && dayjs(newValue).isValid()) {
            setDateError('');
            setValue(moment(new Date(newValue)).format());
            setFieldValue('goLiveDate', moment(new Date(newValue)).format().toString());
        } else {
            setDateError('please enter valid date');
        }
    };
    const handleClickOpen = (title) => {
        if (!values.locationCode) {
            return;
        }

        setDialogTitle(title);
        setOpen(true);
    };
    const handleSpocSubmit = (val) => {
        const temp = spoc[dialogTitle] !== undefined ? { ...val, id: spoc[dialogTitle].id || 0 } : { ...val, id: 0 };
        const setVal = { ...spoc, [dialogTitle]: temp };
        const newArray = spocEmptyTitle.filter((item) => item !== dialogTitle);
        setSpocEmptyTitle(newArray);
        setSPOCdata({ ...SPOCdata, [dialogTitle]: temp });
        setSpoc(setVal);
        setOpen(false);
    };
    const addErrorMessages = Yup.object({
        locationCode: Yup.string().required('Please enter Location Code'),
        branch_Name: Yup.string().required('Please enter Location Name'),
        branch_Code: Yup.string().required('Please enter Pennant Code'),
        // phaseCode: Yup.string().required("Please select Phase Code"),
        phaseCode: Yup.string().nullable().required('Please select Phase Code'),
        mandateCode: Yup.string().required('Please select Mandate Code'),
        zone: Yup.string().required('Please enter zone'),
        pincode: Yup.string().required('Please enter Pin Code'),
        Country: Yup.string().required('Please select Country'),
        State: Yup.string().required('Please select State'),
        District: Yup.string().required('Please select District'),
        City: Yup.string().required('Please select City'),
        tier: Yup.string().required('Please select Tier'),
        adminVertical: Yup.string().required('Please select Admin Vertical'),
        subAdminVertical: Yup.string().required('Please enter Sub Admin Vertical'),
        goldOrNonGold: Yup.string().required('Please select Gold/Non-Gold'),
        branchType: Yup.string().required('Please enter Branch Type'),
        address: Yup.string().required('Please select Branch Address'),
        buildingName: Yup.string().required('Please enter Building Name'),
        chargeableArea: Yup.string().required('Please enter Chargeable Area(SFT)'),
        carpetArea: Yup.string().required('Please enter Carpet Area'),
        constructedArea: Yup.string().required('Please enter Constructed Area(SFT)'),
        floor: Yup.string().required('Please select Floor'),
        buildingConstructedInYear: Yup.string().required('Please enter Building Constructed In Year'),
        sapLocationCode: Yup.string().required('Please enter SAP Location Code'),
        sapNewLocationCode: Yup.string().required('Please enter SAP New Location Code'),
        branchACType: Yup.string().required('Please enter Branch AC Type'),
        latitude: Yup.string().required('Please enter Latitude'),
        longitude: Yup.string().required('Please enter Longitude'),
        parentLocationCode: Yup.string().required('Please enter Parent Location Code'),
        goLiveDate: Yup.string().required('Please select Go Live Date'),
    });

    const { values, setValues, handleBlur, handleChange, setFieldValue, handleSubmit, errors, touched, setFieldError, setFieldTouched, resetForm } = useFormik({
        initialValues: {
            // branchMaster: '',
            mandateId: 0,
            selectedPhaseId: '',
            branch_Name: '',
            branch_Code: '',
            locationCode: '',
            zone: '',
            pincode: '',
            subAdminVertical: '',
            address: '',
            buildingName: '',
            chargeableArea: '',
            carpetArea: '',
            constructedArea: '',
            buildingConstructedInYear: '',
            sapLocationCode: '',
            sapNewLocationCode: '',
            branchACType: '',
            latitude: '',
            longitude: '',
            parentLocationCode: '',
            goLiveDate: '',
            City: '',
            Country: '',
            State: '',
            District: '',
            verticalName: '',
            propertyType: '',
            mandateCode: '',
            phaseCode: '',
            adminVertical: '',
            goldOrNonGold: '',
            branchType: '',
            premiseType: '',
            floor: '',
            tier: '',
            status: '',
        },
        validationSchema: addErrorMessages,
        validateOnChange: true,
        validateOnBlur: false,
        onSubmit: (values, action) => {
            const arr = { ...spoc, ...SPOCdata };
            if (Object.keys(arr).length !== spocTitle.length) {
                const temp = Object.keys(arr);
                const EmptyTitle = [];
                spocTitle?.map((item) => {
                    console.log('@@', item);
                    if (!temp.includes(item)) EmptyTitle.push(item);
                });

                console.log('999', spocTitle, EmptyTitle);
                setSpocEmptyTitle(EmptyTitle);
                dispatch(fetchError('Please add all cards of SPOC Details'));
                return;
            }
            console.log('444', values, values?.buildingConstructedInYear);
            const body = {
                uid: '',
                id: id === undefined ? 0 : id,
                // branchMaster: '',
                mandateCode: values.mandateCode,
                phaseCode: values.phaseCode,
                branch_Name: values?.branch_Name,
                branch_Code: values?.branch_Code,
                locationCode: values?.locationCode,
                zone: values?.zone,
                pincode: values?.pincode,
                subAdminVertical: values?.subAdminVertical,
                address: values?.address,
                buildingName: values?.buildingName,
                chargeableArea: values?.chargeableArea,
                carpetArea: values?.carpetArea,
                constructedArea: values?.constructedArea,
                buildingConstructedInYear: values?.buildingConstructedInYear.toString(),
                sapLocationCode: values?.sapLocationCode,
                sapNewLocationCode: values?.sapNewLocationCode,
                branchACType: values?.branchACType,
                latitude: values?.latitude,
                longitude: values?.longitude,
                parentLocationCode: values?.parentLocationCode,
                goLiveDate: moment(values.goLiveDate).format('YYYY-MM-DDTHH:mm:ss.SSS') || null,
                City: values?.City,
                Country: values?.Country,
                State: values?.State,
                District: values?.District,
                tier: values?.tier,
                verticalName: values?.verticalName,
                propertyType: values.propertyType,
                premiseType: values.premiseType,
                adminVertical: values.adminVertical,
                goldOrNonGold: values.goldOrNonGold,
                branchType: values.branchType,
                floor: values.floor.toString(),
                createdBy: user?.UserName || 'Admin',
                createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                status: id === undefined ? 'Open' : 'Reopen',
            };
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/branchmaster/InsertUpdateBranchMaster`, body)
                .then((response: any) => {
                    if (!response) {
                        dispatch(fetchError('Branch master name not updated'));
                        setOpen(false);
                        return;
                    }
                    if (response && response?.data?.code === 200) {
                        const successMessage = response.data.message;

                        dispatch(showMessage(successMessage));
                        // 2nd api  ----------------------

                        const spocDetails = [];
                        for (const spocType in SPOCdata) {
                            if (SPOCdata.hasOwnProperty(spocType)) {
                                const spocObject = SPOCdata[spocType];
                                console.log('555', SPOCdata);
                                const newSpocDetail = {
                                    id: spocObject?.id === undefined ? 0 : spocObject?.id,
                                    uid: 'string',
                                    locationCode: values?.locationCode,
                                    spocType: spocType,
                                    roleName: spocObject.roleName,
                                    Username: spocObject.userName,
                                    employeeName: spocObject.employeeName,
                                    employeeid: spocObject.employeeId,
                                    designation: spocObject.designation,
                                    emailid: spocObject.emailid,
                                    contact: spocObject.contact,
                                    createdBy: user?.UserName || 'Admin',
                                    createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                                    modifiedBy: user?.UserName,
                                    modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                                };
                                spocDetails.push(newSpocDetail);
                            }
                        }

                        axios
                            .post(`${process.env.REACT_APP_BASEURL}/api/BranchMasterSPOC/InsertUpdateBranchMasterSPOC`, spocDetails)
                            .then((spocResponse: any) => {
                                if (!spocResponse) {
                                    return;
                                }
                                // dispatch(SHOW_MESSAGE('Branch Master Updated Successfully'));
                            })
                            .catch((spocError: any) => {
                                console.error('Second API Error:', spocError);
                            });
                        // --------------------------
                        setOpen(false);
                        navigate('/branchMasterList');
                        navigate('/branchMasterList');
                        return;
                    } else {
                        dispatch(fetchError('Location Code already exists'));
                        setOpen(false);
                        navigate('/branchMasterList');
                        navigate('/branchMasterList');
                        return;
                    }
                })
                .catch((e: any) => {
                    setOpen(false);
                    dispatch(fetchError('Error Occurred !'));
                });
            setTimeout(() => {
                action.resetForm();
            }, 400);
        },
    });
    useEffect(() => {
        if (values.phaseCode) {
            const phaseData = tableData && tableData.find((item) => item.phasecode === values.phaseCode);
            if (phaseData) {
                getBrachMasterWithPhaseId(phaseData.phaseid);
                setFieldValue('selectedPhaseId', phaseData?.id || '');
                setSelectedPhaseId(phaseData?.phaseid || '');
                setSelectedIdOnEdit(phaseData?.id || '');
            }
        }
    }, [values.phaseCode, tableData, selectedIdOnEdit]);

    useEffect(() => {
        if (values.phaseCode) {
            const phaseData = tableData && tableData.find((item) => item.phasecode === values.phaseCode);
            if (phaseData) {
                getBrachMasterWithPhaseId(phaseData.phaseid);
                setFieldValue('selectedPhaseId', phaseData?.id || '');
                setSelectedPhaseId(phaseData?.phaseid || '');
            }
        }
    }, [values.phaseCode]);

    // useEffect(() => {
    //     if (values.mandateCode) {
    //         const mandateCodeData = mandateList && mandateList.find((item) => item.MandateCode === values.mandateCode);
    //         const selectedMandateId = mandateCodeData?.mandateid;
    //         // if (isMountedTwo.current) {
    //             getBrachMasterWithPhaseIdAndMandateId(selectedPhaseId, mandateCodeData?.mandateid);
    //         // } else {
    //         //     isMountedTwo.current = true;
    //         // }
    //     }
    // }, [values.mandateCode, selectedPhaseId]);
    // 1st changes
    useEffect(() => {
        if (values.mandateCode && id == undefined) {
            const mandateCodeData = mandateList && mandateList.find((item) => item.MandateCode === values.mandateCode);
            const selectedMandateId = mandateCodeData?.mandateid;
            getBrachMasterWithPhaseIdAndMandateId(selectedPhaseId, mandateCodeData?.mandateid);
        }
    }, [values.mandateCode, selectedPhaseId]);

    useEffect(() => {
        const selectedMandate = dropDownDataList[0];

        if (selectedMandate && values.mandateCode && values.phaseCode && id == undefined) {
            console.log('111', selectedMandate);
            setFieldValue('branch_Name', selectedMandate.locationCode);
            setFieldValue('City', selectedMandate.City);
            setFieldValue('zone', selectedMandate.Region);
            setFieldValue('Country', selectedMandate.Country);
            setFieldValue('pincode', selectedMandate.pincode);
            setFieldValue('State', selectedMandate.State);
            setFieldValue('District', selectedMandate.District);
            setFieldValue('tier', selectedMandate.tier);
            setFieldValue('adminVertical', selectedMandate.adminVertical);
            // setFieldValue('subAdminVertical', selectedMandate.subAdminVertical);
            // setFieldValue('goLiveDate', selectedMandate.Go_Live_Date.toString());
            setFieldValue('address', selectedMandate.address);
            // setFieldValue('branchACType', selectedMandate.branchACType);
            setFieldValue('branchAdmin', selectedMandate.branchAdmin);
            setFieldValue('branchRegionalManager', selectedMandate.branchRegionalManager);
            setFieldValue('branchType', selectedMandate.branchType);
            setFieldValue('branch_Code', selectedMandate.branch_Code);
            // setFieldValue('branch_Name', selectedMandate.branch_Name);
            setFieldValue('branch_SPOC', selectedMandate.branch_SPOC);
            setFieldValue('branch_SPOC_Email', selectedMandate.branch_SPOC_Email);
            setFieldValue('branch_SPOC_Phone', selectedMandate.branch_SPOC_Phone);
            setFieldValue('buildingConstructedInYear', Object.keys(selectedMandate.buildingConstructedInYear).length == 0 ? '' : selectedMandate.buildingConstructedInYear);
            setFieldValue('buildingName', selectedMandate.buildingName);
            setFieldValue('carpetArea', selectedMandate.total_area_sft);
            setFieldValue('chargeableArea', selectedMandate.chargeableArea);
            setFieldValue('clustorManager', selectedMandate.clustorManager);
            setFieldValue('constructedArea', selectedMandate.constructedArea);
            setFieldValue('contact_Person', selectedMandate.contact_Person);
            setFieldValue('contact_Person_Email', selectedMandate.contact_Person_Email);
            setFieldValue('contact_Person_Phone', selectedMandate.contact_Person_Phone);
            setFieldValue('createdBy', selectedMandate.createdBy);
            setFieldValue('createdDate', selectedMandate.createdDate);
            setFieldValue('fk_Branch_Admin', selectedMandate.fk_Branch_Admin);
            setFieldValue('fk_Branch_Regional_Manager', selectedMandate.fk_Branch_Regional_Manager);
            setFieldValue('fk_Clustor_Manager_id', selectedMandate.fk_Clustor_Manager_id);
            setFieldValue('fk_Location_Coordinator', selectedMandate.fk_Location_Coordinator);
            setFieldValue('floor', selectedMandate.floor);
            setFieldValue('geoVertical', selectedMandate.geoVertical);
            setFieldValue('goldOrNonGold', selectedMandate.goldOrNonGold);
            // setFieldValue('latitude', selectedMandate.latitude);
            setFieldValue('locationCoordinator', selectedMandate.locationCoordinator);
            // setFieldValue('longitude', selectedMandate.longitude);
            setFieldValue('modifiedBy', selectedMandate.modifiedBy);
            setFieldValue('modifiedDate', selectedMandate.modifiedDate);
            // setFieldValue('parentLocationCode', selectedMandate.parentLocationCode);
            setFieldValue('pennantCode', selectedMandate.pennantCode);
            setFieldValue('premiseType', String(selectedMandate.FloorSanction));
            setFieldValue('propertyType', selectedMandate.nature_type);
            setFieldValue('region', selectedMandate.Region);
            // setFieldValue('sapLocationCode', selectedMandate.sapLocationCode);
            // setFieldValue('sapNewLocationCode', selectedMandate.sapNewLocationCode);
            // setFieldValue('locationCode', selectedMandate.locationCode);
            setFieldValue('status', selectedMandate.status);
            setFieldValue('uid', selectedMandate.uid);
        } else {
            // isMountedFour.current = true;
        }
    }, [values.phaseCode, values.mandateCode]);

    const fieldsToClear = [
        'locationCode',
        'mandateCode',
        'branch_Name',
        'branch_Code',
        'zone',
        'pincode',
        'subAdminVertical',
        'address',
        'floor',
        'buildingName',
        'chargeableArea',
        'carpetArea',
        'constructedArea',
        'buildingConstructedInYear',
        'sapLocationCode',
        'sapNewLocationCode',
        'branchACType',
        'latitude',
        'longitude',
        'parentLocationCode',
        'Country',
        'State',
        'District',
        'City',
        'tier',
        'adminVertical',
        'goldOrNonGold',
        'branchType',
        'branchType',
        'goLiveDate',
    ];

    useEffect(() => {
        if (!selectedPhaseCode) {
            fieldsToClear.forEach((field) => {
                setFieldValue(field, '');
            });
            // Clear mandateList
            setMandateList([]);
        }
    }, [selectedPhaseCode, setFieldValue]);
    const isExists = async (code) => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterMandateCount?MandateCode=${code}`);
            console.log('233', code, res.data);
            return res.data > 0;
        } catch (err) {
            console.log('error');
            return false; // Handle errors appropriately
        }
        // await axios
        //     .get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterMandateCount?MandateCode=PH_1101_MD_003`)
        //     .then((res) => {
        //         console.log('233', code, res.data);
        //         return res.data > 0;
        //     })
        //     .catch((err) => console.log('error'));
        // // return false;
    };
    console.log('$$$', errors, values);
    return (
        <>
            <div>
                <Box component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="h2" className="page-title-heading my-6">
                        Branch Master
                    </Box>
                    <Box component="h2" className="page-title-heading my-6" style={{ marginLeft: '67%' }}>
                        Location SPOC Details
                    </Box>
                </Box>
                <BranchModal open={open} handleClose={handleClose} dialogTitle={dialogTitle} styling={styling} handleSpocSubmit={handleSpocSubmit} spoc={spoc} errors={errors} touched={touched} />
                <form onSubmit={handleSubmit}>
                    <div>
                        <Grid container spacing={2}>
                            {/* Left side (70%) */}
                            <Grid item xs={8}>
                                <div className="card-panal inside-scroll-157" style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                                    {/* Content for the left side (70%) */}
                                    {/* <Typography variant="h6">Hello from 70%</Typography> */}
                                    <Grid container item xs={12} spacing={3} justifyContent="start" alignSelf="center">
                                        <Grid item xs={6} md={4} justifyContent="space-between" sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                                            <div style={{ alignItems: 'center' }}>
                                                <Typography className="required add-prop-bold" style={{ whiteSpace: 'nowrap', marginRight: '10px' }}>
                                                    Location Code
                                                </Typography>
                                                <TextField
                                                    id="locationCode"
                                                    disabled={id !== undefined}
                                                    name="locationCode"
                                                    variant="outlined"
                                                    size="small"
                                                    autoComplete="off"
                                                    value={values?.locationCode || ''}
                                                    onBlur={handleBlur}
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
                                                        const isAlphanumeric = /^[a-zA-Z0-9\s]*$/; // Only allows letters, digits, and spaces
                                                        const isValidInput = isAlphanumeric.test(e.key);

                                                        if (!isValidInput) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                />

                                                {touched.locationCode && errors.locationCode ? <p className="form-error">{errors.locationCode}</p> : null}
                                            </div>
                                        </Grid>
                                        <Grid item xs={8} md={4}></Grid>
                                        <Grid item xs={8} md={4}>
                                            {id !== undefined && (
                                                <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'end', marginTop: '4%' }}>
                                                    <BranchMasterTimelineHistory id={id} accept_Reject_Status={'currentStatus'} accept_Reject_Remark={'currentRemark'} />
                                                    {/* <Tooltip className="actionsIcons" id={`branchMasterHistory`} title="Branch Master Timeline History">
                                                <HistoryIcon style={{ fontSize: '20px', color: '#000', cursor: 'pointer' }} className="actionsIcons" />
                                            </Tooltip> */}
                                                </div>
                                            )}
                                        </Grid>
                                    </Grid>
                                    <div
                                        style={{
                                            border: '1px solid lightgray',
                                            margin: '10px 0px',
                                        }}
                                    ></div>

                                    <Grid container item spacing={5} justifyContent="start" alignSelf="center">
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop17">
                                            <Typography className="required add-prop-bold">Phase Code</Typography>
                                            <Autocomplete
                                                disabled={id !== undefined}
                                                sx={{
                                                    backgroundColor: id !== undefined ? '#F3F3F3' : 'inherit',
                                                }}
                                                size="small"
                                                className="w-85"
                                                options={phaseList || []}
                                                value={values.phaseCode || ''}
                                                onChange={(event, newValue) => {
                                                    handleChange({
                                                        target: { name: 'phaseCode', value: newValue },
                                                    });
                                                    if (!newValue) {
                                                        const fieldsToClear = [
                                                            'locationCode',
                                                            'mandateCode',
                                                            'branch_Name',
                                                            'branch_Code',
                                                            'zone',
                                                            'pincode',
                                                            'subAdminVertical',
                                                            'address',
                                                            'floor',
                                                            'buildingName',
                                                            'chargeableArea',
                                                            'carpetArea',
                                                            'constructedArea',
                                                            'buildingConstructedInYear',
                                                            'sapLocationCode',
                                                            'sapNewLocationCode',
                                                            'branchACType',
                                                            'latitude',
                                                            'longitude',
                                                            'parentLocationCode',
                                                            'Country',
                                                            'State',
                                                            'District',
                                                            'City',
                                                            'tier',
                                                            'adminVertical',
                                                            'goldOrNonGold',
                                                            'branchType',
                                                            'branchType',
                                                            'goLiveDate',
                                                        ];
                                                        fieldsToClear.forEach((field) => {
                                                            setFieldValue(field, '');
                                                        });
                                                    }
                                                    setSelectedPhaseCode(newValue);
                                                }}
                                                onBlur={handleBlur}
                                                renderInput={(params) => <TextField {...params} variant="outlined" />}
                                            />
                                            {touched.phaseCode && errors.phaseCode ? <p className="form-error">{errors.phaseCode}</p> : null}
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop17">
                                            <Typography className="required add-prop-bold">Mandate Code</Typography>

                                            <Select
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="mandateCode"
                                                id="mandateCode"
                                                value={values.mandateCode || ''}
                                                // onChange={handleChange}
                                                onChange={async (event, newValue) => {
                                                    console.log('533', event.target.name);
                                                    if (await isExists(event.target.value)) {
                                                        setFieldError('mandateCode', 'mandate code already exist');
                                                        setFieldTouched('mandateCode', true);
                                                        return;
                                                    }
                                                    handleChange(event);
                                                }}
                                                onBlur={handleBlur}
                                                disabled={id !== undefined}
                                                sx={{
                                                    backgroundColor: id !== undefined ? '#F3F3F3' : 'inherit',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select mandate Code</em>
                                                </MenuItem>
                                                {mandateList?.map((v: any) => (
                                                    <MenuItem value={v?.MandateCode}>{v?.MandateCode}</MenuItem>
                                                ))}
                                            </Select>
                                            {touched.mandateCode && errors.mandateCode ? <p className="form-error">{errors.mandateCode}</p> : null}
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop17">
                                            <Typography className="required add-prop-bold">Location Name</Typography>
                                            <TextField
                                                name="branch_Name"
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                id="branch_Name"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.branch_Name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
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
                                            {touched.branch_Name && errors.branch_Name ? <p className="form-error">{errors.branch_Name}</p> : null}
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Pennant Code</Typography>
                                            <TextField
                                                name="branch_Code"
                                                disabled={id !== undefined}
                                                id="branch_Code"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.branch_Code}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                    const isAlphanumeric = /^[a-zA-Z0-9\s]*$/; // Only allows letters, digits, and spaces
                                                    const isValidInput = isAlphanumeric.test(e.key);

                                                    if (!isValidInput) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                            {touched.branch_Code && errors.branch_Code ? <p className="form-error">{errors.branch_Code}</p> : null}
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Zone</Typography>
                                            <TextField
                                                name="zone"
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                id="zone"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.zone}
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
                                                onBlur={handleBlur}
                                            />
                                            {touched.zone && errors.zone ? <p className="form-error">{errors.zone}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="add-prop-bold">Pin Code</Typography>
                                            <TextField
                                                name="pincode"
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                id="pincode"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.pincode}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                InputProps={{ inputProps: { min: 0, maxLength: 6 } }}
                                                onKeyDown={(e: any) => {
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
                                            {touched.pincode && errors.pincode ? <p className="form-error">{errors.pincode}</p> : null}
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Country</Typography>
                                            <Select
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="Country"
                                                id="Country"
                                                value={values?.Country}
                                                onChange={(e) => setFieldValue('Country', e.target.value)}
                                                // disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                disabled={values?.phaseCode !== '' && values?.mandateCode !== '' && values?.Country !== ''}
                                                sx={{
                                                    backgroundColor: values?.phaseCode !== '' && values?.mandateCode !== '' && values?.Country !== '' ? '#F3F3F3' : 'inherit',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select Country</em>
                                                </MenuItem>
                                                {countryList &&
                                                    countryList.map((data) => (
                                                        <MenuItem key={data} value={data}>
                                                            {data}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            {touched.Country && errors.Country ? <p className="form-error">{errors.Country}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">State</Typography>
                                            <Select
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="State"
                                                id="State"
                                                value={values.State}
                                                onChange={(e) => setFieldValue('State', e.target.value)}
                                                // disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                disabled={values?.phaseCode !== '' && values?.mandateCode !== '' && values?.State !== ''}
                                                sx={{
                                                    backgroundColor: values?.phaseCode !== '' && values?.mandateCode !== '' && values?.State !== '' ? '#F3F3F3' : 'inherit',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select State</em>
                                                </MenuItem>
                                                {stateList &&
                                                    stateList.map((data) => (
                                                        <MenuItem key={data} value={data}>
                                                            {data}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            {touched.State && errors.State ? <p className="form-error">{errors.State}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">District</Typography>
                                            <Select
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="District"
                                                id="District"
                                                value={values.District}
                                                onChange={(e) => setFieldValue('District', e.target.value)}
                                                // disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                disabled={values?.phaseCode !== '' && values?.mandateCode !== '' && values?.District !== ''}
                                                sx={{
                                                    backgroundColor: values?.phaseCode !== '' && values?.mandateCode !== '' && values?.District !== '' ? '#F3F3F3' : 'inherit',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select District</em>
                                                </MenuItem>
                                                {districtList &&
                                                    districtList.map((data) => (
                                                        <MenuItem key={data} value={data}>
                                                            {data}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            {touched.District && errors.District ? <p className="form-error">{errors.District}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">City</Typography>
                                            <Select
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="City"
                                                id="City"
                                                value={values.City}
                                                onChange={(e) => setFieldValue('City', e.target.value)}
                                                // disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                disabled={values?.phaseCode !== '' && values?.mandateCode !== '' && values?.City !== ''}
                                                sx={{
                                                    backgroundColor: values?.phaseCode !== '' && values?.mandateCode !== '' && values?.City !== '' ? '#F3F3F3' : 'inherit',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select City</em>
                                                </MenuItem>
                                                {cityList &&
                                                    cityList.map((data) => (
                                                        <MenuItem key={data} value={data}>
                                                            {data}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            {touched.City && errors.City ? <p className="form-error">{errors.City}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Tier</Typography>
                                            <Select
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="tier"
                                                id="tier"
                                                value={values?.tier}
                                                onChange={(e) => setFieldValue('tier', e.target.value)}
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                sx={{
                                                    backgroundColor: id !== undefined && user?.UserName !== 'sysadmin' ? '#F3F3F3' : 'inherit',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select Tier Name</em>
                                                </MenuItem>
                                                {tierList &&
                                                    tierList.map((data) => (
                                                        <MenuItem key={data} value={data}>
                                                            {data}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            {touched.tier && errors.tier ? <p className="form-error">{errors.tier}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Admin Vertical</Typography>
                                            <Select
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="adminVertical"
                                                id="adminVertical"
                                                value={values?.adminVertical}
                                                onChange={(e) => setFieldValue('adminVertical', e.target.value)}
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                sx={{
                                                    backgroundColor: id !== undefined && user?.UserName !== 'sysadmin' ? '#F3F3F3' : 'inherit',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select Vertical</em>
                                                </MenuItem>
                                                {adminVerticalListName &&
                                                    adminVerticalListName.map((data) => (
                                                        <MenuItem key={data} value={data}>
                                                            {data}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            {touched.adminVertical && errors.adminVertical ? <p className="form-error">{errors.adminVertical}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Sub Admin Vertical</Typography>
                                            <TextField
                                                name="subAdminVertical"
                                                id="subAdminVertical"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.subAdminVertical}
                                                onChange={handleChange}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }

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
                                            {touched.subAdminVertical && errors.subAdminVertical ? <p className="form-error">{errors.subAdminVertical}</p> : null}
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Gold / Non-Gold</Typography>
                                            <Select
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="goldOrNonGold"
                                                id="goldOrNonGold"
                                                value={values?.goldOrNonGold}
                                                onChange={(e) => setFieldValue('goldOrNonGold', e.target.value)}
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                sx={{
                                                    backgroundColor: id !== undefined && user?.UserName !== 'sysadmin' ? '#F3F3F3' : 'inherit',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select Gold / Non-Gold</em>
                                                </MenuItem>
                                                {gLCategoryName &&
                                                    gLCategoryName.map((data) => (
                                                        <MenuItem key={data} value={data}>
                                                            {data}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            {touched.goldOrNonGold && errors.goldOrNonGold ? <p className="form-error">{errors.goldOrNonGold}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Branch Type</Typography>
                                            <Select displayEmpty inputProps={{ 'aria-label': 'Without label' }} size="small" className="w-85" name="branchType" id="branchType" value={values?.branchType} onChange={(e) => setFieldValue('branchType', e.target.value)}>
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select Branch Type Name</em>
                                                </MenuItem>
                                                {BranchTypeName &&
                                                    BranchTypeName.map((data) => (
                                                        <MenuItem key={data} value={data}>
                                                            {data}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            {touched.branchType && errors.branchType ? <p className="form-error">{errors.branchType}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Branch Address</Typography>
                                            <TextField
                                                name="address"
                                                id="address"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.address}
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
                                                    // if (/[0-9]/.test(e.key)) {
                                                    //     e.preventDefault();
                                                    // }
                                                }}
                                                onBlur={handleBlur}
                                            />
                                            {touched?.address && errors?.address ? <p className="form-error">{errors?.address}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Building Name</Typography>
                                            <TextField
                                                name="buildingName"
                                                id="buildingName"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.buildingName}
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
                                                onBlur={handleBlur}
                                            />
                                            {touched?.buildingName && errors?.buildingName ? <p className="form-error">{errors?.buildingName}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Chargeable Area(SFT)</Typography>
                                            <TextField
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                name="chargeableArea"
                                                type="number"
                                                id="chargeableArea"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.chargeableArea}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                onKeyDown={(e: any) => {
                                                    regExpressionTextField(e);
                                                    blockInvalidChar(e);
                                                    if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                            />
                                            {touched?.chargeableArea && errors?.chargeableArea ? <p className="form-error">{errors?.chargeableArea}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="add-prop-bold">Premise Type</Typography>
                                            {/* <Select
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="premiseType"
                                                id="premiseType"
                                                value={values?.premiseType}
                                                onChange={(e) => setFieldValue('premiseType', e.target.value)}
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                sx={{
                                                    backgroundColor: id !== undefined && user?.UserName !== 'sysadmin' ? '#F3F3F3' : 'inherit',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select Premise Type</em>
                                                </MenuItem>
                                                {PremiseType &&
                                                    PremiseType.map((data) => (
                                                        <MenuItem key={data} value={data}>
                                                            {data}
                                                        </MenuItem>
                                                    ))}
                                            </Select> */}
                                            <Autocomplete
                                                size="small"
                                                className="w-85"
                                                id="premiseType"
                                                options={PremiseType || []}
                                                value={values?.premiseType || ''}
                                                onChange={(_, value) => setFieldValue('premiseType', value)}
                                                disableClearable
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                getOptionLabel={(option) => option}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        name="premiseType"
                                                        // label="Premise Type"
                                                        inputProps={{
                                                            ...params.inputProps,
                                                            'aria-label': 'Without label',
                                                        }}
                                                        sx={{
                                                            backgroundColor: id !== undefined && user?.UserName !== 'sysadmin' ? '#F3F3F3' : 'inherit',
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Carpet Area(SFT)</Typography>
                                            <TextField
                                                name="carpetArea"
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                type="number"
                                                id="carpetArea"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.carpetArea}
                                                onChange={handleChange}
                                                onKeyDown={(e: any) => {
                                                    regExpressionTextField(e);
                                                    blockInvalidChar(e);
                                                    if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                onBlur={handleBlur}
                                            />
                                            {touched.carpetArea && errors.carpetArea ? <p className="form-error">{errors.carpetArea}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Constructed Area(SFT)</Typography>
                                            <TextField
                                                name="constructedArea"
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                type="number"
                                                id="constructedArea"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.constructedArea}
                                                onChange={handleChange}
                                                onKeyDown={(e: any) => {
                                                    regExpressionTextField(e);
                                                    blockInvalidChar(e);
                                                    if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                onBlur={handleBlur}
                                            />
                                            {touched?.constructedArea && errors?.constructedArea ? <p className="form-error">{errors?.constructedArea}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Floor</Typography>
                                            <Select
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="floor"
                                                id="floor"
                                                value={values?.floor}
                                                onChange={(e) => setFieldValue('floor', e.target.value)}
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                sx={{
                                                    backgroundColor: id !== undefined && user?.UserName !== 'sysadmin' ? '#F3F3F3' : 'inherit',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select Floor</em>
                                                </MenuItem>
                                                {floornumber &&
                                                    floornumber.map((data) => (
                                                        <MenuItem key={data} value={data}>
                                                            {data}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            {touched.floor && errors.floor ? <p className="form-error">{errors.floor}</p> : null}
                                        </Grid>
                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="add-prop-bold">Property Type</Typography>
                                            {/* <Select
                                                // displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                size="small"
                                                className="w-85"
                                                name="propertyType"
                                                id="propertyType"
                                                value={values?.propertyType||''}
                                                onChange={(e) => setFieldValue('propertyType', e.target.value)}
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                sx={{
                                                    backgroundColor: id !== undefined && user?.UserName !== 'sysadmin' ? '#F3F3F3' : 'inherit',
                                                }}
                                            >
                                                <MenuItem value="" style={{ display: 'none' }}>
                                                    <em>Select Property Type</em>
                                                </MenuItem>
                                                {propertyType &&
                                                    propertyType.map((data) => (
                                                        <MenuItem key={data} value={data}>
                                                            {data}
                                                        </MenuItem>
                                                    ))}
                                            </Select> */}
                                            <Autocomplete
                                                size="small"
                                                className="w-85"
                                                id="propertyType"
                                                options={propertyType || []}
                                                value={values?.propertyType || ''}
                                                onChange={(_, value) => setFieldValue('propertyType', value)}
                                                disableClearable
                                                disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                getOptionLabel={(option) => option}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        name="propertyType"
                                                        // label="Property Type"
                                                        inputProps={{
                                                            ...params.inputProps,
                                                            'aria-label': 'Without label',
                                                        }}
                                                        sx={{
                                                            backgroundColor: id !== undefined && user?.UserName !== 'sysadmin' ? '#F3F3F3' : 'inherit',
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Building Constructed In Year</Typography>
                                            <TextField
                                                name="buildingConstructedInYear"
                                                type="number"
                                                id="buildingConstructedInYear"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.buildingConstructedInYear}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                onKeyDown={(e: any) => {
                                                    regExpressionTextField(e);
                                                    blockInvalidChar(e);
                                                    if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                            />
                                            {touched?.buildingConstructedInYear && errors?.buildingConstructedInYear ? <p className="form-error">{errors?.buildingConstructedInYear}</p> : null}
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">SAP Location Code</Typography>
                                            <TextField
                                                name="sapLocationCode"
                                                id="sapLocationCode"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.sapLocationCode}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                    const isAlphanumeric = /^[a-zA-Z0-9\s]*$/; // Only allows letters, digits, and spaces
                                                    const isValidInput = isAlphanumeric.test(e.key);

                                                    if (!isValidInput) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                            {touched?.sapLocationCode && errors?.sapLocationCode ? <p className="form-error">{errors?.sapLocationCode}</p> : null}
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">SAP New Location Code</Typography>
                                            <TextField name="sapNewLocationCode" id="sapNewLocationCode" autoComplete="off" variant="outlined" size="small" className="w-85" value={values.sapNewLocationCode} onChange={handleChange} onBlur={handleBlur} />
                                            {touched?.sapNewLocationCode && errors?.sapNewLocationCode ? <p className="form-error">{errors?.sapNewLocationCode}</p> : null}
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Branch AC Type</Typography>
                                            <TextField
                                                name="branchACType"
                                                id="branchACType"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.branchACType}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                    const isAlphanumeric = /^[a-zA-Z0-9\s]*$/; // Only allows letters, digits, and spaces
                                                    const isValidInput = isAlphanumeric.test(e.key);

                                                    if (!isValidInput) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                            {touched?.branchACType && errors?.branchACType ? <p className="form-error">{errors?.branchACType}</p> : null}
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Latitude</Typography>
                                            <TextField
                                                name="latitude"
                                                id="latitude"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.latitude}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && (e.code === 'Space' || e.key === '.')) {
                                                        e.preventDefault();
                                                    }

                                                    const isAlphanumeric = /^[0-9.\s]*$/; // Only allows digits, dots, and spaces

                                                    if (e.key === 'Backspace' || isAlphanumeric.test(e.key)) {
                                                        if (e.key === '.' && e.currentTarget.value.includes('.')) {
                                                            // Prevent inputting more than one dot
                                                            e.preventDefault();
                                                        }
                                                    } else {
                                                        // Prevent input of non-numeric, non-dot characters, and other keys
                                                        e.preventDefault();
                                                    }
                                                }}
                                                // inputProps={{ pattern: "[0-9]*[.]?[0-9]*" }}
                                                // onKeyDown={(e: any) => {
                                                //     blockInvalidChar(e);
                                                //     if (e?.key === "Backspace" && keyCount > 0) {
                                                //         setKeyCount(keyCount - 1);

                                                //         if (keyCount === 1) setCount(0);
                                                //     }
                                                //     if (
                                                //         e.target.selectionStart === 0 &&
                                                //         (e.code === "Space" ||
                                                //             e.code === "Numpad0" ||
                                                //             e.code === "Digit0")
                                                //     ) {
                                                //         e.preventDefault();
                                                //     }
                                                //     if (!(count > 0 && e?.key === "."))
                                                //         setKeyCount(keyCount + 1);
                                                //     if (e?.key === ".") {
                                                //         setCount(count + 1);
                                                //     }
                                                //     if (
                                                //         (!/[0-9.]/.test(e.key) ||
                                                //             (count > 0 && e?.key === ".")) && (e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight")
                                                //     ) {
                                                //         e.preventDefault();
                                                //     }
                                                // }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                            />
                                            {touched?.latitude && errors?.latitude ? <p className="form-error">{errors?.latitude}</p> : null}
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Longitude</Typography>
                                            <TextField
                                                name="longitude"
                                                id="longitude"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.longitude}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && (e.code === 'Space' || e.key === '.')) {
                                                        e.preventDefault();
                                                    }

                                                    const isAlphanumeric = /^[0-9.\s]*$/; // Only allows digits, dots, and spaces

                                                    if (e.key === 'Backspace' || isAlphanumeric.test(e.key)) {
                                                        if (e.key === '.' && e.currentTarget.value.includes('.')) {
                                                            // Prevent inputting more than one dot
                                                            e.preventDefault();
                                                        }
                                                    } else {
                                                        // Prevent input of non-numeric, non-dot characters, and other keys
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                            {touched?.longitude && errors?.longitude ? <p className="form-error">{errors?.longitude}</p> : null}
                                        </Grid>

                                        <Grid item xs={4} md={4} sx={{ position: 'relative' }} className="padTop7">
                                            <Typography className="required add-prop-bold">Parent Location Code</Typography>
                                            <TextField
                                                name="parentLocationCode"
                                                id="parentLocationCode"
                                                autoComplete="off"
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={values.parentLocationCode}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                    }
                                                    const isAlphanumeric = /^[a-zA-Z0-9\s]*$/; // Only allows letters, digits, and spaces
                                                    const isValidInput = isAlphanumeric.test(e.key);

                                                    if (!isValidInput) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                            {touched?.parentLocationCode && errors?.parentLocationCode ? <p className="form-error">{errors?.parentLocationCode}</p> : null}
                                        </Grid>
                                        <Grid item xs={6} md={3} sx={{ position: 'relative' }} className="padTop7">
                                            <div>
                                                <h2 className="required add-prop-bold">Go Live Date</h2>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DesktopDatePicker
                                                        disabled={id !== undefined && user?.UserName !== 'sysadmin'}
                                                        className="w-85"
                                                        inputFormat="DD/MM/YYYY"
                                                        value={values.goLiveDate || ''}
                                                        // minDate={values.inspection_date}
                                                        onChange={handleGetPassDate}
                                                        renderInput={(params) => <TextField {...params} name="goLiveDate" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                                                    />
                                                </LocalizationProvider>
                                                {touched.goLiveDate && errors.goLiveDate ? <p className="form-error">{errors.goLiveDate}</p> : null}
                                            </div>
                                        </Grid>
                                    </Grid>
                                </div>
                            </Grid>

                            {/* Right side (30%) */}
                            <Grid item xs={4}>
                                <div className="card-panal inside-scroll-157" style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                                    {/* Content for the right side (30%) */}
                                    <div>
                                        <Grid marginBottom="0px" item container spacing={3} justifyContent="start" alignSelf="center">
                                            {spocTitle?.map((item) => {
                                                return (
                                                    <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
                                                        <div
                                                            className="boxshadowcard"
                                                            style={{
                                                                fontSize: '13px',
                                                                padding: '5px',
                                                                backgroundColor: 'white',
                                                                border: spocEmptyTitle.includes(item) ? '1px solid red' : '1px solid #babfc7',
                                                                borderRadius: '6px',
                                                                textAlign: 'start',
                                                                flexDirection: 'column',
                                                                display: 'flex',
                                                            }}
                                                        >
                                                            <div>
                                                                <div
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        marginBottom: '0px',
                                                                    }}
                                                                >
                                                                    <div className="cardFlex">
                                                                        <div
                                                                            className="actionsCardStart"
                                                                            style={{
                                                                                color: '#0000FF',
                                                                                fontSize: '14px',
                                                                                textAlign: 'start',
                                                                            }}
                                                                        >
                                                                            {item}
                                                                        </div>

                                                                        {!values.locationCode && (
                                                                            <Tooltip title="Edit User" className="actionsCard" arrow>
                                                                                <button className="actionsIconsCardDisabled" disabled={!values.locationCode}>
                                                                                    <TbPencil style={{ color: 'lightgray' }} />
                                                                                </button>
                                                                            </Tooltip>
                                                                        )}

                                                                        {values.locationCode && (
                                                                            <Tooltip title="Edit User" className="actionsCard">
                                                                                <button
                                                                                    className="actionsIconsCard"
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        handleClickOpen(item);
                                                                                    }}
                                                                                >
                                                                                    <TbPencil />
                                                                                </button>
                                                                            </Tooltip>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'space-between',
                                                                    }}
                                                                >
                                                                    {/* <div style={{ display: 'flex', alignItems: 'center' }}> */}
                                                                    {/* <img
                                                                            src={logoImage}
                                                                            alt="Avatar"
                                                                            style={{
                                                                                width: '50px',
                                                                                height: '50px',
                                                                                borderRadius: '50%',
                                                                                marginRight: '10px',
                                                                            }}
                                                                        /> */}
                                                                    <div
                                                                        style={{
                                                                            // color: '#403d3d',
                                                                            fontSize: '14px',
                                                                            // textAlign: 'center',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                        }}
                                                                        title={spoc[item]?.roleName}
                                                                    >
                                                                        <PeopleAltIcon className="cardsIcons" />
                                                                        {spoc[item]?.roleName || '<Role>'}
                                                                    </div>
                                                                    {/* </div> */}
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        // color: '#403d3d',
                                                                        fontSize: '14px',
                                                                        // textAlign: 'center',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                    title={spoc[item]?.designation}
                                                                >
                                                                    <PersonPinIcon className="cardsIcons" />
                                                                    {spoc[item]?.designation || '<Designation>'}
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        // color: '#403d3d',
                                                                        fontSize: '14px',
                                                                        // textAlign: 'center',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                    title={spoc[item]?.employeeId}
                                                                >
                                                                    <ContactsIcon className="cardsIcons" />
                                                                    {spoc[item]?.employeeId || '<Employee Id >'}
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        // color: '#403d3d',
                                                                        fontSize: '14px',
                                                                        // textAlign: 'center',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                    title={spoc[item]?.employeeName}
                                                                >
                                                                    <ContactsIcon className="cardsIcons" />
                                                                    {spoc[item]?.employeeName || '<Employee Name>'}
                                                                </div>
                                                                {/* <div
                                                                    style={{
                                                                        color: '#111827',
                                                                        fontSize: '14px',
                                                                        textAlign: 'center',
                                                                    }}
                                                                >
                                                                    {spoc[item]?.employeeName || '<Employee Name & Code>'}
                                                                </div> */}
                                                                {/* <div
                                                                    style={{
                                                                        color: '#111827',
                                                                        fontSize: '14px',
                                                                        textAlign: 'center',
                                                                    }}
                                                                >
                                                                    {spoc[item]?.employeeCode}
                                                                </div> */}
                                                                <div
                                                                    style={{
                                                                        // color: '#403d3d',
                                                                        fontSize: '14px',
                                                                        // textAlign: 'center',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                    //title="devi.tripathi@bajajfinserv.in"
                                                                    title={spoc[item]?.emailid}
                                                                >
                                                                    <EmailIcon className="cardsIcons" />
                                                                    {spoc[item]?.emailid || '<Email>'}
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        // color: '#403d3d',
                                                                        fontSize: '14px',
                                                                        // textAlign: 'center',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                    title={spoc[item]?.contact}
                                                                >
                                                                    <ContactPhoneIcon className="cardsIcons" />
                                                                    {spoc[item]?.contact || '<Contact>'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </div>
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                    {action === 'Approve or Reject' && (
                        <div className="bottom-fix-btn">
                            <div className="remark-field">
                                <>
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
                                                values?.mandateId,

                                                remark,
                                                'Approved',
                                                navigate,
                                                user,
                                            );
                                        }}
                                        sentBackEvent={() => {
                                            workflowFunctionAPICall(runtimeId, values?.mandateId, remark, 'Sent Back', navigate, user);
                                        }}
                                    />
                                    <span className="message-right-bottom">{branchMasterAction?.stdmsg}</span>
                                </>
                            </div>
                        </div>
                    )}
                    {action === 'Validate or Reject' && (
                        <div className="bottom-fix-btn">
                            <div className="remark-field">
                                <>
                                    <ValidateReject
                                        approved={approved}
                                        sendBack={sendBack}
                                        setSendBack={setSendBack}
                                        setApproved={setApproved}
                                        remark={remark}
                                        setRemark={setRemark}
                                        approveEvent={() => {
                                            workflowFunctionAPICall(
                                                runtimeId,
                                                values?.mandateId,

                                                remark,
                                                'Approved',
                                                navigate,
                                                user,
                                            );
                                        }}
                                        sentBackEvent={() => {
                                            workflowFunctionAPICall(runtimeId, values?.mandateId, remark, 'Sent Back', navigate, user);
                                        }}
                                    />
                                    <span className="message-right-bottom">{branchMasterAction?.stdmsg}</span>
                                </>
                            </div>
                        </div>
                    )}
                    {action === '' && (
                        <div className="bottom-fix-btn bg-pd">
                            <div className="remark-field" style={{ marginRight: '0px' }}>
                                <Stack display="flex" flexDirection="row" justifyContent="space-between" alignItems={'center'} alignContent="center" sx={{ margin: '10px' }} style={{ marginLeft: '-2.7%' }}>
                                    <Button
                                        variant="outlined"
                                        size="medium"
                                        type="submit"
                                        name="submit"
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
                                </Stack>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};

export default BranchMaster;
