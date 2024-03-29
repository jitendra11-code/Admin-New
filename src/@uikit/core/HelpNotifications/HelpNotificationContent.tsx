import React from "react";
import notification from "@uikit/services/db/notifications";
import { IconButton, Theme } from "@mui/material";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import AppScrollbar from "@uikit/core/AppScrollbar";
import IntlMessages from "@uikit/utility/IntlMessages";
// import NotificationItem from "./NotificationItem";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { SxProps } from "@mui/system";
import {
  primaryColor,
  red,
  primaryButton,
} from "../../../shared/constants/CustomColor";
interface HelpNotificationContentProps {
  onClose: () => void;
  sxStyle: SxProps<Theme>;
}

const HelpNotificationContent: React.FC<HelpNotificationContentProps> = ({
  onClose,
  sxStyle,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: 280,
        height: "100%",
        ...sxStyle,
      }}
    >
      <Box
        sx={{
          padding: "5px 20px",
          display: "flex",
          alignItems: "center",
          borderBottom: 1,
          borderBottomColor: (theme) => theme.palette.divider,
          minHeight: { xs: 56, sm: 70 },
        }}
      >
        <Typography component="h3">
          <IntlMessages id="common.notifications" />({notification.length})
        </Typography>
        <IconButton
          sx={{
            height: 40,
            width: 40,
            marginLeft: "auto",
            color: "text.secondary",
          }}
          onClick={onClose}
          size="large"
        >
          <CancelOutlinedIcon />
        </IconButton>
      </Box>
      <AppScrollbar
        sx={{
          height: { xs: "calc(100% - 96px)", sm: "calc(100% - 110px)" },
        }}
      >
        {/* <List sx={{ py: 0 }}>
          {notification?.map((item) => (
            <NotificationItem key={item.id} item={item} />
          ))}
        </List> */}
      </AppScrollbar>
      <Button
        sx={{
          borderRadius: 0,
          width: "100%",
          textTransform: "capitalize",
          marginTop: "auto",
          height: 40,
          backgroundColor : {primaryColor}
        }}
        variant="contained"
      
        
      >
        <IntlMessages id="common.viewAll" />
      </Button>
    </Box>
  );
};

export default HelpNotificationContent;
