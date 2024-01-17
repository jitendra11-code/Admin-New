import { Autocomplete, Box, Button, Grid, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppState } from 'redux/store';
import { secondaryButton } from 'shared/constants/CustomColor';
import DownloadIcon from '@mui/icons-material/Download';
import { downloadTemplate, downloadFile, fileValidation, downloadAssetFile } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import moment from 'moment';
import { fetchError, showMessage, showWarning } from 'redux/actions';
import axios from 'axios';
import FileNameDiaglogList from 'pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox';
import { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';
import { _validationMaxFileSizeUpload } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import groupByDocumentData from 'pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}
declare global {
    interface Navigator {
        msSaveBlob?: (blob: any, defaultName?: string) => boolean;
    }
}

const TabPanel: (props: TabPanelProps) => any = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {children}
        </div>
    );
};

const MAX_COUNT = 8;
const BranchBulkUpload = () => {
    const [remarks, setRemarks] = React.useState('');
    const [docType, setDocType] = React.useState(null);
    const { user } = useAuthUser();
    const [docUploadHistory, setDocUploadHistory] = React.useState([]);
    const [filteredDocUploadHistory, setFilteredDocUploadHistory] = React.useState([]);
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const [value, setValue] = React.useState<any>(0);
    const [uploadNo, setUploadNo] = React.useState(null);
    const fileInput = React.useRef(null);
    const [uploadedFiles, setUploadedFiles] = React.useState([]);
    const [fileLimit, setFileLimit] = React.useState(false);
    const [userAction, setUserAction] = React.useState(null);
    const [fileLength, setFileLength] = React.useState(0);
    const [documentTypeList, setDocumentTypeList] = React.useState([]);
    const { id } = useParams();
    const [phaseId, setPhaseId] = React.useState<any>(id?.toString());
    const [loader, setLoader] = React.useState(false);
    const action = userAction?.action || '';
    const documentTypeName = 'Branch Master Upload';
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { state } = useLocation();
    console.log('State', state);
    const getDocumentTypeList = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=DocumentMaster`)
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data && response?.data?.data && response?.data?.data?.length > 0) {
                    setDocumentTypeList(response?.data?.data);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    console.log("docType",docType,documentTypeList)
    const getUploadNumber = (e, files) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterRecordId`)
            .then((response: any) => {
                if (!response) return;
                console.log('recId', response);
                if (response && response?.data && response?.data && response?.status === 200) {
                    var recId = response?.data;
                    handleUploadFiles(e, files, recId);
                } else {
                    e.target.value = null;
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    useEffect(() => {
        getDocumentTypeList();
    }, []);

    useEffect(() => {
        if (documentTypeList && documentTypeList?.length > 0) {
            var obj = documentTypeList && documentTypeList.find((item) => item?.documentName === 'Branch Master Upload');
            setDocType(obj || null);
        }
    }, [documentTypeList]);

    const getVersionHistoryData = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=0&documentType=${documentTypeName}&entityname=${documentTypeName}&Status=${value === 1 ? 'Completed' : value === 2 ? 'Error' : 'Inprogress'}`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data && response?.data && response?.data?.length > 0) {
                    var data = groupByDocumentData(response?.data, 'versionNumber');
                    setDocUploadHistory(data || []);
                    // if (value == 0) {
                    //     const inProgress = data?.filter((item) => item?.status !== 'Completed');
                    setFilteredDocUploadHistory([...data]);
                    // } else {
                    //     const inProgress = data?.filter((item) => item?.status == 'Completed');
                    //     setFilteredDocUploadHistory([...inProgress]);
                    // }
                }

                if (response && response?.data?.length === 0) {
                    setDocUploadHistory([]);
                    setFilteredDocUploadHistory([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    useEffect(() => {
        getVersionHistoryData();
    }, [docType, value]);

    const handleUploadFiles = async (e, files, recId) => {
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
                        return;
                    }
                }
            });

        if (limitExceeded) {
            dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));

            return;
        }

        if (!limitExceeded) setUploadedFiles(uploaded);
        setFileLength((uploaded && uploaded?.length) || 0);
        const formData: any = new FormData();
        const formDataTemp: any = new FormData();
        formData.append('mandate_id', 0);
        formData.append('documenttype', documentTypeName);
        formData.append('CreatedBy', user?.UserName || '');
        formData.append('ModifiedBy', user?.UserName || '');
        formData.append('entityname', documentTypeName);
        formData.append('RecordId', recId || 0);
        formData.append('remarks', remarks || '');
        // formDataTemp.append('uploadNo', recId || 0);
        for (var key in uploaded) {
            await formData.append('file', uploaded[key]);
        }
        for (var keys in uploaded) {
            await formDataTemp.append('file', uploaded[keys]);
        }

        if (uploaded?.length === 0) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError('Error Occurred !'));
            return;
        }
        console.log('abcd', formDataTemp, formData);
        if (formData) {
            dispatch(showWarning('Upload is in progress, please check after sometime'));

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
                        setRemarks('');
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(fetchError('Documents are not uploaded!'));
                        getVersionHistoryData();
                        return;
                    } else if (response?.status === 200) {
                        setRemarks('');
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(showMessage('Documents are uploaded successfully!'));
                        getVersionHistoryData();
                        axios
                            .post(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/UploadAndSaveBranchMasterData?recordId=${recId}`, formDataTemp)
                            .then((res) => {
                                if (!res) {
                                    e.target.value = null;
                                    dispatch(fetchError('Error Occured when uploading file !!!'));
                                    return;
                                }
                                e.target.value = null;
                                if (res?.data?.status) {
                                    dispatch(showMessage(res?.data?.message));
                                }
                            })
                            .catch((err) => {});
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
    };

    const handleFileEvent = (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files);
        if (_validationMaxFileSizeUpload(e, dispatch) && fileValidation(e, chosenFiles, dispatch)) {
            getUploadNumber(e, chosenFiles);
        }
    };
    function getFileNameFromBase64(base64String) {
        const data = atob(base64String);
        const regex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const match = regex.exec(data);
        if (match != null) {
            return match[1].replace(/['"]/g, '');
        }
        return null;
    }

    const downloadFileLogFile = (data) => {
        console.log('data', data);
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/DownloadBranchMasterlogData?RecordId=${data?.recordId || 0}&Type=${value === 1 ? 'Completed' : 'Error'}`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data) {
                    var filename = `Branch_Bulk_Upload_Log(${moment().format('ddd DD/MM/YYYY hh:mm:ss A')}).xlsx`;
                    if (!filename) {
                        dispatch(fetchError('Error Occurred !'));
                        return;
                    }
                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        let byteChar = atob(response?.data);
                        let byteArray = new Array(byteChar.length);
                        for (let i = 0; i < byteChar.length; i++) {
                            byteArray[i] = byteChar.charCodeAt(i);
                        }
                        let uIntArray = new Uint8Array(byteArray);
                        let blob = new Blob([uIntArray], { type: 'application/vnd.ms-excel' });
                        window.navigator.msSaveBlob(blob, filename);
                    } else {
                        const source = `data:application/vnd.ms-excel;base64,${response?.data}`;
                        const link = document.createElement('a');
                        link.href = source;
                        link.download = filename;
                        link.click();
                        dispatch(showMessage('The Asset Bulk Upload Log file is downloaded successfully!'));
                    }
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const getHeightForTable = useCallback(() => {
        var height = 0;
        var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
        if (dataLength === 0) return '0px';
        height = 45 * dataLength + 57;

        if (height > 0 && dataLength <= 4) return `${height}px`;
        return '200px';
    }, [docUploadHistory, docType]);

    let columnDefs2 = [
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
            width: value == 0 ? 50 : 50,
            minWidth: value == 0 ? 50 : 50,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'documenttype',
            headerName: 'Report Type',
            headerTooltip: 'Report Type',
            sortable: true,
            resizable: true,
            // width: 400,
            // minWidth: 200,
            width: value == 0 ? 400 : 400,
            minWidth: value == 0 ? 260 : 200,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'filename',
            headerName: 'File Name',
            headerTooltip: 'File Name',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.filename;
                data = data?.split('.');
                data = data?.[0];
                return data || '';
            },
            width: value == 0 ? 400 : 400,
            minWidth: value == 0 ? 260 : 200,
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
            // width: 150,
            // minWidth: 100,
            width: value == 0 ? 147 : 147,
            minWidth: value == 0 ? 147 : 147,
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
            // width: 150,
            // minWidth: 100,
            width: value == 0 ? 147 : 147,
            minWidth: value == 0 ? 147 : 147,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdBy',
            headerName: 'Created By',
            headerTooltip: 'Created By',
            sortable: true,
            resizable: true,
            width: 120,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'Download',
            headerName: 'Download',
            headerTooltip: 'Download',
            resizable: true,
            width: 110,
            minWidth: 110,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <Tooltip title="Download" className="actionsIcons">
                            <DownloadIcon
                                style={{ fontSize: '15px' }}
                                onClick={() => {
                                    console.log('obj?.data', obj?.data);
                                    downloadFile(obj?.data, { id: 0 }, dispatch)
                                }}
                                className="actionsIcons"
                            />
                        </Tooltip>
                    </div>
                </>
            ),
        },
        {
            field: 'Download Log',
            headerName: value == 1 ? 'Uploaded Log' : 'Error Log',
            headerTooltip: value == 1 ? 'Uploaded Log' : 'Error Log',
            resizable: true,
            hide: value === 0,
            width: 120,
            minWidth: 120,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <DownloadIcon style={{ fontSize: '15px' }} onClick={() => downloadFileLogFile(obj?.data)} className="actionsIcons" />
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
            hide: value === 1 || value === 2,
            minWidth: 100,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <FileNameDiaglogList props={obj} />
                    </div>
                </>
            ),
        },
        {
            field: '',
            headerName: 'Count',
            headerTooltip: 'Count',
            resizable: true,
            width: 90,
            hide: value === 0,
            minWidth: 90,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => {
                const Parts = obj?.data?.uid.split('/');

                const res = (value === 1 ? Parts[0] : value === 2 ? Parts[1] : '') + ('/' + Parts[2]);
                console.log('AAA', obj?.data?.id, obj, res);
                return res || '';
            },
        },
    ];

    const defineStatusOfUploadByUser = useCallback(
        (user) => {
            var status = false;

            if (user?.role !== 'Sourcing Associate' && (docType?.documentName === 'LOI' || docType?.documentName === 'TSR' || docType?.documentName === 'Additional Document' || docType?.documentName === 'Lease Deed Sign Copy')) {
                return true;
            } else if (user?.role !== 'Compliance Associate' && docType?.documentName === 'RBI Intimation') {
                return true;
            } else if (user?.role !== 'Legal Associate' && (docType?.documentName === 'Lease Deed' || docType?.documentName === 'LOA')) {
                return true;
            }

            return false;
        },
        [user, docType, setDocType],
    );

    const handleTab = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        if (newValue === 0) {
            const inProgress = docUploadHistory?.filter((item) => item?.status !== 'Completed');
            setFilteredDocUploadHistory([...inProgress]);
        } else if (newValue === 1) {
            const Completed = docUploadHistory?.filter((item) => item?.status === 'Completed');
            setFilteredDocUploadHistory([...Completed]);
        }
    };
    return (
        <>
            {' '}
            <Box component="h2" className="page-title-heading my-6">
                Branch Bulk Upload
            </Box>
            <div
                style={{
                    height: 'calc(100vh - 260px)',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                }}
                className="card-panal"
            >
                <div style={{ margin: '10px' }}>
                    <Grid container item display="flex" flexDirection="row" spacing={4} justifyContent="start" alignSelf="center">
                        {/* <Grid item xs={6} md={3}>
              <Autocomplete
                disablePortal
                sx={{
                  backgroundColor: "#f3f3f3",
                  borderRadius: "6px",
                }}
                id="combo-box-demo"
                getOptionLabel={(option) =>
                  option?.documentName?.toString() || ""
                }
                disableClearable={true}
                disabled={true}
                options={[]}
                onChange={(e, value) => {
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

            <Grid item xs={7} md={5} sx={{ position: "relative" }}>
              <div>
                <TextField
                  name="remarks"
                  id="remarks"
                  variant="outlined"
                  size="small"
                  className="w-85"
                  type="text"
                  placeholder="Remarks"
                  onChange={(e: any) => setRemarks(e.target.value)}
                  value={remarks}                  
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                  onKeyDown={(e: any) => {
                    if (e.target.selectionStart === 0 && e.code === "Space") {
                      e.preventDefault();
                    }
                    regExpressionRemark(e);
                  }}
                />
              </div>
            </Grid> */}

                        <Grid item xs={6} md={4}>
                            <div style={{ display: 'flex' }}>
                                {docType?.templatePath && (
                                    <Tooltip title="Download Template">
                                        <Button
                                            onClick={() => downloadTemplate(docType)}
                                            variant="outlined"
                                            size="medium"
                                            type="button"
                                            style={secondaryButton}
                                            sx={
                                                (action === 'Approve' || action === 'Approve or Reject' || defineStatusOfUploadByUser(user)) && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '6px',
                                                }
                                            }
                                            disabled={action === 'Approve' || action === 'Approve or Reject' || defineStatusOfUploadByUser(user)}
                                        >
                                            Download Template
                                        </Button>
                                    </Tooltip>
                                )}
                                <div style={{ marginLeft: '7px' }}>
                                    <Tooltip title="Upload">
                                        <Button
                                            onClick={() => {
                                                fileInput.current.click();
                                            }}
                                            sx={
                                                (action === 'Approve' || action === 'Approve or Reject' || defineStatusOfUploadByUser(user)) && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '6px',
                                                }
                                            }
                                            disabled={action === 'Approve' || action === 'Approve or Reject' || defineStatusOfUploadByUser(user)}
                                            variant="outlined"
                                            size="medium"
                                            style={secondaryButton}
                                        >
                                            Upload
                                        </Button>
                                    </Tooltip>
                                    <input ref={fileInput} multiple onChange={handleFileEvent} disabled={fileLimit} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" type="file" style={{ display: 'none' }} />
                                </div>
                            </div>
                        </Grid>
                    </Grid>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }} style={{ marginTop: '0px' }}>
                        <Tabs value={value} onChange={handleTab} aria-label="lab API tabs example">
                            <Tab value={0} label="In Progress" />
                            <Tab value={1} label="Completed " />
                            <Tab value={2} label="Errors " />
                        </Tabs>
                    </Box>
                    <TabPanel value={value} index={0} key="0"></TabPanel>
                    <TabPanel value={value} index={1} key="1"></TabPanel>
                    <TabPanel value={value} index={2} key="2"></TabPanel>
                    <>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography className="section-headingTop">Version History</Typography>
                        </div>

                        <div style={{ height: 'calc(100vh - 401px)', marginTop: '10px' }}>
                            <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs2} rowData={filteredDocUploadHistory || []} onGridReady={null} gridRef={null} pagination={false} paginationPageSize={null} />
                        </div>
                    </>
                </div>{' '}
            </div>
        </>
    );
};

export default BranchBulkUpload;