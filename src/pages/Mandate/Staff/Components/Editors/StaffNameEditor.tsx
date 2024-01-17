import { TextField } from "@mui/material";
import regExpressionTextField, { textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";
import { useState, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchError} from "redux/actions";

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
        data[currentIndex].staff_Name = e?.target?.value ? e?.target?.value : "";
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
                    regExpressionTextField(e)
                }}
                onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                    }
                }}
                InputProps={{ inputProps: { maxLength: 50 } }}
                onChange={eventHandler}
                value={value}
                variant="outlined" />
        </div>
    )
})
