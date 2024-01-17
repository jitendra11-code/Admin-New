import {
  Box,
  Button,
  TextField,
  Grid,
  Autocomplete,
  createFilterOptions,
  Typography,
} from "@mui/material";
import { secondaryButton } from "shared/constants/CustomColor";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import "./style.css";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { fetchError, showMessage } from "redux/actions";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { AppState } from "@auth0/auth0-react";
import workflowFunctionAPICall from "./workFlowActionFunction";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";
import { downloadFile } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import { _validationMaxFileSizeUpload } from "../Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import groupByDocumentData from "./DocumentUploadMandate/Components/Utility/groupByDocumentData";
import FileNameDiaglogList from "./DocumentUploadMandate/Components/Utility/Diaglogbox";
import { Tooltip } from "@mui/material";
import { useUrlSearchParams } from "use-url-search-params";
import {
  regExpressionRemark,
  textFieldValidationOnPaste,
} from "@uikit/common/RegExpValidation/regForTextField";
import PhaseInfo from "pages/common-components/PhaseInformation";

const MAX_COUNT = 8;
const CancelMandate = () => {
  const [branchType, setBranchType] = React.useState([]);
  const [projectPlanData, setProjectPlanData] = useState([]);
  const [glCategories, setGlCategories] = React.useState([]);
  const [projectManager, setProjectManager] = React.useState([]);
  const [mandateInfo, setMandateInfo] = React.useState<any>({});
  const [docUploadHistory, setDocUploadHistory] = useState([]);
  const [mandateList, setMandateList] = React.useState([]);
  const [remark, setRemark] = useState("");
  const [branchAdminList, setBranchAdminList] = React.useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [phaseList, setPhaseList] = React.useState([]);
  const [fileLength, setFileLength] = useState(0);
  const [docType, setDocType] = useState("CancelMandate");
  const [documentTypeList, setDocumentTypeList] = useState([]);
  const { id } = useParams();
  const { user } = useAuthUser();
  const [sourcingAssociate, setSourcingAssociate] = React.useState([]);
  const [branchAdmin, setBranchAdmin] = React.useState([]);
  const [flag, setFlag] = React.useState(false);
  const [values, setValues] = React.useState(null);
  const navigate = useNavigate();
  const handleChange = (event) => {
    const { name, value } = event;
    setValues({ ...values, [name]: value });
  };
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const fileInput = React.useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileLimit, setFileLimit] = useState(false);
  const [cancelRemark, setCancelRemark] = useState("");
  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const [params] = useUrlSearchParams({}, {});
  const [userAction, setUserAction] = React.useState(null);
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];

  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const dispatch = useDispatch();
  const [phaseId, setPhaseId] = useState(null);

  const { phaseid, mandateId } = useParams();

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
      minWidth: 80,
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
                onClick={() => {
                  var mandate = { id: values?.mandateId?.mandetId };
                  downloadFile(obj?.data, mandate, dispatch);
                }}
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
  const getVersionHistoryData = () => {
    var mandateId = values?.mandateId?.mandetId || 0;
    if (mandateId === 0) {
      dispatch(fetchError("Invalid Mandate !!!"));
      return;
    }

    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId && parseInt(mandateId)
        }&documentType=${docType}`
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
  function removeDuplicates(arr) {
    var unique = [];
    var temp = [];
    arr.forEach((element) => {
      if (!unique.includes(element?.glCategoryName)) {
        unique.push(element?.glCategoryName);
        temp.push(element);
      }
    });
    return temp;
  }

  const getGlCategory = (verticalId) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Verticals/GetGlCategory?verticalId=${verticalId || 0}`
      )
      .then((response: any) => {
        const unqData = removeDuplicates(response?.data);
        setGlCategories([...unqData]);
      })
      .catch((e: any) => {
      });
  }

  const getBranchType = (glCategoryId) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Verticals/GetBranchType?glcategoryId=${glCategoryId || 0}`
      )
      .then((response: any) => {
        setBranchType(response?.data || []);

      })
      .catch((e: any) => {
        
      });
  }

  useEffect(() => {
    if (branchType && branchType?.length > 0 && glCategories?.length > 0 && mandateInfo?.branchId !== undefined && mandateInfo?.glCategoryId !== undefined) {
      setValues({
        ...values,
        ["glCategory"]:
          mandateInfo?.glCategoryId && setGlCategorId(mandateInfo?.glCategoryId),
        ["branchType"]: mandateInfo?.branchId && setBranchTypeName(mandateInfo?.branchId)
      })

    }
  }, [branchType, glCategories, mandateInfo])


  useEffect(() => {
    if (mandateInfo?.verticalId !== undefined && mandateInfo?.verticalId != 0) {
      getGlCategory(mandateInfo?.verticalId)
    }

  }, [mandateInfo?.verticalId])

  useEffect(() => {
    if (mandateInfo?.glCategoryId !== undefined && mandateInfo?.glCategoryId != 0) {
      getBranchType(mandateInfo?.glCategoryId)
    }

  }, [mandateInfo?.glCategoryId])


  useEffect(() => {
    var reporting_id = mandateInfo?.phase_ProjectDeliveryMangerId || 0;
    if (mandateInfo?.verticalName !== "") {
      axios
        .get(
          `${process.env.REACT_APP_BASEURL
          }/api/User/GetAllWithConditions?Designation=Project Manager&VerticalType=${mandateInfo?.verticalName || ""
          }&reporting_id=${reporting_id}`
        )
        .then((response: any) => {
          if (!response) return;
          setProjectManager(response?.data || []);
        })
        .catch((e: any) => { });
      axios
        .get(
          `${process.env.REACT_APP_BASEURL
          }/api/User/GetAllWithConditions?Designation=Sourcing Associate&VerticalType=${mandateInfo?.verticalName || ""
          }&reporting_id=0`
        )
        .then((response: any) => {
          if (!response) return;
          setSourcingAssociate(response?.data || []);
        })
        .catch((e: any) => { });
    }
  }, [mandateInfo?.verticalName, mandateInfo?.phase_ProjectDeliveryMangerId]);

  const getBranchAdminRole = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/User/GetAllWithConditions?Designation=Branch Admin`
      )
      .then((response: any) => {
        setBranchAdminList(response?.data || []);
      })
      .catch((e: any) => { });
  };

  useEffect(() => {
    getBranchAdminRole();
  }, []);

  useEffect(() => {
    if (values?.mandateId?.mandetId !== undefined) {
      getVersionHistoryData();
    }
  }, [values?.mandateId?.mandetId]);
  useEffect(() => {
    if (phaseList && phaseList?.length > 0) {
      if (phaseid && phaseid !== "nophaseid" && phaseid !== undefined) {
        let phase =
          phaseList && phaseList.find((item) => item?.phasecode === phaseid);
        setValues({ ...values, ["phaseId"]: phase || null });
      }
    }
  }, [phaseid, phaseList]);

  const setGlCategorId = (id) => {
    var obj =
      glCategories &&
      glCategories?.length > 0 &&
      glCategories?.find((item) => item?.id === id);
    return obj || null;
  };
  const setBranchTypeName = (id) => {
    var obj =
      branchType &&
      branchType?.length > 0 &&
      branchType?.find((item) => item?.id === id);
    return obj || null;
  };
  const setProjectManagerName = (id) => {
    var obj =
      projectManager &&
      projectManager?.length > 0 &&
      projectManager?.find((item) => item?.id === id);
    return obj || null;
  };

  const setSourcingAssociateName = (id) => {
    var obj =
      sourcingAssociate &&
      sourcingAssociate?.length > 0 &&
      sourcingAssociate?.find((item) => item?.userId === id);
    return obj || null;
  };

  const setBranchAdminName = (userId) => {
    var obj =
      branchAdminList &&
      branchAdminList?.length > 0 &&
      branchAdminList?.find((item) => item?.id === userId);
    return obj || null;
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
    var mandateId = values?.mandateId?.mandetId || 0;
    formData.append("mandate_id", mandateId);
    formData.append("documenttype", docType);
    formData.append("CreatedBy", user?.UserName );
    formData.append("ModifiedBy", user?.UserName );
    formData.append("entityname", docType);
    formData.append("RecordId", mandateId);
    formData.append("remarks", cancelRemark || "");

    uploaded &&
      uploaded?.map((file) => {
        formData.append("file", file);
      });
    if (uploaded?.length === 0) {
      setUploadedFiles([]);
      setFileLimit(false);
      e.target.value = null;
      dispatch(fetchError("Error Occurred !"));
      return;
    }

    if (id !== undefined) {
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
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(showMessage("Documents are uploaded successfully."));
            getVersionHistoryData();
          }
        })
        .catch((e: any) => {
          e.target.value = null;
          dispatch(fetchError("Error Occurred !"));
          
        });
    }
  };

  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch)) {
      handleUploadFiles(e, chosenFiles);
    }
  };

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  const getById = (id, mandate = null) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/mandatesById?id=${id}`
      )
      .then((response: any) => {
        if (response && response?.data) {
          var obj = response?.data;
          setMandateInfo(response?.data);
          setValues({
            ...values,
            ["pinCode"]: obj?.pincode,
            ["state"]: obj?.state,
            ["region"]: obj?.region,
            ["district"]: obj?.district,
            ["city"]: obj?.city,
            ["location"]: obj?.location,
            ["tierName"]: obj?.tierName,
            ["remark"]: obj?.remark,
            ["projectManagerId"]:
              obj?.projectManagerId &&
              setProjectManagerName(obj?.projectManagerId),
            ["sourcingAssociate"]:
            {
              userName : obj?.sourcingAssociate
            }, 
              // &&
              // setSourcingAssociateName(obj?.sourcingAssociate),
            ["branchAdmin"]:
              obj?.branchAdminId && setBranchAdminName(obj?.branchAdminId),
            ["projectManagerRemarks"]: obj?.pM_Remarks,
            ["branchCode"]: obj?.branchCode,
            ["mandateId"]: mandate || null,
          });
        }
      })
      .catch((e: any) => { });
  };

  useEffect(() => {

    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=UserMaster`
      )
      .then((response: any) => {
        setProjectManager(response?.data?.data);
      })
      .catch((e: any) => {
        
      });
  }, []);

  const _getMandateList = (phaseId = 0, selectedPhase = null) => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_BASEURL
        }/api/Mandates/DropDownMandet?PhaseID=${phaseId || 0}`,
    }).then((res) => {
      if (res && res.data && res.data?.length > 0) {
        setMandateList(res?.data);
        console.log('id',id)
        if (id && id !== "nomandateId" && id !== undefined) {
          let mandate = res?.data?.find((item) => item?.mandetCode === id);

          setValues({
            ...values,
            ["phaseId"]: selectedPhase || null,
            ["glCategory"]: null,
            ["branchType"]: null,
            ["pinCode"]: "",
            ["city"]: "",
            ["state"]: "",
            ["location"]: "",
            ["district"]: "",
            ["tierName"]: "",
            ["region"]: "",
            ["projectManagerRemarks"]: "",
            ["remark"]: "",
            ["projectManagerId"]: null,
            ["branchCode"]: "",
            ["sourcingAssociate"]: null,
            ["mandateId"]: mandate || null,
          });
          setMandateInfo({});
          if (mandate?.mandetId !== 0) {
            getById(parseInt(mandate?.mandetId), mandate);
          }
        }
      }
    });
  };

  const _getPhaseCodeList = () => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_BASEURL}/api/Phases/GetPhaseByRoles`,
    }).then((res) => {
      if (res && res.data && res.data.length > 0) {
        setPhaseList(res?.data);
      }
    });
  };
  useEffect(() => {
    if (
      values?.phaseId !== null &&
      values?.phaseId?.id !== undefined &&
      values?.phaseId?.id !== 0
    ) {
      _getMandateList(values?.phaseId?.id, values?.phaseId);
    }
  }, [values?.phaseId]);

  useEffect(() => {
    if (phaseid && phaseid !== "nophaseid" && phaseid !== undefined) {
    }
    _getPhaseCodeList();
  }, [phaseid]);

  React.useEffect(() => {
    if (id && id !== undefined && id != "nomandateId") {
      const userAction =
        userActionList &&
        userActionList?.find(
          (item) => item?.mandateId === parseInt(id) && item?.module === module
        );
      if (apiType === "") {
        setUserAction(userAction);
      } else {
        let action = mandateId;
        setUserAction(action);
      }
    }
  }, [id]);

  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );
    return userAction?.runtimeId || 0;
  };

    const workFlowMandate = () => {
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: _getRuntimeId(values?.mandateId?.mandetId) || 0,
            mandateId: values?.mandateId?.mandetId || 0,
            tableId: values?.mandateId?.mandetId || 0,
            remark: cancelRemark || '',
            createdBy: user?.UserName,
            createdOn: moment().format('YYYY-MM-DDThh:mm:ss.SSS'),
            action: 'Cancel',
        };
        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ''}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) return;
                if (response?.data === true) {
                    navigate('/list/task');
                } else {
                    dispatch(fetchError('Error Occurred !'));
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    const sourcingId = (source) => {
        var obj = sourcingAssociate && sourcingAssociate?.length > 0 && sourcingAssociate?.find((item) => item?.userName === source);
        return obj || null;
    };
    const submitCancelMandateAction = (e: any) => {
        var phaseCode = values?.phaseId?.id || 0;
        if (phaseCode === 0) {
            dispatch(fetchError('Please select Phase Code !!!'));
            return;
        }

        var mandateId = values?.mandateId?.mandetId || 0;
        if (mandateId === 0) {
            dispatch(fetchError('Please select Mandate Code !!!'));
            return;
        }
        if (docUploadHistory && docUploadHistory?.length === 0) {
            dispatch(fetchError('Please upload file'));
            return;
        }
        if (cancelRemark === '') {
            dispatch(fetchError('Please enter Cancel Mandate Remark'));
            return;
        }
        e.preventDefault();
        mandateInfo.sourcingAssociate = mandateInfo?.sourcingAssociateId;
        // const sourcing_id = sourcingId(mandateInfo?.sourcingAssociate);
        const body = {
            ...mandateInfo,
            // sourcingAssociate: sourcing_id?.id || null,
            createdBy: user?.UserName,
            createdDate: moment().format('YYYY-MM-DDThh:mm:ss.SSS'),
            modifiedBy: user?.UserName,
            modifiedDate: moment().format('YYYY-MM-DDThh:mm:ss.SSS'),
            cancel_Remarks: 'cancelRemark',
            hold_Remarks: '',
            accept_Reject_Status: 'Cancel Request',
            status: 'Cancel Request',
        };
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/Mandates/UpdateMandates?id=${mandateId}`, body)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Mandate Operation Failed !!!'));
                    return;
                }

        if (response?.data === true) {
          dispatch(showMessage("Mandate Operation is completed successfully"));
          workFlowMandate();
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Mandate Operation Failed !!!"));
        return;
      });
  };

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 90;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [docUploadHistory, docType]);

  useEffect(() => {
    if (values?.phaseId?.id) {
      setPhaseId(values?.phaseId?.id);
    }
  }, [values?.phaseId]);

  const _phaseId = values?.phaseId?.id;
  

  const handleKeyDown = (event) => {
    if (event.key === " " && event.target.selectionStart === 0) {
      event.preventDefault();
    }
  };

  return (
    <div>
      <Box component="h2" className="page-title-heading my-6">
        Cancel Mandate
      </Box>
      
      { _phaseId && _phaseId != undefined && (
        <PhaseInfo phaseId={_phaseId ||  phaseId} setPhaseId={setPhaseId} />
      )}
      <div
        className="card-panal inside-scroll-185"
        style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
      >
        <div className="phase-outer">
          <Grid
            marginBottom="10px"
            container
            item
            spacing={5}
            justifyContent="start"
            alignSelf="center"
          >
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable">Phase Code</h2>
                <Autocomplete
                  disablePortal
                  sx={
                    typeof phaseid !== "string" &&
                    values?.phaseId && {
                      backgroundColor: "#f3f3f3",
                      borderRadius: "6px",
                    }
                  }
                  id="combo-box-demo"
                  getOptionLabel={(option) =>
                    option?.phasecode?.toString() || ""
                  }
                  disableClearable={true}
                  options={phaseList || []}
                  onChange={(e, value: any) => {
                    console.log('value',value)
                    _getMandateList(value?.id, value);
                    navigate(
                      `/mandate/${value?.phasecode ? value?.phasecode : "nophaseid"
                      }/${values?.mandateId?.mandetId
                        ? values?.mandateId?.mandetCode
                        : "nomandateId"
                      }/cancel`
                    );

                    setValues({ ...values, ["phaseId"]: value });
                  }}
                  placeholder="Phase Code"
                  value={values?.phaseId || null}
                  renderInput={(params) => (
                    <TextField
                      name="phaseId"
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
            
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable">Mandate Code</h2>
                <Autocomplete
                  disablePortal
                  sx={
                    values?.mandateId && {
                      backgroundColor: "#f3f3f3",
                      borderRadius: "6px",
                    }
                  }
                  id="combo-box-demo"
                  getOptionLabel={(option) =>
                    option?.mandetCode?.toString() || ""
                  }
                  disableClearable={true}
                  options={mandateList || []}
                  filterOptions={createFilterOptions({
                    stringify: (option) => option?.mandetCode,
                  })}
                  onChange={(e, value: any) => {
                    console.log('value',value)
                    navigate(
                      `/mandate/${values?.phaseId?.phasecode
                        ? values?.phaseId?.phasecode
                        : "nophaseid"
                      }/${value?.mandetCode ? value?.mandetCode : "nomandateId"
                      }/cancel`
                    );
                    setValues({ ...values, ["mandateId"]: value });
                    getById(parseInt(value?.mandetId), value);
                  }}
                  placeholder="Mandate Code"
                  value={values?.mandateId || null}
                  renderInput={(params) => (
                    <TextField
                      name="mandateId"
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
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable ">GL Category</h2>
                <Autocomplete
                  className="w-85"
                  disabled
                  disablePortal
                  sx={{ backgroundColor: "#f3f3f3", borderRadius: "6px" }}
                  getOptionLabel={(option) => option?.glCategoryName || ""}
                  disableClearable={true}
                  options={glCategories || []}
              
                  defaultValue={values?.glCategory || ""}
                  value={values?.glCategory || ""}
                  onChange={(e, value) => {
                    setValues({ ...values, ["glCategory"]: value });
                  }}
                  renderInput={(params) => (
                    <TextField
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
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable ">Branch Type</h2>
                <Autocomplete
                  className="w-85"
                  disablePortal
                  sx={{ backgroundColor: "#f3f3f3", borderRadius: "6px" }}
                  getOptionLabel={(option) => option?.branchTypeName || ""}
                  disableClearable={true}
                  disabled
                  options={branchType || []}
                  defaultValue={values?.branchType || ""}
                  value={values?.branchType || ""}
                  onChange={(e, value) => {
                    setValues({ ...values, ["branchType"]: value });
                  }}
                  renderInput={(params) => (
                    <TextField
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
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable ">Pin Code</h2>
                <TextField
                  disabled
                  autoComplete="off"
                  name="pinCode"
                  id="pinCode"
                  variant="outlined"
                  size="small"
                  type="number"
                  className="w-85"
                  value={values?.pinCode}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0, maxLength: 6 } }}                                    
                  onKeyDown={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                />
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable">State</h2>
                <TextField
                  name="state"
                  id="state"
                  variant="outlined"
                  size="small"
                  className="w-85"
                  value={values?.state}
                  onChange={handleChange}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                  disabled
                />
               
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable">Region</h2>
                <TextField
                  name="region"
                  id="region"
                  variant="outlined"
                  size="small"
                  className="w-85"
                  value={values?.region}
                  onChange={handleChange}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                  disabled
                />
              
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable">District</h2>
                <TextField
                  name="district"
                  id="district"
                  variant="outlined"
                  size="small"
                  className="w-85"
                  value={values?.district}
                  onChange={handleChange}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                  disabled
                />
              
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable">City</h2>
                <TextField
                  name="city"
                  id="city"
                  variant="outlined"
                  size="small"
                  className="w-85"
                  value={values?.city}
                  onChange={handleChange}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                  disabled
                />
               
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable ">Location Name</h2>
                <TextField
                  autoComplete="off"
                  name="location"
                  id="location"
                  variant="outlined"
                  size="small"
                  className="w-85"
                  value={values?.location}
                  onChange={handleChange}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                  disabled
                />
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable ">Tier Name</h2>
                <TextField
                  name="tierName"
                  autoComplete="on"
                  id="tierName"
                  variant="outlined"
                  size="small"
                  className="w-85"
                  value={values?.tierName}
                  onChange={handleChange}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                  disabled
                />
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                  <h2 className="phaseLable">Business Type</h2>
                    
                  <Autocomplete
                      // disablePortal
                      disabled
                      id="combo-box-demo"
                      // getOptionLabel={(option) =>
                      //   option?.tierName?.toString() || ""
                      // }
                      // disableClearable={true}
                      options={[]}
                      // filterOptions={createFilterOptions({
                      //   stringify: (option) => option?.tierName,
                      // // })}
                      value={ mandateInfo?.business_type || ""}
                      defaultValue={mandateInfo?.business_type}
                      onChange={(e, value) => {
                        
                      }}
                      renderInput={(params) => (
                        <TextField
                          name="phaseId"
                          id="state"
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            style: { height: `35 !important` },
                          }}
                          variant="outlined"
                          sx={
                            {
                              backgroundColor: "#f3f3f3",
                              borderRadius: "10px",
                            }
                          }
                          size="small"
                        />
                      )}
                    />
                    
                  </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                  <h2 className="phaseLable">Business Associate</h2>
                    
                    <Autocomplete
                      // disablePortal
                      sx={
                        {
                          backgroundColor: "#f3f3f3",
                          borderRadius: "10px",
                        }
                      }
                      disabled
                      id="combo-box-demo"
                      // getOptionLabel={(option) =>
                      //   option?.userName?.toString() || ""
                      // }
                      // disableClearable={true}
                      options={[]}
                      // filterOptions={createFilterOptions({
                      //   stringify: (option) => option?.tierName,
                      // })}
                      value={ mandateInfo?.business_associate  || ""}
                      defaultValue={mandateInfo?.business_associate || ""}
                      // onChange={(e, value) => {
                      //   setData({
                      //     ...data,
                      //     fk_business_associate : value,
                      //   });
                      //   setBusinessAssociate(value)
                      //   if (value === null) {
                      //     delete updateMandateDataError["fk_business_associate"];
                      //     setUpdateMandateDataError({
                      //       ...updateMandateDataError,
                      //     });
                      //   } else {
                      //     setUpdateMandateDataError({
                      //       ...updateMandateDataError,
                      //       ["fk_business_associate"]: "",
                      //     });
                      //   }
                      // }}
                      renderInput={(params) => (
                        <TextField
                          name="phaseId"
                          id="state"
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            style: { height: `35 !important` },
                          }}
                          variant="outlined"
                          sx={
                             {
                              backgroundColor: "#f3f3f3",
                              borderRadius: "10px",
                            }
                          }
                          size="small"
                        />
                      )}
                    />
                   
                  </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                  <h2 className="phaseLable">Admin Vertical</h2>
                    
                    <Autocomplete
                      // disablePortal
                      disabled
                      id="combo-box-demo"
                      // getOptionLabel={(option) =>
                      //   option?.tierName?.toString() || ""
                      // }
                      // disableClearable={true}
                      options={[]}
                      // filterOptions={createFilterOptions({
                      //   stringify: (option) => option?.tierName,
                      // // })}
                      value={ mandateInfo?.admin_vertical || ""}
                      defaultValue={mandateInfo?.admin_vertical}
                      onChange={(e, value) => {
                        
                      }}
                      renderInput={(params) => (
                        <TextField
                          name="phaseId"
                          id="state"
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            style: { height: `35 !important` },
                          }}
                          variant="outlined"
                          sx={
                            {
                              backgroundColor: "#f3f3f3",
                              borderRadius: "10px",
                            }
                          }
                          size="small"
                        />
                      )}
                    />
                    
                  </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                  <h2 className="phaseLable">Vertical Head</h2>
                    
                    <Autocomplete
                      // disablePortal
                      sx={
                         {
                          backgroundColor: "#f3f3f3",
                          borderRadius: "10px",
                        }
                      }
                      disabled
                      id="combo-box-demo"
                      // getOptionLabel={(option) =>
                      //   option?.tierName?.toString() || ""
                      // }
                      // disableClearable={true}
                      options={ []}
                      // filterOptions={createFilterOptions({
                      //   stringify: (option) => option?.tierName,
                      // })}
                      value={ mandateInfo?.vertical_head || ""}
                      defaultValue={mandateInfo?.vertical_head}
                      onChange={(e, value) => {
                        
                      }}
                      renderInput={(params) => (
                        <TextField
                          name="phaseId"
                          id="state"
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            style: { height: `35 !important` },
                          }}
                          variant="outlined"
                          sx={
                            {
                              backgroundColor: "#f3f3f3",
                              borderRadius: "10px",
                            }
                          }
                          size="small"
                        />
                      )}
                    />
                    
                  </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                  <h2 className="phaseLable">Project Delivery Manager</h2>
                    
                    <Autocomplete
                      disablePortal
                      sx={
                        {
                         backgroundColor: "#f3f3f3",
                         borderRadius: "10px",
                       }
                     }
                      disabled
                      id="combo-box-demo"
                      // getOptionLabel={(option) =>
                      //   option?.userName?.toString() || ""
                      // }
                      disableClearable={true}
                      options={ []}
                      // filterOptions={createFilterOptions({
                      //   stringify: (option) => option?.userName,
                      // })}
                      value={ mandateInfo?.mandate_ProjectDeliveryManger || ""}
                      // defaultValue={data?.fk_project_delivery_manager || ""}
                      onChange={(e, value) => {
                        
                      }}
                      renderInput={(params) => (
                        <TextField
                          name="phaseId"
                          id="state"
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            style: { height: `35 !important` },
                          }}
                          variant="outlined"
                          sx={
                             {
                              backgroundColor: "#f3f3f3",
                              borderRadius: "10px",
                            }
                          }
                          size="small"
                        />
                      )}
                    />
                    
                  </div>
                </Grid>
            
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable ">Remarks</h2>
                <TextField
                  name="remark"
                  autoComplete="off"
                  id="remark"
                  variant="outlined"
                  size="small"
                  className="w-85"
                  value={values?.remark}
                  disabled
                  onChange={handleChange}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                />
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable ">Project Manager</h2>
                <Autocomplete
                  className="w-85"
                  disablePortal
                  disabled
                  sx={{ backgroundColor: "#f3f3f3", borderRadius: "6px" }}
                  getOptionLabel={(option) => option?.userName || ""}
                  disableClearable={true}
                  options={projectManager || []}
                  defaultValue={values?.projectManagerId || ""}
                  value={values?.projectManagerId || ""}
                  onChange={(e, value) => {
                    setValues({ ...values, ["projectManagerId"]: value });
                  }}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
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
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable">Project Manager Remarks</h2>
                <TextField
                  name="projectManagerRemarks"
                  id="projectManagerRemarks"
                  variant="outlined"
                  size="small"
                  className="w-85"
                  value={values?.projectManagerRemarks}
                  onChange={handleChange}
                  disabled
                />
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable">Branch Code</h2>
                <TextField
                  name="branchCode"
                  id="branchCode"
                  variant="outlined"
                  size="small"
                  className="w-85"
                  value={values?.branchCode}
                  onChange={handleChange}
                  disabled
                />
              </div>
            </Grid>

            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable ">Sourcing Associate</h2>
                <Autocomplete
                  className="w-85"
                  disablePortal
                  disabled
                  sx={{ backgroundColor: "#f3f3f3", borderRadius: "6px" }}
                  getOptionLabel={(option) => option?.userName || ""}
                  disableClearable={true}
                  options={sourcingAssociate || []}
                  defaultValue={values?.sourcingAssociate || ""}
                  value={values?.sourcingAssociate || ""}
                  onChange={(e, value) => {
                    setValues({ ...values, ["sourcingAssociate"]: value });
                  }}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
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
              </div>
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable">Branch Admin</h2>
                <Autocomplete
                  disablePortal
                  sx={{
                    backgroundColor: "#f3f3f3",
                    borderRadius: "6px",
                  }}
                  id="combo-box-demo"
                  disabled={true}
                  getOptionLabel={(option) =>
                    option?.userName?.toString() || ""
                  }
                  disableClearable={true}
                  options={branchAdminList || []}
                  filterOptions={createFilterOptions({
                    stringify: (option) => option?.userName,
                  })}
                  value={values?.branchAdmin || ""}
                  defaultValue={values?.branchAdmin || ""}
                  onChange={(e: any, value) => { }}
                  renderInput={(params) => (
                    <TextField
                      name="branchAdmin"
                      id="branchAdmin"
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
              </div>
            </Grid>

            <Grid
              marginTop="0px"
              container
              item
              spacing={5}
              display="flex"
              justifyContent="space-between"
              alignSelf="center"
            >
              <Grid item xs={6} md={6}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignContent: "center",
                  }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">
                      Cancel Mandate Remark
                    </h2>
                    <TextField
                      name="branchCode"
                      id="branchCode"
                      variant="outlined"
                      size="small"
                      className="w-85"
                      type="text"
                      value={cancelRemark}
                      onChange={(e) => {
                        setCancelRemark(e?.target?.value);
                      }}                      
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      onKeyDown={(e: any) => { handleKeyDown(e); regExpressionRemark(e) }}
                    />
                  </div>
                </div>
              </Grid>
              <Grid item xs={6} md={6}>
                <div style={{ marginRight: "40px", marginTop: 20 }}>
                  <Button
                    onClick={() => {
                      if (id === undefined) {
                        dispatch(fetchError("Please select Mandate !!!"));
                        return;
                      }
                      if (cancelRemark === "") {
                        dispatch(
                          fetchError("Please enter Cancel Mandate Remark !!!")
                        );
                        return;
                      }
                      fileInput.current.click();
                    }}
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
              </Grid>
            </Grid>
          </Grid>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>Version History</Typography>{" "}
        </div>
        <div style={{ height: "200px", marginBottom: "50px" }}>
          <CommonGrid
            defaultColDef={{ flex: 1 }}
            columnDefs={columnDefs}
            rowData={docUploadHistory || []}
            onGridReady={onGridReady}
            gridRef={gridRef}
            pagination={true}
            paginationPageSize={10}
          />
        </div>

        {userAction?.module === module && (
          <div className="bottom-fix-btn">
            <div className="remark-field">
              {action && action === "Approve" && (
                <>
                  <ApproveAndRejectAction
                    approved={approved}
                    sendBack={sendBack}
                    setSendBack={setSendBack}
                    setApproved={setApproved}
                    remark={remark}
                    setRemark={setRemark}
                    approveEvent={() => {
                      workflowFunctionAPICall(
                        runtimeId,
                        values?.mandateId?.mandetId,
                        remark,
                        "Approved",
                        navigate,
                        user
                      );
                    }}
                    sentBackEvent={() => {
                      workflowFunctionAPICall(
                        runtimeId,
                        values?.mandateId?.mandetId,
                        remark,
                        "Sent Back",
                        navigate,
                        user
                      );
                    }}
                  />
                  <span className="message-right-bottom">
                    {userAction?.stdmsg}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="bottom-fix-btn">
          <Button
            variant="outlined"
            size="medium"
            type="submit"
            style={{
              marginLeft: 20,
              padding: "2px 20px",
              borderRadius: 6,
              color: "#fff",
              borderColor: "#00316a",
              backgroundColor: "#00316a",
            }}
            onClick={(e) => submitCancelMandateAction(e)}
          >
            Cancel Mandate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancelMandate;
