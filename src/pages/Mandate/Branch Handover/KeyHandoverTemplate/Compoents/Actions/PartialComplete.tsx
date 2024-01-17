import React, { useState } from "react";
import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch } from "react-redux";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { regExpressionRemark, textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";

const ParticalComplete = ({
  actionWF = "",
  setActionWF = null,
  remark,
  setRemark,
  approved,
  rejected,
  sendBack,
  setSendBack,
  approveEvent,
  rejectEvent,
  sentBackEvent,
  setRejected,
  setApproved,
}) => {
  const dispatch = useDispatch();
  const [checkBox, setCheckBox] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [actionString, setActionString] = React.useState("");
  const { user } = useAuthUser();
  const handleClickOpen = () => {
    setOpen(true);
  };
  let path = window.location.pathname?.split("/");
  let modulePath: any = window.location.pathname?.split("/")[path.length - 1];

  const handleClose = () => {
    setCheckBox(false);
    setActionWF("");
    setOpen(false);
    setSendBack(false);
    setRejected(false);
    setApproved(false);
  };

  const _getAlertMessafeOfDiaglog = () => {
    if (actionString === "A") {
      return "Are you sure you want to approve?";
    } else if (actionString === "S") {
      return "Are you sure you want to approve with partial completed?";
    }
    return "Are you sure you want to reject?";
  };
  const _getTitleOfDiaglog = () => {
    if (actionString === "A") {
      return "Approve";
    }
    if (actionString === "S") {
      return "Approve";
    }
    return "Reject";
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
              } else if (rejected) {
                rejectEvent();
                setOpen(false);
                dispatch(showMessage("Rejected Successfully!"));
              } else if (sendBack) {
                sentBackEvent();
                setOpen(false);
                dispatch(
                  showMessage("Partial Complete action completed Successfully!")
                );
              }
            }}
          >
            Yes
          </Button>
          <Button
            className="no-btn"
            onClick={() => {
              setOpen(false);
              setRejected(false);
              setSendBack(false);
              setApproved(false);
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
        // multiline
        error={!remark}
        onChange={(e) => setRemark(e?.target?.value)}
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
          if (remark !== "") {
            setRejected(!rejected);
            setActionString("R");
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
        Partial Complete
      </Button>
    </>
  );
};

export default ParticalComplete;
