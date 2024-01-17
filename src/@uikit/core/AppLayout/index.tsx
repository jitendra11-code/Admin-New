import React, { useEffect } from "react";
import AppContentView from "@uikit/core/AppContentView";
import { useAuthUser } from "../../utility/AuthHooks";
import {
  useLayoutActionsContext,
  useLayoutContext,
} from "../../utility/AppContextProvider/LayoutContextProvider";
import Layouts from "./Layouts";
import AuthWrapper from "./AuthWrapper";
import { useUrlSearchParams } from "use-url-search-params";
import { useSidebarActionsContext } from "../../utility/AppContextProvider/SidebarContextProvider";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { onNavCollapsed } from "../../../redux/actions";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { AppState } from "redux/store";
const AppLayout = () => {
  const { navStyle } = useLayoutContext();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector<AppState, AppState["user"]>(
    ({ user }) => user
  );
  const { isAuthenticatedToken, user } = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  var authStatus = userInfo !== null && (isAuthenticatedToken || isAuthenticated)

  const { instance, accounts, inProgress } = useMsal();


  const { updateNavStyle } = useLayoutActionsContext();
  const { updateMenuStyle, setSidebarBgImage } = useSidebarActionsContext();
  const AppLayout = Layouts[navStyle];
  const [params] = useUrlSearchParams({}, {});

  useEffect(() => {
    if (params.layout) updateNavStyle(params.layout as string);
    if (params.menuStyle) updateMenuStyle(params.menuStyle as string);
    if (params.sidebarImage) setSidebarBgImage(true);
  }, [params, setSidebarBgImage, updateNavStyle, updateMenuStyle]);


  useEffect(() => {
    dispatch(onNavCollapsed());
  }, [dispatch, pathname]);

  return (
    <>
      {authStatus && inProgress === 'none' ? (
        <AppLayout />

      ) : (
        <AuthWrapper>
          <AppContentView />
        </AuthWrapper>
      )}
    </>
  );
};

export default React.memo(AppLayout);
