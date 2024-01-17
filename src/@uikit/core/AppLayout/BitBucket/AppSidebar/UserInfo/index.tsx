import React from "react";
import orange from "@mui/material/colors/orange";
import { useAuthMethod, useAuthUser } from "../../../../../utility/AuthHooks";
import { alpha, Box } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Fonts } from "../../../../../../shared/constants/AppEnums";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { SAVE_USER_INFO } from "types/actions/userInfoAction";
import { useDispatch } from "react-redux";

const UserInfo = () => {
  const { logout } = useAuthMethod();

  const { user, isAuthenticatedToken } = useAuthUser();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { instance } = useMsal();
  const dispatch = useDispatch()

  const handleLogout = (logoutType) => {
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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getUserAvatar = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user?.email?.charAt(0).toUpperCase();
    }
  };
  const Uname = localStorage.getItem("UserName");
  return (
    <Box
      sx={{
        py: 3,
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <Box onClick={handleClick}>
        {user.photoURL ? (
          <Avatar
            sx={{
              height: 30,
              width: 30,
              backgroundColor: orange[500],
            }}
            src={user.photoURL}
          />
        ) : (
          <Avatar
            sx={{
              height: 30,
              width: 30,
              fontSize: 20,
              backgroundColor: orange[500],
            }}
          >
            {getUserAvatar()}
          </Avatar>
        )}
      </Box>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          py: 4,
        }}
      >
        <MenuItem
          sx={{
            backgroundColor: (theme) => alpha(theme.palette.common.black, 0.08),
            px: 6,
            py: 3,
          }}
        >
          <Box
            sx={{
              mr: 3.5,
            }}
          >
            {user.photoURL ? (
              <Avatar
                sx={{
                  height: 40,
                  width: 40,
                }}
                src={user.photoURL}
              />
            ) : (
              <Avatar
                sx={{
                  height: 40,
                  width: 40,
                  fontSize: 20,
                  backgroundColor: "white",
                }}
              >
                {getUserAvatar()}
              </Avatar>
            )}
          </Box>

          <Box>
            <Box
              sx={{
                mb: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: 14,
                fontWeight: Fonts.MEDIUM,
              }}
              component="span"
            >

              {user.displayName ? user.displayName : Uname}
            </Box>
          
          </Box>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            navigate("/my-account");
          }}
          sx={{
            px: 6,
            py: 1.5,
          }}
        >
          My account
        </MenuItem>
        <MenuItem
          sx={{
            px: 6,
            py: 1.5,
          }}
          onClick={() => { handleLogout("popup") }}
        >
          Logoutkkk
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserInfo;
