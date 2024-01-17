import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import UploadDocuments from "../ContentSection";
import { useUrlSearchParams } from "use-url-search-params";
import { useAuthUser } from "@uikit/utility/AuthHooks";

const Tabs = () => {
    const navigate = useNavigate();
    const { user } = useAuthUser();

    const [value, setValue] = useState("5");
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    }
    const { id } = useParams();
    const [propertyDocTab, setPropertyDocTab] = useState("3");
    const handleChangePropertyDocTab = (event: React.SyntheticEvent, newValue: string) => {
        setPropertyDocTab(propertyDocTab);
    };
    const [params] = useUrlSearchParams({}, {});

    return (
        <div
            style={{
                backgroundColor: "#fff",
                padding: "0px",
                border: "1px solid #0000001f",
                borderRadius: "5px",
            }}
        >
            <TabContext value={propertyDocTab}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList onChange={handleChangePropertyDocTab} aria-label="lab API tabs example">
                        <Tab value="1" label="Mandate"
                            to={`/mandate/${id}/mandate-action?source=${params?.source}`} component={Link} />
                        <Tab value="2" to={`/mandate/${id}/final-property?source=${params?.source}`} label="Final Property" component={Link} />
                        <Tab value="3" label="Property Documents" to={`/mandate/${id}/property-documents?source=${params?.source}`}
                            component={Link} />
                    </TabList>
                </Box>
            </TabContext>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                        <Tab
                            value="1"
                            label="Generate LOA"
                            to={`/mandate/${id
                                }/generate-loa?source=list`}
                            component={Link}
                        />
                        <Tab
                            value="2"
                            label="Generate LOI"
                            to={`/mandate/${id
                                }/generate-loi?source=list`}
                            component={Link}
                        />
                        <Tab
                            value="3"
                            to={`/mandate/${id
                                }/generate-tsr?source=list`}
                            label="Generate TSR"
                            component={Link}
                        />
                        <Tab
                            value="4"
                            label="Additional Documents"
                            to={`/mandate/${id
                                }/additional-documents?source=list`}
                            component={Link}
                        />
                         <Tab
                            value="5"
                            label="RBI Intimation"
                            to={`/mandate/${id
                                }/rbi-intimation?source=list`}
                            component={Link}
                         />
                        <Tab
                            value="6"
                            label="lease deed"
                            to={`/mandate/${id}/lease-deed?source=list`}
                            component={Link}
                        />
                        <Tab
                            value="7"
                            label="lease deed sign copy"
                            to={`/mandate/${id}/lease-deed-sign-copy`}
                            component={Link}
                        />

                    </TabList>


                </Box>
                <UploadDocuments documentType={"RBI Intimation"} />

            </TabContext>
        </div>
    );
};

export default Tabs;
