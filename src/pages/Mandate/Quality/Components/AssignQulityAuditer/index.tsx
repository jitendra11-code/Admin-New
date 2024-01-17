import { Autocomplete, Button, Grid, TextField } from "@mui/material";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import {
  assignQulityAuditerInitialValues,
} from "@uikit/schemas";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import { useFormik } from "formik";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchError } from "redux/actions";
import moment from "moment";
import { SHOW_MESSAGE } from "types/actions/Common.action";
import workflowFunctionAPICall from "pages/Mandate/workFlowActionFunction";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";
import { AppState } from "@auth0/auth0-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { useUrlSearchParams } from "use-url-search-params";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";

const AssignQulityAuditer = ({ mandateId, currentStatus, currentRemark }) => {
  const gridRef = React.useRef<AgGridReact>(null);
  const [mandateInfo, setMandateInfo] = React.useState(mandateId || null);
  const [history, sethistory] = React.useState<any>([]);
  const [auditorName, setAuditorName] = React.useState([]);
  const [gridApi, setGridApi] = React.useState(null);
  const [values1, setValues] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [updatedData, setUpdatedData] = React.useState<any>({});
  const [userAction, setUserAction] = React.useState(null);
  let { id } = useParams();
  const [poValue, setPoValue] = React.useState<String>("");
  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [remark, setRemark] = React.useState("");
  const [params] = useUrlSearchParams({}, {});
  const location = useLocation();
  let path = window.location.pathname?.split("/");
  let modulePath: any = window.location.pathname?.split("/")[path.length - 1];
  const apiType = location?.state?.apiType || "";

  const { user } = useAuthUser();
  const navigate = useNavigate();
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId  || 0;
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );

  const dispatch = useDispatch();

  React.useEffect(() => {
    if (mandateInfo && mandateInfo?.id !== undefined) {
      const userAction =
        userActionList &&
        userActionList?.find(
          (item) =>
            item?.mandateId === parseInt(mandateInfo?.id) &&
            item?.module === modulePath
        );
      if (apiType === "") {
        setUserAction(userAction);
      } else {
        let action = mandateInfo;
        setUserAction(action);
      }
      if (params.source === "list") {
        navigate(`/mandate/${mandateInfo?.id}/${modulePath}?source=list`, {
          state: { apiType: apiType },
        });
      } else {
        navigate(`/mandate/${mandateInfo?.id}/${modulePath}`, {
          state: { apiType: apiType },
        });
      }
    }
  }, [mandateInfo]);


  React.useEffect(() => {
    if (mandateId !== null && mandateId?.hasOwnProperty("id")) {
      setMandateInfo(mandateId);
    }
  }, [mandateId]);
  const _getAuditorNameList = () => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_BASEURL}/api/User/GetAllWithConditions?Designation=Quality Auditor`,
    }).then((res) => {
      if (res && res.data && res.data.length > 0) {
        setAuditorName(res?.data);
      } else {
        setAuditorName([])
      }
    });
  };

  const getHistory = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/QualityAuditInitiation/GetQualityAuditInitiationByMandateId?Mandates_Id=${mandateInfo?.id}`
      )
      .then((response: any) => {
        setUpdatedData(response?.data?.[0] || {});
        setFieldValue(
          "company",
          response?.data?.[0]?.external_Auditor_Company || ""
        );
      })
      .catch((e: any) => {
      });
  };

  const getAuditorDetails = async () => {
    if (mandateInfo?.id !== undefined && mandateInfo?.id !== "noid")
      await axios
        .get(`${process.env.REACT_APP_BASEURL}/api/QualityAuditInitiation/GetQualityAuditInitiationHistory?mandateId=${mandateInfo?.id}`)
        .then((response: any) => {
          sethistory(response?.data)
        })
        .catch((e: any) => {
        });
  }

  const getPOValue = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PODetails/GetTotalPoDetails?mandateId=${mandateInfo?.id}`
      )
      .then(async (response: any) => {
        setPoValue(response?.data?.total_po_amount);
        setFieldValue("poValue", response?.data?.total_po_amount || "");
        await axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/QualityAuditorMatrix/GetQualityAuditorMatrix?MandetId=${0}&POValue=${response?.data?.total_po_amount ?? 0}`
          )
          .then((res: any) => {
            if (res && res.data && res.data.length > 0) {
              setAuditorName(res?.data);
            } else {
              setAuditorName([])
            }
          })
          .catch((e: any) => {
          });
      })
      .catch((e: any) => {
      });
  };


  React.useEffect(() => {
    if (mandateInfo && mandateInfo?.id !== undefined && mandateInfo?.id !== "noid") {
      getHistory();
      getPOValue();
      _getAuditorNameList();
      getAuditorDetails();
    }
  }, [mandateInfo]);

  const getHeightForTable2 = useCallback(() => {
    var height = 0;
    var dataLength = (history && history?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [history]);

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }


  const {
    values,
    handleBlur,
    handleChange,
    setFieldValue,
    handleSubmit,
    setFieldError,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: assignQulityAuditerInitialValues,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: (values, action) => {
      if (updatedData?.external_Auditor_Company) {
        const body = [
          {
            ...updatedData,
            id: updatedData?.id,
            mandate_Id: mandateInfo?.id,
            pO_Value: values?.poValue || poValue,
            quality_Auditor_Name:
              values?.auditorName?.userFullName ||
              auditorName?.[0]?.userFullName ||
              "userqa",
            external_Auditor_Company: values?.company,
          },
        ];
        if (mandateInfo?.id) {
          axios
            .post(
              `${process.env.REACT_APP_BASEURL}/api/QualityAuditInitiation/UpdateQualityAuditInitiation`,
              body
            )
            .then((response: any) => {
              dispatch({
                type: SHOW_MESSAGE,
                message: "Quality Audit update Successfully!",
              });
              getHistory();
              getAuditorDetails();
              workflowFunctionAPICall(
                runtimeId,
                mandateInfo?.id,
                "Created",
                "Created",
                navigate,
                user
              );

              action.resetForm();
            })
            .catch((e: any) => {
              action.resetForm();
            });
        } else {
          dispatch(fetchError("Please select mandate"));
        }
      } else {
        const body = {
          id: 0,
          mandate_Id: mandateInfo?.id,
          pO_Value: values?.poValue || poValue,
          quality_Auditor_Name:
            values?.auditorName?.userFullName ||
            auditorName?.[0]?.userFullName ||
            "useqa",
          external_Auditor_Company: values?.company,
          status: "string",
        };
        if (mandateInfo?.id) {
          axios
            .post(
              `${process.env.REACT_APP_BASEURL}/api/QualityAuditInitiation/SaveQualityAuditInitiation`,
              body
            )
            .then((response: any) => {
              dispatch({
                type: SHOW_MESSAGE,
                message: "Quality Audit added Successfully!",
              });

              getHistory();
              getAuditorDetails();
              workflowFunctionAPICall(
                runtimeId,
                mandateInfo?.id,
                "Created",
                "Created",
                navigate,
                user
              );
              action.resetForm();
            })
            .catch((e: any) => {
              action.resetForm();
            });
        } else {
          dispatch(fetchError("Please select mandate"));
        }
      }
    },
  });

  let columnDefs2 = [
    {
      field: "quality_Auditor_Name",
      headerName: "Auditor Name",
      headerTooltip: "Auditor Name",
      sortable: true,
      resizable: true,
      width: 500,
      minWidth: 200,
    },
    {
      field: "pO_Value",
      headerName: "PO Value",
      headerTooltip: "PO Value",
      sortable: true,
      resizable: true,
    },
    {
      field: "external_Auditor_Company",
      headerName: "Auditor Company",
      headerTooltip: "Auditor Company",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      headerTooltip: "Created Date",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        return moment(e?.data?.visitDate).format("DD/MM/YYYY");
      },
      width: 400,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
  ];

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="phase-outer" style={{ paddingLeft: "10px" }}>
          <Grid
            marginBottom="2px"
            marginTop="1px"
            container
            item
            spacing={5}
            justifyContent="start"
            alignSelf="center"
          >
            <Grid item xs={6} md={4} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable ">Total PO Value</h2>
                <TextField
                  autoComplete="off"
                  size="small"
                  name="poValue"
                  id="poValue"
                  disabled
                  onChange={handleChange}
                  value={values?.poValue || poValue || 0}
                />
                {touched.poValue && errors.poValue ? (
                  <p className="form-error">{errors.poValue}</p>
                ) : null}
              </div>
            </Grid>
            <Grid item xs={6} md={4} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable ">Auditor Name</h2>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  getOptionLabel={(option) => option?.userFullName?.toString()}
                  disableClearable={true}
                  options={auditorName || []}
                  placeholder="Mandate Code"
                  defaultValue={auditorName?.[0] || null}
                  value={auditorName?.[0] || null}
                  onChange={(e, value) => {
                    {
                      setValues({ ...values1, ["auditorName"]: value });
                      setFieldValue("auditorName", value);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      name="auditorName"
                      id="auditorName"
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: `35 !important` },
                      }}
                      variant="outlined"
                      size="small"
                      onChange={handleChange}
                      value={values?.company}
                    />
                  )}
                />
                {touched.auditorName && errors.auditorName ? (
                  <p className="form-error">Please select Auditor Name</p>
                ) : null}
              </div>
            </Grid>
            <Grid item xs={6} md={4} sx={{ position: "relative" }}>
              <div className="input-form">
                <h2 className="phaseLable ">External Auditor Company</h2>
                <TextField
                  autoComplete="off"
                  size="small"
                  name="company"
                  id="company"
                  onChange={handleChange}
                  value={values?.company}
                  disabled={+poValue > 5000000 ? false : true}
                />
                {touched.company && errors.company ? (
                  <p className="form-error">{errors.company}</p>
                ) : null}
              </div>
            </Grid>
          </Grid>
        </div>

        {userAction?.module === modulePath && (<>
          {action && action === "Create" && (<div className="bottom-fix-btn">
            <div className="remark-field" style={{ marginRight: "0px" }}>

              <Button
                style={{
                  padding: "2px 20px",
                  borderRadius: 6,
                  color: "rgb(255, 255, 255)",
                  borderColor: "rgb(0, 49, 106)",
                  backgroundColor: "rgb(0, 49, 106)",
                }}
                variant="outlined"
                size="small"
                type="submit"
              >
                Submit
              </Button>
              {userAction?.stdmsg !== undefined && (
                <span className="message-right-bottom">
                  {userAction?.stdmsg}
                </span>
              )}
            </div>
          </div>)}
          {action && action === "Approve" && (
            <div className="bottom-fix-btn ptb-0">
              <div className="remark-field" style={{ padding: "15px 0px" }}>
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
                        mandateInfo?.id,
                        remark,
                        "Approved",
                        navigate,
                        user
                      );
                    }}
                    sentBackEvent={() => {
                      workflowFunctionAPICall(
                        runtimeId,
                        mandateInfo?.id,
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
              </div>
            </div>
          )}
        </>)}
      </form>
      <Grid item xs={12} md={12} style={{ marginTop: "20px" }}>
        <h2 className="phaseLable">Assign Quality Auditor Details History</h2>
        <div
          style={{
            height: getHeightForTable2(),
            marginTop: "10px",
            marginBottom: "20px",
          }}
        >
          <CommonGrid
            defaultColDef={{ flex: 1 }}
            columnDefs={columnDefs2}
            rowData={history || []}
            onGridReady={onGridReady}
            gridRef={gridRef}
            pagination={history?.length > 3 ? true : false}
            paginationPageSize={4}
          />
        </div>
        {mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid" && <div className="bottom-fix-history">
          <MandateStatusHistory
            mandateCode={mandateId?.id}
            accept_Reject_Remark={currentRemark}
            accept_Reject_Status={currentStatus}
          />
        </div>}
      </Grid>
    </>
  );
};

export default AssignQulityAuditer;
