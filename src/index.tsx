import React from "react";
import ReactDOM from "react-dom/client";

import "@uikit/services";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { PersistGate } from "redux-persist/lib/integration/react";
import persistStore from "redux-persist/es/persistStore";
import { store } from "redux/store";
import { Provider } from "react-redux";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "pages/auth/MSALAuthectication/authConfig";
const root = ReactDOM.createRoot(document.getElementById("root"));
let persistor = persistStore(store);
const msalInstance = new PublicClientApplication(msalConfig);


root.render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <MsalProvider instance={msalInstance}>

        <App />
      </MsalProvider>
    </PersistGate>
  </Provider>
);

reportWebVitals();
