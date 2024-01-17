import { Box, Button, TextField } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import MandateInfo from 'pages/common-components/MandateInformation';
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useUrlSearchParams } from 'use-url-search-params';
import remarkEditor from './Editor/remarkEditor';
import { Dayjs } from 'dayjs';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import { fetchError, showMessage } from 'redux/actions';
import { AppState } from 'redux/store';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import Template from 'pages/common-components/AgGridUtility/ColumnHeaderWithAsterick';

const Possession = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [mandateId, setMandateId] = React.useState(null);
    const [mandateInfo, setMandateData] = React.useState(null);
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [params] = useUrlSearchParams({}, {});
    const [remarks, setRemarks] = React.useState('');
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState(null);
    let { id } = useParams();
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [mileStoneData, setMileStoneData] = React.useState([]);
    const [possessionDataUpdated, setPossessionDataUpdated] = React.useState(true);
    const [value, setValue] = React.useState(null);
    const location = useLocation();
    const apiType = location?.state?.apiType || '';
    const [selectedMandate, setSelectedMandate] = useState(null);
    const [userAction, setUserAction] = React.useState(null);
    const action = userAction?.action || '';
    const runtimeId = userAction?.runtimeId || 0;
    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const [docUploadHistory, setDocUploadHistory] = useState([]);
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const [keyPossessionDate, setKeyPossessionDate] = React.useState<Dayjs | null>();
    const [seq, setSeq] = React.useState();
    const { user } = useAuthUser();
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

    const _getRuntimeId = (id) => {
        const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(id) && item?.module === module);
        return userAction?.runtimeId || 0;
    };

    const workFlowMandate = () => {
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: _getRuntimeId(mandateId.id) || 0,
            mandateId: mandateId?.id || 0,
            tableId: mandateId?.id || 0,
            remark: 'Created',
            createdBy: user?.UserName,
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: 'Created',
        };

        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ''}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occured !!'));
                    return;
                }
                if (response?.data === true) {
                    dispatch(showMessage('Submitted Successfully!'));
                    if (params?.source === 'list') {
                        navigate('/list/task');
                    } else {
                        navigate('/mandate');
                    }
                } else {
                    dispatch(fetchError('Error Occured !!'));
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const components = {
        RemarksEditorCmp: remarkEditor,
    };

    let columnDefs = [
        {
            field: 'listName',
            headerName: 'Name',
            headerTooltip: 'Name',
            maxWidth: 300,

            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'date',
            headerName: 'Date',
            headerTooltip: 'Date',
            sortable: true,
            resizable: true,
            width: 140,
            minWidth: 140,
            headerComponentParams: { template: Template },
            cellClass: 'cell-padding',
            cellStyle: { fontSize: '12px' },
            cellRenderer: (params: any) => (
                <>
                    <div style={{ marginTop: 2 }} className="padd-right">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DesktopDatePicker
                                inputFormat="DD/MM/YYYY"
                                value={mileStoneData?.[params?.rowIndex]?.date || null}
                                onChange={(value: Dayjs | null) => {
                                    var currentIndex = params?.rowIndex;
                                    var data = [...params?.mileStoneData];
                                    if (value !== null) data[currentIndex].date = value?.toDate();
                                    params?.setMileStoneData(data);
                                }}
                                disabled={mileStoneData[params?.rowIndex]?.listName === 'Actual Key Received Date' && mileStoneData?.[0]?.date === undefined ? true : false}
                                renderInput={(paramsText) => (
                                    <TextField
                                        sx={{
                                            '.MuiInputBase-input': {
                                                height: '12px !important',
                                                fontSize: '12px',
                                                paddingLeft: '8px',
                                            },
                                        }}
                                        {...paramsText}
                                        size="small"
                                        name="date"
                                        onKeyDown={(e) => {
                                            e.preventDefault();
                                        }}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </div>
                </>
            ),

            cellRendererParams: {
                mileStoneData: mileStoneData,
                setMileStoneData: setMileStoneData,
                keyPossessionDate: keyPossessionDate,
            },
        },
        {
            field: 'remark',
            headerName: 'Remarks',
            headerTooltip: 'Remarks',
            sortable: true,
            minWidth: 780,
            cellStyle: {
                cursor: 'pointer',
                border: 'solid 1px #D3D3D3',
                borderRadius: '8px',
            },
            cellEditor: 'RemarksEditorCmp',
            editable: true,
            cellEditorParams: {
                mileStoneData: mileStoneData,
                setMileStoneData: setMileStoneData,
                keyPossessionDate: keyPossessionDate,
            },
        },
    ];

    const getPossessionDetails = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Possession/GetPossessionDetails?mandateId=${mandateId?.id}`)
            .then((res) => {
                if (!res) {
                    return;
                }
                if (res && res?.data && res?.data?.length > 0) {
                    var _resData = (res && res?.data) || [];
                    let data =
                        _resData &&
                        _resData.map((item, key) => {
                            if (item?.name === 'Key Possession Date') {
                                setKeyPossessionDate(item?.date);
                            }
                            return {
                                custom_id: key + 1,
                                mandateId: 0,
                                planId: 0,
                                sequence: key + 1,
                                section: item?.name || '',
                                listName: item?.name || '',
                                vendorType: '',
                                date: item?.date || '',
                                process_Owner: '',
                                proposed_Start_Date: null,
                                proposed_End_Date: null,
                                actual_Start_Date: null,
                                actual_End_Date: null,
                                status_percentage: 0,
                                pM_remarks: item?.remarks,
                                remark: item?.remark,
                                vendor_remarks: '',
                                status: item?.task_Status,
                                createdBy: '',
                                createdDate: '',
                                modifiedBy: '',
                                modifiedDate: '',
                                id: item?.id,
                                uid: '',
                            };
                        });
                    setPossessionDataUpdated(true);
                    if (data?.length > 0) setMileStoneData(data);
                } else {
                    getMileStone();
                }
            })
            .catch((err) => {});
    };

    React.useEffect(() => {
        if (mandateId !== null && mandateId?.id !== undefined) getPossessionDetails();
    }, [mandateId]);

    const handleSubmit = () => {
        if (possessionDataUpdated === false) {
            const data = mileStoneData.map((item) => ({
                uid: 'uid',
                id: 0,
                mandateId: mandateId?.id || 0,
                name: item?.listName || '',
                remark: item?.remark || '',
                date: item?.date || '',
                status: item?.status || '',
                createdBy: user?.UserName || '',
                createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                modifiedBy: user?.UserName || '',
                modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            }));

            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/Possession/CreatePossessionDetails`, data, {
                    responseType: 'arraybuffer',
                })
                .then((res) => {
                    if (res) {
                        workFlowMandate();
                    } else {
                        dispatch(fetchError('Please fill all mandatory fields'));
                        return;
                    }
                })
                .catch((err) => {
                    dispatch(fetchError('Error Ocurred !!!'));
                });
        } else {
            const data = mileStoneData.map((item) => ({
                uid: 'uid',
                id: item?.id || 0,
                mandateId: mandateId?.id,
                name: item?.listName,
                remark: item?.remark,
                date: item?.date,
                status: item?.status,
                createdBy: user?.UserName || '',
                createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                modifiedBy: user?.UserName || '',
                modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            }));

            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/Possession/UpdatePossessionDetails`, data, {
                    responseType: 'arraybuffer',
                })
                .then((res) => {
                    if (res) {
                        workFlowMandate();
                    } else {
                        dispatch(fetchError('Record is not updated!'));
                        return;
                    }
                })
                .catch((err) => {
                    dispatch(fetchError('Error Ocurred !!!'));
                });
        }
    };

    const getMileStone = () => {
        setPossessionDataUpdated(false);
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ITAsset/GetITAssets?Type=Possession&partnerCategory=All`)
            .then((res) => {
                if (!res) return;
                if (res && res?.data && res?.data?.length > 0) {
                    var _resData = (res && res?.data) || [];
                    let data =
                        _resData &&
                        _resData.map((item, key) => {
                            return {
                                custom_id: key + 1,
                                mandateId: 0,
                                planId: 0,
                                sequence: key + 1,
                                section: item?.listName || '',
                                listName: item?.listName || '',
                                vendorType: item?.partnerCategory || '',
                                process_Owner: '',
                                proposed_Start_Date: null,
                                proposed_End_Date: null,
                                actual_Start_Date: null,
                                actual_End_Date: null,
                                status_percentage: 0,
                                pM_remarks: '',
                                vendor_remarks: '',
                                status: item?.status,
                                createdBy: '',
                                createdDate: '',
                                modifiedBy: '',
                                modifiedDate: '',
                                id: 0,
                                uid: '',
                            };
                        });
                    setMileStoneData(data || []);
                } else {
                    setMileStoneData([]);
                }
            })
            .catch((err) => {});
    };

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }

    React.useEffect(() => {
        if (id !== 'noid' && id) {
            setMandateId(id);
        }
    }, []);
    return (
        <>
            <div>
                <Box component="h2" className="page-title-heading my-6">
                    Possession
                </Box>
            </div>

            <div
                className="inside-scroll-168-pos"
                style={{
                    backgroundColor: '#fff',
                    padding: '10px',
                    border: '1px solid #0000001f',
                    borderRadius: '5px',
                }}
            >
                <>
                    <MandateInfo mandateCode={mandateId} source="" pageType="" setMandateData={setMandateData} redirectSource={`${params?.source}`} setMandateCode={setMandateId} setpincode={() => {}} setCurrentStatus={setCurrentStatus} setCurrentRemark={setCurrentRemark} />

                    <div className="it-asset-table" style={{ height: 'calc(100vh - 434px)', marginTop: '10px' }}>
                        <CommonGrid
                            defaultColDef={{ singleClickEdit: true, flex: 1 }}
                            getRowId={(data) => {
                                return data && data?.data?.custom_id;
                            }}
                            getRowStyle={() => {
                                return { background: 'white' };
                            }}
                            components={components}
                            rowHeight={36}
                            columnDefs={columnDefs}
                            onCellValueChanged={function (params) {
                                params.api.redrawRows();
                            }}
                            rowData={mileStoneData || []}
                            onGridReady={onGridReady}
                            gridRef={gridRef}
                            pagination={false}
                            paginationPageSize={null}
                        />
                    </div>
                    <div className="bottom-fix-history">{id && id !== undefined && id !== 'noid' && <MandateStatusHistory mandateCode={id} accept_Reject_Status={currentStatus} accept_Reject_Remark={currentRemark} />}</div>
                    <div className="bottom-fix-btn">
                        <Button
                            variant="outlined"
                            size="medium"
                            onClick={handleSubmit}
                            style={{
                                marginLeft: 10,
                                padding: '2px 20px',
                                borderRadius: 6,
                                color: '#fff',
                                borderColor: '#00316a',
                                backgroundColor: '#00316a',
                            }}
                        >
                            Submit
                        </Button>
                    </div>
                </>
            </div>
        </>
    );
};

export default Possession;
