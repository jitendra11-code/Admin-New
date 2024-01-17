import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import axios from "axios";
import moment from "moment";

const DenseTable = ({ mandateId, pathName, setInfo = null }) => {
  const [data, setData] = React.useState([]);

  const getData = () => {
    if (mandateId !== null && mandateId !== "noid") {
      axios
        .get(
          `${process.env.REACT_APP_BASEURL}/api/Workflow/GetHistory?mandateId=${mandateId}&url=${pathName == "phase-approval-note-view" ?"phase-approval-note" : pathName }`
        )
        .then((response) => {
          setData(response?.data);
          setInfo(response?.data);
        })
        .catch((err) => { });
    }
  };

  React.useEffect(() => {
    getData();
  }, [mandateId]);
  return (
    <>
      {data && data?.length > 0 && (
        <TableContainer
          component={Paper}
          style={{
            display:
              data?.length !== undefined && data?.length === 0 ? "none" : "",
          }}
        >
          <Table
            className="approval-history-table"
            sx={{ minWidth: 650 }}
            size="small"
            aria-label="a dense table"
          >
            <TableHead style={{ background: "#f4f7fe" }}>
              <TableRow>
                <TableCell>Role Name</TableCell>
                <TableCell align="left">User Name</TableCell>
                <TableCell align="left">Status</TableCell>
                <TableCell align="left">Remarks</TableCell>
                <TableCell align="left">Action On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="t-body">
              {data &&
                data?.length > 0 &&
                data?.map((row, ind) => (
                  <TableRow
                    key={ind}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell
                      component="th"
                      style={{ width: "17%" }}
                      scope="row"
                    >
                      {row?.roleName || ""}
                    </TableCell>
                    <TableCell style={{ width: "12%" }} align="left">
                      {row?.userName || ""}
                    </TableCell>
                    <TableCell style={{ width: "12%" }} align="left">
                      {row?.status || ""}
                    </TableCell>
                    <TableCell align="left">{row?.remarks}</TableCell>
                    <TableCell style={{ width: "15%" }} align="left">
                      {moment(row.createdon).format("DD/MM/YYYY HH:mm:ss")}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};
export default DenseTable;
