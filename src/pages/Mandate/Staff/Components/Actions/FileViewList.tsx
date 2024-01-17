import React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import groupByDocumentData from 'pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData';
import { DialogActions, Tooltip } from '@mui/material';
import axios from 'axios';
import { fetchError } from 'redux/actions';
import { useDispatch } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import FileNameDiaglogList from 'pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox';
import moment from 'moment';
import { downloadFile } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';

const FileDownloadList = ({ props, mandate }) => {
    const gridRef = React.useRef<AgGridReact>(null);
    const dispatch = useDispatch();
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [docUploadHistory, setDocUploadHistory] = React.useState([]);
    const [docUploadHistoryBk, setDocUploadHistoryBk] = React.useState([]);
    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }
    const [open, setOpen] = React.useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    let columnDefs = [
        {
            field: 'staff_Classification',
            headerName: 'Staff Classification',
            headerTooltip: 'Staff Classification',
            tooltipField: 'staff_Classification',
            resizable: true,
            width: 120,
            minWidth: 120,
        },
        {
            field: 'staff_Category',
            headerName: 'Staff Category',
            headerTooltip: 'Staff Category',
            resizable: true,
            width: 120,
            minWidth: 120,
        },
        {
            field: 'staff_Count',
            headerName: 'Staff Count',
            headerTooltip: 'Staff Count',
            resizable: true,
            width: 80,
            minWidth: 80,
        },
        {
            field: 'staff_Name',
            headerName: 'Name',
            headerTooltip: 'Name',
            resizable: true,
            width: 80,
            minWidth: 80,
        },
        {
            field: 'panNumber',
            headerName: 'PAN No.',
            headerTooltip: 'PAN Number',
            sortable: true,
            resizable: true,
            editable: true,
            width: 100,
            minWidth: 100,
        },
        {
            field: 'mobileNo',
            headerName: 'Mobile No.',
            headerTooltip: 'Mobile Number',
            sortable: true,
            resizable: true,
            editable: true,
            width: 110,
            minWidth: 110,
        },

        {
            field: 'join_Date',
            headerName: 'Joining Date',
            headerTooltip: 'Joining Date',
            sortable: true,
            resizable: true,
            width: 120,
            minWidth: 120,
        },
        {
            field: 'aadharNumber',
            headerName: 'Aadhaar Card No',
            headerTooltip: 'Aadhaar Card Number',
            sortable: true,
            resizable: true,
            editable: true,
            width: 135,
            minWidth: 135,
        },
        {
            field: 'address',
            headerName: 'Address',
            headerTooltip: 'Address',
            sortable: true,
            tooltipField: 'address',
            editable: true,
            resizable: true,
            width: 100,
            minWidth: 100,
        },
        {
            field: 'staff_Status',
            headerName: 'Staff Status',
            headerTooltip: 'Staff Status',
            sortable: true,
            resizable: true,
            width: 120,
            minWidth: 120,
        },
        {
            field: 'agencyName',
            headerName: 'Agency Name',
            headerTooltip: 'Agency Name',
            sortable: true,
            resizable: true,
            width: 120,
            minWidth: 120,
        },
        {
            field: 'agencyEmployeeID',
            headerName: 'Agency Employee ID',
            headerTooltip: 'Agency Employee ID',
            resizable: true,
            width: 140,
            minWidth: 140,
        },
        {
            field: 'bankName',
            headerName: 'Bank Name',
            headerTooltip: 'Bank Name',
            resizable: true,
            width: 140,
            minWidth: 140,
        },
        {
            field: 'accountNumber',
            headerName: 'Bank Account No',
            headerTooltip: 'Bank Account Number',
            sortable: true,
            resizable: true,
        },
        {
            field: 'ifsc',
            headerName: 'IFSC Code',
            headerTooltip: 'IFSC Code',
            sortable: true,
            resizable: true,
        },
        {
            field: 'branchName',
            headerName: 'Branch Name',
            headerTooltip: 'Branch Name',
            sortable: true,
            resizable: true,
        },
    ];
    // let columnDefs = [
    //     {
    //         field: "srno",
    //         headerName: "Sr. No",
    //         headerTooltip: "Serial Number",
    //         cellRenderer: (e: any) => {
    //             var index = e?.rowIndex;
    //             return index + 1;
    //         },

    //         sortable: true,
    //         resizable: true,
    //         width: 80,
    //         minWidth: 80,
    //         cellStyle: { fontSize: "13px" },
    //     },
    //     {
    //         field: "documenttype",
    //         headerName: "Document Type",
    //         headerTooltip: "Document Type",
    //         sortable: true,
    //         resizable: true,
    //         width: 130,
    //         minWidth: 80,
    //         cellStyle: { fontSize: "13px" },
    //     },
    //     {
    //         field: "createdDate",
    //         headerName: "Created Date",
    //         headerTooltip: "Created Date",
    //         sortable: true,
    //         resizable: true,
    //         cellRenderer: (e: any) => {
    //             return moment(e?.data?.createdDate).format("DD/MM/YYYY");
    //         },
    //         width: 150,
    //         minWidth: 80,
    //         cellStyle: { fontSize: "13px" },
    //     },
    //     {
    //         field: "createdDate",
    //         headerName: "Created Time",
    //         headerTooltip: "Created Time",
    //         cellRenderer: (e: any) => {
    //             return moment(e?.data?.createdDate).format("h:mm:ss A");
    //         },
    //         sortable: true,
    //         resizable: true,
    //         width: 150,
    //         minWidth: 80,
    //         cellStyle: { fontSize: "13px" },
    //     },
    //     {
    //         field: "createdBy",
    //         headerName: "Created By",
    //         headerTooltip: "Created By",
    //         sortable: true,
    //         resizable: true,
    //         width: 190,
    //         minWidth: 80,
    //         cellStyle: { fontSize: "13px" },
    //     },
    //     {
    //         field: "Download",
    //         headerName: "Download",
    //         headerTooltip: "Download",
    //         resizable: true,
    //         width: 90,
    //         minWidth: 80,
    //         cellStyle: { fontSize: "13px", textAlign: "center" },

    //         cellRenderer: (obj: any) => (
    //             <>
    //                 <div className="actions">
    //                     <Tooltip title="Download" className="actionsIcons">
    //                         <DownloadIcon
    //                             style={{ fontSize: "20px" }}
    //                             onClick={() => downloadFile(obj?.data, mandate, dispatch)}
    //                             className="actionsIcons"
    //                         />
    //                     </Tooltip>
    //                 </div>
    //             </>
    //         ),
    //     },
    //     {
    //         field: "",
    //         headerName: "View",
    //         headerTooltip: "View",
    //         resizable: true,
    //         width: 90,
    //         minWidth: 80,
    //         cellStyle: { fontSize: "13px", textAlign: "center" },

    //         cellRenderer: (obj: any) => (
    //             <>
    //                 <div className="actions">
    //                     <FileNameDiaglogList props={obj} />
    //                 </div>
    //             </>
    //         ),
    //     },
    // ];

    const getVersionHistoryData = (recordId) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandate?.id}&documentType=Staff Documents&recordId=${recordId || 0}`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data && response?.data && response?.data?.length > 0) {
                    var data = groupByDocumentData(response?.data, 'versionNumber');
                    setDocUploadHistory(data || []);
                    setDocUploadHistoryBk(data || []);
                }
                if (response && response?.data?.length === 0) {
                    setDocUploadHistory([]);
                    setDocUploadHistoryBk([]);
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

        if (mandate?.id !== undefined) {
            getVersionHistoryData(props?.data?.id);
        }
    }, [props?.data, open]);
    console.log('props', props);
    return (
        <>
            {' '}
            <Tooltip className="actionsIcons" id={`${props?.data?.id}_viewordownload_photos`} title="View/Download Photos">
                <VisibilityIcon onClick={handleOpen} style={{ fontSize: '20px', color: '#000', cursor: 'pointer' }} className="actionsIcons" />
            </Tooltip>
            <Dialog fullWidth maxWidth="xl" open={open} onClose={handleClose}>
                <DialogTitle style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>Download/View Files</DialogTitle>

                <div style={{ height: 'calc(100vh - 260px)', margin: '0px 20px 0px', overflow: 'hidden' }}>
                    <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={[{ ...props?.data }] || []} onGridReady={onGridReady} gridRef={gridRef} pagination={docUploadHistory?.length > 3 ? true : false} paginationPageSize={3} />
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
export default FileDownloadList;