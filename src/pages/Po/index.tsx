import {
  Box,
  Button,
  Stack,
  TextField,
  Grid,
  Autocomplete,
} from "@mui/material";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { _validationMaxFileSizeUpload } from "../Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import { useNavigate } from "react-router-dom";
import { submit } from "shared/constants/CustomColor";
import { useSelector } from "react-redux";
import { AppState } from "redux/store";
import workflowFunctionAPICall from "../myTask/Components/workFlowActionFunction";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";
import moment from "moment";
import { useDispatch } from "react-redux";
import { useUrlSearchParams } from "use-url-search-params";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import MandateInfo from "pages/common-components/MandateInformation";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import PoTable from "./PoTable";
import { fetchError, showMessage } from "redux/actions";
import regExpressionTextField, {
  textFieldValidationOnPaste, regExpressionRemark
} from "@uikit/common/RegExpValidation/regForTextField";
import blockInvalidChar from "pages/Mandate/Location/Components/blockInvalidChar ";

const MAX_COUNT = 8;
const Po = () => {
  const cat = { vendor_category: { vendorcategory: "" } };
  const navigate = useNavigate();
  const [params] = useUrlSearchParams({}, {});
  const { user } = useAuthUser();
  const dispatch = useDispatch();
  const [fileLength, setFileLength] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileLimit, setFileLimit] = useState(false);
  const [data, setData] = React.useState<any>([]);
  const [editIndex, setEditIndex] = React.useState<any>(null);
  const [formDataError, setFormDataError] = React.useState<any>(null);
  const [formData, setFormData] = React.useState<any>({
    id: 0,
    uid: "string",
    mandateId: 0,
    vendor_Id: 0,
    vendor_category: "",
    vendor_code: "",
    vendor_name: "",
    po_number: "",
    po_amount: "",
    po_release_date: new Date().toISOString().substring(0, 10),
    is_file_upload: false,
    remarks: "",
    status: "",
    createdby: user?.UserName,
    createddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
    modifiedby: user?.UserName,
    modifieddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
  });
  const [tableData, setTableData] = React.useState<any>([]);
  const { id } = useParams();
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [userAction, setUserAction] = React.useState(null);
  const [mandateId, setMandateId] = React.useState(null);
  const [empaneled, setEmpaneled] = React.useState(true);
  const [vendorCategoryOption, setVendorCategoryOption] = React.useState([]);
  const [vendorNameOption, setVendorNameOption] = React.useState([]);
  const [vendorNameIds, setVendorNameIds] = useState({});
  const [updateVendorNameIds, setUpdateVendorNameIds] = useState({});
  const [mandateData, setMandateData] = useState({});
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const [error, setError] = useState(null);
  const [update, setUpdate] = useState(false);
  const [editButton, setEditButton] = useState(false);

  const [sendBack, setSendBack] = React.useState(false);
  const [selectedMandate, setSelectedMandate] = useState(null);
  const [approved, setApproved] = React.useState(false);
  const [remark, setRemark] = useState("");
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const [keyCount, setKeyCount] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const fileInput = React.useRef(null);
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];

  React.useEffect(() => {
    setEmpaneled(true);
    if (mandateId && mandateId?.id !== undefined) {
      const userAction =
        userActionList &&
        userActionList?.find(
          (item) =>
            item?.mandateId === parseInt(mandateId?.id) &&
            item?.module === module
        );

      if (apiType === "") {
        setUserAction(userAction);
      } else {
        let action = mandateId;
        setUserAction(action);
      }
      if (params.source === "list") {
        navigate(`/mandate/${mandateId?.id}/${module}?source=list`, {
          state: { apiType: apiType },
        });
      } else {
        navigate(`/mandate/${mandateId?.id}/${module}`, {
          state: { apiType: apiType },
        });
      }
    }
  }, [mandateId, setMandateId]);

  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );

    return userAction?.runtimeId || 0;
  };

  const workFlowMandate = () => {
    var _validationChk;
    _validationChk =
      tableData && tableData?.filter((item) => item?.is_file_upload === true);
    if (_validationChk && _validationChk?.length !== tableData?.length) {
      dispatch(fetchError("Please upload document for each record"));
      return;
    }
    const token = localStorage.getItem("token");
    const body = {
      runtimeId: _getRuntimeId(mandateId.id) || 0,
      mandateId: mandateId?.id || 0, 
      tableId: mandateId?.id || 0,
      remark: "Created",
      createdBy: user?.UserName,
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: "Created", 
    };
    axios({
      method: "post",
      url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId
        }&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy
        }&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ""
        }`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response: any) => {
        if (!response) return;
        if (response?.data === true) {
          dispatch(showMessage("PO Details Added Successfully!"));
          navigate("/list/task");
        }

      })
      .catch((e: any) => { });
  };

  const handleApprove = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = [...tableData];
    const modified = data?.map((item) => {
      item["id"] = 0;
      if (item.empaneled === true) {
        item["fk_VendorPartnerMaster_id"] =
          vendorNameIds[item.fk_VendorPartnerMaster_id];
      }
      delete item["partnerName"];
      delete item["mandetCode"];
      return item;
    });

    if (tableData?.length !== undefined && tableData?.length !== 0) {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/VendorAllocation/CreateVendorAllocationDetails`,
          modified
        )
        .then((response) => {
          if (!response) return;
          if (response && response?.status === 200) {
            setUpdate(false);
            dispatch(showMessage("Record is added successfully!"));
            workFlowMandate();
          }
        })
        .catch((err) => { });
    }
  };
  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validation = (formData) => {
    if (!formData?.vendor_category) {
      dispatch(fetchError("Please select Vendor Category"));
      return;
    }
    if (!formData?.vendor_name) {
      dispatch(fetchError("Please select Vendor Name Code"));
      return;
    }
    if (!formData?.po_number) {
      dispatch(fetchError("Please enter PO Number"));
      return;
    }
    if (!formData?.po_release_date) {
      dispatch(fetchError("Please enter Release Date"));
      return;
    }
    if (!formData?.po_amount) {
      dispatch(fetchError("Please enter PO Amount"));
      return;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validation(formData);
    if (
      formData.vendor_category !== undefined &&
      formData?.vendor_name &&
      formData?.po_number &&
      formData?.po_release_date &&
      formData?.po_amount
    ) {
      formData["mandateId"] = mandateId?.id;
      formData["vendor_category"] = formData?.vendor_category?.vendorcategory;
      if (editButton === false)
        axios
          .post(
            `${process.env.REACT_APP_BASEURL}/api/PODetails/CreatePODetails`,
            formData
          )
          .then((response) => {
            if (!response) return;
            if (response && response?.status === 200) {
              getData();
              setFormData({
                id: 0,
                uid: "string",
                mandateId: 0,
                vendor_Id: 0,
                vendor_category: "",
                vendor_code: "",
                vendor_name: "",
                po_number: "",
                po_amount: "",
                po_release_date: new Date().toISOString().substring(0, 10),
                is_file_upload: false,
                remarks: "",
                status: "",
                createdby: user?.UserName,
                createddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
                modifiedby: user?.UserName,
                modifieddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
              });
              setVendorNameOption([]);

              dispatch(showMessage("Record Inserted Successfully!"));
            }
          })
          .catch((err) => { });
      else
        axios
          .post(
            `${process.env.REACT_APP_BASEURL}/api/PODetails/UpdatePODetails`,
            formData
          )
          .then((response) => {
            if (!response) return;
            if (response && response?.status === 200) {
              getData();
              setFormData({
                id: 0,
                uid: "string",
                mandateId: 0,
                vendor_Id: 0,
                vendor_category: "",
                vendor_code: "",
                vendor_name: "",
                po_number: "",
                po_amount: "",
                po_release_date: new Date().toISOString().substring(0, 10),
                is_file_upload: false,
                remarks: "",
                status: "",
                createdby: user?.UserName,
                createddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
                modifiedby: user?.UserName,
                modifieddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
              });
              setVendorNameOption([]);
              dispatch(showMessage("Record Updated Successfully!"));
            }
          })
          .catch((err) => { });

      setEditButton(false);
    } else {
      validation(formData);
    }
  };

  const handelCategoryChange = async (e, value) => {
    formData["vendor_category"] = value;
    if (formData.vendor_name !== undefined) delete formData.vendor_name;

    setFormData({
      ...formData,
    });

    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PODetails/GetVendorDropDown?mandateId=${mandateId?.id}&vendorCategory=${value?.vendorcategory}`
      )
      .then((response) => {
        const vendorIds = {};
        const vendorname = response?.data?.map((item, ind) => {
          vendorIds[item.vendorname] = item.id;
          return item.vendorname;
        });
        setVendorNameIds({ ...vendorNameIds, ...vendorIds });
        setVendorNameOption(vendorname);
      })
      .catch((err) => { });
  };

  function swapKeysAndValues(obj) {
    const swapped = Object.entries(obj).map(([key, value]) => [value, key]);

    return Object.fromEntries(swapped);
  }

  const getData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PODetails/GetPODetails?mandateId=${mandateId?.id}`
      )
      .then((response) => {
        if (response && response?.data) {
          if (response?.data?.length > 0) {
            setUpdate(true);
          } else {
            setUpdate(false);
          }
          setTableData([...response?.data]);
        }
      })
      .catch((err) => { });
  };

  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateId(id);
    }
  }, []);

  React.useEffect(() => {
    if (mandateId?.id !== undefined && mandateId?.id !== "noid") {
      getData();
    }
  }, [mandateId?.id]);

  const getVendorCategory = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/PODetails/GetVendorCategoryByMandateId?mandateId=${mandateId?.id === undefined ? mandateId : mandateId?.id
        }`
      )
      .then((response) => {
        setVendorCategoryOption(response?.data);
      })
      .catch((err) => { });
  };
  useEffect(() => {
    if (mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid") {
      getVendorCategory();
    }
  }, [mandateId?.id]);

  const deleterow = (ind, idx, e) => {
    e.preventDefault();
    tableData.splice(ind, 1);
    if (editIndex === ind) {
      setFormData({
        id: 0,
        uid: "string",
        mandateId: 0,
        vendor_Id: 0,
        vendor_category: "",
        vendor_code: "",
        vendor_name: "",
        po_number: "",
        po_amount: "",
        po_release_date: new Date().toISOString().substring(0, 10),
        is_file_upload: false,
        remarks: "",
        status: "",
        createdby: user?.UserName,
        createddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        modifiedby: user?.UserName,
        modifieddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      });
      setEditButton(false);
      setVendorNameOption([]);
    }
    setTableData([...tableData]);
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PODetails/DeletePODetails?id=${idx}`
      )
      .then((response) => {
        if (response) {
          dispatch(showMessage("Record Deleted Successfully!"));
        } else {
          dispatch(fetchError("Error Occured"));
        }
      })
      .catch((err) => { });
  };

  const editrow = (ind, e) => {
    e.preventDefault();
    handelCategoryChange(
      {},
      { vendorcategory: tableData[ind]?.vendor_category } ||
      cat?.vendor_category
    );

    setEditButton(true);
    setEditIndex(ind);
    setFormData({
      ...tableData[ind],
      vendor_category: { vendorcategory: tableData[ind]?.vendor_category },
    });
  };

  const handleDateChange = (newValue: Dayjs | null, name) => {
    if (name === "po_release_date") {
      let date = newValue?.toDate();
      formData[name] = moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS");
    } else {
      formData[name] = newValue;
    }

    setFormData({ ...formData });
  };

  const handleUploadFiles = async (e, files) => {
    const uploaded = [...uploadedFiles];
    let limitExceeded = false;
    files &&
      files?.some((file) => {
        if (
          uploaded &&
          uploaded?.findIndex((f) => f.name === file.name) === -1
        ) {
          uploaded.push(file);
          if (uploaded?.length === MAX_COUNT) setFileLimit(true);
          if (uploaded?.length > MAX_COUNT) {
            dispatch(
              fetchError(
                `You can only add a maximum of ${MAX_COUNT} files` || ""
              )
            );
            setFileLimit(false);
            limitExceeded = true;
            e.target.value = null;
            return;
          }
        }
      });
    if (limitExceeded) {
      dispatch(
        fetchError(`You can only add a maximum of ${MAX_COUNT} files` || "")
      );
      e.target.value = null;
      return;
    }

    if (!limitExceeded) setUploadedFiles(uploaded);
    setFileLength((uploaded && uploaded?.length) || 0);
    const form: any = new FormData();
    form.append("mandate_id", mandateId?.id);
    form.append("documenttype", "UPS Documents");
    form.append("CreatedBy", user?.UserName || "");
    form.append("ModifiedBy", user?.UserName || "");
    form.append("entityname", "DocumentUpload");
    form.append("RecordId", mandateId?.id);
    form.append("remarks", formData["remarks"]);

    for (var key in uploaded) {
      await form.append("file", uploaded[key]);
    }

    if (uploaded?.length === 0) {
      setUploadedFiles([]);
      setFileLimit(false);
      dispatch(fetchError("Error Occurred !"));
      e.target.value = null;
      return;
    }

    if (mandateId?.id !== undefined) {
      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`,
          form
        )
        .then((response: any) => {
          e.target.value = null;
          if (!response) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          if (response?.data?.data == null) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError("Documents are not uploaded!"));
            return;
          } else if (response?.status === 200) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(showMessage("Documents are uploaded successfully!"));
          }
        })
        .catch((e: any) => {
          e.target.value = null;
          dispatch(fetchError("Error Occurred !"));
        });
    }
  };

  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch)) {
      handleUploadFiles(e, chosenFiles);
    }
  };

  const onKeyDown = (e) => {
    e.preventDefault();
  };
  return (
    <div className="po">
      <Box component="h2" className="page-title-heading my-6">
        PO
      </Box>
      <div className="card-panal inside-scroll-233 po">
        <MandateInfo
          mandateCode={mandateId}
          setMandateData={setMandateData}
          source=""
          pageType=""
          redirectSource={`${params?.source}`}
          setMandateCode={setMandateId}
          setpincode={() => { }}
          setCurrentStatus={setCurrentStatus}
          setCurrentRemark={setCurrentRemark}
        />

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
                  <h2 className="phaseLable required">Vendor Category</h2>
                  <Autocomplete
                    id="combo-box-demo"
                    getOptionLabel={(option) =>
                      option?.vendorcategory?.toString()
                    }
                    disableClearable={true}
                    options={vendorCategoryOption || []}
                    onChange={(e, value) => handelCategoryChange(e, value)}
                    value={formData?.vendor_category || cat?.vendor_category}
                    renderInput={(params) => (
                      <TextField
                        name="vendorcategory"
                        id="vendorcategory"
                        {...params}
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
                  <h2 className="phaseLable required">Vendor Name Code</h2>

                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    disableClearable={true}
                    options={vendorNameOption || []}
                    onChange={(e, value) => {
                      formData["vendor_name"] = value;
                      setFormData({
                        ...formData,
                      });
                    }}
                    value={
                      formData.vendor_name !== undefined
                        ? formData.vendor_name
                        : ""
                    }
                    renderInput={(params) => (
                      <TextField
                        name="vendor_name"
                        id="vendor_name"
                        {...params}
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
                  <h2 className="phaseLable required">PO Number</h2>
                  <TextField
                    autoComplete="off"
                    name="po_number"
                    id="po_number"

                    size="small"
                    value={
                      formData.po_number !== undefined &&
                        formData.po_number !== null
                        ? formData.po_number
                        : ""
                    }
                    InputProps={{
                      inputProps: { maxLength: 12 },
                    }}
                    onChange={handleChange}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onKeyDown={(e: any) => {
                      if (
                        e.target.selectionStart === 0 &&
                        (e.code === "Space" ||
                          e.code === "Numpad0" ||
                          e.code === "Digit0")
                      ) {
                        e.preventDefault();
                      }
                      regExpressionTextField(e);
                    }}
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div>
                  <h2 className="phaseLable required">PO Release Date</h2>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      className="w-85"
                      maxDate={dayjs()}
                      inputFormat="DD/MM/YYYY"
                      value={formData["po_release_date"] || null}
                      onChange={(e) => handleDateChange(e, "po_release_date")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          onKeyDown={onKeyDown}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">PO Amount</h2>
                  <TextField
                    autoComplete="off"
                    name="po_amount"
                    id="po_amount"
                    type="text"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={
                      formData.po_amount !== undefined &&
                        formData.po_amount !== null
                        ? formData.po_amount
                        : ""
                    }
                    inputProps={{ maxLength: 14 }}
                    onChange={handleChange}
                    onKeyDown={(e: any) => {
                      blockInvalidChar(e);
                      if (e?.key === "Backspace" && keyCount > 0) {
                        setKeyCount(keyCount - 1);

                        if (keyCount === 1) setCount(0);
                      }
                      if (
                        e.target.selectionStart === 0 &&
                        (e.code === "Space" ||
                          e.code === "Numpad0" ||
                          e.code === "Digit0")
                      ) {
                        e.preventDefault();
                      }
                      if (!(count > 0 && e?.key === "."))
                        setKeyCount(keyCount + 1);
                      if (e?.key === ".") {
                        setCount(count + 1);
                      }
                      if (
                        (!/[0-9.]/.test(e.key) ||
                        (count > 0 && e?.key === ".")) && (e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight")
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Remarks</h2>
                  <TextField
                    autoComplete="off"
                    name="remarks"
                    id="remarks"

                    size="small"
                    InputProps={{
                      inputProps: { maxLength: 50 },
                    }}
                    value={
                      formData.remarks !== undefined &&
                        formData.remarks !== null
                        ? formData.remarks
                        : ""
                    }
                    onChange={handleChange}
                    onKeyDown={(e: any) => {
                      regExpressionRemark(e);
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                  />
                 
                </div>
              </Grid>
             

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div style={{ marginTop: "21px" }}>
                  <Button
                    variant="contained"
                    size="small"
                    style={submit}
                    sx={{
                      padding: "6px 20px !important",
                      marginLeft: "0 !important",
                    }}
                    onClick={handleSubmit}
                  >
                    {editButton ? "Update PO" : "Add PO"}
                  </Button>
                </div>
              </Grid>
            </Grid>
          </div>

          <div>
            {tableData && tableData?.length > 0 && (
              <PoTable
                getData={() => {
                  getData();
                }}
                formData={formData}
                setFormData={setFormData}
                mandateId={mandateId}
                data={tableData}
                setTableData={setTableData}
                editrow={editrow}
                deleterow={deleterow}
              />
            )}
          </div>

        

          <div className="bottom-fix-history">
            {id && id !== undefined && id !== "noid" && (
              <MandateStatusHistory
                mandateCode={id}
                accept_Reject_Status={currentStatus}
                accept_Reject_Remark={currentRemark}
              />
            )}
          </div>
          {tableData &&
            tableData.length > 0 &&
            mandateId &&
            mandateId?.id !== undefined && (
              <div className="bottom-fix-btn ptb-0">
                <div className="remark-field">
                  {userAction?.module === module && (
                    <>
                      {action && action === "Approve" && (
                        <>
                          <ApproveAndRejectAction
                            approved={approved}
                            sendBack={sendBack}
                            setSendBack={setSendBack}
                            setApproved={setApproved}
                            remark={remark}
                            setRemark={setRemark}
                            approveEvent={() => {
                              workflowFunctionAPICall(
                                runtimeId,
                                mandateId?.id,
                                mandateId?.id,
                                remark,
                                "Approved",
                                navigate,
                                user,
                                params,
                                dispatch
                              );
                            }}
                            sentBackEvent={() => {
                              workflowFunctionAPICall(
                                runtimeId,
                                mandateId?.id,
                                mandateId?.id,
                                remark,
                                "Rejected",
                                navigate,
                                user,
                                params,
                                dispatch
                              );
                            }}
                          />
                          {userAction?.stdmsg !== undefined && (
                            <span className="message-right-bottom">
                              {userAction?.stdmsg}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {action === "" && runtimeId === 0 && (
                    <Stack
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      sx={{ margin: "10px" }}
                      style={{ marginLeft: "-2.7%" }}
                    >
                      <Button
                        variant="outlined"
                        size="medium"
                        onClick={workFlowMandate}
                        style={{
                          marginLeft: 10,
                          padding: "2px 20px",
                          borderRadius: 6,
                          color: "#fff",
                          borderColor: "#00316a",
                          backgroundColor: "#00316a",
                        }}
                      >
                        Submit
                      </Button>

                      {userAction?.stdmsg !== undefined && (
                        <span className="message-right-bottom">
                          {userAction?.stdmsg}
                        </span>
                      )}
                    </Stack>
                  )}
                  {action && action === "Create" && (
                    <Stack
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      sx={{ margin: "10px" }}
                      style={{ marginLeft: "-2.7%" }}
                    >
                      <Button
                        variant="outlined"
                        size="medium"
                        onClick={workFlowMandate}
                        style={{
                          marginLeft: 10,
                          padding: "2px 20px",
                          borderRadius: 6,
                          color: "#fff",
                          borderColor: "#00316a",
                          backgroundColor: "#00316a",
                        }}
                      >
                        Submit
                      </Button>
                      {userAction?.stdmsg !== undefined && (
                        <span className="message-right-bottom">
                          {userAction?.stdmsg}
                        </span>
                      )}
                    </Stack>
                  )}
                </div>
              </div>
            )}
        </form>
      </div>
    </div>
  );
};

export default Po;
