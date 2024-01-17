import { Button, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField, Grid } from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs, { Dayjs } from 'dayjs';
import * as React from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { updatePhaseApprovalNoteInitialValues, updatePhaseApprovalNoteSchema } from "@uikit/schemas";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import regExpressionTextField, { textFieldValidationOnPaste, regExpressionRemark } from "@uikit/common/RegExpValidation/regForTextField";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch, useSelector } from "react-redux";

import moment from "moment"
const PhaseApprovalNote = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [mandateData, setMandateData] = React.useState<any>({});
  const [phaseApprovalNoteData, setPhaseApprovalNoteData] = React.useState<any>([]);
  const [phaseApprovalNoteDataError, setPhaseApprovalNoteDataError] = React.useState<any>([]);
  const [value, setValue] = React.useState<Dayjs | null>(
    dayjs(today),
  );
  const dispatch = useDispatch();
  const { user } = useAuthUser();




  React.useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/mandatesById?id=${window.location.pathname?.split("/")[2]
        }`
      )
      .then((response: any) => {
        setMandateData(response?.data);
      })
      .catch((e: any) => {
      });

  }, []);

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: updatePhaseApprovalNoteInitialValues,
      validationSchema: updatePhaseApprovalNoteSchema,
      validateOnChange: true,
      validateOnBlur: false,
      onSubmit: (values, action) => {
        const body = {
          id: 0,
          status: "Active",
          phaseId: window.location.pathname?.split("/")[3],
          fk_mandate_id: window.location.pathname?.split("/")[3],
          approval_note_no: values?.approval_note_no || "",
          sub_department: values?.sub_department,
          location: values?.location,
          subject: values?.subject,
          branchname: values?.branchname,
          purpose: values?.purpose,
          activity_time_line: values?.activity_time_line,
          approved_amount: values?.approved_amount || 0,
          total_budget_amount: values?.total_budget_amount || 0,
          cosumed_budget_amount: values?.cosumed_budget_amount || 0,
          balance_budget_amount: values?.balance_budget_amount || 0,
          activity_summary: values?.activity_summary || "",
          cost_justification: values?.cost_justification || "",
          cpu_remarks: values?.cpu_remarks || "",
          doa_remarks: "",
          approval_remarks: "",
          pdm_remarks: "",
          pm_remarks: "",
          createdby: user?.UserName,
          modifiedby: "",
          notedate: phaseApprovalNoteData?.notedate && moment(phaseApprovalNoteData?.notedate).format("YYYY-MM-DDTHH:mm:ss.SSS") || moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          approved_by: "",
        }

        axios
          .post(`${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/CreatePhaseApprovalNote`, body)
          .then((response: any) => {
            action.resetForm();
            navigate("/mandate");
          })
          .catch((e: any) => {
            action.resetForm();
          });
      },
    });
  const getPhaseApprovalNoteById = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/PhaseApprovalNoteById?id=${window.location.pathname?.split("/")[2]
        }`
      )
      .then((response: any) => {
        setPhaseApprovalNoteData(response?.data[0]);
      })
      .catch((e: any) => {
      });
  };

  React.useEffect(() => {
    getPhaseApprovalNoteById();
  }, []);


  const handlePhaseApprovalNoteDataChange = (e: any) => {
    const { name, value } = e.target;
    setPhaseApprovalNoteData({ ...phaseApprovalNoteData, [name]: value });
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setPhaseApprovalNoteData({ ...phaseApprovalNoteData, notedate: newValue })
  };

  const handleUpdateSubmit = (e: any) => {
    e.preventDefault();
    const body = {};

    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/PhaseApprovalNote/UpdatePhaseApprovalNote?id=${phaseApprovalNoteData?.id}`,
        phaseApprovalNoteData
      )
      .then((response: any) => {
        navigate("/mandate");
      })
      .catch((e: any) => {
      });
  };

  return (
    <>
      <div className="card-panal inside-scroll-232">
        <form onSubmit={phaseApprovalNoteData?.id === undefined ? handleSubmit : handleUpdateSubmit}>
          <div className="phase-outer">
            <Grid
              marginBottom="30px"
              container
              item
              spacing={3}
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
                    value={values?.phaseId || phaseApprovalNoteData?.phaseName || mandateData?.phaseCode}
                    onChange={phaseApprovalNoteData ? handleChange : handlePhaseApprovalNoteDataChange}
                    onBlur={handleBlur}
                    disabled
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Mandate Code</h2>
                  <TextField
                    name="mandateName"
                    id="mandateName"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values?.mandateName || phaseApprovalNoteData?.mandateName || mandateData?.mandateCode}
                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                    onBlur={handleBlur}
                    disabled
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Approval Note No.</h2>
                  <TextField
                    name="approval_note_no"
                    id="approval_note_no"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values?.approval_note_no || phaseApprovalNoteData?.approval_note_no}
                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                    onBlur={handleBlur}
                    disabled
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required" >Sub Department</h2>
                  <Select
                   
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="sub_department"
                    id="sub_department"
                    value={values?.sub_department || phaseApprovalNoteData?.sub_department || ''}
                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                    onBlur={handleBlur}

                  >
                    <MenuItem value={'Infrastrucutre'}> Infrastrucutre</MenuItem>
                  </Select>
                  {touched.sub_department && errors.sub_department ? (
                    <p className="form-error">{errors.sub_department}</p>
                  ) : null}
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Location</h2>
                  <TextField
                    name="location"
                    autoComplete="off"
                    id="location"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values?.location || phaseApprovalNoteData?.location}
                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                    onBlur={handleBlur}
                  />
                  {touched?.location && errors?.location ? (
                    <p className="form-error">{errors?.location}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Date</h2>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      className="w-85"
                      inputFormat="DD/MM/YYYY"
                      value={phaseApprovalNoteData?.notedate}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} size='small' name='notedate' />}
                    />
                  </LocalizationProvider>
                </div>
              </Grid>
              <Grid item xs={6} md={6} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Subject</h2>
                  <TextField
                    name="subject"
                    id="subject"
                    autoComplete="off"
                    variant="outlined"
                    size="small"
                    className="w-86"
                    value={values?.subject || phaseApprovalNoteData?.subject}
                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e)
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                  />
                  {touched?.subject && errors?.subject ? (
                    <p className="form-error">{errors?.subject}</p>
                  ) : null}

                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Branch Name & Address</h2>
                  <TextField
                    name="branchname"
                    id="branchname"
                    variant="outlined"
                    autoComplete="off"
                    size="small"
                    className="w-85"
                    value={phaseApprovalNoteData?.branchname}
                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                    onBlur={handleBlur}
                  />
                  {touched?.branchname && errors?.branchname ? (
                    <p className="form-error">{errors?.branchname}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Purpose</h2>
                  <TextField
                    name="purpose"
                    id="purpose"
                    variant="outlined"
                    autoComplete="off"
                    size="small"
                    className="w-85"
                    value={values?.purpose || phaseApprovalNoteData?.purpose}
                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e)
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onBlur={handleBlur}
                  />
                  {touched?.purpose && errors?.purpose ? (
                    <p className="form-error">{errors?.purpose}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Activity Time Line</h2>
                  <TextField
                    name="activity_time_line"
                    id="activity_time_line"
                    autoComplete="off"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={values?.activity_time_line || phaseApprovalNoteData?.activity_time_line}
                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                    onBlur={handleBlur}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e)
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                  />
                  {touched.activity_time_line && errors.activity_time_line ? (
                    <p className="form-error">{errors.activity_time_line}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form"></div>
              </Grid>

              <div className="approval-table">
                <Table sx={{ minWidth: 640, "&:last-child td, &:last-child th": { border: '1px solid rgba(0, 0, 0, 0.12)' }, mt: 5, mb: 5 }} aria-label="spanning table" >
                  <TableHead >
                    <TableRow
                      sx={{ lineHeight: '0.5rem' }}
                    >
                      <TableCell align="center" colSpan={2}>
                        Cost till Date
                      </TableCell>
                      <TableCell align="center" colSpan={2}>Budget Allocated</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="left" sx={{ backgroundColor: "#f3f3f3 !important" }}>Particular</TableCell>
                      <TableCell align="left" sx={{ backgroundColor: "#f3f3f3 !important" }}>Amount(Rs.)</TableCell>
                      <TableCell align="left" sx={{ backgroundColor: "#f3f3f3 !important" }}>Capex Details for FY</TableCell>
                      <TableCell align="left" sx={{ backgroundColor: "#f3f3f3 !important" }}>Amount(Rs.)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell className="required">Total Cost to be approved</TableCell>
                      <TableCell>
                        <TextField
                          name="approved_amount"
                          type={"number"}
                          InputProps={{ inputProps: { min: 0 } }}
                          id="approved_amount"
                          variant="outlined"
                          size="small"
                          inputProps={{ min: 0 }}
                          className="w-85"
                          value={values?.approved_amount || phaseApprovalNoteData?.approved_amount}
                          onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                          onBlur={handleBlur}
                        />
                        {touched?.approved_amount && errors?.approved_amount ? (
                          <p className="form-error">{errors?.approved_amount}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="required">Total Budget FY</TableCell>
                      <TableCell>
                        <TextField
                          name="total_budget_amount"
                          id="total_budget_amount"
                          type={"number"}
                          variant="outlined"
                          size="small"
                          InputProps={{ inputProps: { min: 0 } }}
                          inputProps={{ min: 0 }}
                          className="w-85"
                          value={values?.total_budget_amount || phaseApprovalNoteData?.total_budget_amount}
                          onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                        />
                        {touched?.total_budget_amount && errors?.total_budget_amount ? (
                          <p className="form-error">{errors?.total_budget_amount}</p>
                        ) : null}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="required">Consumed Budget FY</TableCell>
                      <TableCell>
                        <TextField
                          name="cosumed_budget_amount"
                          type={"number"}
                          id="cosumed_budget_amount"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 0 } }}
                          size="small"
                          inputProps={{ min: 0 }}
                          className="w-85"
                          value={values?.cosumed_budget_amount || phaseApprovalNoteData?.cosumed_budget_amount}
                          onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                          onBlur={handleBlur}
                        />
                        {touched?.cosumed_budget_amount && errors?.cosumed_budget_amount ? (
                          <p className="form-error">{errors?.cosumed_budget_amount}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="required">Balance Budget FY</TableCell>
                      <TableCell>
                        <TextField
                          name="balance_budget_amount"
                          type={"number"}
                          id="balance_budget_amount"
                          variant="outlined"
                          size="small"
                          inputProps={{ min: 0 }}
                          className="w-85"
                          InputProps={{ inputProps: { min: 0 } }}
                          value={values?.balance_budget_amount || phaseApprovalNoteData?.balance_budget_amount}
                          onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                          onBlur={handleBlur}
                        />
                        {touched?.balance_budget_amount && errors?.balance_budget_amount ? (
                          <p className="form-error">{errors?.balance_budget_amount}</p>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <Grid item xs={6} md={6} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Activity Summary</h2>
                  <TextField
                    name="activity_summary"
                    id="activity_summary"
                    variant="outlined"
                    className="w-85"
                    multiline
                    value={values?.activity_summary || phaseApprovalNoteData?.activity_summary}
                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                    onBlur={handleBlur}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e)
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                  />
                  {touched?.activity_summary && errors?.activity_summary ? (
                    <p className="form-error">{errors?.activity_summary}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={6} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Cost Justification</h2>
                  <TextField
                    name="cost_justification"
                    id="cost_justification"
                    variant="outlined"
                    className="w-85"
                    multiline
                    value={values?.cost_justification || phaseApprovalNoteData?.cost_justification}
                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                    onBlur={handleBlur}
                  />
                  {touched?.cost_justification && errors?.cost_justification ? (
                    <p className="form-error">{errors?.cost_justification}</p>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={6} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Remarks</h2>
                  <TextField
                    name="cpu_remarks"
                    id="cpu_remarks"
                    variant="outlined"
                    className="w-85"
                    multiline
                    value={values?.cpu_remarks || phaseApprovalNoteData?.cpu_remarks}
                    onChange={phaseApprovalNoteData?.id === undefined ? handleChange : handlePhaseApprovalNoteDataChange}
                    onBlur={handleBlur}
                    onKeyDown={(e: any) => {
                      regExpressionRemark(e);
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                  />
                  {touched?.cpu_remarks && errors?.cpu_remarks ? (
                    <p className="form-error">{errors?.cpu_remarks}</p>
                  ) : null}
                </div>
              </Grid>
            </Grid>
          </div>

          <div className="bottom-fix-btn">

            <Button
              variant="outlined"
              size="medium"
              type="submit"
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
          </div>
        </form>
      </div>
    </>
  );

}

export default PhaseApprovalNote;