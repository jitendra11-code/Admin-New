/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LogLevel, BrowserCacheLocation } from "@azure/msal-browser";

/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
 */
export const msalConfig = {
    auth: {
        //1535a6af-72b9-4fb4-a5d9-59d9b65f2729
        //4dd1ff4e-521b-4e9a-8772-ac7e36d07fbc
        clientId: "4dd1ff4e-521b-4e9a-8772-ac7e36d07fbc", // This is the ONLY mandatory field that you need to supply.
        authority: "https://login.microsoftonline.com/710de1d3-2901-4647-89e7-3b01f1c2806d", // Defaults to "https://login.microsoftonline.com/common"
        redirectUri: window.location.origin + '/admin-erp-fe', // Points to window.location.origin. You must register this URI on Azure Portal/App Registration.
        postLogoutRedirectUri: window.location.origin + '/admin-erp-fe/signin',// process.env.REACT_POST_LOGOUT_URL, // Indicates the page to navigate after logout.
        navigateToLoginRequestUrl: true, // If "true", will navigate back to the original request location before processing the auth code response.
    },
    cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage, // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
        storeAuthStateInCookie: true, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        loggerOptions: {
            piiLoggingEnabled: true,
            loggerCallback: (level, message, containsPii) => {
              
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            }
        }
    }
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit: 
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
    scopes: ['email']
};
export const graphConfig = {
    graphMeEndpoint: "Enter_the_Graph_Endpoint_Here/v1.0/me"
};

/**
 * An optional silentRequest object can be used to achieve silent SSO
 * between applications by providing a "login_hint" property.
 */
export const silentRequest = {
    //scopes: ["openid", "profile"],
    scopes: [],
    loginHint: "example@domain.net"
};