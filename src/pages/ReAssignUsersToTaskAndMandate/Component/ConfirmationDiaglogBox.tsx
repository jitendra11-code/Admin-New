import {
    DialogActions,
    Dialog,
    DialogContent,
    DialogContentText,
    Button
} from "@mui/material";
import React from "react"

const Content = ({ setOpen, open, handleConfirm, handleClose }) => {
    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        Are you sure you want change the user?
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="button-wrap">
                    <Button className="no-btn"
                        onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        className="yes-btn"
                        onClick={() => {
                            handleConfirm()
                        }}
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    )
}
export default Content;