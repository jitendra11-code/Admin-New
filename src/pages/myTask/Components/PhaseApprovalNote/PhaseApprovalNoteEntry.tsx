import React, { useState } from "react";

import PhaseApprovalNote from "./PhaseApprovalNote";
import { useNavigate } from "react-router-dom";
import { useUrlSearchParams } from "use-url-search-params";



const PhaseApprovalNoteEntry = () => {
    const navigate = useNavigate();
    const [value, setValue] = useState("2");
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
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
            <PhaseApprovalNote />

        </div>
    );
};

export default PhaseApprovalNoteEntry;