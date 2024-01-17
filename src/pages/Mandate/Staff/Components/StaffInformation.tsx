import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { Autocomplete, Button, TextField } from '@mui/material';
import StaffForm from './Actions/StaffForm';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { AgGridReact } from 'ag-grid-react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import StaffClassificationEditor from './Editors/StaffClassificationEditor';
import PANNumberEditor from './Editors/PANNumberEditor';
import MobileNumberEditor from './Editors/MobileNumberEditor';
import StaffAadharNumberEditor from './Editors/StaffAadharNumberEditor';
import TextEditors from './Editors/TextEditors';
import NumberTypeEditor from './Editors/NumberTypeEditor';
import axios from 'axios';
import { fetchError, showMessage } from 'redux/actions';
import FileUploadAction from './Actions/FileUploadAction';
import FileDownloadList from './Actions/FileDownloadList';
import FileViewList from './Actions/FileViewList';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUrlSearchParams } from 'use-url-search-params';
import { AppState } from 'redux/store';

import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
declare global {
    interface Navigator {
        msSaveBlob?: (blob: any, defaultName?: string) => boolean;
    }
}

const StaffInformation = ({ mandate, staffInformation, setStaffInformation, getStaffDetails, currentRemark, currentStatus }) => {
    const [gridApi, setGridApi] = React.useState(null);
    const [isError, setError] = React.useState(false);
    const [mandatoryError, setMandatoryError] = React.useState(false);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const fileInput = React.useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [params] = useUrlSearchParams({}, {});
    const { user } = useAuthUser();
    const location = useLocation();
    const apiType = location?.state?.apiType || '';
    const [userAction, setUserAction] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const [errorMessage, setErrorMessage] = useState({});
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const gridRef = React.useRef<AgGridReact>(null);

    const handleClose = () => {
        var data = staffInformation;
        if (data && data?.length > 0) {
            if (data && data?.length == 1 && data?.[0]?.id === 0) {
                setStaffInformation([]);
            } else {
                data = data.slice(0, data.length - 1);
                setStaffInformation(data);
            }
        }
        setOpen(false);
        setErrorMessage({});
    };
    const handleOpen = () => {
        setOpen(true);
    };
    const getErrorState = (flag: boolean): void => {
        setError(flag);
    };

    useEffect(() => {
        if (mandate && mandate.hasOwnProperty('id') && mandate?.id !== undefined && mandate?.id !== 'noid') {
            getStaffDetails();
        }
    }, [mandate]);
    const components = {
        StaffCountEditorCmp: NumberTypeEditor,
        StaffClassificationEditorCmp: StaffClassificationEditor,
        StaffNameEditorCmp: TextEditors,
        PANNumberEditorCmp: PANNumberEditor,
        MobileNumberEditorCmp: MobileNumberEditor,
        StaffAddressEditorCmp: TextEditors,
        StaffAadharNumberEditorCmp: StaffAadharNumberEditor,
        AgencyNameEditorCmp: TextEditors,
        BankAccountNumberCmp: NumberTypeEditor,
        BankIFSCCodeCmp: TextEditors,
        BranchNameEditorCmp: TextEditors,
    };

    const staffCategoryOptions = [
        {
            key: '1',
            categoryName: 'Temporary',
        },
        {
            key: '2',
            categoryName: 'Permanent',
        },
    ];
    const staffStatusOptions = [
        {
            key: '1',
            categoryName: 'Active',
        },
        {
            key: '2',
            categoryName: 'Inactive',
        },
    ];
    const generateStaffCategory = (value, staffCategory) => {
        var staff_Category = null;
        if (staffCategory?.hasOwnProperty('categoryName')) {
            staff_Category = staffCategoryOptions?.find((item) => item?.categoryName?.toUpperCase() === staffCategory?.categoryName?.toUpperCase());
        } else {
            staff_Category = staffCategoryOptions?.find((item) => item?.categoryName?.toUpperCase() === value?.toUpperCase());
        }
        return staff_Category || null;
    };
    const generateStaffStatus = (value) => {
        const staff_Status = staffStatusOptions?.find((item) => item?.categoryName?.toUpperCase() === value?.toUpperCase());
        return staff_Status || null;
    };

    let columnDefs = [
        {
            field: 'Actions',
            headerName: 'Actions',
            headerTooltip: 'Actions',
            sortable: false,
            resizable: true,
            width: 100,
            pinned: 'left',
            minWidth: 100,
            cellStyle: { fontSize: '12px' },
            cellRendererParams: {
                mandate: mandate,
                fileInput: fileInput,
            },
            cellRenderer: (params: any) => (
                <>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginRight: '10px',
                        }}
                        className="actions"
                    >
                        <FileUploadAction params={params} />
                        <FileViewList props={params} mandate={mandate} />
                        {/* <FileDownloadList props={params} mandate={mandate} /> */}
                    </div>
                </>
            ),
        },

        {
            field: 'staff_Classification',
            headerName: 'Staff Classification',
            headerTooltip: 'Staff Classification',
            tooltipField: 'staff_Classification',
            sortable: true,
            pinned: 'left',
            resizable: true,
            editable: true,
            width: 170,
            minWidth: 170,
            cellClass: (params) => {
                if (params?.data?.staff_Classification === '') {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },
            cellClassRules: {
                'rag-red': (params) => {
                    if (params?.data?.staff_Classification === '') {
                        getErrorState(true);
                        return true;
                    } else {
                        getErrorState(false);
                        return false;
                    }
                },
            },
            cellStyle: { fontSize: '12px', cursor: 'pointer' },
            cellEditor: 'StaffClassificationEditorCmp',
            cellRendererParams: { setError: setError },
            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                staffCategoryOptions: staffCategoryOptions,
                maxLength: 10,
            },
        },
        {
            field: 'staff_Category',
            headerName: 'Staff Category',
            headerTooltip: 'Staff Category',
            sortable: true,
            resizable: true,
            pinned: 'left',
            width: 200,
            minWidth: 200,
            cellClass: (params) => {
                if (params?.data?.staff_Category === '') {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },

            cellClassRules: {
                'rag-red': (params) => {
                    if (params?.data?.staff_Category === '') {
                        getErrorState(true);
                        return true;
                    } else {
                        getErrorState(false);
                        return false;
                    }
                },
            },
            cellStyle: { fontSize: '12px', cursor: 'pointer' },
            cellRenderer: (params: any) => (
                <>
                    <div style={{ marginTop: 2 }} className="padd-right">
                        <Autocomplete
                            id="combo-box-demo"
                            getOptionLabel={(option) => option?.categoryName?.toString() || ''}
                            disableClearable={true}
                            options={params?.staffCategoryOptions || []}
                            onChange={(e, value: any) => {
                                var currentIndex = params?.rowIndex;
                                var data = [...params?.staffInformation];
                                data[currentIndex].staff_Category = value;
                                data[currentIndex].staff_cat_value = value?.key;
                                params?.setStaffInformation(data);
                            }}
                            placeholder="Staff Category"
                            value={(params && params?.staffInformation[params?.rowIndex]?.staff_cat_value && params?.generateStaffCategory(params?.staffInformation[params?.rowIndex]?.staff_cat_value, params?.staffInformation[params?.rowIndex]?.staff_Category)) || null}
                            renderInput={(textParams) => (
                                <TextField
                                    name="state"
                                    id="state"
                                    {...textParams}
                                    InputProps={{
                                        ...textParams.InputProps,
                                    }}
                                    sx={{
                                        '.MuiInputBase-input': {
                                            height: '12px !important',
                                            fontSize: '12px',
                                            paddingLeft: '8px',
                                        },
                                    }}
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                        />
                    </div>
                </>
            ),
            cellRendererParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                staffCategoryOptions: staffCategoryOptions,
                generateStaffCategory: generateStaffCategory,
                setError: setError,
            },
        },
        {
            field: 'staff_Count',
            headerName: 'Staff Count',
            headerTooltip: 'Staff Count',
            sortable: true,
            pinned: 'left',
            resizable: true,
            editable: true,
            width: 120,
            minWidth: 120,
            cellClass: (params) => {
                if (params?.data?.staff_Count === '') {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },

            cellClassRules: {
                'rag-red': (params) => {
                    if (params?.data?.staff_Count === '') {
                        getErrorState(true);
                        return true;
                    } else {
                        getErrorState(false);
                        return false;
                    }
                },
            },

            cellStyle: {
                fontSize: '12px',
                cursor: 'pointer',
            },
            cellEditor: 'StaffCountEditorCmp',
            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                type: 'number',
                maxLength: 5,
            },
            cellRendererParams: { setError: setError },
        },
        {
            field: 'staff_Name',
            headerName: 'Name',
            headerTooltip: 'Name',
            sortable: true,
            resizable: true,
            editable: true,
            pinned: 'left',
            width: 80,
            minWidth: 80,
            cellClass: (params) => {
                let regex = new RegExp(/^[a-zA-Z ]*$/);
                var staff_Name = params?.data?.staff_Name;
                if (params?.data?.staff_Name && regex.test(staff_Name) === false) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else if (!params?.data?.staff_Name) {
                    setMandatoryError(true);
                    getErrorState(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },
            cellClassRules: {
                'rag-red': (params) => {
                    let regex = new RegExp(/^[a-zA-Z ]*$/);
                    var staff_Name = params?.data?.staff_Name;
                    if (params?.data?.staff_Name && regex.test(staff_Name) === false) {
                        getErrorState(true);
                        return true;
                    } else if (!params?.data?.staff_Name) {
                        getErrorState(true);
                        return true;
                    } else {
                        getErrorState(false);
                        return false;
                    }
                },
            },
            cellRendererParams: {
                setError: setError,
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
            },
            suppressSizeToFit: true,
            cellStyle: {
                fontSize: '12px',
                cursor: 'pointer',
            },
            cellEditor: 'StaffNameEditorCmp',
            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
            },
        },
        {
            field: 'panNumber',
            headerName: 'PAN No.',
            headerTooltip: 'PAN Number',
            sortable: true,
            resizable: true,
            editable: true,
            width: 100,
            minWidth: 100,
            cellClass: (params) => {
                let regex = new RegExp(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/);
                var panCardNo = params?.data?.panNumber.toUpperCase();
                if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.panNumber && regex.test(panCardNo) === false) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.panNumber === '') {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },
            cellClassRules: (params) => {
                let regex = new RegExp(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/);
                var panCardNo = params?.data?.panNumber.toUpperCase();
                if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.panNumber && regex.test(panCardNo) === false) {
                    getErrorState(true);
                    return true;
                } else if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.panNumber === '') {
                    getErrorState(true);
                    return true;
                } else {
                    getErrorState(false);
                    return false;
                }
            },
            cellRendererParams: { setError: setError },
            cellStyle: {
                fontSize: '12px',
                cursor: 'pointer',
            },
            cellEditor: 'PANNumberEditorCmp',
            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                type: 'text',
                maxLength: 10,
                setError: setError,
            },
        },
        {
            field: 'mobileNo',
            headerName: 'Mobile No.',
            headerTooltip: 'Mobile Number',
            sortable: true,
            resizable: true,
            editable: true,
            width: 110,
            minWidth: 110,

            cellClassRules: {
                'rag-red': (params) => {
                    let regex = new RegExp(/^([+]\d{2})?\d{10}$/);
                    let regExp = new RegExp('^[9,8,7,6][0-9]*$');
                    var mobileNo = params?.data?.mobileNo;
                    if (params?.data?.mobileNo && regex.test(mobileNo) === false) {
                        getErrorState(true);

                        return true;
                    } else if (params?.data?.mobileNo && regExp.test(mobileNo) === false) {
                        getErrorState(true);

                        return true;
                    } else if (!params?.data?.mobileNo) {
                        getErrorState(true);

                        return true;
                    } else {
                        getErrorState(false);

                        return false;
                    }
                },
            },
            cellClass: (params) => {
                let regex = new RegExp(/^([+]\d{2})?\d{10}$/);
                let regExp = new RegExp('^[9,8,7,6][0-9]*$');
                var mobileNo = params?.data?.mobileNo;
                if (params?.data?.mobileNo && regex.test(mobileNo) === false) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else if (params?.data?.mobileNo && regExp.test(mobileNo) === false) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else if (!params?.data?.mobileNo) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },
            suppressSizeToFit: true,
            cellStyle: {
                fontSize: '12px',
                cursor: 'pointer',
                width: '89px',
                left: '110px',
            },
            cellEditor: 'MobileNumberEditorCmp',
            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                type: 'number',
                maxLength: 10,
            },
            cellRendererParams: { setError: setError },
        },

        {
            field: 'join_Date',
            headerName: 'Joining Date',
            headerTooltip: 'Joining Date',
            sortable: true,
            resizable: true,
            width: 140,
            minWidth: 140,
            cellClass: (params) => {
                var join_Date = params?.data?.join_Date;
                if (join_Date === '') {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);

                    return 'cell-padding rag-red editTextClass';
                }
            },
            cellClassRules: {
                'rag-red': (params) => {
                    var join_Date = params?.data?.join_Date;
                    if (join_Date === '') {
                        getErrorState(true);
                        return 'cell-padding rag-red';
                    } else {
                        getErrorState(false);
                        return 'cell-padding rag-red editTextClass';
                    }
                },
            },
            cellStyle: { fontSize: '12px' },

            cellRenderer: (params: any) => (
                <>
                    <div style={{ marginTop: 2 }} className="padd-right">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DesktopDatePicker
                                inputFormat="DD/MM/YYYY"
                                value={params?.staffInformation?.[params?.rowIndex]?.join_Date || new Date() || null}
                                onChange={(value: Dayjs | null) => {
                                    var currentIndex = params?.rowIndex;
                                    var data = [...params?.staffInformation];
                                    if (value !== null) data[currentIndex].join_Date = value?.toDate();
                                    params?.setStaffInformation(data);
                                }}
                                renderInput={(paramsText) => (
                                    <TextField
                                        sx={{
                                            '.MuiInputBase-input': {
                                                height: '12px !important',
                                                fontSize: '12px',
                                                paddingLeft: '8px',
                                            },
                                        }}
                                        {...paramsText}
                                        error={staffInformation?.[params?.rowIndex]?.join_Date ? false : true}
                                        size="small"
                                        name="Proposed Start Date"
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </div>
                </>
            ),
            cellRendererParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                setError: setError,
            },
        },
        {
            field: 'aadharNumber',
            headerName: 'Aadhaar Card No',
            headerTooltip: 'Aadhaar Card Number',
            sortable: true,
            resizable: true,
            editable: true,
            width: 155,
            minWidth: 155,
            cellClass: (params) => {
                var inputlength = params?.data?.aadharNumber && params?.data?.aadharNumber?.toString();
                inputlength = inputlength?.length;
                if (params?.data?.aadharNumber && inputlength && inputlength !== 12) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else if (params?.data?.aadharNumber === '' || inputlength === undefined) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },

            cellClassRules: {
                'rag-red': (params) => {
                    var inputlength = params?.data?.aadharNumber && params?.data?.aadharNumber?.toString();
                    inputlength = inputlength?.length;
                    if (params?.data?.aadharNumber && inputlength && inputlength !== 12) {
                        getErrorState(true);
                        return true;
                    } else if (params?.data?.aadharNumber === '' || inputlength === undefined) {
                        getErrorState(true);
                        return true;
                    } else {
                        getErrorState(false);
                        return false;
                    }
                },
            },
            suppressSizeToFit: true,
            cellStyle: {
                fontSize: '12px',
                cursor: 'pointer',
                width: '129px',
                left: '363px',
            },
            cellEditor: 'StaffAadharNumberEditorCmp',
            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
            },
            cellRendererParams: { setError: setError },
        },
        {
            field: 'address',
            headerName: 'Address',
            headerTooltip: 'Address',
            sortable: true,
            tooltipField: 'address',
            editable: true,
            resizable: true,
            width: 100,
            minWidth: 100,
            cellEditor: 'StaffAddressEditorCmp',
            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                user: user,
            },
            cellClass: (params) => {
                if (params?.data?.address === '') {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },
            cellClassRules: (params) => {
                if (params?.data?.address === '') {
                    getErrorState(true);

                    return true;
                } else {
                    getErrorState(false);
                    return false;
                }
            },
            cellRendererParams: { setError: setError },
            cellStyle: {
                fontSize: '12px',
                cursor: 'pointer',
                width: '85px',
                left: '513px',
            },
        },
        {
            field: 'staff_Status',
            headerName: 'Staff Status',
            headerTooltip: 'Staff Status',
            sortable: true,
            resizable: true,
            width: 125,
            minWidth: 125,
            cellStyle: { fontSize: '12px', cursor: 'pointer' },
            cellClass: (params) => {
                var staff_Status = params?.data?.staff_Status;
                if (staff_Status === '') {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },
            cellRenderer: (params: any) => (
                <>
                    <div style={{ marginTop: 2 }} className="padd-right">
                        <Autocomplete
                            id="combo-box-demo"
                            getOptionLabel={(option) => option?.categoryName?.toString()}
                            disableClearable={true}
                            options={params?.staffStatusOptions || []}
                            onChange={(e, value: any) => {
                                var currentIndex = params?.rowIndex;
                                var data = [...params?.staffInformation];
                                data[currentIndex].staff_Status = value;
                                data[currentIndex].staff_status_value = value?.categoryName;
                                params?.setStaffInformation(data);
                            }}
                            placeholder="Staff Status"
                            value={(params && params?.staffInformation[params?.rowIndex]?.staff_status_value && params?.generateStaffStatus(params?.staffInformation[params?.rowIndex]?.staff_status_value)) || null}
                            renderInput={(textParams) => (
                                <TextField
                                    name="staff_status"
                                    id="staff"
                                    {...textParams}
                                    InputProps={{
                                        ...textParams.InputProps,
                                    }}
                                    sx={{
                                        '.MuiInputBase-input': {
                                            height: '12px !important',
                                            fontSize: '12px',
                                            paddingLeft: '8px',
                                        },
                                    }}
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                        />
                    </div>
                </>
            ),
            cellRendererParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                staffStatusOptions: staffStatusOptions,
                generateStaffStatus: generateStaffStatus,
                setError: setError,
            },
        },
        {
            field: 'agencyName',
            headerName: 'Agency Name',
            headerTooltip: 'Agency Name',
            sortable: true,
            resizable: true,

            editable: (params) => params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent',
            width: 130,
            minWidth: 130,
            cellClass: (params) => {
                // let regex = new RegExp(/^[a-zA-Z ]*$/);
                let regex = new RegExp('^[a-zA-Z0-9_ .]*$');
                var agencyName = params?.data?.agencyName;
                if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.agencyName && regex.test(agencyName) === false) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && !params?.data?.agencyName) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },

            cellClassRules: {
                'rag-red': (params) => {
                    // let regex = new RegExp(/^[a-zA-Z ]*$/);
                    let regex = new RegExp('^[a-zA-Z0-9_ .]*$');
                    var agencyName = params?.data?.agencyName;
                    if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.agencyName && regex.test(agencyName) === false) {
                        getErrorState(true);

                        return true;
                    } else if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && !params?.data?.agencyName) {
                        getErrorState(true);

                        return true;
                    } else {
                        getErrorState(false);
                        return false;
                    }
                },
            },
            cellRendererParams: { setError: setError },
            suppressSizeToFit: true,
            cellStyle: { fontSize: '12px', cursor: 'pointer', width: '125px' },
            cellEditor: 'AgencyNameEditorCmp',

            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
            },
        },
        {
            field: 'agencyEmployeeID',
            headerName: 'Agency Employee ID',
            headerTooltip: 'Agency Employee ID',
            sortable: true,
            resizable: true,
            editable: (params) => params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent',
            width: 140,
            minWidth: 140,
            cellClass: (params) => {
                let regex = new RegExp(/^[a-zA-Z ]*$/);
                var branchName = params?.data?.branchName;
                if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.branchName && regex.test(branchName) === false) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && !params?.data?.branchName) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },
            cellClassRules: {
                'rag-red': (params) => {
                    let regex = new RegExp(/^[a-zA-Z ]*$/);
                    var branchName = params?.data?.branchName;
                    if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.branchName && regex.test(branchName) === false) {
                        getErrorState(true);

                        return true;
                    } else if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && !params?.data?.branchName) {
                        getErrorState(true);
                        return true;
                    } else {
                        getErrorState(false);
                        return false;
                    }
                },
            },
            cellRendererParams: { setError: setError },
            suppressSizeToFit: true,
            cellStyle: { fontSize: '12px', cursor: 'pointer', width: '135px' },
            cellEditor: 'BranchNameEditorCmp',
            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                setError: setError,
            },
        },
        {
            field: 'bankName',
            headerName: 'Bank Name',
            headerTooltip: 'Bank Name',
            sortable: true,
            resizable: true,
            editable: (params) => params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent',
            width: 140,
            minWidth: 140,
            cellClass: (params) => {
                let regex = new RegExp(/^[a-zA-Z ]*$/);
                var branchName = params?.data?.branchName;
                if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.branchName && regex.test(branchName) === false) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && !params?.data?.branchName) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },
            cellClassRules: {
                'rag-red': (params) => {
                    let regex = new RegExp(/^[a-zA-Z ]*$/);
                    var branchName = params?.data?.branchName;
                    if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.branchName && regex.test(branchName) === false) {
                        getErrorState(true);

                        return true;
                    } else if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && !params?.data?.branchName) {
                        getErrorState(true);
                        return true;
                    } else {
                        getErrorState(false);
                        return false;
                    }
                },
            },
            cellRendererParams: { setError: setError },
            suppressSizeToFit: true,
            cellStyle: { fontSize: '12px', cursor: 'pointer', width: '135px' },
            cellEditor: 'BranchNameEditorCmp',
            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                setError: setError,
            },
        },
        {
            field: 'accountNumber',
            headerName: 'Bank Account No',
            headerTooltip: 'Bank Account Number',
            sortable: true,
            resizable: true,
            editable: (params) => params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent',
            width: 150,
            minWidth: 150,
            cellClass: (params) => {
                let regex = new RegExp(/[0-9]{9,18}/);
                var accountNumber = params?.data?.accountNumber;
                if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.accountNumber && regex.test(accountNumber) === false) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && !params?.data?.accountNumber) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },

            cellClassRules: {
                'rag-red': (params) => {
                    let regex = new RegExp(/[0-9]{9,18}/);
                    var accountNumber = params?.data?.accountNumber;
                    if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.accountNumber && regex.test(accountNumber) === false) {
                        getErrorState(true);
                        return true;
                    } else if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && !params?.data?.accountNumber) {
                        getErrorState(true);

                        return true;
                    } else {
                        getErrorState(false);
                        return false;
                    }
                },
            },
            cellRendererParams: { setError: setError },
            suppressSizeToFit: true,
            cellStyle: { fontSize: '12px', cursor: 'pointer', width: '145px' },
            cellEditor: 'BankAccountNumberCmp',

            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                type: 'number',
                maxLength: 5,
                setError: setError,
            },
        },
        {
            field: 'ifsc',
            headerName: 'IFSC Code',
            headerTooltip: 'IFSC Code',
            sortable: true,
            resizable: true,
            editable: (params) => params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent',
            width: 120,
            minWidth: 120,
            cellClass: (params) => {
                let regex = new RegExp(/^[A-Z]{4}0[A-Z0-9]{6}$/);
                var ifsc = params?.data?.ifsc;

                if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && !params?.data?.ifsc) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },

            cellClassRules: {
                'rag-red': (params) => {
                    if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && !params?.data?.ifsc) {
                        getErrorState(true);

                        return true;
                    } else {
                        getErrorState(false);
                        return false;
                    }
                },
            },
            cellRendererParams: { setError: setError },
            suppressSizeToFit: true,
            cellStyle: { fontSize: '12px', cursor: 'pointer', width: '115px' },
            cellEditor: 'BankIFSCCodeCmp',
            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                setError: setError,
            },
        },
        {
            field: 'branchName',
            headerName: 'Branch Name',
            headerTooltip: 'Branch Name',
            sortable: true,
            resizable: true,
            editable: (params) => params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent',
            width: 140,
            minWidth: 140,
            cellClass: (params) => {
                let regex = new RegExp(/^[a-zA-Z ]*$/);
                var branchName = params?.data?.branchName;
                if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.branchName && regex.test(branchName) === false) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && !params?.data?.branchName) {
                    getErrorState(true);
                    setMandatoryError(true);
                    return 'cell-padding rag-red';
                } else {
                    getErrorState(false);
                    return 'cell-padding rag-red editTextClass';
                }
            },
            cellClassRules: {
                'rag-red': (params) => {
                    let regex = new RegExp(/^[a-zA-Z ]*$/);
                    var branchName = params?.data?.branchName;
                    if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && params?.data?.branchName && regex.test(branchName) === false) {
                        getErrorState(true);

                        return true;
                    } else if ((params?.data?.staff_Category?.categoryName === 'Permanent' || params?.data?.staff_Category === 'Permanent') && !params?.data?.branchName) {
                        getErrorState(true);
                        return true;
                    } else {
                        getErrorState(false);
                        return false;
                    }
                },
            },
            cellRendererParams: { setError: setError },
            suppressSizeToFit: true,
            cellStyle: { fontSize: '12px', cursor: 'pointer', width: '135px' },
            cellEditor: 'BranchNameEditorCmp',
            cellEditorParams: {
                staffInformation: staffInformation,
                setStaffInformation: setStaffInformation,
                setError: setError,
            },
        },
    ];
    React.useEffect(() => {
        if (mandate && mandate?.id !== undefined && mandate?.id !== 'noid') {
            const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(mandate?.id) && item?.module === module);

            if (apiType === '' && userAction !== undefined) {
                setUserAction(userAction);
            } else {
                let action = mandate;
                setUserAction(action);
            }
            if (params.source === 'list') {
                navigate(`/mandate/${mandate?.id}/${module}?source=list`, {
                    state: { apiType: apiType },
                });
            } else {
                navigate(`/mandate/${mandate?.id}/${module}`, {
                    state: { apiType: apiType },
                });
            }
        }
    }, [mandate]);
    const _getRuntimeId = (id) => {
        const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(id) && item?.module === module);
        return userAction?.runtimeId || 0;
    };

    const workFlowMandate = () => {
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: _getRuntimeId(mandate?.id) || 0,
            mandateId: mandate?.id || 0,
            tableId: mandate?.id || 0,
            remark: 'Created',
            createdBy: user?.UserName,
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: 'Created',
        };

        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ''}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occured !!'));
                    return;
                }

                if (response?.data === true) {
                    if (params?.source === 'list') {
                        navigate('/list/task');
                    } else {
                        navigate('/mandate');
                    }
                } else {
                    dispatch(fetchError('Error Occured !!'));
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const _validation = (data) => {
        let count = 0;
        let regExp = new RegExp('^[9,8,7,6][0-9]*$');
        let regex = /[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/;
        let regEx = new RegExp(/[0-9]{9,18}/);
        let regexAdhar = new RegExp(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/);
        const tempErr = {
            ['staff_Classification']: '',
            ['staff_cat_value']: '',
            ['staff_Count']: '',
            ['staff_Name']: '',
            ['panNumber']: '',
            ['mobileNo']: '',
            ['join_Date']: '',
            ['aadharNumber']: '',
            ['address']: '',
            ['staff_Status']: '',
            ['agencyName']: '',
            ['agencyEmployeeID']: '',
            ['bankName']: '',
            ['branchName']: '',
            ['accountNumber']: '',
            ['ifsc']: '',
        };
        if (data?.staff_Classification === '') {
            count++;
            tempErr['staff_Classification'] = 'Please enter Staff Classification';
        }
        if (data?.staff_Category === '') {
            count++;
            tempErr['staff_cat_value'] = 'Please enter Staff Category';
        }
        if (!data?.staff_Count) {
            count++;
            tempErr['staff_Count'] = 'Please enter Staff Count';
        }
        if (data?.staff_Name === '') {
            count++;
            tempErr['staff_Name'] = 'Please enter Staff Name';
        }

        if (data?.mobileNo === '') {
            count++;
            tempErr['mobileNo'] = 'Please enter Mobile Number';
        } else if (!regExp.test(data?.mobileNo)) {
            count++;
            tempErr['mobileNo'] = 'Contact Number must be start with 9,8,7 or 6';
        } else if (data?.mobileNo?.length !== 10) {
            count++;
            tempErr['mobileNo'] = 'Please enter 10 Digit Mobile Number';
        }
        if (!data?.aadharNumber) {
            count++;
            tempErr['aadharNumber'] = 'Please enter Aadhaar Card Number';
        } else if (regexAdhar.test(data?.aadharNumber) === false) {
            count++;
            tempErr['aadharNumber'] = 'Please enter valid Aadhaar Card Number';
        } else if (data?.aadharNumber?.length !== 12) {
            count++;
            tempErr['aadharNumber'] = 'Please enter 12 Digit Aadhar Number';
        }
        if (data?.address === '') {
            count++;
            tempErr['address'] = 'Please enter Address';
        }
        if (data?.staff_Status === '') {
            count++;
            tempErr['staff_Status'] = 'Please enter Staff Status';
        }
        if (data?.staff_Category === '' || data?.staff_Category === 'Permanent') {
            if (data?.panNumber === '') {
                count++;
                tempErr['panNumber'] = 'Please enter PAN Number';
            } else if (regex.test(data?.panNumber) === false) {
                count++;
                tempErr['panNumber'] = 'Please enter correct PAN Number';
            } else if (data?.panNumber?.length !== 10) {
                count++;
                tempErr['panNumber'] = 'Please enter 10 digit PAN Number';
            }
            if (data?.agencyName === '') {
                count++;
                tempErr['agencyName'] = 'Please enter Agency Name';
            }
            if (data?.agencyEmployeeID === '') {
                count++;
                tempErr['agencyEmployeeID'] = 'Please enter Agency Employee ID';
            }
            if (data?.bankName === '') {
                count++;
                tempErr['bankName'] = 'Please enter Bank Name';
            }
            if (data?.branchName === '') {
                count++;
                tempErr['branchName'] = 'Please enter Branch Name';
            }
            if (data?.accountNumber === '') {
                count++;
                tempErr['accountNumber'] = 'Please enter Account Number';
            } else if (regEx.test(data?.accountNumber) === false) {
                count++;
                tempErr['accountNumber'] = 'Please enter valid Account Number';
            }
            if (data?.ifsc === '') {
                count++;
                tempErr['ifsc'] = 'Please enter IFSC Code';
            }
        }
        setErrorMessage({ ...tempErr });
        return count;
    };
    const saveStaffDataAddForm = (e: any) => {
        e.preventDefault();
        let body =
            staffInformation &&
            staffInformation?.map((item) => {
                return {
                    id: item?.id || 0,
                    uid: '',
                    mandateId: item?.mandateId || 0,
                    staff_Classification: item?.staff_Classification || '',
                    staff_Category: item?.staff_cat_value || '',
                    staff_Count: (item?.staff_Count && parseInt(item?.staff_Count)) || 0,
                    staff_Name: item?.staff_Name || '',
                    panNumber: item?.panNumber.toUpperCase() || '',
                    mobileNo: item?.mobileNo || '',
                    join_Date: moment(item?.join_Date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    aadharNumber: item?.aadharNumber || 0,
                    address: item?.address || '',
                    staff_Status: item?.staff_status_value || '',
                    agencyName: item?.staff_cat_value === 'Permanent' ? item?.agencyName : '' || '',
                    agencyEmployeeID: item?.staff_cat_value === 'Permanent' ? item?.agencyEmployeeID : '' || '',
                    bankName: item?.staff_cat_value === 'Permanent' ? item?.bankName : '' || '',
                    branchName: item?.staff_cat_value === 'Permanent' ? item?.branchName : '' || '',
                    accountNumber: item?.staff_cat_value === 'Permanent' ? item?.accountNumber : '' || '',
                    ifsc: item?.staff_cat_value === 'Permanent' ? item?.ifsc : '' || '',
                    remarks: '',
                    isPhoto: false,
                    isDocuments: false,
                    status: 'string',
                    createdBy: user?.UserName || '',
                    createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    modifiedBy: user?.UserName || '',
                    modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                };
            });
        const noOfError = _validation(body[body?.length - 1]);
        if (noOfError > 0) return;
        if (open) {
            setOpen(false);
        }
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/StaffDetails/UpdateExcelData`, body)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Staff details saving operation failed !!!'));
                    return;
                }
                if (response?.data?.code === 200) {
                    dispatch(showMessage('Staff details saved successfully!'));
                    getStaffDetails();
                    return;
                } else {
                    dispatch(fetchError('Staff details saving operation failed !!!'));
                    return;
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Mandate Operation Faileld !!!'));
                return;
            });
    };

    const saveStaffData = (e: any) => {
        e.preventDefault();
        if (open) {
            setOpen(false);
        }
        if (mandatoryError) {
            dispatch(fetchError('Please fill valid data in Mandatory Field '));
            setMandatoryError(false);
            return;
        }
        let body =
            staffInformation &&
            staffInformation?.map((item) => {
                return {
                    id: item?.id || 0,
                    uid: '',
                    mandateId: item?.mandateId || 0,
                    staff_Classification: item?.staff_Classification || '',
                    staff_Category: item.staff_Category.categoryName || item?.staff_Category || '',
                    staff_Count: (item?.staff_Count && parseInt(item?.staff_Count)) || 0,
                    staff_Name: item?.staff_Name || '',
                    panNumber: item?.panNumber.toUpperCase() || '',
                    mobileNo: item?.mobileNo || '',
                    join_Date: moment(item?.join_Date).format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    aadharNumber: item?.aadharNumber || 0,
                    address: item?.address || '',
                    staff_Status: item?.staff_status_value || '',
                    agencyName: item?.staff_Category?.categoryName === 'Permanent' || item?.staff_Category === 'Permanent' ? item?.agencyName : '' || '',
                    agencyEmployeeID: item?.staff_Category?.categoryName === 'Permanent' || item?.staff_Category === 'Permanent' ? item?.agencyEmployeeID : '' || '',
                    bankName: item?.staff_Category?.categoryName === 'Permanent' || item?.staff_Category === 'Permanent' ? item?.bankName : '' || '',
                    branchName: item?.staff_Category?.categoryName === 'Permanent' || item?.staff_Category === 'Permanent' ? item?.branchName : '' || '',
                    accountNumber: item?.staff_Category?.categoryName === 'Permanent' || item?.staff_Category === 'Permanent' ? item?.accountNumber : '' || '',
                    ifsc: item?.staff_Category?.categoryName === 'Permanent' || item?.staff_Category === 'Permanent' ? item?.ifsc : '' || '',
                    remarks: '',
                    isPhoto: false,
                    isDocuments: false,
                    status: 'string',
                    createdBy: user?.UserName || '',
                    createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    modifiedBy: user?.UserName || '',
                    modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                };
            });

        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/StaffDetails/UpdateExcelData`, body)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Staff details saving operation failed !!!'));
                    return;
                }
                if (response?.data?.code === 200) {
                    dispatch(showMessage('Staff details saved successfully!'));
                    getStaffDetails();
                    workFlowMandate();
                    return;
                } else {
                    dispatch(fetchError('Staff details saving operation failed !!!'));
                    getStaffDetails();
                    return;
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Mandate Operation Faileld !!!'));
                return;
            });
    };
    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        params.api.sizeColumnsToFit();
    }
    return (
        <div>
            <div style={{ height: 'calc(100vh - 369px)' }}>
                <div style={{ paddingTop: '7px' }}>
                    <Button
                        variant="outlined"
                        size="medium"
                        onClick={(e) => {
                            setOpen(true);
                            if (staffInformation && staffInformation?.length > 0) {
                                var data = [...staffInformation];
                                var index = staffInformation?.length > 0 ? staffInformation?.length - 1 + 1 : 0;
                                var _index = 0;
                                if (staffInformation?.length === 1 && staffInformation?.[staffInformation?.length - 1]?.id == 0) {
                                    _index = 0;
                                } else {
                                    _index = index;
                                }
                                var obj = {
                                    id: 0,
                                    uid: '',
                                    mandateId: mandate?.id || 0,
                                    staff_Classification: '',
                                    staff_Category: '',
                                    staff_Count: '',
                                    staff_Name: '',
                                    panNumber: '',
                                    mobileNo: '',
                                    join_Date: null || new Date(),
                                    aadharNumber: '',
                                    address: '',
                                    staff_Status: '',
                                    agencyName: '',
                                    agencyEmployeeID: '',
                                    bankName: '',
                                    branchName: '',
                                    accountNumber: '',
                                    ifsc: '',
                                    remarks: '',
                                    isPhoto: false,
                                    isDocuments: false,
                                    status: 'string',
                                    createdBy: user?.UserName || '',
                                    createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                                    modifiedBy: user?.UserName || '',
                                    modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                                };
                                data[_index] = obj;
                                setStaffInformation(data);
                            } else {
                                var data = [];
                                var index = 0;
                                var obj = {
                                    id: 0,
                                    uid: '',
                                    mandateId: mandate?.id || 0,
                                    staff_Classification: '',
                                    staff_Category: '',
                                    staff_Count: '',
                                    staff_Name: '',
                                    panNumber: '',
                                    mobileNo: '',
                                    join_Date: null || new Date(),
                                    aadharNumber: '',
                                    address: '',
                                    staff_Status: '',
                                    agencyName: '',
                                    agencyEmployeeID: '',
                                    bankName: '',
                                    branchName: '',
                                    accountNumber: '',
                                    ifsc: '',
                                    remarks: '',
                                    isPhoto: false,
                                    isDocuments: false,
                                    status: 'string',
                                    createdBy: user?.UserName || '',
                                    createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                                    modifiedBy: user?.UserName || '',
                                    modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                                };
                                data.push(obj);
                                setStaffInformation(data);
                            }
                        }}
                        style={{
                            marginBottom: 6,
                            padding: '2px 20px',
                            borderRadius: 6,
                            color: '#fff',
                            borderColor: '#00316a',
                            backgroundColor: '#00316a',
                        }}
                    >
                        Add Staff
                    </Button>
                    <StaffForm
                        staffInformation={staffInformation}
                        saveStaffData={saveStaffDataAddForm}
                        setStaffInformation={setStaffInformation}
                        generateStaffCategory={generateStaffCategory}
                        staffCategoryOptions={staffCategoryOptions}
                        staffStatusOptions={staffStatusOptions}
                        generateStaffStatus={generateStaffStatus}
                        errorMessage={errorMessage}
                        open={open}
                        handleClose={handleClose}
                        setErrorMessage={setErrorMessage}
                    />
                </div>
                <CommonGrid
                    gridRef={gridRef}
                    getRowId={(data) => {
                        return data && data?.data?.custom_id;
                    }}
                    getRowStyle={() => {
                        return { background: 'white' };
                    }}
                    components={components}
                    rowHeight={35}
                    defaultColDef={{
                        singleClickEdit: true,
                        flex: 1,
                    }}
                    columnDefs={columnDefs}
                    rowData={staffInformation || []}
                    onGridReady={onGridReady}
                    pagination={false}
                    paginationPageSize={5}
                />
            </div>
            <div className="bottom-fix-history" style={{ bottom: 58 }}>
                {mandate && mandate?.id !== undefined && <MandateStatusHistory mandateCode={mandate?.id} accept_Reject_Status={currentStatus} accept_Reject_Remark={currentRemark} />}
            </div>
            {userAction?.action !== 'View' && userAction?.module === module && (
                <div className="bottom-fix-btn">
                    <Button
                        variant="outlined"
                        size="medium"
                        onClick={(e) => {
                            saveStaffData(e);
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
                        Submit
                    </Button>
                </div>
            )}
        </div>
    );
};
export default StaffInformation;
