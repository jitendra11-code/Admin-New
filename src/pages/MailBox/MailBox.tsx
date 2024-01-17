import React, { useEffect, useState, useRef, useMemo } from "react";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { Stack, Grid, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, TextField, InputAdornment, IconButton, Autocomplete } from "@mui/material";
import { primaryButtonSm } from "shared/constants/CustomColor";
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import { TbPencil } from "react-icons/tb";
import axios from "axios";
import moment from "moment";
import { useFormik } from "formik";
import * as Yup from "yup";
import regExpressionTextField, { textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch } from "react-redux";
import SearchIcon from '@mui/icons-material/Search';
import AppTooltip from "@uikit/core/AppTooltip";
import { AiFillFileExcel } from "react-icons/ai";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { MdOutlineArchive } from "react-icons/md";
import { BiTrashAlt } from "react-icons/bi";
import { TbMailForward } from "react-icons/tb";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
import ToggleSwitch from "@uikit/common/ToggleSwitch";
// import ReactQuill, { Quill } from "react-quill-with-table";
// import QuillBetterTable from "quill-better-table";
// import katex from "katex";
// import "react-quill-with-table/dist/quill.snow.css";
// import "quill-better-table/dist/quill-better-table.css";
// import "katex/dist/katex.min.css";

// Quill.register({ "modules/better-table": QuillBetterTable });
// (window as any).katex = katex;

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function MailBox() {
  const [open, setOpen] = React.useState(false);
  const gridRef = React.useRef<AgGridReact>(null);
  const gridRef2 = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [gridApi2, setGridApi2] = React.useState<GridApi | null>(null);
  const [MasterName, setMasterName] = useState([]);
  const [RightMasterData, setRightMasterData] = useState([]);
  const [selectedLeftsideData, setSelectedLeftsideData] = useState<any>({})
  const [editFlag, setEditFlag] = useState(false);
  const [EditMaster, setEditMaster] = useState<any>({});
  const { user } = useAuthUser();
  const dispatch = useDispatch();
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedActiveRows, setSelectedActiveRows] = useState([]);
  const [selectedInActiveRows, setSelectedInActiveRows] = useState([]);
  const [selectedPendingRows, setSelectedPendingRows] = useState([]);
  const [flag, setFlag] = useState(false);
  const [menuList, setmenuList] = useState([]);
  const [showMailList, setShowMailList] = React.useState(null);
  const [inboxList, setInboxList] = useState([]);
  const [outboxListSuccess, setOutboxListSuccess] = useState([]);
  const [outboxListFailure, setOutboxListFailure] = useState([]);
  const [archiveList, setArchiveList] = useState([]);
  const [viewMail, setViewMail] = useState(false);
  const [objViewMailData, setObjViewMailData] = React.useState<any>();
  const [templateList, setTemplateList] = useState([]);
  const [mandateCodeList, setMandateCodeList] = useState([]);
  const [autoManualValue, setAutoManualValue] = React.useState(true);
  // const modules = {
  //   toolbar: [
  //     ["bold", "italic", "underline", "strike"],
  //     ["blockquote", "code-block"],

  //     [{ header: 1 }, { header: 2 }],
  //     [{ list: "ordered" }, { list: "bullet" }],
  //     [{ script: "sub" }, { script: "super" }],
  //     [{ indent: "-1" }, { indent: "+1" }],

  //     [{ color: [] }, { background: [] }],
  //     [{ font: [] }],
  //     [{ align: [] }],

  //     ["clean"],
  //   ],
  // };
  const [value, setValue] = useState("");
  const [bodyValue, setBodyValue] = useState("");

  // const editorRef = useRef();

  // console.log(value);
  console.log("bodyValue", bodyValue);
  // ***************** start
  // const reactQuillRef = useRef(null);
  // const [editorState, setEditorState] = useState("");

  // const insertTable = () => {
  //   const editor = reactQuillRef.current.getEditor();
  //   const tableModule = editor.getModule("better-table");
  //   tableModule.insertTable(3, 3);
  // };

  // const handleEditorStateChange = (val) => {
  //   setEditorState(val);
  // };

  // useEffect(() => {
  //   const editor = reactQuillRef.current.getEditor();
  //   const toolbar = editor.getModule("toolbar");
  //   toolbar.addHandler("table", () => {
  //     insertTable();
  //   });
  // }, []);

  // const modules = useMemo(
  //   () => ({
  //     table: false,
  //     "better-table": {
  //       operationMenu: {
  //         items: {
  //           unmergeCells: {
  //             text: "Another unmerge cells name"
  //           }
  //         }
  //       }
  //     },
  //     keyboard: {
  //       bindings: QuillBetterTable.keyboardBindings
  //     },
  //     toolbar: [
  //       [
  //         "bold",
  //         "italic",
  //         "underline",
  //         "strike",
  //         { align: [] },
  //         { script: "sub" },
  //         { script: "super" },
  //         { list: "ordered" },
  //         { list: "bullet" },
  //         { indent: "-1" },
  //         { indent: "+1" }
  //       ], // toggled buttons
  //       ["formula", "table"]
  //     ]
  //   }),
  //   []
  // );
  // console.log("editorState", editorState); ***************** end

  // if (editorRef.current) console.log(editorRef.current.editor.getContents());

  const styling = {
    marginTop: "5px",
    marginBottom: "5px",
  }

  const handleClickOpen = () => {
    setOpen(true);
    // setFieldValue("masterName",selectedLeftsideData?.masterName);
  }

  const handleClose = () => {
    setOpen(false);
    setBodyValue("");
    resetForm();
    // setTimeout(()=>{
    //   editFlag ? setEditFlag(false) : setEditFlag(false);
    //   resetForm();
    // },100)
  }

  const handleBack = () => {
    setViewMail(false);
    setSelectedRows([])
    setObjViewMailData(null);
  }

  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }

  function onGridReady2(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }

  const onFilterTextChange = async (e) => {
    gridApi?.setQuickFilter(e.target.value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"));
    }
  };

  const handleRowSelected = () => {
    // debugger
    if (gridRef2.current && gridRef2.current.api) {
      const selectedNodes = gridRef2.current.api.getSelectedNodes();
      const selectedData = selectedNodes.map((node) => node.data);
      // Check if all selected rows have the same status as 'Active'
      // const firstStatus = selectedData.length > 0 ? selectedData[0].status : null;
      // const allHaveSameStatus = selectedData.every((item) => item.status === firstStatus);
      setSelectedRows(selectedData);
      // if (allHaveSameStatus && firstStatus === "Active") {
      //     setSelectedRows(selectedData);
      //     setSelectedActiveRows(selectedData);
      // } else if (allHaveSameStatus && firstStatus === "In Active") {
      //     setSelectedRows(selectedData);
      //     setSelectedInActiveRows(selectedData);
      // } else if (allHaveSameStatus && firstStatus === "Pending") {
      //     setSelectedRows(selectedData);
      //     // setSelectedPendingRows(selectedData);
      // } else if (selectedData.length > 0) {
      //     // User selected rows with different statuses, show error message and deselect all rows
      //     dispatch(fetchError("You can only select rows with the same status."));
      //     gridRef2.current.api.deselectAll();
      //     setSelectedInActiveRows([]);
      //     setSelectedActiveRows([]);
      //     setSelectedPendingRows([]);
      // } else {
      //     // All rows are deselected, reset everything
      //     setSelectedRows([]);
      //     setSelectedActiveRows([]);
      //     setSelectedInActiveRows([]);
      //     setSelectedPendingRows([]);
      // }
    }
  };

  useEffect(() => {
    console.log("Selected Rows1:", selectedRows);
  }, [selectedRows]);

  //  const handleStatusChange = async (buttonName) => {
  //   if (gridRef2.current && gridRef2.current.api) {
  //     const selectedNodes = gridRef2.current.api.getSelectedNodes();
  //     const selectedData = selectedNodes.map((node) => ({
  //       ...node.data,
  //       status: buttonName,
  //     } 
  //     ));
  //     const requestBody = {
  //       model: selectedData
  //     };
  //     console.log("selectedData1",selectedData,requestBody)
  //   axios
  //   .post(
  //     `${process.env.REACT_APP_BASEURL}/api/FormMaster/UpdateFormMasterList
  //     `,
  //     selectedData
  //   )
  //   .then((response: any) => {
  //     if (!response) {
  //       dispatch(fetchError("Common Master Status not updated"));
  //       return;
  //     }
  //     if (
  //       response &&
  //       response?.data?.code === 200 &&
  //       response?.data?.status === true
  //     ) {
  //       setRightMasterData((prevData) =>
  //                       prevData.map((item) => {
  //                           const updatedItem = selectedData.find(
  //                               (selectedItem) => selectedItem.id === item.id
  //                           );
  //                           return updatedItem || item;
  //                       })
  //                   );
  //       dispatch(
  //         showMessage("Common Master Status updated successfully")
  //       );
  //       gridApi.deselectAll();
  //       return;
  //     } else {
  //       dispatch(fetchError("Common Master Status already exists"));
  //       return;
  //     }
  //   })
  //   .catch((e: any) => {
  //     dispatch(fetchError("Error Occurred !"));
  //   });
  //   }
  // };

  // const handleActive = () => {
  //   setFlag(true)
  //   handleStatusChange("Active");
  // };

  // Call this function when the "In Active" button is clicked
  // const handleInactive = () => {
  //   setFlag(true)
  //   handleStatusChange("In Active");
  // };

  // const getMasterName = async () => {
  //   await axios
  //       .get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetMasterName`)
  //       .then((response : any)=>{
  //         setMasterName(response?.data || []);
  //         showRightData(response?.data?.[0] || [])
  //       })
  //       .catch((e:any) => {});
  // }

  // useEffect(()=>{
  //   if (editFlag) {
  //     setFieldValue("masterName", EditMaster?.masterName);
  //     setFieldValue("formName", EditMaster?.formName);
  //   }
  // },[setEditMaster,editFlag]);

  // const handleExportData = () => {
  //   axios
  //     .get(
  //       `${process.env.REACT_APP_BASEURL}/api/FormMaster/GetExcelReport?mastername=${selectedLeftsideData?.masterName}`
  //     )
  //     .then((response) => {
  //       if (!response) {
  //         dispatch(fetchError("Error occurred in Export !!!"));
  //         return;
  //       }
  //       if (response?.data) {
  //         var filename = "CommonMaster.xlsx";
  //         if (filename && filename === "") {
  //           dispatch(fetchError("Error Occurred !"));
  //           return;
  //         }
  //         const binaryStr = atob(response?.data);
  //         const byteArray = new Uint8Array(binaryStr.length);
  //         for (let i = 0; i < binaryStr.length; i++) {
  //           byteArray[i] = binaryStr.charCodeAt(i);
  //         }

  //         var blob = new Blob([byteArray], {
  //           type: "application/octet-stream",
  //         });
  //         if (typeof window.navigator.msSaveBlob !== "undefined") {
  //           window.navigator.msSaveBlob(blob, filename);
  //         } else {
  //           var blobURL =
  //             window.URL && window.URL.createObjectURL
  //               ? window.URL.createObjectURL(blob)
  //               : window.webkitURL.createObjectURL(blob);
  //           var tempLink = document.createElement("a");
  //           tempLink.style.display = "none";
  //           tempLink.href = blobURL;
  //           tempLink.setAttribute("download", filename);
  //           if (typeof tempLink.download === "undefined") {
  //             tempLink.setAttribute("target", "_blank");
  //           }

  //           document.body.appendChild(tempLink);
  //           tempLink.click();

  //           setTimeout(function () {
  //             document.body.removeChild(tempLink);
  //             window.URL.revokeObjectURL(blobURL);
  //           }, 200);

  //           dispatch(
  //             showMessage("Common Master Excel downloaded successfully!")
  //           );
  //         }
  //       }
  //     });
  // };

  let columnDefs = [
    {
      field: "name",
      headerName: "Menu",
      headerTooltip: "Menu",
      sortable: false,
      resizable: true,
      width: 279,
      cellStyle: { fontSize: "13px" },
    },
  ];

  let columnDefs2 = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      field: "Action",
      headerName: "Actions",
      headerTooltip: "Actions",
      sortable: false,
      resizable: false,
      pinned: "left",
      cellRenderer: (params: any) => (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginRight: "10px",
            }}
            className="actions"
          >
            {/* <Tooltip title="Edit" className="actionsIcons">
                  <button className="actionsIcons actionsIconsSize" >
                    <TbPencil onClick={() => { setEditMaster(params?.data); setEditFlag(true); setOpen(true); }}/>
                  </button>
                </Tooltip> */}
            <AppTooltip title="View">
              <VisibilityIcon style={{ fontSize: "15px" }} onClick={() => { handleView(params?.data); }} className="actionsIcons" />
              {/* <VisibilityIcon style={{ fontSize: "15px" }} onClick={() => { setViewMail(true); setObjViewMailData(params?.data); setSelectedRows([]); }} className="actionsIcons"/> */}
            </AppTooltip>
          </div>
        </>
      ),
      width: 120,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "to",
      headerName: "To",
      headerTooltip: "TO",
      sortable: true,
      resizable: true,
      width: 245,
      minWidth: 245,
      cellStyle: { fontSize: "13px" },
      tooltipField: "to",
    },
    {
      field: "subject",
      headerName: "Subject",
      headerTooltip: "Subject",
      sortable: true,
      resizable: true,
      width: 200,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
      tooltipField: "subject",
    },
    {
      field: "logTime",
      headerName: "Sent On",
      headerTooltip: "Sent On",
      sortable: true,
      resizable: true,
      width: 200,
      minWidth: 200,
      cellRenderer: (e: any) => {
        return moment(e?.data?.logTime).format("DD/MM/YYYY h:mm:ss A");
      },
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "mandateCode",
      headerName: "Mandate Code",
      headerTooltip: "Mandate Code",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 200,
      minWidth: 200,
    },
    {
      field: "templatename",
      headerName: "Template",
      headerTooltip: "Template",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 300,
      minWidth: 300,
      tooltipField: "templatename",
    },
  ];

  let columnDefsFailure = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      field: "Action",
      headerName: "Actions",
      headerTooltip: "Actions",
      sortable: false,
      resizable: false,
      pinned: "left",
      cellRenderer: (params: any) => (
        <>
          <div

            className="actions"
          >
            <AppTooltip title="View">
              <VisibilityIcon style={{ fontSize: "15px" }} onClick={() => { handleView(params?.data); }} className="actionsIcons" />
              {/* <VisibilityIcon style={{ fontSize: "15px" }} onClick={() => { setViewMail(true); setObjViewMailData(params?.data); }} className="actionsIcons"/> */}
            </AppTooltip>

            {selectedRows.length == 0 &&
              <AppTooltip title="Re Sent">
                <IconButton
                  className="icon-btn"
                  sx={{
                    width: 37,
                    height: 37,
                    color: "#00316a",
                  }}
                  onClick={() => { handleReSent(params?.data); }}
                // size="large"
                >
                  <TbMailForward />
                </IconButton>
              </AppTooltip>
            }
          </div>
        </>
      ),
      width: 120,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "to",
      headerName: "To",
      headerTooltip: "TO",
      sortable: true,
      resizable: true,
      width: 245,
      minWidth: 245,
      cellStyle: { fontSize: "13px" },
      tooltipField: "to",
    },
    {
      field: "subject",
      headerName: "Subject",
      headerTooltip: "Subject",
      sortable: true,
      resizable: true,
      width: 200,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
      tooltipField: "subject",
    },
    {
      field: "logTime",
      headerName: "Sent On",
      headerTooltip: "Sent On",
      sortable: true,
      resizable: true,
      width: 200,
      minWidth: 200,
      cellRenderer: (e: any) => {
        return moment(e?.data?.logTime).format("DD/MM/YYYY h:mm:ss A");
      },
      cellStyle: { fontSize: "13px" },

    },
    {
      field: "mandateCode",
      headerName: "Mandate Code",
      headerTooltip: "Mandate Code",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 200,
      minWidth: 200,
    },
    {
      field: "templatename",
      headerName: "Template",
      headerTooltip: "Template",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 300,
      minWidth: 300,
      tooltipField: "templatename",
    },
    {
      field: "exceptionMessage",
      headerName: "Exception",
      headerTooltip: "Exception",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 300,
      minWidth: 300,
      tooltipField: "exceptionMessage",
    },
  ];

  const validateSchema = Yup.object({
    // formName: Yup.string().required("Please enter Name"),
    subject: Yup.string().required("Please enter Subject"),
    templateName: Yup.object().nullable().required("Please Select Template Name"),
    mandetCode: Yup.object().nullable().required("Please Select Mandate Code"),
    to: Yup.string().required("Please enter To"),
    cc: Yup.string().required("Please enter CC"),
    //  bodyValue: Yup.string().required("Please enter Body"),
  });

  const {

    values,
    handleBlur,
    setFieldValue,
    handleChange,
    handleSubmit,
    setFieldError,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: {
      // masterName: '',
      // formName: '',
      templateName: null,
      mandetCode: null,
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      // bodyValue: ''
    },
    validationSchema: validateSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values, action) => {
      // const body = {
      //   templateName : values?.templateName?.templateName,
      //   mandetCode : values?.mandetCode?.mandetCode,
      //   to : values?.to,
      //   cc : values?.cc,
      //   subject : values?.subject,
      //   body : bodyValue
      // }

      const body = {
        "templateName": values?.templateName?.templateName,
        "phaseId": values?.mandetCode?.phaseId,
        "mandateId": values?.mandetCode?.mandetId,
        "subject": values?.subject,
        "to": values?.to,
        "cc": values?.cc,
        "bcc": values?.bcc,
        "mainBody": bodyValue
      }
      console.log("body", body);
      //  console.log("bodyValue",bodyValue);
      // if(editFlag)
      // {
      axios
        .post(`${process.env.REACT_APP_BASEURL}/api/MailLogs/SendEmail`, body)
        .then((response: any) => {
          // console.log("response SendEmail", response)
          if (!response) {
            dispatch(fetchError("Error Occurred"));
            setOpen(false);
            return;
          };
          if (response && response?.data?.code === 200 && response?.data?.status === true) {
            dispatch(showMessage("Mail Sent Sucessfull"));
            setOpen(false);
            // showRightData(body);
            return;
          } else {
            dispatch(fetchError("Error Occurred"));
            setOpen(false);
            return;
          }
        })
        .catch((e: any) => {
          setOpen(false);
          dispatch(fetchError("Error Occurred !"));
        });
      // }
      // else
      // {
      //   axios
      //   .post(`${process.env.REACT_APP_BASEURL}/api/FormMaster/InsertFormMaster`, body)
      //   .then((response: any) => {
      //     if (!response) {
      //       dispatch(fetchError("Common Master details not added"));
      //       setOpen(false);
      //       return;
      //     };
      //     if (response && response?.data?.code === 200 && response?.data?.status === true) {
      //       dispatch(showMessage("Common Master details added successfully"));
      //       setOpen(false);
      //       showRightData(body);
      //       return;
      //     } else {
      //       dispatch(fetchError("Common Master details already exists"));
      //       setOpen(false);
      //       return;
      //     }
      //   })
      //   .catch((e: any) => {
      //     setOpen(false);
      //     dispatch(fetchError("Error Occurred !"));
      //   });
      // }

      // setTimeout(()=>{
      //   editFlag ? setEditFlag(false) : setEditFlag(false);
      //   action.resetForm();
      // },300);
      action.resetForm();
      setBodyValue("");
    },
  });

  const getAllTemplates = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/MailLogs/GetAllTemplates`)
      .then((response: any) => {
        // console.log("response", response?.data);
        setTemplateList(response?.data || []);
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  const getAllMandatePhasecodes = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/MailLogs/GetAllMandatePhasecodes`)
      .then((response: any) => {
        // console.log("response", response?.data);
        setMandateCodeList(response?.data || []);
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  const getEmailData = () => {
    // console.log("getEmailData", v);
    setFieldValue("to", "");
    setFieldValue("cc", "");
    setFieldValue("bcc", "");
    setFieldValue("subject", "");
    setBodyValue("");
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/MailLogs/GetEmailData?TemplateName=${values?.templateName?.templateName}&PhaseId=${values?.mandetCode?.phaseId}&MandateId=${values?.mandetCode?.mandetId}`)
      .then((response: any) => {
        console.log("response getEmailData", response?.data);
        if (!response) {
          setFieldValue("to", "");
          setFieldValue("cc", "");
          setFieldValue("bcc", "");
          setFieldValue("subject", "");
          setBodyValue("");
          dispatch(fetchError("Error Occurred"));
          return;
        };
        if (response && response?.data && response?.data?.length > 0) {
          setFieldValue("to", response?.data[0].to);
          setFieldValue("cc", response?.data[0].cc);
          setFieldValue("bcc", response?.data[0].bcc);
          setFieldValue("subject", response?.data[0].subject);
          setBodyValue(response?.data[0].mainBody)
        } else {
          // resetForm();
          setFieldValue("to", "");
          setFieldValue("cc", "");
          setFieldValue("bcc", "");
          setFieldValue("subject", "");
          setBodyValue("");
          dispatch(fetchError("Error Occurred"));
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  const getMailLogs = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/MailLogs/GetAllMailLogs`)
      .then((response: any) => {
        console.log("setInboxList", response?.data);
        setInboxList(response?.data?.data || []);
        // if(showMailList == "Outbox (Failure)"){
        //   console.log("Enter Outbox (Failure)")
        //   setOutboxListFailure(inboxList?.filter((v) => v?.status == "Failed"));
        // }
      })
      .catch((e: any) => { });
  }

  useEffect(() => {
    setmenuList([{ name: "Inbox" }, { name: "Outbox (Success)" }, { name: "Outbox (Failure)" }, { name: "Archive" }])
    getMailLogs();
    getAllTemplates();
    getAllMandatePhasecodes();
  }, []);

  useEffect(() => {
    if (gridRef.current && gridRef.current!.api) {
      gridRef.current.api.forEachNode((node, index) => {
        if (index === 0) {
          node.setSelected(true);
          setShowMailList("Inbox");
        }
      })
    }
  }, [menuList]);

  const showRightData = async (data: any) => {
    // console.log("data", data?.name);
    setViewMail(false);
    setSelectedRows([])
    setObjViewMailData(null);
    if (data?.name == "Inbox") {
      setShowMailList("Inbox")
      getMailLogs();
    } else if (data?.name == "Outbox (Success)") {
      setShowMailList("Outbox (Success)")
      getOutboxSuccess();
      // setOutboxListSuccess(inboxList?.filter((v) => v?.status == "Success"));
    } else if (data?.name == "Outbox (Failure)") {
      setShowMailList("Outbox (Failure)");
      getOutboxFailure();
      // setOutboxListFailure(inboxList?.filter((v) => v?.status == "Failed"));
    } else if (data?.name == "Archive") {
      setShowMailList("Archive")
    }
    // setSelectedLeftsideData(data);
    // await axios
    //   .get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?masterName=${data?.masterName}`)
    //   .then((response: any) => {
    //     setRightMasterData(response?.data || []);
    //     setSelectedRows([])
    //     setSelectedActiveRows([])
    //     setSelectedInActiveRows([])
    //     // setSelectedPendingRows([])
    //   })
    //   .catch((e: any) => { });
  }

  const getOutboxSuccess = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/MailLogs/GetAllMailLogs?status=Success`)
      .then((response: any) => {
        // console.log("setOutboxListSuccess", response?.data);
        setOutboxListSuccess(response?.data?.data || []);
      })
      .catch((e: any) => { });
  }

  const getOutboxFailure = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/MailLogs/GetAllMailLogs?status=Failed`)
      .then((response: any) => {
        // console.log("setOutboxListFailure", response?.data);
        setOutboxListFailure(response?.data?.data || []);
      })
      .catch((e: any) => { });
  }

  const handleReSent = async (data: any) => {
    setSelectedRows([])
    console.log("handleReSent", data);
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/Common/ReSendEMail?Id=${data?.id}`)
      .then((response: any) => {
        console.log("response", response);
        if (!response) {
          dispatch(fetchError("Error Occured !!!"));
          //  setOpen(false);
          return;
        }
        if (response.code === 200) {
          dispatch(showMessage("Mail Re Sent Successfully"));
          //  setOpen(false);
          //  getMailLogs();
          getOutboxFailure();
        } else {
          dispatch(fetchError("Mail Re Sent Failed !!!"));
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
        //  setOpen(false);
      });
    //  }

    //  setTimeout(()=>{
    //    emptyForm();
    //    handleClose();
    //  },200);

  }

  const handleView = async (data: any) => {
    console.log("data", data);
    setViewMail(true);
    setSelectedRows([])
    setObjViewMailData(data);
    // console.log("objViewMailData", objViewMailData);
  }

  const handleAutoManualValue = (e) => {
    setAutoManualValue(e.target.value === "true" ? true : false);
  };

  React.useEffect(() => {
    if (values?.templateName?.templateName && values?.mandetCode?.phaseId && values?.mandetCode?.mandetId) {
      getEmailData();
    }
    if (values?.templateName && values?.mandetCode) {
      if (values?.to.length > 0) {
        setFieldError('to', '');
      }
      if (values?.cc.length > 0) {
        setFieldError('cc', '');
      }
      getEmailData();
    }
  }, [values?.templateName, values?.mandetCode]);

  // console.log("setSelectedLeftsideData",selectedLeftsideData?.masterName)
  // const getTitle = () => {
  //   if (editFlag) {
  //     return 'Edit Common Master Details';
  //   } else {
  //     return 'Add Common Master Details';
  //   }
  // }

  return (
    <>
      {/* <div>
      <ReactQuill
        ref={reactQuillRef}
        modules={modules}
        theme="snow"
        onChange={handleEditorStateChange}
      />
    </div> */}
      {/* <div style={{ display: "flex" }}>
      <ReactQuill
        theme="snow"style={{display: "none"}}
        value={value}
        onChange={setValue}
        modules={modules}
        style={{ height: "11in", margin: "1em", flex: "1" }}
        // ref={editorRef}
      />
    </div> */}

      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <Box component="h2" className="page-title-heading mb-0">
          Mail Box
        </Box>
        {/* <div className="rolem-grid"> */}
        <div className="rolem-grid" style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              verticalAlign: "middle",
              marginRight: 5,
            }}
          >
            <Stack
              display="flex"
              alignItems="flex-end"
              justifyContent="space-between"
              flexDirection="row"
              sx={{ mb: -2 }}
            >
              {viewMail == false &&
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
              }
            </Stack>
          </div>
          <div style={{ display: "inline-block", verticalAlign: "middle" }}>
            <Stack
              display="flex"
              alignItems="flex-end"
              justifyContent="space-between"
              flexDirection="row"
              sx={{ mb: -2 }}
            >

              <>
                {/* {selectedInActiveRows.length > 0  &&
                 <Button
                    size="small"
                    style={primaryButtonSm}
                    sx={{ color: "#fff", fontSize: "12px", justifyContent:"flex-end" }}
                    // onClick={() => handleStatusChange("Active")}
                    onClick={handleActive}

                  >
                    Active 
                  </Button>
                }   */}
                {/* {selectedActiveRows.length > 0 &&        
                  <Button
                    size="small"
                    style={primaryButtonSm}
                    sx={{ color: "#fff", fontSize: "12px",justifyContent:"flex-end"}}
                    // onClick={() => handleStatusChange("In Active")}
                    onClick={handleInactive}

                  >
                    In Active 
                  </Button>            
                } */}
                {/* <Button
                    size="small"
                    style={primaryButtonSm}
                    sx={{ color: "#fff", fontSize: "12px", justifyContent:"flex-end"}}
                    onClick={handleClickOpen}
                  >
                    Add New 
                  </Button> */}
              </>

              <Dialog
                open={open}
                // onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                maxWidth="lg"
                PaperProps={{ style: { borderRadius: '20px', } }}
              >
                <form onSubmit={handleSubmit}>
                  <DialogTitle id="alert-dialog-title" className="title-model">
                    {/* {getTitle()} */}
                    Compose Mail
                  </DialogTitle>
                  <DialogContent style={{ width: "1200px", height: "500px" }}>  {/* style={{ width: "450px" }} */}
                    <div style={{ width: "100%", display: "flex" }}>
                      <div style={{ width: "50%" }}>
                        <Grid
                          marginBottom="0px"
                          item
                          container
                          spacing={3}
                          justifyContent="start"
                          alignSelf="center"
                        >
                          <Grid item xs={6} md={6} sx={{ position: "relative" }}>
                            <h2 className="phaseLable required" style={styling}>Type</h2>
                            <ToggleSwitch
                              alignment={autoManualValue}
                              handleChange={(e) => handleAutoManualValue(e)}
                              yes={"Auto"}
                              no={"Manual"}
                              name={"autoManual"}
                              id="autoManual"
                              onBlur={() => { }}
                              disabled={false}
                            />
                          </Grid>
                          <Grid item xs={6} md={6} sx={{ position: "relative" }}></Grid>
                        </Grid>

                        <h2 className="phaseLable required" style={styling}>Template Name</h2>
                        <Autocomplete
                          disablePortal
                          disableClearable={true}
                          options={templateList || []}
                          getOptionLabel={(option) => {
                            return option?.templateName?.toString() || "";
                          }}
                          // defaultValue={values ?.section || ""}
                          value={values?.templateName || ""}
                          onChange={(e, value) => {
                            console.log('MMM', value);
                            setFieldValue('templateName', value);
                            // setFieldValue('gL_Category', null);
                          }}
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
                              className="w-85"
                            />
                          )}
                        />
                        {touched.templateName && errors.templateName ? <p className="form-error">{String(errors.templateName)}</p> : null}

                        <h2 className="phaseLable required" style={styling}>Mandate Code</h2>
                        <Autocomplete
                          disablePortal
                          disableClearable={true}
                          options={mandateCodeList || []}
                          getOptionLabel={(option) => {
                            return option?.mandetCode?.toString() || "";
                          }}
                          // defaultValue={values ?.section || ""}
                          value={values?.mandetCode || ""}
                          onChange={(e, value) => {
                            console.log('MMM', value);
                            setFieldValue('mandetCode', value);
                            // getEmailData(e, value);
                            // setFieldValue('gL_Category', null);
                          }}
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
                              className="w-85"
                            />
                          )}
                        />
                        {touched.mandetCode && errors.mandetCode ? <p className="form-error">{String(errors.mandetCode)}</p> : null}
                        <h2 className="phaseLable required" style={styling}>To</h2>
                        <TextField
                          //disabled
                          id="to"
                          name="to"
                          variant="outlined"
                          size="small"
                          value={values?.to || ""}
                          onBlur={handleBlur}
                          onKeyDown={(e: any) => {
                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                              e.preventDefault();
                            }
                            if (e.code === 'Space') {
                              e.preventDefault();
                            }
                          }}
                          onPaste={(e: any) => {
                            textFieldValidationOnPaste(e)
                          }}
                          onChange={handleChange}
                        />
                        {touched.to && errors.to ? (<p className="form-error">{errors.to}</p>) : null}
                        <h2 className="phaseLable required" style={styling}>CC</h2>
                        <TextField
                          id="cc"
                          name="cc"
                          variant="outlined"
                          size="small"
                          value={values?.cc || ""}
                          onBlur={handleBlur}
                          onKeyDown={(e: any) => {
                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                              e.preventDefault();
                            }
                            if (e.code === 'Space') {
                              e.preventDefault();
                            }
                          }}
                          onPaste={(e: any) => {
                            textFieldValidationOnPaste(e)
                          }}
                          onChange={handleChange}
                        />
                        {touched.cc && errors.cc ? (<p className="form-error">{errors.cc}</p>) : null}
                        <h2 className="phaseLable" style={styling}>Bcc</h2>
                        <TextField
                          id="bcc"
                          name="bcc"
                          variant="outlined"
                          size="small"
                          value={values?.bcc || ""}
                          onBlur={handleBlur}
                          onKeyDown={(e: any) => {
                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                              e.preventDefault();
                            }
                            if (e.code === 'Space') {
                              e.preventDefault();
                            }
                          }}
                          onPaste={(e: any) => {
                            textFieldValidationOnPaste(e)
                          }}
                          onChange={handleChange}
                        />
                        <h2 className="phaseLable required" style={styling}>Subject</h2>
                        <TextField
                          id="subject"
                          name="subject"
                          variant="outlined"
                          size="small"
                          value={values?.subject || ""}
                          onBlur={handleBlur}
                          onKeyDown={(e: any) => {
                            regExpressionTextField(e);
                          }}
                          onPaste={(e: any) => {
                            textFieldValidationOnPaste(e)
                          }}
                          onChange={handleChange}
                        />
                        {touched.subject && errors.subject ? (<p className="form-error">{errors.subject}</p>) : null}
                      </div>
                      <div style={{ width: "50%" }}>
                        <h2 className="phaseLable" style={{ marginTop: "5px", marginBottom: "5px", marginLeft: "10px" }}>Body</h2>
                        <div style={{ marginLeft: "10px" }}>
                          <CKEditor
                            editor={ClassicEditor}
                            data={bodyValue}
                            onChange={(event, editor) => {
                              const data = editor.getData();
                              setBodyValue(data);
                              console.log({ event, editor, data });
                            }}
                          />
                        </div>
                        {/* <div style={{ display: "flex", paddingLeft: "10px" }}>
                    <ReactQuill
                    ref={reactQuillRef}
                      theme="snow"
                      value={bodyValue}
                      onChange={setBodyValue}
                      modules={modules}
                      style={{ flex: "1", height: "3.7in" }} //   height: "11in", margin: "1em",
                      // ref={editorRef}
                    />
                  </div> */}
                        {/* <div>
                  <ReactQuill
                    ref={reactQuillRef}
                    modules={modules}
                    theme="snow"
                    onChange={handleEditorStateChange}
                  />
                </div> */}

                        {/* {touched.bodyValue && errors.bodyValue ? (<p className="form-error">{errors.bodyValue}</p>) : null} */}
                      </div>
                    </div>

                  </DialogContent>
                  <DialogActions className="button-wrap">
                    {/* <Button className="yes-btn" type="submit">{editFlag ? 'Update' : 'Submit'}</Button> */}
                    <Button className="yes-btn" type="submit">Send</Button>
                    <Button className="no-btn" onClick={handleClose}>Cancel</Button>
                  </DialogActions>
                </form>
              </Dialog>

              {/* <AppTooltip title="Export Excel">
              <IconButton
                className="icon-btn"
                sx={{
                 
                  width: 35,
                  height: 35,
                  color: "white",
                  backgroundColor: "green",
                  "&:hover, &:focus": {
                    backgroundColor: "green",
                  },
                }}
                onClick={() => { handleExportData(); }}
                size="large"
              >
                <AiFillFileExcel />
              </IconButton>
            </AppTooltip> */}

              {selectedRows.length > 0 &&
                <AppTooltip title="Trash">
                  <IconButton
                    className="icon-btn"
                    sx={{

                      width: 35,
                      height: 35,
                      color: "white",
                      backgroundColor: "green",
                      "&:hover, &:focus": {
                        backgroundColor: "green",
                      },
                    }}
                    // onClick={() => { handleExportData(); }}
                    size="large"
                  >
                    <BiTrashAlt />
                  </IconButton>
                </AppTooltip>
              }
            </Stack>
          </div>
        </div>
      </Grid>
      <Grid
        marginBottom="0px"
        item
        container
        spacing={3}
        justifyContent="start"
        alignSelf="center"
      >
        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
          <Button
            onClick={handleClickOpen}
            style={{ minWidth: "100px", flex: "right", justifyContent: "center", height: "40px" }}
            className="list-button"
          >
            <TbPencil style={{ fontSize: "22px" }} />
            Compose
          </Button>
          <div style={{ height: "calc(100vh - 245px)", marginTop: "5px" }}>
            <CommonGrid
              defaultColDef={{ flex: 1 }}
              columnDefs={columnDefs}
              rowData={menuList}
              onGridReady={onGridReady}
              gridRef={gridRef}
              pagination={false}
              paginationPageSize={null}
              onRowClicked={(e) => showRightData(e?.data)}
              rowSelection="single"
            />
          </div>
        </Grid>
        <Grid item xs={6} md={9} sx={{ position: "relative" }}>
          {viewMail == false &&
            <div style={{ height: "calc(100vh - 200px)", marginTop: "5px", minWidth: "", width: "100%" }}>
              {showMailList == "Inbox" &&
                <CommonGrid
                  defaultColDef={{ flex: 1 }}
                  columnDefs={columnDefs2}
                  rowData={inboxList}
                  onGridReady={onGridReady2}
                  gridRef={gridRef2}
                  pagination={true}
                  paginationPageSize={10}
                  onRowSelected={handleRowSelected}
                  suppressRowClickSelection={true}
                  rowSelection={'multiple'}
                />
              }
              {showMailList == "Outbox (Success)" &&
                <CommonGrid
                  defaultColDef={{ flex: 1 }}
                  columnDefs={columnDefs2}
                  rowData={outboxListSuccess}
                  onGridReady={onGridReady2}
                  gridRef={gridRef2}
                  pagination={true}
                  paginationPageSize={10}
                  onRowSelected={handleRowSelected}
                  suppressRowClickSelection={true}
                  rowSelection={'multiple'}
                />
              }
              {showMailList == "Outbox (Failure)" &&
                <CommonGrid
                  defaultColDef={{ flex: 1 }}
                  columnDefs={columnDefsFailure}
                  rowData={outboxListFailure}
                  onGridReady={onGridReady2}
                  gridRef={gridRef2}
                  pagination={true}
                  paginationPageSize={10}
                  onRowSelected={handleRowSelected}
                  suppressRowClickSelection={true}
                  rowSelection={'multiple'}
                />
              }
              {showMailList == "Archive" &&
                <CommonGrid
                  defaultColDef={{ flex: 1 }}
                  columnDefs={columnDefs2}
                  rowData={archiveList}
                  onGridReady={onGridReady2}
                  gridRef={gridRef2}
                  pagination={true}
                  paginationPageSize={10}
                  onRowSelected={handleRowSelected}
                  suppressRowClickSelection={true}
                  rowSelection={'multiple'}
                />
              }
            </div>
          }
          {viewMail == true &&
            <div style={{ height: "calc(100vh - 200px)", marginTop: "5px", minWidth: "", width: "100%", backgroundColor: "white", border: "1px solid #babfc7", borderRadius: "6px", overflowX: "hidden", overflowY: "auto" }}>
              <div style={{ width: "100%", display: "flex", height: "40px", borderBottom: "1px solid #e8e5dd" }}>
                <div style={{ width: "20%" }}>
                  <AppTooltip title="Back">
                    <IconButton
                      className="icon-btn"
                      sx={{

                        width: 40,
                        height: 40,
                        color: "#00316a",
                        // backgroundColor: "green",
                        // "&:hover, &:focus": {
                        //   backgroundColor: "green",
                        // },
                      }}
                      onClick={() => { handleBack(); }}
                      size="large"
                    >
                      <MdOutlineKeyboardBackspace />
                    </IconButton>
                  </AppTooltip>
                  <AppTooltip title="Archive">
                    <IconButton
                      className="icon-btn"
                      sx={{

                        width: 40,
                        height: 40,
                        color: "#00316a",
                      }}
                      // onClick={() => { handleBack(); }}
                      size="large"
                    >
                      <MdOutlineArchive />
                    </IconButton>
                  </AppTooltip>
                  <AppTooltip title="Trash">
                    <IconButton
                      className="icon-btn"
                      sx={{

                        width: 40,
                        height: 40,
                        color: "#00316a",
                      }}
                      // onClick={() => { handleBack(); }}
                      size="large"
                    >
                      <BiTrashAlt />
                    </IconButton>
                  </AppTooltip>
                </div>
                <div style={{ width: "80%", paddingTop: "10px", textAlign: "start" }}>
                  {objViewMailData?.templatename}
                </div>
                {/* <div style={{ width:"20%", paddingTop: "10px", paddingRight: "10px", textAlign: "end", color:"#808080" }}>
           {moment(objViewMailData?.logTime).format("MMM DD, YYYY, h:mm A")}
           </div> */}
              </div>
              <div>
                <h2 style={{ paddingTop: "20px", paddingLeft: "10px" }}>{objViewMailData?.subject}</h2>
                <div style={{ marginTop: "10px", paddingLeft: "10px", paddingRight: "10px" }}>
                  {/* <span style={{color: "#2196f3"}}>Symu Freebies </span> */}
                  <div style={{ width: "100%", display: "flex" }}>
                    <div style={{ width: "60%" }}>
                      <span style={{ color: "#808080" }}><b>To</b> {objViewMailData?.to}</span><br />
                    </div>
                    <div style={{ width: "40%", textAlign: "end", color: "#808080" }}>
                      {moment(objViewMailData?.logTime).format("MMM DD, YYYY, h:mm A")}
                    </div>
                  </div><br />
                  {/* <span style={{color:"#808080"}}><b>To</b> {objViewMailData?.to}</span><br /> */}
                  <span style={{ color: "#808080", wordBreak: "break-all" }}><b>Cc</b> {objViewMailData?.cc}</span><br /><br />
                  {/* <span>{objViewMailData?.templatename}</span><br /><br /> */}
                  <div dangerouslySetInnerHTML={{ __html: objViewMailData?.body }}></div>
                </div>
              </div>
            </div>
          }
        </Grid>
      </Grid>
    </>
  )
}