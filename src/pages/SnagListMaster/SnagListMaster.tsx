import {
  Grid,
  Button,
  TextField,
  Autocomplete,
  Stack,
  Box,
  InputAdornment,
  IconButton
} from "@mui/material";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import SearchIcon from "@mui/icons-material/Search";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import React, { memo, useCallback, useEffect, useState } from "react";
import { useUrlSearchParams } from "use-url-search-params";
import { fetchError, fetchSuccess, showMessage } from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { useAuthUser } from "@uikit/utility/AuthHooks";
// import { useNavigate, useParams } from "react-router-dom";
// import { AppState } from "redux/store";
import { DialogActions, Tooltip, DialogContent } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { TbPencil } from "react-icons/tb";
import { primaryButtonSm } from "shared/constants/CustomColor";
import regExpressionTextField, {
  textFieldValidationOnPaste,
  regExpressionRemark,
} from "@uikit/common/RegExpValidation/regForTextField";
import { AiFillFileExcel } from "react-icons/ai";
import AppTooltip from "@uikit/core/AppTooltip";


const SnagListMaster = () => {
  const [snagListMaster, setSnagListMaster] = React.useState<any>([]);
  const [sectionMasterList, setSectionMasterList] = React.useState([]);
  const [selectedColumn, setSelectedColumn] = useState([]);
  const [value1, setValue1] = useState<any>({});
  const [selectedObj, setSelectedObj] = React.useState<any>();
  const [error, setError] = useState(null);
  // const navigate = useNavigate();
  // const [mandateId, setMandateId] = React.useState(null);
  const [params] = useUrlSearchParams({}, {});
  const dispatch = useDispatch();
  const fileInput = React.useRef(null);
  const { user } = useAuthUser();
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction ?.action || "";
  const [open, setOpen] = React.useState(false);
  const [editButton, setEditButton] = useState(false);
  // const { id } = useParams();
  
  let columnList = ["Sr", "Observation", "Qty", "Reading", "Status", "Impact", "Vendor", "Category"];

  let columnDefsForm = [
    {
      field: "",
      headerName: "Action",
      headerTooltip: "Action",
      resizable: false,
      width: 100,
      minWidth: 100,
      pinned: "left",
      cellRenderer: (e: any) => (
        <>
          <div className="actions">
            <Tooltip title="Edit" className="actionsIcons">
              <button type="button" className="actionsIcons actionsIconsSize">
                <TbPencil
                  onClick={() => {
                    console.log("e ?.data", e ?.data);

                    let sectionObj =
                      sectionMasterList &&
                        sectionMasterList ?.find(
                          (item) => item ?.listName === e ?.data ?.section
                      );

                    let columnNamesList = e ?.data ?.columnNames.split(",")

                      setValue1({
                      section: sectionObj,
                      snagList: e ?.data ?.snagList,
                    });

                    setSelectedColumn(columnNamesList)
                    setSelectedObj(e ?.data);
                    handleOpen();
                    setEditButton(true);
                  }}
                />
              </button>
            </Tooltip>
          </div>
        </>
      ),
    },
    {
      field: "section",
      headerName: "Section",
      headerTooltip: "Section",
      sortable: true,
      resizable: true,
      width: 300,
      minWidth: 300,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "snagList",
      headerName: "Snag List",
      headerTooltip: "Snag List",
      sortable: true,
      resizable: true,
      width: 350,
      minWidth: 380,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "columnNames",
      headerName: "Column Names",
      headerTooltip: "Column Names",
      sortable: true,
      resizable: true,
      width: 420,
      minWidth: 420,
      cellStyle: { fontSize: "13px" },
    },

  ];

  const getSnagListMasterList = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/SnagListMaster/GetSnagListMasterList`)
      .then((response: any) => {
        setSnagListMaster(response ?.data || [])
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  const getSectionMasterList = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/ITAsset/GetITAssets?Type=Quality Audit Sections&partnerCategory=All`)
      .then((response: any) => {
        setSectionMasterList(response ?.data || []);
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occured !!!"));
      });
  }

  useEffect(() => {
    getSectionMasterList()
    getSnagListMasterList()
  }, [])

  const handleClose = () => {
    setOpen(false);
    setTimeout(()=>{
      setEditButton(false);
      emptyForm();
      setError({});
    },100)
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleAddNew = () => {
    const count = _validationDiaglogBox();
    if (count > 0) return;
    if (editButton == true) {
      let obj = {
        "id": selectedObj ?.id || 0,
        "section": value1 ?.section ?.listName,
        "snagList": value1 ?.snagList,
        "columnNames": selectedColumn.toString(),
        "status": null,
        "createdBy": null,
        "createdDate": null,
        "modifiedBy": null,
        "modifiedDate": null,
        "uid": "1"
      }
      
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/SnagListMaster/InsertUpdateSnagListMaster`,
          obj
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Error Occured !!!"));
            setOpen(false);
            return;
          }
          if (response) {
            dispatch(showMessage("Data Updated Successfully"));
            setOpen(false);
            getSnagListMasterList();
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occured !!!"));
          setOpen(false);
        });
    } else {
      let obj = {
        "section": value1 ?.section ?.listName,
        "snagList": value1 ?.snagList,
        "columnNames": selectedColumn.toString(),
        "status": null,
        "createdBy": null,
        "createdDate": null,
        "modifiedBy": null,
        "modifiedDate": null,
        "id": 0,
        "uid": "1"
      }
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/SnagListMaster/InsertUpdateSnagListMaster`,
          obj
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Error Occured !!!"));
            setOpen(false);
            return;
          }
          if (response) {
            dispatch(showMessage("Data Inserted Successfully"));
            setOpen(false);
            getSnagListMasterList();
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occured !!!"));
          setOpen(false);
        });
    }

    setTimeout(()=>{
      emptyForm();
      handleClose();
    },300);

  }

  const emptyForm = () => {
    setValue1({
      ...value1,
      ["section"]: "",
      ["snagList"]: ""
    });
    setSelectedColumn([]);

  }

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  const onFilterTextChange = (e) => {
    gridApi ?.setQuickFilter(e ?.target ?.value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"))
    }
  };

  const _validationDiaglogBox = () => {
    let temp = {};
    let no = 0;

    if
    (value1.section === undefined ||
    value1.section === "" ||
      value1.section === null) {
      no++;
      temp = { ...temp, section: "Please select Section" };
    }

    if
    (value1.snagList === undefined ||
    value1.snagList === "" ||
      value1.snagList === null) {
      no++;
      temp = { ...temp, snagList: "Please enter Snag List" };
    }

    if
    (selectedColumn.length === 0) {
      no++;
      temp = { ...temp, selectedColumn: "Please select Column Name" };
    }

    setError({ ...error, ...temp });
    return no;
  };

  const handleExportData = () => {
    axios
    .get(
      `${process.env.REACT_APP_BASEURL}/api/SnagListMaster/GetExcelReport`
    )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "SnagListMaster.xlsx";
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

            // Fixes "webkit blob resource error 1"
            setTimeout(function () {
              document.body.removeChild(tempLink);
              window.URL.revokeObjectURL(blobURL);
            }, 200);

            dispatch(
              showMessage("Snag List Master data downloaded successfully!")
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
          marginBottom: "15px",
        }}
      >
        <Box component="h2" className="page-title-heading mb-0">
          Snag List Master
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
              // label='Search'
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
              onClick={handleOpen}
              size="small"
              sx={{ color: "#fff", fontSize: "12px" }}
              style={primaryButtonSm}
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
                onClick={() => {handleExportData();}}
                size="large"
              >
                <AiFillFileExcel />
              </IconButton>
            </AppTooltip>
          </Stack>
        </div>
      </Grid>
      {/* <div style={{ height: "calc(100vh - 150px)", marginTop: "10px", overflow: "hidden" }}> */}
        <CommonGrid
          defaultColDef={{flex : 1}}
          columnDefs={columnDefsForm}
          rowData={snagListMaster || []}
          onGridReady={onGridReady}
          gridRef={gridRef}
          pagination={true}
          paginationPageSize={10}
        />
      {/* </div> */}
      <Dialog
         open={open}
        //  onClose={handleClose}
        //  aria-labelledby="alert-dialog-title"
         aria-describedby="alert-dialog-description"
         maxWidth="xl"
         PaperProps={{ style: { borderRadius: '20px' } }}
      >
        <DialogTitle id="alert-dialog-title" className="title-model">
        {editButton ? "Edit" : "Add"} Snag List Master
        </DialogTitle>
        {/* <div style={{ height: "calc(100vh - 320px)", width: "550px", margin: "0px 20px 0px" }}> */}
        <DialogContent style={{ width: "450px" }}>
          <form>
            <div className="phase-outer" style={{ paddingLeft: "10px" }} >
              <Grid
                marginBottom="10px"
                marginTop="5px"
                container
                item
                spacing={5}
                justifyContent="start"
                alignSelf="center"
                sx={{ paddingTop: "0px!important" }}
              >
                <Grid item xs={12} md={12} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Section</h2>
                    <Autocomplete
                      disablePortal
                      disableClearable={true}
                      options={sectionMasterList || []}
                      getOptionLabel={(option) => {
                        return option ?.listName ?.toString() || "";
                      }}
                      defaultValue={value1 ?.section || ""}
                      value={value1 ?.section || ""}
                      onChange={(e, v) => {
                        setValue1({ ...value1, ["section"]: v });
                        setError({ ...error, section: "" });
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
                  </div>
                  {error ?.section && error ?.section ? (
                    <p className="form-error">{error ?.section}</p>
                  ) : null}
                </Grid>

                <Grid item xs={12} md={12} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Snag List</h2>
                    <textarea
                      name="snagList"
                      id="snagList"
                      // variant="outlined"
                      // multiline
                      className="w-85 textAreaVertical"
                      style={{ padding: "10px", height: "100px" }}
                      onChange={(e) => {
                        setValue1({ ...value1, ["snagList"]: e.target.value });
                        setError({ ...error, snagList: "" });
                      }}
                      value={value1 ?.snagList}
                      onKeyDown={(e: any) => {
                        if (
                          e.target.selectionStart === 0 &&
                          e.code === "Space"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onKeyPress={(e: any) => {
                        regExpressionRemark(e);
                      }}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                    />
                  </div>
                  {error ?.snagList && error ?.snagList ? (
                    <p className="form-error">{error ?.snagList}</p>
                  ) : null}
                </Grid>

                <Grid item xs={12} md={12} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Column Name</h2>
                    <Autocomplete
                      multiple
                      limitTags={2}
                      disablePortal={false}
                      disableClearable
                      id="combo-box-demo"
                      getOptionLabel={(option) => {
                        return option ?.toString() || "";
                      }}
                      options={columnList || []}
                      onChange={(e, value: any) => {
                        {
                          setSelectedColumn(value);
                          setError({ ...error, selectedColumn: "" });
                        }
                      }}
                      value={selectedColumn || []}
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
                  </div>
                  {error ?.selectedColumn && error ?.selectedColumn ? (
                    <p className="form-error">{error ?.selectedColumn}</p>
                  ) : null}
                </Grid>

              </Grid>
            </div>
          </form>
          </DialogContent>
        {/* </div> */}
        <DialogActions className="button-wrap">
          <Button className="yes-btn" onClick={handleAddNew}>
            {editButton ? "Update" : "Submit"}
          </Button>
          <Button className="yes-btn" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SnagListMaster;
