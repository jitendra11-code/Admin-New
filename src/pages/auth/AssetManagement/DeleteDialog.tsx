import React from 'react';
import { Button, Tooltip } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import { useDispatch } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { showMessage } from 'redux/actions';

const DeleteDialog = ({ params, id, transportVendor, setTransportVendor, installationVendor, setInstallationVendor, getTranportVendor }) => {
    const dispatch = useDispatch();
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        // setDel(false);
    };
    const handleRemove = () => {
        if (params?.data?.id == 0) {
            if (params?.data?.vendorCategory === 'Transport Vendor') {
                const trans = [...transportVendor];
                const filter = trans?.filter((item, index) => index !== params?.rowIndex);
                setTransportVendor(filter);
            } else if (params?.data?.vendorCategory === 'Installation Vendor') {
                const install = [...installationVendor];
                const filter = install?.filter((item, index) => index !== params?.rowIndex);
                setInstallationVendor([...filter]);
            }
            dispatch(showMessage('vendor deleted successfully'));
        } else {
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/AssetQuotation/RemoveAssetQuoteInputTransportVendorDetailsById?Id=${params?.data?.id}`)
                .then((response) => {
                    if (!response) return;
                    if (response) {
                        getTranportVendor(id);
                        dispatch(showMessage('vendor deleted successfully'));
                    }
                })
                .catch((err) => console.log('err'));
        }
    };
    return (
        <>
            <Tooltip title="Delete" className="actionsIcons">
                <DeleteIcon
                    fontSize="medium"
                    style={{
                        cursor: 'pointer',
                        fontSize: '20px',
                        color: '#000',
                    }}
                    onClick={() => setOpen(true)}
                />
            </Tooltip>

            <Dialog className="dialog-wrap" open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title" className="title-model">
                    Are you sure you want to delete ?
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
                    <Button className="yes-btn" onClick={handleRemove}>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeleteDialog;
