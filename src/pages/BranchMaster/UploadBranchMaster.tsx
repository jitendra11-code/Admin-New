import { Autocomplete, Box, Grid, TextField,Button, Typography, Tabs, Tab, Tooltip } from '@mui/material';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { regExpressionRemark, textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import axios from 'axios';
import { useFormik } from 'formik';
import moment from 'moment';
import { _validationMaxFileSizeUpload, downloadFile, fileValidation } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import React, {useState, useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage, showWarning } from 'redux/actions';
import { secondaryButton } from 'shared/constants/CustomColor';
import DownloadIcon from "@mui/icons-material/Download";
import FileNameDiaglogList from 'pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox';
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

declare global {
    interface Navigator {
      msSaveBlob?: (blob: any, defaultName?: string) => boolean;
    }
}
  
const TabPanel: (props: TabPanelProps) => any = (props: TabPanelProps) => {
const { children, value, index, ...other } = props;
return (
    <div
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    {...other}
    >
    {children}
    </div>
);
};

const MAX_COUNT = 8;
const UploadBranchMaster = () => {
    const [dropdownList,setDropdownList] = useState([]);
    const [remarks, setRemarks] = React.useState("");
    const [docType, setDocType] = React.useState(null);
    const { user } = useAuthUser();
    const fileInput = React.useRef(null);
    const [fileLimit, setFileLimit] = React.useState(false);
    const [value, setValue] = React.useState<any>(0);
    const [uploadedFiles, setUploadedFiles] = React.useState([]);
    const [fileLength, setFileLength] = React.useState(0);
    const [docUploadHistory, setDocUploadHistory] = React.useState([]);
    const [filteredDocUploadHistory, setFilteredDocUploadHistory] = React.useState([]);

    const dispatch = useDispatch();
    const drop  = "Branch Master";
    
    const handleTab = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        if (newValue === 0) {
          getVersionHistoryData();
        } else if (newValue === 1) {
          getHistoryCompletedData();
        }
        else if(newValue === 2)
        {
          getHistoryErrorData();
        }
    };

    const handleFileEvent = (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files);
        if (_validationMaxFileSizeUpload(e, dispatch) && fileValidation(e, chosenFiles, dispatch)) {
          getUploadNumber(e, chosenFiles);
        }
    };

    const getUploadNumber = (e, files) => {
        axios
          .get(`${process.env.REACT_APP_BASEURL}/api/MasterBulkUpload/GenerateRecordId`)
          .then((response: any) => {
            if (!response) return;
            if (
              response &&
              response?.data &&
              response?.data &&
              response?.status === 200
            ) {
              var recId = response?.data;
              handleUploadFiles(e, files, recId);
            } else {
              e.target.value = null;
              dispatch(fetchError("Error Occurred !"));
              return;
            }
          })
          .catch((e: any) => {
            dispatch(fetchError("Error Occurred !"));
          });
    };

    const handleUploadFiles = async (e, files, recId) => {
      const uploaded = [...uploadedFiles];
      console.log("handleUploadFiles recID",recId);
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
              return;
            }
          }
        });
  
      if (limitExceeded) {
        dispatch(
          fetchError(`You can only add a maximum of ${MAX_COUNT} files` || "")
        );
  
        return;
      }
  
      if (!limitExceeded) setUploadedFiles(uploaded);
      setFileLength((uploaded && uploaded?.length) || 0);
      const formData: any = new FormData();
      const formDataTemp: any = new FormData();
      formData.append("mandate_id", 0);
      formData.append("documenttype", drop);
      formData.append("CreatedBy", user?.UserName || "");
      formData.append("ModifiedBy", user?.UserName || "");
      formData.append("entityname", drop);
      formData.append("RecordId", recId || 0);
      formData.append("remarks", remarks || "");
      formDataTemp.append("recordId", recId || 0);
      for (var key in uploaded) {
        await formData.append("file", uploaded[key]);
      }
      for (var keys in uploaded) {
        await formDataTemp.append("file", uploaded[keys]);
      }
  
      if (uploaded?.length === 0) {
        setUploadedFiles([]);
        setFileLimit(false);
        dispatch(fetchError("Error Occurred !"));
        return;
      }
      if (formData) {
  
        dispatch(
          showWarning(
            "Upload is in progress, please check after sometime"
          )
        );
  
        axios
          .post(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`,formData)
          .then((response: any) => {
            console.log("response",response);
            if (!response) {
              setUploadedFiles([]);
              setFileLimit(false);
              dispatch(fetchError("Error Occurred !"));
              return;
            }
            if (response?.data?.data == null) {
              setRemarks("");
              setUploadedFiles([]);
              setFileLimit(false);
              dispatch(fetchError("Documents are not uploaded!"));
              getVersionHistoryData();
              return;
            } else if (response?.data?.code === 200) {
              setRemarks("");
              setUploadedFiles([]);
              setFileLimit(false);
              dispatch(showMessage("Documents are uploaded successfully!"));
              getVersionHistoryData();
              axios
                .post(`${process.env.REACT_APP_BASEURL}/api/BranchMasterDetails/UploadAndSaveExcelData`,formDataTemp)
                .then((res) => {
                  console.log("res",res);
                  if (!res) {
                    e.target.value = null;
                    dispatch(fetchError("Error Occured when uploading file !!!"));
                    return;
                  }
                  e.target.value = null;
                  if (res?.data?.status) {
                    dispatch(showMessage(res?.data?.message));
                  }
  
                })
                .catch((err) => {
                });
            }
          })
          .catch((e: any) => {
            dispatch(fetchError("Error Occurred !"));
          });
      }
    };

    const getVersionHistoryData = async () => {
      await axios
        .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${0}&documentType=${drop}`)
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (response?.data && response?.data?.length > 0) {
            var data = groupByDocumentData(response?.data, "versionNumber");
            setFilteredDocUploadHistory(data);
          }
  
          if (response && response?.data?.length === 0) {
            setFilteredDocUploadHistory([]);
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occurred !"));
        });
    };
    useEffect(() => {
      getVersionHistoryData();
    }, []);

    const getHistoryCompletedData = async () => {
        await axios 
        .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocCompleteHistory?mandateid=${0}&entityname=${drop}&documentType=${drop}`)
        .then((response) => {
          console.log("Complete", response?.data);
          let data = response?.data?.data?.map(v => ({...v , fileList : [{filename : v?.filename}]}))
          // var data = groupByDocumentData(response?.data, "versionNumber");
          setFilteredDocUploadHistory(data);
            // dispatch(showMessage(response?.message));
        })
        .catch((error) => {
          dispatch(fetchError(error?.message));
        });
    };

    const getHistoryErrorData = async () => {
      await axios
        .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocErrorsHistory?mandateid=${0}&entityname=${drop}&documentType=${drop}`)
        .then((response) => {
          // console.log("response ddc", response);
          let data = response?.data?.data?.map(v => ({...v , fileList : [{filename : v?.filename}]}))
          // var data = groupByDocumentData(response?.data, "versionNumber");
          setFilteredDocUploadHistory(data);
            // dispatch(showMessage(response?.message));
        })
        .catch((error) => {
          dispatch(fetchError(error?.message));
        });
    };

    
    let columnDefs2 = [
      {
        field: "srno",
        headerName: "Sr. No",
        headerTooltip: "Serial Number",
        cellRenderer: (e) => {
          var index = e?.rowIndex;
          return index + 1;
        },
    
        sortable: true,
        resizable: true,
        width: 96,
        minWidth: 96,
        cellStyle: { fontSize: "13px" },
      },
      {
        field: "documenttype",
        headerName: "Report Type",
        headerTooltip: "Report Type",
        sortable: true,
        resizable: true,
        width: 151,
        minWidth: 151,
        cellStyle: { fontSize: "13px" },
      },
      {
        field: "filename",
        headerName: "File Name",
        headerTooltip: "File Name",
        sortable: true,
        resizable: true,
        cellRenderer: (e) => {
          var data = e.data.filename;
          data = data?.split(".");
          data = data?.[0];
          return data || "";
        },
        width: 200,
        minWidth: 187,
        cellStyle: { fontSize: "13px" },
      },
      {
        field: "createdDate",
        headerName: "Created Date",
        headerTooltip: "Created Date",
        sortable: true,
        resizable: true,
        cellRenderer: (e) => {
          return moment(e?.data?.createdDate).format("DD/MM/YYYY");
        },
        width: 151,
        minWidth: 151,
        cellStyle: { fontSize: "13px" },
      },
      {
        field: "createdDate",
        headerName: "Created Time",
        headerTooltip: "Created Time",
        cellRenderer: (e) => {
          return moment(e?.data?.createdDate).format("h:mm:ss A");
        },
        sortable: true,
        resizable: true,
        width: 151,
        minWidth: 151,
        cellStyle: { fontSize: "13px" },
      },
      {
        field: "createdBy",
        headerName: "Created By",
        headerTooltip: "Created By",
        sortable: true,
        resizable: true,
        width: 145,
        minWidth: 145,
        cellStyle: { fontSize: "13px" },
      },
      {
        field: "Download",
        headerName: "Uploaded File",
        headerTooltip: "Uploaded File",
        resizable: true,
        width: 160,
        minWidth: 145,
        cellStyle: { fontSize: "13px", textAlign: "center" },
    
        cellRenderer: (obj) => (
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
        field: "Download Log",
        headerName:  value ===1 ?"Uploaded Log" :  " Error Log",
        headerTooltip: value ===1 ?"Uploaded Log" :  " Error Log",
        resizable: true,
        hide: value === 0,
        width: 160,
        minWidth: 145,
        cellStyle: { fontSize: "13px", textAlign: "center" },
    
        cellRenderer: (obj) => (
          <>
            <div className="actions">       
            <Tooltip title={value ===1 ?"Uploaded Log File" :  " Error Log File"} className="actionsIcons">
              <DownloadIcon
                style={{ fontSize: "15px" }}
                onClick={() => downloadFileLogFile(obj?.data)}
                className="actionsIcons"
              />
               </Tooltip>
            </div>
          </>
        ),
      },
      {
        field: "count",
        headerName: "Count",
        headerTooltip: "Count",
        resizable: true,
        width: 145,
        minWidth: 145,
        hide: value === 0,
        cellStyle: { fontSize: "13px"},
      },
    ];

    const downloadFileLogFile =(data)=>{
       axios
      .get(`${process.env.REACT_APP_BASEURL}/api/BranchMasterDetails/DownloadlogData?UploadNo=${data?.recordId || 0}&MasterName=${drop}&Type=${value == 1 ? "Completed": "Error"}`)
      .then((response : any) => {
        console.log("log file", response)
        if (!response) {
          dispatch(fetchError("Error Occurred in first!"));
          return;
        }
        if (response) {
          var filename = `Branch_Master_Bulk_Upload_Log(${moment().format("ddd DD/MM/YYYY hh:mm:ss A")}).xlsx`
          if (!filename) {
            dispatch(fetchError("Error Occurred filename!"));
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

          dispatch(showMessage("Branch Master Bulk Upload log file is downloaded successfully!"));
          }
        }
      })
      .catch((e : any) => {
        dispatch(fetchError("Error Occurred last!"));
      });
    }

    const downloadTemplate = () => {
        axios
          .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/DownloadTemplate?documenttype=${drop || ""}&DocumentName=${drop || ""}`)
          .then((response: any) => {
            if (!response) {
              dispatch(fetchError("Error Occurred !"));
              return;
            }
            if (response?.data) {
              var filename = response.data.filename;
              if (filename && filename === "") {
                dispatch(fetchError("Error Occurred !"));
                return;
              }
              const binaryStr = atob(response?.data?.base64String);
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
                  showMessage("Document Template is downloaded successfully!")
                );
              }
            }
          })
          .catch((e: any) => {
            dispatch(fetchError("Error Occurred !"));
          });
    };
    return(
        <>
            <Box component="h2" className="page-title-heading my-6">
                Branch Master Bulk Upload
            </Box>
            <div
                style={{
                height: "calc(100vh - 260px)",
                border: "1px solid rgba(0, 0, 0, 0.12)",
                }}
                className="card-panal"
            >
                <div style={{ margin: "10px" }}>
                <Grid
                    container
                    item
                    display="flex"
                    flexDirection="row"
                    spacing={4}
                    justifyContent="start"
                    alignSelf="center"
                >
                    <Grid item xs={6} md={3}>
                        <TextField
                        name="state"
                        id="state"
                        variant="outlined"
                        size="small"
                        className="w-85"
                        type="text"
                        disabled={true}
                        placeholder="Remarks"
                        value={drop}
                        />
                    </Grid>

                    <Grid item xs={7} md={5} sx={{ position: "relative" }}>
                        <div>
                            <TextField
                            name="remarks"
                            id="remarks"
                            variant="outlined"
                            size="small"
                            className="w-85"
                            type="text"
                            placeholder="Remarks"
                            onChange={(e: any) => setRemarks(e.target.value)}
                            value={remarks}                  
                            onPaste={(e: any) => {
                                if (!textFieldValidationOnPaste(e)) {
                                dispatch(fetchError("You can not paste Spacial characters"))
                                }
                            }}
                            onKeyDown={(e: any) => {
                                if (e.target.selectionStart === 0 && e.code === "Space") {
                                e.preventDefault();
                                }
                                regExpressionRemark(e);
                            }}
                            />
                        </div>
                    </Grid>

                    <Grid item xs={6} md={4}>
                        <div style={{ display: "flex" }}>
                            <Button
                            onClick={() => downloadTemplate()}
                            variant="outlined"
                            size="medium"
                            type="button"
                            style={secondaryButton}
                            >
                            Download Template
                            </Button>
                            <div style={{ marginLeft: "7px" }}>
                            <Button
                                onClick={() => {fileInput.current.click();}}
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
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                type="file"
                                style={{ display: "none" }}
                            />
                            </div>
                        </div>
                    </Grid>
                </Grid>

                <Box
                    sx={{ borderBottom: 1, borderColor: "divider" }}
                    style={{ marginTop: "0px" }}
                >
                    <Tabs
                    value={value}
                    onChange={handleTab}
                    aria-label="lab API tabs example"
                    >
                    <Tab value={0} label="In Progress" />
                    <Tab value={1} label="Completed " />
                    <Tab value={2} label="Error" />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0} key="0"></TabPanel>
                <TabPanel value={value} index={1} key="1"></TabPanel>
                <TabPanel value={value} index={2} key="2"></TabPanel>
                <>
                    <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                    >
                    <Typography className="section-headingTop">
                        Version History
                    </Typography>
                    </div>
                    <div style={{ height: "calc(100vh - 401px)", marginTop: "10px" }}>
                    <CommonGrid
                        defaultColDef={{ flex: 1 }}
                        columnDefs={columnDefs2}
                        rowData={filteredDocUploadHistory || []}
                        onGridReady={null}
                        gridRef={null}
                        pagination={false}
                        paginationPageSize={null}
                    />
                    </div>
                </>
                </div>
            </div>
        </>
    )
}

export default UploadBranchMaster;