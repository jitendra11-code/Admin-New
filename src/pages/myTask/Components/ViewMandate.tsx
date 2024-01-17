import { Box, Stack, TextField, Grid, InputAdornment, IconButton } from '@mui/material';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';
import { useUrlSearchParams } from 'use-url-search-params';
import SearchIcon from '@mui/icons-material/Search';
import { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import AppTooltip from '@uikit/core/AppTooltip';
import { AiFillFileExcel } from 'react-icons/ai';

const ViewMandate = () => {
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const [mandateDataList, setMandateDataList] = React.useState<any>([]);
    const [tableData, setTableData] = React.useState<any>([]);
    const dispatch = useDispatch();
    const [branchType, setBranchType] = React.useState([]);
    const location = useLocation();
    const [phaseId, setPhaseId] = useState(null);
    const [params] = useUrlSearchParams({}, {});
    const [mandateCode, setMandateCode] = useState(null);
    const [mandateData, setMandateData] = React.useState(null);
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [phaseApprovalNoteId, setPhaseApprovalNoteId] = React.useState(null);
    const [phaseApprovalNoteScopeData, setPhaseApprovalNoteScopeData] = React.useState([]);
    const [value, setValue] = React.useState<number>(0);
    let { id } = useParams();
    const [branchAdminList, setBranchAdminList] = React.useState([]);
    const [glCategories, setGlCategories] = React.useState([]);
    const [projectManager, setProjectManager] = React.useState([]);
    const [mandateInfo, setMandateInfo] = React.useState([]);
    const [mandateList, setMandateList] = React.useState([]);
    const [phaseList, setPhaseList] = React.useState([]);
    const [sourcingAssociate, setSourcingAssociate] = React.useState([]);
    const [values, setValues] = React.useState(null);
    const [columnDefs, setColumnDefs] = useState<any[]>([]);
    const navigate = useNavigate();
    const rowData = [
        { id: 1, fullName: 'Noor Khan', age: 25, city: 'Patna' },
        { id: 2, fullName: 'Rapsan Jani', age: 26, city: 'Noida' },
        { id: 3, fullName: 'Monika Singh', age: 18, city: 'New Delhi' },
        { id: 4, fullName: 'Sunil Kumar', age: 22, city: 'Jaipur' },
        { id: 5, fullName: 'Kajol Kumari', age: 21, city: 'Chennai' },
    ];
    const handleChange = (event) => {
        const { name, value } = event;
        setValues({ ...values, [name]: value });
    };
    const { phaseid, mandateId } = useParams();
    const setGlCategorId = (id) => {
        var obj = glCategories && glCategories?.length > 0 && glCategories?.find((item) => item?.id === id);
        return obj || null;
    };
    const setBranchTypeName = (id) => {
        var obj = branchType && branchType?.length > 0 && branchType?.find((item) => item?.id === id);
        return obj || null;
    };
    const setProjectManagerName = (id) => {
        var obj = projectManager && projectManager?.length > 0 && projectManager?.find((item) => item?.id === id);
        return obj || null;
    };

    const setSourcingAssociateName = (id) => {
        var obj = sourcingAssociate && sourcingAssociate?.length > 0 && sourcingAssociate?.find((item) => item?.id === id);
        return obj || null;
    };
    const setBranchAdminName = (userId) => {
        var obj = branchAdminList && branchAdminList?.length > 0 && branchAdminList?.find((item) => item?.id === userId);
        return obj || null;
    };
    const getBranchAdminRole = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/User/GetAllWithConditions?Designation=Branch Admin`)
            .then((response: any) => {
                setBranchAdminList(response?.data || []);
            })
            .catch((e: any) => {});
    };

    const getById = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/mandatesById?id=${id}`)
            .then((response: any) => {
                if (response && response?.data) {
                    var obj = response?.data;
                    setMandateInfo(response?.data);
                    setValues({
                        ...values,
                        ['glCategory']: obj?.glCategoryId && setGlCategorId(obj?.glCategoryId),
                        ['branchType']: obj?.branchId && setBranchTypeName(obj?.branchId),
                        ['pinCode']: obj?.pincode,
                        ['state']: obj?.state,
                        ['region']: obj?.region,
                        ['district']: obj?.district,
                        ['city']: obj?.district,
                        ['location']: obj?.district,
                        ['tierName']: obj?.tierName,
                        ['remark']: obj?.remark,
                        ['projectManagerId']: obj?.projectManagerId && setProjectManagerName(obj?.projectManagerId),
                        ['sourcingAssociate']: obj?.sourcingAssociate && setSourcingAssociateName(obj?.sourcingAssociate),
                        ['branchAdmin']: obj?.branchAdminId && setBranchAdminName(obj?.branchAdminId),
                        ['projectManagerRemarks']: obj?.pM_Remarks,
                        ['branchCode']: obj?.branchCode,
                    });
                }
            })
            .catch((e: any) => {});
    };

    const handleExportData = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/GetExcelForMandateView`)
            .then((response) => {
                if (!response) {
                    dispatch(fetchError('Error occurred in Export !!!'));
                    return;
                }
                if (response?.data&&!response?.data?.length) {
                    dispatch(fetchError('No Data Found !'));
                    return;
                }
                if (response?.data) {
                    var filename = 'ViewMandate.xlsx';
                    if (filename && filename === '') {
                        dispatch(fetchError('No Data Found !'));
                        return;
                    }
                    const binaryStr = atob(response?.data);
                    const byteArray = new Uint8Array(binaryStr.length);
                    for (let i = 0; i < binaryStr.length; i++) {
                        byteArray[i] = binaryStr.charCodeAt(i);
                    }

                    var blob = new Blob([byteArray], {
                        type: 'application/octet-stream',
                    });
                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        window.navigator.msSaveBlob(blob, filename);
                    } else {
                        var blobURL = window.URL && window.URL.createObjectURL ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
                        var tempLink = document.createElement('a');
                        tempLink.style.display = 'none';
                        tempLink.href = blobURL;
                        tempLink.setAttribute('download', filename);
                        if (typeof tempLink.download === 'undefined') {
                            tempLink.setAttribute('target', '_blank');
                        }

                        document.body.appendChild(tempLink);
                        tempLink.click();

                        setTimeout(function () {
                            document.body.removeChild(tempLink);
                            window.URL.revokeObjectURL(blobURL);
                        }, 200);

                        dispatch(showMessage('View Mandate Excel downloaded successfully!'));
                    }
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    useEffect(() => {
        if (mandateId && typeof mandateId !== 'string') {
            const mandateId = mandateList && mandateList?.length > 0 && mandateList?.find((item) => item?.mandetId === mandateId);
            setValues({ ...values, ['mandateId']: mandateId || null });
            getById(parseInt(mandateId));
            getBranchAdminRole();
        }
    }, []);

    useEffect(() => {
        if (values?.mandateId?.mandetId !== undefined) {
            getById(parseInt(mandateId));
        }
    }, [values?.mandateId?.mandetId]);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=BranchType`)
            .then((response: any) => {
                setBranchType(response?.data?.data);
            })
            .catch((e: any) => {});
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=GLCategory`)
            .then((response: any) => {
                setGlCategories(response?.data?.data);
            })
            .catch((e: any) => {});
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=UserMaster`)
            .then((response: any) => {
                setProjectManager(response?.data?.data);
            })
            .catch((e: any) => {});
    }, []);

    const _getMandateList = (phaseId = 0, selectedPhase = null) => {
        axios({
            method: 'get',
            url: `${process.env.REACT_APP_BASEURL}/api/Mandates/DropDownMandet?PhaseID=${phaseId || 0}`,
        }).then((res) => {
            if (res && res.data && res.data.length > 0) {
                setMandateList(res?.data);
                setValues({
                    ...values,
                    ['phaseId']: selectedPhase || null,
                    ['glCategory']: null,
                    ['branchType']: null,
                    ['pinCode']: '',
                    ['city']: '',
                    ['state']: '',
                    ['location']: '',
                    ['district']: '',
                    ['tierName']: '',
                    ['region']: '',
                    ['projectManagerRemarks']: '',
                    ['remarks']: '',
                    ['projectManagerId']: null,
                    ['branchCode']: '',
                    ['sourcingAssociate']: null,

                    ['mandateId']: null,
                });
            }
        });
    };
    const _getPhaseCodeList = () => {
        axios({
            method: 'get',
            url: `${process.env.REACT_APP_BASEURL}/api/Mandates/DropDownPhase`,
        }).then((res) => {
            if (res && res.data && res.data.length > 0) {
                setPhaseList(res?.data);
            }
        });
    };
    useEffect(() => {
        _getMandateList();
        _getPhaseCodeList();
    }, []);
    useEffect(() => {
        if (values?.mandateId?.mandetId !== undefined) {
            setMandateCode(values?.mandateId?.mandetId);
        }
    }, [values?.mandateId]);
    useEffect(() => {
        if (values?.phaseId?.phaseId) {
            setPhaseId(values?.phaseId?.phaseId);
        }
    }, [values?.phaseId]);

    const getMandateView = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/GetMandateView`)
            .then((response: any) => {
                if (response && response?.data && response?.data?.length > 0) {
                    setMandateDataList(response?.data);
                    console.log('RRR', response?.data[0]['Mandate Code']);
                    const filteredData = response?.data?.filter((item, ind) => item['Mandate Code'] !== '');
                    setTableData(filteredData);
                } else {
                    setTableData([]);
                    setMandateDataList([]);
                }
            })
            .catch((e: any) => {});
    };
    React.useEffect(() => {
        getMandateView();
    }, []);

    const onFilterTextChange = (e) => {
        gridApi?.setQuickFilter(e?.target?.value);
        if (gridApi.getDisplayedRowCount() == 0) {
            dispatch(fetchError('Data not found!'));
        }
    };

    const getDynamicColumn = (obj) => {
        if (obj != null) return Object.keys(obj).map((key) => ({ field: key }));
    };

    function onGridReady(params) {
        setGridApi(params.api);
        params.api.sizeColumnsToFit();
        params.api.setColumnDefs(getDynamicColumn(mandateDataList?.[0]));
    }

    return (
        <>
            <Grid
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '15px',
                }}
            >
                <Box component="h2" className="page-title-heading my-6">
                    View Mandate
                </Box>

                <div className="phase-grid">
                    <Stack display="flex" alignItems="flex-end" justifyContent="space-between" flexDirection="row" sx={{ mb: -2 }}>
                        <TextField
                            size="small"
                            variant="outlined"
                            name="search"
                            onChange={(e) => onFilterTextChange(e)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <AppTooltip title="Export Excel">
                            <IconButton
                                className="icon-btn"
                                sx={{
                                    // borderRadius: "50%",
                                    // borderTopColor:"green",
                                    width: 35,
                                    height: 35,
                                    // color: (theme) => theme.palette.text.secondary,
                                    color: 'white',
                                    backgroundColor: 'green',
                                    '&:hover, &:focus': {
                                        backgroundColor: 'green', // Keep the color green on hover
                                    },
                                }}
                                onClick={() => {
                                    handleExportData();
                                }}
                                size="large"
                            >
                                <AiFillFileExcel />
                            </IconButton>
                        </AppTooltip>
                    </Stack>
                </div>
            </Grid>
            {mandateDataList && mandateDataList?.length > 0 && (
                <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                    <AgGridReact defaultColDef={{ flex: 1, resizable: true, width: 150, minWidth: 150, sortable: true }} rowData={tableData || []} onGridReady={onGridReady} pagination={true} paginationPageSize={10} />
                </div>
            )}
        </>
    );
};

export default ViewMandate;
