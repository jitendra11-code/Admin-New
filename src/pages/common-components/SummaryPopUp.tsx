import { Button, Grid } from "@mui/material";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import { primaryButtonSm } from "shared/constants/CustomColor";

const   SummaryDetailsPopOP = () => {
  const gridRef = React.useRef<AgGridReact>(null);
  const [showPanel, togglePanel] = useState(true);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  let columnDefs = [
    {
      field: "documenttype",
      headerName: "Field",
      headerTooltip: "Field",
      sortable: true,
      resizable: true,
     
      width: 400,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "filename",
      headerName: "New Value",
      headerTooltip: "New Value",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.filename;
        data = data?.split(".");
        data = data?.[0];
        return data || "";
      },
      width: 400,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "srno",
      headerName: "Previous Value",
      headerTooltip: "Previous Value",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      width: 80,
      minWidth: 70,
      cellStyle: { fontSize: "13px" },
    },
  ];
  let columnDefsTwo = [
    {
      field: "documenttype",
      headerName: "Field",
      headerTooltip: "Field",
      sortable: true,
      resizable: true,
     
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "filename",
      headerName: "Value",
      headerTooltip: "Value",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.filename;
        data = data?.split(".");
        data = data?.[0];
        return data || "";
      },
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "srno",
      headerName: "Action",
      headerTooltip: "Action",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      width: 80,
      minWidth: 70,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "srno",
      headerName: "Action By",
      headerTooltip: "Action By",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      width: 80,
      minWidth: 70,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "srno",
      headerName: "Action on",
      headerTooltip: "Action on",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      width: 80,
      minWidth: 70,
      cellStyle: { fontSize: "13px" },
    },
  ];
  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  return (
    <>
      <div style={{ width: "71vw" }}>
        <div
          className="card-panal inside-scroll-time-line"
          style={{ padding: "3px 20px 15px" }}
        >
          <Grid
            marginTop="5px"
            container
            item
            spacing={5}
            justifyContent="end"
            alignSelf="end"
          >
            <Button
              size="small"
              style={primaryButtonSm}
              sx={{ color: "#fff", fontSize: "12px", marginRight: "10px" }}
              onClick={() => togglePanel(!showPanel)}
            >
              {showPanel ? <span>Summary </span> : <span> Details </span>}
            </Button>
          </Grid>

          {showPanel ? (
            <div style={{ height: "calc(100vh - 438px)", marginTop: "20px" }}>
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
          ) : (
            <div style={{ height: "calc(100vh - 438px)", marginTop: "20px" }}>
              <CommonGrid
                defaultColDef={{ flex: 1 }}
                columnDefs={columnDefsTwo}
                rowData={[]}
                onGridReady={onGridReady}
                gridRef={gridRef}
                pagination={false}
                paginationPageSize={null}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default SummaryDetailsPopOP;
