import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { TbPencil } from "react-icons/tb";
import { AiOutlineDelete } from "react-icons/ai";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { Tooltip } from "@mui/material";

const DenseTable = ({ data, editrow, deleterow, action }) => {
  const [open, setOpen] = React.useState(false);
  const [props, setProps] = React.useState({
    event: null,
    index: null,
    id: null,
  });
  const handleClickOpen = (e, ind, id) => {
    setOpen(true);
    setProps({ event: e, index: ind, id: id });
   
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <TableContainer
      component={Paper}
      style={{
        display:
          data === undefined || data?.length === undefined || data?.length === 0
            ? "none"
            : "",
            marginTop:"5px"
      }}
    >
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead style={{ background: "#f4f7fe" }}>
          <TableRow>
            <TableCell>Empaneled/Non Empaneled</TableCell>
            <TableCell>Vendor Category</TableCell>
            <TableCell align="left">Vendor Name Code</TableCell>
            <TableCell align="left">House Keeping Vendor Name</TableCell>
            <TableCell align="left">Contact No.</TableCell>
            <TableCell align="left">Alternate Contact No.</TableCell>
            <TableCell align="left">Email</TableCell>
            <TableCell align="left">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((row, ind) => (
            <>
              <TableRow
                key={ind}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row?.empaneled === true ? "Empaneled" : "Non Empaneled"}
                </TableCell>
                <TableCell component="th" scope="row">
                  {row?.vendorcategory}
                </TableCell>
                <TableCell align="left">
                  {row?.empaneled === true
                    ? row?.fk_VendorPartnerMaster_id
                    : row?.vendorname}
                </TableCell>
                <TableCell align="left">
                  {row?.houseKeeping_vendorname}
                </TableCell>
                <TableCell align="left">{row?.contactno}</TableCell>
                <TableCell align="left">{row?.alternate_contactno}</TableCell>
                <TableCell align="left">{row?.email}</TableCell>
                <TableCell align="left">
                  {action !== "Approve" && (
                    <div className="vendarIcon">
                      <Tooltip title="Edit" className="actionsIcons">
                        <button className="actionsIcons actions-icons-size">
                          <TbPencil onClick={(e) => editrow(ind, e)} />
                        </button>
                      </Tooltip>
                      <Tooltip title="Delete" className="actionsIcons">
                        <button
                          className="actionsIcons-delete actions-icons-size"
                          type="button"
                        >
                          <AiOutlineDelete
                            onClick={(e) => handleClickOpen(e, ind, row?.id)}
                          />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </TableCell>

              </TableRow>
              <Dialog
                open={open}
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
              >
                <DialogContent>
                  <DialogContentText id="alert-dialog-slide-description">
                    Are you sure you want delete this vendor?
                  </DialogContentText>
                </DialogContent>
                <DialogActions className="button-wrap">
                  <Button className="no-btn" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    className="yes-btn"
                    onClick={() => {
                      deleterow(props?.event, props?.index, props?.id);
                      handleClose();
                    }}
                  >
                    Yes
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default DenseTable;
