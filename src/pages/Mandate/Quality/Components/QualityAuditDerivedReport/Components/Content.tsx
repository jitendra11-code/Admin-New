import React, { useState } from "react";
import { Grid, Button, TextField, Stack } from "@mui/material";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import RatingEditor from "./Editor/RatingEditor";
import RemarkEditor from "./Editor/RemarkEditor";
import { AppState } from "redux/store";
import { useDispatch, useSelector } from "react-redux";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import { useUrlSearchParams } from "use-url-search-params";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import moment from "moment";
import axios from "axios";
import { fetchError, showMessage } from "redux/actions";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";
import workflowFunctionAPICall from "pages/Mandate/workFlowActionFunction";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayJs, { Dayjs } from "dayjs";
import regExpressionTextField, {
  textFieldValidationOnPaste, regExpressionRemark
} from "@uikit/common/RegExpValidation/regForTextField";
import Template from "pages/common-components/AgGridUtility/ColumnHeaderWithAsterick";
import blockInvalidChar from "pages/Mandate/Location/Components/blockInvalidChar ";

const QualityAuditDerivedReportCmp = ({
  mandate,
  mandateInfo,
  currentStatus,
  currentRemark,
}) => {
  const navigate = useNavigate();
  const [remark, setRemark] = useState("");

  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const gridRef = React.useRef<AgGridReact>(null);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const [snagCount, setSnagCount] = useState(null);
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [params] = useUrlSearchParams({}, {});
  const { id } = useParams();
  const { user } = useAuthUser();
  const [mandateId, setMandateId] = React.useState(null);
  const [value, setValue] = React.useState<string>("4");
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const dispatch = useDispatch();
  const [error, setError] = useState<any>({});
  const [count, setCount] = useState(0);
  const [printButton, setPrintButton] = useState(false);
  const [formData, setFormData] = React.useState<any>({
    branchOffice: "",
    admin_spoc: "",
    admin_rep_audit: "",
    tko_name: "",
    no_of_days_taken: "",
    tkO_representive: "",
    no_snag_defectes: "",
    rectification_esitimated_days: "",
    rectification_actual_days: "",
    carpet_area: "",
    no_of_defects: "",
    branch_category: "",
    observation: "",
    remarks: "",
  });

  const [qualityDerivedReportTable, setQualityDerivedReportTable] =
    React.useState([]);

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
  const components = {
    RatingEditorCmp: RatingEditor,
    RemarkEditorCmp: RemarkEditor,
  };

  React.useEffect(() => {
    if (mandate !== null && mandate?.hasOwnProperty("id")) {
      setMandateId(mandate);
      getQualityDerivedReportByMandate(mandate?.id);
    }
  }, [mandate]);

  let columnDefs = [
    {
      field: "",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      resizable: true,
      maxWidth: 80,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "category",
      headerName: "Category",
      headerTooltip: "Category",
      tooltipField: "category",
      resizable: true,
      width: 130,
      minWidth: 130,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "parameter",
      headerName: "Parameters",
      headerTooltip: "Parameters",
      tooltipField: "parameter",
      sortable: true,
      resizable: true,
      width: 130,
      minWidth: 130,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "rating",
      headerName: "Rating",
      headerTooltip: "Rating",
      tooltipField: "rating",
      headerComponentParams: {
        template: Template,
      },
      sortable: true,
      resizable: true,
      editable: true,
      width: 130,
      minWidth: 130,
      cellClass: "editTextClass",
      cellStyle: {
        fontSize: "13px",
        cursor: "pointer",
        width: "250px",
        paddingTop: "0px",
        alignItem: "center",
        left: "685px",
        display: "flow-root !important",
      },
      cellEditor: "RatingEditorCmp",
      cellEditorParams: {
        type: "number",
        maxLength: 1,
      },
    },

    {
      field: "remarks",
      headerName: "Count with Remarks/Advice (if any)",
      headerTooltip: "Count with Remarks/Advice (if any)",
      tooltipField: "remarks",
      sortable: true,
      resizable: true,
      editable: true,
      width: 130,
      minWidth: 130,
      cellClass: "editTextClass",
      cellStyle: {
        fontSize: "13px",
        cursor: "pointer",
        width: "251px",
        paddingTop: "0px",
        alignItem: "center",
        left: "980px",
        display: "flow-root !important",
      },
      cellEditor: "RemarkEditorCmp",
      cellEditorParams: {
        type: "text",
        maxLength: 70,
      },
    },
  ];

  const handleDateChange = (newValue: Dayjs | null, name) => {
    if (newValue !== null && dayJs(newValue).isValid())
      formData[name] = newValue?.toDate();
    setFormData({ ...formData });
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError({ ...error, [name]: "" });
  };

  const _saveQualityAuditDerivedReportTableData = (fk_id) => {
    var body;
    body =
      qualityDerivedReportTable &&
      qualityDerivedReportTable.map((item, index) => {
        return {
          id: 0,
          uid: item?.uid || "",
          fk_Quality_Audit_Derived_Id: fk_id || 0,
          sequence: index + 1 || 0,
          category: item?.category || "",
          parameter: item?.parameter || "",
          rating: (item?.rating && parseInt(item?.rating)) || 0,
          remarks: item?.remarks || "",
          status: "",
          createdBy: user?.UserName || "",
          createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          modifiedBy: user?.UserName || "",
          modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        };
      });

    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/QualityAuditDerivedReport/InsertUpdateQualityAuditDerivedParametrs`,
        body
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data) {
          workFlowMandate();
        } else {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  const _saveQualityAuditDerivedReport = (e) => {
    var count = _validation();
    if (count > 0) {
      return false;
    }
    var ratingValidation =
      qualityDerivedReportTable &&
      qualityDerivedReportTable.filter(
        (item) => item?.rating !== undefined && item?.rating !== 0
      );

    var body;
    body = {
      id: formData?.id || 0,
      uid: "",
      mandetId: mandateId?.id || 0,
      date: moment(formData?.date).format("YYYY-MM-DDTHH:mm:ss.SSS"),
      branchoffice: formData?.branchOffice || "",
      spoc_execution: formData?.admin_rep_audit || "",
      spoc_audit: formData?.admin_spoc || "",
      tkO_name: formData?.tko_name || "string",
      tkO_start_date: moment(formData?.tko_start_date).format(
        "YYYY-MM-DDTHH:mm:ss.SSS"
      ),
      tkO_completion_date: moment(formData?.tko_completion_date).format(
        "YYYY-MM-DDTHH:mm:ss.SSS"
      ),
      site_handover_date: moment(formData?.site_hand_over_date).format(
        "YYYY-MM-DDTHH:mm:ss.SSS"
      ),
      days_taken:
        (formData?.no_of_days_taken && parseInt(formData?.no_of_days_taken)) ||
        0,
      tkO_representative: formData?.tkO_representive || "string",
      snag_m_count: snagCount?.medium || 0,
      snag_l_count: snagCount?.low || 0,
      snag_h_count: snagCount?.high || 0,
      estimated_days:
        (formData?.rectification_esitimated_days &&
          parseInt(formData?.rectification_esitimated_days)) ||
        0,
      actual_days:
        (formData?.rectification_actual_days &&
          parseInt(formData?.rectification_actual_days)) ||
        0,
      actual_date_rectification: moment(
        formData?.actual_date_rectification
      ).format("YYYY-MM-DDTHH:mm:ss.SSS"),
      carpet_area:
        (formData?.carpet_area && parseInt(formData?.carpet_area)) || 0,
      total_no_of_defects:
        (formData?.no_of_defects && parseInt(formData?.no_of_defects)) || 0,
      observations: formData?.observation || "",
      remarks: formData?.remarks || "",
      status: "",
      createdBy: user?.UserName || "",
      createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      modifiedBy: user?.UserName || "",
      modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
    };

    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/QualityAuditDerivedReport/CreateUpdateQualityDerivedReport`,
        body
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data?.status === true) {
          dispatch(
            showMessage("Quality audit derived report added successfully!")
          );
          let tableId = response?.data?.data?.id;
          _saveQualityAuditDerivedReportTableData(tableId);
        } else {
          dispatch(fetchError("Error Occurred !"));
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  const _validation = () => {
    let temp = {
      branchOffice: "",
      admin_spoc: "",
      admin_rep_audit: "",
      no_of_days_taken: "",
      tko_name: "",
      tko_completion_date: "",
      site_hand_over_date: "",
      tkO_representive: "",
      no_snag_defectes: "",
      rectification_esitimated_days: "",
      rectification_actual_days: "",
      actual_date_rectification: "",
      carpet_area: "",
      no_of_defects: "",
      observation: "",
      remarks: "",
    };
    let no = 0;
    if (
      formData.branchOffice === undefined ||
      formData.branchOffice === "" ||
      formData.branchOffice === null
    ) {
      no++;

      temp = { ...temp, ["branchOffice"]: "Please enter Branch Office" };
    }
    if (
      formData.admin_spoc === undefined ||
      formData.admin_spoc === "" ||
      formData.admin_spoc === null
    ) {
      no++;
      temp = { ...temp, ["admin_spoc"]: "Please enter Admin SPOC (Execution)" };
    }

    if (
      formData.admin_rep_audit === undefined ||
      formData.admin_rep_audit === "" ||
      formData.admin_rep_audit === null
    ) {
      no++;
      temp = {
        ...temp,
        ["admin_rep_audit"]: "Please enter Admin REP (Audit)",
      };
    }

    if (
      formData.no_of_days_taken === undefined ||
      formData.no_of_days_taken === "" ||
      formData.no_of_days_taken === null
    ) {
      no++;
      temp = {
        ...temp,
        ["no_of_days_taken"]: "Please enter No of Days Taken",
      };
    }

    if (
      formData.tko_name === undefined ||
      formData.tko_name === "" ||
      formData.tko_name === null
    ) {
      no++;
      temp = { ...temp, ["tko_name"]: "Please enter Name of TKO" };
    }

    if (
      formData.tkO_representive === undefined ||
      formData.tkO_representive === "" ||
      formData.tkO_representive === null
    ) {
      no++;
      temp = {
        ...temp,
        ["tkO_representive"]: "Please enter TKO repres. at the time of Audit",
      };
    }

    if (
      formData.no_snag_defectes === undefined ||
      formData.no_snag_defectes === "" ||
      formData.no_snag_defectes === null
    ) {
      no++;
      temp = {
        ...temp,
        ["no_snag_defectes"]: "Please enter No of Snags/Defects",
      };
    }

    if (
      formData.rectification_esitimated_days === undefined ||
      formData.rectification_esitimated_days === "" ||
      formData.rectification_esitimated_days === null
    ) {
      no++;
      temp = {
        ...temp,
        ["rectification_esitimated_days"]:
          "Please enter Estimated Days for Rectification",
      };
    }

    if (
      formData.rectification_actual_days === undefined ||
      formData.rectification_actual_days === "" ||
      formData.rectification_actual_days === null
    ) {
      no++;
      temp = {
        ...temp,
        ["rectification_actual_days"]:
          "Please enter Actual Days Taken for Rectification",
      };
    }

    if (
      formData.carpet_area === undefined ||
      formData.carpet_area === "" ||
      formData.carpet_area === null
    ) {
      no++;
      temp = { ...temp, ["carpet_area"]: "Please enter Carpet Area" };
    }

    if (
      formData.no_of_defects === undefined ||
      formData.no_of_defects === "" ||
      formData.no_of_defects === null
    ) {
      no++;
      temp = {
        ...temp,
        ["no_of_defects"]: "Please enter Total No. of Defects",
      };
    }
    if (
      formData.tko_completion_date === undefined ||
      formData.tko_completion_date === "" ||
      formData.tko_completion_date === null
    ) {
      no++;
      temp = {
        ...temp,
        ["tko_completion_date"]: "Please enter TKO Completion Date",
      };
    }
    if (
      formData.site_hand_over_date === undefined ||
      formData.site_hand_over_date === "" ||
      formData.site_hand_over_date === null
    ) {
      no++;
      temp = {
        ...temp,
        ["site_hand_over_date"]: "Please enter Site Handover Date",
      };
    }
    if (
      formData.actual_date_rectification === undefined ||
      formData.actual_date_rectification === "" ||
      formData.actual_date_rectification === null
    ) {
      no++;
      temp = {
        ...temp,
        ["actual_date_rectification"]:
          "Please enter Actual Date of Rectification",
      };
    }

    if (
      formData.observation === undefined ||
      formData.observation === "" ||
      formData.observation === null
    ) {
      no++;
      temp = { ...temp, ["observation"]: "Please enter observation" };
    }

    if (
      formData.remarks === undefined ||
      formData.remarks === "" ||
      formData.remarks === null
    ) {
      no++;
      temp = { ...temp, ["remarks"]: "Please enter Remarks" };
    }
    setError({ ...error, ...temp });
    return no;
  };

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
        if (!response) return;
        if (response?.data === true) {
          navigate("/list/task");
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  const handleTab = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  const getQualityDerivedReportParamsTableList = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/QualityAuditDerivedReport/GetQualityAuditParametersMasterList`
      )
      .then((response: any) => {
        if (response && response?.data && response?.data?.length > 0) {
          var _res = response?.data || [];
          _res = _res.map((item) => {
            return {
              ...item,
              rating: "",
              remarks: "",
            };
          });
          setQualityDerivedReportTable(_res || []);
        } else {
          setQualityDerivedReportTable([]);
        }
      })
      .catch((e: any) => { });
  };

  const getQualityDerivedReportByMandate = (id) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/QualityAuditDerivedReport/GetQualityDerivedReport?mandateId=${id || 0
        }`
      )
      .then((response: any) => {
        if (response && response?.data && response?.data?.length > 0) {
          setPrintButton(true);
          var item = response?.data?.[0];
          setFormData({
            ...item,
            id: item?.id || 0,
            uid: item?.uid || "",
            date: moment(item?.date).format("YYYY-MM-DDTHH:mm:ss.SSS"),
            branchOffice: item?.branchoffice || "",
            carpet_area: item?.carpet_area || 0,
            spoc_execution: item?.spoc_execution || "",
            admin_rep_audit: item?.spoc_audit || "",
            admin_spoc: item?.spoc_execution || "",
            tko_name: item?.tkO_name || "",
            tko_start_date: moment(item?.tkO_start_date).format(
              "YYYY-MM-DDTHH:mm:ss.SSS"
            ),
            tko_completion_date: moment(item?.tkO_completion_date).format(
              "YYYY-MM-DDTHH:mm:ss.SSS"
            ),
            site_hand_over_date: moment(item?.site_handover_date).format(
              "YYYY-MM-DDTHH:mm:ss.SSS"
            ),
            no_of_days_taken: item?.days_taken || 0,
            tkO_representive: item?.tkO_representative || "",
            no_snag_defectes: `High: ${item?.snag_h_count} Medium: ${item?.snag_m_count} Low:${item?.snag_l_count}`,
            rectification_esitimated_days: item?.estimated_days || 0,
            actual_date_rectification: moment(
              item?.actual_date_rectification
            ).format("YYYY-MM-DDTHH:mm:ss.SSS"),
            no_of_defects: item?.total_no_of_defects || 0,
            branch_category: "",
            rectification_actual_days: item?.actual_days || 0,
            observation: item?.observations || "",
            remarks: item?.remarks || "",
          });

          let qualityDerivedReportId = response?.data?.[0]?.id || 0;
          getQualityDerivedReportTableDataById(qualityDerivedReportId);
        } else {
          setPrintButton(false);
          axios
            .get(
              `${process.env.REACT_APP_BASEURL
              }/api/QualityAuditReport/GetQualityReport?mandateId=${id || 0}`
            )
            .then((response: any) => {
              if (response && response?.data && response?.data?.length > 0) {
                const result = response?.data;
                setFormData((state) => ({
                  ...state,
                  carpet_area: result[0]?.carpet_area || 0,
                  branchOffice: result[0].branch_office || "",
                  tkO_representive: result[0].tkO_Resepresentative || "",
                  tko_start_date:
                    result[0].tkO_start_date &&
                    moment(result[0].tkO_start_date).isValid() &&
                    moment(result[0].tkO_start_date).format(
                      "YYYY-MM-DDTHH:mm:ss.SSS"
                    ),
                }));
              }
            });
          axios
            .get(
              `${process.env.REACT_APP_BASEURL
              }/api/QualityAuditReport/GetImpactCount?mandateId=${id || 0}`
            )
            .then((response: any) => {
              if (response && response?.data && response?.data?.length > 0) {
                const item = response?.data?.[0];
                setSnagCount(item);
                let no_of_defectsValue =
                  item?.high + item?.low + item?.medium || 0;
                setFormData((state) => ({
                  ...state,
                  no_of_defects:
                    no_of_defectsValue && parseInt(no_of_defectsValue),
                  no_snag_defectes: `High: ${item?.high}, Medium: ${item?.medium}, Low:${item?.low}`,
                }));
              }
            });
          setFormData({
            admin_spoc: "",
            admin_rep_audit: "",
            tko_name: "",
            no_of_days_taken: "",
            tkO_representive: "",
            rectification_esitimated_days: "",
            rectification_actual_days: "",
            carpet_area: "",
            no_of_defects: "",
            branch_category: "",
            observation: "",
            remarks: "",
          });
          getQualityDerivedReportParamsTableList();
        }
      })
      .catch((e: any) => { });
  };
  const getQualityDerivedReportTableDataById = (id) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/QualityAuditDerivedReport/GetQualityAuditDerivedParameters?QualityDerivedId=${id}`
      )
      .then((response: any) => {
        if (response && response?.data && response?.data?.length > 0) {
          var _res = response?.data || [];
          setQualityDerivedReportTable(_res || []);
        } else {
          setQualityDerivedReportTable([]);
        }
      })
      .catch((e: any) => { });
  };

  const onPrint = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/QualityAuditDerivedReport/getPDFReportQualityDerivedReport?mandateId=${mandateId?.id || 0
        }`
      )
      .then((res) => {
        const linkSource = `data:application/pdf;base64,${res?.data}`;
        const downloadLink = document.createElement("a");
        const fileName = `Quality_Audit_${mandateId?.id}.pdf`;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
        dispatch(showMessage("Download Quality Audit Successfully!"));
      })
      .catch((err) => {
      });
  };

  const handleKeyDown = (event) => {
    if (event.key === ' ' && event.target.selectionStart === 0) {
      event.preventDefault();
    }
  };

  const handleKeyDown1 = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <div style={{ padding: "10px !important" }} className="card-panal">
        <>
          <form>
            <div className="phase-outer" style={{ paddingLeft: "10px" }}>
              <Grid
                container
                item
                display="flex"
                flexDirection="row"
                spacing={5}
                marginTop="0px"
                justifyContent="start"
                alignSelf="center"
              >
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">Date</h2>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        className="w-85"

                        inputFormat="DD/MM/YYYY"
                        value={formData["date"]}
                        onChange={(e) => handleDateChange(e, "date")}
                        renderInput={(params) => (
                          <TextField onKeyDown={handleKeyDown1} {...params} size="small" />
                        )}
                      />
                    </LocalizationProvider>
                  </div>
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{
                    paddingLeft: "10px",
                  }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">Branch Office</h2>
                    <TextField
                      autoComplete="off"
                      name="branchOffice"
                      disabled
                      onKeyDown={(e: any) => {
                        regExpressionTextField(e);
                      }}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      id="branchOffice"
                      type="text"
                      size="small"
                      value={
                        formData.branchOffice !== undefined
                          ? formData.branchOffice
                          : ""
                      }
                      onChange={handleChange}
                    />
                  </div>
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">
                      Admin SPOC (Execution)
                    </h2>
                    <TextField
                      autoComplete="off"
                      name="admin_spoc"
                      id="admin_spoc"
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      type="text"
                      size="small"
                      value={
                        formData.admin_spoc !== undefined
                          ? formData.admin_spoc
                          : ""
                      }
                      onChange={handleChange}
                      onKeyDown={(e: any) => { handleKeyDown(e); regExpressionTextField(e) }}
                    />
                  </div>
                  {error?.admin_spoc && error?.admin_spoc ? (
                    <p className="form-error">{error?.admin_spoc}</p>
                  ) : null}
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">Admin REP (Audit)</h2>
                    <TextField
                      autoComplete="off"
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      name="admin_rep_audit"
                      id="admin_rep_audit"
                      type="text"
                      size="small"
                      value={
                        formData.admin_rep_audit !== undefined
                          ? formData.admin_rep_audit
                          : ""
                      }
                      onChange={handleChange}
                      onKeyDown={(e: any) => { handleKeyDown(e); regExpressionTextField(e) }}
                    />
                  </div>
                  {error?.admin_rep_audit && error?.admin_rep_audit ? (
                    <p className="form-error">{error?.admin_rep_audit}</p>
                  ) : null}
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">Name of TKO</h2>
                    <TextField
                      autoComplete="off"
                      name="tko_name"
                      id="tko_name"
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      type="text"
                      size="small"
                      value={
                        formData.tko_name !== undefined ? formData.tko_name : ""
                      }
                      onChange={handleChange}
                      onKeyDown={(e: any) => { handleKeyDown(e); regExpressionTextField(e) }}
                    />
                  </div>
                  {error?.tko_name && error?.tko_name ? (
                    <p className="form-error">{error?.tko_name}</p>
                  ) : null}
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">TKO Start Date</h2>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        className="w-85"
                        disabled
                        inputFormat="DD/MM/YYYY"
                        value={formData["tko_start_date"]}
                        onChange={(e) => handleDateChange(e, "tko_start_date")}
                        renderInput={(params) => (
                          <TextField
                            sx={{
                              backgroundColor: "#f3f3f3",
                              borderRadius: "6px",
                            }}
                            {...params}
                            size="small"
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </div>
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">TKO Completion Date</h2>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        className="w-85"
                        inputFormat="DD/MM/YYYY"
                        minDate={formData["tko_start_date"]}
                        value={formData["tko_completion_date"] || null}
                        onChange={(e) =>
                          handleDateChange(e, "tko_completion_date")
                        }
                        renderInput={(params) => (
                          <TextField onKeyDown={handleKeyDown1} {...params} size="small" />
                        )}
                      />
                    </LocalizationProvider>
                  </div>
                  {error?.tko_completion_date && error?.tko_completion_date ? (
                    <p className="form-error">{error?.tko_completion_date}</p>
                  ) : null}
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">Site Handover Date</h2>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        className="w-85"
                        inputFormat="DD/MM/YYYY"
                        value={formData["site_hand_over_date"] || null}
                        onChange={(e) =>
                          handleDateChange(e, "site_hand_over_date")
                        }
                        renderInput={(params) => (
                          <TextField onKeyDown={handleKeyDown1} {...params} size="small" />
                        )}
                      />
                    </LocalizationProvider>
                  </div>
                  {error?.site_hand_over_date && error?.site_hand_over_date ? (
                    <p className="form-error">{error?.site_hand_over_date}</p>
                  ) : null}
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">No of Days Taken</h2>
                    <TextField
                      autoComplete="off"
                      name="no_of_days_taken"
                      id="no_of_days_taken"
                      type="number"
                      size="small"
                      value={
                        formData?.no_of_days_taken !== undefined
                          ? formData.no_of_days_taken
                          : ""
                      }
                      onChange={handleChange}
                      onKeyDown={(e: any) => {                        
                        blockInvalidChar(e);
                        if (!/[0-9]/.test(e.key)) {
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
                  {error?.no_of_days_taken && error?.no_of_days_taken ? (
                    <p className="form-error">{error?.no_of_days_taken}</p>
                  ) : null}
                </Grid>

                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">
                      TKO repres. at the time of Audit
                    </h2>
                    <TextField
                      autoComplete="off"
                      name="tkO_representive"
                      id="tkO_representive"
                      type="text"
                      disabled
                      onKeyDown={(e: any) => {                        
                        regExpressionTextField(e);
                      }}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      size="small"
                      value={
                        formData.tkO_representive !== undefined
                          ? formData.tkO_representive
                          : ""
                      }
                      onChange={handleChange}
                    />
                  </div>
                </Grid>

                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">No of Snags/Defects</h2>
                    <TextField
                      autoComplete="off"
                      disabled
                      name="no_snag_defectes"
                      id="no_snag_defectes"
                      type="text"
                      size="small"
                      value={formData?.no_snag_defectes || ""}
                      onChange={handleChange}
                    />
                  </div>
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">
                      Estimated Days for Rectification
                    </h2>
                    <TextField
                      autoComplete="off"
                      name="rectification_esitimated_days"
                      id="rectification_esitimated_days"
                      type="number"
                      size="small"
                      value={
                        formData?.rectification_esitimated_days !== undefined
                          ? formData.rectification_esitimated_days
                          : ""
                      }
                      onChange={handleChange}
                      onKeyDown={(e: any) => {
                        blockInvalidChar(e);
                        if (!/[0-9]/.test(e.key)) {
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
                  {error?.rectification_esitimated_days &&
                    error?.rectification_esitimated_days ? (
                    <p className="form-error">
                      {error?.rectification_esitimated_days}
                    </p>
                  ) : null}
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">
                      Actual Days Taken for Rectification
                    </h2>
                    <TextField
                      autoComplete="off"
                      name="rectification_actual_days"
                      id="rectification_actual_days"
                      type="number"
                      size="small"
                      value={
                        formData?.rectification_actual_days !== undefined
                          ? formData.rectification_actual_days
                          : ""
                      }
                      onChange={handleChange}                      
                      onKeyDown={(e: any) => {
                        blockInvalidChar(e);
                        if (!/[0-9]/.test(e.key)) {
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
                  {error?.rectification_actual_days &&
                    error?.rectification_actual_days ? (
                    <p className="form-error">
                      {error?.rectification_actual_days}
                    </p>
                  ) : null}
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">
                      Actual Date of Rectification
                    </h2>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        className="w-85"
                        inputFormat="DD/MM/YYYY"
                        value={formData["actual_date_rectification"] || null}
                        onChange={(e) =>
                          handleDateChange(e, "actual_date_rectification")
                        }
                        renderInput={(params) => (
                          <TextField
                            onKeyDown={handleKeyDown1}
                            {...params}
                            size="small"
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </div>
                  {error?.actual_date_rectification &&
                    error?.actual_date_rectification ? (
                    <p className="form-error">
                      {error?.actual_date_rectification}
                    </p>
                  ) : null}
                </Grid>

                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">Carpet Area</h2>
                    <TextField
                      autoComplete="off"
                      name="carpet_area"
                      id="carpet_area"
                      disabled
                      type="number"
                      size="small"
                      value={
                        formData?.carpet_area !== undefined
                          ? formData.carpet_area
                          : ""
                      }
                      onChange={handleChange}
                      onKeyDown={(e: any) => {                        
                        blockInvalidChar(e);
                      }}
                    />
                  </div>
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">
                      Total No. of Defects
                    </h2>
                    <TextField
                      autoComplete="off"
                      name="no_of_defects"
                      id="no_of_defects"
                      disabled
                      type="number"
                      size="small"
                      value={
                        formData?.no_of_defects !== undefined
                          ? formData.no_of_defects
                          : ""
                      }
                      onChange={handleChange}
                      onKeyDown={(e: any) => {
                        blockInvalidChar(e);
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                </Grid>

                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">Branch Category</h2>
                    <TextField
                      autoComplete="off"
                      name="branch_category"
                      id="branch_category"
                      type="text"
                      onKeyDown={(e: any) => {                        
                        regExpressionTextField(e);
                      }}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      disabled
                      size="small"
                      value={mandateInfo?.glCategoryName || ""}
                      onChange={handleChange}
                    />
                  </div>
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">Observation</h2>
                    <TextField
                      autoComplete="off"
                      name="observation"
                      id="observation"
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      type="text"
                      size="small"
                      value={
                        formData?.observation !== undefined
                          ? formData.observation
                          : ""
                      }
                      onChange={handleChange}
                      onKeyDown={(e: any) => { handleKeyDown(e); regExpressionTextField(e) }}
                    />
                  </div>
                  {error?.observation && error?.observation ? (
                    <p className="form-error">{error?.observation}</p>
                  ) : null}
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={3}
                  sx={{ position: "relative" }}
                  style={{ paddingLeft: "10px" }}
                >
                  <div className="input-form">
                    <h2 className="phaseLable required">Remarks</h2>
                    <TextField
                      autoComplete="off"
                      name="remarks"
                      id="remarks"
                      type="text"
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      size="small"
                      value={
                        formData?.remarks !== undefined ? formData.remarks : ""
                      }
                      onChange={handleChange}
                      onKeyDown={(e: any) => { handleKeyDown(e); regExpressionRemark(e) }}
                    />
                  </div>
                  {error?.remarks && error?.remarks ? (
                    <p className="form-error">{error?.remarks}</p>
                  ) : null}
                </Grid>
              </Grid>
            </div>
            <div
              style={{
                height: "calc(100vh - 438px)",
                marginBottom: 10,
                marginTop: 10,
              }}
            >
              <CommonGrid
                components={components}
                defaultColDef={{
                  singleClickEdit: true,
                  flex: 1,
                }}
                getRowStyle={() => {
                  return { background: "white" };
                }}
                columnDefs={columnDefs}
                rowData={qualityDerivedReportTable || []}
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

            {action === "" && runtimeId === 0 && (
              <div className="bottom-fix-btn bg-pd">
                <div className="remark-field" style={{ marginRight: "0px" }}>
                  <Stack
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems={"center"}
                    alignContent="center"
                    sx={{ margin: "10px" }}
                    style={{ marginLeft: "-2.7%" }}
                  >
                    <Button
                      variant="outlined"
                      size="medium"
                      name="submit"
                      onClick={(e) => {
                        _saveQualityAuditDerivedReport(e);
                      }}
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
                    {printButton === true && (
                      <Button
                        variant="outlined"
                        size="medium"
                        name="submit"
                        onClick={() => onPrint()}
                        style={{
                          marginLeft: 10,
                          padding: "2px 20px",
                          borderRadius: 6,
                          color: "#fff",
                          borderColor: "#00316a",
                          backgroundColor: "#00316a",
                        }}
                      >
                        Print
                      </Button>
                    )}

                    {userAction?.stdmsg !== undefined && (
                      <span className="message-right-bottom">
                        {userAction?.stdmsg}
                      </span>
                    )}
                  </Stack>
                </div>
              </div>
            )}

            {userAction?.module === module && (
              <>
                {action && action === "Create" && (
                  <div className="bottom-fix-btn bg-pd">
                    <div
                      className="remark-field"
                      style={{ marginRight: "0px" }}
                    >
                      <Stack
                        display="flex"
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems={"center"}
                        alignContent="center"
                        sx={{ margin: "10px" }}
                        style={{ marginLeft: "-2.7%" }}
                      >
                        <Button
                          variant="outlined"
                          size="medium"
                          type="submit"
                          name="submit"
                          onClick={(e) => {
                            workFlowMandate();
                          }}
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
                        {printButton === true && (
                          <Button
                            variant="outlined"
                            size="medium"
                            name="submit"
                            onClick={() => onPrint()}
                            style={{
                              marginLeft: 10,
                              padding: "2px 20px",
                              borderRadius: 6,
                              color: "#fff",
                              borderColor: "#00316a",
                              backgroundColor: "#00316a",
                            }}
                          >
                            Print
                          </Button>
                        )}

                        {userAction?.stdmsg !== undefined && (
                          <span className="message-right-bottom">
                            {userAction?.stdmsg}
                          </span>
                        )}
                      </Stack>
                    </div>
                  </div>
                )}
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
                    <span className="message-right-bottom">
                      {userAction?.stdmsg}
                    </span>
                  </>
                )}
              </>
            )}
          </form>
        </>
      </div>
    </>
  );
};

export default QualityAuditDerivedReportCmp;
