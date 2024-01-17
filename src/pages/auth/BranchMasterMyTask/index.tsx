import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import React, { createContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { TbPencil } from 'react-icons/tb';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, IconButton, InputAdornment, Radio, RadioGroup, TextField, Tooltip, alpha } from '@mui/material';
import { Stack } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import { AgGridReact } from 'ag-grid-react';
import { AppState } from 'redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import { secondaryButton } from 'shared/constants/CustomColor';
import { AiFillFileExcel } from 'react-icons/ai';
import AppTooltip from '@uikit/core/AppTooltip';
import workflowFunctionAPICall from 'pages/Mandate/workFlowActionFunction';
import { useAuthUser } from '@uikit/utility/AuthHooks';
// import MainInfo from './Components/PhaseApprovalNote/MainInfo';
import moment from 'moment';
// import workflowFunctionAPICall from "./Components/workFlowActionFunction";

const MyTask = () => {
    const [phaseData, setPhaseData] = React.useState([]);
    const [radioButton, setRadioButton] = React.useState<any>('Self');
    const [columnData, setColumnData] = React.useState(null);
    const [projectManagerData, setProjectManagerData] = React.useState(null);
    const [projectManagerList, setProjectManagerList] = React.useState([]);
    const gridRef = React.useRef<AgGridReact>(null);
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const { userMenuList } = useSelector<AppState, AppState['menu']>(({ menu }) => menu);
    const [error, setError] = React.useState(null);
    const { id } = useParams();
    const { user } = useAuthUser();
    const [userAction, setUserAction] = React.useState(null);
    const dropdownRef = useRef(null);
    const { phaseid, mandateId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const apiType = location?.state?.apiType || '';
    const [open, setOpen] = React.useState(false);
    const getMandate = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        console.log('555', user, userAction);
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BranchMasterWorkflow/GetBranchMasterTasksbyRole?roleName=${user?.role}&userName=${user?.UserName}`, config)
            .then((response: any) => {
                if (!response) return;
                console.log('MMM', response);
                setPhaseData(response?.data?.data);
            })
            .catch((e: any) => {});
    };
    const validateAssignToPm = (selectedValue) => {
        if (!selectedValue) {
            return 'Please select Project Manager';
        }
        // Add more validation logic as needed
        return null;
    };
    // React.useEffect(() => {
    //     if (id && id !== undefined && id != '') {
    //         // console.log('userActionList', userActionList, id);
    //         const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(id) && item?.module === module);
    //         if (apiType === '') {
    //             setUserAction(userAction);
    //         } else {
    //             let action = mandateId;
    //             setUserAction(action);
    //         }
    //     }
    // }, [id]);

    useEffect(() => {
        getMandate();
    }, [location]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setError(null);
        setProjectManagerData(null);
    };

    // const handleRadioChange = (event) => {
    //     setRadioButton(event.target.value);
    //     if (event.target.value === 'AssignedToPM') {
    //         setDialogStyle((prevStyle) => ({
    //             ...prevStyle,
    //             height: 'calc(100vh - 400px)', // Adjust the height as needed
    //         }));
    //     } else {
    //         setDialogStyle((prevStyle) => ({
    //             ...prevStyle,
    //             height: 'auto', // Reset height to auto for other options
    //         }));
    //     }
    // };

    const [dialogStyle, setDialogStyle] = React.useState({
        padding: '20px',
        width: '450px',
        height: 'auto', // Initial height
    });
    console.log('columnData', columnData, user);
    console.log('radiobutton', radioButton, projectManagerData);
    // useEffect(() => {
    //     // var reporting_id = getReportingIdByPDMName();
    //     if (columnData !== null) {
    //         axios
    //             .get(`${process.env.REACT_APP_BASEURL}/api/User/GetAllWithConditions?Designation=Project Manager&reporting_id=${user?.id}`)
    //             .then((response: any) => {
    //                 console.log('res', response);
    //                 if (!response) return;
    //                 setProjectManagerList(response?.data || []);
    //             })
    //             .catch((e: any) => {});
    //     }
    // }, [columnData]);

    const workflowFunctionAPICall = () => {
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: columnData?.runtimeId || 0,
            mandateId: 0,
            tableId: columnData?.phaseId || 0,
            remark: 'Phase creation task assigned to PM ' || '',
            createdBy: user?.UserName,
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: 'Assign Project Manager' || '',
        };
        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark}`,
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

    // const selfSubmit = () => {
    //     var userAction = null;
    //     userAction = userActionList && userActionList?.find((item) => item?.mandateId === columnData?.id && item?.module === columnData?.url);
    //     var url = userAction?.module || '';

    //     navigate(`/mandate/${columnData?.id}/${url}?source=list`);
    //     axios
    //         .post(`${process.env.REACT_APP_BASEURL}/api/Phases/UpdatePhaseWithParams?phaseid=${columnData?.phaseId}&fk_PDM_id=${user?.id}&fk_PM_id=${projectManagerData?.id || 0}`)
    //         .then((response: any) => {
    //             console.log('res-post', response);
    //             if (response && response?.data?.code === 200 && response?.data?.status === true) {
    //                 // dispatch(showMessage("Project Manager Assigned Sucessfully!!"))
    //             }
    //         })
    //         .catch((e: any) => {});
    // };

    // const assignedToPM = (e) => {
    //     e.preventDefault();
    //     const validationError = validateAssignToPm(projectManagerData);

    //     if (validationError) {
    //         setError(validationError);
    //     } else {
    //         setError(null);
    //     }
    //     console.log('error', error, validationError);
    //     if (validationError === null) {
    //         axios
    //             .post(`${process.env.REACT_APP_BASEURL}/api/Phases/UpdatePhaseWithParams?phaseid=${columnData?.phaseId}&fk_PDM_id=${user?.id}&fk_PM_id=${projectManagerData?.id}`)
    //             .then((response: any) => {
    //                 console.log('res-post', response);
    //                 if (response && response?.data?.code === 200 && response?.data?.status === true) {
    //                     dispatch(showMessage('Project Manager Assigned Successfully!!'));
    //                 }
    //             })
    //             .catch((e: any) => {});

    //         workflowFunctionAPICall();
    //         handleClose();
    //     }
    // };

    let columnDefs = [
        {
            field: 'medals.bronze',
            headerName: 'Actions',
            headerTooltip: 'Actions',
            resizable: true,
            width: 90,
            minWidth: 90,
            pinned: 'left',
            // cellRendererFramework: (e: any ) => (selfSubmit(e)),
            cellRenderer: (e: any) => (
                <>
                    <div className="actions">
                        <Tooltip title={`${e?.data?.workItem || 'My Task'}`} className="actionsIcons">
                            <button className="actionsIcons actionsIconsSize">
                                <TbPencil
                                    onClick={() => {
                                        console.log('777', user, e?.data);
                                        var url = e?.data?.url;
                                        var action = e?.data?.action;
                                        var runtimeId = e?.data?.runtimeId;
                                        navigate(`/${e?.data?.branchMaster?.id}/BranchMasterDetails?source=list`, { state: { runtimeId: runtimeId, action: action } });
                                    }}
                                />
                            </button>
                        </Tooltip>
                    </div>
                </>
            ),
        },
        {
            field: '',
            headerName: 'Location Code',
            headerTooltip: 'Location Code',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.locationCode;
            },
            width: 150,
            minWidth: 120,
        },
        {
            field: 'mandateCode',
            headerName: 'Mandate Code',
            headerTooltip: 'Mandate Code',
            sortable: true,
            resizable: true,
            width: 160,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.mandateCode;
            },
        },
        {
            field: 'phaseCode',
            headerName: 'Phase Code',
            headerTooltip: 'Phase Code',
            sortable: true,
            resizable: true,
            width: 120,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.phaseCode;
            },
        },
        {
            field: 'status',
            headerName: 'Current Status',
            headerTooltip: 'Current Status',
            sortable: true,
            resizable: true,
            width: 120,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.status;
            },
        },
        {
            field: 'workItem',
            headerName: 'Work Item',
            headerTooltip: 'Work Item',
            sortable: true,
            resizable: true,
            width: 180,
            minWidth: 180,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //     console.log('555', params);
            //     return params?.data?.branchMaster?.workItem;
            // },
        },
        {
            field: 'status',
            headerName: 'Status',
            headerTooltip: 'Status',
            sortable: true,
            resizable: true,
            width: 160,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.status;
            },
        },
        {
            field: 'locationName',
            headerName: 'Location Name',
            headerTooltip: 'Location Name',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            width: 120,
            minWidth: 120,
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.locationName;
            },
        },
        {
            field: 'pennantCode',
            headerName: 'Pennant Code',
            headerTooltip: 'Pennant Code',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.pennantCode;
            },
            width: 120,
            minWidth: 120,
        },
        {
            field: 'state',
            headerName: 'State',
            headerTooltip: 'State',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.state;
            },
            width: 120,
            minWidth: 120,
        },
        {
            field: 'district',
            headerName: 'District',
            headerTooltip: 'District',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.district;
            },
            width: 120,
            minWidth: 120,
        },
        {
            field: 'city',
            headerName: 'City',
            headerTooltip: 'City',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.city;
            },
            width: 120,
            minWidth: 120,
        },
        {
            field: 'branchType',
            headerName: 'Branch Type',
            headerTooltip: 'Branch Type',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.branchType;
            },
            width: 120,
            minWidth: 120,
        },
        {
            field: 'pincode',
            headerName: 'Pin Code',
            headerTooltip: 'Pin Code',
            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 70,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.pincode;
            },
        },
        {
            field: 'branch_Name',
            headerName: 'Branch Name',
            headerTooltip: 'Branch Name',
            sortable: true,
            resizable: true,
            width: 130,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.branch_Name;
            },
        },
        {
            field: 'createdDate',
            headerName: 'Created Date',
            headerTooltip: 'Created Date',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.createdDate).format('DD/MM/YYYY');
            },
            width: 150,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdBy',
            headerName: 'Created By',
            headerTooltip: 'Created By',
            sortable: true,
            resizable: true,
            width: 190,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.createdBy;
            },
        },
        {
            field: 'adminVertical',
            headerName: 'Admin Vertical',
            headerTooltip: 'Admin Vertical',
            sortable: true,
            resizable: true,
            width: 160,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                console.log('555', params);
                return params?.data?.branchMaster?.adminVertical;
            },
        },
    ];

    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }

    const onFilterTextChange = (e) => {
        gridApi?.setQuickFilter(e?.target?.value);
        if (gridApi.getDisplayedRowCount() == 0) {
            dispatch(fetchError('Data not found!'));
        }
    };

    const handleExportData = () => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/Phases/GetExcelDownloadMyTasks`).then((response) => {
            if (!response) {
                dispatch(fetchError('Error occurred in Export !!!'));
                return;
            }
            if (response?.data) {
                var filename = 'MyTask.xlsx';
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

                    dispatch(showMessage('MyTask downloaded successfully!'));
                }
            }
        });
    };
    // console.log('777', userAction);
    return (
        <>
            <Grid
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '5px',
                }}
            >
                <Box component="h2" className="page-title-heading mb-0">
                    My Tasks
                </Box>
                <div className="phase-grid">
                    <Stack display="flex" alignItems="flex-end" justifyContent="space-between" flexDirection="row" sx={{ mb: -2, marginBottom: '5px' }}>
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
            <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={phaseData || []} onGridReady={onGridReady} gridRef={gridRef} pagination={true} paginationPageSize={10} />
            {/* <Dialog className="dialog-wrap" open={open} onClose={handleClose} aria-describedby="alert-dialog-slide-description" maxWidth="lg">
                <DialogTitle id="alert-dialog-title" className="title-model">
                    Phase approval note to be raised by
                </DialogTitle>
                <DialogContent style={dialogStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <RadioGroup aria-labelledby="demo-controlled-radio-buttons-group" name="controlled-radio-buttons-group" value={radioButton} onChange={handleRadioChange} style={{ display: 'flex', flexDirection: 'row' }}>
                            <FormControlLabel value={'Self'} control={<Radio />} label="Self" style={{ marginRight: '50px' }} />
                            <FormControlLabel value={'AssignedToPM'} control={<Radio />} label="Assigned To PM " />
                        </RadioGroup>
                    </div>
                    {radioButton === 'AssignedToPM' && (
                        <div className="input-form">
                            <h2 className="phaseLable required">Select Project Manager</h2>
                            <Autocomplete
                                disablePortal
                                ref={dropdownRef}
                                id="combo-box-demo"
                                getOptionLabel={(option) => {
                                    return option?.userName?.toString();
                                }}
                                disableClearable={true}
                                // disabled
                                options={projectManagerList || []}
                                onChange={(e, value) => {
                                    setProjectManagerData(value);
                                    setError(null);
                                }}
                                placeholder="Admin Vertical"
                                ListboxProps={{
                                    style: {
                                        maxHeight: 170,
                                    },
                                }}
                                value={projectManagerData}
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
                            {error && <div className="form-error">{error}</div>}
                        </div>
                    )}
                </DialogContent>
                <DialogActions className="button-wrap">
                    <Button
                        className="yes-btn"
                        onClick={(e) => {
                            radioButton === 'Self' ? selfSubmit() : assignedToPM(e);
                        }}
                    >
                        Submit
                    </Button>
                    <Button className="no-btn" onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog> */}

            {/* <MyContext.Provider value={radioButton}>
        
      </MyContext.Provider>                 */}
        </>
    );
};

export default MyTask;
