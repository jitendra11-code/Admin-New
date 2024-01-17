import React from "react";
import {
  Button,
  TextField,
  Grid,
  Tooltip,
} from "@mui/material";
import { submit } from "shared/constants/CustomColor";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import { TbPencil } from "react-icons/tb";
import { AiOutlineDelete } from "react-icons/ai";

const PenaltyDetails = () => {
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  let columnDefs = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip : "Serial Number",
      flex: 1,
      maxWidth: 80,

      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "srno",
      headerName: "Total TAT",
      headerTooltip : "Total TAT",
      flex: 1,
      maxWidth: 200,

      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "reporttype",
      headerName: "Total Number of delays",
      headerTooltip : "Total Number of delays",
      sortable: true,
      resizable: true,
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "filename",
      headerName: "penalty Matrix",
      headerTooltip : "Penalty Matrix",
      sortable: true,
      resizable: true,
      
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "remark",
      headerName: "penalty Amount",
      headerTooltip : "Penalty Amount",
      sortable: true,
      resizable: true,
      
      maxWidth: 220,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      headerTooltip : "Created Date",
      sortable: true,
      resizable: true,
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
            <button className="actionsIcons actions-icons-size">
              <TbPencil />
            </button>
            <button className="actionsIcons-delete actions-icons-size">
              <AiOutlineDelete />
            </button>
            <Tooltip title="Edit Phase" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize">
                <TbPencil
                />
              </button>
            </Tooltip>
          </div>
        </>
      ),

      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Action",
      headerTooltip : "Action",
      sortable: true,
      resizable: true,
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
  ];
  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  return (
    <div>
      <Grid
        container
        item
        display="flex"
        flexDirection="row"
        spacing={5}
        justifyContent="start"
        alignSelf="center"
      >
        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
          <div className="input-form">
            <h2 className="phaseLable">Total TAT</h2>
            <TextField
              name="district"
              id="district"
              variant="outlined"
              size="small"
              className="w-85"
            
            />
         
          </div>
        </Grid>
        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
          <div className="input-form">
            <h2 className="phaseLable"> Total Number of delays</h2>
            <TextField
              name="district"
              id="district"
              variant="outlined"
              size="small"
              className="w-85"
           
            />
          
          </div>
        </Grid>
        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
          <div className="input-form">
            <h2 className="phaseLable"> penalty Matrix</h2>
            <TextField
              name="district"
              id="district"
              variant="outlined"
              size="small"
              className="w-85"
           
            />
         
          </div>
        </Grid>
        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
          <div className="input-form">
            <h2 className="phaseLable"> penalty Amount</h2>
            <TextField
              name="district"
              id="district"
              variant="outlined"
              size="small"
              className="w-85"
           
            />
           
          </div>
        </Grid>
        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
          <div className="input-form">
            <h2 className="phaseLable"> Remarks</h2>
            <TextField
              name="district"
              id="district"
              variant="outlined"
              size="small"
              className="w-85"
            />
          
          </div>
        </Grid>
      </Grid>
      <div style={{ height: "calc(100vh - 465px)", marginTop: "10px" }}>
        <CommonGrid
          defaultColDef={{ flex: 1 }}
          columnDefs={columnDefs}
          rowData={[]}
          onGridReady={onGridReady}
          gridRef={gridRef}
          pagination={false}
          paginationPageSize={null}
        />
      </div>
      <div className="bottom-fix-btn">
        <div className="remark-field">
          <Button
            variant="contained"
            size="small"
            style={submit}
          >
            SUBMIT
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PenaltyDetails;
