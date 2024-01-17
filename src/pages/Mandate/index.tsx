import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import React, { useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { TbPencil, TbTableExport } from "react-icons/tb";
import "./style.css";
import { Box, Button, Grid, IconButton, InputAdornment, TextField, Tooltip, alpha } from "@mui/material";
import { Stack } from "@mui/system";
import SearchIcon from '@mui/icons-material/Search';
import { AgGridReact } from "ag-grid-react";
import { BsHouseDoor } from "react-icons/bs";
import { getIdentifierList } from "@uikit/common/Validation/getIdentifierListMenuWise";
import moment from "moment";
import { secondaryButton } from "shared/constants/CustomColor";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch } from "react-redux";
import { AiFillFileExcel } from "react-icons/ai";
import AppTooltip from "@uikit/core/AppTooltip";


const Mandate = () => {
  const [phaseData, setPhaseData] = React.useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const apiType = location?.state?.apiType || ""
  const navigate = useNavigate();
  const getMandate = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/mandatesList?pageNumber=1&pageSize=100&sort=%7B%7D&filter=[]&apitype=${apiType || ""}`
      )
      .then((response: any) => {
        if (!response) return
        setPhaseData(response?.data || []);
      })
      .catch((e: any) => {
      });
  };
  useEffect(() => {
    getMandate();
  }, []);


  let columnDefs = [
    {
      field: "medals.bronze",
      headerName: "Actions",
      headerTooltip: "Actions",
      resizable: true,
      width: 100,
      minWidth: 100,
      pinned: "left",
      cellRenderer: (e: any) => (
        <>
          <div className="actions">
            <Tooltip title="Edit Mandate" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize">
                <TbPencil

                  onClick={() => navigate(`/mandate/${e?.data?.id}/mandate-action?source=list`)}
                />
              </button>
            </Tooltip>
            {!_validationIdentifierList?.includes('mandate_property_tagging') && <Tooltip title="Property Tagging" className="actionsIcons actionsIconsSize">
              <button className="actionsIcons">
                <BsHouseDoor

                  onClick={() => navigate(`/mandate/${e?.data?.id}/property-tagging?source=list`)}
                />
              </button>
            </Tooltip>}
          </div>
        </>
      ),
    },
    {
      field: "mandateCode",
      headerName: "Mandate Code",
      headerTooltip: "Mandate Code",
      sortable: true,
      resizable: true,
      width: 170,
      minwidth: 170,
      comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "phaseCode",
      headerName: "Phase Code",
      headerTooltip: "Phase Code",
      sortable: true,
      resizable: true,
      width: 115,
      minWidth: 100,
      comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },
    
    {
      field: "admin_vertical",
      headerName: "Admin Vertical",
      headerTooltip: "Admin Vertical",
      sortable: true,
      resizable: true,
      width: 160,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "verticalName",
      headerName: "Geo Vertical",
      headerTooltip: "Geo Vertical",
      sortable: true,
      resizable: true,
      width: 160,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "location",
      headerName: "Location Name",
      headerTooltip: "Location Name",
      sortable: true,
      resizable: true,
      width: 160,
      minWidth: 100,
      comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },
    
    {
      field: "pincode",
      headerName: "Pin Code",
      headerTooltip: "Pin Code",
      sortable: true,
      resizable: true,
      width: 90,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "city",
      headerName: "City",
      headerTooltip: "City",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "district",
      headerName: "District",
      headerTooltip: "District",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "state",
      headerName: "State",
      headerTooltip: "State",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "branchTypeName",
      headerName: "Branch Type",
      headerTooltip: "Branch Type",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "glCategoryName",
      headerName: "GL Category",
      headerTooltip: "GL Category",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "accept_Reject_Status",
      headerName: "Current Mandate Status",
      headerTooltip: "Current Mandate Status",
      sortable: true,
      resizable: true,
      minWidth: 240,
      comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "projectManagerName",
      headerName: "Project Manager Name",
      headerTooltip: "Project Manager Name",
      sortable: true,
      resizable: true,
      minWidth: 240,
      comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "mandate_ProjectDeliveryManger",
      headerName: "Project Delivery Manger",
      headerTooltip: "Project Delivery Manger",
      sortable: true,
      resizable: true,
      minWidth: 240,
      comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Initiation Date",
      headerTooltip: "Initiation Date",
      sortable: true,
      resizable: true,
      width: 140,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
      valueFormatter: params => (params?.data?.createdDate && moment(params?.data?.createdDate).isValid() && params?.data?.createdDate?.split("T")?.[0]) || null,
    },
   
  ];

  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [_validationIdentifierList, setValidationIdentifierList] = React.useState([])
  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  const onFilterTextChange = (e) => {
    gridApi?.setQuickFilter(e.target.value);
  };

  useEffect(() => {
    var _validationIdentifierList = getIdentifierList()
    setValidationIdentifierList(_validationIdentifierList)
  }, [])

  const handleExportData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/ExcelDownloadForMandtes?apitype=${apiType || ""}`
      )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "MandateData.xlsx";
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
              showMessage("Mandate Data downloaded successfully!")
            );
          }
        }
      });
  };

  return (
    <>
      {" "}

      <Grid sx={{ display: 'flex', alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
        <Box
          component="h2" className="page-title-heading"

        >
          Mandate
        </Box>
        <div className="phase-grid">
          <Stack
            display="flex"
            alignItems="flex-end"
            justifyContent="space-between"
            flexDirection="row"
            sx={{ mb: -2, marginBottom: "7px" }}
          >
            <TextField
              size="small"
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

      <CommonGrid defaultColDef={null} columnDefs={columnDefs} rowData={phaseData}
        onGridReady={onGridReady} gridRef={gridRef} pagination={true}
        paginationPageSize={10} />
    </>
  );
};

export default Mandate;
export function StringComparator(valueA: string = '', valueB: string = '') {
  const valueALower = valueA?.toLowerCase().trim();
  const valueBLower = valueB?.toLowerCase().trim();
  return valueALower.localeCompare(valueBLower, 'en', { numeric: true });
}