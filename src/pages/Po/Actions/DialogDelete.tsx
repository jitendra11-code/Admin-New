import React from "react";
import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import { useDispatch } from "react-redux";

const DeletePoDialog = ({ del, setDel, prop, deleterow }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDel(false);
  };
  const handleDelete = () => {
    deleterow(prop?.index, prop?.id, prop?.event);
    setOpen(false);
    setDel(false);
  };
  return (
    <>
      <Dialog
        className="dialog-wrap"
        open={open || del}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="title-model">
          Are you sure you want to delete this PO ?
        </DialogTitle>
        <DialogActions className="button-wrap">
          <Button
            className="no-btn"
            onClick={() => {
              handleClose();
            }}
          >
            Cancel
          </Button>
          <Button className="yes-btn" onClick={handleDelete}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeletePoDialog;
