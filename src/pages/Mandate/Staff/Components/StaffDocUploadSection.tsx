import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Button, Typography, TextField, Autocomplete } from '@mui/material';
import axios from 'axios';
import { fetchError, showMessage } from 'redux/actions';
import { secondaryButton } from 'shared/constants/CustomColor';
import { useDispatch } from 'react-redux';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import DownloadIcon from '@mui/icons-material/Download';
import { downloadFile, downloadTemplate, fileValidation } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import FileNameDiaglogList from 'pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox';
import { _validationMaxFileSizeUpload } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import groupByDocumentData from 'pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { Tooltip } from '@mui/material';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';

const MAX_COUNT = 8;

const StaffDocUpload = ({ mandateId, getStaffDetails, currentRemark, currentStatus }) => {
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
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdDate',
            headerName: 'Created Time',
            headerTooltip: 'Created Time',
            cellRenderer: (e: any) => {
                return moment(e?.data?.createdDate).format('h:mm:ss A');
            },
            sortable: true,
            resizable: true,
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
            minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'remarks',
            headerName: 'Remarks',
            headerTooltip: 'Remarks',
            sortable: true,
            resizable: true,
            width: 190,
            minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'Download',
            headerName: 'Download',
            headerTooltip: 'Download',
            resizable: true,
            width: 110,
            minWidth: 80,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <Tooltip title="Download" className="actionsIcons">
                            <DownloadIcon
                                style={{ fontSize: '15px' }}
                                onClick={() => {
                                    downloadFile(obj?.data, mandateId, dispatch);
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
            width: 110,
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

    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const fileInput = React.useRef(null);
    const { user } = useAuthUser();
    var documentType = 'Staff Data';
    const [remarks, setRemarks] = useState('');
    const [docUploadHistory, setDocUploadHistory] = useState([]);
    const gridRef = React.useRef<AgGridReact>(null);
    const [fileLimit, setFileLimit] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileLength, setFileLength] = useState(0);
    const dispatch = useDispatch();
    const [docType, setDocType] = useState(null);
    const navigate = useNavigate();
    const [projectPlanData, setProjectPlanData] = useState([]);
    const [documentTypeList, setDocumentTypeList] = useState([]);

    useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid') {
            getVersionHistoryData();
        }
    }, [mandateId]);

    const saveOrUploadStaffDataByExcel = (e, formDataExcel) => {
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/StaffDetails/UploadAndSaveExcelData`, formDataExcel)
            .then((response: any) => {
                if (!response) {
                    setUploadedFiles([]);
                    setFileLimit(false);
                    dispatch(fetchError('Error Occurred !'));
                    e.target.value = null;
                    return;
                }
                if (response?.status === 200) {
                    setUploadedFiles([]);
                    setFileLimit(false);
                    response?.data?.status === 'error' ? dispatch(fetchError(response?.data?.message)) : dispatch(showMessage(response?.data?.message));
                    getStaffDetails();
                    getVersionHistoryData();
                    e.target.value = null;
                } else {
                    dispatch(fetchError('Documents are not uploaded successfully!'));
                    setUploadedFiles([]);
                    setFileLimit(false);
                    e.target.value = null;
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const handleUploadFiles = async (e, files) => {
        const uploaded = [...uploadedFiles];
        let limitExceeded = false;
        files &&
            files?.some((file) => {
                if (uploaded && uploaded?.findIndex((f) => f.name === file.name) === -1) {
                    uploaded.push(file);
                    if (uploaded?.length === MAX_COUNT) setFileLimit(true);
                    if (uploaded?.length > MAX_COUNT) {
                        dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));
                        setFileLimit(false);
                        limitExceeded = true;
                        e.target.value = null;
                        return;
                    }
                }
            });
        if (limitExceeded) {
            dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));
            e.target.value = null;
            return;
        }

        if (!limitExceeded) setUploadedFiles(uploaded);
        setFileLength((uploaded && uploaded?.length) || 0);
        const formData: any = new FormData();
        const formDataExcel: any = new FormData();
        formDataExcel.append('mandateId', mandateId?.id);

        formData.append('mandate_id', mandateId?.id);
        formData.append('documenttype', 'Staff Data');
        formData.append('CreatedBy', user?.UserName || '');
        formData.append('ModifiedBy', user?.UserName || '');
        formData.append('entityname', 'Staff Data');
        formData.append('RecordId', mandateId?.id);
        formData.append('remarks', remarks || '');

        for (var key in uploaded) {
            await formData.append('file', uploaded[key]);
            await formDataExcel.append('file', uploaded[key]);
        }

        if (uploaded?.length === 0) {
            setUploadedFiles([]);
            setFileLimit(false);
            e.target.value = null;
            dispatch(fetchError('Error Occurred !'));
            return;
        }

        if (mandateId?.id !== undefined) {
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`, formData)
                .then((response: any) => {
                    if (!response) {
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(fetchError('Error Occurred !'));
                        return;
                    }
                    if (response?.data?.data == null) {
                        saveOrUploadStaffDataByExcel(e, formDataExcel);
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(fetchError('Documents are not uploaded!'));
                        return;
                    } else if (response?.status === 200) {
                        saveOrUploadStaffDataByExcel(e, formDataExcel);
                        setUploadedFiles([]);
                        setFileLimit(false);
                        e.target.value = null;
                        dispatch(showMessage('Documents are uploaded successfully!'));
                    } else {
                        dispatch(fetchError('Documents are not uploaded successfully!'));
                        setUploadedFiles([]);
                        setFileLimit(false);
                        e.target.value = null;
                        return;
                    }
                })
                .catch((error: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
    };

    const handleFileEvent = (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files);
        if (_validationMaxFileSizeUpload(e, dispatch) && fileValidation(e, chosenFiles, dispatch)) {
            handleUploadFiles(e, chosenFiles);
        }
    };

    const getDocumentTypeList = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=DocumentMaster`)
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data && response?.data?.data && response?.data?.data?.length > 0) {
                    if (documentType && documentType !== '') {
                        var data = response?.data?.data && response?.data?.data?.filter((item) => item?.documentType === documentType);

                        setDocumentTypeList(data || []);
                        if (data && data?.length === 1) {
                            setDocType(data?.[0] || null);
                        }
                        return;
                    }
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    const getVersionHistoryData = () => {
        var documentNameList = [];
        var docTypeList =
            documentTypeList &&
            documentTypeList?.length > 0 &&
            documentTypeList?.map((item) => {
                documentNameList.push(item?.documentName);
            });

        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId?.id}&documentType=Staff Data`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data && response?.data && response?.data?.length > 0) {
                    var data = groupByDocumentData(response?.data, 'versionNumber');
                    setDocUploadHistory(data || []);
                }
                if (response && response?.data?.length === 0) {
                    setDocUploadHistory([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    useEffect(() => {
        getDocumentTypeList();
    }, []);
    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }

    const getHeightForTable = useCallback(() => {
        var height = 0;
        var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
        if (dataLength === 0) return '0px';
        height = 45 * dataLength + 57;

        if (height > 0 && dataLength <= 4) return `${height}px`;
        return '200px';
    }, [docUploadHistory, docType]);
    const getHeightForProjectPlan = useCallback(() => {
        var height = 0;
        var dataLength = (projectPlanData && projectPlanData?.length) || 0;
        if (dataLength === 0) return '0px';
        height = 45 * dataLength + 56;

        if (height > 0 && dataLength <= 4) return `${height}px`;
        return '200px';
    }, [projectPlanData, docType]);

    return (
        <div style={{ marginTop: '10px' }} className="inside-scroll-198-staf">
            <Grid container item display="flex" flexDirection="row" spacing={5} justifyContent="start" alignSelf="center">
                <Grid item xs={6} md={2}>
                    <Autocomplete
                        disablePortal
                        sx={
                            documentTypeList?.length === 1 && {
                                backgroundColor: '#f3f3f3',
                                borderRadius: '6px',
                            }
                        }
                        id="combo-box-demo"
                        getOptionLabel={(option) => option?.documentName?.toString() || ''}
                        disableClearable={true}
                        disabled={documentTypeList?.length === 1 ? true : false}
                        options={documentTypeList || []}
                        onChange={(e, value) => {
                            setDocType(value);
                        }}
                        placeholder="Document Type"
                        value={docType}
                        renderInput={(params) => (
                            <TextField
                                name="state"
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
                </Grid>

                <Grid item xs={6} md={4} sx={{ position: 'relative' }}>
                    <div>
                        <TextField
                            name="Remarks"
                            id="Remarks"
                            variant="outlined"
                            size="small"
                            className="w-85"
                            type="text"
                            placeholder="Remarks"
                            onChange={(e) => setRemarks(e.target.value)}
                            onKeyDown={(e: any) => {
                                regExpressionRemark(e);
                            }}
                            onPaste={(e: any) => {
                                if (!textFieldValidationOnPaste(e)) {
                                    dispatch(fetchError('You can not paste Spacial characters'));
                                }
                            }}
                        />
                    </div>
                </Grid>

                <Grid item xs={6} md={6}>
                    <div style={{ display: 'flex' }}>
                        {docType?.templatePath && (
                            <Button
                                onClick={() => {
                                    downloadTemplate(docType);
                                }}
                                variant="outlined"
                                size="medium"
                                style={secondaryButton}
                            >
                                Download Template
                            </Button>
                        )}
                        <div>
                            <Button
                                onClick={() => {
                                    if (mandateId?.id === undefined) {
                                        dispatch(fetchError('Please select Mandate !!!'));
                                        return;
                                    }
                                    fileInput.current.click();
                                }}
                                variant="outlined"
                                size="medium"
                                style={secondaryButton}
                            >
                                Upload Staff Data
                            </Button>
                            <input ref={fileInput} multiple onChange={handleFileEvent} disabled={fileLimit} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" type="file" style={{ display: 'none' }} />
                        </div>
                    </div>
                </Grid>
            </Grid>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography sx={{ marginTop: '10px' }}>Version History</Typography>{' '}
            </div>
            <div style={{ height: getHeightForTable(), marginTop: '10px', overflow: 'hidden' }}>
                <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={docUploadHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={docUploadHistory?.length > 3 ? true : false} paginationPageSize={3} />
            </div>
            <div className="bottom-fix-history" style={{ bottom: 30 }}>
                {mandateId && mandateId?.id !== undefined && <MandateStatusHistory mandateCode={mandateId?.id} accept_Reject_Status={currentStatus} accept_Reject_Remark={currentRemark} />}
            </div>
        </div>
    );
};
export default StaffDocUpload;
