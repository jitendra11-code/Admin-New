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
const ProjectPlanHistoryData = ({ props }) => {

    const [open, setOpen] = React.useState(false)
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const gridRef = React.useRef<AgGridReact>(null);
    const [projectPlanHistoryData, setProjectPlanHistoryData] = React.useState([])

    React.useEffect(() => {
        if (!open) return
        axios.get(`${process.env.REACT_APP_BASEURL}/api/ProjectPlan/GetProjectPlanHistory?mandateId=${props?.data?.mandateId || 0}&planId=${props?.data?.planId || 0}`).
            then((res) => {
                if (!res) return;
                if (res && res?.data && res?.data?.length > 0) {
                    var _resData = res && res?.data || [];
                    setProjectPlanHistoryData(_resData || [])
                } else {
                    setProjectPlanHistoryData([])
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
            field: "section",
            headerName: "Section",
            headerTooltip: "Section",
            sortable: true,
            resizable: true,
            width: 120,
            minWidth: 120,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "vendorType",
            headerName: "Vendor Type",
            headerTooltip: "Vendor Type",
            sortable: true,
            resizable: true,
            width: 140,
            minWidth: 140,
            cellStyle: { fontSize: "13px" },

        },
        {
            field: "process_Owner",
            headerName: "Owner/SPOC",
            headerTooltip: "Owner/SPOC",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 150,
            suppressSizeToFit: true,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "proposed_Start_Date",
            headerName: "Proposed Start",
            headerTooltip: "Proposed Start",
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.proposed_Start_Date).isValid() && moment(e?.data?.proposed_Start_Date).format('DD/MM/YYYY') || null
            },
            width: 140,
            minWidth: 140,
            cellStyle: { fontSize: "13px" },

        },
        {
            field: "proposed_End_Date",
            headerName: "Proposed End",
            headerTooltip: "Proposed End",
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.proposed_End_Date).isValid() && moment(e?.data?.proposed_End_Date).format('DD/MM/YYYY') || null
            },

            minWidth: 180,
            width: 180,
            cellStyle: { fontSize: "13px" },

        },

        {
            field: "pM_remarks",
            headerName: "PM Remarks",
            headerTooltip: "PM Remarks",
            tooltipField: "pM_remarks",
            sortable: true,
            resizable: true,
            width: 180,
            minWidth: 180,
            suppressSizeToFit: true,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "actual_Start_Date",
            headerName: "Actual Start",
            headerTooltip: "Actual Start",
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.actual_Start_Date).isValid() && moment(e?.data?.actual_Start_Date).format('DD/MM/YYYY') || null
            },
            width: 180,
            minWidth: 180,

            cellStyle: { fontSize: "13px" },

        }, {
            field: "actual_End_Date",
            headerName: "Actual End",
            headerTooltip: "Actual End",
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.actual_End_Date).isValid() && moment(e?.data?.actual_End_Date).format('DD/MM/YYYY') || null
            },
            width: 180,
            minWidth: 180,
            cellStyle: { fontSize: "13px" },

        },
        {
            field: "vendor_remarks",
            headerName: "Vendor Remarks",
            headerTooltip: "Vendor Remarks",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 150,
            suppressSizeToFit: true,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "status_percentage",
            headerName: "Status(%)",
            headerTooltip: "Status(%)",
            sortable: true,
            resizable: true,
            width: 110,
            minWidth: 110,
            cellStyle: { fontSize: "13px" },


        },

        {
            field: "createdBy",
            headerName: "Created By",
            headerTooltip: "Created By",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 150,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "createdDate",
            headerName: "Created Date",
            headerTooltip: "Created Date",
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.createdDate).format("DD/MM/YYYY");
            },
            width: 150,
            minWidth: 150,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "createdDate",
            headerName: "Created Time",
            headerTooltip: "Created Time",
            cellRenderer: (e: any) => {
                return moment(e?.data?.createdDate).format("h:mm:ss A");
            },
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 150,
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
                title="Project Plan History">
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
                >Project Plan History</DialogTitle>
                <div
                    style={{ height: "calc(100vh - 260px)", margin: "0px 20px 0px", }}>
                    <CommonGrid
                        rowHeight={50}
                        defaultColDef={{
                            flex: 1
                        }}
                        columnDefs={columnDefs}
                        rowData={projectPlanHistoryData || []}
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
export default ProjectPlanHistoryData;