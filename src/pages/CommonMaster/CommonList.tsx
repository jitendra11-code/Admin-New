import React, { useEffect, useMemo, useState } from "react";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import {
  Stack,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { primaryButtonSm } from "shared/constants/CustomColor";
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import { TbPencil } from "react-icons/tb";
import axios from "axios";
import moment from "moment";
import { useDispatch } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import SearchIcon from '@mui/icons-material/Search';
import AppTooltip from "@uikit/core/AppTooltip";
import { AiFillFileExcel } from "react-icons/ai";

export default function CommonList() {
  const gridRef = React.useRef<AgGridReact>(null);
  const gridRef2 = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [gridApi2, setGridApi2] = React.useState<GridApi | null>(null);
  const [AllTypes, setAllTypes] = useState([]);
  const [selectedLeftsideData, setSelectedLeftsideData] = useState<any>({})
  const [RightListData, setRightListData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedActiveRows, setSelectedActiveRows] = useState([]);
  const [selectedInActiveRows, setSelectedInActiveRows] = useState([]);
  const [selectedPendingRows, setSelectedPendingRows] = useState([]);
  const [flag, setFlag] = useState(false);
  const dispatch = useDispatch();

  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }
  function onGridReady2(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }

  const onFilterTextChange = async (e) => {
    gridApi?.setQuickFilter(e.target.value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"));
    }
  };

  // const handleRowSelected = () => {
  //     if (gridRef2.current && gridRef2.current.api) {
  //       const selectedNodes = gridRef2.current.api.getSelectedNodes();
  //       const selectedData = selectedNodes.map((node) => node.data);
  //       setSelectedRows(selectedData);
  //     }
  // };

  //   const handleRowSelected = () => {
  //     // debugger
  //     if (gridRef2.current && gridRef2.current.api) {
  //         const selectedNodes = gridRef2.current.api.getSelectedNodes();
  //         const selectedData = selectedNodes.map((node) => node.data);

  //         // Check if all selected rows have the same status as 'Active'
  //         const allSelectedStatuses = selectedData.map((item) => item.status);
  //         const uniqueStatuses = [...new Set(allSelectedStatuses)];

  //         if (uniqueStatuses.length === 1 && uniqueStatuses[0] === "Active") {
  //           setSelectedRows(selectedData);
  //           setSelectedActiveRows(selectedData)
  //         }
  //         else if (uniqueStatuses.length === 1 && uniqueStatuses[0] === "In Active") {
  //           setSelectedRows(selectedData);
  //           setSelectedInActiveRows(selectedData)
  //         }
  //         else if (uniqueStatuses.length === 1 && uniqueStatuses[0] === "Pending") {
  //           setSelectedRows(selectedData);
  //           setSelectedPendingRows(selectedData)
  //         }
  //         // else if(flag === false){
  //         //   dispatch(fetchError("You can only select same status."));
  //         //   gridRef2.current.api.deselectAll();
  //         //   setSelectedInActiveRows([])
  //         //   setSelectedActiveRows([])
  //         //   setSelectedPendingRows([]);
  //         // }
  //         // else{
  //         //   // dispatch(fetchError("You can only select same status."));
  //         //   setFlag(false)
  //         //   gridRef2.current.api.deselectAll();
  //         //   setSelectedInActiveRows([])
  //         //   setSelectedActiveRows([])
  //         //   setSelectedPendingRows([]);
  //         // }
  //         else if (selectedData.length > 0) {
  //           // User selected rows with different statuses, show error message and deselect all rows
  //           dispatch(fetchError("You can only select rows with the same status."));
  //           gridRef2.current.api.deselectAll();
  //           setSelectedInActiveRows([]);
  //           setSelectedActiveRows([]);
  //           setSelectedPendingRows([]);
  //           // setFlag(false); // Set flag to false since rows with different statuses were selected
  //         } else {
  //           // All rows are deselected, reset everything
  //           setSelectedRows([]);
  //           setSelectedActiveRows([]);
  //           setSelectedInActiveRows([]);
  //           setSelectedPendingRows([]);
  //           // setFlag(false); // Set flag to false since all rows are deselected
  //         }
  //     }
  // };

  const handleRowSelected = () => {
    // debugger
    if (gridRef2.current && gridRef2.current.api) {
      const selectedNodes = gridRef2.current.api.getSelectedNodes();
      const selectedData = selectedNodes.map((node) => node.data);

      // Check if all selected rows have the same status as 'Active'
      const firstStatus =
        selectedData.length > 0 ? selectedData[0].status : null;
      const allHaveSameStatus = selectedData.every(
        (item) => item.status === firstStatus
      );

      if (allHaveSameStatus && firstStatus === "Active") {
        setSelectedRows(selectedData);
        setSelectedActiveRows(selectedData);
      } else if (allHaveSameStatus && firstStatus === "In Active") {
        setSelectedRows(selectedData);
        setSelectedInActiveRows(selectedData);
      } else if (allHaveSameStatus && firstStatus === "Pending") {
        setSelectedRows(selectedData);
        setSelectedPendingRows(selectedData);
      } else if (selectedData.length > 0) {
        // User selected rows with different statuses, show error message and deselect all rows
        dispatch(fetchError("You can only select rows with the same status."));
        gridRef2.current.api.deselectAll();
        setSelectedInActiveRows([]);
        setSelectedActiveRows([]);
        setSelectedPendingRows([]);
      } else {
        // All rows are deselected, reset everything
        setSelectedRows([]);
        setSelectedActiveRows([]);
        setSelectedInActiveRows([]);
        setSelectedPendingRows([]);
      }
    }
  };

  //   const handleRowSelected = () => {
  //     if (gridRef2.current && gridRef2.current.api) {
  //         const selectedNodes = gridRef2.current.api.getSelectedNodes();
  //         const selectedData = selectedNodes.map((node) => node.data);
  //         const allSelectedStatuses = selectedData.map((item) => item.status);
  //         const uniqueStatuses = [...new Set(allSelectedStatuses)];

  //         if (uniqueStatuses.length === 1 && uniqueStatuses[0] === "Active") {
  //             setSelectedRows(selectedData);
  //         } else {
  //             dispatch(showMessage("You can only select rows with status 'Active'."));
  //             gridRef2.current.api.deselectAll();
  //         }
  //     }
  // };

  //   const handleRowSelected = () => {
  //     if (gridRef2.current && gridRef2.current.api) {
  //         const selectedNodes = gridRef2.current.api.getSelectedNodes();
  //         const selectedData = selectedNodes.map((node) => node.data);

  //         let allSelectedStatuses = [];
  //         for (const item of selectedData) {
  //             allSelectedStatuses.push(item.status);
  //         }

  //         const uniqueStatuses = allSelectedStatuses.filter((status, index, self) => {
  //             return self.indexOf(status) === index;
  //         });

  //         if (uniqueStatuses.length === 1 && uniqueStatuses[0] === "Active") {
  //             setSelectedRows(selectedData);
  //         } else {
  //             dispatch(showMessage("You can only select rows with status 'Active'."));
  //             gridRef2.current.api.deselectAll();
  //         }
  //     }
  // };

  useEffect(() => {
    console.log("Selected Rows:", selectedRows);
  }, [selectedRows]);

  // const handleActive = async () => {
  //   if (gridRef2.current && gridRef2.current.api) {
  //     const selectedNodes = gridRef2.current.api.getSelectedNodes();
  //     const selectedData = selectedNodes.map((node) => ({
  //       ...node.data,
  //       status: "Active",
  //     }
  //     ));
  //     const requestBody = {
  //       model: selectedData
  //     };
  //     console.log("selectedData1",selectedData,requestBody)
  //   axios
  //   .post(
  //     `${process.env.REACT_APP_BASEURL}/api/CommonList/UpdateCommonListArray`,
  //     selectedData
  //   )
  //   .then((response: any) => {
  //     if (!response) {
  //       dispatch(fetchError("Common List Status not updated"));
  //       return;
  //     }
  //     if (
  //       response &&
  //       response?.data?.code === 200 &&
  //       response?.data?.status === true
  //     ) {
  //       setRightListData((prevData) =>
  //                       prevData.map((item) => {
  //                           const updatedItem = selectedData.find(
  //                               (selectedItem) => selectedItem.id === item.id
  //                           );
  //                           return updatedItem || item;
  //                       })
  //                   );
  //       dispatch(
  //         showMessage("Common List Status updated successfully")
  //         );
  //         gridApi.deselectAll();
  //       return;
  //     } else {
  //       dispatch(fetchError("Common List Status already exists"));
  //       return;
  //     }
  //   })
  //   .catch((e: any) => {
  //      dispatch(fetchError("Error Occurred !"));
  //   });
  //   }
  // };

  const handleStatusChange = async (buttonName) => {
    if (gridRef2.current && gridRef2.current.api) {
      const selectedNodes = gridRef2.current.api.getSelectedNodes();
      const selectedData = selectedNodes.map((node) => ({
        ...node.data,
        // status: "In Active",
        status: buttonName,
      }));
      // const requestBody = {
      //   model: selectedData
      // };
      console.log("selectedData1", selectedData);
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/CommonList/UpdateCommonListArray`,
          selectedData
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Standard List Status not updated"));
            return;
          }
          if (
            response &&
            response?.data?.code === 200 &&
            response?.data?.status === true
          ) {
            setRightListData((prevData) =>
              prevData.map((item) => {
                const updatedItem = selectedData.find(
                  (selectedItem) => selectedItem.id === item.id
                );
                return updatedItem || item;
              })
            );
            dispatch(showMessage("Standard List Status updated successfully"));
            gridApi.deselectAll();
            return;
          } else {
            dispatch(fetchError("Standard List Status already exists"));
            return;
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occurred !"));
        });
    }
  };

  // Call this function when the "Active" button is clicked
  const handleActive = () => {
    setFlag(true);
    handleStatusChange("Active");
  };

  // Call this function when the "In Active" button is clicked
  const handleInactive = () => {
    setFlag(true);
    handleStatusChange("In Active");
  };

  useEffect(() => {
    if (gridRef.current && gridRef.current!.api) {
      gridRef.current.api.forEachNode((node, index) => {
        if (index === 0) {
          node.setSelected(true);
        }
      });
    }
  }, [AllTypes]);

  const getAllTypes = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/CommonList/GetAllTypes`)
      .then((response: any) => {
        setAllTypes(response?.data || []);
        showRightData(response?.data?.[0] || []);
      })
      .catch((e: any) => {});
  };

  useEffect(() => {
    getAllTypes();
  }, []);

  const showRightData = async (data: any) => {
    setSelectedLeftsideData(data)
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/CommonList/GetCommonListByType?type=${data?.type}`
      )
      .then((response: any) => {
        setRightListData(response?.data || []);
        setSelectedRows([]);
        setSelectedActiveRows([]);
        setSelectedInActiveRows([]);
        setSelectedPendingRows([]);
      })
      .catch((e: any) => {});
  };
  console.log("setSelectedLeftsideData",selectedLeftsideData?.type)

  let columnDefs = [
    {
      field: "type",
      headerName: "Type",
      headerTooltip: "Type",

      sortable: true,
      resizable: true,
      width: 279,
      cellStyle: { fontSize: "13px" },
    },
  ];

  let columnDefs2 = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 120,
      field: "Action",
      headerTooltip: "Action",
      headerName: "Action",
      cellStyle: { fontSize: "13px", textAlign: "center" },
    },
    {
      field: "type",
      headerName: "Type",
      headerTooltip: "Type",

      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "partnerCategory",
      headerName: "Partner Category",
      headerTooltip: "Partner Category",

      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "listName",
      headerName: "List Name",
      headerTooltip: "List Name",

      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "status",
      headerName: "Status",
      headerTooltip: "Status",

      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",

      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      headerTooltip: "Created Date",

      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        return moment(e?.data?.createdDate).format("DD/MM/YYYY");
      },
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "columnList",
      headerName: "Column List",
      headerTooltip: "Column List",

      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
  ];
  const handleExportData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/CommonList/GetExcelReport?type=${selectedLeftsideData?.type}`
      )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "StandardList.xlsx";
          if (filename && filename === "") {
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          const binaryStr = atob(response?.data);
          const byteArray = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            byteArray[i] = binaryStr.charCodeAt(i);
          }

          var blob = new Blob([byteArray], {
            type: "application/octet-stream",
          });
          if (typeof window.navigator.msSaveBlob !== "undefined") {
            window.navigator.msSaveBlob(blob, filename);
          } else {
            var blobURL =
              window.URL && window.URL.createObjectURL
                ? window.URL.createObjectURL(blob)
                : window.webkitURL.createObjectURL(blob);
            var tempLink = document.createElement("a");
            tempLink.style.display = "none";
            tempLink.href = blobURL;
            tempLink.setAttribute("download", filename);
            if (typeof tempLink.download === "undefined") {
              tempLink.setAttribute("target", "_blank");
            }

            document.body.appendChild(tempLink);
            tempLink.click();

            setTimeout(function () {
              document.body.removeChild(tempLink);
              window.URL.revokeObjectURL(blobURL);
            }, 200);

            dispatch(
              showMessage("Standard List Excel downloaded successfully!")
            );
          }
        }
      });
  };
  return (
    <>
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "5px",
          marginBottom: "15px",
        }}
      >
        <Box component="h2" className="page-title-heading mb-0">
          Standard List
        </Box>
        {/* <div className="rolem-grid"> */}
        <div className="rolem-grid" style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              verticalAlign: "middle",
              marginRight: 5,
            }}
          >
            <Stack
              display="flex"
              alignItems="flex-end"
              justifyContent="space-between"
              flexDirection="row"
              sx={{ mb: -2 }}
            >
              <TextField
                size="small"
                sx={{ marginRight: "10px" }}
                variant="outlined"
                name="search"
                onChange={(e) => onFilterTextChange(e)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </div>
          <div
            style={{
              display: "inline-block",
              verticalAlign: "middle",
              marginRight: 5,
            }}
          >
            <Stack
              display="flex"
              alignItems="flex-end"
              justifyContent="space-between"
              flexDirection="row"
              sx={{ mb: -2 }}
            >
              {(selectedInActiveRows.length > 0 ||
                selectedPendingRows.length > 0) && (
                <Button
                  size="small"
                  style={primaryButtonSm}
                  sx={{ color: "#fff", fontSize: "12px" }}
                  onClick={handleActive}
                  // onClick={() => handleStatusChange("Active")}
                >
                  Active
                </Button>
              )}
              {(selectedActiveRows.length > 0 ||
                selectedPendingRows.length > 0) && (
                <Button
                  size="small"
                  style={primaryButtonSm}
                  sx={{ color: "#fff", fontSize: "12px" }}
                  onClick={handleInactive}
                  // onClick={() => handleStatusChange("In Active")}
                >
                  In Active
                </Button>
              )}
              <AppTooltip title="Export Excel">
                <IconButton
                  className="icon-btn"
                  sx={{
                    // borderRadius: "50%",
                    // borderTopColor:"green",
                    width: 35,
                    height: 35,
                    // color: (theme) => theme.palette.text.secondary,
                    color: "white",
                    backgroundColor: "green",
                    "&:hover, &:focus": {
                      backgroundColor: "green", // Keep the color green on hover
                    },
                  }}
                  onClick={() => { handleExportData(); }}
                  size="large"
                >
                  <AiFillFileExcel />
                </IconButton>
              </AppTooltip>
            </Stack>
          </div>
        </div>
      </Grid>
      <Grid
        marginBottom="0px"
        item
        container
        spacing={3}
        justifyContent="start"
        alignSelf="center"
      >
        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
          <div
            className="ag-theme-alpine"
            style={{ height: "calc(100vh - 200px)", marginTop: "10px" }}
          >
            <CommonGrid
              defaultColDef={null}
              columnDefs={columnDefs}
              rowData={AllTypes}
              onGridReady={onGridReady}
              gridRef={gridRef}
              pagination={false}
              paginationPageSize={null}
              onRowClicked={(e) => showRightData(e?.data)}
              rowSelection="single"
            />
          </div>
        </Grid>
        <Grid item xs={6} md={9} sx={{ position: "relative" }}>
          <div
            className="ag-theme-alpine"
            style={{
              height: "calc(100vh - 200px)",
              marginTop: "10px",
              minWidth: "",
              width: "100%",
            }}
          >
            <CommonGrid
              defaultColDef={null}
              columnDefs={columnDefs2}
              rowData={RightListData}
              onGridReady={onGridReady2}
              gridRef={gridRef2}
              pagination={true}
              paginationPageSize={10}
              onRowSelected={handleRowSelected}
              suppressRowClickSelection={true}
              rowSelection={"multiple"}
            />
          </div>
        </Grid>
      </Grid>
    </>
  );
}
