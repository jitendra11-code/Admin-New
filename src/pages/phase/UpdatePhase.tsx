import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Grid,
  Typography,
  Autocomplete,
  Tooltip
} from "@mui/material";
import Select from "@mui/material/Select";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import "./style.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { secondaryButton, submit } from "shared/constants/CustomColor";
import { useDispatch, useSelector } from "react-redux";
import { SHOW_MESSAGE } from "types/actions/Common.action";
import { fetchError, showMessage, showWarning } from "redux/actions";
import { useUrlSearchParams } from "use-url-search-params";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { AppState } from "redux/store";
import moment from "moment";
import blockInvalidChar from "pages/Mandate/Location/Components/blockInvalidChar ";
import { _validationMaxFileSizeUpload, downloadFile, downloadTemplate } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import DownloadIcon from "@mui/icons-material/Download";
import regExpressionTextField, { textFieldValidationOnPaste, regExpressionRemark } from "@uikit/common/RegExpValidation/regForTextField";


const MAX_COUNT = 8;
const UpdatePhase = (props) => {
  const [data, setData] = React.useState<any>({});
  const [params] = useUrlSearchParams({}, {});
  const [projectDeliveryManagerData, setProjectDeliveryManagerData] =
    React.useState([]);
  const [projectManagerData, setProjectManagerData] = React.useState([]);
  const { user } = useAuthUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const fileInput = React.useRef(null);

  const [remarks, setRemarks] = React.useState("");
  const [docType, setDocType] = React.useState(null);
  const [phaseId, setPhaseId] = useState(null);
  const [docUploadHistory, setDocUploadHistory] = React.useState([]);
  const [documentTypeList, setDocumentTypeList] = React.useState([]);

  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [fileLimit, setFileLimit] = React.useState(false);
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  React.useEffect(() => {
    if (id && id != "noid") {
      setPhaseId(id);
    }
  }, []);

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

  useEffect(() => {
    if (documentTypeList && documentTypeList?.length > 0) {
      var obj =
        documentTypeList &&
        documentTypeList.find((item) => item?.documentName === "Initiate Phase");
      setDocType(obj || null);
    }
  }, [documentTypeList]);
  React.useEffect(() => {
    if (phaseId && phaseId !== undefined && phaseId !== "noid") {
      const userAction =
        userActionList &&
        userActionList?.find(
          (item) =>
            item?.tableId === parseInt(phaseId) && item?.module === module
        );
      setUserAction(userAction);
    }
  }, [phaseId, setPhaseId]);

  const workflowFunctionAPICall = (
    runtimeId = 0,
    tableId = 0,
    mandateId = 0,
    remark,
    action,
    navigate,
    user
  ) => {
    const token = localStorage.getItem("token");
    const body = {
      runtimeId: runtimeId,
      mandateId: 0,
      tableId: tableId || 0,
      remark: remark || "",
      createdBy: user?.UserName,
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: "Assign Project Manager",
    };
    axios({
      method: "post",
      url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${remark}`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response: any) => {
        if (!response) return;

        if (response?.data === true) {
          if (params?.source === "list") {
            navigate("/list/task");
          } else {
            navigate("/list/phase");
          }
        } else {
          dispatch(fetchError("Error Occured !!"));
        }
      })
      .catch((e: any) => { });
  };

  const getById = () => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Phases/GetPhase?id=${id}`)
      .then((response: any) => {
        if (!response) return;
        var data = response?.data || [];
        setData({
          ...data,
          projectDeliveryManager: data?.fk_PDM_id,
          projectManager: data?.fk_PM_id,
        });
      })
      .catch((e: any) => { });
  };
  useEffect(() => {
    getById();
  }, []);

  const addPhaseInitialValues = {
    phaseName: data?.phasename,
    numberOfBranch: data?.no_of_branches,
    country: data?.fk_country_id,
    vertical: data?.fk_vertical_id,
  };
  useEffect(() => {
    if (data?.verticalname) {
      axios
        .get(
          `${process.env.REACT_APP_BASEURL
          }/api/User/GetAllWithConditions?Designation=Project Delivery Manager&VerticalType=${data?.verticalname || ""
          }&reporting_id=0`
        )
        .then((response: any) => {
          if (!response) return;
          setProjectDeliveryManagerData(response?.data || []);
        })
        .catch((e: any) => { });
    }
  }, [data?.verticalname]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const body = {
      ...data,
      ModifiedBy: user?.UserName,
      fk_PDM_id: data?.projectDeliveryManager || 0,
      fk_PM_id: data?.projectManager || 0,
    };


    if (
      action === "Assign Project Manager" &&
      data?.projectManager === null
    ) {
      dispatch(fetchError("Please select Project Manager"));
    } else if (!data?.no_of_branches) {
      dispatch(fetchError("Please enter Number of Mandates"));
    } else if (data?.no_of_branches == 0) {
      dispatch(fetchError("Number of Mandates should be more than 0"));
    } 
    // else if (data?.businessSPOCName == "") {
    //   dispatch(fetchError("Please enter Business SPOC Name"));
    // } 
    else if (data?.mandatesCount > data?.no_of_branches) {
      dispatch(fetchError(`You can not decrease no. of mandate less than ${data?.mandatesCount} mandate.`))
    } else if (parseInt(data?.no_of_branches) >= 1000) {
      dispatch(fetchError("Number of Mandates must be less than 1000 "))
    }
    else {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/Phases/UpdatePhase?id=${data?.id}`,
          body
        )
        .then((response: any) => {
          if (!response) return;
          if (response && response.data === true && response.status === 200) {
            dispatch({
              type: SHOW_MESSAGE,
              message: "Updated record successfully!",
            });
            let tableId = phaseId;
            workflowFunctionAPICall(
              runtimeId,
              tableId,
              0,
              "Assigned Project Manager",
              "Initiate Phase",
              navigate,
              user
            );
          } else {
            dispatch(fetchError("Something went wrong"));
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Something went wrong"));
        });
    }
  };
  const getReportingIdByPDMName = () => {
    const obj =
      projectDeliveryManagerData &&
      projectDeliveryManagerData.find(
        (item) => item?.id === data?.projectDeliveryManager
      );
    return obj || null;
  };

  useEffect(() => {
    var reporting_id = getReportingIdByPDMName();
    if (data?.vertical !== "") {
      axios
        .get(
          `${process.env.REACT_APP_BASEURL
          }/api/User/GetAllWithConditions?Designation=Project Manager&VerticalType=${data?.verticalname || ""
          }&reporting_id=${reporting_id?.id || 0}`
        )
        .then((response: any) => {
          if (!response) return;
          setProjectManagerData(response?.data || []);
        })
        .catch((e: any) => { });
    }
  }, [
    data?.vertical,
    projectDeliveryManagerData,
    data?.projectDeliveryManager,
  ]);


  const handleUploadFiles = async (e, files, recId) => {
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

      return;
    }

    if (!limitExceeded) setUploadedFiles(uploaded);
    const formData: any = new FormData();
    const formDataTemp: any = new FormData();
    formData.append("mandate_id", 0);
    formData.append("documenttype", docType?.documentName);
    formData.append("CreatedBy", user?.UserName || "");
    formData.append("ModifiedBy", user?.UserName || "");
    formData.append("entityname", docType?.documentName);
    formData.append("RecordId", data?.phasecode?.split("_")[1] || 0);
    formData.append("remarks", remarks || "");
    formDataTemp.append("uploadNo", id || 0);
    for (var key in uploaded) {
      await formData.append("file", uploaded[key]);
    }
    for (var keys in uploaded) {
      await formDataTemp.append("file", uploaded[keys]);
    }

    if (uploaded?.length === 0) {
      setUploadedFiles([]);
      setFileLimit(false);
      e.target.value = null;
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
        .post(
          `${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`,
          formData
        )
        .then((response: any) => {
          if (!response) {
            e.target.value = null;
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (response?.data?.data == null) {
            setRemarks("");
            e.target.value = null;

            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Documents are not uploaded!"));
            getVersionHistoryData();
            return;
          } else if (response?.status === 200) {
            e.target.value = null;

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
    }
  };

  const getUploadNumber = (e, files) => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/GenerateUploadNo`)
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

  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch)) {
      handleUploadFiles(e, chosenFiles, id);

    }
  };

  const getVersionHistoryData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/ImageStorage/GetDocUploadHistory?mandateid=${0
        }&documentType=${docType?.documentName}&RecordId=${data?.phasecode?.split("_")[1] || 0}`
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

      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  useEffect(() => {
    if (data?.phasecode != 0) {
      getVersionHistoryData();
    }
  }, [docType, data?.phasecode]);

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
      minWidth: 50,
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
      field: "remarks",
      headerName: "Remark",
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
    var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 97;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [docUploadHistory, docType]);
  return (
    <div>
      <Box
        component="h2"
        className="page-title-heading my-6"
      >
        Update Phase
      </Box>
      <div
        className="card-panal"
        style={{ border: "1px solid rgba(0, 0, 0, 0.12)", height: "83vh" }}
      >
        <form onSubmit={handleSubmit}>
          <div className="phase-outer">
            <Grid
              marginBottom="30px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable ">Phase Code</h2>
                  <TextField
                    autoComplete="off"
                    name="phasecode"
                    id="phasecode"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.phasecode}
                    disabled
                  />
              
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Country</h2>
                  <TextField
                    disabled
                    variant="outlined"
                    size="small"
                    className="w-85"
                    name="country"
                    id="country"
                    value={data?.countryname}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e);
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onChange={handleChange}
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Geo Vertical</h2>
                  <TextField
                    disabled
                    variant="outlined"
                    size="small"
                    className="w-85"
                    name="vertical"
                    id="vertical"
                    value={data?.verticalname}
                    onChange={handleChange}
                  />
                  
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Phase Name</h2>
                  <TextField
                    disabled
                    autoComplete="off"
                    name="phaseName"
                    id="phaseName"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.phasename}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onChange={handleChange}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      regExpressionTextField(e);
                    }}
                  />
                
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Number of Mandates</h2>
                  <TextField
                    autoComplete="off"
                    type="number"
                    disabled={data?.mandatesCount === data?.no_of_branches || action === "Assign Project Manager" || user?.role !== 'GEO Manager' || data?.projectManager}
                    name="no_of_branches"
                    id="no_of_branches"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.no_of_branches}
                    onChange={handleChange}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e);
                      blockInvalidChar(e);
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                  />
                </div>
              </Grid>
              {/* <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required ">Business SPOC Name</h2>
                  <TextField
                    autoComplete="off"
                    name="businessSPOCName"
                    id="businessSPOCName"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.businessSPOCName}
                    onChange={handleChange}
                    sx={
                      action === "Assign Project Manager" && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }
                    }
                    disabled={action === "Assign Project Manager" || user?.role !== 'GEO Manager' || data?.projectManager}                                      
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      regExpressionTextField(e);
                    }}
                  />
                
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">
                    Project Delivery Manager
                  </h2>
                  <Select
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="projectDeliveryManager"
                    id="projectDeliveryManager"
                    value={data?.projectDeliveryManager || ""}
                    onChange={handleChange}
                    sx={
                      (action === "Assign Project Manager" ||
                        data?.mandatesCount > 0) && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }
                    }
                    disabled={
                      action === "Assign Project Manager" ||
                      data?.mandatesCount > 0
                    }
                  >
                    {projectDeliveryManagerData &&
                      projectDeliveryManagerData?.map((v) => (
                        <MenuItem value={v?.id}>{v?.userName}</MenuItem>
                      ))}
                  </Select>
                </div>
              </Grid>

              */}
              {/* <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  {action === "Assign Project Manager" ? (
                    <h2 className="phaseLable" style={{ color: "red" }}>
                      Project Manager
                    </h2>
                  ) : (
                    <h2 className="phaseLable">Project Manager</h2>
                  )}
                  <Select
                    displayEmpty
                    disabled={action !== "Assign Project Manager"}
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="projectManager"
                    id="projectManager"
                    style={
                      (action !== "Assign Project Manager" && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }) ||
                      null
                    }
                    value={data?.projectManager || null}
                    onChange={handleChange}
                    error={action === "Assign Project Manager"}
                  >
                    {projectManagerData &&
                      projectManagerData?.map((v) => (
                        <MenuItem value={v?.id}>{v?.userName}</MenuItem>
                      ))}
                  </Select>
                </div>
              </Grid> */}
            </Grid>
          </div>
          <div style={{ border: "1px solid lightgray" }}></div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <Typography className="section-headingTop">
              Upload Documents
            </Typography>
          </div>
          <Grid
            container
            item
            display="flex"
            flexDirection="row"
            spacing={4}
            justifyContent="start"
            alignSelf="center"
            marginTop={2}

          >
            <Grid item xs={6} md={3} style={{ paddingTop: "0px" }}>
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

            <Grid item xs={7} md={5} sx={{ position: "relative" }} style={{ paddingTop: "0px" }}>
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

            <Grid item xs={6} md={4} style={{ paddingTop: "0px" }}>
              <div style={{ display: "flex" }}>
                {docType?.templatePath && <Button
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
                </Button>}
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
          <Stack
            display="flex"
            flexDirection="row"
            justifyContent="center"
            sx={{ margin: "10px" }}
            style={{
              position: "fixed",
              bottom: "30px",
              left: "50%", marginTop: "20px",
              transform: "translateX(-57%)",
            }}
          >
            {action === "" && (
              <>
                {!(user?.role !== 'GEO Manager' || data?.projectManager) && <Button
                  variant="contained"
                  type="submit"
                  size="small"
                  style={submit}
                >
                  SUBMIT
                </Button>
                }</>
            )}

            {action && action === "Assign Project Manager" && (
              <Button
                variant="contained"
                type="submit"
                size="small"
                style={submit}
              >
                Assign Project Manager To Phase
              </Button>
            )}
          </Stack>
        </form>
      </div>
    </div>
  );
};

export default UpdatePhase;
