import { Box, Stack, IconButton, Grid, InputAdornment,TextField } from '@mui/material';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import AppTooltip from '@uikit/core/AppTooltip';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
// import { IconButton } from 'material-ui';
import moment from 'moment';
import React, { useEffect } from 'react'
import { AiFillFileExcel } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import SearchIcon from '@mui/icons-material/Search';

const AdminReport = () => {
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [reportData, setReportData] = React.useState([]);
  const dispatch = useDispatch();
  const getReport = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/GeGetMandateStatusList`
      )
      .then((response: any) => {
        console.log('res', response)
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }

        if (response?.data && response?.data && response?.data?.length > 0) {
          setReportData(response?.data)
        }
        if (response && response?.data?.length === 0) {

        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  }

  useEffect(() => {
    getReport();
  }, [])

  let columnDefs = [
    {
      field: "Mandate Code",
      headerName: "Mandate Code",
      headerTooltip: "Mandate Code",
      sortable: true,
      resizable: true,
      //   cellRenderer: (e: any) => {
      //     var data = e.data.filename;
      //     data = data?.split(".");
      //     data = data?.[0];
      //     return data || "";
      //   },
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Phase Code",
      headerName: "Phase Code",
      headerTooltip: "Phase Code",
      sortable: true,
      resizable: true,

      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
      //   cellRenderer: (e: any) => {
      //     return moment(e?.data?.createdDate).format("DD/MM/YYYY");
      //   }
    },
    {
      field: "Task Name",
      headerName: "Task Name",
      headerTooltip: "Task Name",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Role Name",
      headerName: "Role Name",
      headerTooltip: "Role Name",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "User Name",
      headerName: "User Name",
      headerTooltip: "User Name",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Task Submitted On",
      headerName: "Task Submitted On",
      headerTooltip: "Task Submitted On",
      cellRenderer: (e: any) => {
        console.log('e', e)
        return moment(e?.value).format("DD/MM/YYYY,   h:mm:ss A");
      },
      sortable: true,
      resizable: true,
      width: 200,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Branch Type",
      headerName: "Branch Type",
      headerTooltip: "Branch Type",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Admin Vertical",
      headerName: "Admin Vertical",
      headerTooltip: "Admin Vertical",
      sortable: true,
      resizable: true,
      width: 80,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
    },


  ]
  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  const onFilterTextChange = async (e) => {
    gridApi?.setQuickFilter(e.target.value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"));
    }
  };

  const handleExportData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/GetMandateStatusExcel`
      )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "ReportData.xlsx";
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
              showMessage("Report downloaded successfully!")
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
        <Box
          component="h2"
          className="page-title-heading my-6"
        >
          Admin Report
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
                  color: "white",
                  backgroundColor: "green",
                  "&:hover, &:focus": {
                    backgroundColor: "green", // Keep the color green on hover
                  },
                }}
                onClick={() => { handleExportData(); }}
                size="large"
              >
                <AiFillFileExcel />
              </IconButton>
            </AppTooltip>
          </Stack>
        </div>
      </Grid>
      <div style={{ height: "500px" }}>
        <CommonGrid
          defaultColDef={{ flex: 1 }}
          columnDefs={columnDefs}
          rowData={reportData || []}
          onGridReady={onGridReady}
          gridRef={gridRef}
          pagination={false}
          paginationPageSize={null}
        />
      </div>
    </>

  )
}
export default AdminReport;
