import React, { useState } from "react";
import {
  Button,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  TextField,
  Grid,
  TableContainer,
  Autocomplete,
  Tabs,
  Tab,
} from "@mui/material";
import MandateInfo from "pages/common-components/MandateInformation";
import { useNavigate, useParams } from "react-router-dom";
import { useUrlSearchParams } from "use-url-search-params";
import workflowFunctionAPICall from "pages/Mandate/workFlowActionFunction";
import axios from "axios";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import remarksTextfieldEditor from "./editor/remarksTextfieldEditor";
import TextEditor from "pages/Mandate/PropertyManagment/Components/ProjectPlan/Editors/TextEditor";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import { AppState } from "redux/store";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from 'dayjs';
const ItAsset = () => {
  const statusOptions = ["Pending", "Completed"];
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let { id } = useParams();
  const [mandateId, setMandateId] = useState(null);

  const [mandateInfo, setMandateData] = React.useState(null);
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [mileStoneData, setMileStoneData] = React.useState([]);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [remarks, setRemarks] = React.useState({});
  const [flag, setFlag] = React.useState(true);
  const [materialStatusPending, setMaterialStatusPending] = React.useState("");
  const [itAssetDataUpdated, setItAssetDataUpdated] = useState<any>(true);
  const [deliveryDate, setDeliveryDate] = React.useState<Dayjs | null>();
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [params] = useUrlSearchParams({}, {});
  const gridRef = React.useRef<AgGridReact>(null);
  const { user } = useAuthUser();
  const handleChange = (e, seq) => {
    const data = [...mileStoneData];
    mileStoneData[seq - 1].pM_remarks = e?.target?.value;
  };
  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );

    return userAction?.runtimeId || 0;
  };
  const handleStatus = (value, seq, index) => {
    const data = [...mileStoneData];
    data[index].status = value
    setMileStoneData([...data]);
    setMaterialStatusPending(value);
  };


  const components = {
    RemarksEditorCmp: remarksTextfieldEditor,
  };
  let columnDefs = [
    {
      field: "listName",
      headerName: "Task",
      headerTooltip: "Task",
      maxWidth: 200,
      cellRenderer: (e: any) => {
        var list = e?.data?.listName;
        if (list === "Material Delivery Status") {
          setMaterialStatusPending(e?.data?.status);
        }
        return list;
      },

      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "remarks",
      headerName: "Remarks",
      headerTooltip: "Remarks",
      sortable: true,
      cellClass: "editTextClass",
      minWidth: 500,
      cellEditor: "RemarksEditorCmp",
      editable: true,
      cellEditorParams: {
        mileStoneData: mileStoneData,
        setMileStoneData: setMileStoneData,
        materialStatusPending: materialStatusPending,
        maxLength: 50,
      },

      cellStyle: {
        fontSize: "13px",
        cursor: "pointer",
        paddingTop: 3,
        paddingBottom: 3,
      },
    },
    {
      field: "status",
      headerName: "Status",
      headerTooltip: "Status",
      sortable: true,
      resizable: true,
      maxWidth: 400,
      cellRenderer: (params: any) => {
        return (
          <Autocomplete
            sx={{
              ".MuiInputBase-input": {
                height: "12px !important",
                fontSize: "12px",
                paddingLeft: "8px",
              },
            }}
            id="combo-box-demo"
            getOptionLabel={(option) => option?.toString() || ""}
            disableClearable={true}
            disabled={params?.data?.listName === "Installation Status" && params?.mileStoneData?.[0]?.status === "Pending" || (params?.rowIndex == 0 && params?.mileStoneData?.[1]?.status === "Completed")}
            value={params?.mileStoneData?.[params?.rowIndex]?.status || null}
            options={statusOptions || []}
            onChange={(event, value) => {
              var currentIndex = params?.rowIndex
              var data = [...params?.mileStoneData];
              if (value !== null || params?.mileStoneData?.[0]?.status === "Pending" || params?.mileStoneData?.[1]?.status === "Pending")
                data[currentIndex].date = null
              params?.setMileStoneData(data)
              params?.handleStatus(value, params?.data?.sequence, params?.rowIndex);
            }}
            placeholder="Document Type"

            renderInput={(params) => (
              <TextField
                name="status"
                id="status"
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
        );
      },
      cellRendererParams: {
        mileStoneData: mileStoneData,
        handleStatus: handleStatus,
        setMileStoneData: setMileStoneData,
        deliveryDate: deliveryDate,
      },

      cellStyle: { fontSize: "13px", paddingTop: 3, paddingBottom: 3 },
    },
    {
      field: "date",
      headerName: "Delivery/Installation Date",
      headerTooltip: "Delivery/Installation Date",
      sortable: true,
      resizable: true,
      width: 80,
      minWidth: 80,
      cellClass: 'cell-padding',
      cellStyle: { fontSize: "12px" },
      cellRenderer: (params: any) =>

      (
        <>
          <div style={{ marginTop: 2 }} className="padd-right">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker

                //label="Date desktop"
                inputFormat="DD/MM/YYYY"
                //disabled={params?.data?.listName === "Installation Status" && params?.mileStoneData?.[params?.rowIndex]?.status === "Pending"}
                disabled={params?.mileStoneData?.[params?.rowIndex]?.status === "Pending" || (params?.rowIndex == 0 && params?.mileStoneData?.[1]?.status === "Completed")}
                value={params?.mileStoneData?.[params?.rowIndex]?.date || null}
                // onChange={e => {handleChangeDate(e);setSeq(e?.data?.sequence)}}
                onChange={(value: Dayjs | null) => {
                  var currentIndex = params?.rowIndex
                  var data = [...params?.mileStoneData];
                  if (value !== null)
                    data[currentIndex].date = value?.toDate();
                  params?.setMileStoneData(data)

                }}
                renderInput={(paramsText) => <TextField
                  sx={{
                    '.MuiInputBase-input': { height: '12px !important', fontSize: '12px', paddingLeft: '8px' },
                  }}

                  onKeyDown={(e)=>{
                    e.preventDefault();
                  }}

                  {...paramsText}
                  size='small' name='date' />}
              />
            </LocalizationProvider>
          </div>
        </>
      ),

      cellRendererParams: {
        mileStoneData: mileStoneData,
        setMileStoneData: setMileStoneData,
        deliveryDate: deliveryDate,
      }
    },
  ];

  const getItAssetDetails = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ITAsset/GetITAssetsDetails?mandateId=${mandateId?.id}`
      )
      .then((res) => {
        if (!res) {
          return;
        }

        if (res && res?.data && res?.data?.length > 0) {
          var _resData = (res && res?.data) || [];
          let data =
            _resData &&
            _resData.map((item, key) => {
              if (item?.taskName === "Material Delivery Status") {
                setMaterialStatusPending(item?.task_Status);
              }
              return {
                custom_id: key + 1,
                mandateId: 0,
                planId: 0,
                sequence: key + 1,
                section: item?.taskName || "",
                listName: item?.taskName || "",
                date: item?.date && moment(item?.date).format("YYYY-MM-DDTHH:mm:ss.SSS") || null,
                vendorType: "",
                process_Owner: "",
                proposed_Start_Date: null,
                proposed_End_Date: null,
                actual_Start_Date: null,
                actual_End_Date: null,
                status_percentage: 0,
                pM_remarks: item?.remarks,
                remarks: item?.remarks,
                vendor_remarks: "",
                status: item?.task_Status,
                createdBy: "",
                createdDate: "",
                modifiedBy: "",
                modifiedDate: "",
                id: item?.id,
                uid: "",
              };
            });
          setItAssetDataUpdated(true);
          if (data?.length > 0) setMileStoneData(data);
        } else {
          getMileStone();
        }
      })
      .catch((err) => { });
  };

  const handleSubmit = () => {
    if (mandateId?.id) {
      if (itAssetDataUpdated === false) {
        const data = mileStoneData && mileStoneData.map((item) => ({
          uid: "uid",
          id: 0,
          mandateId: mandateId?.id || 0,
          taskName: item?.listName || "",
          date: item?.date && moment(item?.date).format("YYYY-MM-DDTHH:mm:ss.SSS") || null,
          remarks: item?.remarks || "",
          task_Status: item?.status || "",
          status: item?.status || "",
          createdBy: user?.UserName,
          createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          modifiedBy: user?.UserName,
          modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        }));

        axios
          .post(
            `${process.env.REACT_APP_BASEURL}/api/ITAsset/CreateITAssetsDetails`,
            data,
            {
              responseType: "arraybuffer",
            }
          )
          .then((res) => {
            if (res) {
              dispatch(showMessage("Record is added successfully!"));
              workFlowMandate();
            } else {
              dispatch(fetchError("Record is not added!"));
              return;
            }
          })
          .catch((err) => {
            dispatch(fetchError("Error Ocurred !!!"));
          });
      } else {
        const data = mileStoneData.map((item) => ({
          uid: "uid",
          id: item?.id || 0,
          mandateId: mandateId?.id,
          taskName: item?.listName,
          date: item?.date && moment(item?.date).format("YYYY-MM-DDTHH:mm:ss.SSS") || null,
          remarks: item?.remarks,
          task_Status: item?.status,
          status: item?.status,
          createdBy: user?.UserName ,
          createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          modifiedBy: user?.UserName ,
          modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        }));

        if (!itAssetDataUpdated) {
          const data = mileStoneData && mileStoneData.map((item) => ({
            uid: "uid",
            id: 0,
            mandateId: mandateId?.id || 0,
            taskName: item?.listName || "",
            date: item?.date && moment(item?.date).format("YYYY-MM-DDTHH:mm:ss.SSS") || null,
            remarks: item?.remarks || "",
            task_Status: item?.status || "",
            status: item?.status || "",
            createdBy: user?.UserName ,
            createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            modifiedBy: user?.UserName ,
            modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          }));

          axios
            .post(
              `${process.env.REACT_APP_BASEURL}/api/ITAsset/CreateITAssetsDetails`,
              data,
            )
            .then((res) => {
              if (res) {
                dispatch(showMessage("Record is added successfully!"));
                workFlowMandate();
              } else {
                dispatch(fetchError("Record is not added!"));
                return;
              }
            })
            .catch((err) => {
              dispatch(fetchError("Error Ocurred !!!"));
            });
        } else {
          const data = mileStoneData && mileStoneData.map((item) => ({
            uid: "uid",
            id: item?.id || 0,
            mandateId: mandateId?.id,
            taskName: item?.listName,
            date: item?.date && moment(item?.date).format("YYYY-MM-DDTHH:mm:ss.SSS") || null,
            remarks: item?.remarks,
            task_Status: item?.status,
            status: item?.status,
            createdBy: user?.UserName ,
            createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            modifiedBy: user?.UserName ,
            modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          }));

          axios
            .post(
              `${process.env.REACT_APP_BASEURL}/api/ITAsset/UpdateITAssetsDetails`,
              data,
            )
            .then((res) => {
              if (res) {
                dispatch(showMessage("Record is updated successfully!"));
                workFlowMandate();
              } else {
                dispatch(fetchError("Record is not updated!"));
                return;
              }
            })
            .catch((err) => {
              dispatch(fetchError("Error Ocurred !!!"));
            });
        }

      }
    }
  };

  const getMileStone = () => {
    setItAssetDataUpdated(false);
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ITAsset/GetITAssets?Type=IT Asset&PartnerCategory=IT Asset Vendor`
      )
      .then((res) => {
        if (!res) return;
        if (res && res?.data && res?.data?.length > 0) {
          var _resData = (res && res?.data) || [];
          let data =
            _resData &&
            _resData.map((item, key) => {
              return {
                custom_id: key + 1,
                mandateId: 0,
                planId: 0,
                sequence: key + 1,
                section: item?.listName || "",
                listName: item?.listName || "",
                vendorType: item?.partnerCategory || "",
                process_Owner: "",
                proposed_Start_Date: null,
                proposed_End_Date: null,
                actual_Start_Date: null,
                actual_End_Date: null,
                status_percentage: 0,
                pM_remarks: "",
                vendor_remarks: "",
                status: item?.status,
                createdBy: "",
                createdDate: "",
                modifiedBy: "",
                modifiedDate: "",
                id: 0,
                uid: "",
              };
            });
          setMileStoneData(data || []);
        } else {
          setMileStoneData([]);
        }
      })
      .catch((err) => { });
  };

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateId(id);
    }
  }, []);

  React.useEffect(() => {
    if (
      mandateId !== null &&
      mandateId?.id !== undefined &&
      mandateId?.id !== "noid"
    )
      getItAssetDetails();
  }, [mandateId]);

  const workFlowMandate = () => {
    const token = localStorage.getItem("token");
    const body = {
      runtimeId: _getRuntimeId(mandateId?.id) || 0,
      mandateId: mandateId?.id || 0, 
      tableId: mandateId?.id || 0,
      remark: "Created" || "",
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
        if (!response) return;
        if (response?.data === true) {
          navigate("/list/task");
        } else {
          dispatch(fetchError("Error Occurred !"));
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  return (
    <div>
      <Box
        component="h2"
        sx={{
          fontSize: 15,
          color: "text.primary",
          fontWeight: "600",
          px: 2,
          pt: 3,
          mb: {
            xs: 4,
            lg: 2,
          },
        }}
      >
        IT Asset Status
      </Box>
      <div
        style={{
          padding: "10px !important",
          border: "1px solid rgba(0, 0, 0, 0.12)",
        }}
        className="card-panal inside-scroll-194"
      >
        <MandateInfo
          mandateCode={mandateId}
          pageType=""
          source=""
          redirectSource={`${params?.source}`}
          setMandateCode={setMandateId}
          setMandateData={setMandateData}
          setpincode={() => { }}
          setCurrentStatus={setCurrentStatus}
          setCurrentRemark={setCurrentRemark}
        />
        <div
          className="it-asset-table"
          style={{ height: "calc(100vh - 434px)", marginTop: "10px" }}
        >
          <CommonGrid
            getRowId={(data) => {
              return data && data?.data?.custom_id;
            }}
            getRowStyle={() => {
              return { background: "white" }
            }}
            components={components}
            rowHeight={36}
            defaultColDef={{
              singleClickEdit: true,
              flex: 1,
            }}
            columnDefs={columnDefs}
            onCellValueChanged={function (params) {
              params.api.redrawRows();
            }}
            rowData={mileStoneData || []}
            onGridReady={onGridReady}
            gridRef={gridRef}
            pagination={false}
            paginationPageSize={null}
          />
        </div>
        <div className="bottom-fix-history">
          <MandateStatusHistory
            mandateCode={mandateId?.id}
            accept_Reject_Remark={currentRemark}
            accept_Reject_Status={currentStatus}
          />
        </div>
        <div className="bottom-fix-btn">
          <Button
            variant="outlined"
            size="medium"
            onClick={handleSubmit}
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
        </div>
      </div>
    </div>
  );
};

export default ItAsset;
