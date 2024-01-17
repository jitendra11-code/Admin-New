import React, { useMemo } from "react";
import { Icon, ListItemText } from "@mui/material";
import clsx from "clsx";
import AppBadge from "@uikit/core/AppBadge";
import AppNavLink from "@uikit/core/AppNavLink";
import Box from "@mui/material/Box";
import { checkPermission } from "../../../../../utility/helper/RouteHelper";
import { useAuthUser } from "../../../../../utility/AuthHooks";
import VerticalNavItem from "./VerticalNavItem";
import { RouterConfigData } from "../../../../../../pages/routesConfig";
import Tooltip from "@mui/material/Tooltip";

interface VerticalItemProps {
  item: RouterConfigData;
  level: number;
}

const VerticalItem: React.FC<VerticalItemProps> = ({ level, item }) => {
  const { user } = useAuthUser();
  const hasPermission = useMemo(
    () => checkPermission(item.permittedRole, user?.role),
    [item.permittedRole, user?.role]
  );
  if (!hasPermission) {
    return null;
  }


  return (
    <VerticalNavItem
      level={level}
      button
      component={AppNavLink}
      to={item?.url || ""}
      apiType={item?.apiType || ""}
      activeClassName="active"
    >
      {
        React.isValidElement(item?.icon) && (
          <Box component="span">
            <Icon
              sx={{
                fontSize: 18,
                display: "block",
                mr: 4,
              }}
              className={clsx("nav-item-icon", "material-icons-outlined")}
              color="action"
            >
              {item?.icon}
            </Icon>
          </Box>
        )
      }      
      <Tooltip title={item?.title}>
      < ListItemText
        className="nav-item-content"
        primary={item?.title}
        classes={{ primary: "nav-item-text" }}
      />
      </Tooltip>
      {
        item?.count && (
          <Box sx={{ mr: 3.5 }} className="menu-badge">
            <AppBadge count={item?.count} color={item?.color} />
          </Box>
        )
      }
    </VerticalNavItem >
  );
};

export default React.memo(VerticalItem);
