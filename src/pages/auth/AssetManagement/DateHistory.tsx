import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { Button, DialogActions, DialogContent } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import { Api } from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
function DateHistory({ open, setOpen, dateHistory }) {
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const gridRef = React.useRef<AgGridReact>(null);
    // useEffect(() => {
    //     axios
    //         .get(`${process.env.REACT_APP_BASEURL}/api/AssetGatePass/GetAssetGatePassReturnableHistory`)
    //         .then((response) => {
    //             console.log('Date History', response);
    //         })
    //         .catch(() => {});
    // }, []);
    let columnDefs = [
        {
            field: 'srno',
            headerName: 'Sr No.',
            headerTooltip: 'Serial Number',
            sortable: true,
            resizable: true,
            width: 180,
            cellRenderer: (e: any) => {
                var index = e?.rowIndex;
                return index + 1;
            },
            cellStyle: { fontSize: '13px' },
        },
        // {
        //     field: 'requestNo',
        //     headerName: 'Request Number',
        //     headerTooltip: 'Request Number',
        //     sortable: true,
        //     resizable: true,
        //     width: 180,
        //     // minWidth: 180,
        //     // valueFormatter: (params) => {
        //     //     console.log('params', params?.data?.assetRequests?.[0]?.requestNo);
        //     //     if (params?.data?.assetRequests?.[0]?.requestNo !== null) {
        //     //         return params?.data?.assetRequests?.[0]?.requestNo;
        //     //     }
        //     // },
        //     cellStyle: { fontSize: '13px' },
        // },
        {
            field: 'previousdate',
            headerName: 'Previous Date',
            headerTooltip: 'Previous Date',
            sortable: true,
            resizable: true,
            width: 120,
            // minWidth: 120,
            cellStyle: { fontSize: '13px' },
            valueFormatter: (params) => {
                if (params?.data?.previousdate !== null) {
                    return moment(params?.data?.previousdate).format('DD-MM-YYYY');
                }
                return '-';
            },
        },
        {
            field: 'returnDate',
            headerName: 'Changed Return Date',
            headerTooltip: 'Changed Return Date',
            sortable: true,
            resizable: true,
            width: 220,
            // minWidth: 180,
            cellStyle: { fontSize: '13px' },
            valueFormatter: (params) => {
                if (params?.data?.returnDate !== null) {
                    return moment(params?.data?.returnDate).format('DD-MM-YYYY');
                }
                return '-';
            },
        },
        {
            field: 'remarks',
            headerName: 'Remarks',
            headerTooltip: 'Remarks',
            sortable: true,
            resizable: true,
            width: 180,
            //   minWidth: 140,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'modifiedDate',
            headerName: 'Modified Date',
            headerTooltip: 'Modified Date',
            sortable: true,
            resizable: true,
            width: 220,
            // minWidth: 180,
            cellStyle: { fontSize: '13px' },
            valueFormatter: (params) => {
                if (params?.data?.modifiedDate !== null) {
                    return moment(params?.data?.modifiedDate).format('DD-MM-YYYY');
                }
                return '-';
            },
        },
        {
            field: 'modifiedBy',
            headerName: 'Modify By',
            headerTooltip: 'Modify By',
            sortable: true,
            resizable: true,
            width: 150,
            // minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
    ];
    function onGridReady(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridApi(params.api);
    }
    const handleClose = () => {
        setOpen(false);
    };
    return (
        <>
            <Dialog fullWidth open={open} aria-describedby="alert-dialog-slide-description" maxWidth="lg" PaperProps={{ style: { borderRadius: '10px' } }}>
                <DialogTitle id="alert-dialog-title" className="title-model">
                    Return Date History
                </DialogTitle>
                <DialogContent>
                    <div style={{ height: 'calc(100vh - 320px)', margin: '0px 20px 0px', overflow: 'hidden' }}>
                        <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={dateHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                    </div>
                </DialogContent>
                <DialogActions className="button-wrap">
                    <Button className="yes-btn" onClick={handleClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default DateHistory;
