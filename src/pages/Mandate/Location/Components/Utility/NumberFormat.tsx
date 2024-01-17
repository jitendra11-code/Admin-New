import { TextField } from "@mui/material";
import { useEffect } from "react";
import {NumericFormat}  from "react-number-format"

const NumberFormatCustom = (props) => {
    const { type, name, inputValue, locationApprovalNoteData, setLocationApprovalNoteData, setFieldValue, onChange, ...other } = props;

    useEffect(() => {
        if (inputValue === undefined) {
            if (locationApprovalNoteData?.id === undefined) {
                setFieldValue(name, "");
            } else {
                var _phaseApprovalNoteData = locationApprovalNoteData
                _phaseApprovalNoteData[name] = ""
                setLocationApprovalNoteData(_phaseApprovalNoteData)
            }
        }
    }, [inputValue])

    return (
        <>
            <NumericFormat
                {...other}
                value={inputValue || ""}
                type={type}
                customInput={TextField}
                onValueChange={(values) => {
                    const { value, formattedValue } = values;
                    if (locationApprovalNoteData?.id === undefined) {
                        setFieldValue(name, formattedValue);

                    } else {
                        var _locationApprovalNoteData = locationApprovalNoteData
                        _locationApprovalNoteData[name] = formattedValue
                        setLocationApprovalNoteData(_locationApprovalNoteData)
                    }
                }}
                thousandSeparator=","
                decimalSeparator="."
            />
        </>
    );

}

export default NumberFormatCustom