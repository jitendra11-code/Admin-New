import React from "react";
import {
    Typography,
    Grid,
    Button,
    TextField,
    Autocomplete,
} from "@mui/material";
import { mainButton, secondaryButton } from "shared/constants/CustomColor";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import DownloadIcon from "@mui/icons-material/Download";
import { AgGridReact } from "ag-grid-react";
import { AppState } from "redux/store";
import { useSelector } from "react-redux";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import { Tooltip } from "@mui/material";

const UploadDocuments = () => {
    const [mandateList, setMandateList] = React.useState([]);
    const [mandateInfo, setMandateInfo] = React.useState<any>();
    const gridRef = React.useRef<AgGridReact>(null);
    const { userActionList } = useSelector<AppState, AppState["userAction"]>(
        ({ userAction }) => userAction
    );

    let rowData: any = [
        {
            srno: "1",
            fileName: "LOA Documents 1",
            createDate: "10-Nov-2022",
            createTime: "10:00 AM",
            createdBy: "Ritesh Mahajan",
        },
        {
            srno: "2",
            fileName: "LOA Documents 2",
            createDate: "10-Nov-2022",
            createTime: "10:00 AM",
            createdBy: "Dow John",
        },
        {
            srno: "3",
            fileName: "LOA Documents 3",
            createDate: "10-Nov-2022",
            createTime: "10:00 AM",
            createdBy: "Smith Ray",
        },
        {
            srno: "4",
            fileName: "LOA Documents 4",
            createDate: "10-Nov-2022",
            createTime: "10:00 AM",
            createdBy: "Ritesh Mahajan",
        },
    ];

    let columnDefs = [
        {
            field: "srno",
            headerName: "Sr. No",
            headerTooltip: "Serial Number",
            sortable: true,
            resizable: true,
            width: 80,
            minWidth: 80,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "fileName",
            headerName: "File Name",
            headerTooltip: "File Name",
            sortable: true,
            resizable: true,
            width: 160,
            minWidth: 100,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "createDate",
            headerName: "Create Date",
            headerTooltip: "Create Date",
            sortable: true,
            resizable: true,
            width: 120,
            minWidth: 80,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "createTime",
            headerName: "Create Time",
            headerTooltip: "Create Time",
            sortable: true,
            resizable: true,
            width: 120,
            minWidth: 80,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "createdBy",
            headerName: "Created By",
            headerTooltip: "Created By",
            sortable: true,
            resizable: true,
            width: 140,
            minWidth: 80,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "Download",
            headerName: "Download",
            headerTooltip: "Download",
            resizable: true,
            width: 120,
            minWidth: 80,
            cellStyle: { fontSize: "13px", textAlign: "center", marginTop: "5px" },

            cellRenderer: (e: any) => (
                <>
                    <div className="actions">
                        <Tooltip title="Download" className="actionsIcons">
                            <DownloadIcon className="actionsIcons" />
                        </Tooltip>
                    </div>
                </>
            ),
        },
    ];

    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }

    const onFilterTextChange = (e) => {
        gridApi?.setQuickFilter(e.target.value);
    };
    return (
        <>
            <div>
                <Typography>Upload New Documents</Typography>
                <Grid
                    container
                    item
                    spacing={5}
                    justifyContent="start"
                    alignSelf="center"
                >
                    <Grid item xs={6} md={4}>
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            disableClearable={true}
                            options={[]}

                            placeholder="Mandate Code"
                            value={null}
                            renderInput={(params) => (
                                <TextField
                                    name="state"
                                    id="state"
                                    {...params}
                                    InputProps={{
                                        ...params.InputProps,
                                        style: { height: `35 !important` },
                                    }}
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={6} md={6}>
                        <div style={{ display: "flex" }}>
                            <Button variant="outlined" size="medium" style={secondaryButton}>
                                Download Template
                            </Button>
                            <Button variant="outlined" size="medium" style={secondaryButton}>
                                Upload
                            </Button>
                        </div>
                    </Grid>
                    <Grid item xs={10} md={10}>
                        <MandateStatusHistory mandateCode={131} />
                    </Grid>
                </Grid>
                <div className="template-preview">
                    <Typography>Template Preview</Typography>
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography>Version History</Typography>{" "}
                    <Button variant="outlined" size="medium" style={mainButton}>
                        Bulk Download
                    </Button>
                </div>
                <div style={{ height: "calc(100vh - 436px)", marginTop: "10px" }}>
                    <CommonGrid
                        defaultColDef={{ flex: 1 }}
                        columnDefs={columnDefs}
                        rowData={rowData}
                        onGridReady={onGridReady}
                        gridRef={gridRef}
                        pagination={true}
                        paginationPageSize={10}
                    />
                </div>
            </div>
        </>
    );
};
export default UploadDocuments;
