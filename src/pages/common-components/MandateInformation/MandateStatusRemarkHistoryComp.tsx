import React, { useState } from "react";
import { Typography, IconButton, Tooltip } from "@mui/material";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import HistoryIcon from "@mui/icons-material/History";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import "./style.css";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Timeline from "../Timeline";
import SummaryDetailsPopOP from "../SummaryPopUp";
const MandateStatusHistory = ({
  mandateCode,
  accept_Reject_Remark = "",
  accept_Reject_Status = "",
}) => {
  const text = accept_Reject_Remark;
  const [isReadMore, setIsReadMore] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDrawer2, setOpenDrawer2] = useState(false);
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };

  return (
    <>
      <TableContainer>
        <Table
          sx={{ minWidth: 650 }}
          aria-label="simple table"
          className="mandate-table"
        >
          <TableHead>
            <TableRow>
              <TableCell align="left" style={{ width: "300px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "start",
                  }}
                >
                  <Typography
                    className="mandateInfoLableStatus"
                    variant="h2"
                    color="inherit"
                    noWrap
                  >
                    Current Status:&nbsp;&nbsp;&nbsp;
                  </Typography>{" "}
                  <Typography
                    variant="h2"
                    color="inherit"
                    noWrap
                    style={{ fontSize: "13px" }}
                    align="right"
                  >
                    {accept_Reject_Status}
                  </Typography>
                </div>
              </TableCell>
              <TableCell align="left">
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "start",
                  }}
                >
                  <Typography
                    align="left"
                    variant="h2"
                    color="inherit"
                    noWrap
                    className="mandateInfoLableStatus"
                  >
                    {" "}
                    Current Remark:&nbsp;&nbsp;&nbsp;{" "}
                  </Typography>
                  <Typography
                    variant="h2"
                    color="inherit"
                    noWrap
                    style={{ fontSize: "13=x" }}
                    align="right"
                  >
                    {" "}
                    <p className="text">
                      {isReadMore && text?.length > 150
                        ? text?.slice(0, 150)
                        : text}
                      {text?.length > 150 && (
                        <span onClick={toggleReadMore} className="read-or-hide">
                          {isReadMore ? "...read more" : " show less"}
                        </span>
                      )}
                    </p>
                  </Typography>
                </div>
              </TableCell>
           
              <TableCell align="right">
                {" "}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "end",
                  }}
                >
                  <IconButton
                    aria-label="close"
                    onClick={(e) => {
                      setOpenDrawer(!openDrawer);
                    }}
                    size="small"
                  >
                    {" "}
                    <Tooltip id="button-report" title="History">
                      <HistoryIcon />
                    </Tooltip>
                  </IconButton>
                </div>
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>
      <SwipeableDrawer
        anchor={"right"}
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
        anchor={"right"}
        open={openDrawer}
        onClose={(e) => {
          setOpenDrawer(!openDrawer);
        }}
        onOpen={(e) => {
          setOpenDrawer(!openDrawer);
        }}
      >
        <Timeline mandateCode={mandateCode} />
      </SwipeableDrawer>
    </>
  );
};
export default MandateStatusHistory;
