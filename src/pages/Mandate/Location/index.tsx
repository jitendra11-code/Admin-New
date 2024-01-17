import {
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useParams } from "react-router-dom";
import MandateInfo from "pages/common-components/MandateInformation";
import { useUrlSearchParams } from "use-url-search-params";
import LocationMainInfo from "./Components/LocationMainInfo";
import LocationFurnishing from "./Components/LocationFurnishing";
import LocationAnnexure from "./Components/LocationAnnexure";
import LocationTermsCondition from "./Components/LocationTermsCondition";
import LocationScopeOfWork from "./Components/LocationScopeOfWork";
import axios from "axios";

interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

const TabPanel: (props: TabPanelProps) => any = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >

      {children}

    </div>
  );
};



const LocationApprovalNote = () => {
  const [actionName, setActionName] = React.useState("");
  const navigate = useNavigate();
  const [mandateId, setMandateId] = React.useState<any>(null);
  const [mandateInfo, setMandateData] = React.useState(null);
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [locationApprovalNoteId, setLocationApprovalNoteId] = React.useState(null);
  const [locationApprovalNoteScopeData, setLocationApprovalNoteScopeData] = React.useState([])
  const [value1, setValue1] = React.useState("0");
  const [locationData, setLocationData] = React.useState([]);

  let { id } = useParams();
  const [params] = useUrlSearchParams({}, {});
  const location = useLocation();
  let path = window.location.pathname?.split("/");


  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateId(id);
    }
  }, []);

  React.useEffect(()=> {
    if (mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid") {
      axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/GetMandateWiseApprovalNoteBudget?mandateid=${mandateId?.id}&notetype=location`
      )
      .then((response) => {
        if (!response?.data) return;
        if (response?.data && response?.data?.length) {
          setLocationData(response?.data);
        }
      });
    }
  },[mandateId]);
  const handleTab = (event: React.SyntheticEvent, newValue: string) => {
    setValue1(newValue);
  };
const [flag,setFlag]= React.useState(false);
const chargable_Area =() => {
  for (var i = 0; i < locationData.length; i++){
    if (locationData[i].Chargeable_Area > locationData[i].Carpet_Area){
      setFlag(true);
      return;
    }
  }
}

React.useEffect(() => {
 chargable_Area(); 
}, [])


  return (
    <>
      <div className="locationapprovalnote">
        <Box
          component="h2"
          className="page-title-heading my-6"
        >
          Location Approval Note
        </Box>
        <div
          style={{ padding: "10px !important", border: "1px solid rgba(0, 0, 0, 0.12)" }}
          className="card-panal"
        >
          <MandateInfo
            mandateCode={mandateId}
            pageType=""
            source="location-note"
            redirectSource={`${params?.source}`}
            setMandateCode={setMandateId}
            setMandateData={setMandateData}
            setpincode={() => { }}
            setCurrentStatus={setCurrentStatus}
            setCurrentRemark={setCurrentRemark}
          />

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value1}
              onChange={handleTab}
              aria-label="lab API tabs example">
              <Tab label="Main Info" value="0" />
              { flag === true ? 
                           <Tab value="1" label={<span style={{color:'red'}}>Furnishing, Interior & Basic Infra</span> }/> 
                           : <Tab value="1" label="Furnishing, Interior & Basic Infra"/>}
              <Tab label="Scope of Work" value="2" />
              <Tab label="Annexure/Attachments" value="3" />
              <Tab label="Terms & Condition" value="4" />
            </Tabs>
          </Box>
          <TabPanel value={value1} index={"0"} key="0">
            <LocationMainInfo
              setActionName={setActionName}
              mandateId={mandateId}
              setMandateId={setMandateId}
              mandateInfo={mandateInfo}
              currentRemark={currentRemark}
              currentStatus={currentStatus}
              locationApprovalNoteScopeData={locationApprovalNoteScopeData}
              locationApprovalNoteId={locationApprovalNoteId}
              setLocationApprovalNoteId={setLocationApprovalNoteId}
              locationData = {locationData}
            />
          </TabPanel>
          <TabPanel value={value1} index={"1"} key="1" >
            <LocationFurnishing mandateId={mandateId} />
          </TabPanel>
          <TabPanel value={value1} index={"2"} key="2" >
            <LocationScopeOfWork
              actionName={actionName}
              locationApprovalNoteScopeData={locationApprovalNoteScopeData}
              setLocationApprovalNoteScopeData={setLocationApprovalNoteScopeData}
              setLocationApprovalNoteId={setLocationApprovalNoteId}
              locationApprovalNoteId={locationApprovalNoteId}
              mandateId={mandateId} />
          </TabPanel>
          <TabPanel value={value1} index={"3"} key="3" >
            <LocationAnnexure />
          </TabPanel>
          <TabPanel value={value1} index={"4"} key="4" >
            <LocationTermsCondition />
          </TabPanel>
        </div>
      </div>
    </>
  );
};
export default LocationApprovalNote;
