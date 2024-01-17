import React from "react";
import List from "@mui/material/List";

import {
  RouterConfigData,
} from "../../../../../pages/routesConfig";
import NavVerticalGroup from "./VerticalNavGroup";
import VerticalCollapse from "./VerticalCollapse";
import VerticalItem from "./VerticalItem";
import { AppState } from "redux/store";
import { useSelector } from "react-redux";
const VerticalNav = () => {
  const { userMenuList } = useSelector<AppState, AppState["menu"]>(
    ({ menu }) => menu
  );
  const routesConfig: RouterConfigData[] = [
    {
      id: "app",
      title: "",
      apiType: "",
      messageId: "",
      type: "group",
      children: userMenuList || []
    },
  ];
  return (
    <List
      sx={{
        position: "relative",
        padding: 0,
      }}
      component="div"
    >
      {routesConfig && routesConfig?.length > 0 && routesConfig?.map((item: RouterConfigData) => (
        <React.Fragment key={item.id}>
          {item.type && item.type === "group" && <NavVerticalGroup item={item} level={0} />}

          {item.type && item.type === "collapse" && (
            <VerticalCollapse item={item} level={0} />
          )}

          {item.type && item.type === "item" && <VerticalItem item={item} level={0} />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default VerticalNav;
