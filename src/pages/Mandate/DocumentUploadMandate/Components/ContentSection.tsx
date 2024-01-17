import React, {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  Typography,
  Grid,
  Button,
  TextField,
  Autocomplete,
} from "@mui/material";
import {  secondaryButton } from "shared/constants/CustomColor";
import ProjectPlan from "pages/Mandate/PropertyManagment/Components/ProjectPlan";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import DataTable from "pages/common-components/Table";
import {
  downloadTemplate,
  _validationMaxFileSizeUpload,
} from "./Utility/FileUploadUtilty";
import DownloadIcon from "@mui/icons-material/Download";
import { AgGridReact } from "ag-grid-react";
import { AppState } from "redux/store";
import { useDispatch, useSelector } from "react-redux";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import { useUrlSearchParams } from "use-url-search-params";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import moment from "moment";
import axios from "axios";
import MandateInfo from "pages/common-components/MandateInformation";
import { fetchError, showMessage } from "redux/actions";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";
import workflowFunctionAPICall from "pages/Mandate/workFlowActionFunction";
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import { downloadFile } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import ApproveSendBackRejectAction from "pages/common-components/ApproveSendBackRejectAction";
import { Tooltip } from "@mui/material";
import  {
  textFieldValidationOnPaste,
  regExpressionRemark,
} from "@uikit/common/RegExpValidation/regForTextField";
import ApprovedRejectContent from "./ApprovedRejectContent";
import ApprovedSentBackContent from "./ApprovedSentBackContent";

declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean;
  }
}

const MAX_COUNT = 8;
const UploadDocuments = ({ documentType }: any) => {
  const [docType, setDocType] = useState(null);
  const [projectPlanData, setProjectPlanData] = useState([]);
  const [projectPlanAPIData, setProjectPlanAPIData] = useState([]);
  const [projectPlanDataUpdated, setProjectPlanDataUpdated] = useState(false);
  const navigate = useNavigate();
  const [documentTypeList, setDocumentTypeList] = useState([]);
  const [mandateId, setMandateId] = React.useState(null);
  const [remark, setRemark] = useState("");
  const [fileUploadRemark, setFileUploadRemark] = useState("");
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [sendBack, setSendBack] = React.useState(false);
  const [rejected, setRejected] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const gridRef = React.useRef<AgGridReact>(null);
  const [docUploadHistory, setDocUploadHistory] = useState([]);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );

  const [params] = useUrlSearchParams({}, {});
  const [mandateInfo, setMandateData] = React.useState(null);
  const [fileLength, setFileLength] = useState(0);
  const { id } = useParams();
  const { user } = useAuthUser();
  useEffect(() => {
    getDocumentTypeList();
    if (id && id !== "noid") {
      setMandateId(id);
    }
  }, [id]);

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
          if (documentType && documentType !== "") {
            var data =
              response?.data?.data &&
              response?.data?.data?.filter(
                (item) => item?.documentType === documentType
              );
            setDocumentTypeList(data || []);
            if (data && data?.length === 1) {
              setDocType(data?.[0] || null);
            }
            return;
          }
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

  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );
    return userAction?.runtimeId || 0;
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
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/DownloadZipFile?mandateid1=${mandateId?.id}`,
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
          //const url = window.URL.createObjectURL(new Blob([res.data],{type:'application/zip'}));
          //saveAs(blob, filename);
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

  const workFlowMandate = () => {
    const token = localStorage.getItem("token");
    const body = {
      runtimeId: _getRuntimeId(mandateId.id) || 0,
      mandateId: mandateId?.id || 0, 
      tableId: mandateId?.id || 0,
      remark: "Created",
      createdBy: user?.UserName,
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: "Created", 
    };

    axios({
      method: "post",
      url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${
        body?.runtimeId
      }&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${
        body?.createdBy
      }&createdOn=${body.createdOn}&action=${body?.action}&remark=${
        body?.remark || ""
      }`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occured !!"));
          return;
        }

        if (response?.data === true) {
          dispatch(showMessage("Submitted successfully!"));
          if (params?.source === "list") {
            navigate("/list/task");
          } else {
            navigate("/mandate");
          }
        } else {
          dispatch(fetchError("Error Occurred !!"));
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
      field: "documenttype",
      headerName: "Document Type",
      headerTooltip: "Document Type",
      sortable: true,
      resizable: true,
      width: 130,
      minWidth: 100,
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
      field: "remarks",
      headerName: "Remark",
      headerTooltip: "Remark",
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
    var temp = [];
    var docTypeList =
      documentTypeList &&
      documentTypeList?.length > 0 &&
      documentTypeList?.map((item) => {
        temp.push(item?.documentName);
      });

    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateId?.id}&documentType=${documentType}`
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
    if (mandateId?.id !== undefined && docType?.documentType !== undefined) {
      if (documentType && documentType?.trim() !== "Project Plan")
        getVersionHistoryData();
    }
  }, [mandateId, id, docType, documentType]);

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
    formData.append("mandate_id", mandateId?.id);
    formData.append("documenttype", docType?.documentName);
    formData.append("CreatedBy", user?.UserName || "");
    formData.append("ModifiedBy", user?.UserName || "");
    formData.append("entityname", "DocumentUpload");
    formData.append("RecordId", mandateId?.id || 0);
    formData.append("remarks", fileUploadRemark || "");

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
            setFileUploadRemark("");
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Documents are not uploaded!"));
            getVersionHistoryData();
            return;
          } else if (response?.status === 200) {
            setFileUploadRemark("");
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

  const getActivityCompletedStatus = () => {
    if (
      projectPlanAPIData &&
      projectPlanAPIData?.length > 0 &&
      projectPlanData &&
      projectPlanData?.length > 0
    ) {
      var status_completed =
        projectPlanAPIData &&
        projectPlanAPIData?.filter(
          (item) =>
            item?.status_percentage && parseInt(item?.status_percentage) === 100
        );
      if (status_completed?.length === 0) {
        return false;
      }
      if (status_completed?.length === projectPlanAPIData?.length) {
        return true;
      }
      return true;
    }
    return false;
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
    [user, docType]
  );

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

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

  const _saveProjectPlanHistory = (_data) => {
    const data =
      _data &&
      _data.map((item) => {
        return {
          ...item,
          planId: item?.id || 0,
          mandateId: mandateId?.id || 0,
          proposed_Start_Date:
            (moment(item?.proposed_Start_Date).isValid() &&
              moment(item?.proposed_Start_Date).format(
                "YYYY-MM-DDTHH:mm:ss.SSS"
              )) ||
            null,
          proposed_End_Date:
            (moment(item?.proposed_End_Date).isValid() &&
              moment(item?.proposed_End_Date).format(
                "YYYY-MM-DDTHH:mm:ss.SSS"
              )) ||
            null,
          actual_Start_Date:
            (moment(item?.actual_Start_Date).isValid() &&
              moment(item?.actual_Start_Date).format(
                "YYYY-MM-DDTHH:mm:ss.SSS"
              )) ||
            null,
          actual_End_Date:
            (moment(item?.actual_End_Date).isValid() &&
              moment(item?.actual_End_Date).format(
                "YYYY-MM-DDTHH:mm:ss.SSS"
              )) ||
            null,
          createdBy: user?.UserName || "",
          createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          modifiedBy: user?.UserName || "",
          modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        };
      });

    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/ProjectPlan/CreateProjectPlanHistory`,
        data,
        {}
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.status === 200) {
          //dispatch(showMessage("Project History is created successfully!"));
        } else {
          dispatch(fetchError("Error occured"));
          return;
        }
      })
      .catch((err) => {});
  };
  const _saveOrUpdateProjectPlanData = () => {
    var _validationArr;
    if (user && user?.role && user?.role?.trim() === "Project Manager") {
      _validationArr =
        projectPlanData &&
        projectPlanData?.filter(
          (item) =>
            item?.proposed_Start_Date === null ||
            item?.proposed_End_Date === null ||
            item?.process_Owner === ""
        );
    } else {
      _validationArr =
        projectPlanData &&
        projectPlanData?.filter(
          (item) =>
            item?.actual_Start_Date === null ||
            (item?.status_percentage && parseInt(item?.status_percentage) > 100)
        );
    }

    if (projectPlanData && projectPlanData?.length === 0) {
      dispatch(fetchError("Please add project plan"));
      return;
    }
    if (_validationArr && _validationArr?.length > 0) {
      dispatch(fetchError("Please fill all mandatory fields !!!"));
      return;
    }
    if (projectPlanDataUpdated === false) {
      const projectPlanData1: any = projectPlanData?.map(
        (v) => delete v?.listName
      );

      const data =
        projectPlanData &&
        projectPlanData.map((item) => {
          return {
            ...item,
            mandateId: mandateId?.id || 0,
            proposed_Start_Date:
              (moment(item?.proposed_Start_Date).isValid() &&
                moment(item?.proposed_Start_Date).format(
                  "YYYY-MM-DDTHH:mm:ss.SSS"
                )) ||
              null,
            proposed_End_Date:
              (moment(item?.proposed_End_Date).isValid() &&
                moment(item?.proposed_End_Date).format(
                  "YYYY-MM-DDTHH:mm:ss.SSS"
                )) ||
              null,
            actual_Start_Date:
              (moment(item?.actual_Start_Date).isValid() &&
                moment(item?.actual_Start_Date).format(
                  "YYYY-MM-DDTHH:mm:ss.SSS"
                )) ||
              null,
            actual_End_Date:
              (moment(item?.actual_End_Date).isValid() &&
                moment(item?.actual_End_Date).format(
                  "YYYY-MM-DDTHH:mm:ss.SSS"
                )) ||
              null,
            createdBy: user?.UserName || "",
            createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            modifiedBy: user?.UserName || "",
            modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          };
        });

      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/ProjectPlan/CreateProjectPlan`,
          data,
          {}
        )
        .then((response: any) => {
          if (!response) return;
          if (response && response?.status === 200) {
            dispatch(showMessage("Project Plan is created successfully!"));
            _getProjectPlanDataForHistory();
            workFlowMandate();
          } else {
            dispatch(fetchError("Error occured"));
            return;
          }
        })
        .catch((err) => {});
    } else {
      const data =
        projectPlanData &&
        projectPlanData.map((item) => {
          return {
            ...item,
            id: item?.id || 0,
            mandateId: mandateId?.id || 0,
            proposed_Start_Date:
              (moment(item?.proposed_Start_Date).isValid() &&
                moment(item?.proposed_Start_Date).format(
                  "YYYY-MM-DDTHH:mm:ss.SSS"
                )) ||
              null,
            proposed_End_Date:
              (moment(item?.proposed_End_Date).isValid() &&
                moment(item?.proposed_End_Date).format(
                  "YYYY-MM-DDTHH:mm:ss.SSS"
                )) ||
              null,
            actual_Start_Date:
              (moment(item?.actual_Start_Date).isValid() &&
                moment(item?.actual_Start_Date).format(
                  "YYYY-MM-DDTHH:mm:ss.SSS"
                )) ||
              null,
            actual_End_Date:
              (moment(item?.actual_End_Date).isValid() &&
                moment(item?.actual_End_Date).format(
                  "YYYY-MM-DDTHH:mm:ss.SSS"
                )) ||
              null,
            createdBy: user?.UserName || "",
            createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            modifiedBy: user?.UserName || "",
            modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          };
        });

      axios
        .post(
          `${process.env.REACT_APP_BASEURL}//api/ProjectPlan/UpdateProjectPlan`,
          data,
          {}
        )
        .then((response: any) => {
          if (!response) return;
          if (response && response?.status === 200) {
            dispatch(showMessage("Project Plan is updated successfully!"));

            _getProjectPlanDataForHistory();
            workFlowMandate();
          } else {
            dispatch(fetchError("Error occured"));
            return;
          }
        })
        .catch((err) => {
          dispatch(fetchError("Error occured"));
          return;
        });
    }
  };

  const getMileStone = () => {
    setProjectPlanDataUpdated(false);
    axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/ITAsset/GetITAssets?Type=Project Plan&PartnerCategory=${
          user?.vendorType || ""
        }`
      )
      .then((res) => {
        if (!res) return;
        if (res && res?.data && res?.data?.length > 0) {
          var _resData = (res && res?.data) || [];
          let data =
            _resData &&
            _resData.map((item, key) => {
              return {
                custom_id: key + 1,
                mandateId: 0,
                planId: 0,
                sequence: key + 1,
                section: item?.listName || "",
                listName: item?.listName || "",
                vendorType: item?.partnerCategory || "",
                process_Owner: "",
                proposed_Start_Date: null,
                proposed_End_Date: null,
                actual_Start_Date: null,
                actual_End_Date: null,
                status_percentage: 0,
                pM_remarks: "",
                vendor_remarks: "",
                status: "",
                createdBy: "",
                createdDate: "",
                modifiedBy: "",
                modifiedDate: "",
                id: 0,
                uid: "",
              };
            });
          setProjectPlanData(data || []);
          setProjectPlanAPIData(data);
        } else {
          setProjectPlanData([]);
          setProjectPlanAPIData([]);
        }
      })
      .catch((err) => {});
  };

  const _getProjectPlanDataForHistory = () => {
    axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/ProjectPlan/GetProjectPlan?mandateId=${
          mandateId?.id || 0
        }&vendorType=${user?.vendorType || ""}`
      )
      .then((res) => {
        if (!res) return;
        if (res && res?.data && res?.data?.length > 0) {
          var _data =
            res?.data &&
            res?.data.map((item, key) => {
              return {
                ...item,
                planId: item?.id || 0,
              };
            });
          var _projectPlanHistory =
            res?.data &&
            res?.data.map((item, key) => {
              return {
                ...item,
                planId: item?.id || 0,
                id: 0,
              };
            });
          setProjectPlanDataUpdated(true);
          setProjectPlanData(_data || []);
          _saveProjectPlanHistory(_projectPlanHistory);
        }
      })
      .catch((err) => {});
  };
  const getProjectPlan = () => {
    axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/ProjectPlan/GetProjectPlan?mandateId=${
          mandateId?.id || 0
        }&vendorType=${user?.vendorType || ""}`
      )
      .then((res) => {
        if (!res) return;
        if (res && res?.data && res?.data?.length > 0) {
          setProjectPlanDataUpdated(true);
          var _data =
            res?.data &&
            res?.data.map((item, key) => {
              return {
                ...item,
                custom_id: key + 1,
                planId: item?.id || 0,
              };
            });
          setProjectPlanData(_data || []);
          setProjectPlanAPIData(_data || []);
        } else {
          getMileStone();
        }
      })
      .catch((err) => {});
  };

  useLayoutEffect(() => {
    if (
      mandateId &&
      mandateId?.id !== undefined &&
      mandateId?.id !== "noid" &&
      documentType &&
      documentType?.trim() === "Project Plan"
    ) {
      getProjectPlan();
    }
  }, [mandateId, docType]);

  return (
    <>
      <div
        className={
          window.location.pathname?.includes("project-management")
            ? "inside"
            : "inside-scroll-287"
        }
        style={{ padding: "5px" }}
      >
        {(window.location.pathname?.includes("generate-loi") ||
          window.location.pathname?.includes("generate-loa") ||
          window.location.pathname?.includes("generate-tsr") ||
          window.location.pathname?.includes("rbi-intimation") ||
          window.location.pathname?.includes("additional-documents")) && (
          <MandateInfo
            mandateCode={mandateId}
            source=""
            pageType=""
            setMandateData={setMandateData}
            setMandateCode={setMandateId}
            setCurrentStatus={setCurrentStatus}
            setCurrentRemark={setCurrentRemark}
            redirectSource={`${params?.source}`}
            setpincode={() => {}}
          />
        )}
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
              {documentType && documentType?.trim() !== "Project Plan" && (
                <Autocomplete
                  disablePortal
                  sx={
                    documentTypeList?.length === 1 && {
                      backgroundColor: "#f3f3f3",
                      borderRadius: "6px",
                    }
                  }
                  id="combo-box-demo"
                  getOptionLabel={(option) =>
                    option?.documentName?.toString() || ""
                  }
                  disableClearable={true}
                  disabled={documentTypeList?.length === 1 ? true : false}
                  options={documentTypeList || []}
                  onChange={(e, value) => {
                    setDocType(value);
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
              )}
            </Grid>
            {!window.location.pathname?.includes("project-management") && (
              <Grid item xs={6} md={4} sx={{ position: "relative" }}>
                <div>
                  <TextField
                    name="remarks"
                    id="remarks"
                    // style={{ padding: "10px", height: "100px"}}
                    className="w-85"    
                    size="small"                
                    value={fileUploadRemark}
                    onChange={(e) => setFileUploadRemark(e.target.value)}
                    placeholder="Remarks"                    
                    onKeyDownCapture={(e: any) => {
                      regExpressionRemark(e);
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                    }}     
                  />
                </div>
              </Grid>
            )}
            {documentType && documentType?.trim() !== "Project Plan" && (
              <Grid item xs={6} md={5}>
                <div style={{ display: "flex" }}>
                  {docType?.templatePath && (
                    <Button
                      onClick={() => {
                        downloadTemplate(docType);
                      }}
                      variant="outlined"
                      size="medium"
                      style={secondaryButton}
                      sx={
                        defineStatusOfUploadByUser(user) && {
                          backgroundColor: "#f3f3f3",
                          borderRadius: "6px",
                        }
                      }
                      disabled={defineStatusOfUploadByUser(user)}
                    >
                      Download Template
                    </Button>
                  )}
                  <div style={{ marginLeft: "7px" }}>
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
            )}
          </Grid>
          {mandateId?.id !== undefined &&
            documentType &&
            documentType?.trim() === "Project Plan" && (
              <div style={{ marginTop: 10, marginBottom: 10 }}>
                <ProjectPlan
                  mandate={mandateId}
                  getActivityCompletedStatus={() =>
                    getActivityCompletedStatus()
                  }
                  projectPlanData={projectPlanData}
                  setProjectPlanData={setProjectPlanData}
                  vendorType={docType}
                  getHeightForProjectPlan={getHeightForProjectPlan}
                  projectPlanDataUpdated={projectPlanDataUpdated}
                  setProjectPlanDataUpdated={setProjectPlanDataUpdated}
                />
              </div>
            )}
          {mandateId?.id !== undefined &&
            documentType &&
            documentType?.trim() !== "Project Plan" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ marginTop: "10px" }}>
                    Version History
                  </Typography>{" "}
                </div>
                <div style={{ height: getHeightForTable(), marginTop: "10px" }}>
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
              </>
            )}
          <br></br>
          {mandateId && mandateId?.id !== undefined && (
            <DataTable mandateId={mandateId?.id} pathName={module} />
          )}
        </div>

        {action === "" && runtimeId === 0 && false && (
          <>
            <div className="bottom-fix-btn">
              <div className="remark-field" style={{ marginRight: "0px" }}>
                <Button
                  variant="outlined"
                  size="medium"
                  type="submit"
                  name="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (mandateId?.id === undefined) {
                      dispatch(fetchError("Please select Mandate !!!"));
                      return;
                    }
                    if (
                      docUploadHistory &&
                      docUploadHistory?.length === 0 &&
                      documentType &&
                      documentType?.trim() !== "Project Plan"
                    ) {
                      dispatch(fetchError("Please upload file"));
                      return;
                    }
                    if (
                      projectPlanData &&
                      projectPlanData?.length === 0 &&
                      documentType &&
                      documentType?.trim() === "Project Plan"
                    ) {
                      dispatch(fetchError("Please add project plan"));
                      return;
                    }
                    if (
                      documentType &&
                      documentType?.trim() !== "Project Plan"
                    ) {
                      workFlowMandate();
                    }
                    if (documentType && documentType?.trim() === "") {
                      _saveOrUpdateProjectPlanData();
                    }
                  }}
                  style={{
                    padding: "2px 20px",
                    borderRadius: 6,
                    color: "#fff",
                    borderColor: "#00316a",
                    backgroundColor: "#00316a",
                  }}
                >
                  SUBMIT
                </Button>
                {userAction?.stdmsg !== undefined && (
                  <span className="message-right-bottom">
                    {userAction?.stdmsg}
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        <div className="bottom-fix-history" style={{ bottom: "135px" }}>
          <MandateStatusHistory
            mandateCode={mandateId?.id}
            accept_Reject_Remark={currentRemark}
            accept_Reject_Status={currentStatus}
          />
        </div>
      </div>
      {userAction?.module === module && (
        <>
          {action && (action === "Create" || action === "Upload") && (
            <div className="bottom-fix-btn">
              <div className="remark-field" style={{ marginRight: "0px" }}>
                <Button
                  variant="outlined"
                  size="medium"
                  type="submit"
                  name="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (mandateId?.id === undefined) {
                      dispatch(fetchError("Please select Mandate !!!"));
                      return;
                    }
                    if (
                      docUploadHistory &&
                      docUploadHistory?.length === 0 &&
                      documentType &&
                      documentType?.trim() !== "Project Plan"
                    ) {
                      dispatch(fetchError("Please upload file"));
                      return;
                    }
                    if (
                      projectPlanData &&
                      projectPlanData?.length === 0 &&
                      documentType &&
                      documentType?.trim() === "Project Plan"
                    ) {
                      dispatch(fetchError("Please add project plan"));
                      return;
                    }
                    if (
                      documentType &&
                      documentType?.trim() !== "Project Plan"
                    ) {
                      workFlowMandate();
                    }
                    if (
                      documentType &&
                      documentType?.trim() === "Project Plan"
                    ) {
                      _saveOrUpdateProjectPlanData();
                    }
                  }}
                  style={{
                    marginLeft: 10,
                    padding: "2px 20px",
                    borderRadius: 6,
                    color: "#fff",
                    borderColor: "#00316a",
                    backgroundColor: "#00316a",
                  }}
                >
                  SUBMIT
                </Button>
                {userAction?.stdmsg !== undefined && (
                  <span className="message-right-bottom">
                    {userAction?.stdmsg}
                  </span>
                )}
              </div>
            </div>
          )}

          {action && action === "Approve" && (
            <div className="bottom-fix-btn-content">
              <div className="remark-field">
                <div style={{ padding: "10px 0px" }}>
                  <ApprovedRejectContent
                    approved={approved}
                    sendBack={sendBack}
                    setSendBack={setSendBack}
                    setApproved={setApproved}
                    remark={remark}
                    setRemark={setRemark}
                    approveEvent={() => {
                      workflowFunctionAPICall(
                        runtimeId,
                        mandateId?.id,

                        remark,
                        "Approved",
                        navigate,
                        user
                      );
                    }}
                    sentBackEvent={() => {
                      workflowFunctionAPICall(
                        runtimeId,
                        mandateId?.id,

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
                </div>
              </div>
            </div>
          )}
          {action && action?.trim() === "Approve or Reject" && (
            <div className="bottom-fix-btn-content">
              <div className="remark-field" style={{alignItems:"flex-end" }}>
                <ApprovedSentBackContent
                  approved={approved}
                  sendBack={sendBack}
                  setSendBack={setSendBack}
                  setApproved={setApproved}
                  rejected={rejected}
                  setRejected={setRejected}
                  remark={remark}
                  setRemark={setRemark}
                  approveEvent={() => {
                    workflowFunctionAPICall(
                      runtimeId,
                      mandateId?.id,
                      remark,
                      "Approved",
                      navigate,
                      user
                    );
                  }}
                  sentBackEvent={() => {
                    workflowFunctionAPICall(
                      runtimeId,
                      mandateId?.id,
                      remark,
                      "Sent Back",
                      navigate,
                      user
                    );
                  }}
                  rejectEvent={() => {
                    workflowFunctionAPICall(
                      runtimeId,
                      mandateId?.id,
                      remark,
                      "Rejected",
                      navigate,
                      user
                    );
                  }}
                />
                <span className="message-right-bottom">
                  {userAction?.stdmsg}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
export default UploadDocuments;
