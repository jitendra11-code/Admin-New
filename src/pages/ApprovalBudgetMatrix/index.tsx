import React, { useState, useEffect } from "react";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import Box from "@mui/material/Box";
import { Checkbox, DialogTitle, FormControlLabel, Grid, Stack, Typography, Tooltip, Autocomplete, MenuItem, Select, InputAdornment, IconButton, alpha } from "@mui/material";
import Button from "@mui/material/Button";
import { primaryButtonSm } from "shared/constants/CustomColor";
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { TbPencil } from "react-icons/tb";
import { fetchError, showMessage } from "redux/actions";
import axios from "axios";
import { useFormik } from "formik";
import { addUserSchema } from "@uikit/schemas";
import * as Yup from "yup";
import moment from "moment";
import { useAuthUser } from '@uikit/utility/AuthHooks';
import { useDispatch } from "react-redux";
import SearchIcon from "@mui/icons-material/Search";
import regExpressionTextField, {
  textFieldValidationOnPaste, regExpressionRemark
} from "@uikit/common/RegExpValidation/regForTextField";
import { AiFillFileExcel } from "react-icons/ai";
import AppTooltip from "@uikit/core/AppTooltip";

export default function ApprovalBudgetMatrix() {
  const [BranchData, setBranchData] = useState([]);
  const [dropBranchData, setDropBranchData] = useState([]);
  const [editBranchData, setEditBranchData] = useState<any>({});
  const [editFlag, setEditFlag] = useState(false);
  const [open, setOpen] = React.useState(false);
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const { user } = useAuthUser();
  const dispatch = useDispatch();

  const styling = {
    marginTop: "5px",
    marginBottom: "5px",
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    editFlag ? setEditFlag(false) : setEditFlag(false);
    resetForm();
  };

  const getAllBranch = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/PhaseBudgetMatrix/GetAllPhaseBudgetMatrix`)
      .then((response: any) => {
        setBranchData(response?.data || []);
      })
      .catch((e: any) => { });
  };

  useEffect(() => {
    getAllBranch();
  }, []);

  const getDropBranch = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/PhaseBudgetMatrix/GetBranchTypeList`)
      .then((response: any) => {
        setDropBranchData(response?.data || []);
      })
      .catch((e: any) => { });
  }
  useEffect(() => {
    getDropBranch();
  }, []);

  useEffect(() => {
    if (editFlag) {
      setFieldValue("category", editBranchData?.branch);
      setFieldValue("minsqft", editBranchData?.minsqf);
      setFieldValue("maxsqft", editBranchData?.maxsqf);
      setFieldValue("ratesqft", editBranchData?.ratepersq);
      setFieldValue("budget", editBranchData?.budget);
    }
  }, [setEditBranchData, editFlag]);


  let columnDefs = [
    {
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
            <Tooltip title="Edit Budget" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize" >
                <TbPencil onClick={() => { setEditBranchData(params?.data); setEditFlag(true); setOpen(true); }} />
              </button>
            </Tooltip>
          </div>
        </>
      ),
      width: 80,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "branch",
      headerName: "Category",
      headerTooltip: "Category",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "minsqf",
      headerName: "Min Sqft",
      headerTooltip: "Min Sqft",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "maxsqf",
      headerName: "Max Sqft",
      headerTooltip: "Max Sqft",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "ratepersq",
      headerName: "Rate per Sqft",
      headerTooltip: "Rate per Sqft",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "budget",
      headerName: "Budget",
      headerTooltip: "Budget",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },

  ]

  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }


  const validateSchema = Yup.object({
    category: Yup.string().required("Please enter Category"),
    minsqft: Yup.string().required("Please enter Min Sqft"),
    maxsqft: Yup.string().required("Please enter Max Sqft"),
    ratesqft: Yup.string().required("Please enter Rate/Sqft"),

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
      category: '',
      minsqft: '',
      maxsqft: '',
      ratesqft: '',
      budget: '',
    },
    validationSchema: validateSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values, action) => {
      const body = {
        branch: values?.category,
        budget: values?.budget,
        maxsqf: values?.maxsqft,
        minsqf: values?.minsqft,
        ratepersq: values?.ratesqft,
        status: "Active",
        createdBy: user?.UserName,
        createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        modifiedBy: user?.UserName,
      };
      if (editFlag) {
        axios
          .post(`${process.env.REACT_APP_BASEURL}/api/PhaseBudgetMatrix/InsertOrUpdatePhaseBudgetMatrix`, body)
          .then((response: any) => {
            if (!response) {
              dispatch(fetchError("Category not updated"));
              setOpen(false);
              return;
            };
            if (response && response?.data?.code === 200 && response?.data?.status === true) {
              dispatch(showMessage("Category updated successfully"));
              setOpen(false);
              getAllBranch();
              return;
            } else {
              dispatch(fetchError("Category not updated"));
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
          .get(`${process.env.REACT_APP_BASEURL}/api/PhaseBudgetMatrix/GetPhaseBudgetMatrixByBranch?branch=${values?.category}`)
          .then((response: any) => {
            if (!response) {
              dispatch(fetchError("Category not added"));
              setOpen(false);
              return;
            };
            if (response?.data?.length > 0) {
              dispatch(fetchError("Category already exists"));
              setOpen(false);
              return;
            } else {
              axios
                .post(`${process.env.REACT_APP_BASEURL}/api/PhaseBudgetMatrix/InsertOrUpdatePhaseBudgetMatrix`, body)
                .then((response: any) => {
                  if (!response) {
                    dispatch(fetchError("Category not added"));
                    setOpen(false);
                    return;
                  };
                  if (response && response?.data?.code === 200 && response?.data?.status === true) {
                    dispatch(showMessage("Category added successfully"));
                    setOpen(false);
                    getAllBranch();
                    return;
                  } else {
                    dispatch(fetchError("Category not added"));
                    setOpen(false);
                    return;
                  }
                })
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
    },1000);
    },
  });

  const calculateBudget = () => {
    if (values?.maxsqft && values?.ratesqft) {
      var _maxsqft = values?.maxsqft;
      var _ratesqft = values?.ratesqft;
      var _budget = Number(_maxsqft) * Number(_ratesqft);
      setFieldValue('budget', _budget);
      setEditBranchData({ ...editBranchData, ["budget"]: _budget });
    }
  }

  const getTitle = () => {
    if (editFlag) {
      return 'Edit Budget';
    } else {
      return 'Add Budget';
    }
  }

  const onFilterTextChange = (e) => {
    gridApi?.setQuickFilter(e?.target?.value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"))
    }
  };

  const handleExportData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PhaseBudgetMatrix/ExcelDownloadForBudgetMatrix`
      )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "PhaseBudgetMatrix.xlsx";
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
              showMessage("Phase Budget Matrix downloaded successfully!")
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
          marginBottom: "10px",
        }}
      >
        <Box component="h2" className="page-title-heading mb-0">
          Budget Matrix
        </Box>
        <div className="phase-grid">
          <Stack
            display="flex"
            alignItems="flex-end"
            justifyContent="space-between"
            flexDirection="row"
            sx={{ mb: -2, marginBottom: "2px" }}
          >
            <TextField
              size="small"
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
            <Button
              id="add"
              size="small"
              style={primaryButtonSm}
              sx={{ color: "#fff", fontSize: "12px", }}
              onClick={handleClickOpen}
            >
              Add Budget
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
            <Dialog open={open} onClose={handleClose} aria-describedby="alert-dialog-slide-description" maxWidth="lg" PaperProps={{ style: { borderRadius: '20px', }, }}>
              <form onSubmit={handleSubmit}>
                <DialogTitle id="alert-dialog-title" className="title-model">
                  {getTitle()}
                </DialogTitle>
                <DialogContent style={{ width: "450px" }}>
                  <h2 className="phaseLable required" style={styling}>Category</h2>
                  <Autocomplete
                    disablePortal
                    sx={{
                      //backgroundColor: "#f3f3f3",
                      borderRadius: "6px",
                    }}
                    id="combo-box-demo"
                    getOptionLabel={(option) =>
                      option?.toString() || ""
                    }
                    disableClearable={true}
                    disabled={editFlag}
                    options={dropBranchData}
                    onChange={(e, value) => {
                      setFieldValue("category", value);
                    }}
                    placeholder="Category"
                    value={values?.category}
                    renderInput={(params) => (
                      <TextField
                        name="category"
                        id="category"
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          style: { height: `35 !important` },
                        }}
                        variant="outlined"
                        size="small"
                        onBlur={handleBlur}
                      />
                    )}
                  />
                  {touched.category && errors.category ? (<p className="form-error">{errors.category}</p>) : null}

                  <h2 className="phaseLable required" style={styling}>Min Sqft</h2>
                  <TextField
                    id="minsqft"
                    name="minsqft"
                    variant="outlined"
                    type="number"
                    size="small"
                    value={values?.minsqft || ""}
                    onBlur={handleBlur}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e);
                    }}
                    onPaste={(e: any) => {
                      textFieldValidationOnPaste(e)
                    }}
                    onChange={handleChange}
                  />
                  {touched.minsqft && errors.minsqft ? (<p className="form-error">{errors.minsqft}</p>) : null}


                  <h2 className="phaseLable required" style={styling}>Max Sqft</h2>
                  <TextField
                    id="maxsqft"
                    name="maxsqft"
                    variant="outlined"
                    type="number"
                    size="small"
                    value={values?.maxsqft || ""}
                    onBlur={(e: any) => {
                      handleBlur(e);
                      calculateBudget();
                    }}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e);
                    }}
                    onPaste={(e: any) => {
                      textFieldValidationOnPaste(e)
                    }}
                    onChange={handleChange}
                  />
                  {(values.maxsqft && values.minsqft) && (values.maxsqft < values.minsqft) ? (<p className="form-error">Please enter value greater than Minsqft</p>) : (touched.maxsqft && errors.maxsqft ? (<p className="form-error">{errors.maxsqft}</p>) : null)}

                  <h2 className="phaseLable required" style={styling}>Rate/Sqft</h2>
                  <TextField
                    id="ratesqft"
                    name="ratesqft"
                    variant="outlined"
                    type="number"
                    size="small"
                    value={values?.ratesqft || ""}
                    onBlur={(e: any) => {
                      handleBlur(e);
                      calculateBudget();
                    }}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e);
                    }}
                    onPaste={(e: any) => {
                      textFieldValidationOnPaste(e)
                    }}
                    onChange={handleChange}
                  />
                  {touched.ratesqft && errors.ratesqft ? (<p className="form-error">{errors.ratesqft}</p>) : null}

                  <h2 className="phaseLable" style={styling}>Budget</h2>
                  <TextField
                    id="budget"
                    name="budget"
                    variant="outlined"
                    type="any"
                    size="small"
                    disabled
                    value={(+values?.maxsqft) * (+values?.ratesqft) || ""}
                  />
                </DialogContent>
                <DialogActions className="button-wrap">
                  <Button className="yes-btn" type="submit">{editFlag ? 'Update' : 'Submit'}</Button>
                  <Button className="no-btn" onClick={handleClose}>Cancel</Button>
                </DialogActions>
              </form>
            </Dialog>
          </Stack>
        </div>
      </Grid>

      <CommonGrid
        defaultColDef={{ flex: 1 }}
        columnDefs={columnDefs}
        rowData={BranchData}
        onGridReady={onGridReady}
        gridRef={gridRef}
        pagination={false}
        paginationPageSize={null}
      />
    </>
  )
}