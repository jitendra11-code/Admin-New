import {
  Box,
  Button,
  Autocomplete,
  TextField,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import MandateInfo from "pages/common-components/MandateInformation";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "redux/store";
import { useParams } from "react-router-dom";
import { useUrlSearchParams } from "use-url-search-params";
import workflowFunctionAPICall from "pages/Mandate/workFlowActionFunction";
import ApproveAndRejectAction from "pages/common-components/ApproveRejectAction";
import MandateStatusHistory from "../../common-components/MandateInformation/MandateStatusRemarkHistoryComp";

import { fetchError, showMessage } from "redux/actions";

const InitiateLOI = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [mandateId, setMandateId] = React.useState(null);
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [selected, setSelected] = React.useState([]);
  const [mandateInfo, setMandateData] = React.useState(null);
  const [selectedMandate, setSelectedMandate] = useState(null);
  const [sendBack, setSendBack] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [remark, setRemark] = React.useState("");
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const location = useLocation();

  const apiType = location?.state?.apiType || "";
  const [vendorCategories, setVendorCategories] = useState([]);
  const [vendorNames, setVendorNames] = useState({});
  const [vendorsId, setVendorsId] = useState({});
  const [flag, setFlag] = useState(false);
  const [error, setError] = useState<any>({});
  const [catError, setCatError] = useState<any>("");
  const [errorCat, setErrorCat] = useState<any>({});
  const arr = ["1"];
  const [count, setCount] = useState(arr);
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [params] = useUrlSearchParams({}, {});
  const { id } = useParams();

  const { user } = useAuthUser();
  useEffect(() => {
    if (id && id !== "noid") {
      setMandateId(id);
    }
  }, [id]);

  React.useEffect(() => {
    if (mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid") {
      getDataToUpdate();

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
        navigate(`/mandate/${mandateId?.id}/initiate-LOI?source=list`, {
          state: { apiType: apiType },
        });
      } else {
        navigate(`/mandate/${mandateId?.id}/initiate-LOI`, {
          state: { apiType: apiType },
        });
      }
    }
  }, [mandateId, setMandateId]);

  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );

    return userAction?.runtimeId || 0;
  };

  const _onValidation = () => {
    const tempErr = {};
    selected?.map((item, ind) => {
      if (selected[ind].vendor === undefined || selected[ind].vendor === "") {
        tempErr[`${ind}`] = "Please select Vendor name";
      }
    });
    setError({ ...tempErr });
    return Object.keys(tempErr)?.length;
  };

  const getVendorCategory = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/InitiateLOI/GetPartnerCategory`
      )
      .then((response) => {
        setVendorCategories(response?.data);

      })
      .catch((err) => {});
  };
  useEffect(() => {
    getVendorCategory();
  }, []);

  const getVendorName = (category, Ind) => {
    if (selected?.length > 0) {
      axios
        .get(
          `${process.env.REACT_APP_BASEURL}/api/InitiateLOI/GetVendorName?partnerCategory=${category}`
        )
        .then((response) => {
          const tempId = {};
          response?.data.map(
            (item) => (tempId[`${item.agencyName}`] = item?.id)
          );
          setVendorsId({ ...vendorsId, ...tempId });
          const temp = response?.data.map((item) => item.agencyName);
          vendorNames[`${Ind}`] = temp;
          setVendorNames({ ...vendorNames });
        })
        .catch((err) => {});
    }
  };

  const handelAdd = () => {
    if (selected && selected?.length === count?.length) {
      count.push("1");
      setCount([...count]);
    }
  };
  const handleRemove = (index, agencyName) => {
    if (count.length > 1) {
      count.pop();
      setCount([...count]);
    }
    const arr = [...selected];
    arr?.splice(index, 1);
   
    const abc = { ...vendorNames };
    delete abc[`${index}`];
    if (error[`${index}`] !== undefined) delete error[`${index}`];
    Object.keys(error)?.map((item, ind) => {
      if (parseInt(item) >= index) {
        delete error[item];
        error[parseInt(item) - 1] = "Please select Vendor name";
      }
    });
    Object?.keys(vendorNames)?.map((item, ind) => {
      if (parseInt(item) > index) {
        const temp = vendorNames[item];
        delete abc[item];
        abc[`${parseInt(item) - 1}`] = temp;
      }
    });

    setError(error);
    setSelected(arr);
    setVendorNames({ ...abc });
    // _onValidationDelete(arr);
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
      url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${
        body?.runtimeId
      }&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${
        body?.createdBy
      }&createdOn=${body.createdOn}&action=${body?.action}&remark=${
        body?.remark || ""
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
        dispatch(fetchError("Error failed !!!"));
      });
  };

  const handelSubmit = (e) => {
    e.preventDefault();
    if (selected.length === 0) {
      setCatError("Please Select Vendor Category");
    } else {
      const coutErr = _onValidation();
      if (coutErr === 0) {
        const vendor_id =
          selected &&
          selected?.length > 0 &&
          selected.map((item) => vendorsId[item.vendor]);
        const data =
          vendor_id &&
          vendor_id?.length > 0 &&
          vendor_id.map((item) => ({
           
            uuid: 0,
            mandateId: mandateId?.id,
            vendorId: item,
            status: "active",
            createdBy: user?.UserName,
            createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            modifiedBy: user?.UserName,
            modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          }));

        const token = localStorage.getItem("token");

        axios
          .post(
            `${process.env.REACT_APP_BASEURL}/api/InitiateLOI/CreateInitiateLOI`,
            data
          )
          .then((response: any) => {
            if (!response) return;
            if (response) {
              dispatch(showMessage("Record is added successfully!"));
              workFlowMandate();
            } else {
              dispatch(fetchError("Record is not added!"));
              return;
            }
          })
          .catch((e: any) => {
            dispatch(fetchError("Error Ocurred !!!"));
          });
      }
    }
  };

  const getDataToUpdate = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/InitiateLOI/GetInitiateLOIByMandate?mandateId=${mandateId?.id}`
      )
      .then((response) => {
        if (!response)
          if (response && response?.data?.length > 0) {
            setFlag(true);
          }
        const resCat = response?.data.map((item) => ({
          cat: item.partnerCategory,
          vendor: item.agencyName,
        }));

        const tempId = {};
        response?.data.map((item) => (tempId[`${item.agencyName}`] = item?.id));
        setVendorsId({ ...vendorsId, ...tempId });

        if (response?.data?.length > 0) {
          setSelected(resCat);
          const ct = response?.data.map((item) => "1");
          setCount([...ct]);
        }
      })
      .catch((err) => {});
  };
  
  return (
    <div>
      <Box
        component="h2"
        sx={{
          fontSize: 15,
          color: "text.primary",
          fontWeight: "600",
          mb: {
            xs: 2,
            lg: 4,
          },
        }}
      >
        Initiate LOI
      </Box>
      <div
        className="card-panal inside-scroll-247"
        style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
      >
        <MandateInfo
          mandateCode={mandateId}
          source=""
          pageType=""
          setMandateData={setMandateData}
          setMandateCode={setMandateId}
          redirectSource={`${params?.source}`}
          setpincode={() => {}}
          setCurrentStatus={setCurrentStatus}
          setCurrentRemark={setCurrentRemark}
        />

        <form>
          {action && action !== "Approve" && (
            <Grid
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="baseline"
            >
              <Grid item xs={6} md={4} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable ">Vendor Category</h2>
                </div>
              </Grid>
              <Grid item xs={6} md={4} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable ">Vendor Name</h2>
                </div>
              </Grid>
            </Grid>
          )}
          {action &&
            action !== "Approve" &&
            count?.map((item, ind) => (
              <div key={ind} className="phase-outer">
                <Grid
                  container
                  item
                  spacing={5}
                  justifyContent="start"
                  alignSelf="baseline"
                >
                  <Grid item xs={6} md={4} sx={{ position: "relative" }}>
                    <div className="input-form">
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        disableClearable={true}
                        options={vendorCategories || []}
                        onChange={(e, value) => {
                          selected[ind] = { cat: value };
                          setSelected([...selected]);
                          getVendorName(value, ind);
                          if (value !== null) {
                            setCatError("");
                          }
                        }}
                        ListboxProps={{
                          style: {
                            maxHeight: 170,
                          },
                        }}
                        placeholder="Mandate Code"
                        value={(selected && selected[ind]?.cat) || ""}
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
                    </div>
                    {<p className="form-error">{catError}</p>}
                  </Grid>
                  <Grid item xs={6} md={4} sx={{ position: "relative" }}>
                    <div className="input-form">
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        disableClearable={true}
                        options={vendorNames[`${ind}`] || []}
                        onChange={(e, value) => {
                          selected[ind] = { ...selected[ind], vendor: value };
                          setSelected([...selected]);
                          if (value !== null) {
                            delete error[`${ind}`];
                            setError({ ...error });
                          } else {
                            setError({
                              ...error,
                            });
                          }
                        }}
                        ListboxProps={{
                          style: {
                            maxHeight: 170,
                          },
                        }}
                        placeholder="Mandate Code"
                        value={(selected && selected[ind]?.vendor) || ""}
                        onBlur={_onValidation}
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
                            onBlur={_onValidation}
                          />
                        )}
                      />
                    </div>
                    {
                      <p className="form-error">
                        {error[`${ind}`] !== undefined ? error[`${ind}`] : ""}
                      </p>
                    }
                  </Grid>

                  <Grid item xs={6} md={1} sx={{ position: "relative" }}>
                
                    <AddCircleIcon
                      onClick={handelAdd}
                      fontSize="large"
                      sx={{ color: "#00316a", cursor: "pointer" }}
                    />
                  </Grid>
                  <Grid item xs={6} md={1} sx={{ position: "relative" }}>
                 
                    <DeleteIcon
                      onClick={() => handleRemove(ind, selected[ind]?.vendor)}
                      fontSize="large"
                      sx={{ color: "red", cursor: "pointer" }}
                    />
                  </Grid>
                </Grid>
              </div>
            ))}

          <div className="bottom-fix-history" style={{ marginBottom: 15 }}>
            <MandateStatusHistory
              mandateCode={mandateId?.id}
              accept_Reject_Remark={currentRemark}
              accept_Reject_Status={currentStatus}
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
                {userAction?.stdmsg !== undefined && (
                  <span className="message-right-bottom">
                    {userAction?.stdmsg}
                  </span>
                )}
              </div>

              {action && action === "Create" && (
                <>
                  <Button
                    variant="outlined"
                    size="medium"
                    type="submit"
                    // style={submit}
                    onClick={handelSubmit}
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
                </>
              )}
              {userAction?.stdmsg !== undefined && (
                <span className="message-right-bottom">
                  {userAction?.stdmsg}
                </span>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default InitiateLOI;
