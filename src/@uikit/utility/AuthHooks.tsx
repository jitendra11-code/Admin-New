// ForJWT Auth
import { getUserFromJwtAuth } from "./helper/AuthHelper";
import {
  useJWTAuth,
  useJWTAuthActions,
} from "../services/auth/jwt-auth/JWTAuthProvider";
import { useIsAuthenticated } from "@azure/msal-react";
import { useSelector } from "react-redux";
import { AppState } from "redux/store";

export const useAuthUser = () => {
  const { user, isAuthenticatedToken, isLoading } = useJWTAuth();
  const isAuthenticated = useIsAuthenticated()
  const { userInfo } = useSelector<AppState, AppState["user"]>(
    ({ user }) => user
  );

  var authStatus = userInfo !== null && (isAuthenticatedToken || isAuthenticated);

  return {
    isLoading,
    isAuthenticatedToken: authStatus,
    user: user !== null && user !== undefined ? getUserFromJwtAuth(user) : getUserFromJwtAuth(userInfo),
  };
};

export const useAuthMethod = () => {
  const { signInUser, signUpUser, logout, ChangeUserRoleProcess } = useJWTAuthActions();

  return {
    signInUser,
    logout,
    signUpUser,
    ChangeUserRoleProcess
  };
};

