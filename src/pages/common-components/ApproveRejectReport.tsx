import React from "react";
import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch } from "react-redux";
import { textFieldValidationOnPaste, regExpressionRemark } from "@uikit/common/RegExpValidation/regForTextField";
const ApproveAndRejectAction = ({
  remark,
  setRemark,
  approved,
  sendBack,
  approveEvent,
  sentBackEvent,
  setSendBack,
  setApproved,
  rejectEvent,
  setRejected,
  rejected,
}) => {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [openReject, setOpenReject] = React.useState(false);
  const [actionString, setActionString] = React.useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setApproved(false);
    setSendBack(false);
  };
  const handleCloseReject = () => {
    setOpenReject(false);
    setRejected(false);
  };
  const _getAlertMessafeOfDiaglog = () => {
    if (actionString === "A") {
      return "Are you sure you want to approve?";
    }
    return "Are you sure you want to send back?";
  };
  const _getTitleOfDiaglog = () => {
    if (actionString === "A") {
      return "Approve";
    }
    return "Send Back";
  };

  return (
    <>
      <Dialog
        className="dialog-wrap"
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="title-model">
          {_getTitleOfDiaglog()}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {_getAlertMessafeOfDiaglog()}
          </DialogContentText>
        </DialogContent>
        <DialogActions className="button-wrap">
          <Button
            className="yes-btn"
            onClick={() => {
              if (approved) {
                setOpen(false);
                dispatch(showMessage("Approved Successfully!"));
                approveEvent();
              } else {
                sentBackEvent();
                setOpen(false);
              }
            }}
          >
            Yes
          </Button>
          <Button
            className="no-btn"
            onClick={() => {
              setOpen(false);
              setSendBack(false);
              setApproved(false);
            }}
            autoFocus
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        className="dialog-wrap"
        open={openReject}
        onClose={handleCloseReject}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="title-model">
          Reject
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to reject
          </DialogContentText>
        </DialogContent>

        <DialogActions className="button-wrap">
          <Button
            className="yes-btn"
            onClick={() => {
              if (rejected) {
                setOpenReject(false);
                dispatch(showMessage("Rejected Successfully!"));
                rejectEvent();
              } else {
                sentBackEvent();
                dispatch(showMessage("Send back Successfully!"));
                setOpenReject(false);
              }
            }}
          >
            Yes
          </Button>
          <Button
            className="no-btn"
            onClick={() => {
              setOpenReject(false);
              setSendBack(false);
              setRejected(false);
            }}
            autoFocus
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
      <TextField
          autoComplete="off"
          name="remark"
          id="remark"
          style={{ marginRight: "10px" }}
          variant="outlined"
          size="small"
          placeholder="Remark"
          value={remark}
          error={!remark}
          onChange={(e) => setRemark(e?.target?.value)}
          InputProps={{ inputProps: { maxLength: 150 } }}
          onKeyDown={(e: any) => {
            if (e.target.selectionStart === 0 && e.code === "Space") {
              e.preventDefault();
            }
            regExpressionRemark(e);
          }}
          onPaste={(e: any) => {
            if (!textFieldValidationOnPaste(e)) {
              dispatch(fetchError("You can not paste Spacial characters"))
            }
          }}
        />

      <Button
        variant="outlined"
        size="medium"
        onClick={() => {
          if (remark !== "") {
            setApproved(!approved);
            setActionString("A");
            setOpen(true);
          } else {
            dispatch(fetchError("Please enter Remark"));
          }
        }}
        style={{
          padding: "2px 20px",
          borderRadius: 6,
          color: "#fff",
          borderColor: "#00316a",
          minWidth: "100px",
          marginRight: "10px",
          backgroundColor: "#00316a",
        }}
      >
        {window.location.pathname?.includes("initiate-LOI")
          ? "Accept"
          : "Approve"}
      </Button>
      <Button
        variant="outlined"
        size="medium"
        onClick={() => {
          setRejected(!rejected);
          setActionString("A");
          setOpenReject(true);
        }}
        style={{
          padding: "2px 20px",
          borderRadius: 6,
          color: "#fff",
          borderColor: "#00316a",
          minWidth: "100px",
          marginRight: "10px",
          backgroundColor: "#00316a",
        }}
      >
        Reject
      </Button>
      <Button
        variant="outlined"
        size="medium"
        onClick={() => {
          if (remark !== "") {
            setSendBack(!sendBack);
            setActionString("S");
            setOpen(true);
          } else {
            dispatch(fetchError("Please enter Remark"));
          }
        }}
        style={{
          padding: "2px 20px",
          borderRadius: 6,
          color: "#00316a",
          borderColor: "#00316a",
          minWidth: "100px",
          marginRight: "10px",
        }}
      >
        Send Back
      </Button>
    </>
  );
};

export default ApproveAndRejectAction;
