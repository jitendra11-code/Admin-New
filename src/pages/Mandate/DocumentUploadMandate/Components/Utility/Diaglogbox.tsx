import React from 'react';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DialogActions } from '@mui/material';
import { Tooltip } from "@mui/material";
const FileNameDiaglogList = ({ props }) => {
    const [open, setOpen] = React.useState(false)
    const handleClose = () => {
        setOpen(false)
    };
    const handleOpen = () => {
        setOpen(true)
    }


    return (
        <>
            <Tooltip title="View" className="actionsIcons">
                <VisibilityIcon style={{ fontSize: "15px" }}
                    onClick={handleOpen}
                    className="actionsIcons" />
            </Tooltip>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle style={{ fontSize: 16, fontWeight: 600, color: "#000" }}>Download data includes following files</DialogTitle>
                <List sx={{ pl: 2 }}>
                    {props &&
                        props?.data?.fileList ?
                        props?.data?.fileList?.length > 0 &&
                        props?.data?.fileList.map((item) => (
                            <ListItem>
                                <ListItemText primary={item?.filename || "123"} />
                            </ListItem>
                        )) : <ListItem>
                        <ListItemText primary={props?.data?.filename} />
                    </ListItem>}

                </List>
                <DialogActions className="button-wrap" >
                    <Button className="yes-btn" onClick={handleClose}>OK</Button>

                </DialogActions>
            </Dialog>
        </>
    );
}
export default FileNameDiaglogList;