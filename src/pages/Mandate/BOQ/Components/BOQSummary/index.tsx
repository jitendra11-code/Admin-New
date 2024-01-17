import { TextField, Grid } from "@mui/material";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import React, { memo, useEffect, useMemo } from "react";

import axios from "axios";
import { useAuthUser } from "@uikit/utility/AuthHooks";

const BOQSummary = ({
  isVendorSelected,
  mandateId,
  boq,
  setBOQ,
  approvalRole,
  setApprovalRole,
  setVendor,
  setData,
  data,
  vendor,
}) => {
  const { user } = useAuthUser();
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [totalArea, setTotalArea] = React.useState(null);
  const [totalAmount, setTotalAmount] = React.useState(null);
  const [perSqFtCost, setTotalSqFtCost] = React.useState(null);

  useMemo(() => {
    var area = boq?.totalArea;
    var _perSqFt = 0;
    if (area && parseInt(area) > 0) {
      _perSqFt = totalAmount / area;
      if (Number.isFinite(_perSqFt)) {
        setTotalSqFtCost(_perSqFt || 0);
        setBOQ((state) => ({
          ...state,
          perSqFtCost: _perSqFt || 0,
        }));

        return;
      }
      setBOQ((state) => ({
        ...state,
        perSqFtCost: 0,
      }));
    }
    setBOQ((state) => ({
      ...state,
      perSqFtCost: 0,
    }));
  }, [totalAmount, boq?.totalArea]);

  const _generatePerSqFtCost = (area) => {
    var _perSqFt = 0;
    if (area && parseInt(area) > 0) {
      _perSqFt = totalAmount / area;
      if (Number.isFinite(_perSqFt)) {
        setTotalSqFtCost(_perSqFt || 0);
        setBOQ((state) => ({
          ...state,
          perSqFtCost: _perSqFt || 0,
        }));

        return;
      }
      setBOQ((state) => ({
        ...state,
        perSqFtCost: 0,
      }));
    }
    setBOQ((state) => ({
      ...state,
      perSqFtCost: 0,
    }));
  };

  useEffect(() => {
    var _totalAmount = 0;
    if (data && data?.length > 0) {
      data &&
        data?.map((item) => {
          if (item?.Nature_Of_work === "TOTAL AMOUNT") {
            setTotalAmount(item?.amount || 0);
            setBOQ((state) => ({
              ...state,
              totalAmount: item?.amount || 0,
            }));
          }
        });
    }
  }, [data]);
  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  let columnDefs = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        var _type = e?.data?.Nature_Of_work;
        if (_type === "TOTAL AMOUNT") {
          return "";
        }
        return index + 1;
      },
      sortable: true,
      resizable: true,
      width: 80,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "Nature_Of_work",
      headerName: "Nature Of Works",
      headerTooltip: "Nature Of Works",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 100,
      cellStyle: (e: any) => {
        var index = e?.rowIndex;
        var _type = e?.data?.Nature_Of_work;
        if (_type === "TOTAL AMOUNT") {
          return { fontSize: "13px", fontWeight: 400 };
        }
        return { fontSize: "13px" };
      },
    },
    {
      field: "no_of_item",
      headerName: "Total No Of Items",
      headerTooltip: "Total Number Of Items",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        if (e?.data?.no_of_item && typeof e?.data?.no_of_item !== "object") {
          return e?.data?.no_of_item;
        } else {
          return "";
        }
      },

      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "amount",
      headerName: "Total Amount",
      headerTooltip: "Total Amount",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        if (e?.data?.amount && typeof e?.data?.amount !== "object") {
          return e?.data?.amount;
        } else {
          return "";
        }
      },
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
  ];

  const getBOQSummary = async () => {
    if (approvalRole) {
      if (boq?.boqId !== undefined && boq?.boqId !== 0)
        await axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/BOQ/GetBOQSummery?mandateid=${mandateId?.id || 0
            }&boqId=${boq?.boqId || 0}`
          )
          .then((response: any) => {
            if (!response) return;
            if (response && response?.data && response?.data?.length > 0) {
              setData(response?.data || []);
            } else {
              setData([]);
            }
          })
          .catch((e: any) => { });
    } else {
      await axios
        .get(
          `${process.env.REACT_APP_BASEURL}/api/BOQ/GetBOQSummery?mandateid=${mandateId?.id || 0
          }&boqId=${boq?.boqId || 0}`
        )
        .then((response: any) => {
          if (!response) return;
          if (response && response?.data && response?.data?.length > 0) {
            setData(response?.data || []);
          } else {
            setData([]);
          }
        })
        .catch((e: any) => { });
    }
  };
 
  return (
    <>
    
      <div style={{ height: "150px", marginTop: "10px", marginBottom: "10px" }}>
        {(approvalRole
          ? isVendorSelected?.length > 0
            ? true
            : false
          : true) && (
            <CommonGrid
              rowHeight={30}
              defaultColDef={{ flex: 1 }}
              columnDefs={columnDefs}
              rowData={data || []}
              onGridReady={onGridReady}
              gridRef={gridRef}
              pagination={false}
              paginationPageSize={null}
            />
          )}
      </div>
      <Grid
        marginBottom="10px"
        container
        item
        spacing={5}
        justifyContent="start"
        alignSelf="center"
        sx={{ paddingTop: "0px!important" }}
      >
        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
          <div className="input-form">
            <h2 className="phaseLable">Total Area</h2>
            <TextField
              autoComplete="off"
              name="totalArea"
              disabled={approvalRole}
              type="number"
              value={boq?.totalArea || ""}
              onChange={(e: any) => {
                if (e?.target?.value === "0") {
                  e.preventDefault();
                  return;
                }
                setBOQ((state) => ({
                  ...state,
                  totalArea: e?.target?.value || "",
                }));
              }}
              onBlur={(e) => {
                _generatePerSqFtCost(e.target.value);
              }}
              onKeyDown={(event) => {
                if (event?.key === "-" || event?.key === "--") {
                  event.preventDefault();
                }
              }}
              onWheel={(e) =>
                e.target instanceof HTMLElement && e.target.blur()
              }
              id="catalogueId"
              size="small"
            />
          </div>
        </Grid>

        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
          <div className="input-form">
            <h2 className="phaseLable">Per Sq.ft Cost</h2>
            <TextField
              autoComplete="off"
              name="perSqFtCost"
              id="perSqFtCost"
              value={boq?.perSqFtCost || ""}
              type="text"
              disabled
              variant="outlined"
              size="small"
              className="w-85"
            />
          </div>
        </Grid>
      </Grid>
    </>
  );
};
export default memo(BOQSummary);
