import { TextField } from "@mui/material";
import regExpressionTextField, {regExpressionRemark, textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";
import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchError } from "redux/actions";

export default forwardRef((props: any, ref) => {
    const inputRef = useRef(null);
    const [value, setValue] = useState('');


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
    const eventHandler = (e) => {

        setValue(e?.target?.value)
        var currentIndex = props?.rowIndex
    }
    const dispatch = useDispatch();


    return (
        <div style={{ marginTop: 5, marginBottom: 5 }}>
            <TextField
                ref={inputRef}
                sx={{
                    '.MuiInputBase-input': { height: '0px !important' },
                }}
                id="outlined-basic"
                label=""
                onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                    }
                }}
                onChange={eventHandler}
                value={value}
                variant="outlined"
                onKeyDown={(e: any) => {
                    if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                    }
                    regExpressionTextField(e)
                }} />
        </div>
    )
})
