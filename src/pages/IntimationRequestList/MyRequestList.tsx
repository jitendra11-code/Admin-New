import { Grid, Stack, TextField, InputAdornment, Tooltip, IconButton, alpha } from "@mui/material";
import Box from "@mui/material/Box";
import SearchIcon from "@mui/icons-material/Search";
import React, { useEffect, useState } from "react";
import { TbPencil } from "react-icons/tb";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { GridApi } from "ag-grid-community";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import { useNavigate } from "react-router-dom";
import { AppState } from "redux/store";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import moment from "moment";
import { AiFillFileExcel } from "react-icons/ai";
import AppTooltip from "@uikit/core/AppTooltip";
function MyRequestList() {
  const { user } = useAuthUser();
  const [myRequestData, setMyRequestData] = React.useState<any>([]);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (gridApi) {
      gridApi!.sizeColumnsToFit();
    }
  }, [myRequestData]);

  const handleExportData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetExcelDownload?apiType=MyRequest`
      )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "MyRequest.xlsx";
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

            // Fixes "webkit blob resource error 1"
            setTimeout(function () {
              document.body.removeChild(tempLink);
              window.URL.revokeObjectURL(blobURL);
            }, 200);

            dispatch(
              showMessage("MyRequest downloaded successfully!")
            );
          }
        }
      });
  };

  const getMyRequest = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetMyComplianceRequest?rollname=${user?.role}&username=${user?.UserName}`
      )
      .then((response: any) => {
        setMyRequestData(response?.data);
      })
      .catch((e: any) => { });
  };
  useEffect(() => {
    getMyRequest();
  }, []);

  function onGridReady(params) {

    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }

  const onFilterTextChange = async (e) => {
    gridApi?.setQuickFilter(e.target.value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"));
    }
  };
  let columnDefs = [
    {
      field: "medals.bronze",
      headerName: "Action",
      headerTooltip: "Actions",
      width: 80,
      minWidth: 80,
      pinned: "left",
      cellRenderer: (e: any) => (
        <>
          <div className="actions">
            <Tooltip title="Edit Request" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize">

                <TbPencil
                  onClick={() => {
                    var url = e?.data?.URL;
                    // var action = userAction?.action;
                    var TableId = e?.data?.TableId;
                    navigate(
                      `/intimation/${e?.data?.Id}/${url}?tableId=${TableId}`,
                      {
                        state: { TableId: TableId, action: e?.data?.action },
                      }
                    );
                  }}
                />
              </button>
            </Tooltip>

          </div>
        </>
      ),
    },
    {
      field: "request_no",
      headerName: "SR Number",
      headerTooltip: "SR Number",
      cellRenderer: (e: any) => {
        var index = e?.value.toUpperCase();
        return index;
      },
      sortable: true,
      resizable: true,
      width: 110,
      minWidth: 110,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "notice_type",
      headerName: "Notice Type",
      headerTooltip: "Notice Type",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "closure_date",
      headerName: "Query Expected Closure Date",
      headerTooltip: "Query Expected Closure Date",
      sortable: true,
      resizable: true,
      width: 120,
      minWidth: 120,
      cellStyle: { fontSize: "13px" },
      valueFormatter: (params) => {
        if (params?.data?.closure_date !== "" || null) {
          return moment(params?.data?.closure_date).format("DD-MM-YYYY");
        }
        return "-";
      },
    },
    {
      field: "Status",
      headerName: "Status",
      headerTooltip: "Status",
      sortable: true,
      resizable: true,
      width: 110,
      minWidth: 110,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "WorkItem",
      headerName: "Stage",
      headerTooltip: "Stage",
      sortable: true,
      resizable: true,
      width: 260,
      minWidth: 260,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "pendingUserName",
      headerName: "Pending with",
      headerTooltip: "Pending with",
      sortable: true,
      resizable: true,
      width: 200,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "CityName",
      headerName: "City",
      headerTooltip: "City",
      sortable: true,
      resizable: true,
      width: 100,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "StateName",
      headerName: "State",
      headerTooltip: "State",
      sortable: true,
      resizable: true,
      width: 100,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "reported_location",
      headerName: "Location",
      headerTooltip: "Location",
      sortable: true,
      resizable: true,
      width: 100,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
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
          My Request
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
              // label='Search'
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
            {/* <Tooltip title="Export Excel" className="tooltipstyle">
              <button className="actionsIcons" >
                <AiFillFileExcel className="iconstyle" 
                    onClick={() => {
                      handleExportData();
                    }}
                  />
              </button>
            </Tooltip> */}

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
      <CommonGrid
        defaultColDef={{ flex: 1 }}
        columnDefs={columnDefs}
        rowData={myRequestData}
        onGridReady={onGridReady}
        gridRef={gridRef}
        pagination={true}
        paginationPageSize={10}
      />
    </>
  );
}

export default MyRequestList;
