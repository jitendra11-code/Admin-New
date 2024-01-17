import { Grid, Stack, TextField, InputAdornment, Tooltip, IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import SearchIcon from "@mui/icons-material/Search";
import React, { useEffect, useState } from "react";
import { TbPencil } from "react-icons/tb";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { GridApi } from "ag-grid-community";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import { useDispatch } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { store } from "redux/store";
import { useUrlSearchParams } from "use-url-search-params";
import { getIdentifierList } from "@uikit/common/Validation/getIdentifierListMenuWise";
import { AiFillFileExcel } from "react-icons/ai";
import AppTooltip from "@uikit/core/AppTooltip";
function IntimationRequestList() {
  const [intimationData, setIntimationData] = React.useState<any>([]);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const [_validationIdentifierList, setValidationIdentifierList] =
    React.useState([]);
  const [params]: any = useUrlSearchParams({}, {});
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    var _validationIdentifierList = getIdentifierList()
    setValidationIdentifierList(
      _validationIdentifierList?.map((v: any) => v.trim()) || []
    );
  }, [])

  useEffect(() => {
    if (gridApi) {
      gridApi!.sizeColumnsToFit();
    }
  }, [intimationData]);

  const handleExportData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetExcelDownload?apiType=ViewRequest`
      )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "ViewRequest.xlsx";
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
              showMessage("ViewRequest downloaded successfully!")
            );
          }
        }
      });
  };

  const getIntimation = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetComplianceIntimationRequest?fk_stage_id=&fromInspectionDate=&toInspectionDate=&fromClosureDate=&toClosureDate=&branch_code=`
      )
      .then((response: any) => {
        setIntimationData(response.data);
      })
      .catch((e: any) => { });
  };
  useEffect(() => {
    getIntimation();
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
      width: 100,
      minWidth: 100,
      pinned: "left",
      cellRenderer: (e: any) => (
        <>
          <div className="actions">
            {/* <Tooltip title="Edit Request" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize"
                hidden={_validationIdentifierList.includes("request_edit_icon")}
              >
                <TbPencil
                  onClick={() =>
                    navigate(
                      `/intimation/${e?.data?.id}/create-request?action=update`
                    )
                  }
                />
              </button>
            </Tooltip> */}
            <Tooltip
              title="View Request"
              className="actionsIcons actionsIconsSize"
            >
              <button className="actionsIcons actionsIconsSiz">
                <VisibilityIcon
                  style={{ fontSize: "15px" }}
                  onClick={() =>
                    navigate(
                      `/intimation/${e?.data?.id}/create-request?action=view`
                    )
                  }
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
      headerTooltip: "Serial Number",
      cellRenderer: (e: any) => {
        var index = e?.value.toUpperCase();
        return index;
      },
      sortable: true,
      resizable: true,
      width: 100,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "noticeType",
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
        if (params?.data?.closure_date !== null) {
          return moment(params?.data?.closure_date).format("DD-MM-YYYY");
        }
        return "-";
      },
    },
    {
      field: "status",
      headerName: "Status",
      headerTooltip: "Status",
      sortable: true,
      resizable: true,
      width: 140,
      minWidth: 140,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "current_status",
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
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "city",
      headerName: "City",
      headerTooltip: "City",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "state",
      headerName: "State",
      headerTooltip: "State",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "reported_location",
      headerName: "Location",
      headerTooltip: "Location",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
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
          View Request
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
      <CommonGrid
        defaultColDef={{ flex: 1 }}
        columnDefs={columnDefs}
        rowData={intimationData}
        onGridReady={onGridReady}
        gridRef={gridRef}
        pagination={true}
        paginationPageSize={10}
      />
    </>
  );
}

export default IntimationRequestList;
