import React from "react";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import { DialogActions, Tooltip } from "@mui/material";
import axios from "axios";
import { fetchError } from "redux/actions";
import { useDispatch } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import moment from "moment";
import { downloadFile } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";

const FileDownloadList = ({ props, mandate, setTableData, setFormData }) => {
  const gridRef = React.useRef<AgGridReact>(null);
  const dispatch = useDispatch();
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [docUploadHistory, setDocUploadHistory] = React.useState([]);
  const [docUploadHistoryBk, setDocUploadHistoryBk] = React.useState([]);
  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  let columnDefs = [
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
      width: 80,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "documenttype",
      headerName: "Document Type",
      headerTooltip: "Document Type",
      sortable: true,
      resizable: true,
      width: 130,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
      cellRenderer: (e: any) => {
        return e?.data?.documenttype || "";
      },
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
      width: 150,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Created Time",
      headerTooltip: "Created Time",
      cellRenderer: (e: any) => {
        return moment(e?.data?.createdDate).format("h:mm:ss A");
      },
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Download",
      headerName: "Download",
      headerTooltip: "Download",
      resizable: true,
      width: 90,
      minWidth: 80,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (obj: any) => (
        <>
          <div className="actions">
            <Tooltip title="Download" className="actionsIcons">
              <DownloadIcon
                style={{ fontSize: "13px", textAlign: "center" }}
                onClick={() => downloadFile(obj?.data, mandate, dispatch)}
                className="actionsIcons"
              />
            </Tooltip>
          </div>
        </>
      ),
    },
    {
      field: "",
      headerName: "View",
      headerTooltip: "View",
      resizable: true,
      width: 90,
      minWidth: 80,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (obj: any) => (
        <>
          <div className="actions">
            <FileNameDiaglogList props={obj} />
          </div>
        </>
      ),
    },
  ];

  const getVersionHistoryData = (id) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandate?.id}&documentType=BOQ Verification&recordId=${id || 0}`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }

        if (response?.data && response?.data && response?.data?.length > 0) {
          const data = groupByDocumentData(response?.data, "versionNumber");
          const filterData =
            data &&
            data?.length > 0 &&
            data?.filter(
              (item) => item?.recordId === props?.id && parseInt(props?.id)
            );
          setDocUploadHistory(filterData || []);
          setDocUploadHistoryBk(filterData || []);
        }
        if (response && response?.data?.length === 0) {
          setDocUploadHistory([]);
          setDocUploadHistoryBk([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  const handleOpen = () => {
    setOpen(true);
  };

  React.useEffect(() => {
    if (!open) return;
    if (mandate?.id !== undefined && props?.id) {
      getVersionHistoryData(props?.id);
    }
  }, [props, open]);

  return (
    <>
      {" "}
      <Tooltip
        className="actionsIcons"
        id={`${props?.id}_viewordownload_photos`}
        title="View/Download Photos"
      >
        <VisibilityIcon
          onClick={handleOpen}
          style={{ fontSize: "20px", color: "#000", cursor: "pointer" }}
          className="actionsIcons"
        />
      </Tooltip>
      <Dialog fullWidth maxWidth="xl" open={open} onClose={handleClose}>
        <DialogTitle style={{ fontSize: 16, fontWeight: 600, color: "#000" }}>
          Download/View Files
        </DialogTitle>

        <div style={{ height: "calc(100vh - 260px)", margin: "0px 20px 0px", overflow: "hidden" }}>
          <CommonGrid
            defaultColDef={{ flex: 1 }}
            columnDefs={columnDefs}
            rowData={docUploadHistory || []}
            onGridReady={onGridReady}
            gridRef={gridRef}
            pagination={docUploadHistory?.length > 3 ? true : false}
            paginationPageSize={3}
          />
        </div>
        <DialogActions className="button-wrap">
          <Button className="yes-btn" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default FileDownloadList;
