import React, { useEffect, useMemo, useState } from 'react';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { Stack, Grid, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, TextField, Autocomplete, Select, MenuItem, InputAdornment, IconButton } from '@mui/material';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import { AgGridReact } from 'ag-grid-react';
import { GridApi } from 'ag-grid-community';
import axios from 'axios';
import { fetchError, showMessage } from 'redux/actions';
import { useDispatch } from 'react-redux';
import AppTooltip from '@uikit/core/AppTooltip';
import { AiFillFileExcel } from 'react-icons/ai';
import MatricsCard from './MatricsCard/MatricsCard';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ToggleSwitch from '@uikit/common/ToggleSwitch';
import moment from 'moment';
import { format } from 'date-fns';

function CardsMasterTest() {
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const [RightMasterData, setRightMasterData] = useState([]);
    const dispatch = useDispatch();
    const [propertyDraftList, setPropertyDraftList] = useState<any>([]);
    const [userGridList, setUserGridList] = useState<any>([]);
    const [cardData, setCardData] = useState([]);
    const [totalTAT, setTotalTAT] = React.useState(true);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    // const initToday = moment(new Date()).format('YYYY-MM-DD');
    const [fromDateError, setFromDateError] = useState('');
    const [toDateError, setToDateError] = useState('');

    const handleDateChange = (newValue) => {
        setFromDate(moment(newValue).format('YYYY-MM-DD'));
    };
    const showRightData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASEURL}/api/User/GetLoginAndPageVisitDetails`);
            console.log('API response data:', response.data);

            if (response.data[1] && response.data[1] && response.data[1].length > 0) {
                setPropertyDraftList(response.data[1]);
            } else {
                setPropertyDraftList([]);
            }

            if (response.data[2] && response.data[2] && response.data[2].length > 0) {
                setUserGridList(response.data[2]);
            } else {
                setUserGridList([]);
            }

            const apiData = response.data[0][0];
            const rightGrid = response.data[1];
            const bottomGrid = response.data[2];
            // console.log("apiData", apiData);
            // console.log("rightGrid", rightGrid);
            // console.log("bottomGrid", bottomGrid);
            const mtdLogins = response.data[0][0].MTD_Logins;
            // console.log("MTD_Logins:", mtdLogins);
            const YTDPageLogins = apiData.YTD_Logins;
            // console.log("YTDPageLogins", YTDPageLogins);
            const YTDPageViews = apiData.YTD_PageViews;
            const todaysLoginCount = apiData.Todays_Login;
            const todaysPageViews = apiData.Todays_PageViews;
            const mtdLoginCount = apiData.MTD_Logins;
            const mdtPageViews = apiData.MTD_PageViews;

            setCardData((prevState) => {
                return [
                    {
                        itm: {
                            iconname: 'MdLogin',
                            type: 'No of Logins',
                            number: `${YTDPageLogins}`,
                            txt: 'YTD',
                        },
                        metricsdata: {
                            // link: "/sample-link1",
                            background: 'black',
                        },
                    },
                    {
                        itm: {
                            iconname: 'MdLogin',
                            type: 'No of Logins',
                            number: `${mtdLoginCount}`,
                            txt: 'Current Month',
                        },
                        metricsdata: {
                            // link: "/sample-link2",
                            background: 'blue',
                        },
                    },
                    {
                        itm: {
                            iconname: 'MdLogin',
                            type: 'No of Logins',
                            number: `${todaysLoginCount}`,
                            txt: 'Todays',
                        },
                        metricsdata: {
                            // link: "/sample-link2",
                            background: 'green',
                        },
                    },
                    {
                        itm: {
                            iconname: 'MdPerson',
                            type: 'No of Pages viewed/person',
                            number: `${YTDPageViews}`,
                            txt: 'YDT',
                        },
                        metricsdata: {
                            // link: "/sample-link2",
                            background: 'black',
                        },
                    },
                    {
                        itm: {
                            iconname: 'MdPerson',
                            type: 'No of Pages viewed/person',
                            number: `${mdtPageViews}`,
                            txt: 'Current Month',
                        },
                        metricsdata: {
                            // link: "/sample-link2",
                            background: 'blue',
                        },
                    },
                    {
                        itm: {
                            iconname: 'MdPerson',
                            type: 'No of Pages viewed/person',
                            number: `${todaysPageViews}`,
                            txt: 'Todays',
                        },
                        metricsdata: {
                            // link: "/sample-link2",
                            background: 'green',
                        },
                    },
                ];
            });
            setRightMasterData(response?.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleExportData = () => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/User/GetLoginAndPageVisitDetailsExcel`).then((response) => {
            if (!response) {
                dispatch(fetchError('Error occurred in Export !!!'));
                return;
            }
            if (response?.data) {
                var filename = 'User Analytics.xlsx';
                if (filename && filename === '') {
                    dispatch(fetchError('Error Occurred !'));
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

                    dispatch(showMessage('Report downloaded successfully!'));
                }
            }
        });
    };

    const handleUserAnalytics = () => {
        if (!fromDate && !toDate) {
            setFromDateError('Please select From Date');
            setToDateError('Please select To Date');
            return;
        }
        if (!fromDate) {
            setFromDateError('Please select From Date');
            return;
        }
        if (!toDate) {
            setToDateError('Please select To Date');
            return;
        }
        if (fromDate && toDate) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/User/GetLoginAndPageVisitDetails?fromdate=${fromDate}&todate=${toDate}&type=Custom`)
                .then((response: any) => {
                    setUserGridList(response.data[2]);
                })
                .catch((e: any) => {});
        } else {
        }
    };

    const handleUserAnalyticsForToday = () => {
        if (fromDate && toDate) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const fromDate = formattedDate;
            const toDate = formattedDate;
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/User/GetLoginAndPageVisitDetails?fromdate=${fromDate}&todate=${toDate}&type=Today`)
                .then((response: any) => {
                    setUserGridList(response.data[2]);
                })
                .catch((e: any) => {});
        } else {
        }
    };
    useEffect(() => {
        showRightData();
    }, []);

    const styling = {
        marginTop: '5px',
        marginBottom: '5px',
    };
    const handleTat = (e) => {
        if (e.target.value === 'true') {
            handleUserAnalyticsForToday();
        } else if (fromDate && toDate) {
            handleUserAnalytics();
        }
        setTotalTAT(e.target.value === 'true' ? true : false);
    };
    function onGridReady(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridApi(params.api);
    }
    function onGridReady2(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridApi(params.api);
    }
    let columnDefs = [
        {
            field: 'UserId',
            headerName: 'User',
            headerTooltip: 'User',

            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 70,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'PageUrl',
            headerName: 'Page URL',
            headerTooltip: 'Page URL',

            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 70,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'VisitTime',
            headerName: 'Visit Time',
            headerTooltip: 'Visit Time',

            sortable: true,
            resizable: true,
            width: 90,
            minWidth: 70,
            cellStyle: { fontSize: '13px' },
            // valueFormatter: (params) => {
            //     const formattedDate = new Date(params.value).toLocaleString();
            //     return formattedDate;
            // },
            valueFormatter: (params) => {
                const formattedDate = format(new Date(params.value), 'dd/MM/yyyy, h:mm:ss a');
                return formattedDate;
            },
        },
    ];

    let columnDefs2 = [
        {
            field: 'Month_Name',
            headerName: 'Month',
            headerTooltip: 'Month',
            sortable: true,
            resizable: true,
            width: 200,
            minWidth: 150,
            cellStyle: { fontSize: '11px' },
        },
        {
            field: 'Month_Logins',
            headerName: 'No Of Logins',
            headerTooltip: 'No Of Logins',
            sortable: true,
            resizable: true,
            width: 130,
            maxWidth: 130,
            cellStyle: { fontSize: '11px' },
        },
        {
            field: 'Month_PageViews',
            headerName: 'No Of Pages Visited',
            headerTooltip: 'No Of Pages Visited',
            sortable: true,
            resizable: true,
            width: 170,
            maxWidth: 170,
            cellStyle: { fontSize: '11px' },
        },
    ];

    return (
        <>
            <Grid
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '25px',
                }}
            >
                <Box component="h2" className="page-title-heading mb-0">
                    User Analytics
                </Box>
                <div className="rolem-grid" style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            marginRight: 5,
                        }}
                    >
                        <Stack display="flex" alignItems="flex-end" justifyContent="space-between" flexDirection="row" sx={{ mb: -2 }}>
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
                </div>
            </Grid>
            <Grid marginBottom="0px" marginTop="-25px" item container spacing={3} justifyContent="start" alignSelf="center" sx={{ marginBottom: '5px' }}>
                <Grid item xs={12} sm={6} md={8} sx={{ position: 'relative' }}>
                    <Grid container spacing={3} justifyContent="start" alignSelf="center">
                        {cardData.map((item, index) => (
                            <Grid item key={index} xs={12} sm={6} md={4} sx={{ position: 'relative', marginTop: '-11px' }}>
                                <MatricsCard itm={item.itm} metricsdata={item.metricsdata} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                <Grid item xs={12} md={4} sx={{ position: 'relative' }}>
                    <div
                        style={{
                            height: 'calc(100vh - 437px)',
                            // marginTop: '5px',
                            minWidth: '',
                            width: '100%',
                        }}
                    >
                        <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs2} rowData={propertyDraftList || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} rowHeight={24} />
                    </div>
                </Grid>
            </Grid>

            <Grid container item spacing={5} justifyContent="start" alignSelf="center" marginTop="-30px">
                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                    <div style={{ marginTop: '5px' }}>
                        <ToggleSwitch alignment={totalTAT} handleChange={(e) => handleTat(e)} yes={'Todays'} no={'Custom'} name={'Qty'} id="Qty" onBlur={() => {}} disabled={''} bold="false" />
                    </div>
                </Grid>
                {!totalTAT && (
                    <>
                        <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '7px' }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div style={{ display: 'flex', alignItems: 'center', marginLeft: '-11px' }}>
                                    <div style={{ marginLeft: '1px', marginRight: '10px', whiteSpace: 'nowrap' }}>
                                        <h2 className="phaseLable required">From Date</h2>
                                    </div>
                                    <DesktopDatePicker
                                        className="w-85"
                                        inputFormat="DD/MM/YYYY"
                                        value={fromDate}
                                        // maxDate={initToday}
                                        // onChange={(newValue) => setFromDate(moment(new Date(newValue)).format('YYYY-MM-DD'))}
                                        onChange={(newValue) => {
                                            const formattedDate = moment(new Date(newValue)).format('YYYY-MM-DD');
                                            if (moment(formattedDate).isAfter(toDate)) {
                                                setFromDate(toDate);
                                                setFromDateError('');
                                            } else {
                                                setFromDate(formattedDate);
                                                setFromDateError('');
                                            }
                                        }}
                                        renderInput={(params) => <TextField {...params} name="fromDate" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                                    />
                                </div>
                            </LocalizationProvider>
                            <p className="form-error" style={{ marginTop: 0, marginLeft: 80 }}>
                                {fromDateError}
                            </p>
                            {/* </div> */}
                        </Grid>

                        <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '7px' }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div style={{ display: 'flex', alignItems: 'center', marginLeft: '-19px' }}>
                                    <div style={{ marginLeft: '10px', marginRight: '10px', whiteSpace: 'nowrap' }}>
                                        <h2 className="phaseLable required">To Date</h2>
                                    </div>
                                    <DesktopDatePicker
                                        className="w-85"
                                        inputFormat="DD/MM/YYYY"
                                        value={toDate}
                                        minDate={fromDate}
                                        // maxDate={initToday}
                                        onChange={(newValue) => {
                                            setToDate(moment(new Date(newValue)).format('YYYY-MM-DD'));
                                            setToDateError('');
                                        }}
                                        renderInput={(params) => <TextField {...params} name="toDate" size="small" onKeyDown={(e: any) => e.preventDefault()} />}
                                    />
                                </div>
                            </LocalizationProvider>
                            <p className="form-error" style={{ marginTop: 0, marginLeft: 65 }}>
                                {toDateError}
                            </p>
                            {/* </div> */}
                        </Grid>

                        <Grid>
                            <div>
                                <Button size="small" style={primaryButtonSm} sx={{ color: '#fff', fontSize: '12px', marginLeft: '10px', padding: '7px, 19px !important', marginTop: '27px' }} onClick={handleUserAnalytics}>
                                    Search
                                </Button>
                            </div>
                        </Grid>
                    </>
                )}
            </Grid>

            <Grid marginBottom="0px" item container spacing={3} justifyContent="start" alignSelf="center">
                <Grid item xs={12} md={12} sx={{ position: 'relative' }}>
                    <div
                        style={{
                            height: 'calc(100vh - 513px)',
                            marginTop: '5px',
                            minWidth: '',
                            width: '100%',
                        }}
                    >
                        <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={userGridList || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} rowHeight={24} />
                    </div>
                </Grid>
            </Grid>
        </>
    );
}
export default CardsMasterTest;
