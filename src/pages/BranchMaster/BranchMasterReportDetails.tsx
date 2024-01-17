import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import axios from 'axios';
import { Button, Box, Grid, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import csv from '../../assets/icon/csv.png';
import { GridApi } from 'ag-grid-community';
import Tooltip from '@mui/material/Tooltip';
import { HiAdjustments } from 'react-icons/hi';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';

interface User {
    isLoading: boolean;
    isAuthenticatedToken: boolean;
    user: {
        role: string;
        UserName: string;
        // other properties as needed
    };
}

const BranchMasterReportDetail = () => {
    const dispatch = useDispatch();
    const [rowData, setRowData] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const user: User = useAuthUser();
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const gridRef = React.useRef<AgGridReact>(null);
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Check if user object is available and has required properties
            if (user && user.user.role && user.user.UserName) {
                const role = user.user.role;
                const UserName = user.user.UserName;

                const encodedRoleName = encodeURIComponent(role);
                const encodedEmployeeName = encodeURIComponent(UserName);

                // const encodedRoleName = encodeURIComponent('Admin SPOC');
                // const encodedEmployeeName = encodeURIComponent('Suresh Kumar');

                const response = await axios.get(`${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterReportDetails?roleName=${encodedRoleName}&employeeName=${encodedEmployeeName}&type=`);

                // Replace objects with null values
                const cleanedData = response.data.data.map((item) => {
                    Object.keys(item).forEach((key) => {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            item[key] = '';
                        }
                    });
                    return item;
                });

                setRowData(cleanedData || []);

               
            } else {
                // Handle the case where user or required properties are not available
                console.error('User or required properties not available');
            }
        } catch (error) {
            dispatch(fetchError('Error occurred while fetching data.'));
        }
    };

    // const fetchData = async () => {
    //   try {
    //     const roleName = 'Admin SPOC';
    //     const employeeName = 'Suresh Kumar';

    //     // Encode parameters
    //     const encodedRoleName = encodeURIComponent(roleName);
    //     const encodedEmployeeName = encodeURIComponent(employeeName);

    //     const response = await axios.get(
    //       `${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterReportDetails?roleName=${encodedRoleName}&employeeName=${encodedEmployeeName}&type=`
    //     );

    //     // Replace objects with null values
    //     const cleanedData = response.data.data.map(item => {
    //       Object.keys(item).forEach(key => {
    //         if (typeof item[key] === 'object' && item[key] !== null) {
    //           item[key] = "";
    //         }
    //       });
    //       return item;
    //     });

    //     setRowData(cleanedData || []);

    //     console.log('worked')
    //   } catch (error) {
    //     dispatch(fetchError("Error occurred while fetching data."));
    //     console.error('Error occurred while fetching data:', error);
    //   }
    // };

    const handleExportData = async () => {
        try {
            // Use the filteredData instead of rowData
            const csvData = filteredData.map((item) =>
                Object.values(item)
                    .map((val) => (val ? val.toString() : ''))
                    .join(','),
            );

            // Add header row
            csvData.unshift(Object.keys(filteredData[0]).join(','));

            // Create a Blob and trigger the download
            const csvContent = csvData.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const blobURL = window.URL.createObjectURL(blob);

            // Create a temporary link and trigger download
            var tempLink = document.createElement('a');
            tempLink.style.display = 'none';
            tempLink.href = blobURL;
            tempLink.setAttribute('download', 'BranchMasterReportDetails.csv');

            document.body.appendChild(tempLink);
            tempLink.click();

            // Clean up resources
            setTimeout(function () {
                document.body.removeChild(tempLink);
                window.URL.revokeObjectURL(blobURL);
            }, 200);

            dispatch(showMessage('Branch Master Report Details downloaded successfully!'));
        } catch (error) {
            dispatch(fetchError('Error occurred while downloading data.'));
        }
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const filteredData = rowData.filter((item) => Object.values(item).some((val) => String(val).toLowerCase().includes(searchValue.toLowerCase())));
    function onGridReady(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridApi(params.api);
    }

    const getHeightForTransportTable = useCallback(() => {
        const dataLength = filteredData ? filteredData.length : 0;
        if (dataLength === 0) {
            return '30px';
        } else if (dataLength === 1) {
            return '125px';
        } else if (dataLength === 2) {
            return '127px';
        } else if (dataLength === 3) {
            return '169px';
        } else {
            return '169px';
        }
    }, [filteredData]);
    return (
        <div>
            <div>
                <Box component="h2" className="page-title-heading mtb-10" style={{ margin: '10px 0px 5px 3px' }}>
                    Branch Master Report Details
                </Box>
            </div>
            <div
                style={{
                    border: '1px solid #ccc',
                    padding: '15px 5px 5px 5px',
                    borderRadius: '3px',
                    backgroundColor: 'white',
                    margin: '16px 2px 2px 2px',
                    overflow: 'auto',
                    height: 'calc(100vh - 118px)',
                    overflowX: 'hidden',
                }}
            >
                {/* Search and Download buttons using Grid component */}
                <Grid container alignItems="center" justifyContent="flex-end" spacing={2} marginBottom="15px">
                    <Grid item>
                        <TextField
                            size="small"
                            variant="outlined"
                            value={searchValue}
                            onChange={handleSearchChange}
                            placeholder="Search"
                            style={{ width: '150px' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            size="medium"
                            style={{
                                padding: '6px 25px',
                                fontSize: 13,
                                borderRadius: 6,
                                color: '#00316a',
                                borderColor: filteredData.length === 0 ? 'gray' : '#00316a',
                                backgroundColor: filteredData.length === 0 ? 'gray' : '',
                            }}
                            disabled={filteredData.length === 0}
                            onClick={handleExportData}
                        >
                            <img src={csv} alt="" className="icon-size" />
                            Download
                        </Button>
                    </Grid>
                </Grid>

                {filteredData && filteredData?.length == 0 ? (
                    <div className="ag-theme-alpine" style={{ height: getHeightForTransportTable(), marginTop: '10px' }}>
                        <CommonGrid defaultColDef={{ flex: 1, resizable: true, width: 150, minWidth: 150, sortable: true }} columnDefs={getDynamicColumnDefinition(rowData[0])} rowData={filteredData || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                        <p className="noData">No Data Found</p>
                    </div>
                ) : (
                    <div className="ag-theme-alpine" style={{ height: '92%', width: '100%', margin: '5px 0px 2px 0px' }}>
                        <AgGridReact
                            defaultColDef={{ flex: 1, resizable: true, width: 150, minWidth: 150, sortable: true }}
                            rowData={filteredData || []}
                            pagination={true}
                            paginationPageSize={10}
                            columnDefs={getDynamicColumnDefinition(rowData[0])}
                            gridOptions={{
                                headerHeight: 30, // Set the desired header height in pixels
                            }}
                        />
                    </div>
                )}

                {/* <AgGridReact defaultColDef={{ flex: 1, resizable: true, width: 150, minWidth: 150, sortable: true }} rowData={filteredData || []} pagination={false} paginationPageSize={null} columnDefs={getDynamicColumnDefinition(rowData[0])} /> */}
            </div>
        </div>
    );
};

export default BranchMasterReportDetail;

function getDynamicColumnDefinition(obj) {
    const coldef = {
        'Phase Code': 'PH_1097',
        'Mandate Code': 'PH_1097_MD_002',
        'Pennant Code': {},
        'Parent Location Code': {},
        'Location Code': 'LC1',
        'SAP Location Code': {},
        'SAP New Location Code': {},
        'Admin Vertical': 'Megapolis',
        'Sub Admin Vertical': {},
        Country: {},
        Zone: 'Z1',
        Tier: {},
        State: 'Maharashtra',
        District: 'Pune',
        City: 'Pune',
        'Location Name': 'LN1',
        Floor: {},
        'Building  Name': {},
        'Branch Address': 'XYZ',
        'PIN Code': 800010,
        Latitude: {},
        Longitude: {},
        'Branch Type': {},
        'Gold / Non-Gold': {},
        'Branch AC Type': {},
        'Property Type': {},
        'Premise Type': {},
        'Carpet Area (SFT)': {},
        'Constructed Area (SFT)': {},
        'Chargeable Area (SFT)': {},
        'Building Constructed In Year': {},
        'Go Live Date': {},
        'FPR Role': 'Location controller',
        'Location FPR Name & (Employee ID)': 'Devi Prasad Tripathi (992434)',
        'FPR Email ID ': 'deviprasadtripathi123@gmail.com',
        'FPR Contact': '788889562',
        'Admin SPOC Role': 'Admin SPOC',
        'Admin SPOC Name & (Employee ID)': 'Suresh Kumar (992435)',
        'Admin SPOC Designation': 'Branch Admin',
        'Admin SPOC Email ID': 'suresh.kumar@bajajfinserv.in',
        'Admin SPOC Contact': '8980128001',
        'ESC LEVEL 01 Role': {},
        'ESC LEVEL 01 Name & (Employee ID)': {},
        'ESC LEVEL 01 Designation': {},
        'ESC LEVEL 01 Email ID': {},
        'ESC LEVEL 01 Contact': {},
        'ESC Level 02 Role': {},
        'ESC LEVEL 02 Name & (Employee ID)': {},
        'ESC Level 02 Designation': {},
        'ESC LEVEL 02 Email ID': {},
        'ESC Level 02 Contact': {},
        'ESC Level 03 Role': {},
        'ESC LEVEL 03 Name & (Employee ID)': {},
        'ESC Level 03 Designation': {},
        'ESC LEVEL 03 Email ID': {},
        'ESC Level 03 Contact': {},
        'CFA User Role': {},
        'CFA User Name & (Employee ID)': {},
        'CFA User Designation': {},
        'CFA User Email ID': {},
        'CFA User Contact': {},
        'Vertical Head Role': {},
        'Vertical Head Name & (Employee ID)': {},
        'Vertical Head Designation': {},
        'Vertical Head Email ID': {},
        'Vertical Head Contact': {},
    };

    if (obj) {
        return Object.keys(obj).map((key) => ({
            headerName: key,
            field: key,
            sortable: true,
            filter: true,
            headerTooltip: key,
        }));
    }
    return Object.keys(coldef).map((key) => ({
        headerName: key,
        field: key,
        sortable: true,
        filter: true,
        headerTooltip: key,
    }));
}
