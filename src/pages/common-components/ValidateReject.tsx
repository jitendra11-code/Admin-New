import React from 'react';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { fetchError, showMessage } from 'redux/actions';
import { useDispatch } from 'react-redux';
import regExpressionTextField, { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';
const ApproveAndRejectAction = ({ remark, setRemark, approved, sendBack, approveEvent, sentBackEvent, setSendBack, setApproved }) => {
    const dispatch = useDispatch();
    const [open, setOpen] = React.useState(false);
    const [actionString, setActionString] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setApproved(false);
        setSendBack(false);
    };

    const _getAlertMessafeOfDiaglog = () => {
        if (actionString === 'A') {
            return 'Are you sure you want to approve?';
        } else if (actionString === 'S') {
            return 'Are you sure you want to send back?';
        }
    };
    const _getTitleOfDiaglog = () => {
        if (actionString === 'A') {
            return 'Approve';
        } else if (actionString === 'S') {
            return 'Send Back';
        }
    };
    return (
        <>
            <div>
                <Dialog className="dialog-wrap" open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title" className="title-model">
                        {_getTitleOfDiaglog()}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">{_getAlertMessafeOfDiaglog()}</DialogContentText>
                    </DialogContent>
                    <DialogActions className="button-wrap">
                        <Button
                            className="yes-btn"
                            onClick={() => {
                                if (approved) {
                                    setOpen(false);
                                    approveEvent();
                                    dispatch(showMessage('Approved Successfully!'));
                                }
                                if (sendBack) {
                                    setOpen(false);
                                    dispatch(showMessage('Send back Successfully!'));
                                    sentBackEvent();
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
                <TextField
                    autoComplete="off"
                    name="remark"
                    id="remark"
                    style={{ marginRight: '10px' }}
                    variant="outlined"
                    size="small"
                    placeholder="Remark"
                    value={remark}
                    error={!remark}
                    onChange={(e) => setRemark(e?.target?.value)}
                    InputProps={{ inputProps: { maxLength: 150 } }}
                    onKeyDown={(e: any) => {
                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                            e.preventDefault();
                        }
                        regExpressionRemark(e);
                    }}
                    onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                            dispatch(fetchError('You can not paste Spacial characters'));
                        }
                    }}
                />

                <Button
                    variant="outlined"
                    size="medium"
                    onClick={() => {
                        if (remark !== '') {
                            setApproved(true);
                            setActionString('A');
                            setOpen(true);
                        } else {
                            dispatch(fetchError('Please enter Remark'));
                        }
                    }}
                    style={{
                        padding: '5px 20px',
                        borderRadius: 6,
                        color: '#fff',
                        borderColor: '#00316a',
                        minWidth: '100px',
                        marginRight: '10px',
                        backgroundColor: '#00316a',
                    }}
                >
                    Validate
                </Button>
                <Button
                    variant="outlined"
                    size="medium"
                    onClick={() => {
                        if (remark !== '') {
                            setSendBack(true);
                            setActionString('S');
                            setOpen(true);
                        } else {
                            dispatch(fetchError('Please enter Remark'));
                        }
                    }}
                    style={{
                        padding: '5px 20px',
                        borderRadius: 6,
                        color: '#00316a',
                        borderColor: '#00316a',
                        minWidth: '100px',
                        marginRight: '10px',
                    }}
                >
                    Reject
                </Button>
            </div>
        </>
    );
};

export default ApproveAndRejectAction;
