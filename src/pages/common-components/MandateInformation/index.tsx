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
import regExpressionTextField, { regExpressionRemark, textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";
import "./style.css";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { useAuthUser } from "@uikit/utility/AuthHooks";

const MandateInfo = ({
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
  propertyId=0,
}) => {
  let path = window.location.pathname?.split("/");
  let modulePath: any = window.location.pathname?.split("/")[path.length - 1];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mandateList, setMandateList] = React.useState([]);
  const [mandateInfo, setMandateInfo] = React.useState<any>();
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const user = useAuthUser();
  
  const _getMandateList = (type) => {
    axios({
      method: "get",
      url: user?.user?.role=="Sourcing Associate" && pageType == "propertyAdd" ? 
      `${process.env.REACT_APP_BASEURL}/api/Mandates/DropDownMandetPhaseByRole?apiType=sourcingassociate&url=${modulePath}` :
       `${process.env.REACT_APP_BASEURL}/api/Mandates/DropDownMandetPhaseByRole?apiType=${type || ""}&url=${modulePath}`,
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
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/mandatesById?id=${id}`
      )
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
    if (mandateCode && mandateCode?.id) {
      getById(mandateCode?.id);
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
                {pageType === "" || pageType === "propertyAdd"
                  ? "Mandate ID"
                  : "Phase Code"}
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
                        propertyId > 0 ? 
                        navigate(
                          `/${pageType == "propertyAdd"
                            ? "property-pool"
                            : "mandate"
                          }/${value?.id}/${modulePath || ""}?propertyId=${propertyId}`,
                          { state: { apiType: apiType } }
                        )
                        : 
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
              {(pageType === "" || pageType === "propertyAdd") && (
                <Grid item xs={6} md={7}>
                  <ul>
                    <li>
                      <span className="label-text">GL Category:</span>
                      <span>{mandateInfo?.glCategoryName}</span>
                    </li>
                    <li>
                      <span className="label-text">Branch Type:</span>
                      <span>{mandateInfo?.branchTypeName}</span>
                    </li>
                    <li>
                      <span className="label-text">Location:</span>
                      <span>{mandateInfo?.location}</span>
                    </li>
                    <li>
                      <span className="label-text">Pin Code:</span>
                      <span>{mandateInfo?.pincode}</span>
                    </li>
                    <li>
                      <span className="label-text">State:</span>
                      <span>{mandateInfo?.state}</span>
                    </li>
                    <li>
                      <span className="label-text">City:</span>
                      <span>{mandateInfo?.city}</span>
                    </li>
                  </ul>
                </Grid>
              )}
              {pageType === "phase" && (
                <Grid item xs={6} md={7}>
                  <ul>
                    <li>
                      <span className="label-text">Phase Name:</span>
                      <span>{mandateInfo?.phaseName}</span>
                    </li>
                    <li>
                      <span className="label-text">Country:</span>
                      <span>{mandateInfo?.country}</span>
                    </li>
                    <li>
                      <span className="label-text">Geo Vertical:</span>
                      <span>{mandateInfo?.verticalName}</span>
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
export default MandateInfo;
