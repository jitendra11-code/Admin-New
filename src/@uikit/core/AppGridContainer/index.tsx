import React, { ReactNode } from "react";
import Grid from "@mui/material/Grid";
import { useMediaQuery } from "@mui/material";
import { AdminERPTheme } from "../../../types/AppContextPropsType";

interface AppGridContainerProps {
  children: ReactNode;

  [x: string]: any;
}

const AppGridContainer: React.FC<AppGridContainerProps> = ({
  children,
  ...others
}) => {
  const isMDDown = useMediaQuery((theme: AdminERPTheme) =>
    theme.breakpoints.down("md")
  );
  return (
    <Grid container spacing={isMDDown ? 5 : 8} {...others}>
      {children}
    </Grid>
  );
};

export default AppGridContainer;
