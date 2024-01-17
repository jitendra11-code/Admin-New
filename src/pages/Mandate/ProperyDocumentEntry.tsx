import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { useNavigate, useParams } from "react-router-dom";
import PropertyDocument from "./PropertyDocument";
import { Link } from 'react-router-dom';



const PropertyDocumentEntry = () => {
    const navigate = useNavigate();
    const [value, setValue] = useState("4");
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    const { id } = useParams();
    return (
        <div
            style={{
                backgroundColor: "#fff",
                padding: "0px",
                border: "1px solid #0000001f",
                borderRadius: "5px",
            }}
        >
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                        <Tab value="1" label="Mandate"
                            to={`/mandate/${id}/mandate-action`} component={Link} />
                        <Tab value="2" label="Phase Approval Note"
                            to={`/mandate/${id}/phase-approval-note`}
                            component={Link} />
                        <Tab value="3" to={`/mandate/${id}/final-property`} label="Final Property" component={Link} />
                        <Tab value="4" label="Property Documents" to={`/mandate/${id}/property-documents`}
                            component={Link} />
                    </TabList>
                </Box>
                <PropertyDocument />
              
            </TabContext>
        </div>
    );
};

export default PropertyDocumentEntry;