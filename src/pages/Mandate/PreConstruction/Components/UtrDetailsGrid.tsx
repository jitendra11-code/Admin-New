import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import TextEditor from "pages/Mandate/PropertyManagment/Components/ProjectPlan/Editors/TextEditor";
import React, { useState } from "react";
import AmountEditor from "./Editor/AmountEditor";
import dayjs, { Dayjs } from "dayjs";
import { Button, Stack, TextField } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@auth0/auth0-react";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { fetchError, showMessage } from "redux/actions";
import workflowFunctionAPICall from "pages/Mandate/workFlowActionFunction";
import moment from "moment";
import Template from "pages/common-components/AgGridUtility/ColumnHeaderWithAsterick";
import { useUrlSearchParams } from "use-url-search-params";

const UtrDetailsGrid = ({ mandateId, currentRemark, currentStatus }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [rtgsData, setRTGSData] = useState([]);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [params] = useUrlSearchParams({}, {});
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [remark, setRemark] = useState("");
  const { user } = useAuthUser();

  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);

  const components = {
    TextEditorCmp: TextEditor,
    AmountEditorCmp: AmountEditor,
  };

  function onGridReady(params: { api: any; columnApi: any }) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    var gridApi = params.api;
    var gridColumnApi = params.columnApi;
    gridRef.current!.api.sizeColumnsToFit();
  }

  const saveRTGSData = (e) => {
    e.preventDefault();
    var data = [...rtgsData];
    var _validationArr;

    data =
      data &&
      data?.length > 0 &&
      data?.map((item) => {
        return {
          id: item?.id || 0,
          uid: item?.uid || "",
          mandetId: mandateId?.id || 0,
          vendor_name: item?.vendor_name || "",
          vendor_category: item?.vendor_category || "",
          vendor_Id: item?.vendor_Id || 0,
          payment_date:
            (item?.payment_date &&
              moment(item?.payment_date).format("YYYY-MM-DDTHH:mm:ss.SSS")) ||
            null,
          amount: (item?.amount && parseInt(item?.amount)) || 0,
          poAmount: (item?.poAmount && parseInt(item?.poAmount)) || 0,
          utR_number: item?.utR_number || "",
          status: (item?.id === 0 ? "Created" : "Updated") || "",
          remarks: item?.remarks || "",
          createdBy: user?.UserName || "",
          createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          modifiedBy: user?.UserName || "",
          modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        };
      });
    _validationArr =
      data &&
      data?.filter(
        (item) =>
          item?.payment_date === null ||
          item?.utR_number === "" ||
          item?.amount === 0
      );
    if (data && data?.length === 0) {
      dispatch(fetchError("No records found"));
      return;
    }
    if (_validationArr && _validationArr?.length > 0) {
      dispatch(fetchError("Please fill all mandatory fields !!!"));
      return;
    }

    let amountCheckArr =
      data && data?.filter((item) => item?.amount > item?.poAmount);
    if (amountCheckArr && amountCheckArr?.length > 0) {
      dispatch(
        fetchError("The payment amount should not be greater than PO Amount")
      );
      return;
    }
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/RTGSDetails/CreateUTRDetails`,
        data
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("No records added"));
        }
        if (response?.data) {
          dispatch(showMessage("Records is added successfully!"));
          workflowFunctionAPICall(
            runtimeId,
            mandateId?.id,
            "Created",
            "Created",
            navigate,
            user
          );
        } else {
          dispatch(fetchError("No records added"));
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  const getRTGSDataByMandate = (id: any) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/RTGSDetails/GetUtrDetails?MandetId=${id}`
      )
      .then((response: any) => {
        if (response && response?.data && response?.data?.length > 0) {
          setRTGSData(response?.data || []);
        } else {
          setRTGSData([]);
        }
      })
      .catch((e: any) => {});
  };

  React.useEffect(() => {
    if (mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid") {
      getRTGSDataByMandate(mandateId?.id);
    }
  }, [mandateId]);
  let columnDefs = [
    {
      field: "vendor_category",
      headerName: "Vendor Category",
      headerTooltip: "Vendor Category",
      flex: 1,
      maxWidth: 200,
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "vendor_name",
      headerName: "Vendor Name Code",
      headerTooltip: "Vendor Name Code",
      sortable: true,
      resizable: true,
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "payment_date",
      headerName: "Date of Payment",
      headerTooltip: "Date of Payment",
      sortable: true,
      headerComponentParams: {
        template: Template,
      },
      editable: false,
      resizable: true,
      maxWidth: 250,
      cellStyle: { fontSize: "13px", cursor: "pointer" },
      cellRendererParams: {
        rtgsData: rtgsData,
        setRTGSData: setRTGSData,
      },
      cellRenderer: (params: any) => (
        <>
          <div style={{ marginTop: 2 }} className="padd-right">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                inputFormat="DD/MM/YYYY"
                maxDate={dayjs()}
                value={params?.rtgsData[params?.rowIndex]?.payment_date || null}
                onChange={(value: Dayjs | null) => {
                  var currentIndex = params?.rowIndex;
                  var data = [...params?.rtgsData];
                  if (value !== null) {
                    data[currentIndex].payment_date = value?.toDate();
                  }
                  params?.setRTGSData(data);
                }}
                renderInput={(textparams) => (
                  <TextField
                    onKeyDown={(e) => e.preventDefault()}
                    error={
                      params?.rtgsData[params?.rowIndex]?.payment_date === null
                    }
                    {...textparams}
                    sx={{
                      ".MuiInputBase-input": {
                        height: "0px !important",
                        fontSize: "12px",
                        paddingLeft: "8px",
                      },
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
      field: "amount",
      headerName: "Amount",
      headerTooltip: "Amount",
      headerComponentParams: {
        template: Template,
      },
      editable: true,
      cellClass: "cell-padding editTextClass",

      cellClassRules: {
        "rag-red": (params) => {
          if (params?.data?.amount === "") {
            return true;
          }
          if (params?.data?.amount?.toString()?.length > 14) {
            return true;
          }
          return false;
        },
      },
      sortable: true,
      resizable: true,
      maxWidth: 200,
      cellStyle: { fontSize: "13px", cursor: "pointer" },
      cellEditor: "AmountEditorCmp",
      cellEditorParams: {
        rtgsData: rtgsData,
        setRTGSData: setRTGSData,
        maxLength: 14,
        type: "number",
      },
    },
    {
      field: "utR_number",
      headerName: "UTR NO.",
      headerTooltip: "UTR NO.",
      headerComponentParams: {
        template: Template,
      },
      sortable: true,
      editable: true,
      cellClassRules: {
        "rag-red": (params) => {
          if (params?.data?.utR_number !== "") {
            return false;
          }

          return true;
        },
      },
      resizable: true,
      maxWidth: 220,
      cellStyle: { fontSize: "13px" },
      cellClass: "cell-padding editTextClass",
      cellEditor: "TextEditorCmp",
      cellEditorParams: {
        rtgsData: rtgsData,
        setRTGSData: setRTGSData,
        maxLength: 30,
        type: "text",
        name: "utr",
      },
    },
    {
      field: "remarks",
      headerName: "Remark",
      headerTooltip: "Remark",
      editable: true,

      sortable: true,
      resizable: true,
      maxWidth: 220,
      cellStyle: { fontSize: "13px" },
      cellClass: "cell-padding editTextClass",
      cellEditor: "TextEditorCmp",
      cellEditorParams: {
        rtgsData: rtgsData,
        setRTGSData: setRTGSData,
        maxLength: 50,
        type: "text",
        name: "remark",
      },
    },

    {
      field: "poAmount",
      headerName: "PO Amount",
      headerTooltip: "PO Amount",
      flex: 1,
      maxWidth: 200,
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
  ];

  const getRowStyle = (params) => {
    return { background: "white" };
  };
  React.useEffect(() => {
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
  }, [mandateId]);

  return (
    <>
      <div style={{ height: "370px", marginTop: 10 }}>
        <CommonGrid
          defaultColDef={{ flex: 1, singleClickEdit: true }}
          components={components}
          columnDefs={columnDefs}
          getRowStyle={getRowStyle}
          rowData={rtgsData || []}
          onGridReady={onGridReady}
          gridRef={gridRef}
          pagination={false}
          paginationPageSize={10}
        />
      </div>

      {userAction?.module === module && (
        <>
          {action && action === "Create" && (
            <div className="bottom-fix-btn">
              <div className="remark-field" style={{ marginRight: "0" }}>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={(e) => {
                    saveRTGSData(e);
                  }}
                  name="submit"
                  style={{
                    marginLeft: 10,
                    padding: "2px 20px",
                    borderRadius: 6,
                    color: "#fff",
                    borderColor: "#00316a",
                    backgroundColor: "#00316a",
                  }}
                >
                  SUBMIT
                </Button>
                {userAction?.stdmsg !== undefined && (
                  <span className="message-right-bottom">
                    {userAction?.stdmsg}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {action === "" && runtimeId === 0 && (
        <>
          <div className="bottom-fix-btn" style={{ padding: "0px" }}>
            <div className="remark-field" style={{ marginRight: 0 }}>
              <Stack
                display="flex"
                flexDirection="row"
                justifyContent="center"
                sx={{ margin: "10px" }}
                style={{ marginLeft: "-2.7%" }}
              >
                <Button
                  variant="contained"
                  onClick={(e) => {
                    saveRTGSData(e);
                  }}
                  size="small"
                  style={{
                    marginLeft: 195,
                    padding: "4px 20px",
                    borderRadius: 6,
                    color: "#fff",
                    borderColor: "#00316a",
                    backgroundColor: "#00316a",
                  }}
                >
                  SUBMIT
                </Button>
              </Stack>
            </div>
          </div>
          {userAction?.stdmsg !== undefined && (
            <span className="message-right-bottom">{userAction?.stdmsg}</span>
          )}
        </>
      )}

      <div
        style={{ bottom: "150px !important" }}
        className="bottom-fix-rtgshistory"
      >
        <MandateStatusHistory
          mandateCode={mandateId?.id}
          accept_Reject_Remark={currentRemark}
          accept_Reject_Status={currentStatus}
        />
      </div>
    </>
  );
};

export default UtrDetailsGrid;
