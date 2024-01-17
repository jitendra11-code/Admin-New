import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TbPencil } from "react-icons/tb";
import "./style.css";
import { Box,  Grid, InputAdornment, TextField, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import SearchIcon from '@mui/icons-material/Search';
import { AgGridReact } from "ag-grid-react";

const Mandate = () => {
  const [phaseData, setPhaseData] = React.useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const navigate = useNavigate();

  const getMandate = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/mandatesList?pageNumber=1&pageSize=100&sort=%7B%7D&filter=[]`
      )
      .then((response: any) => {
        setPhaseData(response.data);
      })
      .catch((e: any) => {
      });
  };
  useEffect(() => {
    getMandate();
  }, []);

  let rowData: any = [
    {
      id: 35,
      country: "India",
      vertical: "Urban Metro",
      name: "Phase 1",
      branches: "10",
      completion: "20",
      status: "Inprogess",
    },
  ];

  let columnDefs = [
    {
      field: "medals.bronze",
      headerName: "Action",
      headerTooltip : "Action",
      resizable: true,
      width: 90,
      minWidth: 90,
      pinned: "left",
      cellRenderer: (e: any) => (
        <>
          <div className="actions">
            <Tooltip title="Edit Mandate" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize">
                <TbPencil

                  onClick={() => {
                    var action = e?.data?.action || "";
                    var runtimeId = e?.data?.runtimeId || 0;
                    var url = e?.data?.url || "";
                    navigate(`/${url}/${e?.data?.id}?action=${action}&&runtimeId=${runtimeId}`)
                  }}
                />
              </button>
            </Tooltip>
          </div>
        </>
      ),
    },
    {
      field: "mandateCode",
      headerName: "Mandate Code",
      headerTooltip : "Mandate Code",
      sortable: true,
      resizable: true,
      width: 140,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "phaseCode",
      headerName: "Phase Code",
      headerTooltip : "Phase Code",
      sortable: true,
      resizable: true,
      width: 120,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "verticalName",
      headerName: "Vertical",
      headerTooltip : "Vertical",
      sortable: true,
      resizable: true,
      width: 160,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "location",
      headerName: "Location Name",
      headerTooltip : "Location Name",
      sortable: true,
      resizable: true,
      width: 140,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "glCategoryName",
      headerName: "GL Category",
      headerTooltip : "GL Category",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "pincode",
      headerName: "Pin Code",
      headerTooltip : "Pin Code",
      sortable: true,
      resizable: true,
      width: 90,
      minWidth: 70,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "branchTypeName",
      headerName: "Branch Type",
      headerTooltip : "Branch Type",
      sortable: true,
      resizable: true,
      width: 130,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Initiation Date",
      headerTooltip : "Initiation Date",
      sortable: true,
      resizable: true,
      width: 130,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
      valueFormatter: params => {
        return params?.data?.createdDate?.split("T")[0];
      }
    },
    {
      field: "status",
      headerName: "Status",
      headerTooltip : "Status",
      sortable: true,
      resizable: true,
      width: 120,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "completionPer",
      headerName: "% Completion",
      headerTooltip : "% Completion",
      sortable: true,
      resizable: true,
      width: 130,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
  ];

  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);

  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
  }

  const onFilterTextChange = (e) => {
    gridApi?.setQuickFilter(e.target.value);
  };

  return (
    <>
      <Grid sx={{ display: 'flex', alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
        <Box
          component="h2"
          sx={{
            fontSize: 15,
            color: "text.primary",
            fontWeight: "600",
            marginBottom: "0 !important",
            mb: {
              xs: 2,
              lg: 2,
            },
          }}
        >
          Mandate
        </Box>
        <Stack
          display='flex'
          alignItems='flex-end'
          justifyContent='space-between'
        >
          <TextField
            size='small'
            variant='outlined'
            name='search'
            onChange={(e) => onFilterTextChange(e)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Grid>

      <CommonGrid defaultColDef={null} columnDefs={columnDefs} rowData={phaseData}
        onGridReady={onGridReady} gridRef={gridRef} pagination={true}
        paginationPageSize={10} />
    </>
  );
};

export default Mandate;
