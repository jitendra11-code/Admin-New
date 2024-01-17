import React from "react";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import IntlMessages from "@uikit/utility/IntlMessages";
import Box from "@mui/material/Box";
import AppTextField from "@uikit/core/AppFormComponents/AppTextField";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import AppInfoView from "@uikit/core/AppInfoView";
import { useAuthMethod } from "@uikit/utility/AuthHooks";
import { Fonts } from "../../../shared/constants/AppEnums";
import { AiOutlineGoogle, AiOutlineTwitter } from "react-icons/ai";
import { FaFacebookF } from "react-icons/fa";
import { BsGithub } from "react-icons/bs";
import {
  primaryColor,
  red,
  primaryButton,
} from "../../../shared/constants/CustomColor";
import axios from "axios";

const SigninFirebase = () => {
  const navigate = useNavigate();
  const { messages } = useIntl();

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
  });

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", mb: 5 }}>
        <Formik
          validateOnChange={true}
          initialValues={{
            email: "Admin",
            password: "Admin@123",
          }}
          validationSchema={validationSchema}
          onSubmit={(data, { setSubmitting }) => {
            setSubmitting(true);
            axios
              .post(
                `${process.env.REACT_APP_BASEURL}/api/User/login`,
                { Username: data.email, Password: data.password }
              )
              .then((response: any) => {
                navigate("/home");
                setSubmitting(false);
              })
              .catch((e: any) => {
                setSubmitting(false);
              });
          }}
        >
          {({ isSubmitting }) => (
            <Form style={{ textAlign: "left" }} noValidate autoComplete="off">
              <Box sx={{ mb: { xs: 5, xl: 8 } }}>
                <AppTextField
                  placeholder={messages["common.email"] as string}
                  name="email"
                  label={<IntlMessages id="common.email" />}
                  variant="outlined"
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
                  variant="outlined"
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-input": {
                      fontSize: 14,
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  mb: { xs: 3, xl: 4 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Checkbox sx={{ ml: -3 }} />
                  <Box
                    component="span"
                    sx={{
                      color: "grey.500",
                    }}
                  >
                    <IntlMessages id="common.rememberMe" />
                  </Box>
                </Box>
                <Box
                  component="span"
                  sx={{
                    color: primaryColor,
                    fontWeight: Fonts.MEDIUM,
                    cursor: "pointer",
                    display: "block",
                    textAlign: "right",
                  }}
                  onClick={onGoToForgetPassword}
                >
                  <IntlMessages id="common.forgetPassword" />
                </Box>
              </Box>

              <div>
                <Button
                  style={primaryButton}
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                  sx={{
                    minWidth: 160,
                    fontWeight: Fonts.REGULAR,
                    fontSize: 16,
                    textTransform: "capitalize",
                    padding: "4px 16px 8px",
                    backgroundColor: { primaryColor },
                  }}
                >
                  <IntlMessages id="common.login" />
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Box>

      <Box
        sx={{
          color: "grey.500",
          mb: { xs: 5, md: 7 },
        }}
      >
        <span style={{ marginRight: 4 }}>
          <IntlMessages id="common.dontHaveAccount" />
        </span>
        <Box
          component="span"
          sx={{
            fontWeight: Fonts.MEDIUM,
            "& a": {
              color: primaryColor,
              textDecoration: "none",
            },
          }}
        >
          <Link to="/signup">
            <IntlMessages id="common.signup" />
          </Link>
        </Box>
      </Box>

    

      <AppInfoView />
    </Box>
  );
};

export default SigninFirebase;
