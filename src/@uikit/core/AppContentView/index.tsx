import React , {useEffect} from "react";
import { Navigate, Route, Routes, useNavigate, useRoutes } from "react-router-dom";
import AppSuspense from "@uikit/core/AppSuspense";
import AppFooter from "../AppLayout/components/AppFooter";
import AppErrorBoundary from "../AppErrorBoundary";
import Box from "@mui/material/Box";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppContentViewWrapper from "./AppContentViewWrapper";
import { SxProps } from "@mui/system";
import { useAuthUser } from "../../utility/AuthHooks";
import {
  anonymousStructure,
  authorizedStructure,
  unAuthorizedStructure,
} from "../../../pages";
import generateRoutes from "../../utility/RouteGenerator";
import { initialUrl } from "../../../shared/constants/AppConst";
import { IconButton } from "@mui/material";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useSelector } from "react-redux";
import { AppState } from "redux/store";
import moment from "moment";
import axios from "axios";
interface AppContentViewProps {
  sxStyle?: SxProps;
}

const AppContentView: React.FC<AppContentViewProps> = ({ sxStyle }) => {
  const { user, isAuthenticatedToken } = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  const { userInfo } = useSelector<AppState, AppState["user"]>(
    ({ user }) => user
  );

  const { instance, accounts, inProgress } = useMsal();
  var authStatus = userInfo !== null && (isAuthenticatedToken || isAuthenticated);
  let navigate = useNavigate();
  const routes = useRoutes(
    generateRoutes({
      isAuthenticated: authStatus && inProgress === 'none',
      userRole: user?.RoleName,
      unAuthorizedStructure,
      authorizedStructure,
      anonymousStructure,
    })
  );
  useEffect(() => {
    let currentPath = window.location.pathname;
    
    if(currentPath != "/signin" && currentPath != "/home" && currentPath != "/execute-query" && localStorage.token )
    {
      const body = {
        id: 0,
        userId: user?.UserName,
        pageUrl: currentPath,
        visitTime: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      }
      axios
        .post(`${process.env.REACT_APP_BASEURL}/api/User/InsertVisitPageDetails`, body)
        .then((response: any) => {
          if (!response) {
            return;
          };
          if (response && response?.data?.code === 200 && response?.data?.status === true) {
            return;
          } else {
            return;
          }
        })
        .catch((e: any) => {
        });
    }
    
  }, [window.location.pathname]);
  return (
    <AppContentViewWrapper>
      <Box
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          p: { xs: 5, md: 7.5, xl: 12.5 },
          ...sxStyle,
          padding: "15px !important",
        }}
        className="app-content"
      >


        <AppSuspense>
          <AppErrorBoundary>
            {routes}
            <Routes>
              <Route path="/" element={<Navigate to={initialUrl} />} />
            </Routes>
          </AppErrorBoundary>
        </AppSuspense>
      </Box>
      <AppFooter />
    </AppContentViewWrapper>
  );
};

export default AppContentView;
