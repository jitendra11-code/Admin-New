import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Autocomplete, Box, Button, Checkbox, Dialog, DialogContent, FormControlLabel, Grid, IconButton, InputAdornment, Stack, TextField, alpha } from '@mui/material';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import ConfirmationDiaglogBox from './Component/ConfirmationDiaglogBox';
import { AgGridReact } from 'ag-grid-react';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import { regExpressionRemark, textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import AppTooltip from '@uikit/core/AppTooltip';
import { AiFillFileExcel } from 'react-icons/ai';
import SearchIcon from '@mui/icons-material/Search';

const Content = () => {
    const [projectManagerRole, setProjectManagerRole] = useState({});
    const [open, setOpen] = React.useState(false);
    const [remark, setRemark] = React.useState('');
    const [mandateList, setMandateList] = useState<any>([]);
    const [selectedMandates, setSelectedMandates] = useState<any>([]);
    const [role, setRole] = React.useState(null);
    const [currentUser, setCurrentUser] = React.useState(null);
    const [newUser, setNewUser] = React.useState(null);
    const [newUserList, setNewUserList] = React.useState(null);
    const [selectAllBox, setSelectAllBox] = useState(false);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [checked, setChecked] = React.useState({});
    const [roleList, setRoleList] = useState<any>([]);
    const [userListByRole, setUserListByRole] = useState([]);
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthUser();
    const [tempIndex, setTempIndex] = useState(null);
    const [filterUserListByRole, setfilterUserListByRole] = useState(null);
    const [commonVerticalType, setCommonVerticalType] = useState(null);

    const apiType = location?.state?.apiType || '';
    const [transactionCheckBox, setTransactionCheckBox] = useState(true);
    const [myTaskCheckBox, setMyTaskCheckBox] = useState(true);

    const onFilterTextChange = (e) => {
        gridApi?.setQuickFilter(e?.target?.value);
        if (gridApi.getDisplayedRowCount() == 0) {
            dispatch(fetchError('Data not found!'));
        }
    };

    useEffect(() => {
        if (user?.role == 'Vertical Head') {
            let selectRole = roleList?.find((role) => role?.role_Name == 'Project Delivery Manager');
            setProjectManagerRole(selectRole);
        }
        if (user?.role == 'Project Delivery Manager') {
            let selectRole = roleList?.find((role) => role?.role_Name == 'Project Manager');
            setProjectManagerRole(selectRole);
        }
        if (user?.role == 'Branch Regional Manager') {
            let selectRole = roleList?.find((role) => role?.role_Name == 'Sourcing Associate');
            setProjectManagerRole(selectRole);
        }
    }, [roleList]);

    useEffect(() => {
        if (user?.role == 'Vertical Head') {
            getNewUserList();
        } else if (user?.role == 'Branch Regional Manager') {
            getUserLisetByRole(projectManagerRole);
        } else if (user?.role == 'Project Delivery Manager') {
            getUserLisetByRole(projectManagerRole);
        }
    }, [projectManagerRole]);

    const handleCheck1 = () => {
        setTransactionCheckBox(!transactionCheckBox);
    };

    const handleCheck2 = () => {
        setMyTaskCheckBox(!myTaskCheckBox);
    };
    const getMandateList = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/mandatesListForReassign?pageNumber=1&pageSize=100&sort=%7B%7D&filter=[]&apitype=${apiType || ''}`)
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data && response?.data?.length > 0) {
                    setMandateList(response?.data || []);
                } else {
                    setMandateList([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    const getRoleList = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/User/RoleList`)
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data && response?.data?.length > 0) {
                    setRoleList(response?.data || []);
                } else {
                    setRoleList([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const getUserLisetByRole = (selectedRole) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/User/UsersByRoleId?Id=${selectedRole?.id || 0}`)
            .then((response: any) => {
                if (!response) return;
                console.log('RES', response);
                if (response && response?.data && response?.data?.length > 0) {
                    setUserListByRole(response?.data || []);
                } else {
                    setUserListByRole([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const getNewUserList = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetPDMByVerticalHead?fk_vertical_head=${user?.id || 0}`)
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data && response?.data?.length > 0) {
                    setNewUserList(response?.data || []);
                } else {
                    setNewUserList([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    useEffect(() => {
        getMandateList();
        getRoleList();
    }, []);

    useEffect(() => {
        if (checked !== null) {
            setSelectAllBox(false);
        }
    }, [checked]);

    const onHeaderCheckboxChange = (event, params) => {
        if (event.target.checked) {
            gridApi.selectAll();
            params?.setSelectAllBox(true);
            const selectedNodes = gridRef.current.api.getSelectedNodes();
            const selectedData = selectedNodes.map((node) => node.data);
            const commonVerticalType1 = getCommonVerticalType(Object.values(selectedData));
            setCommonVerticalType(commonVerticalType1);
            if (commonVerticalType1 == null) {
                dispatch(fetchError('You can only select rows with the same vertical.'));
                setCommonVerticalType(null);
                gridApi.deselectAll();
                params?.setChecked({});
                params?.setSelectedMandates({});
                params?.setSelectAllBox(false);
                return;
            }
        } else {
            gridApi.deselectAll();
            params?.setChecked({});
            params?.setSelectedMandates({});
            params?.setSelectAllBox(false);
        }
    };

    const getCommonVerticalType = (selectedRows) => {
        const uniqueVerticalTypes = new Set(selectedRows.map((row) => row.verticalName));
        if (uniqueVerticalTypes.size === 1) {
            return uniqueVerticalTypes.values().next().value; // Return the common vertical type
        }
        return null; // No common vertical type
    };

    const CustomHeaderCheckbox = ({ selectAllBox, displayName, ...params }) => {
        const commonVerticalType1 = getCommonVerticalType(Object.values(params.selectedMandates));
        setCommonVerticalType(commonVerticalType1);

        const temperror = selectedMandates[tempIndex] ? true : false;

        if (commonVerticalType1 == null && temperror) {
            dispatch(fetchError('You can only select rows with the same vertical.'));
            gridApi.deselectAll();
            params?.setChecked({});
            params?.setSelectedMandates({});
            params?.setSelectAllBox(false);
        }

        return (
            <div style={{ textAlign: 'left' }}>
                <>
                    {mandateList && mandateList?.length > 0 && (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectAllBox || false}
                                    onChange={(e) => {
                                        onHeaderCheckboxChange(e, params);
                                    }}
                                />
                            }
                            label=""
                            style={{ marginRight: '0px' }}
                        />
                    )}
                </>
                <span>{displayName}</span>
            </div>
        );
    };

    let columnDefs = [
        {
            field: 'medals.bronze',
            headerName: 'Actions',
            headerTooltip: 'Actions',
            resizable: true,
            headerComponent: CustomHeaderCheckbox,
            headerComponentParams: {
                checked: checked,
                setChecked: setChecked,
                selectedMandates: selectedMandates,
                selectAllBox: selectAllBox,
                setSelectAllBox: setSelectAllBox,
                setSelectedMandates: setSelectedMandates,
            },

            width: 120,
            minWidth: 100,
            pinned: 'left',
            cellRenderer: (e: any) => (
                <>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={checked[e?.rowIndex] || selectAllBox || false}
                                onChange={() => {
                                    checked[e?.rowIndex] = checked[e?.rowIndex] === undefined ? true : !checked[e?.rowIndex];
                                    setChecked({ ...checked });
                                    if (checked[e?.rowIndex] === undefined || checked[e?.rowIndex]) {
                                        selectedMandates[e?.rowIndex] = { ...e?.data };
                                        setSelectedMandates({ ...selectedMandates });
                                        setTempIndex(e?.rowIndex);
                                    } else if (!checked[e?.rowIndex]) {
                                        delete selectedMandates[e?.rowIndex];
                                        setSelectedMandates({ ...selectedMandates });
                                    }
                                }}
                            />
                        }
                        label=""
                    />
                </>
            ),
        },
        {
            field: 'mandateCode',
            headerName: 'Mandate Code',
            headerTooltip: 'Mandate Code',
            filter: true,
            width: 170,
            minWidth: 120,
            sortable: true,
            resizable: true,

            cellStyle: { fontSize: '13px' },
        },

        {
            field: 'verticalName',
            headerName: 'Geo Vertical',
            headerTooltip: 'Geo Vertical',
            sortable: true,
            resizable: true,
            filter: true,
            width: 160,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'admin_vertical',
            headerName: 'Admin Vertical',
            headerTooltip: 'Admin Vertical',
            sortable: true,
            resizable: true,
            filter: true,
            width: 160,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'branchTypeName',
            headerName: 'Branch Type',
            headerTooltip: 'Branch Type',
            sortable: true,
            resizable: true,
            filter: true,
            width: 150,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'glCategoryName',
            headerName: 'GL Category',
            headerTooltip: 'GL Category',
            sortable: true,
            resizable: true,
            filter: true,
            width: 150,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'state',
            headerName: 'State',
            headerTooltip: 'State',
            sortable: true,
            resizable: true,
            filter: true,
            width: 150,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'location',
            headerName: 'Location Name',
            headerTooltip: 'Location Name',
            sortable: true,
            resizable: true,
            filter: true,
            width: 150,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'projectManagerName',
            headerName: 'Project Manager Name',
            headerTooltip: 'Project Manager Name',
            sortable: true,
            hide: user?.role == 'Project Delivery Manager' ? false : true,
            resizable: true,
            width: 170,
            minWidth: 170,
            filter: true,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'sourcingAssociate',
            headerName: 'Sourcing Associate',
            headerTooltip: 'Sourcing Associate',
            sortable: true,
            hide: user?.role == 'Branch Regional Manager' ? false : true,
            resizable: true,
            width: 150,
            minWidth: 150,
            filter: true,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'mandate_ProjectDeliveryManger',
            headerName: 'Project Delivery Manager Name',
            headerTooltip: 'Project Delivery Manager Name',
            sortable: true,
            resizable: true,
            hide: user?.role == 'Vertical Head' ? false : true,
            width: 190,
            minWidth: 190,
            filter: true,
            cellStyle: { fontSize: '13px' },
        },
    ];

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }

    const handleClose = () => {
        setRole(null);
        setCurrentUser(null);
        setNewUser(null);
        setfilterUserListByRole(null);
        setMyTaskCheckBox(true);
        setTransactionCheckBox(true);
        setSelectedMandates({});
        setRemark('');
        if (selectAllBox) {
            setSelectAllBox(false);
        }
        setChecked({});
        gridApi.deselectAll();
        setOpen(false);
        setOpenConfirmation(false);
    };
    const handleOpen = () => {
        // getNewUserList();
        setRole(projectManagerRole);
        const filter = userListByRole?.filter((v) => v?.verticalType === selectedMandates[tempIndex]?.admin_vertical || v?.verticalType === selectedMandates[tempIndex]?.verticalName);
        console.log('AfterFilter', filter, userListByRole, selectedMandates[tempIndex]);
        setfilterUserListByRole(filter);
        setOpen(true);
        const selectedData = [];
        gridApi?.forEachNodeAfterFilterAndSort((node) => {
            if (node.isSelected()) {
                selectedData.push(node.data);
            }
        });
        if (selectedData && selectedData?.length > 0) {
            setSelectedMandates(selectedData);
        }
    };
    const handleConfirm = () => {
        const _mandates = Object?.values(selectedMandates);
        var mandateList: any;
        mandateList = (_mandates && _mandates?.length > 0 && _mandates.map((item: any) => item?.id).join(',')) || '';
        axios
            .post(
                `${process.env.REACT_APP_BASEURL}/api/User/SaveReassignUserByMandateHistory?MandateIdList=${mandateList || ''}&RoleId=${role?.id || 0}&CurrentUserId=0&NewUserId=${newUser?.id || 0}&IsTransaction=${transactionCheckBox ? true : false}&IsMyTask=${
                    myTaskCheckBox ? true : false
                }&remarks=${remark}`,
            )
            .then((response: any) => {
                if (!response) {
                    setChecked({});
                    setRemark('');
                    handleClose();
                    dispatch(fetchError('The user is not reassigned to task/mandates successfully!'));
                    return;
                }
                if (response?.data?.code === 200) {
                    setChecked({});
                    setRemark('');
                    handleClose();
                    dispatch(showMessage('The user is reassigned to task/mandates successfully!'));
                    getMandateList();
                    return;
                }
                setChecked({});
                setRemark('');
                handleClose();
                dispatch(fetchError('The user is not reassigned to task/mandates successfully!'));
                return;
            })
            .catch((e: any) => {
                setChecked({});
                setRemark('');
                handleClose();
                dispatch(fetchError('Error Occurred!'));
                return;
            });
    };
    const handleSubmit = () => {
        if (role !== null && newUser !== null) {
            if (transactionCheckBox === false && myTaskCheckBox === false) {
                dispatch(fetchError('Please select Transaction or My Task Option !'));
                return;
            }
            setOpenConfirmation(true);
        } else {
            dispatch(fetchError('Please select mandatory fields !'));
            return;
        }
    };

    const handleExportData = () => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/Mandates/ExcelDownloadFormandatesListForReassign?apitype=${apiType || ''}`).then((response) => {
            if (!response) {
                dispatch(fetchError('Error occurred in Export !!!'));
                return;
            }
            if (response?.data) {
                var filename = 'ReassignUsersToTask.xlsx';
                if (filename && filename === '') {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                const binaryStr = atob(response?.data);
                const byteArray = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    byteArray[i] = binaryStr.charCodeAt(i);
                }

                var blob = new Blob([byteArray], {
                    type: 'application/octet-stream',
                });
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

                    dispatch(showMessage('Reassign Users To Task data downloaded successfully!'));
                }
            }
        });
    };
    console.log('777', currentUser, user?.role);
    return (
        <>
            <Grid
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '5px',
                    marginLeft: '10px',
                }}
            >
                <Box component="h2" className="page-title-heading mb-0 ml-5">
                    Reassign Users To Task/Mandates
                </Box>
                <div className="phase-grid">
                    <Stack display="flex" alignItems="flex-end" justifyContent="space-between" flexDirection="row" sx={{ mb: -2, marginRight: '7px' }}>
                        <TextField
                            size="small"
                            variant="outlined"
                            name="search"
                            onChange={(e) => onFilterTextChange(e)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <AppTooltip title="Export Excel">
                            <IconButton
                                className="icon-btn"
                                sx={{
                                    // borderRadius: "50%",
                                    // borderTopColor:"green",
                                    width: 35,
                                    height: 35,
                                    // color: (theme) => theme.palette.text.secondary,
                                    color: 'white',
                                    backgroundColor: 'green',
                                    '&:hover, &:focus': {
                                        backgroundColor: 'green', // Keep the color green on hover
                                    },
                                }}
                                onClick={() => {
                                    handleExportData();
                                }}
                                size="large"
                            >
                                <AiFillFileExcel />
                            </IconButton>
                        </AppTooltip>
                    </Stack>
                </div>
            </Grid>
            <div
                style={{
                    padding: '20px !important',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    margin: 10,
                }}
                className="card-panal"
            >
                {((selectedMandates && Object?.values(selectedMandates)?.length !== 0 && commonVerticalType) || (selectAllBox && commonVerticalType)) && (
                    <div>
                        <Button
                            style={primaryButtonSm}
                            sx={{
                                color: '#fff',
                                fontSize: '12px',
                                marginBottom: '10px',
                            }}
                            onClick={() => {
                                handleOpen();
                            }}
                        >
                            Change Users
                        </Button>
                        <ConfirmationDiaglogBox
                            handleConfirm={() => {
                                handleConfirm();
                            }}
                            open={openConfirmation}
                            setOpen={setOpenConfirmation}
                            handleClose={() => {
                                setOpenConfirmation(false);
                            }}
                        />
                        <Dialog open={open} onClose={handleClose} aria-describedby="alert-dialog-slide-description" maxWidth="lg">
                            <DialogContent style={{ width: '500px' }}>
                                <Grid container item display="flex" flexDirection="row" spacing={2} justifyContent="start" alignSelf="center">
                                    <Grid item xs={12} md={12} sx={{ position: 'relative', marginBottom: '10px' }}>
                                        <div className="">
                                            <h2 className="phaseLable required">Role</h2>
                                            <Autocomplete
                                                disablePortal={false}
                                                style={{ zIndex: 9999999 }}
                                                id="combo-box-demo"
                                                getOptionLabel={(option) => option?.role_Name?.toString() || ''}
                                                disabled={user?.role == 'Vertical Head' || user?.role == 'Project Delivery Manager' || user?.role == 'Branch Regional Manager' ? true : false}
                                                disableClearable={true}
                                                options={roleList || []}
                                                value={role || ''}
                                                onChange={(e, value) => {
                                                    setRole(value);
                                                    getUserLisetByRole(value);
                                                    setCurrentUser(null);
                                                    setNewUser(null);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        name="roleId"
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
                                    </Grid>
                                    <Grid item xs={12} md={12} sx={{ position: 'relative', marginBottom: '10px' }}>
                                        <div className="">
                                            <h2 className="phaseLable required">Current User</h2>
                                            {user?.role == 'Vertical Head' ? (
                                                Array.from(new Set(Object.keys(selectedMandates)?.map((v: any) => selectedMandates[v]?.mandate_ProjectDeliveryManger)))?.join(',')
                                            ) : user?.role == 'Project Delivery Manager' ? (
                                                Array.from(new Set(Object.keys(selectedMandates)?.map((v: any) => selectedMandates[v]?.projectManagerName)))?.join(',')
                                            ) : user?.role == 'Branch Regional Manager' ? (
                                                Array.from(new Set(Object.keys(selectedMandates)?.map((v: any) => selectedMandates[v]?.sourcingAssociate)))?.join(',')
                                            ) : (
                                                <Autocomplete
                                                    disablePortal={false}
                                                    style={{ zIndex: 9999999 }}
                                                    id="combo-box-demo"
                                                    getOptionLabel={(option) => option?.userName?.toString() || ''}
                                                    disableClearable={true}
                                                    options={userListByRole || []}
                                                    value={currentUser || ''}
                                                    onChange={(e, value) => {
                                                        setCurrentUser(value);
                                                        setNewUser(null);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            name="userListByRole"
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
                                            )}
                                        </div>
                                    </Grid>
                                    <Grid item xs={12} md={12} sx={{ position: 'relative', marginBottom: '10px' }}>
                                        <div className="">
                                            <h2 className="phaseLable required">New User</h2>
                                            <Autocomplete
                                                disablePortal={false}
                                                style={{ zIndex: 9999999 }}
                                                id="combo-box-demo"
                                                getOptionLabel={(option) => option?.userName?.toString() || ''}
                                                disableClearable={true}
                                                options={user?.role == 'Vertical Head' ? newUserList : filterUserListByRole || []}
                                                value={newUser}
                                                onChange={(e, value) => {
                                                    setNewUser(value);
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
                                        </div>
                                    </Grid>
                                    <Grid item xs={12} md={12} sx={{ position: 'relative', marginBottom: '10px' }}>
                                        <TextField
                                            autoComplete="off"
                                            name="remark"
                                            id="remark"
                                            style={{ marginRight: '10px' }}
                                            size="small"
                                            placeholder="Remark"
                                            value={remark}
                                            multiline
                                            onChange={(e) => setRemark(e?.target?.value)}
                                            InputProps={{ inputProps: { maxLength: 150 } }}
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
                                    </Grid>
                                    <Grid marginLeft={'-15px'} marginBottom={'10px'} container spacing={6}>
                                        <Grid item>
                                            <FormControlLabel control={<Checkbox checked={transactionCheckBox} onChange={handleCheck1} />} label="Transaction" />
                                        </Grid>
                                        <Grid item>
                                            <FormControlLabel control={<Checkbox checked={myTaskCheckBox} onChange={handleCheck2} />} label="My Task" />
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} md={12} sx={{ position: 'relative', marginBottom: '10px' }}>
                                        <div className="row centerProj">
                                            <Button
                                                className="yes-btn"
                                                onClick={() => handleSubmit()}
                                                style={{
                                                    marginLeft: 10,
                                                    borderRadius: 6,
                                                }}
                                            >
                                                Submit
                                            </Button>
                                            <Button
                                                className="no-btn"
                                                onClick={handleClose}
                                                style={{
                                                    marginLeft: 10,
                                                    borderRadius: 6,
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
                <div className="ag-theme-alpine" style={{ height: '72vh' }}>
                    <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={mandateList || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} rowSelection={'multiple'} suppressRowClickSelection={true} />
                </div>
            </div>
        </>
    );
};

export default Content;
