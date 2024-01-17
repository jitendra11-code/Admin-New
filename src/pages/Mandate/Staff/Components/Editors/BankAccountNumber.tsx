import { TextField } from "@mui/material";
import regExpressionTextField, { regExpressionRemark, textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";
import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchError } from "redux/actions";

export default forwardRef((props: any, ref) => {
    const inputRef = useRef(null);
    const [value, setValue] = useState('');
    const dispatch = useDispatch();

    useImperativeHandle(ref, () => {
        return {
            getValue: () => {
                return value;
            },
            afterGuiAttached: () => {
                setValue(props.value);
                inputRef.current.focus();
                inputRef.current.select();
            }
        };
    });
    const eventHandler = useCallback((e) => {
        let value = e?.target?.value;

        setValue(e?.target?.value)
        var currentIndex = props?.rowIndex
        var data = [...props?.staffInformation];
        data[currentIndex].accountNumber = e?.target?.value ? e?.target?.value : "";
        props?.setStaffInformation(data)
    }, [])


    return (
        <div style={{ marginTop: 5, marginBottom: 5 }}>
            <TextField
                ref={inputRef}
                sx={{
                    '.MuiInputBase-input': { height: '0px !important' },
                }}
                id="outlined-basic"
                label=""
                onKeyDown={(e: any) => {
                    regExpressionTextField(e);
                    if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                    }
                }}
                onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                    }
                }}
                type="text"
                InputProps={{ inputProps: { maxLength: 18 } }}
                onChange={eventHandler}
                value={value}
                variant="outlined" />
        </div>
    )
})
