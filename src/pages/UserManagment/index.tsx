import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  alpha,
} from "@mui/material";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import SearchIcon from "@mui/icons-material/Search";
import regExpressionTextField from "@uikit/common/RegExpValidation/regForTextField";
import { addUserInitialValues, addUserSchema } from "@uikit/schemas";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { GridApi } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import { useFormik } from "formik";
import moment from "moment";
import blockInvalidChar from "pages/Mandate/Location/Components/blockInvalidChar ";
import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { TbPencil } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import { primaryButtonSm } from "shared/constants/CustomColor";
import { useNavigate } from "react-router-dom";
import { AiFillFileExcel } from "react-icons/ai";
import AppTooltip from "@uikit/core/AppTooltip";

const UserManagment = () => {
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [vertical, setVertical] = React.useState([]);
  const [designation, setDesignation] = useState([])
  const [reportingUser, setReportingUser] = useState([])
  const [role, setRole] = useState([])
  const [vendorType, setVendorType] = useState([])
  const [showPassword, setShowPassword] = useState(false);
  const [dropdowns, setDropdowns] = useState<any>({})
  const [actionData, setActionData] = useState<any>({})
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const dispatch = useDispatch()
  let navigate = useNavigate();
  const { user } = useAuthUser();


  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }



  const getvendorType = async() => {
   await axios
    .get(`${process.env.REACT_APP_BASEURL}/api/VendorAllocation/GetVendorList`)
    .then((response: any) => {
      setVendorType(response?.data || [])
    })
    .catch((e: any) => {
    });
  }
  const getRole = async() => {
   await axios
    .get(`${process.env.REACT_APP_BASEURL}/api/User/UserManagementRoleList`)
    .then((response: any) => {
      setRole(response?.data || [])
    })
    .catch((e: any) => {
    });
  }
  const getReportingUser = async() => {
   await axios
    .get(`${process.env.REACT_APP_BASEURL}/api/User/UserManagementUsersList`)
    .then((response: any) => {
      setReportingUser(response?.data || [])
    })
    .catch((e: any) => {
    });
  }
  const getVertical = async() => {
   await axios
    .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=VerticalMaster`)
    .then((response: any) => {
      setVertical(response?.data?.data || [])
    })
    .catch((e: any) => {
    });
  }
  const getDesignation = async() => {
    await axios
    .get(
      `${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Designation`
    )
    .then((response: any) => {
      setDesignation(response?.data || [])
    })
    .catch((e: any) => {
    });
  }

  useEffect(() => {
    if (gridApi) {
      gridApi!.sizeColumnsToFit();
    }
  }, [reportingUser])  

  useEffect(() => {
    getVertical()
    getDesignation()
    getReportingUser()
    getRole()
    getvendorType()
  }, [])
  
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
    initialValues: addUserInitialValues,
    validationSchema: addUserSchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: (values, action) => {

       const body = {
        Id: actionData?.id || 0,
        Designation: dropdowns?.designation?.formName,
        UserId: values?.userName || "",
        UserName: values?.userName || "",
        Password: values?.password || "",
        MobileNumber: values?.mobileNo?.toString() || "",
        Email: values?.emailId || "",
        IsActive: values?.active,
        CreatedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        CreatedUser: user?.UserName || "",
        ModifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        ModifiedUser: user?.UserName || "",
        RoleId: dropdowns?.role?.id || 0,
        VendorType: dropdowns?.vendorType?.partnerCategory || "",
        UserFullName: values?.fullName || "",
        VerticalType: dropdowns?.vertical?.verticalName || "",
        Reporting_user_id: dropdowns?.reportingUser?.id || 0,
        uid: ""
       }
      if(actionData?.id){
        axios
        .post(`${process.env.REACT_APP_BASEURL}/api/User/UpdateUser`, body)
        .then((response: any) => {
         if(response){

           dispatch(showMessage("user update successfully"))
            action.resetForm();
            getReportingUser()
            setOpenUserModal(false);
            setDropdowns({role : null, designation : null,vertical : null,reportingUser :null,vendorType :null })
            setActionData({})

         }
        })
        .catch((e: any) => {
          action.resetForm();
          setOpenUserModal(false);
          setDropdowns({role : null, designation : null,vertical : null,reportingUser :null,vendorType :null })
          setActionData({})

        });
      }else{
        axios
        .post(`${process.env.REACT_APP_BASEURL}/api/User/SaveUser`, body)
        .then((response: any) => {
         if(response){

           dispatch(showMessage("user added successfully"))
            action.resetForm();
            getReportingUser()
            setOpenUserModal(false);
            setDropdowns({role : null, designation : null,vertical : null,reportingUser :null,vendorType :null })
            setActionData({})

         }
        })
        .catch((e: any) => {
          action.resetForm();
          setOpenUserModal(false);
          setDropdowns({role : null, designation : null,vertical : null,reportingUser :null,vendorType :null })
          setActionData({})

        });
      }
      
    },
  });

  const handleDeleteUser = () => {
    axios
         .post(`${process.env.REACT_APP_BASEURL}/api/User/DeleteUser?id=${actionData?.id}`, {})
         .then((response: any) => {
          if(response){

            dispatch(showMessage("user deleted successfully"))
             getReportingUser()
             setOpenDeleteModal(false);
             setActionData({})
          }
         })
         .catch((e: any) => {
           setOpenDeleteModal(false);
           setActionData({})
         });
      
  }

  const setUpdateData = (data) => {
    setActionData(data)
    setFieldValue("userName", data?.userName)
    setFieldValue("password", data?.password)
    setFieldValue("fullName", data?.userFullName)
    setFieldValue("mobileNo", data?.mobileNumber)
    setFieldValue("emailId", data?.email)
    setFieldValue("active", data?.isActive)
    setFieldValue("role", data?.roleId)
    setFieldValue("designation", data?.designation)
    setFieldValue("vertical", data?.roleId)
    setFieldValue("reportingUser", data?.reporting_user_id)
    setFieldValue("vendorType", data?.vendorType)
    setDropdowns({"role" : role?.find(v => v.id == data?.roleId), "designation" : designation?.find(v => v.formName == data?.designation),"vertical" : vertical?.find(v => v.verticalName == data?.verticalType), "reportingUser" : reportingUser?.find(v => v.id == data?.reporting_user_id),"vendorType" : vendorType?.find(v => v.partnerCategory == data?.vendorType) })
    setOpenUserModal(true)
  }

  const columnDefs = [
    {
      field: "medals.bronze",
      headerName: "Actions",
      headerTooltip: "Actions",
      width: 100,
      minWidth: 100,
      pinned: "left",
      cellRenderer: (e: any) => (
        <>
          <div className="actions">
            <Tooltip title="Edit User" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize" 
              onClick={() => navigate(`/user/${e?.data?.id}/upate-user`)}
              >
                <TbPencil />
              </button>
            </Tooltip>
            <Tooltip title="Delete User" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize" onClick={() => {setActionData(e?.data); setOpenDeleteModal(true)}}>
                <MdDelete />
              </button>
            </Tooltip>
          </div>
        </>
      ),
    },
    {
      field: "userName",
      headerName: "User Name",
      headerTooltip: "User Name",
      sortable: true,
      resizable: true,
      
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "userFullName",
      headerName: "User Full Name",
      headerTooltip: "User Full Name",
      sortable: true,
      resizable: true,
      
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "mobileNumber",
      headerName: "Mobile No",
      headerTooltip: "Mobile Number",
      sortable: true,
      resizable: true,
      
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "email",
      headerName: "Email Id",
      headerTooltip: "Email Id",
      sortable: true,
      resizable: true,
      
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "role",
      headerName: "Primary Role",
      headerTooltip: "Primary Role",
      sortable: true,
      resizable: true,
      
      cellStyle: { fontSize: "13px" },
      cellRenderer: (obj: any) => (
        <>
          <div>
            {role?.find(v => v.id === obj?.data?.roleId)?.role_Name}
          </div>
        </>
      ),
    },
    {
      field: "designation",
      headerName: "Designation",
      headerTooltip: "Designation",
      sortable: true,
      resizable: true,
      
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "verticalType",
      headerName: "Vertical ",
      headerTooltip: "Vertical ",
      sortable: true,
      resizable: true,
      
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "",
      headerName: "Reporting User",
      headerTooltip: "Reporting User",
      sortable: true,
      resizable: true,
      
      cellStyle: { fontSize: "13px" },
      cellRenderer: (obj: any) => (
        <>
          <div>
            {reportingUser?.find(v => v.id === obj?.data?.reporting_user_id)?.userName}
          </div>
        </>
      ),
    },
    {
      field: "vendorType",
      headerName: "Vendor Type",
      headerTooltip: "Vendor Type",
      sortable: true,
      resizable: true,
      
      cellStyle: { fontSize: "13px" },
    },
  ];

  const onFilterTextChange = (e) => {
    
    gridApi?.setQuickFilter(e?.target?.value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"))
    }
  };

  const handleExportData = () => {
    axios
    .get(
      `${process.env.REACT_APP_BASEURL}/api/User/ExcelDownloadForUserManagementUsersList`
    )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "UserManagement.xlsx";
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
              showMessage("User Management data downloaded successfully!")
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
          User Management
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
              size="small"
              style={primaryButtonSm}
              sx={{ color: "#fff", fontSize: "12px" }}
              onClick={() => navigate("/user/add-user")}
            >
             Add User
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

      <CommonGrid
        defaultColDef={{ flex: 1 }}
        columnDefs={columnDefs}
        rowData={reportingUser}
        onGridReady={onGridReady}
        gridRef={gridRef}
        pagination={true}
        paginationPageSize={10}
      />

      <Dialog
        maxWidth="xs"
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          style={{ paddingRight: 20, fontSize: 16, color: "#000" }}
        >
          Delete User
        </DialogTitle>
        <DialogContent>
            Are you sure you want to delete this user?
        </DialogContent>
        <DialogActions style={{ justifyContent: "center" }}>
          <Button
            className="no-btn"
            onClick={() => {
              setOpenDeleteModal(false);
              setDropdowns({role : null, designation : null,vertical : null,reportingUser :null,vendorType :null })

            }}
          >
            Cancel
          </Button>
          <Button sx={{height : "30px"}}  style={primaryButtonSm}  onClick={() => handleDeleteUser()}>
          Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserManagment;
