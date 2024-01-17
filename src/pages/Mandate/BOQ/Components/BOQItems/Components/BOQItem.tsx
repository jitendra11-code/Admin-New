import {
  TextField,
  Grid,
  Autocomplete,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import blockInvalidChar from "pages/Mandate/Location/Components/blockInvalidChar ";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
import regExpressionTextField, { regExpressionRemark, textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";

const BOQForm = ({
  boqData,
  setBOQData,
  open,
  setOpen,
  editdeleteRow,
  setEditDeleteRow,
  editdeleteIndex,
  setEditDeleteIndex,
  crudType,
}) => {
  const [materialCategoryData, setMaterialCategoryData] = useState([]);

  const getMaterialCategory = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Material Category`
      )
      .then((res) => {
        if (res && res?.data && res?.data?.length > 0) {
          setMaterialCategoryData(res?.data);
        } else {
          setMaterialCategoryData([]);
        }
      })
      .catch((err) => { });
  };
  useEffect(() => {
    getMaterialCategory();
  }, []);

  useEffect(() => {
    var _boqItem = [...boqData];
    var obj = null;
    var matCategoryValue = _boqItem[editdeleteIndex]["material_Category"];
    if (
      materialCategoryData &&
      materialCategoryData?.length > 0 &&
      matCategoryValue !== ""
    ) {
      obj =
        materialCategoryData &&
        materialCategoryData?.find(
          (item) =>
            item?.formName?.toUpperCase() === matCategoryValue?.toUpperCase()
        );
      _boqItem[editdeleteIndex]["material_Category"] = obj || null;
      setBOQData(_boqItem);
    }
  }, [materialCategoryData, setMaterialCategoryData]);
  const _calculateAmount = (e) => {
    var _boqItem = [...boqData];
    var _amount = 0;
    var _qty = _boqItem?.[editdeleteIndex]?.quantity;
    var _rateperUnit = e?.target?.value;
    _amount = _rateperUnit * _qty;
    _boqItem[editdeleteIndex]["amount"] = _amount;
    setBOQData(_boqItem);
  };
  const dispatch = useDispatch();
  const _calculateAmountByQty = (e) => {
    var _boqItem = [...boqData];
    var _amount = 0;
    var _qty = e?.target?.value;
    var _rateperUnit = _boqItem?.[editdeleteIndex]?.rate;
    _amount = _rateperUnit * _qty;
    _boqItem[editdeleteIndex]["amount"] = _amount;
    setBOQData(_boqItem);
  };

  const handleChange = (e: any, valueDrp = null) => {
    const { name, value } = e.target;
    var _boqItem = [...boqData];
    if (valueDrp !== null) {
      _boqItem[editdeleteIndex]["material_Category"] = valueDrp;
      setBOQData(_boqItem);
    } else {
      _boqItem[editdeleteIndex][name] = value;
      setBOQData(_boqItem);
    }
  };
  return (
    <>
      <div style={{ height: "calc(100vh - 360px)", margin: "0px 20px 0px" }}>
        <form>
          <div className="phase-outer">
            <Grid
              marginBottom="10px"
              marginTop="5px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
              sx={{ paddingTop: "0px!important" }}
            >
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Catalogue Id</h2>
                  <TextField
                    autoComplete="off"
                    name="catelouge_Id"
                    id="catelouge_Id"
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      regExpressionTextField(e);
                    }}
                    size="small"
                    onChange={handleChange}
                    error={!boqData?.[editdeleteIndex]?.catelouge_Id}
                    value={boqData?.[editdeleteIndex]?.catelouge_Id || ""}
                  />
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Item Description</h2>
                  <TextField
                    autoComplete="off"
                    name="item_Description"
                    id="item_Description"
                    type="text"
                    InputProps={{ inputProps: { maxLength: 50 } }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      regExpressionTextField(e);
                    }}
                    onChange={handleChange}
                    error={!boqData?.[editdeleteIndex]?.item_Description}
                    value={boqData?.[editdeleteIndex]?.item_Description || ""}
                    variant="outlined"
                    size="small"
                    className="w-85"
                  />
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Vendor Code</h2>
                  <TextField
                    autoComplete="off"
                    name="vendor_Code"
                    id="vendor_Code"
                    type="text"
                    InputProps={{ inputProps: { maxLength: 30 } }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      regExpressionTextField(e);
                    }}
                    onChange={handleChange}
                    error={!boqData?.[editdeleteIndex]?.vendor_Code}
                    value={boqData?.[editdeleteIndex]?.vendor_Code || ""}
                    variant="outlined"
                    size="small"
                    className="w-85"
                  />
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Material Code</h2>
                  <TextField
                    autoComplete="off"
                    name="material_Code"
                    id="material_Code"
                    type="text"
                    InputProps={{ inputProps: { maxLength: 30 } }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      regExpressionTextField(e);
                    }}
                    onChange={handleChange}
                    error={!boqData?.[editdeleteIndex]?.material_Code}
                    value={boqData?.[editdeleteIndex]?.material_Code || ""}
                    variant="outlined"
                    size="small"
                    className="w-85"
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Material Category</h2>
                  <Autocomplete
                    id="combo-box-demo"
                    disableClearable={true}
                    options={materialCategoryData || []}
                    onChange={(e, value) => handleChange(e, value)}
                    getOptionLabel={(option) =>
                      option?.formName?.toString() || ""
                    }
                    value={boqData?.[editdeleteIndex]?.material_Category || ""}
                    renderInput={(params) => (
                      <TextField
                        name="material_Category"
                        id="material_Category"
                        {...params}
                        error={!boqData?.[editdeleteIndex]?.material_Category}
                        InputProps={{
                          ...params.InputProps,
                          style: { height: `35 !important` },
                        }}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  />
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">SAP Description</h2>
                  <TextField
                    autoComplete="off"
                    name="specification"
                    id="specification"
                    InputProps={{ inputProps: { maxLength: 50 } }}
                    onChange={handleChange}
                    error={!boqData?.[editdeleteIndex]?.specification}
                    value={boqData?.[editdeleteIndex]?.specification || ""}
                    type="text"
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      regExpressionTextField(e);
                    }}
                    variant="outlined"
                    size="small"
                    className="w-85"
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Rate Per Unit</h2>
                  <TextField
                    autoComplete="off"
                    name="rate"
                    id="rate"
                    type={"number"}
                    variant="outlined"
                    onChange={handleChange}
                    error={!boqData?.[editdeleteIndex]?.rate}
                    value={boqData?.[editdeleteIndex]?.rate || ""}
                    size="small"
                    onBlur={(e) => _calculateAmount(e)}
                    onWheel={(e) =>
                      e.target instanceof HTMLElement && e.target.blur()
                    }
                    className="w-85"
                    onKeyDown={(e) => {
                      blockInvalidChar(e);
                    }}
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Unit of Measurement</h2>
                  <TextField
                    autoComplete="off"
                    name="unit"
                    id="unit"
                    type="text"
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      var reg = new RegExp(/^[a-zA-Z ]*$/);
                      if (reg.test(e.key) === false) {
                        e.preventDefault();
                      }
                    }}
                    InputProps={{ inputProps: { maxLength: 10 } }}
                    onChange={handleChange}
                    error={!boqData?.[editdeleteIndex]?.unit}
                    value={boqData?.[editdeleteIndex]?.unit || ""}
                    variant="outlined"
                    size="small"
                    className="w-85"
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Quantity</h2>
                  <TextField
                    autoComplete="off"
                    name="quantity"
                    id="quantity"
                    type="number"
                    variant="outlined"
                    size="small"
                    onBlur={(e) => {
                      _calculateAmountByQty(e);
                    }}
                    onChange={handleChange}
                    error={!boqData?.[editdeleteIndex]?.quantity}
                    value={boqData?.[editdeleteIndex]?.quantity || ""}
                    onWheel={(e) =>
                      e.target instanceof HTMLElement && e.target.blur()
                    }
                    className="w-85"
                    onKeyDown={(e) => {
                      blockInvalidChar(e);
                    }}
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Amount</h2>
                  <TextField
                    autoComplete="off"
                    name="amount"
                    disabled
                    id="amount"
                    type="number"
                    onChange={handleChange}
                    error={!boqData?.[editdeleteIndex]?.amount}
                    value={boqData?.[editdeleteIndex]?.amount || ""}
                    variant="outlined"
                    size="small"
                    className="w-85"
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">HSN Code</h2>
                  <TextField
                    autoComplete="off"
                    name="hsN_CODE"
                    id="hsN_CODE"
                    type="text"
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      regExpressionTextField(e);
                    }}
                    InputProps={{ inputProps: { maxLength: 30 } }}
                    onChange={handleChange}
                    value={boqData?.[editdeleteIndex]?.hsN_CODE || ""}
                    error={!boqData?.[editdeleteIndex]?.hsN_CODE}
                    variant="outlined"
                    size="small"
                    className="w-85"
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">
                    Catalogue Status
                  </h2>
                  <TextField
                    autoComplete="off"
                    name="catalogue_Status"
                    id="catalogue_Status"
                    type="text"
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                      }
                      regExpressionTextField(e);
                    }}
                    InputProps={{ inputProps: { maxLength: 30 } }}
                    onChange={handleChange}
                    value={boqData?.[editdeleteIndex]?.catalogue_Status || ""}
                    variant="outlined"
                    error={!boqData?.[editdeleteIndex]?.catalogue_Status}
                    size="small"
                    className="w-85"
                  />
                </div>
              </Grid>
            </Grid>
          </div>
        </form>
      </div>
    </>
  );
};

export default BOQForm;
