import {
  Autocomplete,
  Button,
  Grid,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import { secondaryButton } from "shared/constants/CustomColor";
import axios from "axios";
import {
  downloadFile,
  downloadTemplate,
  _validationMaxFileSizeUpload,
  fileValidation,
} from "../DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import groupByDocumentData from "../DocumentUploadMandate/Components/Utility/groupByDocumentData";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import DownloadIcon from "@mui/icons-material/Download";
import moment from "moment";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import { useLocation, useNavigate } from "react-router-dom";
import { useUrlSearchParams } from "use-url-search-params";
import { AppState } from "@auth0/auth0-react";
const MAX_COUNT = 8;

const bOQValue = {
  key: "Penalty Calculation",
  name: "Penalty Calculation",
};
const NDC = ({ mandateId, currentStatus, currentRemark }) => {
  const dispatch = useDispatch();
  const [projectPlanData, setProjectPlanData] = useState([]);
  const [boqDrp, setBoQ] = React.useState<any>(bOQValue);
  const [docType, setDocType] = React.useState<any>(null);
  const fileInput = React.useRef(null);
  const [fileLimit, setFileLimit] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [fileLength, setFileLength] = React.useState(0);
  const [penaltyData, setPenaltyData] = React.useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [value, setValue] = React.useState("0");
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [userAction, setUserAction] = React.useState(null);
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [params] = useUrlSearchParams({}, {});
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  const getVersionHistoryData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId?.id}&documentType=Penalty Calculation`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
          setPenaltyData(data || []);
        }

        if (response && response?.data?.length === 0) {
          setPenaltyData([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
        
      });
  };
  const getHistoryTable = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/GetPenaltyDetailsHistory?mandateId=${mandateId?.id}&penaltyId=149`
      )
      .then((response: any) => {
        if (!response) {
          return;
        } else {
          setPenaltyData([...response?.data]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
        
      });
  };
  const saveInHistoryTable = (res) => {
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/CreatePenaltyDetailsHistory`,
        res?.data
      )
      .then((response: any) => {
        if (!response) {
          return;
        } else {
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
        
      });
  };

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
            return;
          }
        }
      });
    if (limitExceeded) {
      dispatch(
        fetchError(`You can only add a maximum of ${MAX_COUNT} files` || "")
      );
      e.target.value=null;
      return;
    }

    if (!limitExceeded) setUploadedFiles(uploaded);
    setFileLength((uploaded && uploaded?.length) || 0);
    const formData: any = new FormData();
    formData.append("documenttype", "Penalty Calculation");
    formData.append("CreatedBy", user?.UserName || "");
    formData.append("ModifiedBy", user?.UserName || "");
    formData.append("entityname", "Penalty Calculation");
    formData.append("RecordId", mandateId?.id);
    formData.append("mandate_id", mandateId?.id);
    const formDataExcel: any = new FormData();
    formDataExcel.append("mandateId", mandateId?.id);

    uploaded &&
      uploaded?.map((file) => {
        formData.append("file", file);
      });
    if (uploaded?.length === 0) {
      setUploadedFiles([]);
      setFileLimit(false);
      dispatch(fetchError("Error Occurred !"));
      e.target.value=null;
      return;
    }
    for (var key in uploaded) {
      await formData.append("file", uploaded[key]);
      await formDataExcel.append("file", uploaded[key]);
    }
    if (mandateId?.id !== undefined) {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`,
          formData
        )
        .then((response: any) => {
          if (!response) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if(response?.data?.data == null) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Documents are not uploaded!"));
            getVersionHistoryData();
            return;
          }else if (response?.status === 200) {
            saveOrUploadStaffDataByExcel(e, formDataExcel);
            setUploadedFiles([]);
            setFileLimit(false);
            e.target.value = null;
            dispatch(showMessage("Documents are uploaded successfully!"));
          } else {
            dispatch(fetchError("Documents are not uploaded successfully!"));
            setUploadedFiles([]);
            setFileLimit(false);
            e.target.value = null;
            return;
          }
        })
        .catch((error: any) => {
          e.target.value=null;
          dispatch(fetchError("Error Occurred !"));
          
        });
    }
  
  };
  const getSaveOrUploadStaffDataByExcel = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/GetPenaltyDetailsByMandateId?Mandates_Id=${mandateId?.id}`
      )
      .then((response: any) => {
        if (!response) {
          return;
        }
        if (response) {
        }
      })
      .catch((e: any) => {
        
      });
  };
  const saveOrUploadStaffDataByExcel = (e, formDataExcel) => {
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/UploadAndSaveExcelData?Mandates_Id=${mandateId?.id}`,
        formDataExcel
      )
      .then((response: any) => {
        if (!response) {
          setUploadedFiles([]);
          setFileLimit(false);
          dispatch(fetchError("Error Occurred !"));
          e.target.value = null;
          return;
        }
        if (response?.status === 200) {
          setUploadedFiles([]);
          setFileLimit(false);
          dispatch(showMessage("Documents are uploaded successfully!"));
          getVersionHistoryData();

          e.target.value = null;
        } else {
          dispatch(fetchError("Documents are not uploaded successfully!"));
          setUploadedFiles([]);
          setFileLimit(false);
          e.target.value = null;
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
        
      });
  };

  React.useEffect(() => {
    if (mandateId && mandateId?.id !== undefined) {
      const userAction =
        userActionList &&
        userActionList?.find(
          (item) =>
            item?.mandateId === parseInt(mandateId?.id) &&
            item?.module === module
        );
      if (apiType === "") {
        setUserAction(userAction);
      } else {
        let action = mandateId;
        setUserAction(action);
      }
      if (params.source === "list") {
        navigate(`/mandate/${mandateId?.id}/${module}?source=list`, {
          state: { apiType: apiType },
        });
      } else {
        navigate(`/mandate/${mandateId?.id}/${module}`, {
          state: { apiType: apiType },
        });
      }
    }
  }, [mandateId]);
  useEffect(() => {
    if (mandateId?.id !== undefined) {
      getVersionHistoryData();
    }
  }, [mandateId?.id]);

  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch) && fileValidation(e,chosenFiles,dispatch)) {
      handleUploadFiles(e, chosenFiles);
    }
  };

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

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  let columnDefs = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip : "Serial Number",
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
      headerTooltip : "Report Type",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "filename",
      headerName: "File Name",
      headerTooltip : "File Name",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.filename;
        data = data?.split(".");
        data = data?.[0];
        return data || "";
      },
      width: 400,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      headerTooltip : "Created Date",
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
      headerTooltip : "Created Time",
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
      headerTooltip : "Created By",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Download",
      headerName: "Download",
      headerTooltip : "Download",
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
      headerTooltip : "View",
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

  

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (penaltyData && penaltyData?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [penaltyData, docType]);
  const getHeightForProjectPlan = useCallback(() => {
    var height = 0;
    var dataLength = (projectPlanData && projectPlanData?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 56;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [projectPlanData, docType]);


  return (
    <>
      <div>
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
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </Grid>
          <Grid item xs={6} md={6}>
            <div style={{ display: "flex" }}>
             {docType?.templatePath && <Button
                onClick={() => {
                  downloadTemplate(docType);
                }}
                variant="outlined"
                size="medium"
                style={secondaryButton}
              >
                Download Template
              </Button>}
              <div>
                <Button
                  onClick={() => {
                    if (mandateId?.id === undefined) {
                      dispatch(fetchError("Please select Mandate !!!"));
                      return;
                    }
                    fileInput.current.click();
                  }}
                  sx={
                    defineStatusOfUploadByUser(user) && {
                      backgroundColor: "#f3f3f3",
                      borderRadius: "6px",
                    }
                  }
                  disabled={defineStatusOfUploadByUser(user)}
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
                  accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
  text/plain, application/pdf, image/*"
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
          }}
        >
          <Typography>Version History</Typography>{" "}
        </div>
        <div style={{ height: getHeightForTable(), marginTop: "10px" }}>
          <CommonGrid
            defaultColDef={{ flex: 1 }}
            columnDefs={columnDefs}
            rowData={penaltyData || []}
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

export default NDC;
