import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { Fonts } from "../../shared/constants/AppEnums";
import {primaryColor} from "../../shared/constants/CustomColor";
import MainLogo from "@uikit/common/MainLogo";
interface AuthWrapperProps {
  children: any;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        sx={{
          maxWidth: 1000,
          minHeight: { xs: 320, sm: 450 },
          width: "100%",
          overflow: "hidden",
          position: "relative",
          display: "flex",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: "50%", lg: "50%" },
            padding: { xs: 5, lg: 10 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {children}
        </Box>
        <Box
          sx={{
            width: { xs: "100%", sm: "50%", lg: "50%" },
            position: "relative",
            padding: { xs: 5, lg: 10 },
            display: { xs: "none", sm: "flex" },
            alignItems: { sm: "center" },
            justifyContent: { sm: "center" },
            flexDirection: { sm: "column" },
            backgroundColor: primaryColor,
            color: (theme) => theme.palette.common.white,
            fontSize: 14,
          }}
        >
          <Box
            sx={{
              maxWidth: 450,
            }}
          >
            <MainLogo/><br />
            <Typography
              component="h2"
              sx={{
                fontWeight: Fonts.BOLD,
                fontSize: 25,
                mb: 4,
              }}
            >
              Welcome to Bajaj Finserv
            </Typography>
           
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default AuthWrapper;
