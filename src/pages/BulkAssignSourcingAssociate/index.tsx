import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Autocomplete, Box, Button, Checkbox, Dialog, DialogContent, FormControlLabel, Grid, TextField } from '@mui/material';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import { AgGridReact } from 'ag-grid-react';
import { useDispatch, useSelector } from 'react-redux';
import MandateInfo from 'pages/common-components/BulkAssignMandateInformation';
import { fetchError, showMessage } from 'redux/actions';
import { useUrlSearchParams } from 'use-url-search-params';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import { AppState } from 'redux/store';
import moment from 'moment';

const MyTask = () => {
    const [open, setOpen] = React.useState(false);
    const [phaseData, setPhaseData] = React.useState([]);
    const [mandateId, setMandateId] = React.useState(null);
    const [sourcingId, setSourcingId] = React.useState(null);
    const [sourcingError, setSourcingError] = React.useState('');
    const [branchId, setBranchId] = React.useState(null);
    const [branchError, setBranchError] = React.useState('');
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [selectAllBox, setSelectAllBox] = useState(false);
    const [mandateData, setMandateData] = React.useState(null);
    const [sourcingAssociate, setSourcingAssociate] = React.useState([]);
    const [branchAdmin, setBranchAdmin] = React.useState([]);
    const [assignedPmData, setAssignedPmData] = React.useState({});
    const [checked, setChecked] = React.useState({});
    const [params] = useUrlSearchParams({}, {});
    let { id } = useParams();
    const gridRef = React.useRef<AgGridReact>(null);
    const location = useLocation();	
    const apiType = location?.state?.apiType || "";	
    const { user } = useAuthUser();	
    const [userAction, setUserAction] = React.useState(null);	
    const { userActionList } = useSelector<AppState, AppState["userAction"]>(	
        ({ userAction }) => userAction	
    );	
    const action = userAction?.action || "";	
    const runtimeId = userAction?.runtimeId || 0;
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const getMandate = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/BulkPendingAssign?PhaseId=${mandateData?.id}&WorkItem=Assign Sourcing Associate and Branch Admin`, config)
            .then((response: any) => {
                setPhaseData(response?.data);
            })
            .catch((e: any) => {});
    };
    useEffect(() => {
        if (mandateData?.id !== undefined && mandateData?.fk_PDM_id !== undefined) {
            getMandate();
        }
    }, [mandateData, setMandateData, mandateId]);

    useEffect(() => {
        if (Object.keys(phaseData)?.length && Object.keys(assignedPmData)?.length == Object.keys(phaseData)?.length) {
            console.log('ZZZ1');
            setSelectAllBox(true);
        } else {
            setSelectAllBox(false);
        }
    }, [checked]);

    React.useEffect(() => {
        if (id !== 'noid' && id) {
            setMandateId(id);
        }
    }, []);

    React.useEffect(() => {	
        if (mandateId && mandateId?.id !== undefined) {	
          const userAction =	
            userActionList &&	
            userActionList?.find(	
              (item) =>	
                item?.mandateId === parseInt(mandateId?.id) &&	
                item?.module === module	
            );	
          if (apiType === "") {	
            setUserAction(userAction);	
          } else {	
            let action = mandateId;	
            setUserAction(action);	
          }	
          if (params.source === "list") {	
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
      const workflow = (payload) => {	
        payload.forEach((row) => {
            const body = {	
            runtimeId: row?.runtimeId || 0,	
            mandateId: row?.id || 0, 	
            tableId: row?.tableId || 0, 	
            remark: "Updated",	
            createdBy: user?.UserName || "Admin",	
            createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),	
            //   action: action || "", 	
            action: "Update" || "", 	
            };	
            axios	
            .post(	
                `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId	
                }&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy	
                }&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ""	
                }`	
            )	
            .then((response: any) => {	
                if (!response) return;	 
                if (response?.data === true) {	
                //   if (params?.source === "list") {	
                //     navigate("/list/task");	
                //   } else {	
                //     navigate("/mandate");	
                //   }	
                console.log("Save Successfully")	
                } else {	
                dispatch(fetchError("Error Occured !!"));	
                }	
            })	
            .catch((e: any) => { });	
        })
      };
    console.log('PhaseData', phaseData, checked);
    const onHeaderCheckboxChange = (event, params) => {
        if (event.target.checked) {
            const chk = {};
            const assignData = {};
            const daata = [...phaseData];
            daata?.map((item, index) => {
                assignData[index] = item;
                chk[index] = true;
            });
            gridApi.selectAll();
            params?.setChecked({ ...chk });
            params?.setAssignedPmData({ ...assignData });
            console.log('ZZZ2');
            params?.setSelectAllBox(true);
        } else {
            gridApi.deselectAll();
            params?.setChecked({});
            params?.setAssignedPmData({});
            params?.setSelectAllBox(false);
        }
    };

    const CustomHeaderCheckbox = ({ selectAllBox, displayName, ...params }) => {
        return (
            <div>
                <span>{displayName}</span>&nbsp;&nbsp;
                <>{phaseData && phaseData?.length > 0 && <FormControlLabel control={<Checkbox checked={selectAllBox || false} onChange={(e) => onHeaderCheckboxChange(e, params)} />} label="" />}</>
            </div>
        );
    };
    console.log('SSS', selectAllBox, checked, assignedPmData,assignedPmData[0]?.admin_vertical);
    useEffect(() => {
        var reporting_id = mandateData?.fk_PDM_id || 0;
        if (assignedPmData[0]?.admin_vertical !== '' && assignedPmData[0]?.admin_vertical !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/User/GetAllWithConditions?Designation=Sourcing Associate&VerticalType=${encodeURIComponent(assignedPmData[0]?.admin_vertical) || ''}&reporting_id=0`)
                .then((response: any) => {
                    if (!response) return;
                    setSourcingAssociate(response?.data || []);
                })
                .catch((e: any) => {});
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/User/GetBranchAdminWithConditions?VerticalType=${encodeURIComponent(assignedPmData[0]?.admin_vertical) || ''}`)
                .then((response: any) => {
                    if (!response) return;
                    setBranchAdmin(response?.data || []);
                })
                .catch((e: any) => {});
        }
    }, [assignedPmData[0]?.admin_vertical, mandateData?.fk_PDM_id]);
    console.log("AAA",assignedPmData,mandateData);
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
                assignedPmData: assignedPmData,
                selectAllBox: selectAllBox,
                setSelectAllBox: setSelectAllBox,
                setAssignedPmData: setAssignedPmData,
            },

            width: 150,
            minWidth: 100,
            pinned: 'left',
            cellRenderer: (e: any) => (
                <>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={checked[e?.rowIndex] || selectAllBox || false}
                                onChange={() => {
                                    console.log('Event', e);
                                    checked[e?.rowIndex] = checked[e?.rowIndex] === undefined ? true : !checked[e?.rowIndex];
                                    setChecked({ ...checked });
                                    if (checked[e?.rowIndex] === undefined || checked[e?.rowIndex]) {
                                        assignedPmData[e?.rowIndex] = { ...e?.data };
                                        setAssignedPmData({ ...assignedPmData });
                                    } else if (!checked[e?.rowIndex]) {
                                        delete assignedPmData[e?.rowIndex];
                                        setAssignedPmData({ ...assignedPmData });
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
            width: 150,
            minWidth: 100,
            sortable: true,
            resizable: true,

            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'verticalName',
            headerName: 'Vertical',
            headerTooltip: 'Vertical',
            filter: true,
            sortable: true,
            resizable: true,
            width: 160,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'branchTypeName',
            headerName: 'Branch Type',
            headerTooltip: 'Branch Type',
            filter: true,
            sortable: true,
            resizable: true,
            width: 180,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'glCategoryName',
            headerName: 'GL Category',
            headerTooltip: 'GL Category',
            sortable: true,
            resizable: true,
            filter: true,
            width: 200,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'state',
            headerName: 'State',
            headerTooltip: 'State',
            filter: true,
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'location',
            headerName: 'Location Name',
            headerTooltip: 'Location Name',
            filter: true,
            sortable: true,
            resizable: true,
            width: 140,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'pincode',
            headerName: 'Pin Code',
            headerTooltip: 'Pin Code',
            sortable: true,
            filter: true,
            resizable: true,
            width: 150,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
    ];
    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }
    const handleCancle = () => {
        setOpen(false);
        setBranchError('');
        setSourcingError('');
        setSourcingId(null);
        setBranchId(null);
    };
    const handleClose = () => {
        setAssignedPmData({});
        setOpen(false);
    };
    const handleOpen = () => {
        setOpen(true);
        const selectedData = [];
        gridApi?.forEachNodeAfterFilterAndSort((node) => {
            if (node.isSelected()) {
                selectedData.push(node.data);
            }
        });
        if (selectedData && selectedData.length > 0) {
            setAssignedPmData(selectedData);
        }
    };
    const handleSubmit = () => {
        if (sourcingId === null || branchId === null) {
            if (sourcingId === null) {
                setSourcingError('Please select Sourcing Associate');
            }
            if (branchId === null) {
                setBranchError('Please select Branch Admin');
            }
            return;
        }
        const payload = Object?.values(assignedPmData);
        const data =
            payload &&
            payload?.length &&
            payload?.map((item) => {
                item['sourcingAssociate'] = sourcingId?.id || 0;
                item['branchAdminId'] = branchId?.id || 0;
                return item;
            });

               // const selectedRows = Object.values(assignedPmData);
               if (payload.length === 0) {
                // Handle the case where no rows are selected
                // You can display an error message or take other actions
                return;
            }
            // const data1 = selectedRows.map((item) => {
            //     item['sourcingAssociate'] = sourcingId?.id || 0;
            //     item['branchAdminId'] = branchId?.id || 0;
            //     return item;
            // });
            console.log("selectedRows",payload)

        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/Mandates/BulkMandateAssignSorcingAssociate`, data)
            .then((response: any) => {
                setChecked({});
                getMandate();
                handleClose();
                dispatch(showMessage('Bulk Assign Sourcing Associate and Branch Admin is completed successfully!'));
                navigate("/Mandate")	
                // window.location.reload();	
                workflow(payload);
            })
            .catch((e: any) => {});
    };

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
                    Bulk Assign Sourcing Associate And Branch Admin
                </Box>
            </Grid>
            <div
                style={{
                    padding: '10px !important',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                }}
                className="card-panal inside-scroll-194"
            >
                <MandateInfo
                    mandateCode={mandateId}
                    pageType="phase"
                    source=""
                    redirectSource={`${params?.source}`}
                    setMandateCode={setMandateId}
                    setMandateData={setMandateData}
                    setpincode={() => {}}
                    setCurrentStatus={setCurrentStatus}
                    setCurrentRemark={setCurrentRemark}
                    workItem={'Assign Sourcing Associate and Branch Admin'}
                />
                {((assignedPmData && Object?.values(assignedPmData)?.length !== 0) || selectAllBox) && (
                    <div>
                        <Button
                            style={primaryButtonSm}
                            sx={{
                                color: '#fff',
                                fontSize: '12px',
                                marginBottom: '1%',
                            }}
                            onClick={() => {
                                handleOpen();
                            }}
                        >
                            Assign Sourcing Associate And Branch Admin
                        </Button>
                        <Dialog open={open} onClose={handleClose} aria-describedby="alert-dialog-slide-description" maxWidth="lg">
                            <DialogContent style={{ width: '500px' }}>
                                <Grid container item display="flex" flexDirection="row" spacing={2} justifyContent="start" alignSelf="center">
                                    <Grid item xs={12} md={12} sx={{ position: 'relative', marginBottom: '0%' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Sourcing Associate</h2>
                                            <Autocomplete
                                                disablePortal={false}
                                                style={{ zIndex: 9999999 }}
                                                id="combo-box-demo"
                                                getOptionLabel={(option) => option?.userName?.toString() || ''}
                                                disableClearable={true}
                                                options={sourcingAssociate || []}
                                                value={sourcingId || ''}
                                                defaultValue={null}
                                                onChange={(e, value) => {
                                                    setSourcingId(value);
                                                    setSourcingError('');
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
                                        <p className="form-error">{sourcingError}</p>
                                    </Grid>
                                    <Grid item xs={12} md={12} sx={{ position: 'relative', marginBottom: '5%' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable required">Branch Admin</h2>
                                            <Autocomplete
                                                disablePortal={false}
                                                style={{ zIndex: 9999999 }}
                                                id="combo-box-demo"
                                                getOptionLabel={(option) => option?.userName?.toString() || ''}
                                                disableClearable={true}
                                                options={branchAdmin || []}
                                                value={branchId || ''}
                                                defaultValue={null}
                                                onChange={(e, value) => {
                                                    setBranchId(value);
                                                    setBranchError('');
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
                                        <p className="form-error">{branchError}</p>
                                    </Grid>
                                    <Grid item xs={12} md={12} sx={{ position: 'relative', marginBottom: '0%' }}>
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
                                                onClick={handleCancle}
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
                <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 307px)', marginTop: '10px' }}>
                    <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={phaseData} rowSelection={'multiple'} suppressRowClickSelection={true} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                </div>
            </div>
        </>
    );
};

export default MyTask;
