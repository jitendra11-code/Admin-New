import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Grid,
  Button,
  TextField,
  Autocomplete,
} from "@mui/material";
import { secondaryButton } from "shared/constants/CustomColor";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import DownloadIcon from "@mui/icons-material/Download";
import { AgGridReact } from "ag-grid-react";
import { AppState } from "redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useUrlSearchParams } from "use-url-search-params";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import moment from "moment";
import axios from "axios";
import { fetchError, showMessage } from "redux/actions";
import {
  downloadFile,
  downloadTemplate,
  fileValidation,
} from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import { _validationMaxFileSizeUpload } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import { Tooltip } from "@mui/material";

declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean;
  }
}

const MAX_COUNT = 8;

const bOQValue = {
  key: "BOQ",
  name: "BOQ",
};

const UploadBOQ = ({
  isVendorSelected,
  approvalRole,
  setApprovalRole,
  mandateId,
  setMandateId,
  setVendor,
  getBOQSummary,
  setBOQData,
  boq,
  setBOQ,
  setdocHistory,
  vendor,
}) => {
  const [docType, setDocType] = useState<any>(null);
  const [projectPlanData, setProjectPlanData] = useState([]);
  const navigate = useNavigate();
  const [documentTypeList, setDocumentTypeList] = useState<any>([]);
  const [boqDrp, setBoQ] = useState<any>(bOQValue);
  const location = useLocation();
  const apiType = location?.state?.apiType || "";

  const gridRef = React.useRef<AgGridReact>(null);
  const [docUploadHistory, setDocUploadHistory] = useState([]);
  const [docUploadHistoryBk, setDocUploadHistoryBk] = useState([]);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );

  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [params] = useUrlSearchParams({}, {});
  const [mandateInfo, setMandateData] = React.useState(null);
  const [fileLength, setFileLength] = useState(0);
  const { id } = useParams();
  const { user } = useAuthUser();

  useEffect(() => {
    if (vendor?.hasOwnProperty("vendorId") && vendor?.vendorId !== 0) {
      var data =
        docUploadHistoryBk &&
        docUploadHistoryBk.filter(
          (item) =>
            item?.recordId === vendor?.vendorId && parseInt(vendor?.vendorId)
        );
      setDocUploadHistory(data || []);
    }
  }, [vendor?.vendorId]);

  useEffect(() => {
    getDocumentTypeList();
    if (id && id !== "noid") {
      setMandateId(id);
    }
  }, [id]);

  useEffect(() => {
    if (documentTypeList && documentTypeList?.length > 0) {
      var obj =
        documentTypeList &&
        documentTypeList.find((item) => item?.documentName === "BOQ");
      setDocType(obj || null);
    }
  }, [documentTypeList, setDocumentTypeList]);
  const getDocumentTypeList = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=DocumentMaster`
      )
      .then((response: any) => {
        if (!response) return;
        if (
          response &&
          response?.data &&
          response?.data?.data &&
          response?.data?.data?.length > 0
        ) {
          setDocumentTypeList(response?.data?.data);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  const _bulkdownloadaZip = () => {
    var list: any = [];
    docUploadHistory &&
      docUploadHistory?.length > 0 &&
      docUploadHistory.map((item) => {
        list?.push(item?.filename);
      });
    if (list && list.length === 0) {
      dispatch(fetchError("No files available to download"));
      return;
    }

    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/DownloadZipFile?mandateid=${mandateId?.id}`,
        list,
        {
          responseType: "arraybuffer",
        }
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error occurred in downloading file !!!"));
          return;
        }
        if (response?.data) {
          var filename = response.headers["content-disposition"].split("''")[1];
          if (filename && filename === "") {
            dispatch(fetchError("Error Occurred !"));
            return;
          }

          var blob = new Blob([response?.data], { type: "application/zip" });
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
      minWidth: 100,
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
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Download",
      headerName: "Download",
      resizable: true,
      width: 110,
      minWidth: 100,
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
      minWidth: 100,
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

  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const fileInput = React.useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileLimit, setFileLimit] = useState(false);
  const dispatch = useDispatch();

  const getVersionHistoryData = () => {
    axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/ImageStorage/GetDocUploadHistory?mandateid=${
          mandateId?.id
        }&documentType=BOQ&RecordId=${vendor?.vendorId || 0}`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }

        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
          setDocUploadHistory(data || []);
          setDocUploadHistoryBk(data || []);
          setdocHistory(data || []);
        }
        if (response && response?.data?.length === 0) {
          setDocUploadHistoryBk(data || []);
          setdocHistory(data || []);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  useEffect(() => {
    if (mandateId?.id !== undefined && vendor?.vendorId !== undefined) {
      getVersionHistoryData();
    }
  }, [mandateId?.id, vendor?.vendorId]);

  const handleUploadFiles = async (e, files) => {
    const uploaded = [...uploadedFiles];
    let limitExceeded = false;
    files &&
      files?.some((file) => {
        if (
          uploaded &&
          uploaded?.findIndex((f) => f.name === file.name) === -1
        ) {
          uploaded.push(file);
          if (uploaded?.length === MAX_COUNT) setFileLimit(true);
          if (uploaded?.length > MAX_COUNT) {
            dispatch(
              fetchError(
                `You can only add a maximum of ${MAX_COUNT} files` || ""
              )
            );
            setFileLimit(false);
            limitExceeded = true;
            e.target.value = null;
            return;
          }
        }
      });
    if (limitExceeded) {
      dispatch(
        fetchError(`You can only add a maximum of ${MAX_COUNT} files` || "")
      );
      e.target.value = null;
      return;
    }

    if (!limitExceeded) setUploadedFiles(uploaded);
    setFileLength((uploaded && uploaded?.length) || 0);
    const formData: any = new FormData();
    const formDataExcel: any = new FormData();
    formDataExcel.append("mandateId", mandateId?.id);
    formDataExcel.append("vendorId", vendor?.vendorId || 0);
    formDataExcel.append("boqId", 0);

    formData.append("mandate_id", mandateId?.id);
    formData.append("documenttype", "BOQ");
    formData.append("CreatedBy", user?.UserName || "");
    formData.append("ModifiedBy", user?.UserName || "");
    formData.append("entityname", "BOQ");
    formData.append("RecordId", vendor?.vendorId || 0);

    for (var key in uploaded) {
      await formData.append("file", uploaded[key]);
      await formDataExcel.append("file", uploaded[key]);
    }

    if (uploaded?.length === 0) {
      setUploadedFiles([]);
      setFileLimit(false);
      e.target.value = null;
      dispatch(fetchError("Error Occurred !"));
      return;
    }

    if (mandateId?.id !== undefined) {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`,
          formData
        )
        .then((response: any) => {
          e.target.value = null;
          if (!response) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (response?.data?.data == null) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Documents are not uploaded!"));
            getVersionHistoryData();
            return;
          } else if (response?.status === 200) {
            saveOrUploadStaffDataByExcel(e, formDataExcel);
            setUploadedFiles([]);
            setFileLimit(false);
            e.target.value = null;
          } else {
            dispatch(fetchError("Documents are not uploaded successfully!"));
            setUploadedFiles([]);
            setFileLimit(false);
            e.target.value = null;
            return;
          }
        })
        .catch((error: any) => {
          e.target.value = null;
          dispatch(fetchError("Error Occurred !"));
        });
    }
  };

  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (
      _validationMaxFileSizeUpload(e, dispatch) &&
      fileValidation(e, chosenFiles, dispatch)
    ) {
      handleUploadFiles(e, chosenFiles);
    }
  };

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  const defineStatusOfUploadByUser = useCallback(
    (user) => {
      var status = false;
      if (docType?.documentName === "Additional Document") {
        return false;
      } else if (
        user?.role === "Compliance Associate" &&
        docType?.documentName !== "RBI Intimation"
      ) {
        return true;
      } else if (
        user?.role === "Compliance Associate" &&
        docType?.documentName === "RBI Intimation"
      ) {
        return false;
      } else if (
        user?.role === "Sourcing Associate" &&
        docType?.documentName === "LOA"
      ) {
        return true;
      } else if (
        user?.role === "Sourcing Associate" &&
        docType?.documentName !== "LOA"
      ) {
        return false;
      } else if (
        user?.role === "Legal Associate" &&
        docType?.documentName === "LOA"
      ) {
        return false;
      } else if (
        user?.role === "Legal Associate" &&
        docType?.documentName !== "LOA"
      ) {
        return true;
      }

      return false;
    },
    [user, docType, setDocType]
  );
  const getBOQData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/BOQ/GetBOQDetails?mandateId=${
          mandateId?.id || 0
        }&boqId=${boq?.boqId || 0}&vendorId=${vendor?.vendorId || 0}`
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data && response?.data?.length > 0) {
          setBOQData(response?.data || []);
        } else {
          setBOQData([]);
        }
      })
      .catch((e: any) => {});
  };

  const saveOrUploadStaffDataByExcel = (e, formDataExcel) => {
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/BOQ/UploadAndSaveExcelData`,
        formDataExcel
      )
      .then((response: any) => {
        if (!response) {
          setUploadedFiles([]);
          setFileLimit(false);
          dispatch(fetchError("Please upload valid document"));
          getVersionHistoryData();
          getBOQData();
          getBOQSummary();
          e.target.value = null;
          return;
        }
        if (response?.status === 200) {
          setUploadedFiles([]);
          setFileLimit(false);
          response?.data?.status === "error" ? dispatch(fetchError(response?.data?.message)) : dispatch(showMessage(response?.data?.message));
          getVersionHistoryData();
          getBOQData();
          getBOQSummary();

          e.target.value = null;
        } else {
          setUploadedFiles([]);
          setFileLimit(false);
          e.target.value = null;
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Please upload valid document"));
      });
  };

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 97;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [docUploadHistory, docType]);
  const getHeightForProjectPlan = useCallback(() => {
    var height = 0;
    var dataLength = (projectPlanData && projectPlanData?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 56;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [projectPlanData, docType]);
  return (
    <div
      className="inside-scroll-198-boq"
      style={{
        backgroundColor: "#fff",
        padding: "10px",
        border: "1px solid #0000001f",
        borderRadius: "5px",
      }}
    >
      <>
        <div style={{ marginTop: "0px" }}>
          <Grid
            container
            item
            display="flex"
            flexDirection="row"
            spacing={5}
            justifyContent="start"
            alignSelf="center"
          >
            <Grid item xs={6} md={3}>
              <Autocomplete
                disablePortal
                sx={{ backgroundColor: "#f3f3f3", borderRadius: "6px" }}
                id="combo-box-demo"
                getOptionLabel={(option) => {
                  return option?.name?.toString() || "";
                }}
                disableClearable
                disabled
                options={[boqDrp] || []}
               
                placeholder="Document Type"
                value={boqDrp || null}
                renderInput={(params) => (
                  <TextField
                    name="state"
                    id="state"
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      style: { height: `35 !important` },
                    }}
                    error={!boqDrp}
                    variant="outlined"
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} md={6}>
              <div style={{ display: "flex" }}>
                {docType?.templatePath && (
                  <Button
                    sx={
                      approvalRole && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }
                    }
                    disabled={approvalRole}
                    onClick={() => {
                      downloadTemplate(docType);
                    }}
                    variant="outlined"
                    size="medium"
                    style={secondaryButton}
                  >
                    Download Template
                  </Button>
                )}
                <div>
                  <Button
                    disabled={approvalRole}
                    onClick={() => {
                      if (mandateId && mandateId?.id === undefined) {
                        dispatch(fetchError("Please Select Mandate !!!"));
                        return;
                      }
                      if (
                        !vendor?.hasOwnProperty("vendorId") ||
                        vendor?.vendorId === 0
                      ) {
                        dispatch(fetchError("Please Select Vendor !!!"));
                        return;
                      }
                      fileInput.current.click();
                    }}
                    sx={
                      approvalRole && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }
                    }
                    variant="outlined"
                    size="medium"
                    style={secondaryButton}
                  >
                    Upload
                  </Button>
                  <input
                    ref={fileInput}
                    multiple
                    onChange={handleFileEvent}
                    disabled={fileLimit}
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    type="file"
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </Grid>
          </Grid>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
              marginBottom: "5px",
            }}
          >
            <Typography>Version History</Typography>{" "}
          </div>
          <div
            style={{
              height: getHeightForTable(),
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            {(approvalRole
              ? isVendorSelected?.length > 0
                ? true
                : false
              : true) && (
              <CommonGrid
                defaultColDef={{ flex: 1 }}
                columnDefs={columnDefs}
                rowData={docUploadHistory || []}
                onGridReady={onGridReady}
                gridRef={gridRef}
                pagination={true}
                paginationPageSize={5}
              />
            )}
          </div>
        </div>
      </>
    </div>
  );
};

export default UploadBOQ;
