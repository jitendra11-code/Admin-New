import {
    Box,
    Tabs,
    Tab,
} from "@mui/material";

import "../style.css";
import { useLocation, useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import MandateInfo from "pages/common-components/MandateInformation";
import { useUrlSearchParams } from "use-url-search-params";
import React, { memo, useEffect } from "react";
import MainInfo from "./MainInfo";
import Furnishing from "./Furnishing";
import ScopeOfWork from "./ScopeOfWork";
import Annexure from "./Annexure";
import TermsCondition from "./TermsCondition";
import axios from "axios";
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
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


const PhaseApprovalNote = () => {
    const [actionName, setActionName] = React.useState("");
    const navigate = useNavigate();
    const [mandateId, setMandateId] = React.useState<any>(null);
    const [mandateInfo, setMandateData] = React.useState(null);
    const [currentStatus, setCurrentStatus] = React.useState("");
    const [currentRemark, setCurrentRemark] = React.useState("");
    const [phaseApprovalNoteId, setPhaseApprovalNoteId] = React.useState(null)
    const [phaseApprovalNoteScopeData, setPhaseApprovalNoteScopeData] = React.useState([]);
    const [value, setValue] = React.useState<number>(0);
    const [phaseData, setPhaseData] = React.useState([]);

    let { id } = useParams();
    const [params] = useUrlSearchParams({}, {});
    const location = useLocation();
    const dispatch = useDispatch();

    let path = window.location.pathname?.split("/").at(-1);

    React.useEffect(() => {
        if (id !== "noid" && id) {
            setMandateId(id);
        }
    }, []);


    const handleTab = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    useEffect(() => {
        if (mandateId !== null && mandateId?.id !== undefined) {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/LocationApprovalNote/GetMandateWiseApprovalNoteBudget?mandateid=${mandateId?.id}&notetype=Phase`
      )
      .then((response) => {
        if (!response?.data) return;
        if (response?.data && response?.data?.length) {
          setPhaseData(response?.data);
        }
      });
          }
      
    }, [mandateId])
    
    return (
        <>
            <div className="phaseapprovalnote">
                <Box
                    component="h2"
                    className="page-title-heading my-6"
                >
                    Phase Approval Note
                </Box>
                <div
                    style={{ padding: "10px !important" }}
                    className="card-panal"
                >
                    <MandateInfo
                        mandateCode={mandateId}
                        pageType="phase"
                        source="phase-approval-note"
                        redirectSource={`${params?.source}`}
                        setMandateCode={setMandateId}
                        setMandateData={setMandateData}
                        setpincode={() => { }}
                        setCurrentStatus={setCurrentStatus}
                        setCurrentRemark={setCurrentRemark}
                    />

                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value}
                            onChange={handleTab}
                            aria-label="lab API tabs example">
                            <Tab value={0} label="Main Info" />
                           {(phaseData[0]?.Chargeable_Area > phaseData[0]?.Carpet_Area) === true ? 
                           <Tab value={1} label={<span style={{color:'red'}}>Furnishing, Interior & Basic Infra</span> }/> 
                           : <Tab value={1} label="Furnishing, Interior & Basic Infra"/>}
                            <Tab value={2} label="Scope of Work" />
                            <Tab value={3} label="Annexure/Attachments" />
                            <Tab value={4} label="Terms & Condition" />
                        </Tabs>
                    </Box>
                    <TabPanel value={value} index={0} key="0">
                        <MainInfo mandateId={mandateId}
                        pathName={path}
                            mandateInfo={mandateInfo}
                            setActionName={setActionName}
                            currentRemark={currentRemark}
                            currentStatus={currentStatus}
                            phaseApprovalNoteId={phaseApprovalNoteId}
                            setPhaseApprovalNoteId={setPhaseApprovalNoteId}
                            phaseApprovalNoteScopeData={phaseApprovalNoteScopeData}
                            phaseData={phaseData}
                            
                        />
                    </TabPanel>
                    <TabPanel value={value} index={1} key="1" >
                        <Furnishing mandateId={mandateId}/>
                    </TabPanel>
                    <TabPanel value={value} index={2} key="2" >
                        <ScopeOfWork
                        pathName={path}
                            actionName={actionName}
                            phaseApprovalNoteId={phaseApprovalNoteId}
                            mandateId={mandateId}
                            phaseApprovalNoteScopeData={phaseApprovalNoteScopeData}
                            setPhaseApprovalNoteScopeData={setPhaseApprovalNoteScopeData}
                        />
                    </TabPanel>
                    <TabPanel value={value} index={3} key="3" >
                        <Annexure />
                    </TabPanel>
                    <TabPanel value={value} index={4} key="4">
                        <TermsCondition />
                    </TabPanel>

                </div>
            </div>
        </>
    );
};
export default memo(PhaseApprovalNote);
