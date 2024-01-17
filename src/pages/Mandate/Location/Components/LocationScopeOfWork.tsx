import React, { useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import axios from "axios";
import ToggleSwitch from "@uikit/common/ToggleSwitch/ScopeOfWorkToggleSwitch";

const ScopeOfWork = ({ mandateId,
  actionName,
  locationApprovalNoteScopeData,
  setLocationApprovalNoteScopeData,
  setLocationApprovalNoteId,
  locationApprovalNoteId
}) => {
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [phaseData, setPhaseData] = React.useState([]);

  useEffect(() => {
    if (phaseData) {
      setLocationApprovalNoteScopeData(phaseData)
    }
  }, [phaseData])

  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }

  const getScope = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/LocationApprovalNoteScope?noteid=${locationApprovalNoteId || 0}&notetype=location`
      )
      .then((response: any) => {
        if (!response) return
        setPhaseData(response?.data || []);

      })
      .catch((e: any) => { });
  };
  React.useEffect(() => {
    getScope();
  }, [locationApprovalNoteId, setLocationApprovalNoteId]);


  let columnDefs = [
    {
      field: "sr.",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      sortable: true,
      resizable: true,
      maxWidth: 100,
      comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
      cellRenderer: (e1: any, data: any) => <>{e1?.data?.sequenceNo}</>,
    },
    {
      field: "scope",
      headerName: "Scope of work",
      headerTooltip: "Scope of work",
      sortable: true,
      resizable: true,
      width: 120,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "notetype",
      headerName: "Included",
      headerTooltip: "Included",
      sortable: true,
      resizable: true,
      width: 115,
      minWidth: 100,
      comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
      cellRenderer: (e1: any, data: any) => (
        <div style={{ width: "200px" }}>
          <ToggleSwitch
            alignment={phaseData?.[e1?.rowIndex]?.include === 0 ? false : true}
            handleChange={(e) => {
              var data = [...e1?.phaseData];
              data[e1?.rowIndex].include = e.target.value === "true" ? 1 : 0
              e1?.setPhaseData(data)
            }}
            yes={"Yes"}
            no={"No"}
            name={"non_budgeted"}
            id="non_budgeted"
            onBlur={() => { }}
            disabled={actionName === "Approve" || false}
          />
        </div>
      ),
      cellRendererParams: {
        mandateId: mandateId,
        phaseData: phaseData,
        setPhaseData: setPhaseData,
      },
    },
    {
      field: "remarks",
      headerName: "Remarks",
      headerTooltip: "Remarks",
      sortable: true,
      resizable: true,
      width: 100,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
  ];

  return (
    <div>
      {" "}
      <div className='grid-height' style={{ marginTop: "10px" }}>
        <CommonGrid
          defaultColDef={{ flex: 1 }}
          columnDefs={columnDefs}
          rowData={phaseData}
          onGridReady={onGridReady}
          gridRef={gridRef}
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </div>
  );
};

export default ScopeOfWork;

export function StringComparator(valueA: string = "", valueB: string = "") {
  const valueALower = valueA?.toLowerCase().trim();
  const valueBLower = valueB?.toLowerCase().trim();
  return valueALower?.localeCompare(valueBLower, "en", { numeric: true });
}
