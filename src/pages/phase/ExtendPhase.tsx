import React, { useCallback, useEffect, useState } from 'react';
import { useUrlSearchParams } from "use-url-search-params";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PhaseInfo from 'pages/common-components/PhaseInformation';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '@auth0/auth0-react';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import axios from 'axios';
import { fetchError, showMessage, showWarning } from 'redux/actions';
import moment from 'moment';
import { Box, Button, InputBase, TextField, Typography, styled, Grid, NativeSelect, Select, MenuItem, Autocomplete, Stack } from '@mui/material';
import { useFormik } from 'formik';
import { addPhaseInitialValues, addPhaseSchema } from '@uikit/schemas';
import { SHOW_MESSAGE } from 'types/actions/Common.action';
import { _validationMaxFileSizeUpload, downloadFile, downloadTemplate } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import DownloadIcon from "@mui/icons-material/Download";
import FileNameDiaglogList from 'pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import regExpressionTextField, { regExpressionRemark, textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';
import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';
import { reset, secondaryButton, submit } from 'shared/constants/CustomColor';
import ApproveAndRejectAction from 'pages/common-components/ApproveRejectAction';
import ApproveRejectReport from "pages/common-components/ApproveRejectReportStrong";

const MAX_COUNT = 8;
const ExtendPhase = () => {
  let { id } = useParams();
  const [data, setData] = React.useState<any>({});
  const [params] = useUrlSearchParams({}, {});
  const [phaseId, setPhaseId] = useState(null);
  const { phaseid, mandateId } = useParams();
  const [country, setCountry] = React.useState([]);
  const [remark, setRemark] = React.useState('');
  const { userMenuList } = useSelector<AppState, AppState["menu"]>(
    ({ menu }) => menu
  );
  const [vertical, setVertical] = React.useState([]);
  const [phaseCode, setPhaseCode] = React.useState("");
  const [projectDeliveryManagerData, setProjectDeliveryManagerData] = React.useState([])
  const [projectManagerData, setProjectManagerData] = React.useState([])
  const { user } = useAuthUser();
  const fileInput = React.useRef(null);
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [userAction, setUserAction] = React.useState(null);
  const [remarks, setRemarks] = React.useState("");
  const [docType, setDocType] = React.useState(null);

  const action = userAction?.action || "";
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );

  const [docUploadHistory, setDocUploadHistory] = React.useState([]);
  const [documentTypeList, setDocumentTypeList] = React.useState([]);
  const location = useLocation();
  const { status } = location.state;
  const apiType = location?.state?.apiType || "";
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [fileLimit, setFileLimit] = React.useState(false);
  const [sendBack, setSendBack] = React.useState(false);
  const [approvalRole, setApprovalRole] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [rejected, setRejected] = React.useState(false);
  const [maxNo, setMaxNo] = React.useState("");
  console.log("userAction",userAction,userActionList,phaseId,location,status)
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
    if (phaseId && phaseId !== undefined) {
      const userAction =
        userActionList &&
        userActionList?.find(
          (item) =>
            item?.mandateId === 0 &&
            item?.module === module.toString() &&
            item?.tableId === parseInt(phaseId)
        );
      if (apiType === "") {
        setUserAction(userAction);
      } else {
        let action = phaseId;
        setUserAction(action);
      }
      if (params.source === "list") {
        navigate(`/phase/${phaseId}/${module}?source=list`, {
          state: { apiType: apiType },
        });
      } else {
        navigate(`/phase/${phaseId}/${module}`, {
          state: { apiType: apiType },
        });
      }
    }
  }, [phaseId]);

  useEffect(() => {
    if (documentTypeList && documentTypeList?.length > 0) {
      var obj =
        documentTypeList &&
        documentTypeList.find((item) => item?.documentName === "Initiate Phase");
      setDocType(obj || null);
    }
  }, [documentTypeList]);
  const runtimeId = userAction?.runtimeId || 0;
  const workflowFunctionAPICall = (runtimeId = 0, tableId = 0, mandateId = 0, remark, action, navigate, user) => {
    const token = localStorage.getItem("token")
    const body = {
      runtimeId: runtimeId || 0,
      mandateId: 0, 
      tableId: tableId || 0,
      remark: remark || "",
      createdBy: user?.UserName,
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: action 
    };
    axios({
      method: 'post',
      url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${remark}`,
      headers: { 'Authorization': `Bearer ${token}` }
    }).then((response: any) => {

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
      .catch((e: any) => {

      });
  }

  const BootstrapInput = styled(InputBase)(({ theme }) => ({
    'label + &': {
      marginTop: theme.spacing(3),
    },
    '& .MuiInputBase-input': {
      borderRadius: 8,
      position: 'relative',
      backgroundColor: theme.palette.background.paper,
      border: '1px solid #ced4da',
      fontSize: 16,
      padding: '5px 20px 8px 15px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      '&:focus': {
        borderRadius: 4,
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
   
  }));

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=CountryMaster`)
      .then((response: any) => {
        setCountry(response?.data?.data || [])
      })
      .catch((e: any) => {
      });
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=VerticalMaster`)
      .then((response: any) => {
        setVertical(response?.data?.data || [])
      })
      .catch((e: any) => {
      });



    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Countries/getAllWithDataWithDesignation?Designation=Project Manager`)
      .then((response: any) => {
        if (!response) return;
        setProjectManagerData(response?.data?.data || [])
      })
      .catch((e: any) => {
      });
  }, [])

  const getById = () => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Phases/GetPhaseCode?ExtPhaseID=${id == 'noid' ? 0 : id}`)
      .then((response: any) => {
        setPhaseCode(response?.data || "")
      })
      .catch((e: any) => {
      });
  };
  useEffect(() => {
    getById();
  }, [phaseId]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getPhaseById = () => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Phases/GetPhase?id=${id}`)
      .then((response: any) => {
        if (!response) return;
        var data = response?.data || [];
        setFieldValue("phaseName", response?.data?.phasename);
        setFieldValue("vertical", response?.data?.verticalId);
        setFieldValue("businessSPOCName", response?.data?.businessSPOCName);
        setFieldValue("projectDeliveryManager", response?.data?.fk_PDM_id);
        { window?.location?.search == "?source=list" && setFieldValue("numberOfBranch", response?.data?.no_of_branches) }
       
      })
      .catch((e: any) => { });
  };
 

  const getMaxNo = () => {
    axios
    .get(`${process.env.REACT_APP_BASEURL}/api/Phases/GetMaxNo?PhaseID=${id}`)
    .then((res: any)=> {
      console.log('res',res)
      setMaxNo(res?.data)
    })
    .catch((e:any)=> {});
  }

  useEffect(() => {
    if (id !== "noid") {
      getPhaseById();
      getMaxNo();
    }
    
  }, [phaseId]);



  const { values, handleBlur, setFieldValue, handleChange, handleSubmit, errors, touched, resetForm } =
    useFormik({
      initialValues: addPhaseInitialValues,
      validationSchema: addPhaseSchema,
      validateOnChange: true,
      validateOnBlur: false,
      onSubmit: (values, action) => {
        let con: any = values?.country || country[0]?.id;
        let ver: any = values?.vertical || data?.verticalId;
        let nob: any = +values?.numberOfBranch;
        // let pdm: any = +values.projectManager
        const body = {
          phasename: values?.phaseName,
          no_of_branches: nob,
          fk_country_id: con,
          fk_vertical_id: ver,
          businessSPOCName: "",
          CreatedBy: user?.UserName,
          ModifiedBy: user?.UserName,
          fk_PDM_id: 0,
          fk_PM_id: 0,
          phasecode: phaseCode || ""
        };
        if (values?.numberOfBranch >= '1000') {
          dispatch(fetchError("Number of Mandates must be less than 1000 "))
        } else if (phaseId == null) {
          dispatch(fetchError("Please select Phase id!!"))
        } else if (location?.search === "?source=list") {
          axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/Phases/UpdatePhase?id=${id}`,
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
              "Initiated Phase",
              "Extend Phase",
              navigate,
              user
            );
          }
        })
        }
        else {
          axios
            .post(`${process.env.REACT_APP_BASEURL}/api/Phases/CreatePhase`, body)
            .then((response: any) => {
              if (!response) return
              if (response && response.data) {
                dispatch({
                  type: SHOW_MESSAGE,
                  message:
                    response?.data?.message + "!" || ""
                });
              }
              action.resetForm();
              let tableId = response && response.data?.data && response?.data?.data?.id
              workflowFunctionAPICall(
                0,
                tableId,
                0,
                "Initiated Phase",
                "Extend Phase",
                navigate,
                user
              );
              navigate("/list/phase");
            })
            .catch((e: any) => {
              action.resetForm();
            });
        }
      },
    });

  const getVerticalName = () => {
    const obj = vertical && vertical.find(item => item?.id === values?.vertical);
    return obj || null;
  }
  // const getReportingIdByPDMName = () => {
  //   const obj = projectDeliveryManagerData && projectDeliveryManagerData.find(item => item?.id === values?.projectDeliveryManager);
  //   return obj || null;
  // }

  useEffect(() => {
    if (values?.vertical !== "") {
      var verticalSelected = getVerticalName();

      axios
        .get(`${process.env.REACT_APP_BASEURL}/api/User/GetAllWithConditions?Designation=Project Delivery Manager&VerticalType=${verticalSelected?.verticalName || ""}&reporting_id=0`)
        .then((response: any) => {
          if (!response) return;
          setProjectDeliveryManagerData(response?.data || [])
        })
        .catch((e: any) => {
        });

    }
  }, [values?.vertical])

  // useEffect(() => {
  //   if (values?.vertical !== "") {
  //     var verticalSelected = getVerticalName();
  //     // var reporting_id = getReportingIdByPDMName()
  //     axios
  //       .get(`${process.env.REACT_APP_BASEURL}/api/User/GetAllWithConditions?Designation=Project  Manager&VerticalType=${verticalSelected?.verticalName || ""}&reporting_id=${reporting_id?.id || 0}`)
  //       .then((response: any) => {
  //         if (!response) return;
  //         setProjectManagerData(response?.data || [])
  //       })
  //       .catch((e: any) => {
  //       });

  //   }
  // }, [values?.vertical, values?.projectDeliveryManager])

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
      e.target.value = null;
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
    formData.append("RecordId", maxNo || 0);
    formData.append("remarks", remarks || "");
    formDataTemp.append("uploadNo", maxNo || 0);
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
          e.target.value = null;
          if (!response) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (response?.data?.data == null) {
            setRemarks("")
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
      handleUploadFiles(e, chosenFiles, maxNo);

    }
  };

  const getVersionHistoryData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/ImageStorage/GetDocUploadHistory?mandateid=${0
        }&documentType=${docType?.documentName}&RecordId=${maxNo || 0}`
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
    if (maxNo) {
      getVersionHistoryData();
    }
  }, [docType, maxNo]);

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

 

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 97;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [docUploadHistory, docType]);


  return (
    <>
      <div className="po">
        <Box
          component="h2"
          className="page-title-heading my-6"
        >
          Extend Phase
        </Box>
        <div style={{ backgroundColor: "#fff", padding: "0px", borderRadius: "5px" }}>
          {(
            <PhaseInfo phaseId={phaseId}
              setPhaseId={setPhaseId}
              pageType='phase'
              source='extend'
            />
          )}

        </div>
        <div className="card-panal inside-scroll-251 po"
          style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
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
                      value={phaseCode || ""}
                      onBlur={handleBlur}
                      disabled
                    />

                  </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form" >
                    <h2 className="phaseLable required">Country</h2>
                {action === "Approve or Reject" ? 
                <Select
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    defaultValue={country[0]?.id}
                    variant="outlined"
                    name="country"
                    id="country"
                    value={values?.country || country[0]?.id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    // input={<BootstrapInput />}
                    disabled={action === "Approve or Reject"}
                    sx={action === "Approve or Reject" && {
                      backgroundColor: "#f3f3f3",
                      borderRadius: "6px",
                    }}
                  >
                    {country?.map((v: any) => <option value={v?.id}>{v?.country}</option >)}
                  </Select>
                  :
                    <NativeSelect
                      inputProps={{ "aria-label": "Without label" }}
                      size="small"
                      className="w-85"
                      defaultValue={country[0]?.id}
                      variant="outlined"
                      name="country"
                      id="country"
                      value={values?.country || country[0]?.id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      input={<BootstrapInput />}
                      disabled={action === "Approve or Reject"}
                      sx={action === "Approve or Reject" && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }}
                    >
                      {country?.map((v: any) => <option value={v?.id}>{v?.country}</option >)}
                    </NativeSelect>
                  
                  }
                  {touched.country && errors.country ? (
                      <p className="form-error">{errors.country}</p>
                    ) : null}
                  </div>
                </Grid>

                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required"> Geo Vertical</h2>

                    <Select
                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                      size="small"
                      className="w-85"
                      name="vertical"
                      id="vertical"
                      value={values.vertical || ""}
                      onChange={(e)=> {handleChange(e);
                        const findVerticalId = vertical?.find((item)=> item?.id === e?.target?.value)
                        setPhaseCode(findVerticalId?.verticalID +"_" + phaseCode?.split('_')[1]);
                      }}
                      onBlur={handleBlur}
                      disabled={action === "Approve or Reject"}
                      sx={action === "Approve or Reject" && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }}
                    >
                      <MenuItem value="" style={{ display: "none" }}>
                        <em>Select Vertical</em>
                      </MenuItem>
                      {vertical?.map((v: any) => <MenuItem value={v?.id}>{v?.verticalName}</MenuItem>)}
                    </Select>
                    {touched.vertical && errors.vertical ? (
                      <p className="form-error">{errors.vertical}</p>
                    ) : null}
                  </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Phase Name</h2>
                    <TextField
                      autoComplete="off"
                      name="phaseName"
                      id="phaseName"
                      variant="outlined"
                      size="small"
                      className="w-85"
                      value={values.phaseName || ""}
                      onChange={handleChange}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      onKeyDown={(e: any) => {
                        if (e.target.selectionStart === 0 && e.code === "Space") {
                          e.preventDefault();
                        }
                        regExpressionTextField(e)
                      }}
                      disabled={action === "Approve or Reject"}
                      onBlur={handleBlur}
                    />
                    {touched.phaseName && errors.phaseName ? (
                      <p className="form-error">{errors.phaseName}</p>
                    ) : null}
                  </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Number of Mandates</h2>
                    <TextField
                      autoComplete="off"
                      type="number"
                      name="numberOfBranch"
                      id="numberOfBranch"
                      variant="outlined"
                      size="small"
                      className="w-85"
                      value={values.numberOfBranch}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onKeyDown={(e: any) => {
                        regExpressionTextField(e);
                        blockInvalidChar(e);
                      }}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      disabled={action === "Approve or Reject"}
                    />
                    {touched.numberOfBranch && errors.numberOfBranch ? (
                      <p className="form-error">{errors.numberOfBranch}</p>
                    ) : null}
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
                      value={values?.businessSPOCName}
                      onChange={handleChange}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      onKeyDown={(e: any) => {
                        if (e.target.selectionStart === 0 && e.code === "Space") {
                          e.preventDefault();
                        }
                        regExpressionTextField(e)
                      }}
                      onBlur={handleBlur}
                      disabled={action === "Approve or Reject"}
                    />
                    {touched.businessSPOCName && errors.businessSPOCName ? (
                      <p className="form-error">{errors.businessSPOCName}</p>
                    ) : null}
                  </div>
                </Grid>
                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Project Delivery Manager</h2>
                    <Select

                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                      size="small"
                      className="w-85"
                      name="projectDeliveryManager"
                      id="projectDeliveryManager"
                      value={values?.projectDeliveryManager || ""}
                      onChange={handleChange}
                      disabled={action === "Approve or Reject"}
                      sx={action === "Approve or Reject" && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }}
                      onBlur={handleBlur}
                    >

                      {projectDeliveryManagerData && projectDeliveryManagerData?.map((v) => (
                        <MenuItem value={v?.id}>{v?.userName}</MenuItem>
                      ))}
                    </Select>
                    {touched.projectDeliveryManager && errors.projectDeliveryManager ? (
                      <p className="form-error">{errors.projectDeliveryManager}</p>
                    ) : null}
                  </div>
                </Grid>

                <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable">Project Manager</h2>
                    <Select
                      disabled={phaseCode !== undefined}
                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                      size="small"
                      className="w-85"
                      name="projectManager"
                      id="projectManager"
                      style={{
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }}
                      value={values?.projectManager || null}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >

                      {projectManagerData && projectManagerData?.map((v) => (
                        <MenuItem value={v?.id}>{v?.userName}</MenuItem>
                      ))}
                    </Select>
                    {touched.projectManager && errors.projectManager ? (
                      <p className="form-error">{errors.projectManager}</p>
                    ) : null}
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

            {(action == "" || action == "Extend Phase") &&
              <div className="bottom-fix-btn" style={{ padding: "0px" }}>
                <div className="remark-field" style={{ marginRight: "0px" }}>
                  <Stack
                    display="flex"
                    flexDirection="row"
                    justifyContent="center"
                    style={{
                      marginTop: "20px",
                      position: "fixed",
                      bottom: "10px",
                      left: "46%"
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      type="reset"
                      style={reset}
                      onClick={() => resetForm()}
                    >
                      RESET
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      size="small"
                      style={submit}
                    >
                      SUBMIT
                    </Button>
                  </Stack>
                </div>
              </div>}


            {action &&
              action === "Approve or Reject" && (
                <div className="bottom-fix-btn">
                  <div className="remark-field">
                    <ApproveRejectReport
                      rejected={rejected}
                      setRejected={setRejected}
                      approved={approved}
                      sendBack={sendBack}
                      setSendBack={setSendBack}
                      setApproved={setApproved}
                      remark={remark}
                      setRemark={setRemark}
                      approveEvent={() => {
                        workflowFunctionAPICall(
                          runtimeId,
                          phaseId,
                          0,
                          remark,
                          "Approved",
                          navigate,
                          user
                        );
                      }}
                      rejectEvent={() => {
                        workflowFunctionAPICall(
                          runtimeId,
                          phaseId,
                          0,
                          remark,
                          "Rejected",
                          navigate,
                          user
                        );
                      }}
                      sentBackEvent={() => {
                        workflowFunctionAPICall(
                          runtimeId,
                          phaseId,
                          0,
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
              )}
          </form>
        </div >

      </div >
    </>
  )
}
export default ExtendPhase;