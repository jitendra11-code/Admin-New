import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import Box from "@mui/material/Box";
import { Autocomplete, FormHelperText, IconButton, List, ListItem, ListItemText, Radio, RadioGroup, ToggleButton, ToggleButtonGroup, alpha } from "@mui/material";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import {
  Checkbox,
  DialogTitle,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import Button from "@mui/material/Button";
import { primaryButtonSm } from "shared/constants/CustomColor";
import TextField from "@mui/material/TextField";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem from "@mui/lab/TreeItem";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchError, showMessage } from "redux/actions";
import regExpressionTextField, {
  textFieldValidationOnPaste,
} from "@uikit/common/RegExpValidation/regForTextField";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { TbPencil } from "react-icons/tb";
import { Label } from "@mui/icons-material";
import AppTooltip from "@uikit/core/AppTooltip";
import { AiFillFileExcel } from "react-icons/ai";

export default function LocationApprovalMatrix() {
  const { user } = useAuthUser();
  const gridRef = React.useRef<AgGridReact>(null);
  const gridRef2 = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [gridApi2, setGridApi2] = React.useState<GridApi | null>(null);
  const [roleName, setRoleName] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [openMatrix, setOpenMatrix] = React.useState(false);
  const [userList, setUserList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedRole, setSelectedRole] = useState({});
  const [roleListMatrix, setRoleListMatrix] = useState([]);
  const [LeftSideData, setLeftSideData] = useState([]);
  const [RighttSideData, setRighttSideData] = useState([]);
  const [selectedLeftsideData, setSelectedLeftsideData] = useState<any>({})
  const [minValueMatrix,setMinValueMatrix]= useState(null);
  const [maxValueMatrix,setMaxValueMatrix] = useState(null);
  const [sequenceMatrix,setSequenceMatrix] = useState(null);
  const [userListMatrix, setUserListMatrix] = useState([]);
  const [selectedUserMatrix, setSelectedUserMatrix] = useState([]);
  const [selectedRoleMatrix, setSelectedRoleMatrix] = useState(null);
  const [matrixStatus,setMatrixStatus] = useState("");
  const insertRef = useRef(false);
  const [minValueError, setMinValueError] = useState(false);
  const [maxValueError, setMaxValueError] = useState(false);
  const [sequenceError, setSequenceError] = useState(false);
  const [matrixStatusError, setMatrixStatusError] = useState(false);
  const [selectedRoleMatrixError, setSelectedRoleMatrixError] = useState(false);
  const [selectedUserMatrixError, setSelectedUserMatrixError] = useState(false);
  const [selectedUserAddError, setSelectedUserAddError] = useState(false);

  const [radioButton, setRadioButton] = useState<any>("Budgeted")
  const handleRadioChange = (event) => {
    setRadioButton(event.target.value);
  };

  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }
  function onGridReady2(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);

  }

  useEffect(() => {
    if (gridRef.current && gridRef.current!.api) {
      gridRef.current.api.forEachNode((node, index) => {
        if (index === 0) {
          node.setSelected(true);
        }
      });
    }
  }, [LeftSideData]);


  const getLeftSideData = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/GetPhaseApprovalNoteMatrix?queryType=Location Note`)
      .then((response: any) => {
        setLeftSideData(response?.data || []);
        showRightData(response?.data?.[0] || {})
      })
      .catch((e: any) => { });
  };

  useEffect(() => {
    getLeftSideData()
  }, [radioButton])

  const showRightData = async (data: any) => {
    setSelectedLeftsideData(data)
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/GetUsersAccordingMatrix?queryType=Location Note&isBudgeted=${radioButton == "Budgeted" ? true : false}&MinValue=${data?.minValue}&MaxValue=${data?.maxValue}&sequence=${data?.sequence}&RoleName=${data?.roleName}`)
      .then((response: any) => {
        setRighttSideData(response?.data || []);
      })
      .catch((e: any) => { });
  }

  const handleKeyPress = (event) => {
    if (event.key === '-' || event.key === '+' || event.key === "e" || event.key === "ArrowDown" || event.key === "ArrowUp" ) {
        event.preventDefault();
    }
};
  const onAddUser = async () => {
    let formIsValid = true;

    if (!selectedRole) {
        setSelectedRoleMatrixError(true);
        formIsValid = false;
    }

    if (selectedUser.length === 0) {
        setSelectedUserAddError(true);
        formIsValid = false;
    }

    if (!formIsValid) {
        return;
    }
    let body = selectedUser?.map((item)=> {
      return {
      id: 0,
      uid: "string",
      minvalue: selectedLeftsideData?.minValue || 0,
      maxvalue: selectedLeftsideData?.maxValue || 0,
      sequence: selectedLeftsideData?.sequence || 0,
      roleName: selectedLeftsideData?.roleName || "",
      apiType: "Add New User",
      userId: item?.id || 0,
      isBudgeted: true,
      status: selectedLeftsideData?.status || "",
      userStatus:"Active",
      createdBy: user?.UserName,
      createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      modifiedBy: user?.UserName,
      modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
    }
  });
    await axios
      .post(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/InsertUsersInLocationMatrix`, body)
      .then((response: any) => {
        setOpen(false)
        showRightData(selectedLeftsideData)
        setSelectedRole({})
        setSelectedUser([])
        dispatch(showMessage("User added successfully"))
      })
      .catch((e: any) => { });
  }

  console.log("selectedRoleMatrix?.role_Name",selectedRoleMatrix?.role_Name)
  const onAddMatrix = async() => {
    let formIsValid = true;
    if (minValueMatrix === null || minValueMatrix === '') {
      setMinValueError(true);
      formIsValid = false;
    }
    if (maxValueMatrix === null || maxValueMatrix === '') {
        setMaxValueError(true);
        formIsValid = false;
    }
    if (sequenceMatrix === null || sequenceMatrix === '') {
      setSequenceError(true);
      formIsValid = false;
    }
    if (matrixStatus === '') {
        setMatrixStatusError(true);
        formIsValid = false;
    }
    if (!selectedRoleMatrix) {
        setSelectedRoleMatrixError(true);
        formIsValid = false;
    }
    if (selectedUserMatrix.length === 0) {
        setSelectedUserMatrixError(true);
        formIsValid = false;
    }

    if (!formIsValid) {
        return;
    }
    if (parseInt(minValueMatrix) >= parseInt(maxValueMatrix)) {
      dispatch(fetchError("Max Value should be greater than Min Value"));
      return;
    }
    else{
      console.log('LEFT', LeftSideData, minValueMatrix);
      let flag = false;
      if (minValueMatrix === null || maxValueMatrix === null) return;
      const arr = [...LeftSideData];
      console.log("arrr",arr)
      arr?.map((item) => {
        // if (item?.roleName === selectedRoleMatrix?.role_Name && ((minValueMatrix >= item?.minValue && minValueMatrix <= item?.maxValue) || (maxValueMatrix >= item?.minValue && maxValueMatrix <= item?.maxValue))) {
          if ( ((minValueMatrix > item?.minValue && minValueMatrix < item?.maxValue) || (maxValueMatrix > item?.minValue && maxValueMatrix < item?.maxValue))) {
            flag = true;
            dispatch(fetchError('Range should not lie in existing ranges'));
            return;

          }
          const arryRole = item?.roleName.split(',');
          console.log('arryRole',arryRole,arryRole?.includes(selectedRoleMatrix?.role_Name))
            if (((minValueMatrix >= item?.minValue && minValueMatrix <= item?.maxValue) || (maxValueMatrix >= item?.minValue && maxValueMatrix <= item?.maxValue)) 
             && arryRole?.includes(selectedRoleMatrix?.role_Name) === true)
            {
              flag = true;
              dispatch(fetchError('Role Name already exit in this range!!')); 
              return;
            }
      });
      if (flag) return;
      const body = selectedUserMatrix.map((item) => { 
      return {
        id: 0,
        uid: "uid",
        minvalue: minValueMatrix || 0,
        maxvalue: maxValueMatrix || 0 ,
        sequence: sequenceMatrix || 0 ,
        roleName: selectedRoleMatrix?.role_Name || "" ,
        apiType: "Add New Matrix",
        userId: item?.id || 0,
        status: matrixStatus || "",
        userStatus:"Active",
        isBudgeted: true,
        createdBy: user?.UserName,
        createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        modifiedBy: user?.UserName,
        modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        }
      });
      await axios
      .post(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/InsertUsersInLocationMatrix`, body)
      .then((response: any) => {
        console.log('res123',response)
        // if (response && response?.data?.code === 400 && response?.data?.status === false) {
        //   dispatch(fetchError(response?.data?.message));
        //   insertRef.current = true; 
        //   setUserListMatrix([])
        // }
        if (response && response?.data?.code === 200 && response?.data?.status === true) {
          dispatch(showMessage("Matrix added successfully!!"))
          insertRef.current = true; 
          setUserListMatrix([])
        }
        setOpenMatrix(false);
        // showRightData(selectedLeftsideData)
        setSelectedRoleMatrix({});
        setSelectedUserMatrix([])
        setMinValueMatrix(null);
        setMaxValueMatrix(null);
        setSequenceMatrix(null);
        setMatrixStatus("");
        getLeftSideData()
        })
      .catch((e: any) => {});
    }
  }

  let columnDefs2 = [
    {
      field: "userStatus",
      headerName: "User Status(Active=?)",
      headerTooltip: "User Status(Active=?)",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 120,
      cellStyle: { fontSize: "13px" },
      // cellRendererFramework : {StatusRenderer},
      cellRenderer: (params: any) => (
        <>
          <div className="toggle-div">
           <ToggleButtonGroup
            color="primary"
            value={RighttSideData[params?.rowIndex]?.userStatus || RighttSideData[0]?.userStatus}
            exclusive
            onChange={(e,value)=> { RighttSideData[params?.rowIndex].userStatus = value;
              axios
              .post(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/UpdateUserStatusInLocationMatrix?id=${params?.data?.id}&status=${RighttSideData[params?.rowIndex].userStatus}`)
              .then((response : any)=> {
                // setRadioButtonStatus( RighttSideData[params?.rowIndex].userStatus);
                console.log('resuserStatus',response)
                if (response && response?.data?.code === 200 && response?.data?.status === true) {
                  dispatch(showMessage(" User Status Updated in Location Approval Matrix Successfully!!"))
                  showRightData(selectedLeftsideData);
                }
              }) 
              
               console.log('e',e,params, RighttSideData[params?.rowIndex].userStatus)}}
            aria-label="Platform"
          >
            <ToggleButton value="Active" >Y</ToggleButton>
            <ToggleButton value="In Active">N</ToggleButton>
            
          </ToggleButtonGroup>
          </div>
        </>
      )
    },
    {
      field: "userName",
      headerName: "User Name",
      headerTooltip: "User Name",

      sortable: true,
      resizable: true,
      width: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "roleName",
      headerName: "Role Name",
      headerTooltip: "Role Name",

      sortable: true,
      resizable: true,
      width: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "verticalType",
      headerName: "Vertical Type",
      headerTooltip: "Vertical Type",

      sortable: true,
      resizable: true,
      width: 180,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "email",
      headerName: "Email",
      headerTooltip: "Email",

      sortable: true,
      resizable: true,
      width: 180,
      cellStyle: { fontSize: "13px" },
    },

  ];
  let columnDefs = [
    {
      field: "sequence",
      headerName: "Sequence",
      headerTooltip: "Sequence",

      sortable: true,
      resizable: true,
      width: 90,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "minValue",
      headerName: "Min Value",
      headerTooltip: "Minimum Value",

      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "maxValue",
      headerName: "Max Value",
      headerTooltip: "Maximum Value",

      sortable: true,
      resizable: true,
      width: 160,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "roleName",
      headerName: "Role Name",
      headerTooltip: "Role Name",

      sortable: true,
      resizable: true,
      width: 220,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
    },
  ];

  const handleClickOpen = async () => {
    setOpen(true);
    let role = selectedLeftsideData?.roleName?.split(",")
    let roleList = role?.map(v => ({ roleName: v }));
    setRoleList(roleList)
    setSelectedRole(roleList?.[0])
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/AddUsersInPhaseMatrix?queryType=Location Note&isBudgeted=${radioButton == "Budgeted" ? true : false}&MinValue=${selectedLeftsideData?.minValue}&MaxValue=${selectedLeftsideData?.maxValue}&sequence=${selectedLeftsideData?.sequence}&RoleName=${selectedLeftsideData?.roleName}`)
      .then((response: any) => {
        setUserList(response?.data || []);
      })
      .catch((e: any) => { });
  };

  const handleClickMatrixOpen =async () => {
    setOpenMatrix(true);
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/User/RoleList`)
      .then((response : any) => {
        console.log("res",response)
        setRoleListMatrix(response?.data)
      })
  };

  useEffect(() => {
    if (!insertRef.current) {
      if (selectedRoleMatrix && selectedRoleMatrix != undefined ) {
      axios
        .get (`${process.env.REACT_APP_BASEURL}/api/User/UsersByRoleId?Id=${selectedRoleMatrix?.id}`)
        .then((response : any )=> {
          console.log('res11',response)
          setUserListMatrix(response?.data)
        })
      }
    }
    else{
      insertRef.current = false;
    }
    }, [selectedRoleMatrix])

  const handleClose = () => {
    setOpen(false);
    setOpenMatrix(false);
    setSelectedUser([])
    setMinValueMatrix(null)
    setMaxValueMatrix(null)
    setSequenceMatrix(null)
    setSelectedUserMatrix([])
    setMatrixStatus('')
    setSelectedRoleMatrix('')
    setMinValueError(false);
    setMaxValueError(false);
    setSequenceError(false);
    setMatrixStatusError(false);
    setSelectedRoleMatrixError(false);
    setSelectedUserMatrixError(false);
    setSelectedUserAddError(false)
    setUserListMatrix([])
  };

  const handleExportData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/ExcelDownloadForApprovalMatrix?queryType=Location Note`
      )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "LocationApprovalMatrix.xlsx";
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
              showMessage("Location Approval Matrix data downloaded successfully!")
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
          Location Approval Matrix
        </Box>
        <div className="rolem-grid">
          <Stack
            display="flex"
            alignItems="flex-end"
            justifyContent="space-between"
            flexDirection="row"
            sx={{ mb: -2 }}
          >
             <Button
              size="small"
              style={primaryButtonSm}
              sx={{ color: "#fff", fontSize: "12px" }}
              onClick={handleClickMatrixOpen}
            >
              Add New Matrix
            </Button>

            <Button
              size="small"
              style={primaryButtonSm}
              sx={{ color: "#fff", fontSize: "12px" }}
              onClick={handleClickOpen}
            >
              Add New User
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
          
          <Dialog
            open={open}
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
            maxWidth="lg"
          >
            <DialogTitle id="alert-dialog-title" className="title-model">
              Add User
            </DialogTitle>
            <DialogContent style={{ width: "450px" }}>


              <div className="input-form">
                <h2 className="phaseLable">Select Role</h2>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  getOptionLabel={(option) =>
                    option?.roleName?.toString() || ""
                  }
                  disableClearable={true}
                  disabled={roleList?.length === 1 ? true : false}
                  options={roleList || []}
                  onChange={(e, value) => {
                    setSelectedRole(value);
                  }}
                  placeholder="Document Type"
                  value={selectedRole}
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
              </div>

              <div className="input-form">
                <h2 className="phaseLable required">Select Users</h2>
                <Autocomplete
                  multiple
                  limitTags={2}
                  style={{ zIndex: 9999999 }}
                  disablePortal={false}
                  id="combo-box-demo"
                  filterSelectedOptions
                  getOptionLabel={(option: any) => {
                    return option?.userName?.toString() || "";
                  }}
                  disableClearable
                  options={userList || []}
                  onChange={(e, value: any) => {
                    {
                      setSelectedUser(value);
                      setSelectedUserAddError(false)
                    }
                  }}
                  onError={() => setSelectedUserAddError(true)}
                  placeholder="Document Type"
                  value={selectedUser || []}
                  renderInput={(params) => (
                    <TextField
                      name="vendorType"
                      id="vendorType"
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
                {selectedUserAddError && (
                  <FormHelperText error>
                      <p className="form-error">Please select at least one user.</p>
                  </FormHelperText>
                )}
              </div>
            </DialogContent>
            <DialogActions className="button-wrap">
              <Button className="yes-btn" onClick={onAddUser}>
                Submit
              </Button>
              <Button className="no-btn" onClick={handleClose}>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
              open={openMatrix}
              onClose={handleClose}
              aria-describedby="alert-dialog-slide-description"
              maxWidth="lg"
            >
              <DialogTitle id="alert-dialog-title" className="title-model">
                Add Matrix
              </DialogTitle>
              <DialogContent style={{ width: "450px" }}>

              
              <div className="input-form">
                  <h2 className="phaseLable required">Min Value</h2>
                  <TextField
                    autoComplete="off"
                    name="minValue"
                    id="minValue"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={minValueMatrix}
                    type="number"
                    onKeyDown={handleKeyPress}
                    // error={minValueError}
                    // helperText={minValueMatrix < 0 ? "Negative values not allowed" : ""}
                    onChange={(e:any)=> {
                      e?.target?.value >= 0 ? setMinValueMatrix(e?.target?.value) : setMinValueMatrix(0);
                      setMinValueError(false)
                    }}
                    // disabled
                    // onBlur={handleBlur}
                  />
                  <FormHelperText error={minValueError}>
                    <p className="form-error">{minValueError ? 'Please enter min value' : ''}</p>
                  </FormHelperText>
              </div>
              <div className="input-form">
                  <h2 className="phaseLable required">Max Value</h2>
                  <TextField
                    autoComplete="off"
                    name="maxValue"
                    id="maxValue"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={maxValueMatrix}
                    type="number"
                    // error={maxValueError}
                    onKeyDown={handleKeyPress}
                    // error={maxValueMatrix < 0}
                    // helperText={maxValueMatrix < 0 ? "Negative values not allowed" : ""}
                    onChange={(e:any)=>{
                      e?.target?.value >= 0 ? setMaxValueMatrix(e?.target?.value) : setMaxValueMatrix(0);
                      setMaxValueError(false)
                    }}
                    // disabled
                    // onBlur={handleBlur}
                  />
                   <FormHelperText error={maxValueError}>
                    <p className="form-error">{maxValueError ? 'Please enter max value' : ''}</p>
                  </FormHelperText>
              </div>
              <div className="input-form">
                  <h2 className="phaseLable required">Sequence</h2>
                  <TextField
                    autoComplete="off"
                    name="sequence"
                    id="sequence"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    type="number"
                    value={sequenceMatrix}
                    onKeyDown={handleKeyPress}
                    onChange={(e:any)=> {
                      e?.target?.value >= 0 ? setSequenceMatrix(e?.target?.value) : setSequenceMatrix(0);
                      setSequenceError(false)
                    }}
                    // error={sequenceError}
                    // disabled
                    // onBlur={handleBlur}
                  />
                  <FormHelperText error={sequenceError}>
                    <p className="form-error">{sequenceError ? 'Please enter Sequence' : ''}</p>
                  </FormHelperText>
              </div>
              <div className="input-form">
                  <h2 className="phaseLable required">Authority Level</h2>
                  <Select
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="matrixStatus"
                    id="matrixStatus"
                    value={matrixStatus}
                    // error={matrixStatusError}
                    onChange={(e) => {
                      setMatrixStatus(e?.target?.value)
                      setMatrixStatusError(false)
                    }}
                    // onBlur={handleBlur}
                  >
                        <MenuItem value={"Approved By"}>Approved By</MenuItem>
                        <MenuItem value={"Validated By"}>Validated By</MenuItem>
                        <MenuItem value={"Recommended By"}>Recommended By</MenuItem>
                  </Select>
                  <FormHelperText error={matrixStatusError}>
                      <p className="form-error">{matrixStatusError ? 'Please select Authority Level' : ''}</p>
                  </FormHelperText>
              </div>
                <div className="input-form">
                  <h2 className="phaseLable required">Select Role</h2>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    getOptionLabel={(option) =>{
                      console.log('option',option)
                     return option?.role_Name?.toString() || ""
                    }  
                    }
                    disableClearable={true}
                    // disabled={roleList?.length === 1 ? true : false}
                    options={roleListMatrix || []}
                    onChange={(e, value) => {
                      console.log('value',value)
                      setSelectedRoleMatrix(value);
                      setSelectedUserMatrix([]);
                      setSelectedRoleMatrixError(false)
                    }}
                    placeholder="Document Type"
                    ListboxProps={{
                      style: {
                        maxHeight: 170,
                      },
                    }}
                    value={selectedRoleMatrix}
                    onError={() => setSelectedRoleMatrixError(true)}
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
                  {selectedRoleMatrixError && (
                    <FormHelperText error={selectedRoleMatrixError}>
                        <p className="form-error">Please select a Role</p>
                    </FormHelperText>
                  )}
                </div>

                <div className="input-form">
                  <h2 className="phaseLable required">Select Users</h2>
                  <Autocomplete
                    multiple
                    limitTags={2}
                    style={{ zIndex: 9999999 }}
                    disablePortal={false}
                    id="combo-box-demo"
                    filterSelectedOptions
                    getOptionLabel={(option: any) => {
                      return option?.userName?.toString() || "";
                    }}
                    disableClearable
                    options={userListMatrix || []}
                    onChange={(e, value: any) => {
                      {
                        setSelectedUserMatrix(value);
                        setSelectedUserMatrixError(false)
                      }
                    }}
                    onError={() => setSelectedUserMatrixError(true)}
                    placeholder="Document Type"
                    value={selectedUserMatrix || []}
                    renderInput={(params) => (
                      <TextField
                        name="vendorType"
                        id="vendorType"
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
                  {selectedUserMatrixError && (
                    <FormHelperText error={selectedUserMatrixError}>
                        <p className="form-error">Please select a user</p>
                    </FormHelperText>
                  )}
                </div>
              </DialogContent>
              <DialogActions className="button-wrap">
                <Button className="yes-btn" onClick={onAddMatrix}>
                  Submit
                </Button>
                <Button className="no-btn" onClick={handleClose}>
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
        </Stack>
      </div>
    </Grid >
      <Grid
        marginBottom="0px"
        container
        item
        spacing={3}
        justifyContent="start"
        alignSelf="center"
      >
        <Grid item xs={6} md={6} sx={{ position: "relative" }}>
          <div
            className="ag-theme-alpine"
            style={{ height: "calc(100vh - 200px)", marginTop: "10px" }}
          >
            <CommonGrid
              defaultColDef={null}
              columnDefs={columnDefs}
              rowData={LeftSideData}
              onGridReady={onGridReady}
              gridRef={gridRef}
              pagination={false}
              paginationPageSize={null}
              onRowClicked={(e) => showRightData(e?.data)}
              rowSelection="single"
            />
          </div>
        </Grid>
        <Grid item xs={6} md={6} sx={{ position: "relative" }}>
          <div
            className="ag-theme-alpine"
            style={{ height: "calc(100vh - 200px)", marginTop: "10px" }}
          >
            <CommonGrid
              defaultColDef={null}
              columnDefs={columnDefs2}
              rowData={RighttSideData}
              onGridReady={onGridReady2}
              gridRef={gridRef2}
              pagination={false}
              paginationPageSize={null}
            />
          </div>
        </Grid>
      </Grid>
    
    </>
  );
}