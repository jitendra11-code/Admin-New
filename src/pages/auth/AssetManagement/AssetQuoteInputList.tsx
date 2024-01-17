// import React from 'react'
import { Box, Button, Grid, InputAdornment, Stack, TextField, Tooltip, IconButton } from '@mui/material';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { TbPencil } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import AppTooltip from '@uikit/core/AppTooltip';
import { AiFillFileExcel } from 'react-icons/ai';

const AssetQuoteInputList = () => {
    const [assetRequestData, setAssetRequestData] = useState([]);
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getAllData = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AssetQuotation/GetAllAssetQuotation`)
            .then((response: any) => {
                setAssetRequestData(response?.data || []);
                console.log('res123', response);
            })
            .catch((e: any) => {});
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
                    <Tooltip title="Edit" className="actionsIcons">
                        <button className="actionsIconsSize">
                            <TbPencil
                                onClick={() => {
                                    console.log('params', params);
                                    navigate(`/${params?.data?.fk_request_id}/AssetQuoteInput`);
                                }}
                            />
                        </button>
                    </Tooltip>
                </>
            ),
            width: 90,
            minWidth: 90,
            // maxwidth: 90,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'quote_no',
            headerName: 'Quote Number',
            headerTooltip: 'Quote Number',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            width: 120,
            minWidth: 120,
        },
        {
            field: 'requestNo',
            headerName: 'Request Number',
            headerTooltip: 'Request Number',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 100,
            minWidth: 100,
        },
        {
            field: 'requesterEmployeeID',
            headerName: 'Requester Employee ID',
            headerTooltip: 'Requester Employee ID',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 90,
            minWidth: 90,
        },
        {
            field: 'requiredFor',
            headerName: 'Required For',
            headerTooltip: 'Required For',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 90,
            minWidth: 90,
        },
        {
            field: 'requesterName',
            headerName: 'Requester Name',
            headerTooltip: 'Requester Name',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 120,
            minWidth: 120,
        },
        {
            field: 'shiftingType',
            headerName: 'Shifting Type',
            headerTooltip: 'Shifting Type',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            // cellRenderer: function (params) {
            //   var formattedDate = moment(params.value).format('DD/MM/YYYY');
            //   return formattedDate;
            // },
            width: 120,
            minWidth: 120,
        },
        {
            field: 'createddate',
            headerName: 'Created Date',
            headerTooltip: 'Created Date',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.createddate).format('DD-MM-YYYY');
            },
            width: 150,
            minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'modifieddate',
            headerName: 'Modified Date',
            headerTooltip: 'Modified Date',
            cellRenderer: (e: any) => {
                return moment(e?.data?.modifieddate).format('DD-MM-YYYY');
            },
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdby',
            headerName: 'Created By',
            headerTooltip: 'Created By',
            sortable: true,
            resizable: true,
            width: 120,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'status',
            headerName: 'Status',
            headerTooltip: 'Status',
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
            width: 100,
            minWidth: 100,
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
    const handleExportData = () => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/AssetQuotation/GetExcelForAssetQuotation`).then((response) => {
            if (!response) {
                dispatch(fetchError('Error occurred in Export !!!'));
                return;
            }
            if (response?.data) {
                var filename = 'AssetQuotationData.xlsx';
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

                    dispatch(showMessage('Asset Quotation Data downloaded successfully!'));
                }
            }
        });
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
                <Box component="h2" className="page-title-heading my-0">
                    Quotation
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
                                console.log('e', e);
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Tooltip title="Add New">
                            <Button size="small" style={primaryButtonSm} sx={{ color: '#fff', fontSize: '12px' }} onClick={() => navigate('/AssetQuoteInput')}>
                                Add New
                            </Button>
                        </Tooltip>
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
            <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={assetRequestData} onGridReady={onGridReady} gridRef={gridRef} pagination={true} paginationPageSize={10} />
        </>
    );
};

export default AssetQuoteInputList;
