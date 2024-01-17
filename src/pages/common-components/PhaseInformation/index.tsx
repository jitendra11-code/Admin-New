import React from "react";
import { Grid, Autocomplete, TextField } from "@mui/material";
import axios from "axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import "./style.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
import regExpressionTextField, { regExpressionRemark, textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";

const PhaseInfo = ({ phaseId, setPhaseId, pageType = "", source = "" }) => {
  const [phase, setPhase] = React.useState(null);
  let { id } = useParams();

  const [phaseList, setPhaseList] = React.useState([]);
  let path = window.location.pathname?.split("/");
  let modulePath: any = window.location.pathname?.split("/")[path.length - 1];
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const navigate = useNavigate();

  const _getPhaseList = () => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_BASEURL}/api/Phases/GetPhaseByRoles`,
    })
      .then((res) => {
        if (res?.status === 200 && res?.data && res?.data?.length > 0) {
          setPhaseList(res?.data);
        }
      })
      .catch((err) => { });
  };
  const dispatch = useDispatch();
  React.useEffect(() => {
    _getPhaseList();
    setPhaseId(id);
  }, [phaseId]);

  React.useEffect(() => {
    if (phaseList && phaseList.length > 0) {
      const obj =
        phaseList && phaseList?.find((item) => item?.id === parseInt(phaseId));

      if (obj !== undefined) {
        setPhase(obj || null);
      }
    }
  }, [phase, setPhase, phaseList]);


  return (
    <TableContainer>
      <Table
        sx={{ minWidth: 650 }}
        aria-label="simple table"
        className="mandate-table"
      >
        <TableHead>
          <TableRow>
            <TableCell>
              <h2 className="mandateInfoLable">Phase ID</h2>
            </TableCell>
            <TableCell align="left">
              <h2 className="mandateInfoLable">Additional Information</h2>
            </TableCell>
            <TableCell align="left">
              <h2 className="mandateInfoLable">Status</h2>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow
          >
            <TableCell align="left" style={{ width: "25%" }}>
              <Grid
                container
                item
                spacing={1}
                justifyContent="start"
                alignItems="center"
              >
                <Grid item xs={6} md={12}>
                  <Autocomplete
                    disablePortal
                    sx={pageType === "" && {
                      backgroundColor: "#f3f3f3",
                      borderRadius: "6px",
                    }}
                    id="combo-box-demo"
                    disabled={(source === "extend" && window?.location?.search !== "?source=list") ? false : true}
                    getOptionLabel={(option) => {
                      return option?.phasecode?.toString() || "";
                    }}
                    disableClearable={true}
                    options={phaseList || []}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e);
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onChange={(e, value: any) => {
                      setPhaseId(value?.id);
                      setPhase(value);
                      if (pageType === "phase" && source === "extend") {
                        navigate(
                          `/${"phase"
                          }/${value?.id}/${modulePath || ""}`,
                          { state: { apiType: apiType } }
                        );
                      }
                    }}
                    placeholder="Phase Code"
                    defaultValue={phase || null}
                    value={phase || null}
                    renderInput={(params) => (
                      <TextField
                        name="state"
                        id="state"
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          style: { height: `35 !important` },
                        }}
                        variant="outlined"
                        size="small"
                        sx={window?.location?.search === "?source=list" && {
                          backgroundColor: "#f3f3f3",
                          borderRadius: "6px",
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </TableCell>
            <TableCell align="left" className="mandat-details">
              <Grid item xs={6} md={7}>
                <ul>
                  <li>
                    <span className="label-text">Phase Name:</span>
                    <span>{phase?.phasename}</span>
                  </li>
                  <li>
                    <span className="label-text">Country:</span>
                    <span>{phase?.countryname}</span>
                  </li>
                  <li>
                    <span className="label-text">Geo Vertical:</span>
                    <span>{phase?.verticalname}</span>
                  </li>
                  <li>
                    <span className="label-text">Number of Mandates:</span>
                    <span>{phase?.no_of_branches}</span>
                  </li>
                  {/* <li>
                    <span className="label-text">Business SPOC Name:</span>
                    <span>{phase?.businessSPOCName}</span>
                  </li> */}
                </ul>
              </Grid>
            </TableCell>
            <TableCell align="left" style={{ width: "25%" }}>
              <Grid item xs={6} md={2}>
                <h2 className="phaseLable" style={{ fontWeight: "500" }}>
                  {phase?.status}
                </h2>
              </Grid>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default PhaseInfo;
