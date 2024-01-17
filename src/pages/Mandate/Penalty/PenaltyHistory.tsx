import React, { useCallback, useLayoutEffect } from "react";
import Button from "@mui/material/Button";
import axios from "axios";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import HistoryIcon from "@mui/icons-material/History";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { DialogActions, Tooltip } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import moment from "moment";
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
        `${process.env.REACT_APP_BASEURL
        }/api/PenaltyDetails/GetPenaltyDetailsHistory?mandateId=${props?.data?.mandates_Id || 0
        }&penaltyId=${props?.data?.id || 0}`
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
      headerTooltip : "Serial Number",
      sortable: true,
      resizable: true,
      width: 80,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "total_TAT",
      headerName: "Total TAT",
      headerTooltip : "Total TAT",
      sortable: true,
      resizable: true,
      width: 100,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "total_Delays",
      headerName: "Total Number of delays",
      headerTooltip : "Total Number of delays",
      sortable: true,
      resizable: true,
      editable: true,
      width: 150,
      minWidth: 250,
      suppressSizeToFit: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "penalty_Matrix",
      headerName: "Penalty Matrix",
      headerTooltip : "Penalty Matrix",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        return (
          (moment(e?.data?.proposed_Start_Date).isValid() &&
            moment(e?.data?.proposed_Start_Date).format("DD/MM/YYYY")) ||
          null
        );
      },
      width: 174,
      minWidth: 174,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "penalty_Amount",
      headerName: "Penalty Amount",
      headerTooltip : "Penalty Amount",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        return (
          (moment(e?.data?.proposed_End_Date).isValid() &&
            moment(e?.data?.proposed_End_Date).format("DD/MM/YYYY")) ||
          null
        );
      },

      minWidth: 180,
      width: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "remarks",
      headerName: "Remarks",
      headerTooltip : "Remarks",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        return (
          (moment(e?.data?.actual_Start_Date).isValid() &&
            moment(e?.data?.actual_Start_Date).format("DD/MM/YYYY")) ||
          null
        );
      },
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
        title="Penalty History"
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
          Penalty History
        </DialogTitle>
        <div style={{ height: "calc(100vh - 260px)", margin: "0px 20px 0px" }}>
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
