import React, { useEffect, useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AuthRoutes from '@uikit/utility/AuthRoutes';
import { authRouteConfig } from 'pages/auth';
import { useLocation, matchPath, matchRoutes } from 'react-router-dom';
import AppContextProvider from '@uikit/utility/AppContextProvider';
import AppThemeProvider from '@uikit/utility/AppThemeProvider';
import AppStyleProvider from '@uikit/utility/AppStyleProvider';
import AppLocaleProvider from '@uikit/utility/AppLocaleProvider';
import AppLayout from '@uikit/core/AppLayout';
import { MsalProvider, useIsAuthenticated, useMsal } from '@azure/msal-react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { routeConfigs } from 'pages/Routes';
import WrappedComponent from '@uikit/common/LoginSessionTimeOutExpire';
import JWTAuthAuthProvider, { useJWTAuthActions } from '@uikit/services/auth/jwt-auth/JWTAuthProvider';
import axios from 'axios';
import { store } from 'redux/store';
import { AppInfoView } from '@uikit';
import { setLoaderActionList } from 'redux/actions/AppLoader';
import Loader from '@uikit/common/ApplicationLoader';
import { setUserActionList } from 'redux/actions/UserAction';
import { setUserComplienceActionList } from 'redux/actions/UserComplienceAction';
import { fetchError, fetchStart, fetchSuccess } from 'redux/actions';
import { useDispatch } from 'react-redux';
import { SAVE_USER_INFO } from 'types/actions/userInfoAction';
import { decryptPayload, decryptPayloadDownload, encryptPayload } from 'pages/common-components/EncryptDecryptPayload';
import { useAuthMethod, useAuthUser } from '@uikit/utility/AuthHooks';
import IdleTimer, { useIdleTimer } from 'react-idle-timer';
import SessionExpirePopup from '@uikit/common/LoginSessionTimeOutExpire';
import { setAuthToken } from '@uikit/services/auth/jwt-auth';
const setUserActionListAPICAll = () => {
    var userInfo = store?.getState()?.user?.userInfo;
    axios
        .get(`${process.env.REACT_APP_BASEURL}/api/Workflow/GetMyActions`)
        .then((res: any) => {
            if (res?.data && res?.data?.length > 0) {
                store.dispatch(setUserActionList(res?.data));
            }
        })
        .catch((e: any) => {});
    axios
        .get(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetMyActionsForCompliance?rollName=${userInfo?.RoleName}&userName=${userInfo?.UserName}`)
        .then((res: any) => {
            if (res?.data && res?.data?.length > 0) {
                store.dispatch(setUserComplienceActionList(res?.data));
            }
        })
        .catch((e: any) => {});
};

const getReferehToken = () => {
    const token = localStorage.getItem('token');
    axios
        .get(`${process.env.REACT_APP_BASEURL}/api/User/RefreshToken?Token=${token || ''}`)
        .then((res: any) => {
            if (!res) {
                localStorage.removeItem('token');
                setAuthToken();
                store?.dispatch({ type: SAVE_USER_INFO, payload: null });
                //window.location.href = process.env.REACT_APP_BASE_ROUTE;
            }
            if (res?.data !== '') {
                localStorage.setItem('token', res?.data);
            } else {
                localStorage.removeItem('token');
                // window.location.href = process.env.REACT_APP_BASE_ROUTE;
            }
        })
        .catch((e: any) => {
            localStorage.removeItem('token');
            setAuthToken();
            store?.dispatch({ type: SAVE_USER_INFO, payload: null });
            window.location.href = process.env.REACT_APP_BASE_ROUTE;
        });
};

axios.interceptors.request.use(
    (config) => {
        var _url: any = config?.url;
        _url = _url.split('?');
        var _request: any;
        var originalUrl = _url?.[0];
        var _queryParams = _url?.[1];
        if (!config.url.includes('/api/User/login')) {
            store.dispatch(setLoaderActionList(true));
        }
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = 'Bearer ' + token;
        }
        if (process.env.REACT_APP_ISENCRYPTIONACTIVE === 'true') {
            config.headers['Content-Type'] = 'application/problem+json';
            config.maxContentLength = Infinity;
            config.maxBodyLength = Infinity;
            _request = encryptPayload(_queryParams, originalUrl, config);
            config = _request;
            return config;
        }
        return config;
    },

    (error) => {
        store.dispatch(setLoaderActionList(false));
        return Promise.reject(error);
    },
);
axios.interceptors.response.use(
    (response) => {
        store.dispatch(setLoaderActionList(false));
        let apiendpoint = response?.config?.url;
        if (apiendpoint && apiendpoint !== '') {
            if (apiendpoint.includes('/api/Workflow/Workflow')) {
                setUserActionListAPICAll();
            }
        }
        var _response;
        if (process.env.REACT_APP_ISENCRYPTIONACTIVE === 'true') {
            if (apiendpoint.includes('/api/Mandates/GetMandateReportDetailsForExcel')) {
                return response;
            }
            _response = decryptPayload(response);
            response = _response;
            return response;
        }
        return response;
    },

    (error) => {
        store.dispatch(setLoaderActionList(false));
        if (error?.response?.status === 401) {
            getReferehToken();
            // window.location.href = process.env.REACT_APP_BASE_ROUTE;
            // localStorage.removeItem("token");
            return Promise.reject(error);
        }
    },
);

const App = () => {
    const dispatch = useDispatch();
    const { isAuthenticatedToken } = useAuthUser();
    const [showPopup, setShowPopup] = React.useState(false);
    const { instance, accounts, inProgress } = useMsal();
    const { logout } = useAuthMethod();
    const { user } = useAuthUser();
    const isAuthenticated = useIsAuthenticated();
    const [authorizedList, setAuthorizedList] = React.useState([]);
    var path: any = window.location.pathname?.split('/');
    path = path?.[path?.length - 1];
    var noid: any = window.location.pathname?.split('/');
    noid = noid?.[noid?.length - 2];
    const _token = localStorage.getItem('token');
    var menuList = store?.getState()?.menu?.userOriginalMenuList || [];
    const checkRouteIsPresent = (routeToMatch, userRole) => {
        const routeList = routeConfigs;
        if (routeList && routeList?.length > 0) {
            const route = routeList.find((route) => {
                const match = matchPath({ path: route.path }, routeToMatch);
                return match ? true : false;
            });

            if (route) {
                return true;
            }
            return false;
        }
    };

    useEffect(() => {
        if (_token === null || _token === undefined) {
            reset();
        }
    }, [_token]);

    const handleLogout = (logoutType) => {
        if (isAuthenticatedToken && !isAuthenticated) {
            logout();
            setShowPopup(false);
            localStorage.removeItem('token');
        } else if (isAuthenticated) {
            if (logoutType === 'popup') {
                store.dispatch({ type: SAVE_USER_INFO, payload: null });
                instance.logoutRedirect({
                    postLogoutRedirectUri: process.env.REACT_POST_LOGOUT_URL,
                });
                localStorage.removeItem('token');
                setShowPopup(false);
            }
        } else {
            logout();
            localStorage.removeItem('token');
            setShowPopup(false);
        }
        window.location.href = process.env.REACT_APP_BASE_ROUTE;
    };

    const handleConfirm = () => {
        setShowPopup(false);
    };

    const onPresenceChange = (presence) => {};

    const onPrompt = () => {
        const token = localStorage.getItem('token');
        if (token !== null && !isAuthenticated) {
            setShowPopup(true);
        }
    };

    const onIdle = () => {
        const token = localStorage.getItem('token');
        if (token !== null && !isAuthenticated) {
            handleLogout('popup');
        }
    };

    const onActive = (event) => {
        setShowPopup(false);
        // const interval = setInterval(() => {
        //   const token = localStorage.getItem('token');
        //   if (token !== null) {
        //     jwtPayload = JSON.parse(window.atob(token?.split('.')?.[1]));
        //   }

        //   if (token === undefined) {
        //     clearInterval(interval);
        //     return
        //   }

        //   const expirationTime = jwtPayload?.exp * 1000;
        //   const currentTime = Date.now();
        //   const timeDiff = expirationTime - currentTime;
        //   const minutesUntilExpiration = Math.floor(timeDiff / 1000 / 60);

        //   if (minutesUntilExpiration <= 2) {
        //     setShowPopup(true);
        //     clearInterval(interval);
        //   }
        // }, 120000);

        // // Save the interval ID to the state so we can clear it when the component unmounts
        // setTimer(interval);
        // return () => {
        //   clearInterval(timer);

        // };
    };

    const onAction = (event) => {
        // Do something when a user triggers a watched event
    };

    const { start, reset, activate, pause, resume, isIdle, isPrompted, isLeader, isLastActiveTab, getTabId, getRemainingTime, getElapsedTime, getLastIdleTime, getLastActiveTime, getIdleTime, getTotalIdleTime, getActiveTime, getTotalActiveTime } = useIdleTimer({
        onPresenceChange,
        onPrompt,
        onIdle,
        onActive,
        onAction,
        timeout: 1000 * 60 * 30,
        promptBeforeIdle: 1000 * 60 * 3,
        events: ['mousemove', 'keydown', 'wheel', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'MSPointerDown', 'MSPointerMove', 'visibilitychange', 'focus'],
        immediateEvents: [],
        debounce: 0,
        throttle: 0,
        eventsThrottle: 200,
        element: document,
        startOnMount: true,
        startManually: false,
        stopOnIdle: false,
        crossTab: true,
        name: 'idle-timer',
        syncTimers: 0,
        leaderElection: false,
    });

    useEffect(() => {
        let currentPath = window.location.pathname;
        if (currentPath && currentPath !== '') {
            if (menuList && menuList?.length > 0) {
                checkRouteIsPresent(currentPath, user?.role);
            }
        }
    }, [routeConfigs, menuList]);
    console.log('user?.role', user);
    useEffect(() => {
        if (menuList && menuList?.length > 0) {
            var _permissionList = menuList?.[0]?.permission || [];
            let currentPath = window.location.pathname;
            if (currentPath && currentPath !== '') {
                if (checkRouteIsPresent(currentPath, user?.role)) {
                    if (typeof _permissionList !== 'object') {
                        _permissionList = (_permissionList && _permissionList?.split(',')) || [];
                        _permissionList =
                            _permissionList &&
                            _permissionList?.length > 0 &&
                            _permissionList?.map((item) => {
                                if (item?.[0] === '/') {
                                    return { path: item };
                                }
                                return { path: `/${item || ''}` };
                            });
                    }
                    if (_permissionList && _permissionList?.length > 0) {
                        setAuthorizedList(_permissionList);
                    }
                }
            }
        }
    }, [menuList]);
    // useMemo(() => {
    //     if (authorizedList && authorizedList?.length > 0) {
    //         var data = authorizedList;
    //         if (path !== '' && path !== '/admin-erp-fe' && path !== 'signin' && path !== 'home') {
    //             var canAccess = data && data?.filter((item) => item && item?.path?.split('/')?.[item?.path?.split('/')?.length - 1] === path);
    //             console.log('canAccess', data, canAccess);
    //             if ((canAccess && canAccess?.length === 0) || user?.role === 'Compliance Partner' || user?.role === 'HR Compliance' || user?.role === 'Payroll Team' || (user?.role === 'Exit Team' && path === 'create-request' && noid === 'noid')) {
    //                 dispatch(fetchError('You are unauthorized user to access this page !!!'));
    //                 window.location.href = process.env.REACT_APP_BASE_ROUTE;
    //             }
    //         }
    //     }
    // }, [authorizedList]);

    const saveUserInfo = (email) => {
        try {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/User/EmailAuthenticate?EmailId=${email}`)
                .then((response: any) => {
                    if (!response) {
                        localStorage.setItem('token', '');
                        dispatch(fetchError('Error Occurred !'));
                        return;
                    }
                    var data = null;
                    if (response?.data && response) {
                        localStorage.setItem('defaultModule', response?.data?.data?.DefaultModule);
                        localStorage.setItem('moduleList', response?.data?.data?.ModuleList);
                        if (response?.data?.status === false) {
                            dispatch(fetchError(response?.data?.message || 'Error Occurred !'));
                            dispatch({ type: SAVE_USER_INFO, payload: null });
                            instance.logoutRedirect({
                                postLogoutRedirectUri: process.env.REACT_POST_LOGOUT_URL,
                            });
                            return;
                        }
                        if (response?.data?.status === true && response?.data?.data?.authhenticationToken) {
                            localStorage.setItem('token', response?.data?.data?.authhenticationToken);
                            // setAuthToken(response?.data?.data?.authhenticationToken);

                            if (response?.data?.data?.authhenticationToken) {
                                dispatch({
                                    type: SAVE_USER_INFO,
                                    payload: response?.data?.data || null,
                                });
                            }
                        }
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        } catch (error) {
            dispatch(fetchError('Something went wrong'));
        }
    };

    const setProfileData = () => {
        instance
            .handleRedirectPromise()
            .then((response) => {
                if (!response) return;
                var email = response?.account?.username;
                if (email !== '' && email !== undefined) {
                    saveUserInfo(email);
                }
            })
            .catch((error) => {});
    };

    useEffect(() => {
        if (isAuthenticated) setProfileData();
    }, [isAuthenticated]);
    console.log('Path1234', path);
    return (
        <>
            <SessionExpirePopup handleLogout={handleLogout} open={showPopup} onConfirm={handleConfirm}></SessionExpirePopup>
            <AppContextProvider>
                <AppThemeProvider>
                    <AppStyleProvider>
                        <AppLocaleProvider>
                            <BrowserRouter>
                                <JWTAuthAuthProvider>
                                    <AuthRoutes>
                                        <CssBaseline />
                                        <Loader />
                                        <AppLayout />
                                        <AppInfoView />
                                    </AuthRoutes>
                                </JWTAuthAuthProvider>
                            </BrowserRouter>
                        </AppLocaleProvider>
                    </AppStyleProvider>
                </AppThemeProvider>
            </AppContextProvider>
        </>
    );
};

export default App;
