import {
  Box,
  MenuItem,
  TextField,
  Grid,
} from "@mui/material";
import Select from "@mui/material/Select";
import { useFormik } from "formik";
import axios from "axios";
import React, { useEffect } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import {
  updateMandateInitialValues,
  updateMandateSchema,
} from "@uikit/schemas";
import moment from "moment";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import {
  textFieldValidationOnPaste, regExpressionRemark
} from "@uikit/common/RegExpValidation/regForTextField";
import { useDispatch, useSelector } from "react-redux";
import { fetchError } from "redux/actions";
import blockInvalidChar from "pages/Mandate/Location/Components/blockInvalidChar ";
const ViewMandate = () => {
  const [branchType, setBranchType] = React.useState([]);
  const [glCategories, setGlCategories] = React.useState([]);
  const [projectManager, setProjectManager] = React.useState([]);
  const [mandateId, setMandateId] = React.useState("");
  const { user } = useAuthUser();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=BranchType`
      )
      .then((response: any) => {
        setBranchType(response?.data?.data);
      })
      .catch((e: any) => {
      });
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=GLCategory`
      )
      .then((response: any) => {
        setGlCategories(response?.data?.data);
      })
      .catch((e: any) => {
      });
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Countries/getAllWithDataWithDesignation?RoleId=29`
      )
      .then((response: any) => {
        setProjectManager(response?.data?.data);
      })
      .catch((e: any) => {
      });
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/Mandates/GenerateMandetId?phaseId=${window.location.pathname?.split("/")[3]
        }`
      )
      .then((response: any) => {
        setMandateId(response?.data);
      })
      .catch((e: any) => {
      });
  }, []);

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: updateMandateInitialValues,
      validationSchema: updateMandateSchema,
      validateOnChange: true,
      validateOnBlur: false,
      onSubmit: (values, action) => {
        let newStatus = "";
        if (
          values.locationName !== undefined &&
          values.tierName !== undefined &&
          values.remarks !== undefined
        ) {
          newStatus = "Initiated";
        } else {
          newStatus = "Created";
        }
        const body = {
          status: newStatus,
          phaseId: window.location.pathname?.split("/")[3],
          mandateCode: values?.mandateId,
          glCategoryId: +values?.glCategory,
          branchId: +values.branchType,
          pincode: (values?.pinCode && values?.pinCode.toString()) || "",
          state: values?.state,
          region: values?.region,
          district: values.district,
          city: values.city,
          location: values?.locationName,
          tierName: values?.tierName,
          remark: values?.remarks,
          sourcingAssociate: values?.sourcingAssociate,
          projectManagerId: values?.projectManager,
          pM_Remarks: "1",
          branchCode: values.branchCode,
          completionPer: 0,
          accept_Reject_Status: "Pending",
          accept_Reject_Remark: "Pending",
          createdDate: moment().utc().format(),
          modifiedDate: moment().utc().format(),
          createdBy: user?.UserName ,
          modifiedBy: user?.UserName ,
        };

        axios
          .post(
            `${process.env.REACT_APP_BASEURL}/api/Mandates/CreateMandates`,
            body
          )
          .then((response: any) => {
            workFlowMandate(response?.data?.data?.id);
            action.resetForm();
            navigate("/mandate");
          })
          .catch((e: any) => {
            action.resetForm();
          });
      },
    });

  const workFlowMandate = (mandateId: any) => {
    const token = localStorage.getItem("token");
    const body = {
      runtimeId: 0,
      mandateId: mandateId || 0, 
      tableId: mandateId || 0, 
      remark: "Created",
      createdBy: user?.UserName,
      createdOn: moment().utc().format(),
      action: "Created", 
    };
    axios({
      method: "post",
      url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId
        }&mandateId=${body?.mandateId}&tableId=${body?.mandateId
        }&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action
        }&remark=${body?.remark || ""}`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response: any) => {
        if (!response) return;
        if (response?.data === true) {
        }
      })
      .catch((e: any) => { });
  };

  return (
    <div>
      <Box
        component="h2"
        className="page-title-heading my-6"
      >
        Add Mandate
      </Box>
      <div
        className="card-panal"
        style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
      >
        <form onSubmit={handleSubmit}>
          <div className="phase-outer">
            <Grid
              marginBottom="10px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Phase Code</h2>
                  <TextField
                    name="phaseId"
                    id="phaseId"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={window.location.pathname?.split("/")[2]}
                    onChange={handleChange}
                    disabled
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Mandate ID</h2>
                  <TextField
                    name="mandateId"
                    id="mandateId"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.mandateId || mandateId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">GL Category</h2>
                  <Select
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="glCategory"
                    id="glCategory"
                    value={values.glCategory}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    {glCategories?.map((v) => (
                      <MenuItem value={v?.id}>{v?.glCategoryName}</MenuItem>
                    ))}
                  </Select>
                  {touched.glCategory && errors.glCategory ? (
                    <p className="form-error">{errors.glCategory}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Branch Type</h2>
                  <Select
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="branchType"
                    id="branchType"
                    value={values.branchType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                 
                    {branchType?.map((v: any) => (
                      <MenuItem value={v?.id}>{v?.branchTypeName}</MenuItem>
                    ))}
                  </Select>
                  {touched.branchType && errors.branchType ? (
                    <p className="form-error">{errors.branchType}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Pin Code</h2>
                  <TextField
                    autoComplete="off"
                    name="pinCode"
                    id="pinCode"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.pinCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{ inputProps: { min: 0, maxLength: 6 } }}                    
                    onKeyDown={(e: any) => {                      
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
                  {touched.pinCode && errors.pinCode ? (
                    <p className="form-error">{errors.pinCode}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">State</h2>
                  <TextField
                    name="state"
                    id="state"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
               
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Region</h2>
                  <TextField
                    name="region"
                    id="region"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.region}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">District</h2>
                  <TextField
                    name="district"
                    id="district"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.district}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">City</h2>
                  <TextField
                    name="city"
                    id="city"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.city}
                    onChange={handleChange}
                    disabled
                    onBlur={handleBlur}
                  />
                
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable ">Location Name</h2>
                  <TextField
                    autoComplete="off"
                    name="locationName"
                    id="locationName"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.locationName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.locationName && errors.locationName ? (
                    <p className="form-error">{errors.locationName}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Tier Name</h2>
                  <TextField
                    name="tierName"
                    autoComplete="on"
                    id="tierName"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.tierName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.tierName && errors.tierName ? (
                    <p className="form-error">{errors.tierName}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable ">Remarks</h2>
                  <TextField
                    name="remarks"
                    autoComplete="off"
                    id="remarks"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.remarks}                    
                    onKeyDown={(e: any) => {
                      regExpressionRemark(e);
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(
                          fetchError("You can not paste Spacial characters")
                        );
                      }
                    }}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.remarks && errors.remarks ? (
                    <p className="form-error">{errors.remarks}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Project Manager</h2>
                  <Select
                  
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="projectManager"
                    id="projectManager"
                    value={values.projectManager}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                  
                    {projectManager?.map((v) => (
                      <MenuItem value={v?.id}>{v?.userName}</MenuItem>
                    ))}
                  </Select>
                  {touched.projectManager && errors.projectManager ? (
                    <p className="form-error">{errors.projectManager}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Project Manager Remarks</h2>
                  <TextField
                    name="projectManagerRemarks"
                    id="projectManagerRemarks"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.projectManagerRemarks}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                  {touched.projectManagerRemarks &&
                    errors.projectManagerRemarks ? (
                    <p className="form-error">{errors.projectManagerRemarks}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Branch Code</h2>
                  <TextField
                    name="branchCode"
                    id="branchCode"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values.branchCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                  {touched.branchCode && errors.branchCode ? (
                    <p className="form-error">{errors.branchCode}</p>
                  ) : null}
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Sourcing Associate</h2>
                  <Select
                  
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="sourcingAssociate"
                    id="sourcingAssociate"
                    value={values?.sourcingAssociate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                   
                    <MenuItem value={"1"}>1</MenuItem>
                  </Select>
                </div>
              </Grid>
            </Grid>
          </div>

       
        </form>
      </div>
    </div>
  );
};

export default ViewMandate;
