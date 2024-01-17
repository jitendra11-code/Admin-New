import React, { useState, useEffect } from 'react';
import { Button, Box, TextField, Grid } from '@mui/material';
import MandateInfo from 'pages/common-components/MandateInformation';
import { useNavigate, useParams } from 'react-router-dom';
import { useUrlSearchParams } from 'use-url-search-params';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { fetchError, showMessage } from 'redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { AppState } from 'redux/store';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import groupByDocumentData from 'pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData';
import { AgGridReact } from 'ag-grid-react';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { downloadFile } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import FileNameDiaglogList from 'pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox';
import { Tooltip } from '@mui/material';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';
import { useFormik } from 'formik';
import { activatedVendorInitialValues, updatePhaseApprovalNoteSchema } from '@uikit/schemas';

const ActivateVendor = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    let { id } = useParams();
    const gridRef = React.useRef<AgGridReact>(null);
    const [docUploadHistory, setDocUploadHistory] = useState([]);
    const [mandateId, setMandateId] = useState(null);
    const [mandateInfo, setMandateData] = React.useState(null);
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [userAction, setUserAction] = React.useState(null);
    const action = userAction?.action || '';
    const runtimeId = userAction?.runtimeId || 0;
    const location = useLocation();
    const apiType = location?.state?.apiType || '';
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const { user } = useAuthUser();
    const [remarks, setRemarks] = React.useState(null);
    const [remarksId, setRemarksId] = React.useState(null);
    const [dateError, setDateError] = useState<any>('');
    const [value1, setValue1] = useState<any>({});
    const [deliveryData, setDeliveryData] = useState<any>({});
    const [phaseApprovalNoteData, setPhaseApprovalNoteData] = React.useState<any>([]);

    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const [params] = useUrlSearchParams({}, {});
    React.useEffect(() => {
        if (id !== 'noid' && id) {
            setMandateId(id);
        }
    }, []);
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
            headerName: 'Report Type',
            headerTooltip: 'Report Type',
            sortable: true,
            resizable: true,
            width: 400,
            minWidth: 150,
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
            width: 400,
            minWidth: 150,
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
            field: 'Download',
            headerName: 'Download',
            headerTooltip: 'Download',
            resizable: true,
            width: 110,
            minWidth: 90,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <Tooltip title="Download" className="actionsIcons">
                            <DownloadIcon style={{ fontSize: '15px' }} onClick={() => downloadFile(obj?.data, mandateId, dispatch)} className="actionsIcons" />
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
            minWidth: 90,
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

    const getVersionHistoryData = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId?.id}&documentType=Lease Deed Sign Copy`)
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

    const getRemarkByMandateId = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/VendorAllocation/GetVendorStatusById?mandateid=${id}`)
            .then((response: any) => {
                const val = response?.data?.remarks;
                if (!response) return;
                if (response && response?.data !== undefined) {
                    setRemarks(response?.data?.remarks);
                    setRemarksId(response?.data?.id);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error occurred !'));
            });
    };

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }
    const { values, handleBlur, handleChange, setFieldValue, handleSubmit, setFieldError, errors, touched, resetForm } = useFormik({
        initialValues: activatedVendorInitialValues,
        validateOnChange: true,
        validateOnBlur: false,
        onSubmit: (values, action) => {
            if (dateError) {
                dispatch(fetchError(dateError));
            } else if (docUploadHistory?.length == 0) {
                dispatch(fetchError('Please Upload Documents'));
            } else {
                const body = {
                    id: remarksId || 0,
                    fk_mandateId: mandateInfo?.id || 0,
                    Uid: '',
                    remarks: remarks || '',
                    current_status: '',
                    current_remarks: '',
                    CreatedOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    CreatedBy: user?.UserName,
                    UpdatedOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                    UpdatedBy: user?.UserName,
                    ModifiedBy: user?.UserName,
                };
                axios
                    .post(`${process.env.REACT_APP_BASEURL}/api/VendorAllocation/InsertUpdateVendorStatus`, body)
                    .then((response: any) => {
                        if (!response) return;

                        if (response?.data?.message == 'Already Exists !') {
                            axios
                                .post(`${process.env.REACT_APP_BASEURL}/api/VendorAllocation/InsertUpdateVendorStatus?id=${mandateId?.id}`, body)
                                .then((response: any) => {
                                    if (!response) return;
                                    workFlow();
                                    resetForm();
                                })
                                .catch((error) => {});
                        } else {
                            workFlow();
                        }
                    })
                    .catch((error) => {});
            }
        },
    });
    useEffect(() => {
        if (mandateId?.id !== undefined) {
            getRemarkByMandateId(mandateId?.id);
        }
    }, [mandateId]);

    useEffect(() => {
        if (mandateId?.id !== undefined) {
            getVersionHistoryData();
        }
    }, [mandateId?.id]);

    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined) {
            const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(mandateId?.id) && item?.module === module);
            if (apiType === '') {
                setUserAction(userAction);
            } else {
                let action = mandateId;
                setUserAction({ ...action, runtimeId: action.runtime });
            }
            if (params.source === 'list') {
                navigate(`/mandate/${mandateId?.id}/${module}?source=list`, {
                    state: { apiType: apiType },
                });
            } else {
                navigate(`/mandate/${mandateId?.id}/${module}`, {
                    state: { apiType: apiType },
                });
            }
        }
    }, [mandateId, setMandateId]);

    const workFlow = () => {
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: runtimeId || 0,
            mandateId: mandateId?.id || 0,
            tableId: mandateId?.id || 0,
            remark: 'Created',
            createdBy: user?.UserName,
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: 'Create',
        };
        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ''}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) return;
                if (response?.data === true) {
                    dispatch(showMessage('Activate Vendor Successfully!'));
                    navigate('/list/task');
                } else {
                    dispatch(fetchError('Error Occurred !'));
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    console.log('MMM', userAction, module, action);
    return (
        <div>
            <Box component="h2" className="page-title-heading my-6">
                Activate Vendor
            </Box>
            <div
                style={{
                    padding: '10px !important',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                }}
                className="card-panal inside-scroll-226"
            >
                <MandateInfo mandateCode={mandateId} pageType="" source="" redirectSource={`${params?.source}`} setMandateCode={setMandateId} setMandateData={setMandateData} setpincode={() => {}} setCurrentStatus={setCurrentStatus} setCurrentRemark={setCurrentRemark} />
                <div style={{ height: '255px' }}>
                    <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={docUploadHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                </div>

                <form onSubmit={handleSubmit}>
                    <Grid item xs={12} md={12} sx={{ position: 'relative', marginTop: '20px' }}>
                        <textarea
                            style={{ padding: '15px', height: '155px' }}
                            name="remarks"
                            id="remarks"
                            className="w-85"
                            placeholder="Remarks"
                            value={remarks || ''}
                            onChange={(e: any) => {
                                const inputWords = e.target.value.trim().split(' ');
                                if (inputWords.length > 1000) {
                                    e.preventDefault();
                                } else {
                                    setRemarks(e.target.value);
                                }
                            }}
                            onPaste={(e: any) => {
                                if (!textFieldValidationOnPaste(e)) {
                                    dispatch(fetchError('You can not paste Spacial characters'));
                                }
                            }}
                            onKeyDown={(e: any) => {
                                regExpressionRemark(e);
                            }}
                        />
                    </Grid>

                    <div className="bottom-fix-history">{id && id !== undefined && id !== 'noid' && <MandateStatusHistory mandateCode={id} accept_Reject_Status={currentStatus} accept_Reject_Remark={currentRemark} />}</div>
                    {userAction?.module === module && (
                        <div className="bottom-fix-btn">
                            {action && action === 'Activate Vendor Code' && (
                                <Button
                                    variant="outlined"
                                    size="medium"
                                    type="submit"
                                    onClick={workFlow}
                                    style={{
                                        marginLeft: 10,
                                        padding: '2px 20px',
                                        borderRadius: 6,
                                        color: '#fff',
                                        borderColor: '#00316a',
                                        backgroundColor: '#00316a',
                                    }}
                                >
                                    Activate Vendor
                                </Button>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ActivateVendor;
