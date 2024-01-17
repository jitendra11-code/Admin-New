import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { AiOutlineDelete } from "react-icons/ai";
import FileUploadAction from "./Actions/FileUpload";
import DialogDelete from "./Actions/DialogDelete";
import { Tooltip } from "@mui/material";
import FileDownloadList from "./Actions/FileDownloadAction";
import { TbPencil } from "react-icons/tb";
import moment from "moment";

const DenseTable = ({
  data,
  editrow,
  getData,
  setTableData,
  deleterow,
  formData,
  mandateId,
  setFormData,
}) => {
  const [del, setDel] = React.useState(false);
  const [prop, setProp] = React.useState({ index: 0, id: 0, event: 0 });
  const handleDelete = (ind, id, e) => {
    e.preventDefault();
    setDel(true);
    setProp({ index: ind, id: id, event: e });
  };
  return (
    <>
      {del && (
        <DialogDelete
          del={del}
          setDel={setDel}
          prop={prop}
          deleterow={deleterow}
        />
      )}
      <TableContainer
        component={Paper}
        style={{
          display:
            data === undefined ||
              data?.length === undefined ||
              data?.length === 0
              ? "none"
              : "",
        }}
      >
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead style={{ background: "#f4f7fe" }}>
            <TableRow>
              <TableCell>Vendor Category</TableCell>
              <TableCell align="left">Vendor Name Code</TableCell>
              <TableCell align="left">PO Number</TableCell>
              <TableCell align="left">PO Release Date</TableCell>
              <TableCell align="left">PO Amount</TableCell>
              <TableCell align="left">Remarks</TableCell>
              <TableCell align="left">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data &&
              data?.length > 0 &&
              data?.map((row, ind) => (
                <TableRow
                  key={ind}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row?.vendor_category}
                  </TableCell>
                  <TableCell align="left">{row?.vendor_name}</TableCell>
                  <TableCell align="left">{row?.po_number}</TableCell>
                  <TableCell align="left">
                    {moment(row?.po_release_date).isValid() &&
                      moment(row?.po_release_date).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell align="left">{row?.po_amount}</TableCell>
                  <TableCell align="left">{row?.remarks}</TableCell>
                  <TableCell align="left">
                    <div className="vendarIcon">
                      {!window.location.pathname?.includes("quality-po") && <>  <Tooltip title="Edit" className="actionsIcons">
                        <button className="actionsIcons actions-icons-size">
                          <TbPencil onClick={(e) => editrow(ind, e)} />
                        </button>
                      </Tooltip>
                        <Tooltip title="Delete" className="actionsIcons">
                          <button className="actionsIcons actions-icons-size">
                            <AiOutlineDelete
                              onClick={(e) => handleDelete(ind, row?.id, e)}
                            />
                          </button>
                        </Tooltip>
                        <FileUploadAction
                          mandateId={mandateId}
                          formData={formData}
                          getData={getData}
                          tableData={data}
                          index={ind}
                          selectedItem={row}
                          setTableData={setTableData}
                          setFormData={setFormData}
                        /></>}
                      <FileDownloadList
                        props={row}
                        mandate={mandateId}
                        setTableData={setTableData}
                        setFormData={setFormData}
                      />
                    </div>
                  </TableCell>

                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
export default DenseTable;
