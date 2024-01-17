import React from "react";

import { useSelector } from "react-redux";
import AppMessageView from "@uikit/core/AppMessageView";
import AppLoader from "@uikit/core/AppLoader";
import { AppState } from "../../../redux/store";

const AppInfoView = () => {
  const { error, loading, message, warningMessage } = useSelector<AppState, AppState["common"]>(
    ({ common }) => common
  );



  const showMessage = () => {
    return <AppMessageView variant="success" message={message?.toString()} />;
  };

  const showError = () => {
    return <AppMessageView variant="error" message={error?.toString()} />;
  };

  const showWarning = () => {
    return <AppMessageView variant="warning" message={warningMessage?.toString()} />;
  };

  return (
    <>
      {loading && <AppLoader />}

      {message && showMessage()}
      {error && showError()}
      {warningMessage && showWarning()}
    </>
  );
};

export default AppInfoView;
