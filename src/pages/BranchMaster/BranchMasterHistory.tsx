import React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DownloadIcon from '@mui/icons-material/Download';
import { DialogActions, Tooltip, Tab, Badge, Box } from '@mui/material';
import axios from 'axios';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { fetchError } from 'redux/actions';
import { useDispatch } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import AppLoader from '@uikit/core/AppLoader';
import HistoryIcon from '@mui/icons-material/History';
import moment from 'moment';
const InputQuotationFileDownloadList = ({ Id, locationCode }) => {
    const gridRef = React.useRef<AgGridReact>(null);
    const dispatch = useDispatch();
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [branchMasterHistory, setBranchMasterHistory] = React.useState([]);
    const [branchMasterSpocHistory, setBranchMasterSpocHistory] = React.useState([]);
    const [loader, setLoader] = React.useState(false);
    const [value, setValue] = React.useState('1');
    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }
    const [open, setOpen] = React.useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    let columnDefsSpoc = [
        {
            field: 'srno',
            headerName: 'Sr. No',
            headerTooltip: 'Serial Number',
            cellRenderer: (e: any) => {
                var index = e?.rowIndex;
                return index + 1;
            },
            sortable: true,
            resizable: true,
            width: 80,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'LocationCode',
            headerName: 'Location Code',
            headerTooltip: 'Location Code',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            cellRenderer: function (params) {
                //   var formattedDate = moment(params.data.LocationCode).format('DD/MM/YYYY');
                return params.data.LocationCode;
            },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'SPOCType',
            headerName: 'SPOC Type',
            headerTooltip: 'SPOC Type',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'RoleName',
            headerName: 'Role Name',
            headerTooltip: 'Role Name',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'Username',
            headerName: 'User Name',
            headerTooltip: 'User Name',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'EmployeeName',
            headerName: 'Employee Name',
            headerTooltip: 'Employee Name',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            width: 120,
            minWidth: 120,
        },
        {
            field: 'EmployeeId',
            headerName: 'Employee Id',
            headerTooltip: 'Employee Id',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'Designation',
            headerName: 'Designation',
            headerTooltip: 'Designation',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'Emailid',
            headerName: 'Email Id',
            headerTooltip: 'Email Id',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'Contact',
            headerName: 'Contact',
            headerTooltip: 'Contact',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'CreatedDate',
            headerName: 'Created Date',
            headerTooltip: 'Created Date',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                if (e?.data?.createdDate != null) return moment(e?.data?.createdDate).format('DD/MM/YYYYTHH:mm:ss.SSS');
                return '-';
            },
            width: 150,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'CreatedBy',
            headerName: 'Created By',
            headerTooltip: 'Created By',
            sortable: true,
            resizable: true,
            width: 190,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'ModifiedDate',
            headerName: 'Modified Date',
            headerTooltip: 'Modified Date',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                if (e?.data?.modifiedDate != null) return moment(e?.data?.modifiedDate).format('DD/MM/YYYYTHH:mm:ss.SSS');
                return '-';
            },
            width: 150,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'ModifiedBy',
            headerName: 'Modified By',
            headerTooltip: 'Modified By',
            sortable: true,
            resizable: true,
            width: 190,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
    ];
    let columnDefs = [
        {
            field: 'srno',
            headerName: 'Sr. No',
            headerTooltip: 'Serial Number',
            cellRenderer: (e: any) => {
                var index = e?.rowIndex;
                return index + 1;
            },
            sortable: true,
            resizable: true,
            width: 80,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'locationCode',
            headerName: 'Location Code',
            headerTooltip: 'Location Code',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'phaseCode',
            headerName: 'phase Code',
            headerTooltip: 'phase Code',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'mandateCode',
            headerName: 'Mandate Code',
            headerTooltip: 'Mandate Code',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'subAdminVertical',
            headerName: 'Sub Admin Vertical',
            headerTooltip: 'Sub Admin Vertical',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
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
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'address',
            headerName: 'Branch Address',
            headerTooltip: 'Branch Address',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'buildingName',
            headerName: 'Building Name',
            headerTooltip: 'Building Name',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'buildingConstructedInYear',
            headerName: 'Building Constructed In Year',
            headerTooltip: 'Building Constructed In Year',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'sapLocationCode',
            headerName: 'Sap Location Code',
            headerTooltip: 'Sap Location Code',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'sapNewLocationCode',
            headerName: 'Sap New Location Code',
            headerTooltip: 'Sap New Location Code',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'branchACType',
            headerName: 'Branch AC Type',
            headerTooltip: 'Branch AC Type',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'latitude',
            headerName: 'Latitude',
            headerTooltip: 'Latitude',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'longitude',
            headerName: 'Longitude',
            headerTooltip: 'Longitude',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'parentLocationCode',
            headerName: 'Parent Location Code',
            headerTooltip: 'Parent Location Code',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 150,
            minWidth: 150,
        },
        {
            field: 'createdDate',
            headerName: 'Created Date',
            headerTooltip: 'Created Date',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                if (e?.data?.createdDate != null) return moment(e?.data?.createdDate).format('DD/MM/YYYYTHH:mm:ss.SSS');
                return '-';
            },
            width: 150,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdBy',
            headerName: 'Created By',
            headerTooltip: 'Created By',
            sortable: true,
            resizable: true,
            width: 190,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'modifiedDate',
            headerName: 'Modified Date',
            headerTooltip: 'Modified Date',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                if (e?.data?.modifiedDate != null) return moment(e?.data?.modifiedDate).format('DD/MM/YYYYTHH:mm:ss.SSS');
                return '-';
            },
            width: 150,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'modifiedBy',
            headerName: 'Modified By',
            headerTooltip: 'Modified By',
            sortable: true,
            resizable: true,
            width: 190,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
    ];
    const getBranchMasterSpocHistoryData = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BranchMasterSPOC/GetBranchMasterSPOCDetailsHistory?LocationCode=${locationCode}`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                console.log('333', response?.data?.data);
                if (response?.data && response?.data?.data && response?.data?.data?.length > 0) {
                    setBranchMasterSpocHistory(response?.data?.data);
                }
                if (response && response?.data?.data?.length === 0) {
                    setBranchMasterSpocHistory([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    const getBranchMasterHistoryData = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterHistoryDetails?Id=${Id}`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data && response?.data && response?.data?.length > 0) {
                    setBranchMasterHistory(response?.data);
                }
                if (response && response?.data?.length === 0) {
                    setBranchMasterHistory([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    const handleOpen = () => {
        setOpen(true);
    };

    React.useEffect(() => {
        if (!open) return;
        getBranchMasterHistoryData();
        getBranchMasterSpocHistoryData();
    }, [open]);
    return (
        <>
            {/* {loader ? <AppLoader /> : ''} */}
            <Tooltip className="actionsIcons" id={`${Id}_branchMasterHistory`} title="Branch Master History">
                <HistoryIcon onClick={handleOpen} style={{ fontSize: '20px', color: '#000', cursor: 'pointer' }} className="actionsIcons" />
            </Tooltip>
            <Dialog fullWidth maxWidth="xl" open={open} onClose={handleClose}>
                <DialogTitle style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>Branch Master History</DialogTitle>
                <div
                    style={{
                        backgroundColor: '#fff',
                        padding: '0px',
                        border: '1px solid #0000001f',
                        borderRadius: '5px',
                    }}
                >
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example" className="branchMasterHistory">
                                <Tab style={{ minWidth: '165px', position: 'relative' }} label={<Badge color="secondary">Branch Master History</Badge>} value="1" />
                                <Tab label={<Badge color="secondary">Branch Master SPOC History</Badge>} value="2" />
                            </TabList>
                        </Box>
                        <TabPanel value="1" style={{ height: '500px' }}>
                            {loader ? <AppLoader /> : ''}
                            {branchMasterHistory?.length !== 0 ? (
                                <CommonGrid defaultColDef={null} columnDefs={columnDefs} rowData={branchMasterHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={true} paginationPageSize={10} />
                            ) : (
                                <div style={{ height: '30px' }}>
                                    <CommonGrid defaultColDef={null} columnDefs={columnDefs} rowData={branchMasterHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                                    <p className="noData">No Data Found</p>
                                </div>
                            )}
                        </TabPanel>
                        <TabPanel value="2" style={{ height: '500px' }}>
                            {loader ? <AppLoader /> : ''}
                            {branchMasterSpocHistory?.length !== 0 ? (
                                <CommonGrid defaultColDef={null} columnDefs={columnDefsSpoc} rowData={branchMasterSpocHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={true} paginationPageSize={10} />
                            ) : (
                                <div style={{ height: '30px' }}>
                                    <CommonGrid defaultColDef={null} columnDefs={columnDefsSpoc} rowData={branchMasterSpocHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                                    <p className="noData">No Data Found</p>
                                </div>
                            )}
                        </TabPanel>
                    </TabContext>
                </div>

                <DialogActions className="button-wrap">
                    <Button className="yes-btn" onClick={handleClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
export default InputQuotationFileDownloadList;
