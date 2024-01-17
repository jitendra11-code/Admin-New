import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const DenseTable = () => {
  return (
    <>
      <TableContainer
        component={Paper}
     
      >
        <Table
          className="approval-history-table"
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="a dense table"
        >
          <TableHead style={{ background: "#f4f7fe" }}>
            <TableRow>
              <TableCell>Vendor Name</TableCell>
              <TableCell align="left">Main Entrance</TableCell>
              <TableCell align="left">Cashier Cabin</TableCell>
              <TableCell align="left">Visitor Area</TableCell>
              <TableCell align="left">Reaception</TableCell>
              <TableCell align="left">Electrical room</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="t-body">
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" style={{ width: "17%" }} scope="row">
                AAA
              </TableCell>
              <TableCell style={{ width: "12%" }} align="left">
                BBB
              </TableCell>
              <TableCell style={{ width: "12%" }} align="left">
                CCC
              </TableCell>
              <TableCell align="left">DDD</TableCell>
              <TableCell style={{ width: "15%" }} align="left">
                EEE
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
export default DenseTable;
