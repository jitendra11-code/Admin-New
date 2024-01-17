import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import React, { useCallback, useEffect } from "react";
import axios from "axios";
import { Autocomplete, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography,alpha } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useFormik } from "formik";
import { addPhaseInitialValues, addPhaseSchema } from "@uikit/schemas";
import { useNavigate } from "react-router-dom";
import { TbPencil } from "react-icons/tb";
import { FiUpload } from "react-icons/fi";
import { secondaryButton } from "shared/constants/CustomColor";
import { primaryButtonSm } from 'shared/constants/CustomColor';
import SearchIcon from '@mui/icons-material/Search';
import { AiFillFileExcel, AiOutlinePlus } from "react-icons/ai";
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import moment from "moment";
import { getIdentifierList } from "@uikit/common/Validation/getIdentifierListMenuWise";
import { useDispatch, useSelector } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import { textFieldValidationOnPaste, regExpressionRemark } from "@uikit/common/RegExpValidation/regForTextField";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { AppState } from "redux/store";
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import { _validationMaxFileSizeUpload, fileValidation } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import DownloadIcon from "@mui/icons-material/Download";
import { downloadFile } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import AppTooltip from "@uikit/core/AppTooltip";


const MAX_COUNT = 8;
type Anchor = "right";
const Phase = () => {
  const [_validationIdentifierList, setValidationIdentifierList] =
    React.useState([]);
  const [mandateId, setMandateId] = React.useState(null);
  const [phaseData, setPhaseData] = React.useState<any>([]);
  const [country, setCountry] = React.useState("");
  const [vertical, setVertical] = React.useState("");
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const gridRef2 = React.useRef<AgGridReact>(null);
  const [gridApi2, setGridApi2] = React.useState<GridApi | null>(null);
  const [openModal, setOpenModal] = React.useState(false);
  const [remarks, setRemarks] = React.useState("");
  const [docType, setDocType] = React.useState(null);
  const { user } = useAuthUser();
  const [docUploadHistory, setDocUploadHistory] = React.useState([]);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const fileInput = React.useRef(null);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [fileLimit, setFileLimit] = React.useState(false);
  const [userAction, setUserAction] = React.useState(null);
  const [fileLength, setFileLength] = React.useState(0);
  const [documentTypeList, setDocumentTypeList] = React.useState([]);
  const [phaseId, setPhaseId] = React.useState<any>("");

  const action = userAction?.action || "";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (gridApi) {
      gridApi!.sizeColumnsToFit();
    }
  }, [phaseData]);

  useEffect(() => {
    var _validationIdentifierList = getIdentifierList();
    setValidationIdentifierList(_validationIdentifierList);
  }, []);

  const handleChangeDropdown = (event: any) => {
    setCountry(event.target.value);
  };
  const handleVerticalDropdown = (event: any) => {
    setVertical(event.target.value);
  };

  const getPhase = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Phases/GetAllPhases?pageNumber=1&pageSize=100&sort={}&filter=[]`
      )
      .then((response: any) => {
        setPhaseData(response.data.List);
      })
      .catch((e: any) => { });
  };
  useEffect(() => {
    getPhase();
  }, []);

  const handalOpenModal = (phase, mandate) => {
    setOpenModal(true);
    setPhaseId(phase);
  };

  useEffect(() => {
    if (documentTypeList && documentTypeList?.length > 0) {
      var obj =
        documentTypeList &&
        documentTypeList.find((item) => item?.documentName === "Mandate List");
      setDocType(obj || null);
    }
  }, [documentTypeList]);
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

  useEffect(() => {
    getDocumentTypeList();
  }, []);

  let rowData: any = [
    {
      id: 35,
      country: "India",
      vertical: "Urban Metro",
      name: "Phase 1",
      branches: "10",
      completion: "20",
      status: "Inprogess",
    },
  ];

  const defineStatusOfUploadByUser = useCallback(
    (user) => {
      var status = false;

      if (
        user?.role !== "Sourcing Associate" &&
        (docType?.documentName === "LOI" ||
          docType?.documentName === "TSR" ||
          docType?.documentName === "Additional Document" ||
          docType?.documentName === "Lease Deed Sign Copy")
      ) {
        return true;
      } else if (
        user?.role !== "Compliance Associate" &&
        docType?.documentName === "RBI Intimation"
      ) {
        return true;
      } else if (
        user?.role !== "Legal Associate" &&
        (docType?.documentName === "Lease Deed" ||
          docType?.documentName === "LOA")
      ) {
        return true;
      }

      return false;
    },
    [user, docType, setDocType]
  );

  const downloadTemplate = (docType) => {
    if (docType && docType.documentName !== "") {
      axios
        .get(
          `${process.env.REACT_APP_BASEURL}/api/ImageStorage/DownloadTemplate?documenttype=${docType?.documentName}`,
          {
            responseType: "arraybuffer", 
          }
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (response?.data) {
            var filename =
              response.headers["content-disposition"].split("''")[1];
            if (!filename) {
              dispatch(fetchError("Error Occurred !"));
              return;
            }

            var blob = new Blob([response?.data], {
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
    }
  };

  const getVersionHistoryData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId?.id || 0
        }&documentType=${docType?.documentName}`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
          setDocUploadHistory(data || []);
        }

        if (response && response?.data?.length === 0) {
          setDocUploadHistory([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  useEffect(() => {
    getVersionHistoryData();
  }, [docType]);

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
    const formData2: any = new FormData();
    formData.append("mandate_id", mandateId?.id || 0);
    formData.append("documenttype", docType?.documentName);
    formData.append("CreatedBy", user?.UserName || "");
    formData.append("ModifiedBy", user?.UserName || "");
    formData.append("entityname", docType?.documentName);
    formData.append("RecordId", phaseId);
    formData.append("remarks", remarks || "");
    for (var key in uploaded) {
      await formData.append("file", uploaded[key]);
    }
    for (var key in uploaded) {
      await formData2.append("file", uploaded[key]);
    }

    if (uploaded?.length === 0) {
      setUploadedFiles([]);
      setFileLimit(false);
      dispatch(fetchError("Error Occurred !"));
      e.target.value = null;
      return;
    }
    if (formData) {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL
          }/api/Mandates/UploadAndSaveExcelData?PhaseId=${phaseId || 0}`,
          formData2
        )
        .then((res) => {
          if (res?.data?.status) {
            dispatch(showMessage(res?.data?.message));
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
                  setRemarks("");
                  setUploadedFiles([]);
                  setFileLimit(false);
                  dispatch(fetchError("Documents are not uploaded!"));
                  getVersionHistoryData();
                  return;
                } else if (response?.status === 200) {
                  setRemarks("");
                  setUploadedFiles([]);
                  setFileLimit(false);
                  dispatch(showMessage("Documents are uploaded successfully!"));
                  getVersionHistoryData();
                }
              })
              .catch((e: any) => {
                e.target.value = null;
                dispatch(fetchError("Error Occurred !"));
              });
          } else {
            dispatch(fetchError(res?.data?.message));
          }
        })
        .catch((err) => {
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

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [docUploadHistory, docType]);

  let columnDefs2 = [
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
      headerTooltip: "Download",
      resizable: true,
      width: 110,
      minWidth: 100,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (obj: any) => (
        <>
          <div className="actions">
            <DownloadIcon
              style={{ fontSize: "15px" }}
              onClick={() => downloadFile(obj?.data, { id: 0 }, dispatch)}
              className="actionsIcons"
            />
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

  let columnDefs = [
    {
      field: "medals.bronze",
      headerName: "Actions",
      headerTooltip: "Actions",
      width: 120,
      minWidth: 120,
      pinned: "left",
      cellRenderer: (e: any) => (
        <>
          <div className="actions">
            {!_validationIdentifierList?.includes("ph_icon_add_mandate") && (
              <Tooltip title="Add Mandate" className="actionsIcons">
                <button className="actionsIcons actionsIconsSize">
                  <AiOutlinePlus
                    onClick={() =>
                      e?.data?.mandatesCount < e?.data?.no_of_branches
                        ? navigate(
                          `/mandate/${e?.data?.phasecode}/${e?.data?.mandateCode}/add?source=list`
                        )
                        : alert(`You can't add more mandates.`)
                    }
                  />
                </button>
              </Tooltip>
            )}
            <Tooltip title="Edit Phase" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize">
                <TbPencil
                  onClick={() => navigate(`/phase/${e?.data?.id}/update`)}
                />
              </button>
            </Tooltip>
            {!_validationIdentifierList?.includes(
              "ph_icon_bulk_upload_mandate"
            ) && (
                <Tooltip title="Upload Document" className="actionsIcons">
                  <button className="actionsIcons actionsIconsSize">
                    <FiUpload
                      onClick={() =>
                        navigate(`/phase/${e?.data?.id}/mandate-bulk-upload`, {
                          state: { mandateId: mandateId },
                        })
                      }
                    />
                  </button>
                </Tooltip>
              )}

          </div>
        </>
      ),
    },
    {
      field: "phasecode",
      headerName: "Phase Code",
      headerTooltip: "Phase Code",
      sortable: true,
      resizable: true,
      width: 145,
      minWidth: 145,
      // comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "phasename",
      headerName: "Phase Name",
      headerTooltip: "Phase Name",
      sortable: true,
      resizable: true,
      width: 122,
      minWidth: 122,
      // comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },
   
    {
      field: "verticalname",
      headerName: "Geo Vertical",
      headerTooltip: "Geo Vertical",
      sortable: true,
      resizable: true,
      width: 170,
      minWidth: 170,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "admin_Vertical_Types",
      headerName: "Admin Vertical",
      headerTooltip: "Admin Vertical",
      sortable: true,
      resizable: true,
      width: 200,
      minWidth: 200,
      // comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "gL_category_Types",
      headerName: "GL Category",
      headerTooltip: "GL Category",
      sortable: true,
      resizable: true,
      width: 200,
      minWidth: 200,
      // comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },
    
    {
      field: "createdDate",
      headerName: "Phase Initiated On",
      headerTooltip: "Phase Initiated On",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 190,
      cellStyle: { fontSize: "13px" },
      cellRenderer: (e: any) => {
        return moment(e?.data?.createdDate).format("DD/MM/YYYY , hh:mm:ss a");
      },
      // valueFormatter: params => (params?.data?.createdDate && moment(params?.data?.createdDate).isValid() && params?.data?.createdDate?.split("T")?.[0]) || null,
    },
    {
      field: "createdBy",
      headerName: "Phase Initiated By",
      headerTooltip: "Phase Initiated By",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      // comparator: StringComparator,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "no_of_branches",
      headerName: "Number of Mandates",
      headerTooltip: "Number of Mandates",
      sortable: true,
      resizable: true,
      width: 177,
      minWidth: 177,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "status",
      headerName: "Status",
      headerTooltip: "Status",
      sortable: true,
      resizable: true,
      width: 90,
      minWidth: 90,
      cellStyle: { fontSize: "13px" },
    },
  ];

  const [state, setState] = React.useState({
    right: false,
  });

  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
      (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
          event.type === "keydown" &&
          ((event as React.KeyboardEvent).key === "Tab" ||
            (event as React.KeyboardEvent).key === "Shift")
        ) {
          return;
        }

        setState({ ...state, [anchor]: open });
      };

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: addPhaseInitialValues,
      validationSchema: addPhaseSchema,
      validateOnChange: true,
      validateOnBlur: false,
      onSubmit: (values, action) => {
        let con: any = +values?.country;
        let ver: any = +values?.vertical;
        let nob: any = +values?.numberOfBranch;
        const body = {
          phasename: values?.phaseName,
          no_of_branches: nob,
          fk_country_id: con,
          fk_vertical_id: ver,
          CreatedBy: user?.UserName,
          ModifiedBy: user?.UserName,
        };
        axios
          .post(`${process.env.REACT_APP_BASEURL}/api/Phases/CreatePhase`, body)
          .then((response: any) => {
            action.resetForm();
            getPhase();
          })
          .catch((e: any) => {
            action.resetForm();
          });
      },
    });

  const [gridColumnApi, setGridColumnApi] = React.useState(null);

  function onGridReady(params) {

    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }
  function onGridReady2(params) {

    gridRef2.current!.api.sizeColumnsToFit();
    setGridApi2(params.api);
  }

  const onFilterTextChange = async (e) => {
    gridApi?.setQuickFilter(e.target.value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"));
    }
  };

  const handleExportData = () => {
    axios
    .get(
      `${process.env.REACT_APP_BASEURL}/api/Phases/ExcelDownloadForPhases`
    )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "PhaseData.xlsx";
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
              showMessage("Phase Data downloaded successfully!")
            );
          }
        }
      });
  };

  return (
    <>
      {" "}
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "15px",
        }}
      >
        <Box component="h2" className="page-title-heading mb-0">
          Phase
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
            {!_validationIdentifierList?.includes("ph_button_add_phase") && (
              <Button
                size="small"
                style={primaryButtonSm}
                sx={{ color: "#fff", fontSize: "12px" }}
                onClick={() => navigate("/phase/add")}
              >
                Initiate Phase
              </Button>
            )}
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
        </div>
      </Grid>
      {/* <div style={{height: "calc(100vh - 150px)", overflow:"hidden"}}> */}
      <CommonGrid
        defaultColDef={null}
        columnDefs={columnDefs}
        rowData={phaseData}
        onGridReady={onGridReady}
        gridRef={gridRef}
        pagination={true}
        paginationPageSize={10}
      />
      {/* </div> */}
      <Dialog
        fullWidth
        maxWidth="lg"
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
     
      >
        <DialogTitle
          id="alert-dialog-title"
          style={{ paddingRight: 20, fontSize: 16, color: "#000" }}
        >
          {"Mandate Bulk Upload"}
        </DialogTitle>
        <DialogContent>
          <div style={{ height: "calc(100vh - 260px)" }}>
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
                  <Autocomplete
                    disablePortal
                    sx={{
                      backgroundColor: "#f3f3f3",
                      borderRadius: "6px",
                    }}
                    id="combo-box-demo"
                    getOptionLabel={(option) =>
                      option?.documentName?.toString() || ""
                    }
                    disableClearable={true}
                    disabled={true}
                    options={[]}
                    onChange={(e, value) => {
                    }}
                    placeholder="Document Type"
                    value={docType}
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
                        if (
                          e.target.selectionStart === 0 &&
                          e.code === "Space"
                        ) {
                          e.preventDefault();
                        }
                        regExpressionRemark(e);
                      }}
                    />
                  </div>
                </Grid>

                <Grid item xs={6} md={4}>
                  <div style={{ display: "flex" }}>
                    {docType?.templatePath && (
                      <Button
                        onClick={() => downloadTemplate(docType)}
                        variant="outlined"
                        size="medium"
                        type="button"
                        style={secondaryButton}
                        sx={
                          (action === "Approve" ||
                            action === "Approve or Reject" ||
                            defineStatusOfUploadByUser(user)) && {
                            backgroundColor: "#f3f3f3",
                            borderRadius: "6px",
                          }
                        }
                        disabled={
                          action === "Approve" ||
                          action === "Approve or Reject" ||
                          defineStatusOfUploadByUser(user)
                        }
                      >
                        Download Template
                      </Button>
                    )}
                    <div style={{ marginLeft: "7px" }}>
                      <Button
                        onClick={() => {
                          fileInput.current.click();
                        }}
                        sx={
                          (action === "Approve" ||
                            action === "Approve or Reject" ||
                            defineStatusOfUploadByUser(user)) && {
                            backgroundColor: "#f3f3f3",
                            borderRadius: "6px",
                          }
                        }
                        disabled={
                          action === "Approve" ||
                          action === "Approve or Reject" ||
                          defineStatusOfUploadByUser(user)
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
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        type="file"
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                </Grid>
              </Grid>
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

                <div style={{ height: getHeightForTable(), marginTop: "10px" }}>
                  <CommonGrid
                    defaultColDef={{ flex: 1 }}
                    columnDefs={columnDefs2}
                    rowData={docUploadHistory || []}
                    onGridReady={null}
                    gridRef={null}
                    pagination={false}
                    paginationPageSize={null}
                  />
                </div>
              </>
            </div>{" "}
          </div>
        </DialogContent>
        <DialogActions style={{ justifyContent: "center" }}>
          <Button className="no-btn" onClick={() => setOpenModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Phase;
export function StringComparator(valueA: string = "", valueB: string = "") {
  const valueALower = valueA?.toLowerCase().trim();
  const valueBLower = valueB?.toLowerCase().trim();
  return valueALower?.localeCompare(valueBLower, "en", { numeric: true });
}
