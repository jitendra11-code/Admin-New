import React, { useState, useEffect } from "react";
import { Grid, Button, TextField, Autocomplete } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayJs, { Dayjs } from "dayjs";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { _validationMaxFileSizeUpload } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import { AgGridReact } from "ag-grid-react";
import { AppState } from "redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useUrlSearchParams } from "use-url-search-params";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import moment from "moment";
import axios from "axios";
import { fetchError, showMessage } from "redux/actions";
import TextEditor from "./Compoents/Editors/TextEditor";
import {
  textFieldValidationOnPaste,
  regExpressionRemark,
} from "@uikit/common/RegExpValidation/regForTextField";
import Template from "pages/common-components/AgGridUtility/ColumnHeaderWithAsterick";
const ActionOptions = [
  {
    key: "Accept",
    value: "Accept",
  },
  {
    key: "Reject",
    value: "Reject",
  },
];
const StatusOptions = [
  {
    key: "handover_accepted",
    value: "Handover Accepted",
  },
  {
    key: "handover_pending",
    value: "Handover Pending",
  },
];
const Content = ({
  action,
  documentType,
  mandateId,
  setIsKeyHandoverChecked,
  currentStatus,
  currentRemark,
}: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = React.useState<any>(null);
  const apiType = location?.state?.apiType || "";
  const [userAction, setUserAction] = React.useState(null);
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const gridRef = React.useRef<AgGridReact>(null);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );

  const [KeyHandoverByList, setKeyHandoverByList] = useState([]);
  const [KeyHandoverToList, setKeyHandoverToList] = useState([]);

  const [tableData, setTableData] = useState([]);
  const [params] = useUrlSearchParams({}, {});
  const { user } = useAuthUser();
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid") {
      getMandatoryListDataTable(mandateId?.id);
      getHandoverKeyByList(mandateId?.id);
      getHandoverKeyToList(mandateId?.id);
    }
  }, [mandateId]);

  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );
    return userAction?.runtime || 0;
  };

  const workFlowMandate = () => {
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
        }&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy
        }&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ""
        }`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occured !!"));
          return;
        }
        if (response?.data === true) {
          dispatch(showMessage("Submitted Successfully!"));
          if (params?.source === "list") {
            navigate("/list/task");
          } else {
            navigate("/mandate");
          }
        } else {
          dispatch(fetchError("Error Occured !!"));
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  const generateCategory = (value, category, source, index) => {
    var option = null;
    if (source === "actions") {
      if (category?.hasOwnProperty("key")) {
        option = ActionOptions?.find(
          (item) => item?.key?.toUpperCase() === category?.key?.toUpperCase()
        );
      } else if (value !== undefined && typeof value !== "object") {
        option = ActionOptions?.find(
          (item) => item?.key?.toUpperCase() === value?.toUpperCase()
        );
      }
      return option || null;
    } else if (source === "status") {
      var data = [...tableData];
      var value = data[index].actions;
      if (value !== "") {
        var _statusAccept = StatusOptions?.[0];
        var _statusReject = StatusOptions?.[1];
        if (value === "Accept") {
          data[index].option_status_Catgory = _statusAccept;
          data[index].status = _statusAccept?.key;
        } else if (value === "Reject") {
          data[index].option_status_Catgory = _statusReject;
          data[index].status = _statusReject?.key;
        } else {
          data[index].option_status_Catgory = null;
          data[index].status = "";
        }
      }
      if (category?.hasOwnProperty("key")) {
        option = StatusOptions?.find(
          (item) => item?.key?.toUpperCase() === category?.key?.toUpperCase()
        );
      } else if (value !== undefined && typeof value !== "object") {
        option = StatusOptions?.find(
          (item) => item?.key?.toUpperCase() === value?.toUpperCase()
        );
      }
      return option || null;
    } else if (source === "keyhandoverlist") {
      if (category?.hasOwnProperty("key_handoverby_id")) {
        option = KeyHandoverByList?.find(
          (item) => item?.key_handoverby_id === category?.key_handoverby_id
        );
      } else if (value !== undefined && typeof value !== "object") {
        option = KeyHandoverByList?.find(
          (item) => item?.key_handoverby_id === value
        );
      }
      return option || null;
    } else if (source === "keyhandovertolist") {
      if (category?.hasOwnProperty("id")) {
        option = KeyHandoverToList?.find((item) => item?.id === category?.id);
      } else if (value !== undefined && typeof value !== "object") {
        option = KeyHandoverToList?.find((item) => item?.id === value);
      }
      return option || null;
    } else {
      return null;
    }
  };
  const components = {
    TextEditorCmp: TextEditor,
  };

  const generateFullName = (option) => {
    var _fullName = `${option?.firstName || ""} ${option?.middleName || ""} ${option?.lastName || ""
      }`;
    return _fullName || "";
  };

  let columnDefs = [
    {
      field: "SEQUENCE",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      width: 80,
      maxWidth: 80,
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },
      pinned: "left",

      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Item",
      pinned: "left",
      tooltipField: "Item",
      headerName: "Item Description",
      headerTooltip: "Item Description",
      sortable: true,
      resizable: true,
      minWidth: 150,
      width: 150,
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Category",
      pinned: "left",
      headerName: "GL Category",
      headerTooltip: "GL Category",
      sortable: true,
      hide: true,
      resizable: true,
      minWidth: 100,
      width: 100,
      maxWidth: 100,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "name_serial_number",
      headerName: "Keys-Company Name & Serial Number",
      headerTooltip: "Keys-Company Name & Serial Number",
      sortable: true,
      resizable: true,
      headerComponentParams: {
        template: Template,
      },
      cellClass: "editTextClass",
      editable: action === "" || action === "Create",
      minWidth: 100,
      width: 200,
      maxWidth: 200,
      cellStyle: (params) => {
        if (action === "" || action === "Create") {
          return {
            fontSize: "13px",
            cursor: "pointer",
            height: "28px",
            margin: "5px",
            width: "190px",
            display: "flex",
            alignItem: "center",
            paddingTop: "0px",
          };
        } else {
          return {
            fontSize: "13px",
            cursor: "pointer",
            height: "28px",
            margin: "5px",
            width: "190px",
            display: "flex",
            alignItem: "center",
            paddingTop: "0px",
            backgroundColor: "#f3f3f3",
          };
        }
      },

      cellEditor: "TextEditorCmp",
      cellEditorParams: {
        maxLength: 80,
        type: "text",
        autoFocus: true,
        defaultToFirstChar: true,
        action: action,
      },
    },

    {
      field: "key_handover_by",
      headerName: "Keys handover by",
      headerTooltip: "Keys handover by",
      sortable: true,
      resizable: true,
      minWidth: 100,
      width: 200,
      maxWidth: 200,
      headerComponentParams: {
        template: Template,
      },
      cellStyle: { fontSize: "13px", cursor: "pointer" },
      cellClass: "cell-padding-section",
      cellRenderer: (params: any) => (
        <>
          <div id="branchhand" style={{ marginTop: 2 }} className="padd-right">
            <Autocomplete
              id="combo-box-demo"
              disabled={action === "Approve" || action === "Approve or Reject"}
              getOptionLabel={(option) =>
                option?.key_handoverby_name?.toString() || ""
              }
              disableClearable={true}
              options={params?.KeyHandoverByList || []}
              onChange={(e, value: any) => {
                var currentIndex = params?.rowIndex;
                var data = [...params?.tableData];
                data[currentIndex].keyHandOverBy = value;
                data[currentIndex].key_handoverby_name =
                  value?.key_handoverby_name;
                data[currentIndex].key_handoverby_id = value?.key_handoverby_id;
                params?.setTableData(data);
              }}
              placeholder="KeyHandoverByList"
              value={
                params?.generateCategory(
                  params?.tableData[params?.rowIndex]?.key_handover_by_id,
                  params?.tableData[params?.rowIndex]?.keyHandOverBy,
                  "keyhandoverlist",
                  params?.rowIndex
                ) || null
              }
              renderInput={(textParams) => (
                <TextField
                  error={
                    !params?.tableData[params?.rowIndex]?.key_handoverby_name
                  }
                  name="KeyHandoverByList"
                  id="KeyHandoverByList"
                  {...textParams}
                  InputProps={{
                    ...textParams.InputProps,
                  }}
                  sx={{
                    ".MuiInputBase-input": {
                      height: "12px !important",
                      fontSize: "12px",
                      paddingLeft: "8px",
                    },
                  }}
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </div>
        </>
      ),
      cellRendererParams: {
        tableData: tableData,
        setTableData: setTableData,
        KeyHandoverByList: KeyHandoverByList,
        generateCategory: generateCategory,
      },
    },

    {
      field: "key_handover_to",
      headerName: "Keys Handover to(Person Name)",
      headerTooltip: "Keys Handover to(Person Name)",
      sortable: true,
      resizable: true,
      headerComponentParams: {
        template: Template,
      },
      minWidth: 100,
      width: 200,
      maxWidth: 200,
      cellStyle: { fontSize: "13px", cursor: "pointer" },
      cellClass: "cell-padding-section",
      cellRenderer: (params: any) => (
        <>
          <div style={{ marginTop: 2 }} className="padd-right">
            <Autocomplete
              id="combo-box-demo"
              disabled={action === "Approve" || action === "Approve or Reject"}
              getOptionLabel={(option) => params?.generateFullName(option)}
              disableClearable={true}
              options={params?.KeyHandoverToList || []}
              onChange={(e, value: any) => {
                var currentIndex = params?.rowIndex;
                var data = [...params?.tableData];
                data[currentIndex].keyHandOverTo = value;
                data[currentIndex].key_handover_to = `${value?.firstName || ""
                  } ${value?.middleName || ""}  ${value?.lastName || ""}`;
                data[currentIndex].key_handover_to_id = value?.id;
                params?.setTableData(data);
              }}
              placeholder="KeyHandoverToList"
              value={
                params?.generateCategory(
                  params?.tableData[params?.rowIndex]?.key_handover_to_id,
                  params?.tableData[params?.rowIndex]?.keyHandOverTo,
                  "keyhandovertolist",
                  params?.rowIndex
                ) || null
              }
              renderInput={(textParams) => (
                <TextField
                  name="KeyHandoverToList"
                  id="KeyHandoverToList"
                  {...textParams}
                  InputProps={{
                    ...textParams.InputProps,
                  }}
                  error={!params?.tableData[params?.rowIndex]?.key_handover_to}
                  sx={{
                    ".MuiInputBase-input": {
                      height: "12px !important",
                      fontSize: "12px",
                      paddingLeft: "8px",
                    },
                  }}
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </div>
        </>
      ),
      cellRendererParams: {
        tableData: tableData,
        generateFullName: generateFullName,
        setTableData: setTableData,
        KeyHandoverToList: KeyHandoverToList,
        generateCategory: generateCategory,
      },
    },
    {
      field: "handover_date",
      tooltipField: "handover_date",
      headerName: "Handover Date",
      headerTooltip: "Handover Date",
      sortable: true,
      resizable: true,
      headerComponentParams: {
        template: Template,
      },
      width: 170,
      minWidth: 100,
      cellStyle: { fontSize: "13px", cursor: "pointer" },
      cellRendererParams: {
        tableData: tableData,
        setTableData: setTableData,
      },
      cellRenderer: (params: any) => (
        <>
          <div style={{ marginTop: 2 }} className="padd-right">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                disabled={
                  action === "Approve" || action === "Approve or Reject"
                }
                inputFormat="DD/MM/YYYY"
                maxDate={dayJs()}
                value={
                  params?.tableData[params?.rowIndex]?.handover_date || dayJs()
                }
                onChange={(value: Dayjs | null) => {
                  var currentIndex = params?.rowIndex;
                  var data = [...params?.tableData];
                  if (value !== null && dayJs(value).isValid()) {
                    data[currentIndex].handover_date = value?.toDate();
                  }
                  params?.setTableData(data);
                }}
                renderInput={(textparams) => (
                  <TextField
                    onKeyDown={(e) => {
                      e.preventDefault();
                    }}
                    error={!params?.tableData[params?.rowIndex]?.handover_date}
                    disabled={
                      action === "Approve" || action === "Approve or Reject"
                    }
                    {...textparams}
                    sx={{
                      ".MuiInputBase-input": {
                        height: "0px !important",
                        fontSize: "12px",
                        paddingLeft: "8px",
                      },
                      backgroundColor:
                        action === "Approve" || action === "Approve or Reject"
                          ? "#f3f3f3"
                          : "",
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </div>
        </>
      ),
    },
    {
      field: "branch_taking_date",
      headerName: "Branch Taking Handover Date",
      headerTooltip: "Branch Taking Handover Date",
      sortable: true,
      headerComponentParams: {
        template: Template,
      },
      resizable: true,
      width: 170,
      minWidth: 100,
      cellStyle: { fontSize: "13px", cursor: "pointer" },
      cellRendererParams: {
        tableData: tableData,
        setTableData: setTableData,
      },
      cellRenderer: (params: any) => (
        <>
          <div style={{ marginTop: 2 }} className="padd-right">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                inputFormat="DD/MM/YYYY"
                maxDate={dayJs()}
                value={
                  params?.tableData[params?.rowIndex]?.branch_taking_date ||
                  dayJs()
                }
                onChange={(value: Dayjs | null) => {
                  var currentIndex = params?.rowIndex;
                  var data = [...params?.tableData];
                  if (value !== null && dayJs(value).isValid()) {
                    data[currentIndex].branch_taking_date = value?.toDate();
                  }
                  params?.setTableData(data);
                }}
                disabled={
                  action === "Approve" || action === "Approve or Reject"
                }
                renderInput={(textparams) => (
                  <TextField
                    onKeyDown={(e) => {
                      e.preventDefault();
                    }}
                    error={
                      !params?.tableData[params?.rowIndex]?.branch_taking_date
                    }
                    {...textparams}
                    sx={{
                      ".MuiInputBase-input": {
                        height: "0px !important",
                        fontSize: "12px",
                        paddingLeft: "8px",
                      },
                      backgroundColor:
                        action === "Approve" || action === "Approve or Reject"
                          ? "#f3f3f3"
                          : "",
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </div>
        </>
      ),
    },

    {
      field: "actions",
      headerName: "Action",
      headerTooltip: "Action",
      sortable: true,
      resizable: true,
      headerComponentParams: {
        template: Template,
      },
      width: 130,
      minWidth: 130,
      cellClass: "cell-padding-section",
      cellStyle: { fontSize: "12px", cursor: "pointer" },
      cellRenderer: (params: any) => (
        <>
          <div style={{ marginTop: 2 }} className="padd-right">
            <Autocomplete
              id="combo-box-demo"
              disabled={action === "Approve" || action === "Approve or Reject"}
              getOptionLabel={(option) => option?.value?.toString() || ""}
              disableClearable={true}
              options={params?.ActionOptions || []}
              onChange={(e, value: any) => {
                var currentIndex = params?.rowIndex;
                var data = [...params?.tableData];
                data[currentIndex].option_action_Catgory = value;
                data[currentIndex].actions = value?.key;
                var _statusAccept = params?.StatusOptions?.[0];
                var _statusReject = params?.StatusOptions?.[1];
                if (value?.key === "Accept") {
                  data[currentIndex].option_status_Catgory = _statusAccept;
                  data[currentIndex].status = _statusAccept?.key;
                } else if (value?.key === "Reject") {
                  data[currentIndex].option_status_Catgory = _statusReject;
                  data[currentIndex].status = _statusReject?.key;
                } else {
                  data[currentIndex].option_status_Catgory = null;
                  data[currentIndex].status = "";
                }
                params?.setTableData(data);
              }}
              value={
                (params &&
                  params?.tableData[params?.rowIndex]?.actions &&
                  params?.generateCategory(
                    params?.tableData[params?.rowIndex]?.actions,
                    params?.tableData[params?.rowIndex]?.option_action_Catgory,
                    "actions",
                    params?.rowIndex
                  )) ||
                null
              }
              placeholder="availability"
              renderInput={(textParams) => (
                <TextField
                  name="state"
                  id="state"
                  {...textParams}
                  InputProps={{
                    ...textParams.InputProps,
                  }}
                  error={!params?.tableData[params?.rowIndex]?.actions}
                  sx={{
                    ".MuiInputBase-input": {
                      height: "12px !important",
                      fontSize: "12px",
                      paddingLeft: "8px",
                    },
                  }}
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </div>
        </>
      ),
      cellRendererParams: {
        StatusOptions: StatusOptions,
        ActionOptions: ActionOptions,
        tableData: tableData,
        setTableData: setTableData,
        generateCategory: generateCategory,
      },
    },

    {
      field: "status",
      headerName: "Status",
      headerTooltip: "Status",
      sortable: true,
      resizable: true,
      headerComponentParams: {
        template: Template,
      },
      width: 200,
      minWidth: 150,
      cellClass: "cell-padding-section",
      cellStyle: { fontSize: "12px", cursor: "pointer" },
      cellRenderer: (params: any) => (
        <>
          <div style={{ marginTop: 2 }} className="padd-right">
            <Autocomplete
              id="combo-box-demo"
              disabled={action === "Approve" || action === "Approve or Reject"}
              getOptionLabel={(option) => option?.value?.toString() || ""}
              disableClearable={true}
              options={params?.StatusOptions || []}
              onChange={(e, value: any) => {
                var currentIndex = params?.rowIndex;
                var data = [...params?.tableData];
                data[currentIndex].option_status_Catgory = value;
                data[currentIndex].status = value?.key;
                if (value?.key === "handover_pending") {
                  data[currentIndex].option_action_Catgory = {
                    key: "Reject",
                    value: "Reject",
                  };
                  data[currentIndex].actions = "Reject";
                } else if (value?.key === "handover_accepted") {
                  data[currentIndex].option_action_Catgory = {
                    key: "Accept",
                    value: "Accept",
                  };
                  data[currentIndex].actions = "Accept";
                } else {
                  data[currentIndex].option_action_Catgory = null;
                  data[currentIndex].actions = "";
                }
                params?.setTableData(data);
              }}
              value={
                (params &&
                  params?.tableData[params?.rowIndex]?.status &&
                  params?.generateCategory(
                    params?.tableData[params?.rowIndex]?.status,
                    params?.tableData[params?.rowIndex]?.option_status_Catgory,
                    "status",
                    params?.rowIndex
                  )) ||
                null
              }
              placeholder="availability"
              renderInput={(textParams) => (
                <TextField
                  error={!params?.tableData[params?.rowIndex]?.status}
                  name="state"
                  id="state"
                  {...textParams}
                  InputProps={{
                    ...textParams.InputProps,
                  }}
                  sx={{
                    ".MuiInputBase-input": {
                      height: "12px !important",
                      fontSize: "12px",
                      paddingLeft: "8px",
                    },
                  }}
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </div>
        </>
      ),
      cellRendererParams: {
        StatusOptions: StatusOptions,
        tableData: tableData,
        setTableData: setTableData,
        generateCategory: generateCategory,
      },
    },
  ];

  const saveData = () => {
    var _data = [...tableData];
    _data =
      _data &&
      _data?.map((item) => {
        return {
          id: item?.id || 0,
          uid: item?.uid || "",
          mandateId: mandateId?.id || 0,
          sequence: item?.SEQUENCE || 0,
          item: item?.Item || "",
          name_serial_number: item?.name_serial_number || "",
          key_handover_by_id: item?.key_handoverby_id || 0,
          key_handover_by: item?.key_handoverby_name || "",
          key_handover_to: item?.key_handover_to || "",
          key_handover_to_id: item?.key_handover_to_id || 0,
          actions: item?.actions || "",
          remarks: formData?.remarks || "",
          spoc_remarks: formData?.spoc_remarks || "",
          pm_remarks: item?.pm_remarks || "",
          status: item?.status || "",
          createdBy: user?.UserName || "",
          createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          modifiedBy: user?.UserName || "",
          modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          handover_date:
            (moment(item?.handover_date).isValid() &&
              moment(item?.handover_date).format("YYYY-MM-DDTHH:mm:ss.SSS")) ||
            moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          branch_taking_date:
            (moment(item?.branch_taking_date).isValid() &&
              moment(item?.branch_taking_date).format(
                "YYYY-MM-DDTHH:mm:ss.SSS"
              )) ||
            moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        };
      });

    var _validationError =
      _data &&
      _data?.filter(
        (item) =>
          item?.key_handover_by === "" ||
          item?.key_handover_to === "" ||
          item?.actions === "" ||
          item?.status === ""
      );
    if (_validationError && _validationError?.length > 0) {
      dispatch(fetchError("Please fill all mandatory fields !!!"));
      return;
    }

    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/KeyHandoverDetails/CreateUpdateKeyHandoverDetails`,
        _data
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.status === 200) {
          setIsKeyHandoverChecked(true);
          dispatch(showMessage("Record saved successfully!"));
          getMandatoryListDataTable(mandateId?.id);
          return;
        } else {
          dispatch(fetchError("Records are not failed !!!"));
          return;
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
        return;
      });
  };

  const getHandoverKeyByList = (id) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/Mandates/GetHandoverData?mandateId=${id || 0}`
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data?.length > 0) {
          setKeyHandoverByList(response?.data);
        } else {
          setKeyHandoverByList([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  const getHandoverKeyToList = (id) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=OffRoleEmployeeMaster`
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data && response?.data?.data?.length > 0) {
          setKeyHandoverToList(response?.data?.data || []);
        } else {
          setKeyHandoverToList([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  const getMandatoryListDataTable = (id) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/KeyHandoverDetails/GetHandoverMandatoryList?mandateid=${id}&Type=Key%20Handover%20LIST`
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data?.length > 0) {
          var _response = response?.data;

          _response =
            _response &&
            _response.map((item) => {
              return {
                ...item,
                Category:
                  typeof item?.Category === "object" ? "" : item?.Category,
                actions: typeof item?.actions === "object" ? "" : item?.actions,
                id: typeof item?.id === "object" ? 0 : item?.id,
                remarks: typeof item?.remarks === "object" ? "" : item?.remarks,
                createdBy:
                  typeof item?.createdBy === "object" ? "" : item?.createdBy,
                createdDate:
                  typeof item?.createdDate === "object"
                    ? null
                    : item?.createdDate,
                handover_date:
                  typeof item?.handover_date === "object"
                    ? null
                    : (item?.handover_date &&
                      moment(item?.handover_date).format(
                        "YYYY-MM-DDTHH:mm:ss.SSS"
                      )) ||
                    moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
                branch_taking_date:
                  typeof item?.branch_taking_date === "object"
                    ? null
                    : (item?.branch_taking_date &&
                      moment(item?.branch_taking_date).format(
                        "YYYY-MM-DDTHH:mm:ss.SSS"
                      )) ||
                    moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
                key_handoverby_name:
                  typeof item?.key_handover_by === "object"
                    ? ""
                    : item?.key_handover_by,
                key_handoverby_id:
                  typeof item?.key_handover_by_id === "object"
                    ? 0
                    : item?.key_handover_by_id,
                key_handover_to:
                  typeof item?.key_handover_to === "object"
                    ? ""
                    : item?.key_handover_to,
                key_handover_to_id:
                  typeof item?.key_handover_to_id === "object"
                    ? 0
                    : item?.key_handover_to_id,
                modifiedBy:
                  typeof item?.modifiedBy === "object" ? "" : item?.modifiedBy,
                modifiedDate:
                  typeof item?.modifiedDate === "object"
                    ? null
                    : item?.modifiedDate,
                name_serial_number:
                  typeof item?.name_serial_number === "object"
                    ? ""
                    : item?.name_serial_number,
                pm_remarks:
                  typeof item?.pm_remarks === "object" ? "" : item?.pm_remarks,
                spoc_remarks:
                  typeof item?.spoc_remarks === "object"
                    ? ""
                    : item?.spoc_remarks,
                status: typeof item?.status === "object" ? "" : item?.status,
              };
            });
          var records = _response?.filter((item) => item?.id !== 0);
          if (records?.length > 0) {
            setIsKeyHandoverChecked(true);
          }
          setTableData(_response || []);
          setFormData({
            remarks: _response?.[0]?.remarks || "",
            spoc_remarks: _response?.[0]?.spoc_remarks || "",
          });
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  return (
    <>
      <div className="card-panel" style={{ padding: "5px" }}>
        <div style={{ margin: "10px" }}>
          <Grid
            container
            item
            display="flex"
            flexDirection="row"
            spacing={1}
            justifyContent="start"
            alignSelf="center"
          >
            <Grid item xs={12} md={12} lg={12} sx={{ position: "relative" }}>
              <div style={{ height: "calc(100vh - 470px)" }}>
                <CommonGrid
                  defaultColDef={{
                    singleClickEdit: true,
                  }}
                  getRowStyle={() => {
                    return { background: "white" };
                  }}
                  components={components}
                  columnDefs={columnDefs}
                  rowData={tableData || []}
                  onGridReady={onGridReady}
                  gridRef={gridRef}
                  pagination={false}
                  paginationPageSize={null}
                />
              </div>

              <Grid
                container
                item
                display="flex"
                flexDirection="row"
                spacing={1}
                marginTop="5px"
                marginBottom="5px"
                justifyContent="start"
                alignSelf="center"
              >
                <Grid
                  item
                  xs={4}
                  md={5}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable">Remarks if any issues</h2>
                    <TextField
                      disabled={
                        action === "Approve" || action === "Approve or Reject"
                      }
                      sx={
                        (action === "Approve" ||
                          action === "Approve or Reject") && {
                          backgroundColor: "#f3f3f3",
                        }
                      }
                      autoComplete="off"                      
                      onKeyDown={(e: any) => {
                        regExpressionRemark(e);
                      }}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      multiline
                      name="remarks"
                      id="remarks"
                      type="text"
                      size="small"
                      value={
                        formData?.remarks !== undefined ? formData?.remarks : ""
                      }
                      onChange={handleChange}
                    />
                  </div>
                </Grid>
                <Grid
                  item
                  xs={5}
                  md={5}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable">
                      Business SPOC Remarks(Incase of rejection)
                    </h2>
                    <TextField
                      autoComplete="off"
                      disabled={
                        user?.role !== "Business Associate" ||
                        user?.role === "Sourcing Associate"
                      }
                      name="spoc_remarks"
                      id="spoc_remarks"
                      type="text"
                      sx={
                        (user?.role !== "Business Associate" ||
                          user?.role === "Sourcing Associate") && {
                          backgroundColor: "#f3f3f3",
                        }
                      }                      
                      onKeyDown={(e: any) => {
                        regExpressionRemark(e);
                      }}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      multiline
                      size="small"
                      value={
                        formData?.spoc_remarks !== undefined
                          ? formData?.spoc_remarks
                          : ""
                      }
                      onChange={handleChange}
                    />
                  </div>
                </Grid>
                <Grid
                  item
                  xs={2}
                  md={2}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  {(action === "" || action === "Create") && (
                    <Button
                      variant="outlined"
                      size="medium"
                      name="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        if (mandateId?.id === undefined) {
                          dispatch(fetchError("Please select Mandate !!!"));
                          return;
                        }
                        saveData();
                      }}
                      style={{
                        marginLeft: 10,
                        marginTop: 35,
                        padding: "2px 20px",
                        borderRadius: 6,
                        color: "#fff",
                        borderColor: "#00316a",
                        backgroundColor: "#00316a",
                      }}
                    >
                      Save Data
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </div>
    </>
  );
};
export default Content;
