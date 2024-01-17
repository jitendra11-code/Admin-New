import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";

function CustomeDialogBox({openDialog, handleClose, handleConfirmSubmit}) {
  return (
    <div>
      <Dialog
        open={openDialog}
        className="dialog-wrap"
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to Submit ?
          </DialogContentText>
        </DialogContent>
        <DialogActions className="button-wrap">
          <Button onClick={handleClose} className="no-btn">
            No
          </Button>
          <Button onClick={handleConfirmSubmit} className="yes-btn">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CustomeDialogBox;
