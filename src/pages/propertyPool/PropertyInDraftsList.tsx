import React, { useState, useEffect } from "react";
import { Box, IconButton, Stack, Tooltip,alpha,Grid } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import { TbPencil } from "react-icons/tb";
import moment from "moment";
import DeleteDraftPropertiesDialog from "./components/DeleteDraftPropertiesDiaglog";
import { AiFillFileExcel, AiOutlineDelete } from "react-icons/ai";
import AppTooltip from "@uikit/core/AppTooltip";

const Content = () => {
  const gridRef = React.useRef<AgGridReact>(null);
  const [propertyDraftList, setPropertyDraftList] = useState<any>([]);
  const [deleteParams, setDeleteParams] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<Boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
  }
  const getPropertyDataInDrafts = () => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/GetAllDrafts`)
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data && response?.data?.length > 0) {
          setPropertyDraftList(response?.data || []);
        } else {
          setPropertyDraftList([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  const handleClose = () => {
    setDeleteModal(false);
  };

  const deletePropertyInDraft = (id) => {
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/PropertyPool/DeleteDrafts?id=${
          id || 0
        }`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Property is not deleted"));
          getPropertyDataInDrafts();
          setDeleteModal(false);
          return;
        }
        if (response && response?.data?.code === 200) {
          dispatch(showMessage("Property is deleted successfully"));
          getPropertyDataInDrafts();
          setDeleteModal(false);
          return;
        } else {
          dispatch(fetchError("Property is not deleted"));
          getPropertyDataInDrafts();
          setDeleteModal(false);
          return;
        }
      })
      .catch((e: any) => {
        setDeleteModal(false);
        dispatch(fetchError("Error Occurred !"));
      });
  };
  useEffect(() => {
    getPropertyDataInDrafts();
  }, []);

  const nextDelete = (params) => {
    setDeleteModal(true);
    setDeleteParams(params);
  };
  let columnDefs = [
    {
      field: "Action",
      headerName: "Actions",
      headerTooltip: "Actions",
      sortable: false,
      resizable: false,
      pinned: "left",
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
            {" "}
            <Tooltip id="edit-property-draft" title="Edit Property">
              <button className="actionsIcons actions-icons-size">
                <TbPencil
                  onClick={() =>
                    navigate(
                      `/property-pool/${params.data?.mandateId}/add?propertyId=${
                        params.data?.id || 0
                      }`
                    )
                  }
                />
              </button>
            </Tooltip>
            <Tooltip id="edit-property-draft" title="Delete Property">
              <button className="actionsIcons-delete actions-icons-size">
                <AiOutlineDelete onClick={() => nextDelete(params)} />
              </button>
            </Tooltip>
          
          </div>
        </>
      ),
      width: 120,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      maxWidth: 75,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "nameOfTheBuilding",
      headerName: "Name of Building/Complex",
      headerTooltip: "Name of Building/Complex",
      cellRenderer: (e: any) => {
        var data = e?.data?.nameOfTheBuilding;
        return data || "";
      },
      sortable: true,
      resizable: true,
      filter: true,
      width: 300,
      minWidth: 120,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "floorNumberInBuilding",
      headerName: "Floor Number",
      headerTooltip: "Floor Number",
      sortable: true,
      resizable: true,
      filter: true,
      cellRenderer: (e: any) => {
        var data = e?.data?.floorNumberInBuilding;
        return data || "";
      },
      width: 100,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "pinCode",
      headerName: "Pin Code",
      headerTooltip: "Pin Code",
      resizable: true,
      filter: true,
      width: 130,
      minWidth: 100,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (e: any) => {
        var data = e?.data?.pinCode;
        return data || "";
      },
    },
    {
      field: "city",
      headerName: "City",
      headerTooltip: "City",
      sortable: true,
      resizable: true,
      filter: true,
      cellRenderer: (e: any) => {
        var data = e?.data?.city;
        return data || "";
      },
      width: 190,
      minWidth: 120,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "disctrict",
      headerName: "District",
      headerTooltip: "District",
      sortable: true,
      filter: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e?.data?.disctrict;
        return data || "";
      },
      width: 190,
      minWidth: 120,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "state",
      headerName: "State",
      headerTooltip: "State",
      sortable: true,
      filter: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e?.data?.state;
        return data || "";
      },
      width: 190,
      minWidth: 120,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      headerTooltip: "Created Date",
      sortable: true,
      resizable: true,
      filter: true,
      cellRenderer: (e: any) => {
        return moment(e?.data?.createdDate).format("DD/MM/YYYY");
      },
      width: 150,
      minWidth: 120,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 120,
      filter: true,
      cellStyle: { fontSize: "13px" },
    },
  ];

  const handleExportData = () => {
    axios
    .get(
      `${process.env.REACT_APP_BASEURL}/api/PropertyPool/GetExcelDownloadAllDrafts`
    )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "PropertiesInDraft.xlsx";
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

            // Fixes "webkit blob resource error 1"
            setTimeout(function () {
              document.body.removeChild(tempLink);
              window.URL.revokeObjectURL(blobURL);
            }, 200);

            dispatch(
              showMessage("Properties In Draft data downloaded successfully!")
            );
          }
        }
      });
  };

  return (
    <>
      {deleteModal && (
        <DeleteDraftPropertiesDialog
          params={deleteParams}
          deletePropertyInDraft={deletePropertyInDraft}
          setDeleteModal={setDeleteModal}
          open={deleteModal}
          handleClose={handleClose}
        />
      )}
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
      <Box component="h2" className="page-title-heading my-6">
        Properties in draft
      </Box>
      <Stack
          display="flex"
          alignItems="flex-end"
          justifyContent="space-between"
          flexDirection="row"
          sx={{ mb: -2,marginBottom:"5px"}}
        >
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
                onClick={() => {handleExportData();}}
                size="large"
              >
                <AiFillFileExcel />
              </IconButton>
           </AppTooltip>
        </Stack>
        </Grid>
      <div
        style={{
          height: "82vh",
          border: "1px solid rgba(0, 0, 0, 0.12)",
        }}
        className="card-panal"
      >
        <div style={{ margin: "10px" }}>
          <div style={{ height: "78vh", marginTop: "10px" }}>
            <CommonGrid
              defaultColDef={{}}
              columnDefs={columnDefs}
              rowData={propertyDraftList || []}
              onGridReady={onGridReady}
              gridRef={gridRef}
              pagination={false}
              paginationPageSize={null}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Content;
