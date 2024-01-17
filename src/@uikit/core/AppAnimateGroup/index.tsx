
import React, { ReactNode } from "react";

interface AppAnimateGroupProps {
  children: ReactNode;

  [x: string]: any;
}

const AppAnimateGroup: React.FC<AppAnimateGroupProps> = (props) => {
  return <div style={props.style}>{props.children}</div>;
};

export default AppAnimateGroup;
