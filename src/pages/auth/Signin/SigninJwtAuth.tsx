import React from "react";
import Button from "@mui/material/Button";
import { Checkbox, Typography } from "@mui/material";
import { Form, Formik, useFormik } from "formik";
import * as yup from "yup";
import { loginRequest } from "../MSALAuthectication/authConfig";
import AppInfoView from "@uikit/core/AppInfoView";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import IntlMessages from "@uikit/utility/IntlMessages";
import { useIntl } from "react-intl";
import AppTextField from "@uikit/core/AppFormComponents/AppTextField";
import { useJWTAuthActions } from "@uikit/services/auth/jwt-auth/JWTAuthProvider";
import { Fonts } from "../../../shared/constants/AppEnums";
import { primaryButton, primaryColor } from "shared/constants/CustomColor";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { fetchError } from "redux/actions";
import { useDispatch } from "react-redux";

const SigninJwtAuth = () => {
  const navigate = useNavigate();
  const { signInUser, signInUserWithEmail } = useJWTAuthActions();
  const isAuthenticated = useIsAuthenticated()
  const { messages } = useIntl();
  const { instance, accounts, inProgress } = useMsal();
  const dispatch = useDispatch();
  const handleLogin = (email, password) => {
    signInUser({
      email: email,
      password: password,
    });
  }

  const handleLoginWithSaml = async (e) => {
    e.preventDefault()
    try {
      let isValid = await instance.loginRedirect(loginRequest);
    }
    catch (err) {
    }
  }

  const onGoToForgetPassword = () => {
    navigate("/forget-password");
  };

  const validationSchema = yup.object({
    email: yup
      .string()
      .required(String(messages["validation.emailRequired"])),
    password: yup
      .string()
      .required(String(messages["validation.passwordRequired"])),
  })

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
      },
      validationSchema: null,
      validateOnChange: true,
      validateOnBlur: false,
      onSubmit: (values, action) => {

      },
    });

  ;
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", mb: 5 }}>
        <Formik
          validateOnChange={true}
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={validationSchema}
          onSubmit={(data, { setSubmitting }) => {

            setSubmitting(true);
            handleLogin(data.email, data.password)
            setSubmitting(false);
            localStorage.setItem("UserName", data?.email);
          }}
        >
          {({ values, isSubmitting }) => (
            <Form style={{ textAlign: "left" }} noValidate autoComplete="off">
              <Box sx={{ mb: { xs: 5, xl: 8 } }}>
                <AppTextField
                  placeholder={messages["common.email"] as string}
                  name="email"
                  label={<IntlMessages id="common.email" />}
                  variant="outlined"
                  onClick={(el) => {
                    el.target.value = el.target.value;
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-input": {
                      fontSize: 14,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: { xs: 3, xl: 4 } }}>
                <AppTextField
                  type="password"
                  placeholder={messages["common.password"] as string}
                  label={<IntlMessages id="common.password" />}
                  name="password"
                  onClick={(el) => {
                    el.target.value = el.target.value;
                  }}
                  variant="outlined"
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-input": {
                      fontSize: 14,
                    },
                  }}
                />
              </Box>



              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {values?.password && values?.email && (<Button
                  style={primaryButton}
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting || isAuthenticated}
                  sx={{
                    minWidth: 425,
                    fontWeight: Fonts.REGULAR,
                    fontSize: 16,
                    textTransform: "capitalize",
                    padding: "4px 16px 8px",
                    backgroundColor: { primaryColor },
                  }}
                >
                  <IntlMessages id="common.login" />
                </Button>)}


              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                <Button
                  style={primaryButton}
                  variant="contained"
                  color="primary"
                  type="submit"
                  onClick={(e) => { handleLoginWithSaml(e) }}

                  sx={{
                    minWidth: 425,
                    fontWeight: Fonts.REGULAR,
                    fontSize: 16,
                    marginTop: 10,
                    textTransform: "capitalize",
                    padding: "4px 16px 8px",
                    backgroundColor: { primaryColor },
                  }}
                >
                  Login with Microsoft
                </Button>

              </div>
              <div>
              </div>
            </Form>
          )}
        </Formik>
      </Box>



      <AppInfoView />
    </Box>
  );
};

export default SigninJwtAuth;
