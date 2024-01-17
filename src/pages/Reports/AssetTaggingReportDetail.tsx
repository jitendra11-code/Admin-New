import React, { useState,useEffect } from 'react';
import { useFormik } from 'formik';
//import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
//import Grid from '@mui/material/Grid';
import Box from "@mui/material/Box";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';
import { GridApi } from 'ag-grid-community';
import { fetchError, showMessage } from 'redux/actions';
import { useDispatch } from 'react-redux';
import csv from "../../assets/icon/csv.png";
import { Grid, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';

const AssetTaggingReportDetail = () => {
  const [rowData, setRowData] = useState([]);
  const dispatch = useDispatch();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  //(1)added part for input fields dropdown menu list getting from api.
  const [assetTypes, setAssetTypes] = useState([]);
  const [assetCategorizations, setAssetCategorizations] = useState([]);
  //(2) added part for input fields dropdown menu list getting from api.
  useEffect(() => {
    // Fetch asset types
    axios.get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Asset Type`)
      .then(response => {
        setAssetTypes(response.data)
        
      })
      .catch(error => console.error('Error fetching asset types:', error));

    // Fetch asset categorizations
    axios.get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Asset Category`)
      .then(response => {
        setAssetCategorizations(response.data)
        
      })
      .catch(error => console.error('Error fetching asset categorizations:', error));
  }, []);



  const handleExportData = async () => {
    try {
      // Use the rowData instead of rowData
      const csvData = rowData.map(item =>
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
      tempLink.setAttribute("download", "AssetTaggingReportDetails.csv");
  
      document.body.appendChild(tempLink);
      tempLink.click();
  
      // Clean up resources
      setTimeout(function () {
        document.body.removeChild(tempLink);
        window.URL.revokeObjectURL(blobURL);
      }, 200);
  
      dispatch(showMessage("Asset Tagging Report Details downloaded successfully!"));
    } catch (error) {
      dispatch(fetchError('Error occurred while downloading.'));
      console.error('Error occurred while downloading data:', error);
    }
  };
  
  const formik = useFormik({
    initialValues: {
      assetCode: '',
      assetType: '',
      assetCategorization: '',
    },
    onSubmit: async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASEURL}/api/AssetTagging/GetAssetTaggingReportDetails?AssetCode=${formik.values.assetCode}&AssetType=${formik.values.assetType}&AssetCategorization=${formik.values.assetCategorization}`);

        setRowData(response?.data || []);
        console.log("AssetReportData", response?.data);
      } catch (error) {
        console.error("Error occurred while fetching data:", error);
        dispatch(fetchError("Error occurred while fetching data."));
      }
    },
  });

  const getDynamicColumn = (obj) => {
    if (obj != null) {
      // Define a mapping for custom tooltips based on column names
      const customTooltips = {
        // Add custom tooltips for specific columns
        'Asset Code': 'Asset Code',
        'Asset Type': 'Asset Type',
        'AWB NO':'AWB Number'
        // Add more as needed
      };
  
      return Object.keys(obj).map(key => ({
        field: key,
        headerName: key, // Set the column header name
        headerTooltip: customTooltips[key] || key, // Use custom tooltip if available, else use the column name
      }));
    }
    return [];
  };
  






  // const getDynamicColumn = (obj) => {
  //   if (obj != null) {
  //     return Object.keys(obj).map(key => ({
  //       field: key,
  //       headerName: key, // Set the column header name
  //       headerTooltip: key, // Set the tooltip for the column header
  //     }));
  //   }
  //   return [];
  // };

  function onGridReady(params) {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    params.api.setColumnDefs(getDynamicColumn(rowData?.[0]));
  }

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <Grid item xs={12}>
            <Box component="h2" className="page-title-heading mtb-10" style={{ margin: '10px 0px 2px 2px' }}>
              Asset Tagging Report Details
            </Box>
          </Grid>
        </div>
        <div style={{
          border: '1px solid #ccc',
          padding: '15px 5px 5px 5px',
          borderRadius: '3px',
          backgroundColor: 'white',
          margin: '16px 1px 1px 1px',
          overflow: 'auto',
          height: "calc(100vh - 118px)",
          overflowX: 'hidden',
        }}>
          <Grid container spacing={3} alignItems="center">
            {/* Asset Code */}
            <Grid item xs={12} sm={4}>
              <label htmlFor="assetCode" style={{ display: 'block', marginBottom: '5px' }}>
                Asset Code
              </label>
              <TextField
                id="assetCode"
                variant="outlined"
                size="small"
                style={{ width: '100%' }}
                value={formik.values.assetCode}
                onChange={formik.handleChange('assetCode')}
                error={formik.touched.assetCode && Boolean(formik.errors.assetCode)}
                helperText={formik.touched.assetCode && formik.errors.assetCode && (
                  <span style={{ color: 'red' }}>{formik.errors.assetCode}</span>
                )}
              />
            </Grid>
  <Grid item xs={12} sm={4}>
  <label htmlFor="assetType" style={{ display: 'block', marginBottom: '5px' }}>
  Asset Type
  </label>
    <Select
      id="assetType"
      value={formik.values.assetType}
      variant="outlined"
      onChange={(e) => formik.handleChange('assetType')(e.target.value)}
      style={{ width: '100%' }}
      size="small"
    >
      {Array.from(new Set(assetTypes.map((type) => type['formName']))).map((uniqueType, index) => (
        <MenuItem key={index} value={uniqueType}>
          {uniqueType || "Unknown Asset Type"}
        </MenuItem>
      ))}
    </Select>
  </Grid>

 
 <Grid item xs={12} sm={4}>
 <label htmlFor="assetCategorizations" style={{ display: 'block', marginBottom: '5px' }}>
  Asset Categorization
 </label>
    <Select
      variant="outlined"
      id="assetCategorizations"
      value={formik.values.assetCategorization}
      onChange={(e: SelectChangeEvent<string>) => formik.handleChange('assetCategorization')(e.target.value)}
      style={{ width: '100%' }}
      size="small"
    >
    
    {Array.from(new Set(assetCategorizations.map((type) => type['formName']))).map((uniqueType, index) => (
      <MenuItem key={index} value={uniqueType}>
        {uniqueType || "Unknown Asset Categorization"}
      </MenuItem>
    ))}
</Select>
</Grid>


            {/* Search, Reset, and Download buttons centered with space in between */}
            <Grid item xs={12} style={{ marginTop: '15px', textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                style={{
                  padding: '2px 20px',
                  borderRadius: 6,
                  color: '#fff',
                  borderColor: '#00316a',
                  backgroundColor: '#00316a',
                  marginRight: '10px',
                }}
              >
                Search
              </Button>
              <Button
                type="button"
                variant="contained"
                onClick={formik.handleReset}
                style={{
                  padding: '2px 20px',
                  borderRadius: 6,
                  color: '#fff',
                  borderColor: '#00316a',
                  backgroundColor: '#00316a',
                  marginRight: '10px',
                }}
                
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                size="medium"
                style={{
                  padding: '2px 20px',
                  fontSize: 12,
                  borderRadius: 6,
                  color: '#00316a',
                  borderColor: rowData.length === 0 ? 'gray' : '#00316a',
                  backgroundColor: rowData.length === 0 ? 'gray' : '',
                }}
                disabled={rowData.length === 0}
                onClick={() => {
                  handleExportData();
                }}
              >
                 <img src={csv} alt="" className="icon-size" />
                Download 
              </Button>
            </Grid>
          </Grid>
          <hr style={{ border: "1px solid lightgray", margin: '20px 2px 10px 2px', color: '#ddd' }} />
          {rowData && rowData.length > 0 && (
            <div className="ag-theme-alpine" style={{ height: "100%", width: "100%", margin: '5px 0px 0px 0px' }}>
              <AgGridReact
                defaultColDef={{ flex: 1, resizable: true, width: 150, minWidth: 150, sortable: true }}
                rowData={rowData || []}
                onGridReady={onGridReady}
                pagination={true}
                paginationPageSize={10}
              />
            </div>
          )}
        </div>
      </form>
    </>
  );
};

export default AssetTaggingReportDetail;









