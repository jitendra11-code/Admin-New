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
import { downloadAssetFile, downloadFile } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import AppLoader from '@uikit/core/AppLoader';

const InputQuotationFileDownloadList = ({ assetCode, props, recId }) => {
    const gridRef = React.useRef<AgGridReact>(null);
    const dispatch = useDispatch();
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [docUploadHistory, setDocUploadHistory] = React.useState([]);
    const [docUploadHistoryBk, setDocUploadHistoryBk] = React.useState([]);
    const [loader, setLoader] = React.useState(false);
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
            maxWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'documenttype',
            headerName: 'Document Type',
            headerTooltip: 'Document Type',
            sortable: true,
            resizable: true,
            width: 130,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
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
            field: 'modifiedDate',
            headerName: 'Modified Date',
            headerTooltip: 'Modified Date',
            cellRenderer: (e: any) => {
                return moment(e?.data?.modifiedDate).format('DD/MM/YYYY');
            },
            sortable: true,
            resizable: true,
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
        },
        {
            field: 'Download',
            headerName: 'Download',
            headerTooltip: 'Download',
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <Tooltip title="Download" className="actionsIcons">
                            <DownloadIcon
                                style={{ fontSize: '13px', textAlign: 'center' }}
                                onClick={() => {
                                    downloadAssetFile(obj?.data, recId, setLoader, dispatch);
                                }}
                                className="actionsIcons"
                            />
                        </Tooltip>
                    </div>
                </>
            ),
        },
        {
            field: '',
            headerName: 'View',
            headerTooltip: 'View',
            resizable: true,
            width: 90,
            minWidth: 80,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <FileNameDiaglogList props={obj} />
                    </div>
                </>
            ),
        },
    ];

    const getVersionHistoryData = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistoryForAssetPool?assetcode=${assetCode?.requestNo}&RecordId=${recId || ''}&documentType=Asset Quotation&entityname=${props?.data?.vendorCategory}`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data && response?.data && response?.data?.length > 0) {
                    var data = groupByDocumentData(response?.data, 'versionNumber');
                    console.log('VIEW', response?.data, data, props);
                    data = data && data?.length > 0 && data?.filter((item) => item?.recordId === props?.data?.record_Id && parseInt(props?.data?.record_Id));
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
        if (recId !== undefined) {
            getVersionHistoryData();
        }
    }, [props, open]);
    console.log('###AAA', loader);
    return (
        <>
            {/* {loader ? <AppLoader /> : ''} */}
            <Tooltip className="actionsIcons" id={`${props?.id}_viewordownload_photos`} title="Download/View Files">
                <VisibilityIcon onClick={handleOpen} style={{ fontSize: '20px', color: '#000', cursor: 'pointer' }} className="actionsIcons" />
            </Tooltip>
            <Dialog fullWidth maxWidth="xl" open={open} onClose={handleClose}>
                <DialogTitle style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>Download/View Files</DialogTitle>

                <div style={{ height: 'calc(100vh - 260px)', margin: '0px 20px 0px', overflow: 'hidden' }}>
                    {loader ? <AppLoader /> : ''}
                    <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={docUploadHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={docUploadHistory?.length > 3 ? true : false} paginationPageSize={10} />
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
