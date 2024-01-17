import React, { useEffect, useState } from "react";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import {
  Stack,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { primaryButtonSm } from "shared/constants/CustomColor";
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import { TbPencil } from "react-icons/tb";
import axios from "axios";
import moment from "moment";
import { useFormik } from "formik";
import * as Yup from "yup";
import regExpressionTextField, {
  textFieldValidationOnPaste,
} from "@uikit/common/RegExpValidation/regForTextField";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch } from "react-redux";
import SearchIcon from '@mui/icons-material/Search';
import AppTooltip from "@uikit/core/AppTooltip";
import { AiFillFileExcel } from "react-icons/ai";

export default function StateMaster() {
  const [open, setOpen] = React.useState(false);
  const gridRef = React.useRef<AgGridReact>(null);
  const gridRef2 = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [gridApi2, setGridApi2] = React.useState<GridApi | null>(null);
  const [MasterName, setMasterName] = useState([]);
  const [RightMasterData, setRightMasterData] = useState([]);
  const [selectedLeftsideData, setSelectedLeftsideData] = useState<any>({});
  const [editFlag, setEditFlag] = useState(false);
  const [EditMaster, setEditMaster] = useState<any>({});
  const [generatedTierID, setGeneratedTierID] = useState("");
  const { user } = useAuthUser();
  const dispatch = useDispatch();
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedActiveRows, setSelectedActiveRows] = useState([]);
  const [selectedInActiveRows, setSelectedInActiveRows] = useState([]);
  const [selectedPendingRows, setSelectedPendingRows] = useState([]);
  const [flag, setFlag] = useState(false);

  const styling = {
    marginTop: "5px",
    marginBottom: "5px",
  };

  const handleClickOpen = () => {
    setOpen(true);
    // setFieldValue("masterName",selectedLeftsideData?.masterName);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(()=>{
      editFlag ? setEditFlag(false) : setEditFlag(false);
      resetForm();
    },300)
  };

  const regExpressionTextFieldOnlyText = (e, name = "") => {
    const reg = /^[a-zA-Z ]*$/; // Allow only letters (both uppercase and lowercase) and spaces
    const space = /^\S*$/;
    if (reg.test(e.key) === false) {
      // dispatch(fetchError("Number Not Allowed"))
      e.preventDefault();
    }
    if (space.test(e.key) === false && name === "utr") {
      e.preventDefault();
    }
  };
  
  const textFieldValidationOnPasteOnlyText = (e) => {
    const pastedData = (e.originalEvent || e).clipboardData.getData('text/plain');
    const reg = /^[a-zA-Z ]*$/; // Allow only letters (both uppercase and lowercase) and spaces
    if (!reg.test(pastedData)) {
      e.preventDefault();
      return false;
    } else {
      return true;
    }
  };

  const regExpressionTextFields = (e, name = '') => {
    var reg = /^[a-zA-Z ]*$/;
    var space = /^\S*$/;
    if (reg.test(e.key) === false) {
        e.preventDefault();
    }
    if (space.test(e.key) === false && name == 'utr') {
        e.preventDefault();
    }
};

  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }
  function onGridReady2(params) {
    gridRef2.current!.api.sizeColumnsToFit();
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
        setSelectedPendingRows(selectedData);
      } else if (selectedData.length > 0) {
        // User selected rows with different statuses, show error message and deselect all rows
        dispatch(fetchError("You can only select rows with the same status."));
        gridRef2.current.api.deselectAll();
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

  useEffect(() => {
    if (editFlag) {
      // setFieldValue("masterName", EditMaster?.masterName);
      setFieldValue("stateName", EditMaster?.stateName);
    }
  }, [setEditMaster, editFlag]);

  let columnDefs = [
    {
      field: "masterName",
      headerName: "Master Name",
      headerTooltip: "Master Name",

      sortable: true,
      resizable: true,
      width: 279,
      cellStyle: { fontSize: "13px" },
    },
  ];

  let columnDefs2 = [
    {
      // headerCheckboxSelection: true,
      // checkboxSelection: true,
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
      width: 110,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "stateName",
      headerName: "State Name",
      headerTooltip: "State Name",
      sortable: true,
      resizable: true,    
      width: 'flex', 
      cellStyle: { fontSize: "13px" },
    }, 
    {
      field: "status",
      headerName: "Status",
      headerTooltip: "Status",
      sortable: true,
      resizable: true,    
      width: 'flex', 
      cellStyle: { fontSize: "13px" },
    }, 
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",

      sortable: true,
      resizable: true,  
      width: 'flex',
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      headerTooltip: "Created Date",
      sortable: true,
      resizable: true,
      width: 'flex',
      cellRenderer: (e: any) => {
        return moment(e?.data?.createdDate).format("DD/MM/YYYY");
      },
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "modifiedBy",
      headerName: "Modified By",
      headerTooltip: "Modified By",
      sortable: true,
      resizable: true,  
      width: 'flex',  
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "modifiedDate",
      headerName: "Modified Date",
      headerTooltip: "Modified Date",
      sortable: true,
      resizable: true,
      width: 'flex',
      cellRenderer: (e: any) => {
        return moment(e?.data?.modifiedDate).format("DD/MM/YYYY");
      },
      cellStyle: { fontSize: "13px" },
    },
  ];

  const validateSchema = Yup.object({
    stateName: Yup.string().test('no-numbers', 'Numbers are not allowed', (value) => {
      return !/\d/.test(value);
    }).required("Please enter State Name"),
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
    initialValues: {
      // masterName: '',
      stateName: "",
    },
    validationSchema: validateSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values, action) => {
      const body = {
        id: editFlag ? EditMaster.id : 0,
        uid: "",
        // tierId: editFlag ? EditMaster.tierId : generatedTierID,
        //   masterName : values?.masterName,
        stateName: values?.stateName,
        status: editFlag ? EditMaster.status : "Active",
        createdBy: editFlag ? EditMaster.createdBy : user?.UserName,
        createdDate: editFlag ? EditMaster.createdDate : moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        modifiedBy: user?.UserName,
        modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      };

      if (editFlag) {
        axios
          .post(
            `${process.env.REACT_APP_BASEURL}/api/StateMaster/InsertUpdateStateMaster`,
            body
          )
          .then((response: any) => {
            if (!response) {
              dispatch(fetchError("State Name not updated"));
              setOpen(false);
              return;
            }
            if (
              response &&
              response?.data?.code === 200 &&
              response?.data?.status === true
            ) {
              dispatch(showMessage("State Name updated successfully"));
              setOpen(false);
              showRightData();
              return;
            } else {
              dispatch(fetchError("State Name already exists"));
              setOpen(false);
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
            `${process.env.REACT_APP_BASEURL}/api/StateMaster/InsertUpdateStateMaster`,
            body
          )
          .then((response: any) => {
            if (!response) {
              dispatch(fetchError("State Name not added"));
              setOpen(false);
              return;
            }
            if (
              response &&
              response?.data?.code === 200 &&
              response?.data?.status === true
            ) {
              dispatch(showMessage("State Name added successfully"));
              setOpen(false);
              showRightData();
              // getMyGenerateId();
              return;
            } else {
              dispatch(fetchError("State Name already exists"));
              setOpen(false);
              return;
            }
          })
          .catch((e: any) => {
            setOpen(false);
            dispatch(fetchError("Error Occurred !"));
          });
      }

      setTimeout(()=>{
        editFlag ? setEditFlag(false) : setEditFlag(false);
        action.resetForm();
      },350);
    },
  });

  const showRightData = async () => {
    //   setSelectedLeftsideData(data);
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/StateMaster/GetStateMasterList`
      )
      .then((response: any) => {
        setRightMasterData(response?.data || []);
        setSelectedRows([]);
        setSelectedActiveRows([]);
        setSelectedInActiveRows([]);
        // setSelectedPendingRows([])
      })
      .catch((e: any) => {});
  };

  useEffect(() => {
    showRightData();
  }, []);
  
  const getTitle = () => {
    if (editFlag) {
      return "Update State Name Details";
    } else {
      return "Add State Name Details";
    }
  };

  const handleExportData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/StateMaster/GetExcelReport`
      )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "StateMaster.xlsx";
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
              showMessage("State Master Excel downloaded successfully!")
            );
          }
        }
      });
  };

  return (
    <>
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <Box component="h2" className="page-title-heading mb-0">
        State Master
        </Box>
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
              {/* <TextField
            size="small"
            sx={{ marginRight: "10px" }}
            variant="outlined"
            name="search"
            onChange={(e) => onFilterTextChange(e)}
            InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <SearchIconBox />
                </InputAdornment>
                ),
            }}
            />      */}
              {/* {selectedRows.length > 0 ? (    */}
              <>
                {selectedInActiveRows.length > 0 ? (
                  <Button
                    size="small"
                    style={primaryButtonSm}
                    sx={{
                      color: "#fff",
                      fontSize: "12px",
                      justifyContent: "flex-end",
                    //   marginLeft: 99,
                    }}
                    // onClick={() => handleStatusChange("Active")}
                    // onClick={handleActive}
                  >
                    Active
                  </Button>
                ):null}
                {selectedActiveRows.length > 0 ? (
                  <Button
                    size="small"
                    style={primaryButtonSm}
                    sx={{
                      color: "#fff",
                      fontSize: "12px",
                      justifyContent: "flex-end",
                    }}
                    // onClick={() => handleStatusChange("In Active")}
                    // onClick={handleInactive}
                  >
                    In Active
                  </Button>
                ):null}
                <Button
                  size="small"
                  style={primaryButtonSm}
                  sx={{
                    color: "#fff",
                    fontSize: "12px",
                    justifyContent: "flex-end",
                  }}
                  onClick={handleClickOpen}
                >
                  Add New
                </Button>

              </>
              {/* ):(
                  <Button
                  size="small"
                  style={primaryButtonSm}
                  sx={{ color: "#fff", fontSize: "12px" }}
                  onClick={handleClickOpen}
                  >
                  Add New
                  </Button>
                )
              }                */}
              <Dialog
                open={open}
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                maxWidth="lg"
                PaperProps={{ style: { borderRadius: "20px" } }}
              >
                <form onSubmit={handleSubmit}>
                  <DialogTitle id="alert-dialog-title" className="title-model">
                    {getTitle()}
                    {/* {editFlag ? "Edit Tier Master Details" : "Add Tier Master Details"} */}
                  </DialogTitle>
                  <DialogContent style={{ width: "450px" }}>
                    {/* <h2 className="phaseLable required" style={styling}>Master Name</h2>
                    <TextField
                    //   disabled
                      id="masterName"
                      name="masterName"
                      variant="outlined"
                      size="small"
                      value={values?.masterName || ""}
                      onBlur={handleBlur}
                      onKeyDown={(e: any) => {
                        regExpressionTextField(e);
                      }}
                      onPaste={(e: any) => {
                        textFieldValidationOnPaste(e)
                      }}
                      onChange={handleChange}
                    /> */}

                    <h2 className="phaseLable required" style={styling}>
                    State Name
                    </h2>
                    <TextField
                      id="stateName"
                      name="stateName"
                      variant="outlined"
                      autoComplete="off"
                      size="small"
                      value={values?.stateName || ""}
                      onBlur={handleBlur}
                      onKeyDown={(e: any) => {
                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                            e.preventDefault();
                        }
                        regExpressionTextFields(e);
                      }}
                      onPaste={(e: any) => {
                        textFieldValidationOnPasteOnlyText(e);
                      }}
                      onChange={handleChange}
                    />
                    {touched.stateName && errors.stateName ? (
                      <p className="form-error">{errors.stateName}</p>
                    ) : null}
                  </DialogContent>
                  <DialogActions className="button-wrap">
                    <Button className="yes-btn" type="submit">
                      {editFlag ? "Update" : "Submit"}
                    </Button>
                    <Button className="no-btn" onClick={handleClose}>
                      Cancel
                    </Button>
                  </DialogActions>
                </form>
              </Dialog>
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
        {/* <Grid item xs={6} md={3} sx={{ position: "relative" }}>
            <div style={{ height: "calc(100vh - 200px)", marginTop: "5px" }}>
                <CommonGrid
                defaultColDef={null}
                columnDefs={columnDefs}
                rowData={MasterName}
                onGridReady={onGridReady}
                gridRef={gridRef}
                pagination={false}
                paginationPageSize={null}
                onRowClicked={(e) => showRightData(e?.data)}
                rowSelection="single"
                />
            </div>
            </Grid>
            <Grid item xs={6} md={9} sx={{ position: "relative" }}> */}
        <div
          style={{
            height: "calc(100vh - 200px)",
            marginLeft: "10px",
            marginTop: "5px",
            minWidth: "",
            width: "100%",
          }}
        >
          <CommonGrid
            defaultColDef={{flex : 1}}
            columnDefs={columnDefs2}
            rowData={RightMasterData}
            onGridReady={onGridReady2}
            gridRef={gridRef2}
            pagination={true}
            paginationPageSize={10}
            onRowSelected={handleRowSelected}
            suppressRowClickSelection={true}
            rowSelection={"multiple"}
          />
        </div>
        {/* </Grid> */}
      </Grid>
    </>
  );
}
