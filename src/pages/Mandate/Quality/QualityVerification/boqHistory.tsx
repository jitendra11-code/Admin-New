import React from "react";
import Button from "@mui/material/Button";
import axios from "axios";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import HistoryIcon from "@mui/icons-material/History";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { DialogActions, Tooltip } from "@mui/material";
import { AgGridReact } from "ag-grid-react";

const ProjectPlanHistoryData = ({ props }) => {
  const [open, setOpen] = React.useState(false);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const [paneltyHistoryData, setPaneltyHistoryData] = React.useState([]);

  React.useEffect(() => {
    if (!open) return;
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/BOQ/GetBOQDetailsHistoryByBOQDetailId?boqDetailsId=${props?.data?.id}`
      )
      .then((res) => {
        if (!res) return;
        if (res && res?.data && res?.data?.length > 0) {
          var _resData = (res && res?.data) || [];
          setPaneltyHistoryData(_resData || []);
        } else {
          setPaneltyHistoryData([]);
        }
      })
      .catch((err) => { });
  }, [props?.data, open]);

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  let columnDefs = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      sortable: true,
      resizable: true,
      width: 80,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
      cellRenderer: (e: any) => {
        var index = e?.rowIndex
        return index + 1;
    },
    },
    {
      field: "material_Category",
      headerName: "Material Category",
      headerTooltip: "Material Category",
      sortable: true,
      resizable: true,
      width: 100,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "item_Description",
      headerName: "Item Description",
      headerTooltip: "Item Description",
      sortable: true,
      resizable: true,
      editable: true,
      width: 150,
      minWidth: 250,
      suppressSizeToFit: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "quantity",
      headerName: "Quantity ",
      headerTooltip: "Quantity",
      sortable: true,
      resizable: true,
      width: 174,
      minWidth: 174,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "actual_Unit",
      headerName: "Actual Quantity",
      headerTooltip: "Actual Quantity",
      sortable: true,
      resizable: true,

      minWidth: 180,
      width: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "auditor_Comments",
      headerName: "Auditor Comments",
      headerTooltip: "Auditor Comments",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,

      cellStyle: { fontSize: "13px" },
    },
    {
      field: "remarks",
      headerName: "Remarks",
      headerTooltip: "Remarks",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,

      cellStyle: { fontSize: "13px" },
    },
  ];

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    params.api.sizeColumnsToFit();
  }

  return (
    <>
      <Tooltip
        className="actionsIcons"
        id={`${props?.data?.id}_project`}
        title="BOQ History"
      >
        <HistoryIcon
          style={{ cursor: "pointer", fontSize: "20px", color: "#000" }}
          onClick={handleOpen}
          className="actionsIcons"
        />
      </Tooltip>
      <Dialog
        fullWidth
        maxWidth="xl"
        open={open}
        onClose={handleClose}
      >
        <DialogTitle style={{ paddingRight: 20, fontSize: 16, color: "#000" }}>
          BOQ History
        </DialogTitle>
        <div style={{ height: "calc(100vh - 260px)", margin: "0px 20px 0px", overflow: "hidden" }}>
          <CommonGrid
            rowHeight={50}
            defaultColDef={{
              flex: 1,
            }}
            columnDefs={columnDefs}
            rowData={paneltyHistoryData || []}
            onGridReady={onGridReady}
            gridRef={gridRef}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
        <DialogActions className="button-wrap">
          <Button className="yes-btn" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default ProjectPlanHistoryData;
