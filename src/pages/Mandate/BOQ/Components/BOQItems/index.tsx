import { Button, DialogContent, DialogContentText } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BOQItemHistory from "./Components/BOQItemHistory";
import React, { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import { primaryButtonSm } from "shared/constants/CustomColor";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { DialogActions, Tooltip } from "@mui/material";
import BOQForm from "./Components/BOQItem";
import axios from "axios";
import { fetchError, showMessage } from "redux/actions";
import moment from "moment";
import { useAuthUser } from "@uikit/utility/AuthHooks";

const BOQItems = ({
  isVendorSelected,
  approvalRole,
  mandateId,
  action,
  vendor,
  boqData,
  data,
  setData,
  getBOQSummary,
  setErrors,
  errors,
  setBOQData,
  boq,
  setBOQ,
  setVendor,
}) => {
  const [open, setOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [value, setValue] = React.useState<number>(0);
  let { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useAuthUser();
  const [crudType, setCrudType] = useState("");
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [editdeleteRow, setEditDeleteRow] = React.useState(null);
  const [editdeleteIndex, setEditDeleteIndex] = React.useState(null);

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  const handleClose = () => {
    let data = boqData?.filter(v=>v.item_Description);
    setBOQData(data);
    setOpen(false);
    setCrudType("");
    setEditDeleteRow(null);
    setEditDeleteIndex(0);
    getBOQData();
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setEditDeleteRow(null);
    setEditDeleteIndex(0);
    getBOQData();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const _editDeleteAction = (type, obj) => {
    var _index = obj?.rowIndex || 0;
    if (type === "edit") {
      setEditDeleteRow(obj?.data);
      setOpen(true);
      setEditDeleteIndex(_index);
    } else if (type === "delete") {
      setDeleteOpen(true);
      setEditDeleteIndex(_index);
      setEditDeleteRow(obj?.data);
    }
  };

  let columnDefs = [
    {
      field: "",
      headerName: "Actions",
      headerTooltip: "Actions",
      resizable: true,
      pinned: "left",
      width: 110,
      minWidth: 110,
      cellStyle: { fontSize: "13px", textAlign: "center" },
      cellRendererParams: {
        _editDeleteAction: _editDeleteAction,
      },

      cellRenderer: (params: any) => (
        <>
          <div className="actions">
            {(user?.role === "Vendor" ||
              (user?.role === "Project Manager" && action === "Amend BOQ")) && (
              <>
                <Tooltip title="Edit Item" className="actionsIcons">
                  <EditIcon
                    fontSize="medium"
                    style={{
                      cursor: "pointer",
                      fontSize: "20px",
                      color: "#000",
                    }}
                    onClick={(e) => {
                      params?._editDeleteAction("edit", params);
                    }}
                  />
                </Tooltip>
              </>
            )}
            {user?.role === "Vendor" && (
              <Tooltip title="Delete Item" className="actionsIcons">
                <DeleteIcon
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                    color: "#000",
                  }}
                  fontSize="medium"
                  onClick={(e) => {
                    params?._editDeleteAction("delete", params);
                  }}
                />
              </Tooltip>
            )}
            <BOQItemHistory props={params} />
          </div>
        </>
      ),
    },
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },
      sortable: true,
      resizable: true,
      width: 80,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },

    {
      field: "catelouge_Id",
      headerName: "Catalogue Id",
      headerTooltip: "Catalogue Id",
      sortable: true,
      resizable: true,
      width: 130,
      minWidth: 130,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    {
      field: "item_Description",
      headerName: "Item Description",
      headerTooltip: "Item Description",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    {
      field: "vendor_Code",
      headerName: "Vendor Code",
      headerTooltip: "Vendor Code",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    {
      field: "material_Code",
      headerName: "Material Code",
      headerTooltip: "Material Code",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    {
      field: "material_Category",
      headerName: "Material Category",
      headerTooltip: "Material Category",
      sortable: true,
      resizable: true,
      width: 200,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    {
      field: "specification",
      headerName: "SAP Description",
      headerTooltip: "SAP Description",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    {
      field: "rate",
      headerName: "Rate Per Unit",
      headerTooltip: "Rate Per Unit",
      sortable: true,
      resizable: true,
      width: 170,
      minWidth: 170,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    {
      field: "unit",
      headerName: "Unit of Measurement",
      headerTooltip: "Unit of Measurement",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      headerTooltip: "Quantity",
      sortable: true,
      resizable: true,
      width: 160,
      minWidth: 160,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    {
      field: "amount",
      headerName: "Amount",
      headerTooltip: "Amount",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    {
      field: "hsN_CODE",
      headerName: "HSN Code",
      headerTooltip: "HSN Code",
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    {
      field: "catalogue_Status",
      headerName: "Catalogue Status",
      headerTooltip: "Catalogue Status",
      sortable: true,
      resizable: true,
      width: 220,
      minWidth: 220,
      cellStyle: { fontSize: "13px" },
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
  ];

  const getBOQData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/BOQ/GetBOQDetails?mandateId=${
          mandateId?.id || 0
        }&boqId=${boq?.boqId || 0}&vendorId=${vendor?.vendorId || 0}`
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data && response?.data?.length > 0) {
          setBOQData(response?.data || []);
        } else {
          setBOQData([]);
        }
      })
      .catch((e: any) => {});
  };

  useEffect(() => {
    if (vendor?.vendorId && mandateId && mandateId?.id) getBOQData();
  }, [vendor?.vendorId, mandateId]);
  const addBOQItem = (index) => {
    var _data = [...boqData];
    var _addNewItem = {
      fk_BOQ_Id: boq?.boqId || 0,
      mandateId: 0,
      vendorId: 0,
      sequence: null,
      material_Category: "",
      catelouge_Id: "",
      item_Description: "",
      vendor_Code: "",
      specification: "",
      make: null,
      quantity: "",
      rate: "",
      unit: "",
      amount: "",
      material_Code: "",
      hsN_CODE: "",
      remarks: null,
      deliever_Qty: null,
      actual_Unit: null,
      actual_Make: null,
      size: null,
      work_Status: null,
      completion_Date: null,
      rating: null,
      sang_Priority: null,
      obvervation: null,
      vendor_Comments: null,
      auditor_Comments: null,
      is_Qty_Changed: null,
      new_Qty: null,
      previous_Qty: null,
      is_PO_required: null,
      excess_Amount: null,
      previous_rate: null,
      previous_amount: null,
      catalogue_Status: "",
      isAmmend: null,
      isDeleted: null,
      fk_BOQ_Item_Det_Id: 0,
      status: "Active",
      id: 0,
      uid: "",
    };
    _data[index] = _addNewItem;
    setBOQData(_data);
    handleOpen();
    setCrudType("add");
    setEditDeleteIndex(index);
  };
  const updateBOQItem = () => {
    var _data = [...boqData];
    var _updateJson;
    if (_data && _data?.length === 0) {
      return;
    }

    _updateJson = [
      {
        fk_BOQ_Id: _data[editdeleteIndex]?.fk_BOQ_Id || 0,
        mandateId: mandateId?.id || 0,
        vendorId: vendor?.vendorId || 0,
        sequence: _data[editdeleteIndex]?.sequence || 0,
        material_Category:
          _data[editdeleteIndex]?.material_Category?.formName || "",
        catelouge_Id: _data[editdeleteIndex]?.catelouge_Id || "",
        item_Description: _data[editdeleteIndex]?.item_Description || "",
        vendor_Code: _data[editdeleteIndex]?.vendor_Code || "",
        specification: _data[editdeleteIndex]?.specification || "",
        make: _data[editdeleteIndex]?.make || "",
        deliever_Qty: _data[editdeleteIndex]?.deliever_Qty || 0,
        quantity:
          (_data[editdeleteIndex]?.quantity &&
            parseInt(_data[editdeleteIndex]?.quantity)) ||
          0,
        rate:
          (_data[editdeleteIndex]?.rate &&
            parseFloat(_data[editdeleteIndex]?.rate)) ||
          0,
        previous_rate:
          (_data[editdeleteIndex]?.previous_rate &&
            parseInt(_data[editdeleteIndex]?.previous_rate)) ||
          0,
        unit: _data[editdeleteIndex]?.unit || "",
        amount:
          (_data[editdeleteIndex]?.amount &&
            parseFloat(_data[editdeleteIndex]?.amount)) ||
          0,
        previous_amount:
          (_data[editdeleteIndex]?.previous_amount &&
            parseInt(_data[editdeleteIndex]?.previous_amount)) ||
          0,
        material_Code: _data[editdeleteIndex]?.material_Code || "",
        hsN_CODE: _data[editdeleteIndex]?.hsN_CODE || "",
        remarks: _data[editdeleteIndex]?.remarks || "",
        actual_Unit: _data[editdeleteIndex]?.actual_Unit || "",
        actual_Make: _data[editdeleteIndex]?.actual_Make || "",
        size: _data[editdeleteIndex]?.size || "",
        work_Status: _data[editdeleteIndex]?.work_Status || "",
        completion_Date: moment().format("YYYY-MM-DDTHH:mm:ss.SSS") || "",
        rating: _data[editdeleteIndex]?.rating || "",
        sang_Priority: _data[editdeleteIndex]?.sang_Priority || "",
        obvervation: _data[editdeleteIndex]?.obvervation || "",
        vendor_Comments: _data[editdeleteIndex]?.vendor_Comments || "",
        auditor_Comments: _data[editdeleteIndex]?.auditor_Comments || "",
        is_Qty_Changed: _data[editdeleteIndex]?.is_Qty_Changed || false,
        new_Qty: _data[editdeleteIndex]?.new_Qty || 0,
        previous_Qty: _data[editdeleteIndex]?.previous_Qty || 0,
        is_PO_required: _data[editdeleteIndex]?.is_PO_required || false,
        excess_Amount: _data[editdeleteIndex]?.excess_Amount || 0,
        catalogue_Status: _data[editdeleteIndex]?.catalogue_Status || "",
        isAmmend: _data[editdeleteIndex]?.isAmmend || false,
        isDeleted: _data[editdeleteIndex]?.isDeleted || false,
        fk_BOQ_Item_Det_Id: _data[editdeleteIndex]?.fk_BOQ_Item_Det_Id || 0,
        status: _data[editdeleteIndex]?.status || "",
        id: _data[editdeleteIndex]?.id || 0,
        uid: "",
        createdby: user?.UserName,
        createddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        modifiedby: user?.UserName ,
        modifieddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      },
    ];

    if (action === "Amend BOQ") {
      var currentObj = _updateJson[0];
      _updateJson[0].isAmmend = true;
      _updateJson[0].previous_Qty =
        (currentObj?.previous_Qty && parseInt(currentObj?.previous_Qty)) || 0;
      _updateJson[0].quantity =
        (currentObj?.quantity && parseInt(currentObj?.quantity)) || 0;
      _updateJson[0].rate =
        (currentObj?.rate && parseFloat(currentObj?.rate)) || 0;
      _updateJson[0].previous_rate =
        (currentObj?.previous_rate && parseInt(currentObj?.previous_rate)) || 0;
      _updateJson[0].amount =
        (currentObj?.amount && parseFloat(currentObj?.amount)) || 0;
      _updateJson[0].previous_amount =
        (currentObj?.previous_amount &&
          parseInt(currentObj?.previous_amount)) ||
        0;
    }
    var errorFlag = _validateForm(_updateJson, false);
    if (errorFlag) return;

    if (_updateJson && _updateJson?.length > 0) {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/BOQ/UpdateBOQDetails`,
          _updateJson
        )
        .then((res) => {
          if (res) {
            dispatch(showMessage("Record is updated successfully!"));
            getBOQData();
            getBOQSummary();
          } else {
            dispatch(fetchError("Record is not updateded!"));
            return;
          }
          handleClose();
        })
        .catch((err) => {
          dispatch(fetchError("Error Ocurred !!!"));
        });
    }
  };
  const _validateForm = (data, create) => {
    var _data;
    var item = null;
    var errorFlag = false;
    _data = create ? data[editdeleteIndex] : data[0];
    if (_data === undefined) {
      dispatch(fetchError("Please fill all mandatory fields !!!"));
      return errorFlag;
    }
    item = _data || null;
    if (item === null) {
      dispatch(fetchError("Please fill all mandatory fields !!!"));
      return errorFlag;
    }
    if (
      item?.catalogue_Status === "" ||
      item?.catelouge_Id === "" ||
      item?.item_Description === "" ||
      item?.vendor_Code === "" ||
      item?.specification === "" ||
      item?.quantity === 0 ||
      item?.rate === 0 ||
      item?.unit === "" ||
      item?.amount === 0 ||
      item?.hsN_CODE === "" ||
      item?.material_Category === ""
    ) {
      errorFlag = true;
    }
    if (errorFlag) {
      dispatch(fetchError("Please fill all mandatory fields !!!"));
      return errorFlag;
    }
    return errorFlag;
  };

  const createBOQ = () => {
    var _data = [...boqData];
    var _createJson;
    if (_data && _data?.length === 0) {
      return;
    }
    _createJson =
      _data &&
      _data?.map((item) => {
        return {
          ...item,
          fk_BOQ_Id: boq?.boqId || 0,
          mandateId: mandateId?.id || 0,
          vendorId: vendor?.vendorId || 0,
          sequence: item?.sequence || 0,
          material_Category: item?.material_Category?.formName || "",
          catelouge_Id: item?.catelouge_Id || "",
          item_Description: item?.item_Description || "",
          vendor_Code: item?.vendor_Code || "",
          specification: item?.specification || "",
          make: item?.make || "",
          deliever_Qty: item?.deliever_Qty || 0,
          quantity: (item?.quantity && parseInt(item?.quantity)) || 0,
          previous_rate: (item?.rate && parseInt(item?.rate)) || 0,
          rate: (item?.rate && parseFloat(item?.rate)) || 0,
          unit: item?.unit || "",
          amount: (item?.amount && parseFloat(item?.amount)) || 0,
          previous_amount: (item?.amount && parseInt(item?.amount)) || 0,
          material_Code: item?.material_Code || "",
          hsN_CODE: item?.hsN_CODE || "",
          remarks: item?.remarks || "",
          actual_Unit: item?.actual_Unit || "",
          actual_Make: item?.actual_Make || "",
          size: item?.size || "",
          work_Status: item?.work_Status || "",
          completion_Date: moment().format("YYYY-MM-DDTHH:mm:ss.SSS") || "",
          rating: item?.rating || "",
          sang_Priority: item?.sang_Priority || "",
          obvervation: item?.obvervation || "",
          vendor_Comments: item?.vendor_Comments || "",
          auditor_Comments: item?.auditor_Comments || "",
          is_Qty_Changed: item?.is_Qty_Changed || false,
          new_Qty: item?.new_Qty || 0,
          previous_Qty: item?.quantity,
          is_PO_required: item?.is_PO_required || false,
          excess_Amount: item?.excess_Amount || 0,
          catalogue_Status: item?.catalogue_Status || "",
          isAmmend: item?.isAmmend || false,
          isDeleted: item?.isDeleted || false,
          fk_BOQ_Item_Det_Id: item?.fk_BOQ_Item_Det_Id || 0,
          status: item?.status || "",
          id: item?.id || 0,
          uid: "",
          createdby: user?.UserName,
          createddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          modifiedby: user?.UserName,
          modifieddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        };
      });
    if (action === "Amend BOQ") {
      _createJson[editdeleteIndex].isAmmend = true;
    }
    var errorFlag = _validateForm(_createJson, true);
    if (errorFlag) return;

    if (_createJson && _createJson?.length > 0) {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/BOQ/CreateBOQDetails`,
          _createJson
        )
        .then((res) => {
          if (!res) {
            dispatch(fetchError("Record is not created!"));
            handleClose();
            return;
          }
          if (res?.data) {
            dispatch(showMessage("Record is created successfully!"));
            getBOQSummary();
          } else {
            dispatch(fetchError("Record is not created!"));
            handleClose();
            return;
          }
          handleClose();
        })
        .catch((err) => {
          dispatch(fetchError("Error Ocurred !!!"));
        });
    }
  };
  const deleteBOQItem = () => {
    var _data = [...boqData];
    var formData: any = new FormData();

    var _deleteJson;
    if (_data && _data?.length === 0) {
      return;
    }
    var deleteItemId = editdeleteRow?.id;
    formData.append("id", deleteItemId);
    if (deleteItemId !== 0) {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/BOQ/DeleteBOQDetails`,
          formData
        )
        .then((res) => {
          if (res?.data?.code === 200) {
            dispatch(showMessage("Record is deleted successfully!"));
         
            getBOQSummary();
          } else {
            dispatch(fetchError("Record is not deleted!"));
            return;
          }
          handleDeleteClose();
        })
        .catch((err) => {
          dispatch(fetchError("Error Ocurred !!!"));
        });
    }
  };

  return (
    <>
    
      {(user?.role === "Vendor" ||
        (user?.role === "Project Manager" && action === "Amend BOQ")) && (
        <div style={{ marginTop: "10px" }}>
          <Button
            size="small"
            style={primaryButtonSm}
            sx={{ color: "#fff", fontSize: "12px" }}
            onClick={(e: any) => {
              e.preventDefault();
              var _index = boqData && boqData?.length;
              _index = _index + 1 || 0;
              _index = _index - 1;
              addBOQItem(_index || 0);
            }}
          >
            {" "}
            Add Item
          </Button>
        </div>
      )}
      <div
        className="grid-height"
        style={{ height: "250px", marginTop: "10px", marginBottom: "10px" }}
      >
        {(approvalRole ? isVendorSelected?.length > 0 ? true : false : true) && 
        <CommonGrid
          defaultColDef={{ flex: 1 }}
          rowHeight={40}
          columnDefs={columnDefs}
          rowData={boqData?.filter(v=>v?.item_Description) || []}
          onGridReady={onGridReady}
          gridRef={gridRef}
          pagination={boqData?.length > 3 ? true : false}
          paginationPageSize={3}
        />
}
      </div>

      <Dialog
        fullWidth
        maxWidth="xl"
        open={open}
        onClose={handleClose}
      >
        <DialogTitle style={{ paddingRight: 20, fontSize: 16, color: "#000" }}>
          Add Item
        </DialogTitle>
        <BOQForm
          open={open}
          editdeleteIndex={editdeleteIndex}
          crudType={crudType}
          setEditDeleteIndex={setEditDeleteIndex}
          editdeleteRow={editdeleteRow}
          setEditDeleteRow={setEditDeleteRow}
          setOpen={setOpen}
          boqData={boqData}
          setBOQData={setBOQData}
        />

        <DialogActions className="button-wrap">
          <Button
            onClick={(e) => {
              e.preventDefault();
              if (vendor?.vendorId === undefined) {
                dispatch(fetchError("Please select at least one vendor"));
                return;
              }
              if (mandateId && mandateId?.id === undefined) {
                dispatch(fetchError("Mandate Selection is required"));
                return;
              }
              if (crudType && crudType === "add") {
                createBOQ();
              } else {
                updateBOQItem();
              }
            }}
            className="yes-btn"
          >
            Save
          </Button>
          <Button className="yes-btn" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        className="dialog-wrap"
        open={deleteOpen}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="title-model">
          Delete Item
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure want to delete record?
          </DialogContentText>
        </DialogContent>
        <DialogActions className="button-wrap">
          <Button
            className="yes-btn"
            onClick={(e) => {
              e.preventDefault();
              deleteBOQItem();
            }}
          >
            Yes
          </Button>
          <Button
            className="no-btn"
            onClick={() => {
              handleDeleteClose();
            }}
            autoFocus
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default memo(BOQItems);
