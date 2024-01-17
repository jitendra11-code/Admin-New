import React, { useState, useEffect, useMemo } from 'react';
import { Grid, Button, TextField, Autocomplete, Stack } from '@mui/material';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { _validationMaxFileSizeUpload } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import { AgGridReact } from 'ag-grid-react';
import { AppState } from 'redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { useUrlSearchParams } from 'use-url-search-params';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import moment from 'moment';
import axios from 'axios';
import { fetchError, showMessage } from 'redux/actions';
import FileUploadAction from './Components/Action/FileUploadAction';
import FileDownloadList from './Components/Action/FileDownloadList';
import Template from 'pages/common-components/AgGridUtility/ColumnHeaderWithAsterick';
import { FETCH_ERROR } from 'types/actions/Common.action';

const AvailabilityOptions = [
    {
        key: 'Yes',
        value: 'Available',
    },
    {
        key: 'No',
        value: 'Not Available',
    },
];
const Content = ({ action, documentType, mandateId, setIsMandatoryItemChecked, currentStatus, currentRemark }: any) => {
    const navigate = useNavigate();
    const [actionWF, setActionWF] = useState('');
    const [remark, setRemark] = useState('');
    const [sendBack, setSendBack] = React.useState(false);
    const [rejected, setRejected] = React.useState(false);
    const [approved, setApproved] = React.useState(false);
    const [docData, setdocData] = useState([]);
    const location = useLocation();
    const apiType = location?.state?.apiType || '';
    const [userAction, setUserAction] = React.useState(null);

    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const gridRef = React.useRef<AgGridReact>(null);
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);

    const [tableData, setTableData] = useState([]);
    const [params] = useUrlSearchParams({}, {});
    const [saveFlag, setSaveFlag] = useState(false);
    const { user } = useAuthUser();
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const dispatch = useDispatch();

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
            createdBy: user?.UserName || 'Admin',
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
    const GenrateMemo = (value, category) => {
        var option = null;
        if (category?.hasOwnProperty('key')) {
            option = AvailabilityOptions?.find((item) => item?.key?.toUpperCase() === category?.key?.toUpperCase());
        } else {
            option = AvailabilityOptions?.find((item) => item?.key?.toUpperCase() === value?.toUpperCase());
        }
        return option || null;
    };
    const GenerateCategory = (value, category) => {
        return useMemo(() => GenrateMemo(value, category), [value, category]);
    };

    function compareArrays(array1, array2) {
        if (array1.length === 0) return array2;
        let newData = [];
        const size = Math.max(array1?.length, array2?.length);

        for (let i = 0; i < size; i++) {
            const item1 = array1[i];
            const item2 = array2[i];
            // console.log('CompareArrays', array1, array2);

            if (array1?.find((data) => data?.recordId === item2?.SEQUENCE && item2?.Availability == 'Yes')) {
                newData.push({ ...item2, isDocumentUploaded: true });
            } else {
                newData.push({ ...item2, isDocumentUploaded: false });
            }
        }

        return newData;
    }

    const getDocData = (flag) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId?.id}&documentType=Mandatory Item List and Pictures`)
            .then((response: any) => {
                setdocData(response?.data);
                if (flag == 'initial') {
                    getMandatoryListDataTable(mandateId?.id, response?.data);
                } else {
                    let newData = compareArrays(response?.data, tableData);
                    setTableData(newData);
                }
                if(flag=='save'){
                  setSaveFlag(true);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    useEffect(() => {
        if (mandateId?.id !== undefined) {
            getDocData('initial');
        }
    }, [mandateId]);
    useEffect(() => {
        if (saveFlag) saveData();
    }, [saveFlag]);
    let columnDefs = useMemo(() => {
        return [
            {
                field: 'SEQUENCE',
                headerName: 'Sr. No',
                headerTooltip: 'Serial Number',
                flex: 1,
                maxWidth: 80,
                cellRenderer: (e: any) => {
                    var index = e?.rowIndex;
                    return index + 1;
                },

                sortable: true,
                resizable: true,
                cellStyle: { fontSize: '13px' },
            },
            {
                field: 'Item',
                headerName: 'Item Description',
                headerTooltip: 'Item Description',
                tooltipField: 'Item',
                sortable: true,
                resizable: true,
                minWidth: 300,
                width: 1100,
                maxWidth: 1200,
                cellStyle: { fontSize: '13px' },
            },

            {
                field: 'Availability',
                headerName: 'Availability',
                headerTooltip: 'Availability',
                sortable: true,
                resizable: true,
                width: 130,
                minWidth: 130,
                headerComponentParams: {
                    template: Template,
                },
                cellClass: 'cell-padding-section',
                cellStyle: { fontSize: '12px', cursor: 'pointer' },
                cellRenderer: (params: any) => (
                    <>
                        <div style={{ marginTop: 5 }} className="padd-right">
                            <Autocomplete
                                id="combo-box-demo"
                                getOptionLabel={(option) => option?.value?.toString() || ''}
                                disableClearable={true}
                                disabled={action === 'Approve' || action === 'Approve or Reject'}
                                options={params?.AvailabilityOptions || []}
                                onChange={(e, value: any) => {
                                    var currentIndex = params?.rowIndex;
                                    var data = [...params?.tableData];
                                    data[currentIndex].option_Category = value;
                                    data[currentIndex].Availability = value?.key;
                                    params?.setTableData(data);
                                }}
                                value={(params && params?.tableData[params?.rowIndex]?.Availability && params?.GenerateCategory(params?.tableData[params?.rowIndex]?.Availability, params?.tableData[params?.rowIndex]?.option_Category)) || null}
                                placeholder="Availability"
                                renderInput={(textParams) => (
                                    <TextField
                                        name="availability"
                                        id="availability"
                                        {...textParams}
                                        InputProps={{
                                            ...textParams.InputProps,
                                        }}
                                        error={!params?.tableData[params?.rowIndex]?.Availability}
                                        sx={{
                                            '.MuiInputBase-input': {
                                                height: '12px !important',
                                                fontSize: '12px',
                                                paddingLeft: '8px',
                                            },
                                        }}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            />
                        </div>
                    </>
                ),
                cellRendererParams: {
                    AvailabilityOptions: AvailabilityOptions,
                    tableData: tableData,
                    setTableData: setTableData,
                    GenerateCategory: GenerateCategory,
                },
            },
            {
                field: '',
                headerName: 'Actions',
                headerTooltip: 'Actions',
                sortable: false,
                resizable: true,
                width: 100,
                minWidth: 100,
                maxWidth: 100,
                cellStyle: { fontSize: '12px' },
                cellRendererParams: {
                    mandate: mandateId,
                    fileInput: null,
                },
                cellRenderer: (params: any) => (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginRight: '10px',
                            }}
                            className="actions"
                        >
                            <FileUploadAction params={params} getDocData={getDocData} />
                            <FileDownloadList props={params} mandate={{ id: mandateId?.id }} />
                        </div>
                    </>
                ),
            },
        ];
    }, [tableData]);

    const saveData = () => {
        setSaveFlag(false);
        var _data = [...tableData];
        let isAvailable = _data?.filter((v) => v?.Availability == 'Yes');
        let isDocUpload = _data?.filter((v) => v?.isDocumentUploaded == true);
        // console.log('RRR', isAvailable, isDocUpload, _data, tableData);
        if (isAvailable?.length === isDocUpload?.length) {
            _data =
                _data &&
                _data?.map((item) => {
                    return {
                        id: item?.Id,
                        uid: '',
                        mandateId: mandateId?.id || 0,
                        sequence: item?.SEQUENCE || 0,
                        item: item?.Item || '',
                        availability: item?.Availability || '',
                        remarks: '',
                    };
                });

            var _validationError = _data && _data?.filter((item) => item?.id !== undefined && item?.availability === '');
            // console.log('_validationError', _validationError);
            if (_validationError && _validationError?.length > 0) {
                dispatch(fetchError('Please fill all mandatory fields !!!'));
                return;
            }
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/KeyHandoverDetails/CreateUpdateMandatoryItemList`, _data)
                .then((response: any) => {
                    if (!response) {
                        dispatch(fetchError('Error Occurred !'));
                        return;
                    }
                    if (response?.status === 200) {
                        setIsMandatoryItemChecked(true);
                        getMandatoryListDataTable(mandateId?.id, docData);
                        dispatch(showMessage('Record saved successfully!'));
                        return;
                    } else {
                        dispatch(fetchError('Records are not failed !!!'));
                        return;
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                });
        } else {
            dispatch(fetchError('please upload documents of selected available availability'));
            return;
        }
    };

    const getMandatoryListDataTable = (id, documentData) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/KeyHandoverDetails/GetHandoverMandatoryList?mandateid=${id}&Type=Mandatory Item List`)
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data?.length > 0) {
                    var _response = response?.data;

                    _response =
                        _response &&
                        _response.map((item) => {
                            return {
                                ...item,
                                Availability: typeof item?.Availability === 'object' ? '' : item?.Availability,
                                Id: typeof item?.Id === 'object' ? 0 : item?.Id,
                                remarks: typeof item?.remarks === 'object' ? '' : item?.remarks,
                            };
                        });
                    var records = _response?.filter((item) => item?.Id !== 0);
                    if (records?.length > 0) {
                        setIsMandatoryItemChecked(true);
                    }
                    let newData = compareArrays(documentData, _response);
                    setTableData(newData);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }

    return (
        <>
            <div className="card-panel" style={{ padding: '5px' }}>
                <div style={{ margin: '10px' }}>
                    <Grid container item display="flex" flexDirection="row" spacing={4} justifyContent="start" alignSelf="center">
                        <Grid item xs={12} md={12} lg={12} sx={{ position: 'relative' }}>
                            <div style={{ height: '327px' }}>
                                <CommonGrid
                                    getRowStyle={() => {
                                        return { background: 'white' };
                                    }}
                                    defaultColDef={{
                                        singleClickEdit: true,
                                        flex: 1,
                                    }}
                                    columnDefs={columnDefs}
                                    rowData={tableData?.filter((v) => v?.Item) || []}
                                    onGridReady={onGridReady}
                                    gridRef={gridRef}
                                    pagination={false}
                                    paginationPageSize={null}
                                />
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    marginBottom: 10,
                                    marginTop: 10,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                }}
                            >
                                <Stack display="flex" flexDirection="row" justifyContent="space-between" alignItems={'center'} alignContent="center">
                                    {(action === '' || action == 'Create') && (
                                        <Button
                                            variant="outlined"
                                            size="medium"
                                            name="submit"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (mandateId?.id === undefined) {
                                                    dispatch(fetchError('Please select Mandate !!!'));
                                                    return;
                                                }
                                                getDocData('save');
                                                
                                                // saveData();
                                            }}
                                            style={{
                                                marginLeft: 10,

                                                padding: '2px 20px',
                                                borderRadius: 6,
                                                color: '#fff',
                                                borderColor: '#00316a',
                                                backgroundColor: '#00316a',
                                            }}
                                        >
                                            Save Data
                                        </Button>
                                    )}
                                </Stack>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </>
    );
};
export default Content;
