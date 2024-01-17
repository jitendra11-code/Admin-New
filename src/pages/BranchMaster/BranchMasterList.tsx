// import React from 'react'
import { Box, Button, Grid, InputAdornment, Stack, TextField, Tooltip, IconButton, alpha } from '@mui/material';

import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import moment from 'moment';
import Loader from '@uikit/common/ApplicationLoader';
import React, { useEffect, useState } from 'react';
import { TbPencil } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { AiFillFileExcel } from 'react-icons/ai';
import AppTooltip from '@uikit/core/AppTooltip';
import BranchMasterHistory from './BranchMasterHistory';
import { AppLoader } from '@uikit';
const BranchMasterList = () => {
    const [assetRequestData, setAssetRequestData] = useState([]);
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [loader, setloader] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // const handleExportData = () => {
    //     axios
    //       .get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterDetails`, { responseType: 'arraybuffer' })
    //       .then((response) => {
    //         console.log("API data for Excel", response);

    //         if (!response || !response.data) {
    //           dispatch(fetchError("Error occurred in Export !!!"));
    //           return;
    //         }

    //         const blob = new Blob([response.data], { type: 'application/octet-stream' });
    //         const filename = "BranchMasterList.xlsx";

    //         if (typeof window.navigator.msSaveBlob !== 'undefined') {
    //           // IE
    //           window.navigator.msSaveBlob(blob, filename);
    //         } else {
    //           const blobURL = window.URL.createObjectURL(blob);
    //           const tempLink = document.createElement('a');
    //           tempLink.style.display = 'none';
    //           tempLink.href = blobURL;
    //           tempLink.setAttribute('download', filename);

    //           document.body.appendChild(tempLink);
    //           tempLink.click();

    //           setTimeout(function () {
    //             document.body.removeChild(tempLink);
    //             window.URL.revokeObjectURL(blobURL);
    //           }, 200);

    //           dispatch(showMessage("BranchMasterList downloaded successfully!"));
    //         }
    //       })
    //       .catch((error) => {
    //         console.error("Error fetching API data:", error);
    //         dispatch(fetchError("Error occurred in Export !!!"));
    //       });
    //   };
    const handleExportData = () => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterExcelReport`).then((response) => {
            if (!response) {
                dispatch(fetchError('Error occurred during Export'));
                return;
            }
            if (response?.data) {
                var filename = 'BranchMasterlist.xlsx';
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

                    // Fixes "webkit blob resource error 1"
                    setTimeout(function () {
                        document.body.removeChild(tempLink);
                        window.URL.revokeObjectURL(blobURL);
                    }, 200);

                    dispatch(showMessage('Branch Master List downloaded successfully!'));
                }
            }
        });
    };

    const getAllData = async () => {
        // setloader(true);
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterDetails`)
            .then((response: any) => {
                // setloader(false);
                console.log("LOADERRR");
                setAssetRequestData(response?.data || []);
            })
            .catch((e: any) => {
                // setloader(false);
                dispatch(fetchError('Error Occured in Data Fetching'));
            });
    };

    useEffect(() => {
        getAllData();
    }, []);

    let columnDefs = [
        {
            field: 'Action',
            headerName: 'Actions',
            headerTooltip: 'Actions',
            sortable: false,
            resizable: false,
            pinned: 'left',
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
                        <Tooltip title="Edit" className="actionsIcons">
                            <button className="actionsIcons actionsIconsSize">
                                <TbPencil
                                    onClick={() => {
                                        navigate(`/${params?.data?.id}/BranchMasterDetails`);
                                    }}
                                />
                            </button>
                        </Tooltip>
                        <Tooltip title="Branch Master History" className="actionsIcons">
                            <BranchMasterHistory Id={params?.data?.id} locationCode={params?.data?.locationCode} />
                        </Tooltip>
                        {/* <Tooltip title="Branch Master Spoc History" className="actionsIcons">
                            <BranchMasterSpocHistory Id={params?.data?.id} />
                        </Tooltip> */}
                    </div>
                </>
            ),
            width: 90,
            minWidth: 90,
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
            headerName: 'Phase Code',
            headerTooltip: 'Phase Code',
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
            field: 'branch_Name',
            headerName: 'Location Name',
            headerTooltip: 'Location Name',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            width: 120,
            minWidth: 120,
        },
        {
            field: 'branch_Code',
            headerName: 'Pennant Code',
            headerTooltip: 'Pennant Code',
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
            field: 'state',
            headerName: 'State',
            headerTooltip: 'State',
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
            field: 'district',
            headerName: 'District',
            headerTooltip: 'District',
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
            field: 'city',
            headerName: 'City',
            headerTooltip: 'City',
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
        // {
        //     field: 'modifiedDate',
        //     headerName: 'Modified Date',
        //     headerTooltip: 'Modified Date',
        //     cellRenderer: (e: any) => {
        //         return moment(e?.data?.modifiedDate).format('DD/MM/YYYY');
        //     },
        //     sortable: true,
        //     resizable: true,
        //     width: 150,
        //     minWidth: 80,
        //     cellStyle: { fontSize: '13px' },
        // },
        {
            field: 'createdBy',
            headerName: 'Created By',
            headerTooltip: 'Created By',
            sortable: true,
            resizable: true,
            width: 190,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'status',
            headerName: 'Status',
            headerTooltip: 'Status',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            width: 150,
            minWidth: 150,
        },
    ];

    function onGridReady(params) {
        setGridApi(params.api);
        gridRef.current!.api.sizeColumnsToFit();
    }
    const onFilterTextChange = (e) => {
        gridApi?.setQuickFilter(e?.target?.value);
        if (gridApi.getDisplayedRowCount() == 0) {
            dispatch(fetchError('Data not found!'));
        }
    };

    return (
        // <div>AssetQuoteInputList</div>
        <>
            <Grid
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '15px',
                }}
            >
                <Box component="h2" className="page-title-heading mb-0">
                    Branch Master List
                </Box>

                <div className="phase-grid">
                    <Stack display="flex" alignItems="flex-end" justifyContent="space-between" flexDirection="row" sx={{ mb: -2 }}>
                        <TextField
                            size="small"
                            sx={{ marginRight: '10px' }}
                            variant="outlined"
                            name="search"
                            onChange={(e) => {
                                onFilterTextChange(e);
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button size="small" style={primaryButtonSm} sx={{ color: '#fff', fontSize: '12px' }} onClick={() => navigate('/BranchMasterDetails')}>
                            Add New
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
                    </Stack>
                </div>
            </Grid>
            {/* {loader ? <AppLoader /> : ''} */}
            <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={assetRequestData || []} onGridReady={onGridReady} gridRef={gridRef} pagination={true} paginationPageSize={10} />
        </>
    );
};

export default BranchMasterList;
