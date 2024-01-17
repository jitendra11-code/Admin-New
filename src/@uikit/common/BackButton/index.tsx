import { IconButton } from '@mui/material'
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
    let navigate = useNavigate();
    return (
        <div>
            <IconButton size="small" disableRipple
                sx={{ color: "#000000", cursor: "pointer", padding: "10px 0px 0px 15px !important", justifyContent: "flex-start", paddingLeft: '5px', paddingTop: 15 }}
                color="primary" onClick={() => {
                    navigate(-1)
                }} >
                <ArrowBackIcon />
            </IconButton>
        </div>
    )
}
export default BackButton;