import React, { memo } from "react";
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { GridApi } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import axios from "axios"

const PaymentTerms = ({ mandateId }) => {
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [data, setData] = React.useState<any>([])

  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }

  let columnDefs = [
    {
      field: "sequenceNo",
      headerName: "Sr. No",
      headerTooltip : "Serial Number",
      sortable: true,
      resizable: true,
      width: 115,
      minWidth: 100,      
      cellStyle: { fontSize: "13px" },

    },

    {
      field: "conditions",
      headerName: "Terms and Condition",
      headerTooltip : "Terms and Condition",
      sortable: true,
      resizable: true,
      width: 115,
      minWidth: 200,
      comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },

  ];

  const getTerms = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/ApprovalNoteTermsConditions?notetype=BOQPayment`
      )
      .then((response: any) => {
        if (response && response?.data && response?.data?.length > 0) {
          setData(response?.data);
        } else {
          setData([]);
        }
      })
      .catch((e: any) => {
      });
  };
  React.useEffect(() => {
    getTerms();
  }, []);

  return (
    <>
     
      <div className="grid-height" style={{ height: "250px", marginTop: "10px" }}>
        <CommonGrid
          defaultColDef={{ flex: 1 }}
          columnDefs={columnDefs}
          rowData={data}
          onGridReady={onGridReady}
          gridRef={gridRef}
          pagination={false}
          paginationPageSize={null} />
      </div>
    </>
  );
};
export default memo(PaymentTerms);

export function StringComparator(valueA: string = '', valueB: string = '') {
  const valueALower = valueA?.toLowerCase().trim();
  const valueBLower = valueB?.toLowerCase().trim();
  return valueALower?.localeCompare(valueBLower, 'en', { numeric: true });
}
