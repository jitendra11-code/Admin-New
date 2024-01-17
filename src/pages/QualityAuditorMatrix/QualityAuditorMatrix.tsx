import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormHelperText, Grid, IconButton, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import AppTooltip from '@uikit/core/AppTooltip';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { AiFillFileExcel } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import { primaryButtonSm } from 'shared/constants/CustomColor';

function QualityAuditorMatrix() {
    const [LeftSideData, setLeftSideData] = useState([]);
    const gridRef = React.useRef<AgGridReact>(null);
    const gridRef2 = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [selectedLeftsideData, setSelectedLeftsideData] = useState<any>({});
    const [RighttSideData, setRighttSideData] = useState([]);
    const [open, setOpen] = React.useState(false);
    const { user } = useAuthUser();
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedUser, setSelectedUser] = useState([]);
    const dispatch = useDispatch();
    const [userList, setUserList] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [fromValueMatrix, setFromValueMatrix] = useState(null);
    const [toValueMatrix, setToValueMatrix] = useState(null);
    const [matrixStatus, setMatrixStatus] = useState('');
    const [userListMatrix, setUserListMatrix] = useState([]);
    const [selectedUserMatrix, setSelectedUserMatrix] = useState([]);
    const [selectedRoleMatrix, setSelectedRoleMatrix] = useState(null);
    const [roleListMatrix, setRoleListMatrix] = useState([]);
    const [openMatrix, setOpenMatrix] = React.useState(false);
    const insertRef = useRef(false);
    const [fromValueError, setFromValueError] = useState(false);
    const [toValueError, setToValueError] = useState(false);
    const [matrixStatusError, setMatrixStatusError] = useState(false);
    const [selectedRoleMatrixError, setSelectedRoleMatrixError] = useState(false);
    const [selectedUserMatrixError, setSelectedUserMatrixError] = useState(false);
    const [selectedUserAddError, setSelectedUserAddError] = useState(false);

    const getLeftSideData = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/QualityAuditorMatrix/GetQualityAuditorMatrixList`)
            .then((response: any) => {
                setLeftSideData(response?.data || []);
                showRightData(response?.data?.[0] || {});
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        getLeftSideData();
    }, []);

    useEffect(() => {
        if (gridRef.current && gridRef.current!.api) {
            gridRef.current.api.forEachNode((node, index) => {
                if (index === 0) {
                    node.setSelected(true);
                }
            });
        }
    }, [LeftSideData]);

    const handleClose = () => {
        setOpen(false);
        setOpenMatrix(false);
        setSelectedUserMatrix([])
        setSelectedUser([])
        setFromValueMatrix('')
        setToValueMatrix('')
        setMatrixStatus('')
        setSelectedRoleMatrix('')
        setFromValueError(false);
        setToValueError(false);
        setMatrixStatusError(false);
        setSelectedRoleMatrixError(false);
        setSelectedUserMatrixError(false);
        setSelectedUserAddError(false);
        setUserListMatrix([])
    };

    const showRightData = async (data: any) => {
        setSelectedLeftsideData(data);
        console.log('selectedLeftsideData', selectedLeftsideData, data);
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/QualityAuditorMatrix/GetUsersAccordingMatrix?fromValue=${data?.fromValue}&toValue=${data?.toValue}&RoleName=${data?.roleName}`)
            .then((response: any) => {
                setRighttSideData(response?.data || []);
            })
            .catch((e: any) => {});
    };
    console.log('selectedLeftsideData', selectedLeftsideData);
    //   useEffect(() => {
    //     showRightData(selectedLeftsideData)
    //   }, []);

    const onAddUser = async () => {
        let formIsValid = true;

        if (!selectedRole) {
            setSelectedRoleMatrixError(true);
            formIsValid = false;
        }
    
        if (selectedUser.length === 0) {
            setSelectedUserAddError(true);
            formIsValid = false;
        }

        if (!formIsValid) {
            return;
        }

        const body = selectedUser.map((item) => {
            return {
                id: 0,
                uid: 'string',
                fromValue: selectedLeftsideData?.fromValue || 0,
                toValue: selectedLeftsideData?.toValue || 0,
                roleName: selectedLeftsideData?.roleName || '',
                apiType: "Add New User",
                userId: item?.id || 0,
                //   isBudgeted: radioButton == "Budgeted" ? true : false,
                status: selectedLeftsideData?.status || "",
                userStatus: 'Active',
                createdBy: user?.UserName,
                createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                modifiedBy: user?.UserName,
                modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            };
        });
        await axios
            .post(`${process.env.REACT_APP_BASEURL}/api/QualityAuditorMatrix/InsertQualityAuditorMatrixList`, body)
            .then((response: any) => {
                setOpen(false);
                showRightData(selectedLeftsideData);
                setSelectedRole({});
                setSelectedUser([]);
                dispatch(showMessage('User added successfully'));
            })
            .catch((e: any) => {});
    };

    const onAddMatrix = async () => {
        let formIsValid = true;
        if (fromValueMatrix === null || fromValueMatrix === '') {
            setFromValueError(true);
            formIsValid = false;
        }
        if (toValueMatrix === null || toValueMatrix === '') {
            setToValueError(true);
            formIsValid = false;
        }
        if (matrixStatus === '') {
            setMatrixStatusError(true);
            formIsValid = false;
        }
        if (!selectedRoleMatrix) {
            setSelectedRoleMatrixError(true);
            formIsValid = false;
        }
        if (selectedUserMatrix.length === 0) {
            setSelectedUserMatrixError(true);
            formIsValid = false;
        }
    
        if (!formIsValid) {
            return;
        }
    
        if (parseInt(fromValueMatrix) >= parseInt(toValueMatrix)) {
            dispatch(fetchError("To Value should be greater than From Value"));
            return;
        }  
        else{
            let flag = false;
            if (fromValueMatrix === null || toValueMatrix === null) return;
            const arr = [...LeftSideData];
            console.log("arrr",arr)
            arr?.map((item) => {
                // if (item?.roleName === selectedRoleMatrix?.role_Name && ((minValueMatrix >= item?.minValue && minValueMatrix <= item?.maxValue) || (maxValueMatrix >= item?.minValue && maxValueMatrix <= item?.maxValue))) {
                if ( ((fromValueMatrix > item?.fromValue && fromValueMatrix < item?.toValue) || (toValueMatrix > item?.fromValue && toValueMatrix < item?.toValue))) {
                    flag = true;
                    dispatch(fetchError('Range should not lie in existing ranges'));
                    return;

                }
                const arryRole = item?.roleName.split(',');
                console.log('arryRole',arryRole,arryRole?.includes(selectedRoleMatrix?.role_Name))
                    if (((fromValueMatrix >= item?.fromValue && fromValueMatrix <= item?.toValue) || (toValueMatrix >= item?.fromValue && toValueMatrix <= item?.toValue)) 
                    && arryRole?.includes(selectedRoleMatrix?.role_Name) === true)
                    {
                    flag = true;
                    dispatch(fetchError('Role Name already exit in this range!!')); 
                    return;
                    }
                // if (item?.roleName === selectedRoleMatrix?.role_Name && ((fromValueMatrix >= item?.fromValue && fromValueMatrix <= item?.toValue) || (toValueMatrix >= item?.fromValue && toValueMatrix <= item?.toValue))) {
                //     // if (((fromValueMatrix >= item?.fromValue && fromValueMatrix <= item?.toValue) || (toValueMatrix >= item?.fromValue && toValueMatrix <= item?.toValue))) {
                //     flag = true;
                //     dispatch(fetchError('Range should not lie in existing ranges'));
                //     return;
                // }
            });

            if (flag) return;
            const body = selectedUserMatrix.map((item) => {
                return {
                    id: 0,
                    uid: 'uid',
                    fromValue: fromValueMatrix || 0,
                    toValue: toValueMatrix || 0,
                    roleName: selectedRoleMatrix?.role_Name || '',
                    apiType: "Add New Matrix",
                    userId: item?.id || 0,
                    status: matrixStatus || '',
                    userStatus: 'Active',
                    createdBy: user?.UserName,
                    createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    modifiedBy: user?.UserName,
                    modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                };
            });
            await axios
            .post(`${process.env.REACT_APP_BASEURL}/api/QualityAuditorMatrix/InsertQualityAuditorMatrixList`, body)
            .then((response: any) => {
                console.log('res123', response);
                // if (response && response?.data?.code === 400 && response?.data?.status === false) {
                //     dispatch(fetchError(response?.data?.message));
                //     insertRef.current = true; 
                //     setUserListMatrix([])
                // }
                if (response && response?.data?.code === 200 && response?.data?.status === true) {
                    dispatch(showMessage('Matrix added successfully!!'));
                    insertRef.current = true; 
                    setUserListMatrix([])
                }
                setOpenMatrix(false);
                // showRightData(selectedLeftsideData)
                setSelectedRoleMatrix({});
                setSelectedUserMatrix([]);
                setFromValueMatrix(null);
                setToValueMatrix(null);
                setMatrixStatus('');
                getLeftSideData();
            })
            .catch((e: any) => {});
        }
    };

    const handleClickOpen = async () => {
        console.log('selectedRole', selectedRole);
        setOpen(true);
        let role = selectedLeftsideData?.roleName?.split(',');
        let roleList = role?.map((v) => ({ roleName: v }));
        setRoleList(roleList);
        setSelectedRole(roleList?.[0]);
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/QualityAuditorMatrix/AddUsersInQualityAuditorMatrix?fromValue=${selectedLeftsideData?.fromValue}&toValue=${selectedLeftsideData?.toValue}&RoleName=${selectedLeftsideData?.roleName}`)
            .then((response: any) => {
                setUserList(response?.data || []);
            })
            .catch((e: any) => {});
    };

    const handleClickMatrixOpen = async () => {
        setOpenMatrix(true);
        await axios.get(`${process.env.REACT_APP_BASEURL}/api/User/RoleList`).then((response: any) => {
            console.log('res', response);
            setRoleListMatrix(response?.data);
        });
    };

    useEffect(() => {
        if (!insertRef.current) {
            if (selectedRoleMatrix && selectedRoleMatrix != undefined) {
                axios.get(`${process.env.REACT_APP_BASEURL}/api/User/UsersByRoleId?Id=${selectedRoleMatrix?.id}`).then((response: any) => {
                    console.log('res11', response);
                    setUserListMatrix(response?.data);
                });
            }
        }
        else{
            insertRef.current = false;
          }
    }, [selectedRoleMatrix]);

    let columnDefs = [
        {
            field: 'srNo',
            headerName: 'Sr Number',
            headerTooltip: 'Serial Number',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'fromValue',
            headerName: 'From Value',
            headerTooltip: 'From Value',
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'toValue',
            headerName: 'To Value',
            headerTooltip: 'To Value',
            sortable: true,
            resizable: true,
            width: 160,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'roleName',
            headerName: 'Role Name',
            headerTooltip: 'Role Name',
            sortable: true,
            resizable: true,
            width: 220,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
    ];
    let columnDefs2 = [
        {
            field: 'userStatus',
            headerName: 'User Status(Active=?)',
            headerTooltip: 'User Status(Active=?)',
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
            cellRenderer: (params: any) => (
                <>
                    <div className="toggle-div">
                        <ToggleButtonGroup
                            color="primary"
                            value={RighttSideData[params?.rowIndex]?.userStatus || RighttSideData[0]?.userStatus}
                            exclusive
                            onChange={(e, value) => {
                                RighttSideData[params?.rowIndex].userStatus = value;
                                axios.post(`${process.env.REACT_APP_BASEURL}/api/QualityAuditorMatrix/UpdateQualityAuditorMatrixStatus?id=${params?.data?.id}&status=${RighttSideData[params?.rowIndex].userStatus}`).then((response: any) => {
                                    // setRadioButtonStatus( RighttSideData[params?.rowIndex].userStatus);
                                    console.log('resuserStatus', response);
                                    if (response && response?.data?.code === 200 && response?.data?.status === true) {
                                        dispatch(showMessage(' User Status Updated in Phase Approval Matrix Successfully!!'));
                                        showRightData(selectedLeftsideData);
                                    }
                                });

                                console.log('e', e, params, RighttSideData[params?.rowIndex].userStatus);
                            }}
                            aria-label="Platform"
                        >
                            <ToggleButton value="Active">Y</ToggleButton>
                            <ToggleButton value="In Active">N</ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                </>
            ),
        },
        {
            field: 'userName',
            headerName: 'User Name',
            headerTooltip: 'User Name',
            sortable: true,
            resizable: true,
            width: 180,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'roleName',
            headerName: 'Role Name',
            headerTooltip: 'Role Name',

            sortable: true,
            resizable: true,
            width: 180,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'verticalType',
            headerName: 'Vertical Type',
            headerTooltip: 'Vertical Type',

            sortable: true,
            resizable: true,
            width: 180,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'email',
            headerName: 'Email',
            headerTooltip: 'Email',

            sortable: true,
            resizable: true,
            width: 180,
            cellStyle: { fontSize: '13px' },
        },
    ];

    function onGridReady(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridApi(params.api);
    }
    function onGridReady2(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridApi(params.api);
    }

    const handleExportData = () => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/QualityAuditorMatrix/GetExcelDownload`).then((response) => {
            if (!response) {
                dispatch(fetchError('Error occurred in Export !!!'));
                return;
            }
            if (response?.data) {
                var filename = 'QualityAuditMatrix.xlsx';
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

                    dispatch(showMessage(' Quality Audit Matrix data downloaded successfully!'));
                }
            }
        });
    };
    const handleKeyPress = (event) => {
        if (event.key === '-' || event.key === '+' || event.key === "e" || event.key === "ArrowDown" || event.key === "ArrowUp" ) {
            event.preventDefault();
        }
    };
    return (
        <>
            <Grid
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                }}
            >
                <Box component="h2" className="page-title-heading mb-0">
                    Quality Auditor Matrix
                </Box>
                <div className="rolem-grid">
                    <Stack display="flex" alignItems="flex-end" justifyContent="space-between" flexDirection="row" sx={{ mb: -2 }}>
                        <Button size="small" style={primaryButtonSm} sx={{ color: '#fff', fontSize: '12px' }} onClick={handleClickMatrixOpen}>
                            Add New Matrix
                        </Button>

                        <Button size="small" style={primaryButtonSm} sx={{ color: '#fff', fontSize: '12px' }} onClick={handleClickOpen}>
                            Add New User
                        </Button>
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
                        <Dialog open={open} onClose={handleClose} aria-describedby="alert-dialog-slide-description" maxWidth="lg">
                            <DialogTitle id="alert-dialog-title" className="title-model">
                                Add User
                            </DialogTitle>
                            <DialogContent style={{ width: '450px' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable">Select Role</h2>
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => option?.roleName?.toString() || ''}
                                        disableClearable={true}
                                        disabled={roleList?.length === 1 ? true : false}
                                        options={roleList || []}
                                        onChange={(e, value) => {
                                            console.log('valueAA', value);
                                            setSelectedRole(value);
                                        }}
                                        placeholder="Document Type"
                                        value={selectedRole}
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

                                <div className="input-form">
                                    <h2 className="phaseLable required">Select Users</h2>
                                    <Autocomplete
                                        multiple
                                        limitTags={2}
                                        style={{ zIndex: 9999999 }}
                                        disablePortal={false}
                                        id="combo-box-demo"
                                        filterSelectedOptions
                                        getOptionLabel={(option: any) => {
                                            return option?.userName?.toString() || '';
                                        }}
                                        disableClearable
                                        options={userList || []}
                                        onChange={(e, value: any) => {
                                            {
                                                setSelectedUser(value);
                                                setSelectedUserAddError(false)
                                            }
                                        }}
                                        onError={() => setSelectedUserAddError(true)}
                                        placeholder="Document Type"
                                        value={selectedUser || []}
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
                                    {selectedUserAddError && (
                                        <FormHelperText error>
                                            <p className="form-error">Please select at least one user.</p>
                                        </FormHelperText>
                                    )}
                                </div>
                            </DialogContent>
                            <DialogActions className="button-wrap">
                                <Button className="yes-btn" onClick={onAddUser}>
                                    Submit
                                </Button>
                                <Button className="no-btn" onClick={handleClose}>
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <Dialog open={openMatrix} onClose={handleClose} aria-describedby="alert-dialog-slide-description" maxWidth="lg">
                            <DialogTitle id="alert-dialog-title" className="title-model">
                                Add Matrix
                            </DialogTitle>
                            <DialogContent style={{ width: '450px' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">From Value</h2>
                                    <TextField
                                        autoComplete="off"
                                        name="fromValue"
                                        id="fromValue"
                                        variant="outlined"
                                        size="small"
                                        className="w-85"
                                        value={fromValueMatrix}
                                        type="number"
                                        onKeyDown={handleKeyPress}
                                        onChange={(e: any) => {
                                            console.log('PPP', e?.target?.value >= 0, e?.target?.value);
                                            e?.target?.value >= 0 ? setFromValueMatrix(e?.target?.value) : setFromValueMatrix(0);
                                            setFromValueError(false);
                                        }}
                                        // error={fromValueError}
                                        // helperText={<p className="form-error">{fromValueError ? 'Please enter from value' : ''}</p>}
                                        // disabled
                                        // onBlur={handleBlur}
                                    />
                                    <FormHelperText error={toValueError}>
                                        <p className="form-error">{fromValueError ? 'Please enter from value' : ''}</p>
                                      </FormHelperText>
                                </div>
                                <div className="input-form">
                                    <h2 className="phaseLable required">To Value</h2>
                                    <TextField
                                        autoComplete="off"
                                        name="toValue"
                                        id="toValue"
                                        variant="outlined"
                                        size="small"
                                        className="w-85"
                                        type="number"
                                        value={toValueMatrix}
                                        onKeyDown={handleKeyPress}
                                        // error={toValueError}
                                        // helperText={<p className="form-error">{toValueError ? 'Please enter to value' : ''}</p>}
                                        onChange={(e: any) => {
                                            e?.target?.value >= 0 ? setToValueMatrix(e?.target?.value) : setToValueMatrix(0);
                                            setToValueError(false)
                                        }}
                                        // disabled
                                        // onBlur={handleBlur}
                                    />
                                      <FormHelperText error={toValueError}>
                                        <p className="form-error">{toValueError ? 'Please enter to value' : ''}</p>
                                      </FormHelperText>
                                </div>

                                <div className="input-form">
                                    <h2 className="phaseLable required">Authority Level</h2>
                                    <Select
                                        displayEmpty
                                        inputProps={{ 'aria-label': 'Without label' }}
                                        size="small"
                                        className="w-85"
                                        name="matrixStatus"
                                        id="matrixStatus"
                                        value={matrixStatus}
                                        onChange={(e) => {
                                            setMatrixStatus(e?.target?.value);
                                            setMatrixStatusError(false)
                                        }}
                                        // error={matrixStatusError}
                                        // helperText={matrixStatusError ? 'Please enter to value' : ''}
                                        // onBlur={handleBlur}
                                    >
                                        <MenuItem value={'Approved By'}>Approved By</MenuItem>
                                        <MenuItem value={'Checked By'}>Checked By</MenuItem>
                                        <MenuItem value={'Recommended By'}>Recommended By</MenuItem>
                                    </Select>
                                    <FormHelperText error={matrixStatusError}>
                                    <p className="form-error">{matrixStatusError ? 'Please select Status' : ''}</p>
                                    </FormHelperText>
                                </div>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Select Role</h2>
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => {
                                            console.log('option', option);
                                            return option?.role_Name?.toString() || '';
                                        }}
                                        disableClearable={true}
                                        // disabled={roleList?.length === 1 ? true : false}
                                        options={roleListMatrix || []}
                                        onChange={(e, value) => {
                                            console.log('value', value);
                                            setSelectedRoleMatrix(value);
                                            setSelectedUserMatrix([])
                                            setSelectedRoleMatrixError(false)
                                        }}
                                        placeholder="Document Type"
                                        ListboxProps={{
                                            style: {
                                              maxHeight: 170,
                                            },
                                          }}
                                        value={selectedRoleMatrix}
                                        onError={() => setSelectedRoleMatrixError(true)}
                                        // helperText={selectedRoleMatrixError ? 'Please select Role' : ''}
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
                                    {selectedRoleMatrixError && (
                                        <FormHelperText error={selectedRoleMatrixError}>
                                            <p className="form-error">Please select a Role</p>
                                        </FormHelperText>
                                    )}
                                </div>

                                <div className="input-form">
                                    <h2 className="phaseLable required">Select Users</h2>
                                    {/* <div style={{ maxHeight: '100px', overflowY: 'auto', overflowX: 'hidden' }}> */}
                                    <Autocomplete
                                        multiple
                                        limitTags={2}
                                        style={{ zIndex: 9999999 }}
                                        disablePortal={false}
                                        id="combo-box-demo"
                                        filterSelectedOptions
                                        getOptionLabel={(option: any) => {
                                            return option?.userName?.toString() || '';
                                        }}
                                        disableClearable
                                        options={userListMatrix || []}
                                        onChange={(e, value: any) => {
                                            {
                                                setSelectedUserMatrix(value);
                                                setSelectedUserMatrixError(false)
                                            }
                                        }}
                                        onError={() => setSelectedUserMatrixError(true)}
                                        placeholder="Document Type"
                                        value={selectedUserMatrix || []}
                                        ListboxProps={{
                                            style: {
                                              maxHeight: 170,
                                            },
                                          }}
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
                                    {/* </div> */}
                                    {selectedUserMatrixError && (
                                        <FormHelperText error={selectedUserMatrixError}>
                                            <p className="form-error">Please select a user</p>
                                        </FormHelperText>
                                    )}
                                </div>
                            </DialogContent>
                            <DialogActions className="button-wrap">
                                <Button className="yes-btn" onClick={onAddMatrix}>
                                    Submit
                                </Button>
                                <Button className="no-btn" onClick={handleClose}>
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Stack>
                </div>
            </Grid>
            <Grid marginBottom="0px" container item spacing={3} justifyContent="start" alignSelf="center">
                <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                    <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 200px)', marginTop: '10px' }}>
                        <CommonGrid defaultColDef={null} columnDefs={columnDefs} rowData={LeftSideData} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} onRowClicked={(e) => showRightData(e?.data)} rowSelection="single" />
                    </div>
                </Grid>
                <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                    <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 200px)', marginTop: '10px' }}>
                        <CommonGrid defaultColDef={null} columnDefs={columnDefs2} rowData={RighttSideData} onGridReady={onGridReady2} gridRef={gridRef2} pagination={false} paginationPageSize={null} />
                    </div>
                </Grid>
            </Grid>
        </>
    );
}

export default QualityAuditorMatrix;