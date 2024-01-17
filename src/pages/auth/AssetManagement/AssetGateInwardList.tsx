import {
  Grid,
  Stack,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  Button
} from "@mui/material";
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
import { primaryButtonSm } from 'shared/constants/CustomColor';

function AssetGateInwardList() {
  const [assetData, setAssetData] = React.useState<any>([]);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const [_validationIdentifierList, setValidationIdentifierList] =
    React.useState([]);
  const [params]: any = useUrlSearchParams({}, {});
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    var _validationIdentifierList = getIdentifierList();
    setValidationIdentifierList(
      _validationIdentifierList?.map((v: any) => v.trim()) || []
    );
  }, []);

  useEffect(() => {
    if (gridApi) {
      gridApi!.sizeColumnsToFit();
    }
  }, [assetData]);

  const handleExportData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/AssetGatePass/GetExcelForAssetInward`
      )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "AssetInwardList.xlsx";
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

            dispatch(showMessage("Asset Inward List downloaded successfully!"));
          }
        }
      });
  };

  const getAssetList = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/AssetGatePass/GetAllAssetInwardDetails?Id=&RequestId=`
      )
      .then((response: any) => {
        console.log("abc", response?.data);
        setAssetData(response.data);
      })
      .catch((e: any) => { });
  };
  useEffect(() => {
    getAssetList();
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
            <Tooltip title="Edit Asset Inward" className="actionsIcons">
              <button
                className="actionsIcons actionsIconsSize"
                hidden={_validationIdentifierList.includes("request_edit_icon")}
              >
                <TbPencil
                  onClick={() =>
                    // console.log("eval",e)
                    navigate(
                      `/${e?.data?.id}/AssetInward`
                      // `/${e?.data?.id}/asset-gate-pass?action=update`
                    )
                  }
                />
              </button>
            </Tooltip>
            {/* <Tooltip
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
            </Tooltip> */}
          </div>
        </>
      ),
    },
    {
      field: "gate_pass_no",
      headerName: "Gate Pass Number",
      headerTooltip: "Gate Pass Number",
      cellRenderer: (e: any) => {
        var index = e?.value.toUpperCase();
        return index;
      },
      sortable: true,
      resizable: true,
      width: 200,
      //   minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "requestNo",
      headerName: "Request Number",
      headerTooltip: "Request Number",
      sortable: true,
      resizable: true,
      width: 180,
      // minWidth: 180,
      valueFormatter: (params) => {
        console.log("params", params?.data?.assetRequests?.[0]?.requestNo)
        if (params?.data?.assetRequests?.[0]?.requestNo !== null) {
          return params?.data?.assetRequests?.[0]?.requestNo
        }
      },
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "inward_ackn_on",
      headerName: "Acknowledgement Date & Time",
      headerTooltip: "Acknowledgement Date & Time",
      sortable: true,
      resizable: true,
      width: 160,
      minWidth: 160,
      cellStyle: { fontSize: "13px" },
      valueFormatter: (params) => {
        if (params?.data?.inward_ackn_on !== null) {
          return moment(params?.data?.inward_ackn_on).format("DD/MM/YYYY HH:mm:ss");
        }
        return "-";
      },
    },
    {
      field: "gate_pass_date",
      headerName: "Gate Pass Date",
      headerTooltip: "Gate Pass Date",
      sortable: true,
      resizable: true,
      width: 150,
      // minWidth: 120,
      cellStyle: { fontSize: "13px" },
      valueFormatter: (params) => {
        if (params?.data?.gate_pass_date !== null) {
          return moment(params?.data?.gate_pass_date).format("DD-MM-YYYY");
        }
        return "-";
      },
    },
    {
      field: "gate_pass_type",
      headerName: "Gate Pass Type",
      headerTooltip: "Gate Pass Type",
      sortable: true,
      resizable: true,
      width: 220,
      // minWidth: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "purpose",
      headerName: "Purpose Of Movement",
      headerTooltip: "Purpose Of Movement",
      sortable: true,
      resizable: true,
      width: 180,
      //   minWidth: 140,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "asset_type",
      headerName: "Asset Type",
      headerTooltip: "Asset Type",
      sortable: true,
      resizable: true,
      width: 150,
      // minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "status",
      headerName: "Status",
      headerTooltip: "Status",
      sortable: true,
      resizable: true,
      width: 150,
      // minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "retun_date",
      headerName: "Date Of Return",
      headerTooltip: "Date Of Return",
      sortable: true,
      resizable: true,
      width: 120,
      // minWidth: 120,
      cellStyle: { fontSize: "13px" },
      valueFormatter: (params) => {
        if (params?.data?.retun_date !== null) {
          return moment(params?.data?.retun_date).format("DD-MM-YYYY");
        }
        return "-";
      },
    },
    // {
    //   field: "reported_location",
    //   headerName: "Location",
    //   headerTooltip: "Location",
    //   sortable: true,
    //   resizable: true,
    //   width: 180,
    //   minWidth: 180,
    //   cellStyle: { fontSize: "13px" },
    // },
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
          Asset Gate Inward List
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
            <Tooltip title="Add New">
              <Button
                size="small"
                style={primaryButtonSm}
                sx={{ color: "#fff", fontSize: "12px" }}
                onClick={() => navigate("/noid/AssetInward")}
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
        rowData={assetData}
        onGridReady={onGridReady}
        gridRef={gridRef}
        pagination={true}
        paginationPageSize={10}
      />
    </>
  );
}

export default AssetGateInwardList;
