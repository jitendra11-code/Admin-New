





import csv from "assets/icon/csv.png";
import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import axios from 'axios';
import { Button, Box, Grid, InputAdornment, TextField } from '@mui/material';
import { Stack,  IconButton, alpha } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';
import { HiAdjustments } from 'react-icons/hi';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import AppTooltip from '@uikit/core/AppTooltip';
import { AiFillFileExcel } from 'react-icons/ai';
const PropertyReportDetail = () => {
    const dispatch = useDispatch();
    const [rowData, setRowData] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [gridApi, setGridApi] = useState(null);
    const gridRef = React.useRef(null);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/GetPropertyPoolReport`)
            .then((response) => {
                const apiData = response.data;
    
                // Logging API data for debugging
                console.log('API Data:', apiData);
    
                const cleanedData = apiData.map((item) => {
                    // Assuming you want to remove objects with null values, adjust this if needed
                    Object.keys(item).forEach((key) => {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            item[key] = '';
                        }
                    });
    
                    return item;
                });
    
                // Logging cleaned data for debugging
                console.log('Cleaned Data:', cleanedData);
    
                setRowData(cleanedData || []);
            })
            .catch((error) => {
                dispatch(fetchError('Error occurred while fetching data.'));
            });
    }, []);
    

    const handleExportDatacsv = async () => {
        try {
          // Use the rowData instead of rowData
          const csvData = filteredData.map(item =>
            Object.values(item).map(val => (val ? val.toString() : "")).join(",")
          );
      
          // Add header row
          csvData.unshift(Object.keys(rowData[0]).join(","));
      
          // Create a Blob and trigger the download
          const csvContent = csvData.join("\n");
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const blobURL = window.URL.createObjectURL(blob);
      
          // Create a temporary link and trigger download
          var tempLink = document.createElement("a");
          tempLink.style.display = "none";
          tempLink.href = blobURL;
          tempLink.setAttribute("download", "PropertyReportDetails.csv");
      
          document.body.appendChild(tempLink);
          tempLink.click();
      
          // Clean up resources
          setTimeout(function () {
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobURL);
          }, 200);
      
          dispatch(showMessage("Property Report Details downloaded successfully!"));
        } catch (error) {
          dispatch(fetchError('Error occurred while downloading.'));
          console.error('Error occurred while downloading data:', error);
        }
      };

    const handleExportDataExcel = () => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/Mandates/GetPropertyPoolReportForExcel`).then((response) => {

            if (!response) {
                dispatch(fetchError('Error occurred during Export'));
                return;
            }
            if (response?.data) {
                var filename = 'Property Report Details.xlsx';
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

                    // Fixes "webkit blob resource error 1"
                    setTimeout(function () {
                        document.body.removeChild(tempLink);
                        window.URL.revokeObjectURL(blobURL);
                    }, 200);

                    dispatch(showMessage('property Report Details downloaded successfully!'));
                }
            }
        });
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

    const getDynamicColumnDefinition = (obj) => {
        if (obj) {
            return Object.keys(obj).map((key) => ({
                headerName: key,
                field: key,
                sortable: true,
                filter: true,
                headerTooltip: key,
            }));
        }

        return [];
    };

    return (
        <div>
            <div>
                <Box component="h2" className="page-title-heading mtb-10" style={{ margin: '10px 0px 5px 3px' }}>
                    Property Report Details
                </Box>
            </div>
            <div
                style={{
                    border: '1px solid #ccc',
                    padding: '15px 5px 5px 5px',
                    borderRadius: '3px',
                    backgroundColor: 'white',
                    margin: '16px 2px 2px 2px',
                    //overflow: 'auto',
                    height: 'calc(100vh - 118px)',
                    overflowX: 'hidden',
                }}
            >
               

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
                            onClick={handleExportDatacsv}
                        >
                            <img src={csv} alt="" className="icon-size" />
                            Download
                        </Button>
                    </Grid>
                    {/* <Grid item>
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
                                    handleExportDataExcel();
                                }}
                                size="large"
                            >
                                <AiFillFileExcel />
                            </IconButton>
                        </AppTooltip>
                </Grid> */}
                </Grid>







                {filteredData && filteredData?.length === 0 ? (
                    <div className="ag-theme-alpine" style={{ height: getHeightForTransportTable(), marginTop: '10px' }}>
                        <CommonGrid
                            defaultColDef={{ flex: 1, resizable: true, width: 150, minWidth: 150, sortable: true }}
                            columnDefs={getDynamicColumnDefinition(rowData[0])}
                            rowData={filteredData || []}
                            onGridReady={onGridReady}
                            gridRef={gridRef}
                            pagination={false}
                            paginationPageSize={null}
                        />
                        <p className="noData">No Data Found</p>
                    </div>
                ) : (
                    <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 193px)', width: '100%', margin: '5px 0px 2px 0px' }}>
                        <AgGridReact
                            defaultColDef={{ flex: 1, resizable: true, width: 150, minWidth: 150, sortable: true }}
                            rowData={filteredData || []}
                            pagination={true}
                            paginationPageSize={10}
                            columnDefs={getDynamicColumnDefinition(rowData[0])}
                            gridOptions={{
                                headerHeight: 30,
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyReportDetail;
