import React from "react";
import { useDispatch } from "react-redux";
import { Form } from "formik";
import * as yup from "yup";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { grey } from "@mui/material/colors";
import { Fonts } from "shared/constants/AppEnums";
import IntlMessages from "@uikit/utility/IntlMessages";
import AppInfoView from "@uikit/core/AppInfoView";
import AppAnimate from "@uikit/core/AppAnimate";
import { styled } from "@mui/material/styles";
import { ReactComponent as Logo } from "../../../assets/icon/comingsoon.svg";
import { useTheme } from "@mui/material";
import { useIntl } from "react-intl";

const FormWrapper = styled(Form)(() => {
  return {
    display: "flex",
    flexDirection: "column",
    width: 300,
    alignItems: "center",
    marginBottom: 12,
    "& .text-field": {
      width: "100%",
      marginBottom: 20,
    },
    "& .button": {
      fontWeight: Fonts.MEDIUM,
      fontSize: 16,
      textTransform: "capitalize",
    },
  };
});

const validationSchema = yup.object({
  email: yup
    .string()
    .email("The Email you entered is not a valid format!")
    .required("Please enter User Name!"),
});

const ComingSoon = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { messages } = useIntl();
  return (
    <AppAnimate animation="transition.slideUpIn" delay={200}>
      <>
        <Box
          sx={{
            py: { xl: 8 },
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              mb: { xs: 4, xl: 8 },
              width: "100%",
              maxWidth: { xs: 200, sm: 300, xl: 706 },
              "& svg": {
                width: "100%",
                maxWidth: 400,
              },
            }}
          >
            <Logo fill={theme.palette.primary.main} />
          </Box>

          <Box
            component="h3"
            sx={{
              mb: { xs: 3, xl: 4 },
              fontSize: { xs: 20, md: 24 },
              fontWeight: Fonts.MEDIUM,
            }}
          >
            <IntlMessages id="error.comingSoon" />!
          </Box>

          <Box
            sx={{
              mb: { xs: 4, xl: 5 },
              color: grey[600],
            }}
          >
            <Typography style={{ fontSize: 18, marginTop: 3 }}>
              <IntlMessages id="error.comingSoonMessage1" />
            </Typography>
            <Typography style={{ fontSize: 18 }}>
              <IntlMessages id="error.comingSoonMessage2" />
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            mx: "auto",
            maxWidth: 384,
          }}
        >
        
        </Box>
        <AppInfoView />
      </>
    </AppAnimate>
  );
};

export default ComingSoon;
