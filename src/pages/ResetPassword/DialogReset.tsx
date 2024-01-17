import {
  Autocomplete,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import { resetPasswordInitialValues, resetPasswordSchema } from "@uikit/schemas";
import { showMessage } from "redux/actions";
import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

const DialogResetPassword = ({ del, setDel }) => {
  const [reportingUser, setReportingUser] = useState([]);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dropdowns, setDropdowns] = useState<any>({});
  const dispatch = useDispatch();
  const { user } = useAuthUser();
  const [open, setOpen] = React.useState(false);

  const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const handleMouseDownNewPassword = () => setShowNewPassword(!showNewPassword);

  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);


  const getReportingUser = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/User/UserManagementUsersList`)
      .then((response: any) => {
        setReportingUser(response?.data || []);
      })
      .catch((e: any) => {});
  };

  useEffect(() => {
     if (reportingUser?.length > 0) {
      setFieldValue("userName", user?.id);
      setDropdowns({
      userName: reportingUser?.find(
                (v) => v.id == user?.id
              ),
            });
     }
  }, [reportingUser]);

  useEffect(() => {
    getReportingUser();
  }, []);

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
    initialValues: resetPasswordInitialValues,
    validationSchema: resetPasswordSchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: (values, action) => {
      axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/User/ResetPassword?id=${dropdowns?.userName?.id}&Password=${values?.newPassword}`
      )
      .then((response: any) => {
        if (response.status) {
          handleClose();
          dispatch(showMessage("User Password Reset Successfully!"));
        
        } else {
          dispatch(showMessage("Error Occurred !"));
        }
      })
      .catch((e: any) => {
        dispatch(showMessage("Error Occurred !"));
      });
      
    },
  });
 
  const handleClose = () => {
    setOpen(false);
    setDel(false);
  };

  return (
    <>
      <Dialog
        className="dialog-wrap"
        open={open || del}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="title-model" style={{ fontSize: 16, color: "#000", fontWeight: "600" }}>
          Reset Password
        </DialogTitle>
        <div
    
      >
        <form>
          <div className="phase-outer">
            <Grid
              marginBottom="30px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >

              <Grid item xs={2} md={2} sx={{ position: "relative" }}></Grid>
              <Grid item xs={8} md={8} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable ">User Name</h2>
                  <Autocomplete
                    style={{ zIndex: 9999999 }}
                    disablePortal={false}
                    id="combo-box-demo"
                    getOptionLabel={(option: any) => {
                      return option?.userName?.toString() || "";
                    }}
                    disabled={user?.role && user?.role !== "System Admin "}
                    disableClearable
                    options={reportingUser || []}
                    onBlur={handleBlur}
                    onChange={(e, value: any) => {
                      {
                        setDropdowns({ ...dropdowns, userName: value });
                        setFieldValue("userName", value?.id);
                      }
                    }}
                    placeholder="Document Type"
                    value={dropdowns?.userName || null}
                    renderInput={(params) => (
                      <TextField
                        name="userName"
                        id="userName"
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
              <Grid item xs={2} md={2} sx={{ position: "relative" }}></Grid>
             
              <Grid item xs={2} md={2} sx={{ position: "relative" }}></Grid>
              <Grid item xs={8} md={8} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">New Password</h2>
                  <TextField
                    autoComplete="off"
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    id="newPassword"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.newPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowNewPassword}
                            onMouseDown={handleMouseDownNewPassword}
                            style={{ width: "25px" }}
                          >
                            {showNewPassword ? (
                              <Visibility fontSize="small" />
                            ) : (
                              <VisibilityOff fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {touched.newPassword && errors.newPassword ? (
                    <p className="form-error">{errors.newPassword}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={2} md={2} sx={{ position: "relative" }}></Grid>
             
              <Grid item xs={2} md={2} sx={{ position: "relative" }}></Grid>
              <Grid item xs={8} md={8} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Confirm Password</h2>
                  <TextField
                    autoComplete="off"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowConfirmPassword}
                            onMouseDown={handleMouseDownConfirmPassword}
                            style={{ width: "25px" }}
                          >
                            {showConfirmPassword ? (
                              <Visibility fontSize="small" />
                            ) : (
                              <VisibilityOff fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {touched.confirmPassword && errors.confirmPassword ? (
                    <p className="form-error">{errors.confirmPassword}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={2} md={2} sx={{ position: "relative" }}></Grid>
              
            </Grid>
          </div>
        </form>
      </div>
 
        <DialogActions className="button-wrap">
          <Button
            className="no-btn"
            onClick={() => {
              handleClose();
            }}
          >
            Cancel
          </Button>
          <Button className="yes-btn" 
          sx={{ height: "35px", width:"32%" }}
          onClick={() => handleSubmit()}
          >
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogResetPassword;
