import React, { useState } from "react";
import { IconButton, Theme } from "@mui/material";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import HelpNotificationContent from "./HelpNotificationContent";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AppTooltip from "../AppTooltip";
import { alpha } from "@mui/material/styles";
import { SxProps } from "@mui/system";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

interface HelpNotificationsProps {
  drawerPosition?: "left" | "top" | "right" | "bottom";
  tooltipPosition?:
  | "bottom-end"
  | "bottom-start"
  | "bottom"
  | "left-end"
  | "left-start"
  | "left"
  | "right-end"
  | "right-start"
  | "right"
  | "top-end"
  | "top-start"
  | "top";
  isMenu?: boolean;
  sxNotificationContentStyle?: SxProps<Theme>;
}

const HelpNotifications: React.FC<HelpNotificationsProps> = ({
  drawerPosition = "right",
  tooltipPosition = "bottom",
  isMenu = false,
  sxNotificationContentStyle = {},
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action: string) => {
    if (action === "logout") {
      // Handle logout logic here
    }
    // Handle other menu item actions if needed
    handleMenuClose();
  };

  return (
    <div>
      <>
        {isMenu ? (
          <Box component="span" onClick={() => setShowNotification(true)}>
            Message
          </Box>
        ) : (
          <AppTooltip title="" placement={tooltipPosition}>
            <div>
              <IconButton
                className="icon-btn"
                onClick={handleMenuOpen}
                sx={{
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  color: (theme) => theme.palette.text.secondary,
                  backgroundColor: (theme) => theme.palette.background.default,
                  border: 1,
                  borderColor: "transparent",
                  "&:hover, &:focus": {
                    color: (theme) => theme.palette.text.primary,
                    backgroundColor: (theme) =>
                      alpha(theme.palette.background.default, 0.9),
                    borderColor: (theme) =>
                      alpha(theme.palette.text.secondary, 0.25),
                  },
                }}
                // onClick={() => setShowNotification(true)}
                size="large"
              >
                <HelpOutlineIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={() => handleMenuItemClick("logout")}>
                  User Guide
                </MenuItem>
                {/* Add other menu items here if needed */}
              </Menu>
            </div>
          </AppTooltip>
        )}

        <Drawer
          anchor={drawerPosition}
          open={showNotification}
          onClose={() => setShowNotification(false)}
        >
          <HelpNotificationContent
            sxStyle={sxNotificationContentStyle}
            onClose={() => setShowNotification(false)}
          />
        </Drawer>
      </>
    </div>
  );
};

export default HelpNotifications;
