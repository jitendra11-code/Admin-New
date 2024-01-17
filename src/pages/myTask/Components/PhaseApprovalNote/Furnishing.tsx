import React from 'react'
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import { useNavigate } from 'react-router-dom';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import axios from "axios";


const Furnishing = ({ mandateId }) => {


  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [phaseData, setPhaseData] = React.useState([]);
  const navigate = useNavigate()
  const getData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/GetMandateWiseApprovalNoteBudget?mandateid=${mandateId?.id}&notetype=Phase`
      )
      .then((response) => {
        if (!response?.data) return;
        if (response?.data && response?.data?.length) {
          setPhaseData(response?.data);
        }
      });
  };
  React.useEffect(() => {
    if (mandateId !== null && mandateId?.id !== undefined) {
      getData();
    }
  }, [mandateId]);

  function onGridReady(params) {

    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }

  let columnDefs = [

    {
      field: "seq",
      headerName: "Sr. No",
      headerTooltip : "Serial Number",
      sortable: true,
      resizable: true,
      width: 90,
      minWidth: 80,
      comparator: StringComparator,
      cellClass: 'grid_border',
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Mandate_Code",
      headerName: "Mandate Code",
      headerTooltip : "Mandate Code",
      sortable: true,
      resizable: true,
      width: 170,
      minWidth: 170,
      comparator: StringComparator,
      cellClass: 'grid_border',
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Admin_Vertical",
      headerName: "Admin Vertical",
      headerTooltip : "Admin Vertical",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      comparator: StringComparator,
      cellClass: 'grid_border',
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Branch_Name",
      headerName: "Branch Type",
      headerTooltip : "Branch Type",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      comparator: StringComparator,
      cellClass: 'grid_border',
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "State",
      headerName: "State",
      headerTooltip : "State",
      sortable: true,
      resizable: true,
      width: 130,
      minWidth: 130,
      cellClass: 'grid_border',
      cellStyle: { fontSize: "13px" },
    },   
    {
      field: "District",
      headerName: "District",
      headerTooltip : "District",
      sortable: true,
      resizable: true,
      width: 130,
      minWidth: 130,
      cellClass: 'grid_border',
      cellStyle: { fontSize: "13px" },
    },   
    {
      field: "Location",
      headerName: "Location",
      headerTooltip : "Location",
      sortable: true,
      resizable: true,
      width: 130,
      minWidth: 130,
      cellClass: 'grid_border',
      cellStyle: { fontSize: "13px" },
    },   
    // {
    //   field: "GL_Category",
    //   headerName: "Main Gold/Non Gold",
    //   headerTooltip : "Main Gold/Non Gold",
    //   sortable: true,
    //   resizable: true,
    //   width: 115,
    //   minWidth: 100,
    //   comparator: StringComparator,
    //   cellClass: 'grid_border',
    //   cellStyle: { fontSize: "13px" },
    // },
    {
      field: "Chargeable_Area",
      headerName: "Branch Area SFT From",
      headerTooltip : "Branch Area SFT From",
      sortable: true,
      resizable: true,
      width: 200,
      minWidth: 200,
      cellClass: (params)=> {
        var currentIndex = params?.rowIndex;
        if (params?.data?.Chargeable_Area > params?.data?.Carpet_Area) {
          return "cell-padding rag-red";
        }
      },
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Carpet_Area",
      headerName: "Branch Area SFT To",
      headerTooltip : "Branch Area SFT To",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellClass: 'grid_border',
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Furnishing_Cost",
      headerName: "Furnishing Cost /SFT",
      headerTooltip : "Furnishing Cost /SFT",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      comparator: StringComparator,
      cellClass: 'grid_border',
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Furnishing_amount",
      headerName: "Total Furnishing Cost",
      headerTooltip : "Total Furnishing Cost",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellClass: 'grid_border',
      cellStyle: { fontSize: "13px" },
    },
  ];
  return (
    <>
    <div className='grid-height' style={{ marginTop: "10px" }}>
      <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs}
        rowData={phaseData} onGridReady={onGridReady} gridRef={gridRef}
        pagination={true}
        paginationPageSize={10} />
      
    </div>
    </>
  )
}

export default Furnishing

export function StringComparator(valueA: string = '', valueB: string = '') {
  const valueALower = valueA?.toLowerCase().trim();
  const valueBLower = valueB?.toLowerCase().trim();
  return valueALower?.localeCompare(valueBLower, 'en', { numeric: true });
}