import {
    Box,
    Tab,
} from "@mui/material";
import MandateInfo from "pages/common-components/MandateInformation";
import React, { useEffect } from "react";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { useParams } from "react-router-dom";
import { useUrlSearchParams } from "use-url-search-params";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { Link } from "react-router-dom";
import TabPanel from "@mui/lab/TabPanel";
import RtgsDetails from "../Components/RtgsDetails";
import UtrDetailsGrid from "./UtrDetailsGrid";

const UtrDetails = () => {
    const [mandateCode, setMandateCode] = React.useState(null);
    const [currentStatus, setCurrentStatus] = React.useState("")
    const [currentRemark, setCurrentRemark] = React.useState("");
    const [mandateInfo, setMandateData] = React.useState(null);
    const [userAction, setUserAction] = React.useState(null);
    let path = window.location.pathname?.split("/");
    let module: any = window.location.pathname?.split("/")[path.length - 1];
    const [params] = useUrlSearchParams({}, {});
    const { id } = useParams();
    const { user } = useAuthUser();
    const [value, setValue] = React.useState("2");

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    React.useEffect(() => {
        if (id !== "noid" && id) {
            setMandateCode(id);
        }
    }, []);


    useEffect(() => {
        if (id && id !== 'noid') {
            setMandateCode(id);
        }
    }, [id]);




    return (
        <div>
            <Box
                component="h2"
                className="page-title-heading my-6"
            >
                Security Deposit RTGS/Cheque Details
            </Box>
            <div
                className="card-panal inside-scroll-228"
                style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
            >
                <MandateInfo
                    mandateCode={mandateCode}
                    source=""
                    pageType=""
                    setMandateCode={setMandateCode}
                    setMandateData={setMandateData}
                    redirectSource={`${params?.source}`}
                    setpincode={() => { }}
                    setCurrentStatus={setCurrentStatus}
                    setCurrentRemark={setCurrentRemark}
                />
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <TabList
                            onChange={handleChange}
                            aria-label="lab API tabs example"
                        >
                            <Tab
                                label="Landlord RTGS/Cheque Details"
                                value="1"
                                to={`/mandate/${id}/rtgs`}
                                component={Link}
                            />
                            <Tab
                                label="Vendor UTR Details"
                                value="2"
                                to={`/mandate/${id}/utr-details`}
                                component={Link}
                            />

                        </TabList>
                    </Box>

                    <TabPanel value="1">
                        <RtgsDetails
                            mandateId={mandateCode}
                            currentRemark={currentRemark}
                            currentStatus={currentStatus}
                        />
                    </TabPanel>
                    <TabPanel value="2">
                        <UtrDetailsGrid mandateId={mandateCode}
                            currentRemark={currentRemark}
                            currentStatus={currentStatus} />
                    </TabPanel>
                </TabContext>
            </div>
        </div >
    );
}

export default UtrDetails;
