import {
  Box,
  Tooltip,
  Grid,
  Autocomplete,
  TextField,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import regExpressionTextField, {
  textFieldValidationOnPaste,
} from "@uikit/common/RegExpValidation/regForTextField";
import SearchIcon from '@mui/icons-material/Search';
import AppTooltip from "@uikit/core/AppTooltip";
import { addConditionsInitialValues } from "@uikit/schemas";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { GridApi } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import { useFormik } from "formik";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { AiFillFileExcel } from "react-icons/ai";
import { TbPencil } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchError, showMessage } from "redux/actions";
import { primaryButtonSm } from "shared/constants/CustomColor";
import { SHOW_MESSAGE } from "types/actions/Common.action";
import * as Yup from "yup";

export default function TermAndConditionsMaster() {
  const [conditionsData, setConditionsData] = useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [noteTypeData, setNoteTypeData] = useState([]);
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [editFlag, setEditFlag] = useState(false);
  const [EditMaster, setEditMaster] = useState<any>({});
  const [noteTypeDataById, setNoteTypeDataById] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedActiveRows, setSelectedActiveRows] = useState([]);
  const [selectedInActiveRows, setSelectedInActiveRows] = useState([]);
  const [selectedPendingRows, setSelectedPendingRows] = useState([]);
  const [flag, setFlag] = useState(false);

  const getAllData = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/TermsAndCondition/GetAllTermsCondition`
      )
      .then((response: any) => {
        setConditionsData(response?.data || []);
        setSelectedRows([]);
        setSelectedActiveRows([]);
        setSelectedInActiveRows([]);
        setSelectedPendingRows([]);
      })
      .catch((e: any) => {});
  };

  useEffect(() => {
    getAllData();
  }, []);

  const conditionsId = conditionsData.map((item) => item.id);

  console.log("conditionsId", conditionsId);
  console.log("conditionsData", conditionsData);

  const noteType = conditionsData.map((e) => e.notetype);

  console.log("noteType", noteType);

  let noteTypeValue = [];
  let count = 0;
  let start = false;

  for (let j = 0; j < noteType.length; j++) {
    for (let k = 0; k < noteTypeValue.length; k++) {
      if (noteType[j] == noteTypeValue[k]) {
        start = true;
      }
    }
    count++;
    if (count == 1 && start == false) {
      noteTypeValue.push(noteType[j]);
    }
    start = false;
    count = 0;
  }

  // const noteTypeList = useCallback (() => {
  //     // let noteTypeData = [];
  //     let count = 0;
  //     let start = false;
  //      for (let j = 0; j < noteType.length; j++) {
  //         for (let k = 0; k < noteTypeData.length; k++) {
  //             if (noteType[j] == noteTypeData[k]) {
  //                 start = true;
  //             }
  //         }
  //         count++;
  //         if (count == 1 && start == false) {
  //             noteTypeData.push(noteType[j]);
  //         }
  //         start = false;
  //         count = 0;
  //     }

  // },[noteTypeData])

  // useEffect(() =>{
  //     setNoteTypeData(noteTypeValue)
  // },[noteTypeData]);

  const handleRowSelected = () => {
    // debugger
    if (gridRef.current && gridRef.current.api) {
      const selectedNodes = gridRef.current.api.getSelectedNodes();
      const AllData = selectedNodes.map((node) => node.data);
      const selectedData = noteTypeData?.length >0 ? AllData.filter((v)=> v?.notetype == noteTypeData) : AllData ; 
      
      // Check if all selected rows have the same status as 'Active'
      const firstStatus =
        selectedData.length > 0 ? selectedData[0].status : null;
      const allHaveSameStatus = selectedData.every(
        (item) => item.status === firstStatus
      );

      if (allHaveSameStatus && firstStatus === "Active") {
        setSelectedRows(selectedData);
        setSelectedActiveRows(selectedData);
      } else if (allHaveSameStatus && firstStatus === "In Active") {
        setSelectedRows(selectedData);
        setSelectedInActiveRows(selectedData);
      } else if (allHaveSameStatus && firstStatus === "Pending") {
        setSelectedRows(selectedData);
        // setSelectedPendingRows(selectedData);
      } else if (selectedData.length > 0) {
        // User selected rows with different statuses, show error message and deselect all rows
        dispatch(fetchError("You can only select rows with the same status."));
        gridRef.current.api.deselectAll();
        setSelectedInActiveRows([]);
        setSelectedActiveRows([]);
        setSelectedPendingRows([]);
      } else {
        // All rows are deselected, reset everything
        setSelectedRows([]);
        setSelectedActiveRows([]);
        setSelectedInActiveRows([]);
        setSelectedPendingRows([]);
      }
    }
  };

  useEffect(() => {
    console.log("Selected Rows1:", selectedRows);
  }, [selectedRows]);

  const handleStatusChange = async (buttonName) => {
    if (gridRef.current && gridRef.current.api) {
      const selectedNodes = gridRef.current.api.getSelectedNodes();
      const selectedData = selectedNodes.map((node) => ({
        ...node.data,
        status: buttonName,
      }));
      const requestBody = {
        model: selectedData,
      };
      console.log("selectedData1", selectedData, requestBody);
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/TermsAndCondition/UpdateTermsAndConditionList`,
          selectedData
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Terms And Condition Status not updated"));
            return;
          }
          if (
            response &&
            response?.data?.code === 200 &&
            response?.data?.status === true
          ) {
            setConditionsData((prevData) =>
              prevData.map((item) => {
                const updatedItem = selectedData.find(
                  (selectedItem) => selectedItem.id === item.id
                );
                return updatedItem || item;
              })
            );
            dispatch(
              showMessage("Terms And Condition Status updated successfully")
            );
            gridApi.deselectAll();
            return;
          } else {
            dispatch(fetchError("Terms And Condition Status already exists"));
            return;
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occurred !"));
        });
    }
  };

  const handleActive = () => {
    setFlag(true);
    handleStatusChange("Active");
  };

  // Call this function when the "In Active" button is clicked
  const handleInactive = () => {
    setFlag(true);
    handleStatusChange("In Active");
  };

  const getConditionsById = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/TermsAndCondition/GetTermsConditionById?Id=${EditMaster?.id}`
      )
      .then((response: any) => {
        console.log("res", response);
        setNoteTypeDataById(response?.data[0]);
      });
  };

  useEffect(() => {
    getConditionsById();
  }, [EditMaster?.id]);

  const addPhaseSchema = Yup.object({
    notetype: Yup.string().required("Please select Type"),
    sequenceNo: Yup.string().max(15, 'Sequence should not be more than 15 digits').required("Please enter Sequence"),
    conditions: Yup.string().required("Please enter Terms & Conditions"),
  });

  const {
    values,
    handleBlur,
    setFieldValue,
    handleChange,
    handleSubmit,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: addConditionsInitialValues,
    validationSchema: addPhaseSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values, action) => {
      const body = {
        sequenceNo: values?.sequenceNo,
        notetype: values?.notetype || noteTypeData,
        conditions: values?.conditions,
        status: editFlag ? EditMaster.status : "Active",
        CreatedBy: user?.UserName,
        createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS" || ""),
        ModifiedBy: user?.UserName,
        modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        id: editFlag ? EditMaster.id : 0,
        uid: "",
      };
      if (editFlag) {
        axios
          .post(
            `${process.env.REACT_APP_BASEURL}/api/TermsAndCondition/InsertUpdateTermsCondition`,
            body
          )
          .then((response: any) => {
            if (!response) {
              dispatch(fetchError("Term and Conditions not updated"));
              setOpen(false);
              action.resetForm();
              return;
            }
            if (response && response?.data?.status === true) {
              dispatch(showMessage("Term and Conditions updated successfully"));
              setOpen(false);
              //   showRightData(body);
              getAllData();
              action.resetForm();
              return;
            } else {
              dispatch(fetchError("Term and Conditions already exists"));
              setOpen(false);
              action.resetForm();
              return;
            }
          })
          .catch((e: any) => {
            setOpen(false);
            dispatch(fetchError("Error Occurred !"));
          });
      } else {
        axios
          .post(
            `${process.env.REACT_APP_BASEURL}/api/TermsAndCondition/InsertUpdateTermsCondition`,
            body
          )
          .then((response: any) => {
            if (!response) return;
            if (response && response.data) {
              dispatch({
                type: SHOW_MESSAGE,
                message: response?.data?.message + "!" || "",
              });
            }
            handleClose();
            getAllData();
            action.resetForm();
          })
          .catch((e: any) => {
            action.resetForm();
          });
      }
      setTimeout(()=>{
      editFlag ? setEditFlag(false) : setEditFlag(false);
    },1000);
    },
  });

  useEffect(() => {
    if (editFlag) {
      setFieldValue("notetype", EditMaster?.notetype);
      setFieldValue("sequenceNo", EditMaster?.sequenceNo);
      setFieldValue("conditions", EditMaster?.conditions);
    }
  }, [setEditMaster, editFlag]);

  console.log("setNoteTypeData",noteTypeData)
  let columnDefs = [
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
            <Tooltip title="Edit" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize">
                <TbPencil
                  onClick={() => {
                    setEditMaster(params?.data);
                    setEditFlag(true);
                    setOpen(true);
                  }}
                />
              </button>
            </Tooltip>
          </div>
        </>
      ),
      width: 120,
      minWidth: 120,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "notetype",
      headerName: "Type",
      headerTooltip: "Type",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 175,
      minWidth: 175,
    },
    {
      field: "sequenceNo",
      headerName: "Sequence",
      headerTooltip: "Sequence",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 120,
      minWidth: 120,
    },
    {
      field: "conditions",
      headerName: "Terms & Condition",
      headerTooltip: "Terms & Condition",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 700,
      minWidth: 700,
    },
    {
      field: "status",
      headerName: "Status",
      headerTooltip: "Status",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 90,
      minWidth: 90,
    },
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 120,
      minWidth: 120,
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      headerTooltip: "Created Date",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      cellRenderer: function (params) {
        var formattedDate = moment(params.value).format("DD/MM/YYYY");
        return formattedDate;
      },
      width: 120,
      minWidth: 120,
    },
    {
      field: "modifiedBy",
      headerName: "Modified By",
      headerTooltip: "Modified By",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 120,
      minWidth: 120,
    },
    {
      field: "modifiedDate",
      headerName: "Modified Date",
      headerTooltip: "Modified Date",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      cellRenderer: function (params) {
        var formattedDate = moment(params.value).format("DD/MM/YYYY");
        return formattedDate;
      },
      width: 120,
      minWidth: 120,
    },
  ];
  const handleClose = () => {
    setOpen(false);
    setTimeout(()=>{
      editFlag ? setEditFlag(false) : setEditFlag(false);
      setEditMaster({});
      resetForm();
    },100)
  };
  const handleOpen = () => {
    setOpen(true);
    if(noteTypeData.length > 0){
      setFieldValue("notetype",noteTypeData)
    }
  };

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  const onFilterTextChange = (value) => {
    gridApi?.setQuickFilter(value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"));
    }
  };
  const onQuickFilterChanged = (e) => {
    gridApi?.setQuickFilter(e?.target?.value);
    if (gridApi.getDisplayedRowCount() == 0) {
        dispatch(fetchError('Data not found!'));
    }
    // gridRef.current.api.setQuickFilter(
    //   document.getElementById('quickFilter').value
    // );
  };

  const getTitle = () => {
    if (editFlag) {
      return "Edit Term & Conditions Master Details";
    } else {
      return "Add Term & Conditions Master Details";
    }
  };

    const handleExportData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/TermsAndCondition/GetExcelReport`
      )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "TermAndConditionMaster.xlsx";
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
              showMessage("Term and condition Master Excel downloaded successfully!")
            );
          }
        }
      });
  };

  console.log("EditMaster", EditMaster, noteTypeDataById);
  return (
    <>
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <Box component="h2" className="page-title-heading mb-0">
          Term & Conditions Master
        </Box>
      </Grid>
      <div className="phase-outer">
        <Grid
          marginBottom="7px"
          container
          item
          spacing={5}
          justifyContent="start"
          alignSelf="center"
        >
          <Grid item xs={1} sx={{ position: "relative" }}>
            <h2 className="phaseLable">Type</h2>
          </Grid>

          <Grid item xs={5} sx={{ position: "relative" }}>
            <div className="input-form">
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                // sx={
                //   user?.role === "Vendor" && {
                //     backgroundColor: "#f3f3f3",
                //     borderRadius: "6px",
                //   }
                // }
                getOptionLabel={(option) => {
                  console.log("option", option);
                  return option?.toString() || "";
                }}
                // disabled={user?.role === "Vendor"}
                disableClearable
                options={noteTypeValue || []}
                placeholder="Type"
                onChange={(e, value: any) => {
                  console.log("e", e, value);
                  setNoteTypeData(value);
                  setFieldValue("notetype",value);
                  onFilterTextChange(value);
                  gridApi.deselectAll();
                }}
                value={noteTypeData || null}
                renderInput={(params) => (
                  <TextField
                    name="notetype"
                    id="notetype"
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
          {/* <Grid item xs={6.75} sx={{ position: "relative"  }}></Grid> */}
          {/* <Grid item xs={6} md={3} sx={{ position: "relative" }}></Grid> */}
          <Grid item xs={6}>
            <Grid container justifyContent="flex-end">
              <div className="rolem-grid" style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginRight: 5,
                  }}
                >
                  <TextField
                    size="small"
                    sx={{ marginRight: "10px" }}
                    variant="outlined"
                    name="search"
                    onChange={(e) => onFilterTextChange(e?.target?.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginRight: 5,
                  }}
                >
                  {(selectedInActiveRows.length > 0 ||
                    selectedPendingRows.length > 0) && (
                    <Button
                      size="small"
                      style={primaryButtonSm}
                      sx={{
                        color: "#fff",
                        fontSize: "12px",
                        justifyContent: "flex-end",
                        // marginLeft: 99,
                      }}
                      // onClick={() => handleStatusChange("Active")}
                      onClick={handleActive}
                    >
                      Active
                    </Button>
                  )}
                  {(selectedActiveRows.length > 0 ||
                    selectedPendingRows.length > 0) && (
                    <Button
                      size="small"
                      style={primaryButtonSm}
                      sx={{
                        color: "#fff",
                        fontSize: "12px",
                        justifyContent: "flex-end",
                      }}
                      // onClick={() => handleStatusChange("In Active")}
                      onClick={handleInactive}
                    >
                      In Active
                    </Button>
                  )}
                  <Button
                    size="small"
                    style={primaryButtonSm}
                    sx={{ color: "#fff", fontSize: "12px" }}
                    onClick={() => {
                      handleOpen();
                    }}
                  >
                    Add New
                  </Button>
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
                      onClick={() => { handleExportData(); }}
                      size="large"
                    >
                      <AiFillFileExcel />
                    </IconButton>
                  </AppTooltip>
                </div>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <Dialog
            open={open}
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
            maxWidth="lg"
          >
            <DialogTitle id="alert-dialog-title" className="title-model">
              {getTitle()}
            </DialogTitle>
            <DialogContent style={{ width: "300px" }}>
              <Grid
                container
                item
                display="flex"
                flexDirection="row"
                // spacing={2}
                justifyContent="start"
                alignSelf="center"
              >
                <Grid item xs={12} md={12} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Type</h2>

                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      // sx={
                      //   user?.role === "Vendor" && {
                      //     backgroundColor: "#f3f3f3",
                      //     borderRadius: "6px",
                      //   }
                      // }
                      getOptionLabel={(option) => {
                        console.log("option", option);
                        return option?.toString() || "";
                      }}
                      disabled={editFlag}
                      disableClearable
                      options={noteTypeValue || []}
                      placeholder="Type"
                      onChange={(e, value: any) => {
                        setFieldValue("notetype",value);
                        setNoteTypeData(value);
                        onFilterTextChange(value);
                        gridApi.deselectAll();
                      }}
                      onBlur={handleBlur}
                      value={values?.notetype}
                      renderInput={(params) => (
                        <TextField
                          name="notetype"
                          id="notetype"
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
                    {touched.notetype && errors.notetype && noteTypeData?.length===0 ? (<p className="form-error">{errors.notetype}</p>) : null }
                  </div>
                  {/* <p className="form-error">{pmError}</p> */}
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={12}
                  sx={{ position: "relative", marginBottom: "5%" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">Sequence</h2>
                    <TextField
                      // disabled
                      type="number"
                      variant="outlined"
                      size="small"
                      className="w-85"
                      name="sequenceNo"
                      id="sequenceNo"
                      //maxLength: {15} 
                      value={values?.sequenceNo}
                      onKeyPress={(e: any) => {
                        regExpressionTextField(e);
                      }}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(
                            fetchError("You can not paste Spacial characters")
                          );
                        }
                      }}
                      onKeyDown={(e:any)=>{
                        if(e.key =='e' || e.key == 'E'){
                          e.preventDefault();
                        }
                        if (e.which === 32 && !e.target.value.length)
                          e.preventDefault();
                      }}
                      onChange={(e:any)=>{if(e.target.value>=0) {handleChange(e)}}}
                      onBlur={handleBlur}
                    />
                    {touched.sequenceNo && errors.sequenceNo ? (<p className="form-error">{errors.sequenceNo}</p>) : null }
                  </div>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={12}
                  sx={{ position: "relative", marginBottom: "5%" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">Term & Conditions</h2>
                    <textarea
                      // disabled
                      // variant="outlined"
                      // size="small"
                      // className="w-85"
                      name="conditions"
                      id="conditions"
                      style={{ height: "150px" }}
                      className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                      // multiline
                      onKeyDown={(e: any) => {
                        console.log("e.code",e.code)
                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                            e.preventDefault();
                        }
                      }}
                      value={values?.conditions}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.conditions && errors.conditions ? (<p className="form-error">{errors.conditions}</p>) : null }
                  </div>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={12}
                  sx={{ position: "relative", marginBottom: "5%" }}
                >
                  <div className="row centerProj">
                    <Button
                      className="yes-btn"
                      onClick={() => handleSubmit()}
                      style={{
                        marginLeft: 10,
                        borderRadius: 6,
                      }}
                    >
                      {editFlag ? "Update" : "Submit"}
                    </Button>
                    <Button
                      className="no-btn"
                      onClick={handleClose}
                      style={{
                        marginLeft: 10,
                        borderRadius: 6,
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>
        </form>
      </div>

      <CommonGrid
        defaultColDef={{ flex: 1 }}
        columnDefs={columnDefs}
        rowData={conditionsData}
        onGridReady={onGridReady}
        gridRef={gridRef}
        pagination={true}
        paginationPageSize={10}
        onRowSelected={handleRowSelected}
        suppressRowClickSelection={true}
        rowSelection={"multiple"}
      />
    </>
  );
}
