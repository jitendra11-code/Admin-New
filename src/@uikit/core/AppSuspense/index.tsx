import React, { ReactNode } from "react";
import AppLoader from "@uikit/core/AppLoader";

interface AppSuspenseProps {
  children: ReactNode;
}

const AppSuspense: React.FC<AppSuspenseProps> = ({ children }) => {
  return <React.Suspense fallback={<AppLoader />}>{children}</React.Suspense>;
};

export default AppSuspense;
