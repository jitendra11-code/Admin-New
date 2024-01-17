import { Box,Table, TableBody, TableCell, TableHead, TableRow,SwipeableDrawer, Button} from "@mui/material";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { GridApi } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import moment from "moment";
import React,{useEffect, useState} from "react";
import AssetInsuranceDrawer from "./AssetInsuranceDrawer";
import { submit } from 'shared/constants/CustomColor';

const AssetInsurance = () =>{
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const [assetData,setAssetData] = useState([]);
    const [assetDrawerData, setAssetDrawerData]= React.useState(null);
    const [openDrawerAssetCode, setOpenDrawerAssetCode] = useState(false);

    //need to change the API according to AssetInsurance afterwards
    const getAllData = async () => {
        await axios
          .get(`${process.env.REACT_APP_BASEURL}/api/AssetTagging/GetAssetTaggingDetails`)
          .then((response: any) => {
            setAssetData(response?.data || []);
          })
          .catch((e: any) => { });
    };
    
    useEffect(() => {
    getAllData();
    }, []);

    let columnDefs = [
        {
            field: "assetCode",
            headerName: "Asset Code",
            headerTooltip: "Asset Code",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 120,
            minWidth:120,
            cellRenderer: (params) => {
                return  <a  href= "#" style={{ color: 'blue' }} onClick={() => {setAssetDrawerData(params?.data);setOpenDrawerAssetCode(true)}} >
                  {params?.data?.assetCode}
                  </a>
            }
        },
        {
            field: "assetType",
            headerName: "Asset Type",
            headerTooltip: "Asset Type",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 120,
            minWidth: 120,
        },
        {
            field: "assetCategorization",
            headerName: "Asset Categorization",
            headerTooltip: "Asset Categorization",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 220,
            minWidth: 180,
        },
        {
            field: "assetClassDescription",
            headerName: "Asset Class Description",
            headerTooltip: "Asset Class Description",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 220,
            minWidth: 200,
        },
        {
            field: "assetDescription",
            headerName: "Asset Description",
            headerTooltip: "Asset Description",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 180,
            minWidth: 160,
        },
        {
            field: "pavLocation",
            headerName: "PAV Location",
            headerTooltip: "PAV Location",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 150,
            minWidth: 130,
        },
        {
            field: "locationCode",
            headerName: "Location Code",
            headerTooltip: "Location Code",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 150,
            minWidth: 134,
        },
        {
            field: "vertical",
            headerName: "Vertical",
            headerTooltip: "Vertical",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 150,
            minWidth: 110,
        },
        {
            field: "state",
            headerName: "State",
            headerTooltip: "State",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 150,
            minWidth: 130,
        },
        {
            field: "bookVal",
            headerName: "Book value",
            headerTooltip: "Book value",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 120,
            minWidth: 100,
        },
        {
            field: "capitalizationDate",
            headerName: "Capitalization Date",
            headerTooltip: "Capitalization Date",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            cellRenderer: function (params) {
                var formattedDate =params?.value ? moment(params.value).format('DD/MM/YYYY') : null;
                return formattedDate;
            },
            width: 170,
            minWidth: 165,
        },
    ];

    function onGridReady(params) {
        setGridApi(params.api);
        gridRef.current!.api.sizeColumnsToFit();
    }

    return(
        <>
            <Box component="h2" className="page-title-heading mb-0" style={{marginBottom: "10px !important",}}>
                Asset Insurance
            </Box>
            <div
                style={{
                height: 'calc(100vh - 161px)',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                }}
                className="card-panal inside-scroll-137"
            >
                <div style={{ height: "60%",marginBottom:"10px"}}>
                  <CommonGrid
                    defaultColDef={{ flex: 1 }}
                    columnDefs={columnDefs}
                    rowData={assetData}
                    onGridReady={onGridReady}
                    gridRef={gridRef}
                    pagination={false}
                    paginationPageSize={10}
                  />
                </div>
                <hr style={{ border : "1px solid lightgray" ,marginBottom:"10px"}}/>
                <div className="approval-table pl-0">
                    <Table
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: "1px solid rgba(0, 0, 0, 0.12)",
                        },
                        mt: 0,
                        mb: 0,
                      }}
                      aria-label="spanning table"
                    >
                      <TableHead>
                        <TableRow sx={{ lineHeight: "0.5rem" }}>
                          <TableCell align="center" colSpan={5}>
                            Summary for Sum Insured (Pool 2)
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            align="center"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            style={{ width: '185px' }} colSpan={3}
                          >
                            CF (Acq. Value)
                          </TableCell>
                          <TableCell
                            align="center"
                            // className="w-75"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            colSpan={1}
                          >
                            AF
                          </TableCell>
                          <TableCell
                            align="center"
                            // className="w-75"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            colSpan={1}
                          >
                            Total
                          </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell
                            align="center"
                            sx={{ backgroundColor: "#f3f3f3 !important",width:"20% !important" }}
                            // style={{ width: '185px' }}
                            >
                                Particular
                            </TableCell>
                            <TableCell
                            align="center"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            // style={{ width: '185px' }}
                            >
                                Branch
                            </TableCell>
                            <TableCell
                            align="center"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            // style={{ width: '185px' }}
                            >
                                HO
                            </TableCell>
                            <TableCell
                            align="center"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            // style={{ width: '185px' }}
                            >
                                Acq. Value
                            </TableCell>
                            <TableCell
                            align="center"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            // style={{ width: '185px' }}
                            >
                                Acq. Value
                            </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                      <TableRow>
                          <TableCell className="font_bold">FAR - FIRE</TableCell>
                          <TableCell>6546260768</TableCell>
                          <TableCell>1102065344</TableCell>
                          <TableCell>432317854</TableCell>
                          <TableCell>8,080,643,966</TableCell>
                        </TableRow>                       
                        <TableRow>
                          <TableCell className="font_bold">FAR - BURGLARY</TableCell>
                          <TableCell>1644480021</TableCell>
                          <TableCell>321518681</TableCell>
                          <TableCell>432317854</TableCell>
                          <TableCell>2,398,316,555</TableCell>
                        </TableRow>                        
                        <TableRow>
                          <TableCell className="font_bold">Open PO</TableCell>
                          <TableCell> 536382611</TableCell>
                          <TableCell>52580990</TableCell>
                          <TableCell></TableCell>
                          <TableCell>588,963,600 </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>11,067,924,121</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>Total in Cr.</TableCell>
                            <TableCell>1106.79</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                </div>
            </div>
            <div className="bottom-fix-btn" style={{ display: "flex", justifyContent: "center" }}>
                <Button
                variant="contained"
                type="button"
                size="small"
                style={submit}
                // onClick={() => handleCloseD()}
                >
                Upload AF Data
                </Button>
                <Button
                variant="contained"
                type="button"
                size="small"
                style={submit}
                // onClick={() => { submitCourierDetails() }}
                >
                Download Report
                </Button>
                <Button
                variant="contained"
                type="button"
                size="small"
                style={submit}
                // onClick={() => { submitCourierDetails() }}
                >
                Back
                </Button>
                <Button
                variant="contained"
                type="button"
                size="small"
                style={submit}
                // onClick={() => { submitCourierDetails() }}
                >
                Submit
                </Button>
            </div>
            <SwipeableDrawer
                anchor={"right"}
                open={openDrawerAssetCode}
                onClose={(e) => {
                setOpenDrawerAssetCode(false);
                }}
                onOpen={(e) => {
                setOpenDrawerAssetCode(true);
                }}
            >
        
                <AssetInsuranceDrawer
                onAssetDrawerData={assetDrawerData}
                handleClose={() => setOpenDrawerAssetCode(false)}
                />
            </SwipeableDrawer>
        </>
    );
};

export default AssetInsurance;