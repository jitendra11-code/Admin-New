import React, { useEffect } from "react";
import {
  Button,
  Tooltip,
} from "@mui/material";
import { submit } from "shared/constants/CustomColor";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import { TbPencil } from "react-icons/tb";
import { AiOutlineDelete } from "react-icons/ai";
import axios from "axios";
import PenaltyDialog from "./PenaltyDialog";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
import PenaltyHistory from "./PenaltyHistory";
import vendorRemarks from "./editor/vendorRemarks";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { useUrlSearchParams } from "use-url-search-params";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { AppState } from "@auth0/auth0-react";
import FileDownloadList from "./editor/downloadViewPenalty";
import FileUploadAction from "./editor/penaltyUploadAction";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";
import workflowFunctionAPICall from "pages/Mandate/workFlowActionFunction";
const PenaltyDetails = ({ mandateId, currentStatus, currentRemark }) => {
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [penaltyData, setPenaltyData] = React.useState([]);
  const [edit, setEdit] = React.useState(false);
  const [flag, setFlag] = React.useState(false);
  const [index, setIndex] = React.useState(null);
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [userAction, setUserAction] = React.useState(null);
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [params] = useUrlSearchParams({}, {});
  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [remark, setRemark] = React.useState("");
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const dispatch = useDispatch();
  useEffect(() => {
    if (mandateId && mandateId?.id !== undefined) {
      getPenaltyDetails();
    }
  }, [mandateId]);

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

  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );
    return userAction?.runtimeId || 0;
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
  
  const handleSubmit = () => {
    const data = [...penaltyData];
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/UpdateExcelData`,
        data
      )
      .then((response: any) => {
        if (!response) {
          return;
        } else {
          workFlowMandate();
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  const getPenaltyDetails = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/GetPenaltyDetailsByMandateId?mandates_Id=${mandateId?.id}`
      )
      .then((response: any) => {
        if (!response) {
          setPenaltyData([]);

          return;
        } else {
          setPenaltyData([...response?.data]);
        }
      })
      .catch((e: any) => {
      });
  };
  const editrow = (index) => {
    setEdit(true);
    setIndex(index);
  };
  const deleterow = (id) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/DeletePenaltyDetails?Id=${id}`
      )
      .then((res) => {
        if (!res) return;
        else {
          getPenaltyDetails();
        }
      })
      .catch((err) => {});
  };

  const components = {
    vendorRemarks: vendorRemarks,
  };

  let columnDefs = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      flex: 1,
      maxWidth: 80,
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "total_TAT",
      headerName: "Total TAT",
      headerTooltip: "Total TAT",
      flex: 1,
      maxWidth: 200,
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "total_Delays",
      headerName: "Total Number of delays",
      headerTooltip: "Total Number of delays",
      sortable: true,
      resizable: true,
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "penalty_Matrix",
      headerName: "Penalty Matrix",
      headerTooltip: "Penalty Matrix",
      sortable: true,
      resizable: true,      
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "penalty_Amount",
      headerName: "Penalty Amount",
      headerTooltip: "Penalty Amount",
      sortable: true,
      resizable: true,
      maxWidth: 220,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "remarks",
      headerName: "Remarks",
      headerTooltip: "Remarks",
      sortable: true,
      resizable: true,
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "vendor_Remarks",
      headerName: "Vendor Remarks",
      headerTooltip: "Vendor Remarks",
      resizable: true,
      width: 110,
      minWidth: 100,
      cellStyle: { fontSize: "13px", textAlign: "center" },
      cellEditor: "vendorRemarks",
      editable: true,
      cellEditorParams: {
        penaltyData: penaltyData,
        setPenaltyData: setPenaltyData,
        role: user?.role,
        setFlag: setFlag,
        maxLength: 50,
      },
    },
    {
      field: "Action",
      headerName: "Action",
      headerTooltip: "Action",
      sortable: true,
      resizable: true,
      cellRenderer: (params: any) => (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginRight: "10px",
            }}
            className="actions"
          >
            {user?.role !== "Vendor" && (
              <button className="actionsIcons actions-icons-size">
                <TbPencil onClick={(e) => editrow(params?.rowIndex)} />
              </button>
            )}
            {user?.role !== "Vendor" && (
              <button className="actionsIcons-delete actions-icons-size">
                <AiOutlineDelete onClick={(e) => deleterow(params?.data?.id)} />
              </button>
            )}
            <FileUploadAction
              mandateId={mandateId}
             
              params={params}
              index={params?.rowIndex}

            />

            <Tooltip title="Download" className="actionsIcons">
              <FileDownloadList
                props={params?.data}
                mandate={mandateId}
                setTableData={setPenaltyData}
                setFormData={params?.data}
              />
            </Tooltip>
            <Tooltip title="Edit Phase" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize">
                <PenaltyHistory props={params} />
              </button>
            </Tooltip>
          </div>
        </>
      ),
      maxWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
  ];
  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  return (
    <div>
      <PenaltyDialog
        getPenaltyDetails={getPenaltyDetails}
        mandateId={mandateId}
        edit={edit}
        setEdit={setEdit}
        index={index}
        penaltyData={penaltyData}
        role={user?.role}
      />
      <div style={{ height: "calc(100vh - 465px)", marginTop: "10px" }}>
        <CommonGrid
          defaultColDef={{ flex: 1 }}
          components={components}
          columnDefs={columnDefs}
          rowData={penaltyData || []}
          onGridReady={onGridReady}
          gridRef={gridRef}
          pagination={false}
          paginationPageSize={null}
        />
      </div>
      {action !== "Approve" && (
        <div className="bottom-fix-btn">
          <div className="remark-field">
            <Button
              variant="contained"
              size="small"
              style={submit}
              onClick={() => (flag ? handleSubmit() : workFlowMandate())}
            >
              SUBMIT
            </Button>
          </div>
        </div>
      )}

      {action && action === "Approve" && (
        <div className="bottom-fix-btn ptb-0">
          <div className="remark-field" style={{ padding: "15px 0px" }}>
            <>
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
                {userAction?.stdmsg !== undefined && (
                  <span className="message-right-bottom">
                    {userAction?.stdmsg}
                  </span>
                )}
              </>

           
            </>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenaltyDetails;
