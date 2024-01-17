import { TextField } from "@mui/material";
import { useEffect } from "react";
import { NumericFormat } from "react-number-format"
const NumberFormatCustom = (props) => {
    const { type, name, inputValue, phaseApprovalNoteData, setPhaseApprovalNoteData, setFieldValue, onChange, ...other } = props;

    useEffect(() => {
        if (inputValue === undefined) {
            if (phaseApprovalNoteData?.id === undefined) {
                setFieldValue(name, "");
            } else {
                var _phaseApprovalNoteData = phaseApprovalNoteData
                _phaseApprovalNoteData[name] = ""
                setPhaseApprovalNoteData(_phaseApprovalNoteData)
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
                    if (phaseApprovalNoteData?.id === undefined) {
                        setFieldValue(name, formattedValue);

                    } else {
                        var _phaseApprovalNoteData = phaseApprovalNoteData
                        _phaseApprovalNoteData[name] = formattedValue
                        setPhaseApprovalNoteData(_phaseApprovalNoteData)
                    }
                }}
                thousandSeparator=","
                decimalSeparator="."
            />
        </>
    );

}

export default NumberFormatCustom