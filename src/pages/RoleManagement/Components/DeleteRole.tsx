import {
    DialogActions,
    Dialog,
    DialogContent,
    DialogContentText,
    Tooltip, Button
} from "@mui/material";
import React from "react"
import { AiOutlineDelete } from "react-icons/ai";

const DeleteRole = ({ params, setDeleteModal, open, deleteRole, handleClose }) => {
    return (
        <div>
            <Tooltip id="edit-property-draft" title="Delete Role">
                <button style={{ cursor: "pointer" }} className="actionsIcons-delete actions-icons-size">
                    <AiOutlineDelete onClick={() => { setDeleteModal(true) }} />
                </button>
            </Tooltip>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        Are you sure you want delete this role?
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
                            deleteRole(params?.data?.id || 0)
                        }}
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    )
}
export default DeleteRole;