import * as React from 'react';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { Popover } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton } from '@mui/material';

export default function MenuListComposition() {
    const [anchorEl, setAnchorEl] = React.useState<null>(null);

    const handleClick = (event: any) => {
        setAnchorEl(event?.currentTarget);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const handleClose = () => {
        setAnchorEl(null);
    };



    return (<>
        <IconButton

            aria-label="more"
            aria-haspopup="true"
            disableRipple sx={{ padding: 0, color: '#00316A' }}
            size="small"
            onClick={(e: any) => { handleClick(e) }}>
            <MoreVertIcon />
        </IconButton>
        <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}

            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}>

            <Paper>
                <MenuList
                    autoFocusItem={open}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                >
                    <MenuItem key="profile" onClick={handleClose}>Add Mandate</MenuItem>
                    <MenuItem key="profile2" onClick={handleClose}>Update Mandate</MenuItem>
                    <MenuItem key="profile3" onClick={handleClose}>Cancel Mandate</MenuItem>
                </MenuList>
            </Paper>
        </Popover>
    </>
    );
}