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
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@auth0/auth0-react";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";
import workflowFunctionAPICall from "pages/Mandate/workFlowActionFunction";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchError, showMessage } from "redux/actions";
import moment from "moment";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import Template from "pages/common-components/AgGridUtility/ColumnHeaderWithAsterick";
import { useUrlSearchParams } from "use-url-search-params";
import PMRemarkEditor from "pages/Mandate/PropertyManagment/Components/ProjectPlan/Editors/PMRemarkEditor";

const RtgsDetails = ({ mandateId, currentRemark, currentStatus }) => {
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
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [params] = useUrlSearchParams({}, {});
  const [remark, setRemark] = useState("");
  const { user } = useAuthUser();
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);

  
  React.useEffect(() => {
    if (mandateId && mandateId?.id !== undefined) {
      const userAction =
        userActionList &&
        userActionList?.find(
          (item) =>
            item?.mandateId === parseInt(mandateId?.id) &&
            item?.module === module
        );
      if (apiType === "" && userAction !== undefined) {
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

  const components = {
    TextEditorCmp: TextEditor,
    AmountEditorCmp: AmountEditor,
    RemarksEditorCmp : PMRemarkEditor,
  };

  const calculatePinnedBottomData = (gridApi, target: any) => {
    let columnsWithAggregation = ["amount", "seCurityDepositAmount"];
    columnsWithAggregation.forEach((element) => {
      gridApi.forEachNodeAfterFilter((rowNode) => {
        if (rowNode.data[element])
          if (element === "amount") {
            target[element] += Number(rowNode.data[element]);
          } else {
            var rowIndex = rowNode?.rowIndex;
            if (rowIndex === 0) target[element] = rowNode.data[element];
          }
      });
      if (target[element]) target[element] = `${target[element]}`;
    });
    return target;
  };
  const generatePinnedBottomData = (gridApi, gridColumnApi) => {
    let result = {};
    gridColumnApi.getAllGridColumns().forEach((item) => {
      result[item.colId] = null;
    });
    return calculatePinnedBottomData(gridApi, result);
  };

  function onGridReady(params: { api: any; columnApi: any }) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    var gridApi = params.api;
    var gridColumnApi = params.columnApi;
    gridRef.current!.api.sizeColumnsToFit();
    setTimeout(() => {
      let pinnedBottomData = generatePinnedBottomData(gridApi, gridColumnApi);
      gridApi.setPinnedBottomRowData([pinnedBottomData]);
    }, 500);
  }

  const getRTGSDataByMandate = (id: any) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/RTGSDetails/GetRTGSDetails?MandetId=${id}`
      )
      .then((response: any) => {
        if (response && response?.data && response?.data?.length > 0) {
          setRTGSData(response?.data || []);
          let arr = response?.data;
          let sumSalaryData = arr.reduce(function (
            tot: any,
            arr: { amount: any }
          ) {
            return tot + arr.amount;
          },
          0);
          let arr2 = arr.map((obj: any) => ({
            ...obj,
            totalAmount: sumSalaryData,
          }));
          setRTGSData(arr2 || []);
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
      field: "srNo",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      flex: 1,
      maxWidth: 80,
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "landlord_full_name",
      headerName: "Land lord Name",
      headerTooltip: "Land lord Name",
      sortable: true,
      resizable: true,
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "rentToBePaid",
      headerName: "Rent to be paid",
      headerTooltip: "Rent to be paid",
      sortable: true,
      resizable: true,
      maxWidth: 180,
      cellStyle: { fontSize: "13px" },
  },
  {
      field: "securityToBePaid",
      headerName: "Security to be paid",
      headerTooltip: "Security to be paid",
      sortable: true,
      resizable: true,
      maxWidth: 180,
      cellStyle: { fontSize: "13px" },
  },
    {
      field: "paymentDate",
      headerName: "Date of Payment",
      headerTooltip: "Date of Payment",
      sortable: true,
      headerComponentParams: {
        template: Template,
      },
      editable: false,
      resizable: true,
      maxWidth: 180,
      minWidth: 180,
      cellStyle: { fontSize: "13px", cursor: "pointer" },
      cellRendererParams: {
        rtgsData: rtgsData,
        setRTGSData: setRTGSData,
      },
      cellRenderer: (params: any) => (
        <>
          {!params?.node?.rowPinned && (
            <div style={{ marginTop: 2 }} className="padd-right">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  inputFormat="DD/MM/YYYY"
                  maxDate={dayjs()}
                  value={
                    params?.rtgsData[params?.rowIndex]?.paymentDate || null
                  }
                  onChange={(value: Dayjs | null) => {
                    var currentIndex = params?.rowIndex;
                    var data = [...params?.rtgsData];
                    if (value !== null) {
                      data[currentIndex].paymentDate = value?.toDate();
                    }
                    params?.setRTGSData(data);
                  }}
                  renderInput={(textparams) => (
                    <TextField
                      onKeyDown={(e) => e.preventDefault()}
                      error={!params?.rtgsData[params?.rowIndex]?.paymentDate}
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
          )}
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
      editable: (params) => {
        if (params?.node?.rowPinned) {
          return false;
        }
        return true;
      },
      cellClass: (params) =>
        params?.node?.rowPinned === undefined && "cell-padding editTextClass",

      cellClassRules: {
        "rag-red": (params) => {
          if (params?.node?.rowPinned === undefined) {
            if (params?.data?.amount === "") {
              return true;
            }
            if (params?.data?.amount?.toString()?.length > 14) {
              return true;
            }
            return false;
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
        name: "amount",
      },
    },
    {
      field: "utrNo",
      headerName: "UTR NO.",
      headerTooltip: "UTR NO.",
      sortable: true,
      headerComponentParams: {
        template: Template,
      },
      editable: (params) => {
        if (params?.node?.rowPinned) {
          return false;
        }
        return true;
      },
      cellClassRules: {
        "rag-red": (params) => {
          if (params?.node?.rowPinned === undefined) {
            if (params?.data?.utrNo !== undefined) {
              return false;
            }
            return true;
          }
          return false;
        },
      },
      resizable: true,
      maxWidth: 220,
      cellStyle: { fontSize: "13px" },
      cellClass: (params) =>
        params?.node?.rowPinned === undefined &&
        "cell-padding rag-red editTextClass",
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
      editable: (params) => {
        if (params?.node?.rowPinned) {
          return false;
        }
        return true;
      },

      sortable: true,
      resizable: true,
      maxWidth: 220,
      cellStyle: { fontSize: "13px" },
      cellClass: (params) =>
        params?.node?.rowPinned === undefined && "cell-padding editTextClass",
      cellEditor: "RemarksEditorCmp",
      cellEditorParams: {
        rtgsData: rtgsData,
        setRTGSData: setRTGSData,
        maxLength: 50,
        type: "text",
        name: "remark",
      },
    },
    {
      field: "seCurityDepositAmount",
      headerName: "Total SD Amount",
      headerTooltip: "Total SD Amount",
      sortable: true,
      resizable: true,
      maxWidth: 220,
      cellStyle: { fontSize: "13px" },
    },
  ];
  const saveRTGSData = (e) => {
    var data = [...rtgsData];
    var _validationArr;
    var totalPaymentAmout = data.reduce(function (
      tot: any,
      arr: { amount: any }
    ) {
      return tot + parseInt(arr?.amount);
    },
    0);
    var totalSDAmount = data?.[0]?.seCurityDepositAmount;
    if (totalSDAmount === undefined || !Number.isInteger(totalSDAmount)) {
      dispatch(fetchError("Security deposit amount is invalid"));
      return;
    }

    if (totalPaymentAmout > totalSDAmount) {
      dispatch(
        fetchError("Payment amount is greater than security deposit amount")
      );
      return;
    }
    data =
      data &&
      data?.length > 0 &&
      data?.map((item) => {
        return {
          id: item?.id || 0,
          uid: item?.uid || "",
          mandetId: mandateId?.id || 0,
          vendor_name: item?.landlord_full_name || "",
          payment_date:
            (item?.paymentDate &&
              moment(item?.paymentDate).format("YYYY-MM-DDTHH:mm:ss.SSS")) ||
            null,
          amount: (item?.amount && parseInt(item?.amount)) || 0,
          utR_number: item?.utrNo || "",
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
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/RTGSDetails/CreateRTGSDetails`,
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








  const getRowStyle = (params) => {
    return params?.node?.rowPinned
      ? { fontWeight: "bold", fontStyle: "normal", background: "#F5F5F5" }
      : { background: "white" };
  };
  
  return (
    <>
      <div style={{ height: "370px", marginTop: 10 }}>
        <CommonGrid
          onCellEditingStopped={function (params) {
            var gridApi = params.api;
            var gridColumnApi = params.columnApi;
            setTimeout(() => {
              let pinnedBottomData = generatePinnedBottomData(
                gridApi,
                gridColumnApi
              );
              gridApi.setPinnedBottomRowData([pinnedBottomData]);
            }, 500);
          }}
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
        <div className="bottom-fix-btn">
          <div className="remark-field">
            {action && action === "Approve" && (
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
                    remark,
                    "Approved",
                    navigate,
                    user
                  );
                }}
                sentBackEvent={() => {
                  workflowFunctionAPICall(
                    runtimeId,
                    mandateId?.id,
                    remark,
                    "Sent Back",
                    navigate,
                    user
                  );
                }}
              />
            )}
          </div>

          {action && action === "Create" && (
            <>
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
            </>
          )}
        </div>
      )}
      {action === "" && runtimeId === 0 && (
        <>
          <div className="bottom-fix-btn" style={{ padding: "0px" }}>
            <div className="remark-field">
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
                    marginLeft: 230,
                    padding: "2px 20px",
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

export default RtgsDetails;
