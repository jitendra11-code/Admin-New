import React from 'react';
import Button from '@mui/material/Button';
import axios from "axios";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import HistoryIcon from '@mui/icons-material/History';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { DialogActions, Tooltip } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
const BOQItemHistory = ({ props }) => {
    const [open, setOpen] = React.useState(false)
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const gridRef = React.useRef<AgGridReact>(null);
    const [boqHistoryData, setBOQHistoryData] = React.useState([])

    React.useEffect(() => {
        if (!open) return
        axios.get(`${process.env.REACT_APP_BASEURL}/api/BOQ/GetBOQDetailsHistoryByBOQDetailId?boqDetailsId=${props?.data?.id || 0}`).
            then((res) => {
                if (!res) return;
                if (res && res?.data && res?.data?.length > 0) {
                    var _resData = res && res?.data || [];
                    setBOQHistoryData(_resData || [])
                } else {
                    setBOQHistoryData([])
                }
            })
            .catch(err => {
            })
    }, [props?.data, open])

    const handleClose = () => {
        setOpen(false)
    };
    const handleOpen = () => {
        setOpen(true)
    }

    let columnDefs = [

        {
            field: "srno",
            headerName: "Sr. No",
            headerTooltip : "Serial Number",
            cellRenderer: (e: any) => {
                var index = e?.rowIndex
                return index + 1;
            },
            sortable: true,
            resizable: true,
            width: 60,
            minWidth: 60,
            cellStyle: { fontSize: "13px" },
        },

        {
            field: "catelouge_Id",
            headerName: "Catalogue Id",
            headerTooltip : "Catalogue Id",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 90,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "item_Description",
            headerName: "Item Description",
            headerTooltip : "Item Description",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 90,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "vendor_Code",
            headerName: "Vendor Code",
            headerTooltip : "Vendor Code",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 90,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "material_Code",
            headerName: "Material Code",
            headerTooltip : "Material Code",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 90,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "material_Category",
            headerName: "Material Category",
            headerTooltip : "Material Category",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 150,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "specification",
            headerName: "SAP Description",
            headerTooltip : "SAP Description",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 90,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "rate",
            headerName: "Rate Per Unit",
            headerTooltip : "Rate Per Unit",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 90,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "unit",
            headerName: "Unit of Measurement",
            headerTooltip : "Unit of Measurement",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 90,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "quantity",
            headerName: "Quantity",
            headerTooltip : "Quantity",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 90,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "amount",
            headerName: "Amount",
            headerTooltip : "Amount",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 110,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "hsN_CODE",
            headerName: "HSN Code",
            headerTooltip : "HSN Code",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 110,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "catalogue_Status",
            headerName: "Catalogue Status",
            headerTooltip : "Catalogue Status",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 110,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "createddate",
            headerName: "Created On",
            headerTooltip : "Created On",
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.createddate).format('DD/MM/YYYY')
            },
            width: 150,
            minWidth: 115,
            cellStyle: { fontSize: "13px" },
        },

        {
            field: "createdby",
            headerName: "Created By",
            headerTooltip : "Created By",
            sortable: true,
            resizable: true,
            width: 190,
            minWidth: 110,
            cellStyle: { fontSize: "13px" },
        },
    ];




    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        params.api.sizeColumnsToFit();
    }



    return (
        <>
            <Tooltip className='actionsIcons'
                id={`${props?.data?.id}_project`}
                title="BOQ History">
                <HistoryIcon style={{ cursor: 'pointer', fontSize: '20px', color: '#000' }}
                    onClick={handleOpen}
                    className="actionsIcons" />
            </Tooltip>
            <Dialog
                fullWidth
                maxWidth="xl"
                open={open}
                onClose={handleClose}>
                <DialogTitle
                    style={{ paddingRight: 20, fontSize: 16, color: "#000" }}
                >BOQ Item History</DialogTitle>
                <div
                    style={{ height: "calc(100vh - 260px)", margin: "0px 20px 0px", overflow: "hidden"}}>
                    <CommonGrid
                        rowHeight={50}
                        defaultColDef={{
                            flex: 1
                        }}
                        columnDefs={columnDefs}
                        rowData={boqHistoryData || []}
                        onGridReady={onGridReady}
                        gridRef={gridRef}
                        pagination={true}
                        paginationPageSize={10}

                    />
                </div>
                <DialogActions className="button-wrap" >
                    <Button className="yes-btn" onClick={handleClose}>Close</Button>

                </DialogActions>
            </Dialog>
        </>
    );
}
export default BOQItemHistory;