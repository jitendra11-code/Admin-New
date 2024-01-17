import React from 'react'
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import { useNavigate } from 'react-router-dom';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';


const Annexure = () => {
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [phaseData, setPhaseData] = React.useState([
    {
      sr: "1",
      title: "Mandate email communication",
    },
    {
      sr: "2",
      title: "DOA copy"
    },
    {
      sr: "3",
      title: "List of basic infra items - vetted by purchase team"
    },

  ]);
  const navigate = useNavigate()

  function onGridReady(params) {

    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }

  let columnDefs = [
    {
      field: "sr",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      sortable: true,
      resizable: true,
      width: 10,
      minWidth: 10,
      maxWidth: 100,
      comparator: StringComparator,
      cellStyle: { fontSize: "13px" },

    },
    {
      field: "title",
      headerName: "Annexure / Attachments",
      headerTooltip: "Annexure / Attachments",
      sortable: true,
      resizable: true,
      width: 115,
      minWidth: 80,
      comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },

  ];
  return (
    <div className='grid-height' style={{ marginTop: "10px" }}>
      <CommonGrid defaultColDef={{ flex: 1 }}
        columnDefs={columnDefs}
        rowData={phaseData} onGridReady={onGridReady} gridRef={gridRef}
        pagination={true}
        paginationPageSize={10} />
    </div>)
}

export default Annexure

export function StringComparator(valueA: string = '', valueB: string = '') {
  const valueALower = valueA?.toLowerCase().trim();
  const valueBLower = valueB?.toLowerCase().trim();
  return valueALower?.localeCompare(valueBLower, 'en', { numeric: true });
}