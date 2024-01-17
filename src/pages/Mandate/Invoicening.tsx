import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
  Autocomplete,
  Box,
  Grid,
  Tab,
  TextField,
} from "@mui/material";
import MandateInfo from "pages/common-components/MandateInformation";
import React, { useEffect } from "react";
import Invoice from "./Invoice";
import NDC from "./NDC";
import PO from "./PO";
import PenaltyCalculation from "./Penalty";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import axios from "axios";
import { useUrlSearchParams } from "use-url-search-params";
import { useSelector } from "react-redux";
import { AppState } from "redux/store";

const Invoicening = () => {
  let { id } = useParams();
  const { user } = useAuthUser();
  const [mandateCode, setMandateCode] = React.useState<any>("");
  const [mandateData, setMandateData] = React.useState({});
  const [params] = useUrlSearchParams({}, {});
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [vendor, setVendor] = React.useState<any>({
    vendorname: "",
    vendorId: 0,
    id: 0,
    vendorcategory: "",
  });
  const [vendorNameIds, setVendorNameIds] = React.useState({});
  const [vendorInformation, setVendorInformation] = React.useState([]);
  const [vendorCatInformation, setVendorCatInformation] = React.useState([]);
  const [value, setValue] = React.useState("1");
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [userAction, setUserAction] = React.useState(null);
  const tableId = userAction?.tableId;
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );

  useEffect(()=>{
    if(id !== undefined){
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );
      if (userAction !== undefined) {
        setUserAction(userAction);
      } else {
        let action = mandateCode;
        setUserAction(action);
      }
    }
  },[mandateCode,setMandateCode]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateCode(id);
    }
  }, []);

  React.useEffect(() => {
    setVendor({ 
      vendorname: "",
    })
    setVendorInformation([])
  }, [mandateCode?.id]);

  useEffect(() => {
    if (
      mandateCode &&
      mandateCode?.id !== undefined &&
      mandateCode?.id !== "noid" &&
      user &&
      user?.role === "Vendor"
    ) {
      const obj = { vendorcategory: user?.vendorType || "" };
      const data = [
        {
          vendorcategoryKey: user?.vendorType || "",
          vendorcategory: user?.vendorType || "",
        },
      ];
      setVendor((state) => ({
        ...state,
        vendorcategoryKey: user?.vendorType || "",
        vendorcategory: user?.vendorType || "",
      }));
      setVendorCatInformation([...data]);
      if(mandateCode.id && userAction?.tableId && mandateCode?.id === userAction?.mandateId){
        handelCategoryChange("e", obj);
      }
    }
  }, [mandateCode, userAction]);
  const handelCategoryChange = (e, value) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PODetails/GetVendorDropDown?mandateId=${mandateCode?.id}&vendorCategory=${value?.vendorcategory}&tableId=${userAction?.tableId || 0}`
      )
      .then((response) => {
        if (!response) return;
        if (
          user?.role === "Vendor" &&
          response?.data &&
          response?.data?.length === 1
        ) {
          setVendor({
            vendorname: response?.data?.[0]?.vendorname || "",
            vendorId: response?.data?.[0]?.id || 0,
            id: response?.data?.[0]?.id || 0,
            vendorcategory: user?.vendorType || "",
          });
        }
        if (
          user?.role !== "Vendor" &&
          response?.data &&
          response?.data?.length === 1
        ) {
          setVendor({
            vendorname: response?.data?.[0]?.vendorname || "",
            vendorId: response?.data?.[0]?.id || 0,
            id: response?.data?.[0]?.id || 0,
            vendorcategory: response?.data?.[0]?.vendorcategory || 0,
          });
        }
        const vendorIds = {};
        const vendorname = response?.data?.map((item, ind) => {
          vendorIds[item?.vendorname] = item?.id;
        });
        setVendorNameIds({ ...vendorNameIds, ...vendorIds });
        setVendorInformation(response?.data);
      })
      .catch((err) => { });
  };
  const getVendorCategory = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/PODetails/GetVendorCategoryByMandateId?mandateId=${mandateCode?.id === undefined ? mandateCode : mandateCode?.id
        }&vendorId=${userAction?.tableId || 0}`
      )
      .then((response) => {
        setVendorCatInformation(response?.data);
      })
      .catch((err) => { });
  };
  useEffect(() => {
    if (
      mandateCode &&
      mandateCode?.id !== undefined &&
      mandateCode?.id !== "noid" &&
      user &&
      user?.role !== "Vendor" && userAction?.tableId
    ) {
      getVendorCategory();
    }
  }, [mandateCode,userAction]);
  return (
    <>
      <div className="invoicing">
        <Box component="h2" className="page-title-heading my-6">
          Invoicing
        </Box>
        <div
          style={{
            backgroundColor: "#fff",
            padding: "0px",
            border: "1px solid #0000001f",
            borderRadius: "5px",
          }}
          className="card-panal inside-scroll-194-invoicing"
        >
          <div style={{ padding: "10px" }}>
            <MandateInfo
              mandateCode={mandateCode}
              redirectSource={`${params?.source}`}
              setMandateData={setMandateData}
              source=""
              pageType=""
              setMandateCode={setMandateCode}
              setCurrentStatus={setCurrentStatus}
              setCurrentRemark={setCurrentRemark}
              setpincode={() => { }}
            />
          </div>
          <div className="phase-outer" style={{ paddingLeft: "10px" }}>
            <Grid
              marginBottom="2px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Vendor Category</h2>

                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    sx={
                      user?.role === "Vendor" && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }
                    }
                    disabled={
                      user?.role === "Vendor" &&
                      vendorCatInformation &&
                      vendorCatInformation?.length === 1
                    }
                    getOptionLabel={(option) => {
                      return option?.vendorcategory?.toString() || "";
                    }}
                    disableClearable
                    options={vendorCatInformation || []}
                    placeholder="Vendor Category"
                    onChange={(e, value: any) => {
                      setVendor((state) => ({
                        ...state,
                        vendorname: value?.vendorname || "",
                        vendorId: value?.id || 0,
                        id: value?.id || 0,
                        vendorcategory: value?.vendorcategory || "",
                      }));
                      handelCategoryChange(e, value);
                    }}
                    value={vendor || null}
                    renderInput={(params) => (
                      <TextField
                        name="vendor_category"
                        id="vendor_category"
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
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Vendor Name</h2>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    sx={
                      user?.role === "Vendor" &&
                      vendorInformation &&
                      vendorInformation?.length === 1 && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }
                    }
                    disabled={
                      user?.role === "Vendor" &&
                      vendorInformation &&
                      vendorInformation?.length === 1
                    }
                    getOptionLabel={(option) => {
                      return option?.vendorname?.toString() || "";
                    }}
                    disableClearable
                    options={vendorInformation || []}
                    onChange={(e, value: any) => {
                      setVendor((state) => ({
                        ...state,
                        vendorname: value?.vendorname || "",
                        vendorId: value?.id || 0,
                        id: value?.id || 0,
                        vendorcategory: value?.vendorcategory || "",
                      }));
                    }}
                    value={
                      vendorInformation && vendorInformation?.length === 1
                        ? vendorInformation?.[0]
                        : vendor || null
                    }
                    placeholder="Vendor Name"
                    renderInput={(params) => (
                      <TextField
                        name="vendor_name"
                        id="vendor_name"
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
              </Grid>
            </Grid>
          </div>

          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                <Tab
                  label="Invoice"
                  value="1"
                  to={`/mandate/${id}/invoicing`}
                  component={Link}
                />
                <Tab
                  label="PO"
                  value="2"
                  to={`/mandate/${id}/quality-po`}
                  component={Link}
                />
                <Tab
                  label="NDC"
                  value="3"
                  to={`/mandate/${id}/ndc`}
                  component={Link}
                />
                <Tab
                  label="PENALTY CALCULATION"
                  value="4"
                  to={`/mandate/${id}/penalty-calculation`}
                  component={Link}
                />
              </TabList>
            </Box>

            <TabPanel value="1">
              <Invoice
                mandateId={mandateCode}
                currentRemark={currentRemark}
                currentStatus={currentStatus}
                vendorId={vendor?.vendorId}
                vendor={vendor}
              />
            </TabPanel>
            <TabPanel value="2">
              <PO />
            </TabPanel>
            <TabPanel value="3">
              <NDC />
            </TabPanel>
            <TabPanel value="4">
              <PenaltyCalculation />
            </TabPanel>
          </TabContext>
        </div>
      
      </div>
    </>
  );
};

export default Invoicening;
