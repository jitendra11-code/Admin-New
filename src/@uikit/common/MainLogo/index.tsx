import React from "react";
// import Logo from "../../../assets/images/logo.svg";
import logoImage from "../../../assets/images/Bajaj_Finserv_Logo_Reverse.png";
import { alpha, Box } from "@mui/material";

const MainLogo = () => {
  return (
    <Box className="app-logo" justifyContent={"center"} display={"flex"}>
      <img src={logoImage} alt="logo" style={{width:"175px"}}/>
    </Box>
  );
};

export default MainLogo;
