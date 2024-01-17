import React from "react";
import { useThemeContext } from "../../../../utility/AppContextProvider/ThemeContextProvider";
import { alpha, Box } from "@mui/material";
// import { ReactComponent as Logo } from "../../../../../assets/images/logo-blue.svg";
import logoImage from "../../../../../assets/images/Bajaj_Finserv_Logo_Primary.png";
import { ReactComponent as LogoText } from "../../../../../assets/icon/logo_text.svg";

interface AppLogoProps {
  color?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ color }) => {
  const { theme } = useThemeContext();

  return (
    <Box
      sx={{
        height: { xs: 56, sm: 70 },
        padding: 2.5,
        display: "flex",
        flexDirection: "row",
        cursor: "pointer",
        alignItems: "center",
        justifyContent: "center",
        "& img": {
          height: { xs: 40, sm: 45 },
        },
      }}
      className="app-logo"
    >
      {/* <Logo fill={theme.palette.primary.main} /> */}
      <img src={logoImage} alt="Logo" style={{ fill: theme.palette.primary.main }} />
      <Box
        sx={{
          mt: 1,
          display: { xs: "none", md: "block" },
          "& svg": {
            height: { xs: 25, sm: 30 },
          },
        }}
      >
      </Box>
    </Box>
  );
};

export default AppLogo;
