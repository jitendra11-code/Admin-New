import React, { useState, useEffect, useLayoutEffect } from 'react';
import { store, history } from "redux/store";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useAuthMethod, useAuthUser } from '@uikit/utility/AuthHooks';
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { Button, DialogActions, DialogContent } from "@mui/material";
import { SAVE_USER_INFO } from 'types/actions/userInfoAction';
const SessionExpirePopup = ({ open, handleLogout, onConfirm }) => {
    return (
        <Dialog
            sx={{ width: "100%", height: "100%" }}
            open={open}
            onClose={onConfirm}
        >
            <DialogTitle style={{ paddingRight: 20, fontSize: 16, color: "#000" }}>
                Session Expire Warning
            </DialogTitle>
            <DialogContent>
                <div>
                    <p>Your session will expire in 2 minutes. Do you want to logout?</p>
                </div>
            </DialogContent>

            <DialogActions className="button-wrap">
                <Button
                    className="yes-btn"
                    onClick={() => { onConfirm() }}
                >
                    Keep Signin
                </Button>
                <Button className="no-btn" onClick={() => {
                    handleLogout("popup")
                }}>
                    Logout Now
                </Button>

            </DialogActions>
        </Dialog>

    );
};

export default SessionExpirePopup;
