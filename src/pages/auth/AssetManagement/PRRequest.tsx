import { Box, Button, Grid, InputAdornment, Stack, TextField, Tooltip } from '@mui/material'
import React from 'react'
import SearchIcon from '@mui/icons-material/Search';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import { useDispatch } from 'react-redux';
import { fetchError } from 'redux/actions';
import { AgGridReact } from 'ag-grid-react';
import { GridApi } from 'ag-grid-community';
import moment from 'moment';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';

const PRRequest = () => {
    const dispatch = useDispatch();
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);

    const onFilterTextChange = (e) => {
        gridApi?.setQuickFilter(e?.target?.value);
        if (gridApi.getDisplayedRowCount() == 0) {
          dispatch(fetchError("Data not found!"))
        }
    };
    function onGridReady(params) {
        setGridApi(params.api);
        gridRef.current!.api.sizeColumnsToFit();
    };

      let columnDefs = [
        {
          field: "Action",
          headerName: "Actions",
          headerTooltip: "Actions",
          sortable: false,
          resizable: false,
          pinned: "left",
          cellRenderer: (e: any) => (
            <>
            
            
          </>
          ),
          width: 90,
          minWidth: 90,
          cellStyle: { fontSize: "13px" },
        },
        {
          field: "assetNumber",
          headerName: "Asset Number",
          headerTooltip: "Asset Number",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 160,
          minWidth: 140,
        },
        {
            field: "capDate",
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
            minWidth: 120,
        },
        {
          field: "assetCategory",
          headerName: "Requester Name",
          headerTooltip: "Requester Name",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 160,
          minWidth: 140,
        },
        {
          field: "assetdescription",
          headerName: "Shifting Type",
          headerTooltip: "Shifting Type",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 160,
          minWidth: 140,
        },
        {
            field: "assetdescription",
            headerName: "Branch Name",
            headerTooltip: "Branch Name",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 160,
            minWidth: 140,
        },
        {
            field: "assetdescription",
            headerName: "Branch Code",
            headerTooltip: "Branch Code",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 160,
            minWidth: 140,
        },
        {
            field: "assetdescription",
            headerName: "Pin Code",
            headerTooltip: "Pin Code",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 160,
            minWidth: 140,
        },
        {
            field: "assetdescription",
            headerName: "City",
            headerTooltip: "City",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 160,
            minWidth: 140,
        },
        {
            field: "assetdescription",
            headerName: "Asset Type",
            headerTooltip: "Asset Type",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 160,
            minWidth: 140,
        },
        
        ];
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
            PR Request
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
              onChange={(e) => {
                onFilterTextChange(e)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Request Approved">
              <Button
                size="small"
                style={primaryButtonSm}
                sx={{ color: "#fff", fontSize: "12px" }}
              //   onClick={() => assetDetailsData.length > 0 ? handleClickOpen() : dispatch(fetchError("Please select atleast one record!!"))}
              >
              Request Approved
              </Button>
            </Tooltip>
          </Stack>
        </div>
      </Grid>
      <CommonGrid
        defaultColDef={{ flex: 1 }}
        columnDefs={columnDefs}
        rowData={[]}
        onGridReady={onGridReady}
        gridRef={gridRef}
        pagination={true}
        paginationPageSize={10}
      />
    </>
  )
}

export default PRRequest