import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import moment from "moment";
import { downloadFile } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import React from "react";
import DownloadIcon from "@mui/icons-material/Download";
import { useDispatch } from "react-redux";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import { fetchError, showMessage } from "redux/actions";
import axios from "axios";
import { Tooltip } from "@mui/material";
const BulkHistory = ({ versionHistoryData }) => {
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const dispatch = useDispatch();
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
      minWidth: 70,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "documenttype",
      headerName: "Report Type",
      headerTooltip: "Report Type",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "filename",
      headerName: "File Name",
      headerTooltip: "File Name",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.filename;
        data = data?.split(".");
        data = data?.[0];
        return data || "";
      },
      width: 400,
      minWidth: 150,
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
      width: 150,
      minWidth: 90,
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
      minWidth: 90,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 90,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Download",
      headerName: "Download",
      headerTooltip: "Download",
      resizable: true,
      width: 110,
      minWidth: 90,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (obj: any) => (
        <>
          <div className="actions">
            <Tooltip title="Download" className="actionsIcons">
              <DownloadIcon
                style={{ fontSize: "15px" }}
                onClick={() => downloadFile(obj?.data, { id: 0 }, dispatch)}
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
      width: 110,
      minWidth: 90,
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

  const downloadFileLogFile = (data) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/Mandates/DownloadLogData?uploadNo=${data?.recordId || 0}`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data) {
          var filename = `Mandate_Bulk_Upload_Log(${moment().format(
            "ddd DD/MM/YYYY hh:mm:ss A"
          )}).xlsx`;
          if (!filename) {
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (typeof window.navigator.msSaveBlob !== "undefined") {
            let byteChar = atob(response?.data);
            let byteArray = new Array(byteChar.length);
            for (let i = 0; i < byteChar.length; i++) {
              byteArray[i] = byteChar.charCodeAt(i);
            }
            let uIntArray = new Uint8Array(byteArray);
            let blob = new Blob([uIntArray], {
              type: "application/vnd.ms-excel",
            });
            window.navigator.msSaveBlob(blob, filename);
          } else {
            const source = `data:application/vnd.ms-excel;base64,${response?.data}`;
            const link = document.createElement("a");
            link.href = source;
            link.download = filename;
            link.click();
            dispatch(
              showMessage(
                "The Mandate Bulk Upload Log file is downloaded successfully!"
              )
            );
          }
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  return (
    <>
      <div style={{ height: "550px", marginTop: "10px" }}>
        <CommonGrid
          defaultColDef={{ flex: 1 }}
          columnDefs={columnDefs}
          rowData={versionHistoryData || []}
          onGridReady={onGridReady}
          gridRef={gridRef}
          pagination={false}
          paginationPageSize={null}
        />
      </div>
    </>
  );
};
export default BulkHistory;
