import {
  DialogActions,
  Dialog,
  DialogContent,
  DialogContentText,
  Tooltip, Button
} from "@mui/material";
import React from "react"
import { AiOutlineDelete } from "react-icons/ai";

const DeleteDraftPropertiesDialog = ({
  params,
  setDeleteModal,
  open,
  deletePropertyInDraft,
  handleClose,
}) => {
  return (
    <div>
     
      <Dialog
        open={open}
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want delete this property?
          </DialogContentText>
        </DialogContent>
        <DialogActions className="button-wrap">
          <Button className="no-btn" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="yes-btn"
            onClick={() => {
              deletePropertyInDraft(params?.data?.id || 0);
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default DeleteDraftPropertiesDialog;
