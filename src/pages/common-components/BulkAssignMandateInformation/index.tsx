import React from "react";
import {
  Grid,
  Autocomplete,
  TextField,
} from "@mui/material";
import axios from "axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useLocation, useNavigate } from "react-router-dom";
import regExpressionTextField, {
  textFieldValidationOnPaste, regExpressionRemark
} from "@uikit/common/RegExpValidation/regForTextField";
import "./style.css";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch, useSelector } from "react-redux";

const BulkAssignMandateInfo = ({
  mandateCode,
  disabledStatus = false,
  source = "",
  pageType = "",
  setMandateCode,
  redirectSource,
  setpincode,
  setCurrentStatus,
  setMandateData,
  setCurrentRemark,
  workItem,
}) => {
  let path = window.location.pathname?.split("/");
  let modulePath: any = window.location.pathname?.split("/")[path.length - 1];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mandateList, setMandateList] = React.useState([]);
  const [mandateInfo, setMandateInfo] = React.useState<any>();
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const _getMandateList = (type) => {
    const token = localStorage.getItem("token");
    axios({
      method: "get",
      url: `${process.env.REACT_APP_BASEURL}/api/Phases/GetPhaseDropdownByRole?WorkItem=${workItem}`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res?.status === 200 && res?.data && res?.data?.length > 0) {
          setMandateList(res?.data);
        }
      })
      .catch((err) => { });
  };
  React.useEffect(() => {
    _getMandateList(apiType);
  }, [apiType]);

  const getById = (id) => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Phases/GetPhase?id=${id}`)
      .then((response: any) => {
        if (response && response?.data) {
          setMandateInfo(response?.data);
          setMandateData(response?.data);
          setpincode(response?.data?.pincode);
          setCurrentStatus(response?.data?.accept_Reject_Status || "");
          setCurrentRemark(response?.data?.accept_Reject_Remark || "");
        }
      })
      .catch((e: any) => { });
  };

  React.useEffect(() => {
    if (mandateCode && mandateCode?.phaseId) {
      getById(mandateCode?.phaseId);
    } else {
      setMandateInfo(null);
    }
  }, [mandateCode]);
  React.useEffect(() => {
    if (mandateCode !== "" && mandateList && mandateList.length > 0) {
      const obj =
        mandateList &&
        mandateList?.find((item) => item?.id === parseInt(mandateCode));
      if (obj !== undefined) {
        setMandateCode(obj || null);
      }
    }
  }, [mandateCode, setMandateCode, mandateList]);
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
              <h2 className="mandateInfoLable">
                {pageType === "" ? "Mandate ID" : "Phase ID"}
              </h2>
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
                    sx={
                      redirectSource &&
                      redirectSource === "list" && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }
                    }
                    id="combo-box-demo"
                    disabled={
                      (redirectSource && redirectSource === "list"
                        ? true
                        : false) || disabledStatus
                    }
                    getOptionLabel={(option) => {
                      if (pageType === "") {
                        return option?.mandatePhaseCode?.toString() || "";
                      } else if (pageType === "phase") {
                        return option?.phaseCode?.toString() || "";
                      }
                      return option?.mandatePhaseCode?.toString() || "";
                    }}
                    disableClearable={true}
                    options={mandateList || []}
                    onKeyDown={(e: any) => {
                      regExpressionTextField(e);
                    }}
                    onPaste={(e: any) => {
                      if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                      }
                    }}
                    onChange={(e, value: any) => {
                      setMandateCode(value);
                      if (!disabledStatus) {
                        navigate(
                          `/${pageType == "propertyAdd"
                            ? "property-pool"
                            : "mandate"
                          }/${value?.id}/${modulePath || ""}`,
                          { state: { apiType: apiType } }
                        );
                      }
                    }}
                    placeholder="Mandate Code"
                    defaultValue={mandateCode || null}
                    value={mandateCode || null}
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
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </TableCell>
            <TableCell align="left" className="mandat-details">
              {pageType === "phase" && (
                <Grid item xs={6} md={7}>
                  <ul>
                    <li>
                      <span className="label-text">Phase Name:</span>
                      <span>{mandateInfo?.phasename}</span>
                    </li>
                    <li>
                      <span className="label-text">Country:</span>
                      <span>{mandateInfo?.countryname}</span>
                    </li>
                    <li>
                      <span className="label-text">Geo Vertical:</span>
                      <span>{mandateInfo?.verticalname}</span>
                    </li>
                    <li>
                      <span className="label-text">Number of Mandates:</span>
                      <span>{mandateInfo?.no_of_branches}</span>
                    </li>
                    {/* <li>
                      <span className="label-text">Business SPOC Name:</span>
                      <span>{mandateInfo?.businessSPOCName}</span>
                    </li> */}
                  </ul>
                </Grid>
              )}
            </TableCell>
            <TableCell align="left" style={{ width: "25%" }}>
              <Grid item xs={6} md={2}>
                <h2 className="phaseLable" style={{ fontWeight: "500" }}>
                  {mandateInfo?.status}
                </h2>
              </Grid>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default BulkAssignMandateInfo;
