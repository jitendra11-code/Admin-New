import { Box, Button, Grid, IconButton, InputAdornment, Stack, TextField, Tooltip } from '@mui/material';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { TbPencil } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AppTooltip from '@uikit/core/AppTooltip';
import { AiFillFileExcel } from 'react-icons/ai';

const AssetRequestList = () => {

  const [assetRequestData,setAssetRequestData]=useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getAllData = async () => {
    await axios 
    .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetAllAssetRequest`)
    .then((response : any)=>{
        setAssetRequestData(response?.data || []);
        console.log('res',response)
    })
    .catch((e:any) => {});
};

useEffect(() =>{
getAllData();
},[]);

let columnDefs = [
  {
      field: "Action",
      headerName: "Actions",
      headerTooltip: "Actions",
      sortable: false,
      resizable: false,
      pinned: "left",
      cellRenderer: (params: any) => (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginRight: "10px",
            }}
            className="actions"
          >
            <Tooltip title="Asset Request Review" className="actionsIcons">
              <button className="actionsIcons " >
                <VisibilityIcon  onClick={() => {
                  console.log("params",params);
                  navigate(`/${params?.data?.id}/AssetRequestReview`)} } style={{fontSize: "14px"}}/>
              </button>
            </Tooltip>
            <Tooltip title="Edit Asset Request" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize" >
                <TbPencil  onClick={() => {
                  console.log("params",params);
                  navigate(`/AssetRequest/${params?.data?.id}/Update`)} }/>
              </button>
            </Tooltip>
          </div>
        </>
      ),
      width: 90,
      minWidth :90,
      cellStyle: { fontSize: "13px" },
  },
  {
      field: "requestNo",
      headerName: "Request Number",
      headerTooltip: "Request Number",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 120,
      minWidth : 120,
  },
  {
    field: "dateofCommissioning",
    headerName: "Requested Date",
    headerTooltip: "Requested Date",
    sortable: true,
    resizable: true,
    cellStyle: { fontSize: "13px" },
    cellRenderer: function (params) {
        var formattedDate = moment(params.value).format('DD/MM/YYYY');
        return formattedDate;
      },
    width: 150,
    minWidth : 150,
},
  {
      field: "requesterName",
      headerName: "Requester Name",
      headerTooltip: "Requester Name",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 150,
      minWidth: 150,
  },
  {
      field: "shiftingType",
      headerName: "Shifting Type",
      headerTooltip: "Shifting Type",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 120,
      minWidth : 120,
  },
  {
      field: "branchName",
      headerName: "Branch Name",
      headerTooltip: "Branch Name",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 140,
      minWidth : 140,
  },
  
  {
      field: "branchCode",
      headerName: "Branch Code",
      headerTooltip: "Branch Code",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 120,
      minWidth : 120,
  },
  {
      field: "pinCode",
      headerName: "Pin Code",
      headerTooltip: "Pin Code",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 60,
      minWidth : 60,
  },
  {
    field: "city",
    headerName: "City",
    headerTooltip: "City",
    sortable: true,
    resizable: true,
    cellStyle: { fontSize: "13px" },
    width: 120,
    minWidth : 120,
},
{
  field: "type",
  headerName: "Asset Type",
  headerTooltip: "Asset Type",
  sortable: true,
  resizable: true,
  cellStyle: { fontSize: "13px" },
  width: 120,
  minWidth : 120,
},
];

function onGridReady(params) {
  setGridApi(params.api);
  gridRef.current!.api.sizeColumnsToFit();
}
const onFilterTextChange = (e) => {
  gridApi?.setQuickFilter(e?.target?.value);
  if (gridApi.getDisplayedRowCount() == 0) {
    dispatch(fetchError("Data not found!"))
  }
};
const handleExportData = () => {
  axios
  .get(
    `${process.env.REACT_APP_BASEURL}/api/Asset/GetExcelForAssetRequest`
  )
    .then((response) => {
      if (!response) {
        dispatch(fetchError("Error occurred in Export !!!"));
        return;
      }
      if (response?.data) {
        var filename = "AssetRequestList.xlsx";
        if (filename && filename === "") {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        const binaryStr = atob(response?.data);
        const byteArray = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          byteArray[i] = binaryStr.charCodeAt(i);
        }

        var blob = new Blob([byteArray], {
          type: "application/octet-stream",
        });
        if (typeof window.navigator.msSaveBlob !== "undefined") {
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var blobURL =
            window.URL && window.URL.createObjectURL
              ? window.URL.createObjectURL(blob)
              : window.webkitURL.createObjectURL(blob);
          var tempLink = document.createElement("a");
          tempLink.style.display = "none";
          tempLink.href = blobURL;
          tempLink.setAttribute("download", filename);
          if (typeof tempLink.download === "undefined") {
            tempLink.setAttribute("target", "_blank");
          }

          document.body.appendChild(tempLink);
          tempLink.click();

          setTimeout(function () {
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobURL);
          }, 200);

          dispatch(
            showMessage("Asset Request List downloaded successfully!")
          );
        }
      }
    });
};
  return (
    <>
    <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "15px",
        }}
      >
        <Box component="h2" className="page-title-heading mb-0">
          Asset Request
        </Box>
      
      <div className="phase-grid">
          <Stack
            display="flex"
            alignItems="flex-end"
            justifyContent="space-between"
            flexDirection="row"
            sx={{ mb: -2 }}
          >
            <TextField
              size="small"
              sx={{ marginRight: "10px" }}
              variant="outlined"
              name="search"
              onChange={(e) => 
              {onFilterTextChange(e)
              console.log('e',e)}}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Add New">
              <Button
                size="small"
                style={primaryButtonSm}
                sx={{ color: "#fff", fontSize: "12px" }}
                onClick={() => navigate("/AssetRequest")}
              >
                Add New
              </Button>
            </Tooltip>
              <AppTooltip title="Export Excel">
              <IconButton
                className="icon-btn"
                sx={{
                  // borderRadius: "50%",
                  // borderTopColor:"green",
                  width: 35,
                  height: 35,
                  // color: (theme) => theme.palette.text.secondary,
                  color: "white",
                  backgroundColor: "green",
                  "&:hover, &:focus": {
                    backgroundColor: "green", // Keep the color green on hover
                  },                  
                }}
                onClick={() => {handleExportData();}}
                size="large"
              >
                <AiFillFileExcel />
              </IconButton>
            </AppTooltip>
              </Stack>
            </div>
            </Grid>
        <CommonGrid
            defaultColDef={{ flex: 1 }}
            columnDefs={columnDefs}
            rowData={assetRequestData}
            onGridReady={onGridReady}
            gridRef={gridRef}
            pagination={true}
            paginationPageSize={10}
            />
    </>
  )
}

export default AssetRequestList
