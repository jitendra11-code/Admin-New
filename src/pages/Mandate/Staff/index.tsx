import {
    Box,
    Tabs,
    Tab,
} from "@mui/material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppState } from "redux/store";
import { useParams } from "react-router-dom";
import MandateInfo from "pages/common-components/MandateInformation";
import { useUrlSearchParams } from "use-url-search-params";
import React, { memo } from "react";
import StaffDocUpload from "./Components/StaffDocUploadSection";
import StaffInformation from "./Components/StaffInformation";
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


const Staff = () => {
    const navigate = useNavigate();
    const [mandateId, setMandateId] = React.useState<any>(null);
    const [mandateInfo, setMandateData] = React.useState(null);
    const [currentStatus, setCurrentStatus] = React.useState("");
    const [currentRemark, setCurrentRemark] = React.useState("");
    const [value, setValue] = React.useState<number>(0);
    let { id } = useParams();
    const [params] = useUrlSearchParams({}, {});
    const location = useLocation();
    const apiType = location?.state?.apiType || "";
    const [userAction, setUserAction] = React.useState(null);
    const { userActionList } = useSelector<AppState, AppState["userAction"]>(
        ({ userAction }) => userAction
    );
    let path = window.location.pathname?.split("/");
    let module: any = window.location.pathname?.split("/")[path.length - 1];
    const [staffInformation, setStaffInformation] = React.useState([])

    const getStaffDetails = () => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/StaffDetails/StaffDetailsByMandateId?mandateId=${mandateId?.id || 0}`).
            then(res => {
                if (!res) return
                if (res && res?.data && res?.data?.length > 0) {
                    var _arr = res && res?.data && res?.data?.map((item, key) => {
                        return {
                            ...item,
                            custom_id: (key + 1),
                            'staff_cat_value': item?.staff_Category || "0",
                            'staff_status_value': item?.staff_Status || "0",
                            'mandateId': mandateId?.id || 0
                        }
                    })
                    setStaffInformation(_arr || [])
                } else {
                    setStaffInformation([])
                }
            }).catch(err => {
            })
    }

    React.useEffect(() => {
        if (id !== "noid" && id) {
            setMandateId(id);
        }
    }, []);
    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid") {
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
                navigate(`/mandate/${mandateId?.id}/${module}?source=list`, {
                    state: { apiType: apiType },
                });
            } else {
                navigate(`/mandate/${mandateId?.id}/${module}`, {
                    state: { apiType: apiType },
                });
            }
        }
    }, [mandateId]);


    const handleTab = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };


    return (
        <>
            <div className="staff">
                <Box
                    component="h2" className="page-title-heading my-6"
                >Staff
                </Box>
                <div
                    style={{ padding: "10px !important" }}
                    className="card-panal"
                >
                    <MandateInfo
                        mandateCode={mandateId}
                        pageType=""
                        source=""
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
                            <Tab value={0} label="Staff Document Upload" />
                            <Tab value={1} label="Staff Information" />
                        </Tabs>
                    </Box>
                    <TabPanel value={value} index={0} key="0">
                        <StaffDocUpload mandateId={mandateId}
                            getStaffDetails={() => { getStaffDetails() }}
                            currentRemark={currentRemark}
                            currentStatus={currentStatus}
                        />
                    </TabPanel>
                    <TabPanel value={value} index={1} key="1" >
                        <StaffInformation
                            staffInformation={staffInformation}
                            setStaffInformation={setStaffInformation}
                            mandate={mandateId}
                            currentRemark={currentRemark}
                            currentStatus={currentStatus}
                            getStaffDetails={() => { getStaffDetails() }}
                        />
                    </TabPanel>

                </div>
            </div>
        </>
    );
};
export default memo(Staff);
