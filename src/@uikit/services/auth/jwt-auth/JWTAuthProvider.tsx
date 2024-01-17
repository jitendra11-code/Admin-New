import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserActionList } from "redux/actions/UserAction";
import { setUserComplienceActionList } from "redux/actions/UserComplienceAction";
import jwtAxios, { setAuthToken } from "./index";
import axios from "axios";
import { AuthUser } from "../../../../types/models/AuthUser";
import MenuImageDirectory from "@uikit/common/Menu/MenuImageRepo";
import {
  fetchError,
  fetchStart,
  fetchSuccess,
} from "../../../../redux/actions";
import {
  setUserMenuList,
  setUserMenuOriginalList,
} from "redux/actions/MenuAction";
import groupBy from "pages/common-components/jsFunctions/groupBy";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "pages/auth/MSALAuthectication/authConfig";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { SAVE_CURRENT_ROLE, SAVE_USER_INFO } from "types/actions/userInfoAction";
import { AppState } from "redux/store";

interface JWTAuthContextProps {
  user: AuthUser | null | undefined;
  isAuthenticatedToken: boolean;
  isLoading: boolean;
}

interface SignUpProps {
  name: string;
  email: string;
  password: string;
}

interface SignInProps {
  email: string;
  password: string;
}
interface SignInSamlProps {
  email: string;
}
interface UserRoleProps {
  userRole: object,
}
interface UserInfoProps {
  userInfo: object
}

interface JWTAuthActionsProps {
  signUpUser: (data: SignUpProps) => void;
  signInUser: (data: SignInProps) => void;
  signInUserWithEmail: (data: SignInSamlProps) => void;
  logout: () => void;
  ChangeUserRoleProcess: (userRole: UserRoleProps, userInfo: UserInfoProps) => void;
}

const JWTAuthContext = createContext<JWTAuthContextProps>({
  user: null,
  isAuthenticatedToken: false,
  isLoading: true,
});
const JWTAuthActionsContext = createContext<JWTAuthActionsProps>({
  signUpUser: () => { },
  signInUser: () => { },
  signInUserWithEmail: () => { },
  logout: () => { },
  ChangeUserRoleProcess: () => { }
});

export const useJWTAuth = () => useContext(JWTAuthContext);

export const useJWTAuthActions = () => useContext(JWTAuthActionsContext);

interface JWTAuthAuthProviderProps {
  children: ReactNode;
}

const JWTAuthAuthProvider: React.FC<JWTAuthAuthProviderProps> = ({
  children,
}) => {
  const [jwtData, setJWTAuthData] = useState<JWTAuthContextProps>({
    user: null,
    isAuthenticatedToken: false,
    isLoading: true,
  });

  const dispatch = useDispatch();
  const isAuthenticated = useIsAuthenticated();
  const { user } = useAuthUser();
  

  const { userRole, userInfo } = useSelector<AppState, AppState["user"]>(
    ({ user }) => user
  );
  const _getChildrentMenuList = (menuList, id) => {
    var item =
      menuList &&
      menuList?.length > 0 &&
      menuList?.filter((item) => item?.Parent_id === id);
    return item || [];
  };
  const _generateMenuIcon = (iconName) => {
    var iconNode = null;
    iconNode =
      MenuImageDirectory &&
      MenuImageDirectory?.find((item) => item?.iconName === iconName);
    return (iconNode && iconNode?.iconNode) || null;
  };
  const _generateChildrenList = (list) => {
    var _list = [];
    _list =
      list &&
      list?.length > 0 &&
      list?.map((item) => {
        return {
          id: item?.id,
          title: item?.menuname || "",
          messageId: item?.id || "",
          apiType: item?.apitype || "",
          type: "item",
          exact: false,
          icon: _generateMenuIcon(item?.icons),
          url: item?.menuroute,
        };
      });
    return _list || [];
  };

  const _generateMenuList = async (menuList) => {
    var _json = [];
    var _menulist = groupBy(menuList, "isparent");
    if (_menulist?._parentMenu === null) {
      _json =
        menuList &&
        menuList?.map((item) => {
          return {
            id: item?.id,
            title: item?.menuname || "",
            messageId: item?.id || "",
            apiType: item?.apitype || "",
            exact: false,
            type: "item",
            icon: _generateMenuIcon(item?.icons),
            url: item?.menuroute,
          };
        });

      return _json || [];
    }
    _json =
      _menulist?._parentMenu &&
      _menulist?._parentMenu?.values &&
      _menulist?._parentMenu?.values?.length > 0 &&
      _menulist?._parentMenu?.values?.map((parent, parentKey) => {
        var childMenu = _getChildrentMenuList(
          _menulist?._childMenu?.values,
          parent?.id
        );
        return {
          ...parent,
          children: childMenu && childMenu?.length > 0 ? childMenu : [],
        };
      });
    _json =
      (await _json) &&
      _json?.length > 0 &&
      _json?.map((item, key) => {
        if (item && item?.children && item?.children?.length > 0) {
          return {
            id: item?.id,
            title: item?.menuname || "",
            messageId: item?.id || "",
            apiType: item?.apitype || "",
            type: "collapse",
            exact: false,
            icon: _generateMenuIcon(item?.icons),
            url: item?.menuroute,
            children: _generateChildrenList(item?.children),
          };
        }

        return {
          id: item?.id,
          title: item?.menuname || "",
          messageId: item?.id || "",
          apiType: item?.apitype || "",
          exact: false,
          type: "item",
          icon: _generateMenuIcon(item?.icons),
          url: item?.menuroute,
        };
      });
    return _json || [];
  };

  const { instance, accounts, inProgress } = useMsal();

  const request = {
    ...loginRequest,
    account: accounts[0],
  };

  const setProfileData = () => {
    instance
      .acquireTokenSilent(request)
      .then((response) => {
        var email = response?.account?.username;
        if (email !== "") {
          signInUserWithEmail({
            email: email,
          });
        }
      })
      .catch((e) => {
        instance.acquireTokenPopup(request).then((response) => { });
      });
  };


  useEffect(() => {
    const getAuthUser = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setJWTAuthData({
          user: null,
          isLoading: false,
          isAuthenticatedToken: false,
        });
        return;
      } else {
        getMenuList();
        axios({
          method: "get",
          url: `${process.env.REACT_APP_BASEURL}/api/Workflow/GetMyActions`,
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response: any) => {
            if (response?.data && response?.data?.length > 0) {
              dispatch(setUserActionList(response?.data));
            }
          })
          .catch((e: any) => { });
        axios({
          method: "get",
          url: `${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetMyActionsForCompliance?rollName=${user?.role}&userName=${user?.UserName}`,
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response: any) => {
            if (response?.data && response?.data?.length > 0) {
              dispatch(setUserComplienceActionList(response?.data));
            }
          })
          .catch((e: any) => { });
        setJWTAuthData({
          user: null,
          isLoading: false,
          isAuthenticatedToken: true,
        });
      }
    };

    getAuthUser();
  }, []);


  const ChangeUserRoleProcess = async (userRole, userInfo) => {
    var token = localStorage.getItem("token");
    var userId = userInfo?.UserId || 0;
    var userSelectedRoleId = userRole?.id || 0;
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_BASEURL}/api/User/ChangeRole?userId=${userId || 0}&roleId=${userSelectedRoleId || 0}&token=${token || ""}`);
      if (data?.status === false) {
        dispatch(fetchError(data?.message || "Error Occurred !"))
        return
      };
      if (data?.status === true && data?.data?.authhenticationToken) {
        localStorage.setItem("token", data?.data?.authhenticationToken);
        setAuthToken(data?.data?.authhenticationToken);
        setJWTAuthData({
          user: data?.data || null,
          isAuthenticatedToken: true,
          isLoading: false,
        });

        if (data?.data?.authhenticationToken) {

          dispatch({ type: SAVE_USER_INFO, payload: data?.data || null })
          window.location.reload();          //Do action call here
        }
        dispatch(fetchSuccess());
      }
    } catch (error) {
      setJWTAuthData({
        ...jwtData,
        isAuthenticatedToken: false,
        isLoading: false,
      });
      dispatch(fetchError("Something went wrong"));
    }
  };




 
  
  
  const signInUserWithEmail = async ({ email }: { email: string }) => {
    dispatch(fetchStart());
    try {
      axios
        .get(
          `${process.env.REACT_APP_BASEURL}/api/User/EmailAuthenticate?EmailId=${email}`
        )
        .then((response: any) => {
          if (!response) {
            localStorage.setItem("token", "");
            //setAuthToken(data?.data?.authhenticationToken);
            setJWTAuthData({
              user: null,
              isLoading: false,
              isAuthenticatedToken: false,
            });
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          var data = null;
          if (response?.data && response) {
            if (response?.data?.status === false) {
              dispatch(fetchError(data?.message || "Error Occurred !"));
              return;
            }
            if (
              response?.data?.status === true &&
              response?.data?.data?.authhenticationToken
            ) {
              localStorage.setItem(
                "token",
                response?.data?.data?.authhenticationToken
              );
              setAuthToken(response?.data?.data?.authhenticationToken);
              setJWTAuthData({
                user: response?.data?.data || null,
                isAuthenticatedToken: true,
                isLoading: false,
              });

              if (response?.data?.data?.authhenticationToken) {
                dispatch({
                  type: SAVE_USER_INFO,
                  payload: response?.data?.data || null,
                });
                getMenuList();
                axios({
                  method: "get",
                  url: `${process.env.REACT_APP_BASEURL}/api/Workflow/GetMyActions`,
                })
                  .then((response: any) => {
                    if (response?.data && response?.data?.length > 0) {
                      dispatch(setUserActionList(response?.data));
                    }
                  })
                  .catch((e: any) => {
                    dispatch(fetchError("Error Occurred !"));
                  });
                axios({
                  method: "get",
                  url: `${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetMyActionsForCompliance?rollName=${user?.role}&userName=${user?.UserName}`,
                })
                  .then((response: any) => {
                    if (response?.data && response?.data?.length > 0) {
                      dispatch(setUserComplienceActionList(response?.data));
                    }
                  })
                  .catch((e: any) => { });
                //Do action call here
              }
              dispatch(fetchSuccess());
            }
          }
        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occurred !"));
        });
    } catch (error) {
      setJWTAuthData({
        ...jwtData,
        isAuthenticatedToken: false,
        isLoading: false,
      });
      dispatch(fetchError("Something went wrong"));
    }
  };

  const signInUser = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    dispatch(fetchStart());
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASEURL}/api/User/login`,
        { Username: email, password }
      );
      if (data?.status === false) {
        dispatch(fetchError(data?.message || "Error Occurred !"));
        return;
      }
      if (data?.status === true && data?.data?.authhenticationToken) {
        localStorage.setItem("token", data?.data?.authhenticationToken);
        localStorage.setItem("defaultModule",data?.data?.DefaultModule);
        localStorage.setItem("moduleList",data?.data?.ModuleList);
        localStorage.setItem("loginId",data?.data?.LoginId);
        setAuthToken(data?.data?.authhenticationToken);
        setJWTAuthData({
          user: data?.data || null,
          isAuthenticatedToken: true,
          isLoading: false,
        });
        
        if (data?.data?.authhenticationToken) {
          var userInfo = data?.data;
          dispatch({ type: SAVE_USER_INFO, payload: data?.data || null });
          getMenuList();
          axios({
            method: "get",
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/GetMyActions`,
            headers: {
              Authorization: `Bearer ${data?.data?.authhenticationToken}`,
            },
          })
            .then((response: any) => {
              if (response?.data && response?.data?.length > 0) {
                dispatch(setUserActionList(response?.data));
              }
            })
            .catch((e: any) => {
              dispatch(fetchError("Error Occurred !"));
            });
          axios({
            method: "get",
            url: `${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetMyActionsForCompliance?rollName=${userInfo?.RoleName}&userName=${userInfo?.UserName}`,
            headers: {
              Authorization: `Bearer ${data?.data?.authhenticationToken}`,
            },
          })
            .then((response: any) => {
              if (response?.data && response?.data?.length > 0) {
                dispatch(setUserComplienceActionList(response?.data));
              }
            })
            .catch((e: any) => { });
          //Do action call here
        }
        dispatch(fetchSuccess());
      }
    } catch (error) {
      setJWTAuthData({
        ...jwtData,
        isAuthenticatedToken: false,
        isLoading: false,
      });
      dispatch(fetchError("Something went wrong"));
    }
  };

  const getMenuList = async () => {
   
    const defaultModule = localStorage.getItem("defaultModule");
    const moduleValue = localStorage.getItem("moduleValue");
    console.log('moduleValue',moduleValue)
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/RoleMenuList/RoleMenuList?module=${moduleValue ? moduleValue : defaultModule}`)
      .then((response) => {
        if (response?.data && response?.data?.length > 0) {
          var _response = response?.data?.map((item) => {
            return {
              ...item,
              path: item?.menuroute || "",
            };
          });
          dispatch(setUserMenuOriginalList(_response || []));
          _generateMenuList(response?.data).then((res) => {
            dispatch(setUserMenuList(res));
          });
        }
      })
      .catch((err) => { });
   
  };

  const signUpUser = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    dispatch(fetchStart());
    try {
      const { data } = await axios.post("users", { name, email, password });
      localStorage.setItem("token", data.token);
      setAuthToken(data.token);
      const res = await jwtAxios.get("/auth");
      setJWTAuthData({
        user: res.data,
        isAuthenticatedToken: true,
        isLoading: false,
      });
      dispatch(fetchSuccess());
    } catch (error) {
      setJWTAuthData({
        ...jwtData,
        isAuthenticatedToken: false,
        isLoading: false,
      });
      dispatch(fetchError("Something went wrong"));
    }
  };

  const logout = async () => {
    // localStorage.removeItem("token");
    
    let loginId = parseInt(localStorage.loginId);
    await axios
      .post(`${process.env.REACT_APP_BASEURL}/api/User/logout?id=${loginId}`)
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
    localStorage.removeItem("token");  
    setAuthToken();
    setJWTAuthData({
      user: null,
      isLoading: false,
      isAuthenticatedToken: false,
    });
    dispatch({ type: SAVE_USER_INFO, payload: null });
    dispatch({ type: SAVE_CURRENT_ROLE, payload: null })
  };

  return (
    <JWTAuthContext.Provider
      value={{
        ...jwtData,
      }}
    >
      <JWTAuthActionsContext.Provider
        value={{
          signUpUser,
          signInUser,
          signInUserWithEmail,
          logout,
          ChangeUserRoleProcess,
        }}
      >
        {children}
      </JWTAuthActionsContext.Provider>
    </JWTAuthContext.Provider>
  );
};
export default JWTAuthAuthProvider;
