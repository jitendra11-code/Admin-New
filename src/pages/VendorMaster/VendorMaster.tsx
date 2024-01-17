import React, { useEffect, useState } from "react"; 
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import axios from "axios";
import { Stack, Grid, Box, Tooltip, IconButton, TextField, InputAdornment } from "@mui/material";
import { TbPencil } from "react-icons/tb";
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import { useNavigate } from "react-router-dom";
import AppTooltip from "@uikit/core/AppTooltip";
import { AiFillFileExcel } from "react-icons/ai";
import SearchIcon from '@mui/icons-material/Search';
import { fetchError, showMessage } from "redux/actions";
import { useDispatch } from "react-redux";

export default function VendorMaster() {
    const [VendorList,setVendorList] = useState([]);
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getVendorList = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/VendorAllocation/GetAllVendorList`)
            .then((response : any)=>{
                setVendorList(response?.data || []);
            })
            .catch((e:any) => {});
    };

    const onFilterTextChange = async (e) => {
        gridApi?.setQuickFilter(e.target.value);
        if (gridApi.getDisplayedRowCount() == 0) {
          dispatch(fetchError("Data not found!"));
        }
      };   

    useEffect(() =>{
        getVendorList();
    },[]);

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
                  <Tooltip title="Edit" className="actionsIcons">
                    <button className="actionsIcons actionsIconsSize" >
                      <TbPencil onClick={()=>navigate(`/vendormaster/${params?.data?.id}/update-vendor`)}/>
                    </button>
                  </Tooltip>
                </div>
              </>
            ),
            width: 130,
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
            field: "agencyName",
            headerName: "Agency Name",
            headerTooltip: "Agency Name",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "agencyContactNo",
            headerName: "Agency ContactNo",
            headerTooltip: "Agency ContactNo",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "agencyEmail",
            headerName: "Agency Email",
            headerTooltip: "Agency Email",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "spoC1Name",
            headerName: "SPOC1 Name",
            headerTooltip: "SPOC1 Name",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "spoC1ContactNo",
            headerName: "SPOC1 ContactNo",
            headerTooltip: "SPOC1 ContactNo",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "spoC1Email",
            headerName: "SPOC1 Email",
            headerTooltip: "SPOC1 Email",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
        },
    ];

    function onGridReady(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridApi(params.api);
    }

      const handleExportData = () => {
        axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/VendorAllocation/GetExcelDownload`
          )
          .then((response) => {
            if (!response) {
              dispatch(fetchError("Error occurred in Export !!!"));
              return;
            }
            if (response?.data) {
              var filename = "VendorManagement.xlsx";
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
                  showMessage("Vendor Management downloaded successfully!")
                );
              }
            }
          });
      };

    return(
        <>
            <Grid
                sx={{
                    display : "flex",
                    alignItems : "center",
                    justifyContent : "space-between",
                    marginBottom : "20px",
                }}
            >
                <Box component="h2" className="page-title-heading mb-0">
                    Vendor Management
                </Box>
                <div className="phase-grid">
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
            </Grid>    

            <CommonGrid
            defaultColDef={{ flex: 1 }}
            columnDefs={columnDefs}
            rowData={VendorList}
            onGridReady={onGridReady}
            gridRef={gridRef}
            pagination={true}
            paginationPageSize={10}
            />
        </>
    )
}