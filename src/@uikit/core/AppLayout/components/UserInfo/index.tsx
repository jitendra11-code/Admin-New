import React from "react";
import orange from "@mui/material/colors/orange";
import { useAuthMethod, useAuthUser } from "../../../../utility/AuthHooks";
import { Box } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Fonts } from "../../../../../shared/constants/AppEnums";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { SAVE_USER_INFO } from "types/actions/userInfoAction";
import { useDispatch } from "react-redux";
import DialogReset from "../../../../../pages/ResetPassword/DialogReset";
import UserRoleSelection from "./UserRoleSelection";

interface UserInfoProps {
  color?: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ color = "text.secondary" }) => {
  const { logout } = useAuthMethod();
  const { user, isAuthenticatedToken } = useAuthUser();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();
  const userNameBySaml = accounts && accounts?.[0] && accounts?.[0]?.name
  const dispatch = useDispatch()
  const handleLogout = (logoutType) => {
    localStorage.removeItem("moduleValue");
    if (isAuthenticatedToken && !isAuthenticated) {
      logout()
    } else {
      if (logoutType === "popup") {
        dispatch({ type: SAVE_USER_INFO, payload: null })
        instance.logoutRedirect({
          postLogoutRedirectUri: process.env.REACT_POST_LOGOUT_URL,

        });
      }
    }
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getUserAvatar = () => {
    if (user?.displayName) {
      return user?.displayName?.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user?.email?.charAt(0).toUpperCase();
    }
  };
  const [del, setDel] = React.useState(false);
  const handleDelete = () => {
    setDel(true);
  };
  return (
    <>
    {del && (
        <DialogReset
          del={del}
          setDel={setDel}
        />
      )}
      <Box
        onClick={handleClick}
        sx={{
          py: 3,
          px: 3,
          pb: 0,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        className="user-info-view"
      >
        <Box sx={{ py: 0.5 }}>
          {user?.photoURL ? (
            <Avatar
              sx={{
                height: 40,
                width: 40,
                fontSize: 24,
                backgroundColor: "white",
                color: "#00316a",
              }}
              src={user?.photoURL}
            />
          ) : (
            <Avatar
              sx={{
                height: 35,
                width: 35,
                fontSize: 24,
                backgroundColor: "white",
                color: "#00316a",
              }}
            >
              {getUserAvatar()}
            </Avatar>
          )}
        </Box>
        <Box
          sx={{
            width: { xs: "calc(100% - 62px)", xl: "calc(100% - 72px)" },
            ml: 2,
            color: color,
          }}
          className="user-info"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                mb: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: 16,
                fontWeight: Fonts.MEDIUM,
                color: "inherit",
              }}
              component="span"
            >
              {isAuthenticated ? userNameBySaml : user?.displayName ? user?.displayName : "Admin User "}
            </Box>
            <Box
              sx={{
                ml: 3,
                color: "inherit",
                display: "flex",
              }}
            >
              <ExpandMoreIcon />
            </Box>
          </Box>
        </Box>
      </Box>
      <div
        style={{
          marginBottom: 0,
          marginLeft: 30,
          marginTop: 0,
          color: "inherit",
          width: "100%",
        }}

      >
        <UserRoleSelection />
      </div>
      <div
        style={{
          marginBottom: 0,
          marginLeft: 10,
          marginTop: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: 12,
          fontWeight: Fonts.MEDIUM,
          color: "inherit",
        }}

      >
        {user?.email ? user?.email : ""}
      </div>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
       
        <MenuItem onClick={() => {
          handleLogout("popup")
        }}>Logout</MenuItem>

        {/* <MenuItem onClick={() => {
          handleClose();
          handleDelete();
        }}>
          Reset Password</MenuItem> */}

      </Menu>
    </>
  );
};

export default UserInfo;
