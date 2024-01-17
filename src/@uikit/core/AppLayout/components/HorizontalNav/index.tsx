import React from "react";
import HorizontalGroup from "./HorizontalGroup";
import HorizontalCollapse from "./HorizontalCollapse";
import HorizontalItem from "./HorizontalItem";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import { AppState, store } from "redux/store";
import {
  RouterConfigData,
} from "../../../../../pages/routesConfig";
import { useSelector } from "react-redux";

const HorizontalNav = () => {
  const { userMenuList } = useSelector<AppState, AppState["menu"]>(
    ({ menu }) => menu
  );
  const routesConfig: RouterConfigData[] = [
    {
      id: "app",
      title: "",
      icon: "",
      apiType: "",
      messageId: "",
      type: "group",
      children: userMenuList || []
    },
  ];

  return (
    <List className="navbarNav">
      {routesConfig && routesConfig?.length > 0 && routesConfig?.map((item: RouterConfigData) => (
        <React.Fragment key={item?.id}>
          {item?.type === "group" && (
            <HorizontalGroup item={item} nestedLevel={0} />
          )}

          {item.type && item?.type === "collapse" && (
            <HorizontalCollapse item={item} nestedLevel={0} />
          )}

          {item.type && item.type === "item" && (
            <HorizontalItem item={item} nestedLevel={0} />
          )}

          {item.type === "divider" && <Divider sx={{ my: 5 }} />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default HorizontalNav;
