import React, { useState } from 'react';
import { Typography, IconButton, Tooltip } from '@mui/material';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import './style.css';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import BranchMasterTimeline from './BranchMasterTimeline';
import SummaryDetailsPopOP from '../SummaryPopUp';
const BranchMasterStatusHistory = ({ id, accept_Reject_Remark = '', accept_Reject_Status = '' }) => {
    const text = accept_Reject_Remark;
    const [isReadMore, setIsReadMore] = useState(true);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openDrawer2, setOpenDrawer2] = useState(false);
    const toggleReadMore = () => {
        setIsReadMore(!isReadMore);
    };

    return (
        <>
            <div>
                <IconButton
                    aria-label="close"
                    onClick={(e) => {
                        setOpenDrawer(!openDrawer);
                    }}
                    size="small"
                >
                    <Tooltip id="button-report" title="History">
                        <HistoryIcon />
                    </Tooltip>
                </IconButton>
            </div>

            <SwipeableDrawer
                anchor={'right'}
                open={openDrawer2}
                onClose={(e) => {
                    setOpenDrawer2(!openDrawer2);
                }}
                onOpen={(e) => {
                    setOpenDrawer2(!openDrawer2);
                }}
            >
                <SummaryDetailsPopOP />
            </SwipeableDrawer>

            <SwipeableDrawer
                anchor={'right'}
                open={openDrawer}
                onClose={(e) => {
                    setOpenDrawer(!openDrawer);
                }}
                onOpen={(e) => {
                    setOpenDrawer(!openDrawer);
                }}
            >
                <BranchMasterTimeline id={id} />
            </SwipeableDrawer>
        </>
    );
};
export default BranchMasterStatusHistory;
