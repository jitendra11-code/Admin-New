import React, { useState, useEffect } from "react";
import {
  Button
} from "@mui/material";
import { downloadFile } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import DownloadIcon from "@mui/icons-material/Download";
import { AgGridReact } from "ag-grid-react";
import { useDispatch } from "react-redux";
import { useUrlSearchParams } from "use-url-search-params";
import { useParams } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import MandateInfo from "pages/common-components/MandateInformation";
import { fetchError, showMessage } from "redux/actions";
import groupByDocumentData from "../DocumentUploadMandate/Components/Utility/groupByDocumentData";
import FileNameDiaglogList from "../DocumentUploadMandate/Components/Utility/Diaglogbox";
import { Tooltip } from "@mui/material";
import { Box } from "@mui/system";
declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean;
  }
}

const MandateDocumentList = () => {
  const [mandateId, setMandateId] = React.useState(null);
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const gridRef = React.useRef<AgGridReact>(null);
  const [mandateDocumentList, setMandateDocumentList] = useState([]);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const dispatch = useDispatch();
  const [params] = useUrlSearchParams({}, {});
  const [mandateInfo, setMandateData] = React.useState(null);
  const { id } = useParams();

  useEffect(() => {

    if (id && id !== "noid") {
      setMandateId(id);
    }
  }, [id]);

  let columnDefs = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      flex: 1,
      maxWidth: 80,
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "reporttype",
      headerName: "Report Type",
      headerTooltip: "Report Type",
      sortable: true,
      resizable: true,
      minWidth: 150,
      cellRenderer: (e: any) => {
        var data = e.data.documenttype;
        data = data?.split(".");
        data = data?.[0];
        return data || "";
      },
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
      maxWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "remark",
      headerName: "Remark",
      headerTooltip: "Remark",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.remarks;
        data = data?.split(".");
        data = data?.[0];
        return data || "";
      },
      maxWidth: 220,
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
      maxWidth: 130,
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
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
      maxWidth: 250,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Download",
      headerName: "Download",
      headerTooltip: "Download",
      resizable: true,
      maxWidth: 120,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (obj: any) => (
        <>
          <div className="actions">
            <Tooltip title="Download" className="actionsIcons">
              <DownloadIcon
                style={{ fontSize: "15px" }}
                onClick={() => downloadFile(obj?.data, mandateId, dispatch)}
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



  const getDocumentMandateList = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/ImageStorage/GetAllDocumnet?mandateid=${mandateId?.id || 0}`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
          setMandateDocumentList(data || []);
        }
        if (response && response?.data?.length === 0) {
          setMandateDocumentList([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  useEffect(() => {
    if (mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid") {
      getDocumentMandateList();
    }
  }, [mandateId]);




  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  const DownloadZipFile = (e) => {
    if (mandateId === undefined || mandateId === null) {
      dispatch(fetchError("Please select Mandate !!!"));
      return;
    }
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/DownloadAllDocZip?mandateid=${mandateId?.id}`,
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error occurred in downloading file !!!"));
          return;
        }
        if (response?.data) {
          var filename = response?.data?.filename || "";
          if (filename && filename === "") {
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          var blob = new Blob([base64ToArrayBuffer(response?.data?.base64String)], { type: "application/zip" });
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

            dispatch(showMessage("Document is downloaded successfully!"));
          }
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });

  }

  return (
    <>
      <div
        className="card-panal"
        style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
      >

        <MandateInfo
          mandateCode={mandateId}
          source=""
          pageType=""
          setMandateData={setMandateData}
          redirectSource={`${params?.source}`}
          setMandateCode={setMandateId}
          setpincode={() => { }}
          setCurrentStatus={setCurrentStatus}
          setCurrentRemark={setCurrentRemark}
        />
      </div>
      <div style={{ marginTop: "10px" }}>
        <div>
          <Box display="flex">
            <Box flexGrow={1} textAlign="left">
              <Box component="h2" className="page-title-heading" style={{ marginTop: "7px", marginBottom: "5px" }}>
                Mandate Document List
              </Box>
            </Box>
            <Box textAlign="right">
              <Button
                onClick={(e) => DownloadZipFile(e)}
                style={{ minWidth: "100px", width: "175px", flex: "right" }}
                className="list-button"
              >
                <DownloadIcon style={{ fontSize: "22px" }} />
                Download As Zip
              </Button>
            </Box>
          </Box>
        </div>
        <div style={{ height: "60vh", marginTop: "10px" }}>
          <CommonGrid
            defaultColDef={{ flex: 1, resizable: true }}
            columnDefs={columnDefs}
            rowData={mandateDocumentList || []}
            onGridReady={onGridReady}
            gridRef={gridRef}
            pagination={false}
            paginationPageSize={null}
          />
        </div>
      </div>
    </>
  );
};
export default MandateDocumentList;
